import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Flag, X, Clock, Send } from 'lucide-react';
import { getCurrentUser, getExams, saveSubmission } from '../../services/storage';
import { Question, AnswerRecord } from '../../types';
import { isEquivalentAnswer } from '../../data/seedQuestions';
import { MathRenderer, MathText } from '../common/MathRenderer';
import { cloudRequest, getCloudSnapshot } from '../../services/cloudStore';

type Draft = { startedAt: number; endsAt: number; questions: Question[]; answers: Record<string, string>; index: number; bookmarks: string[] };
const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
};
export const ExamTaking: React.FC<{ examId?: string; onFinishExam: (id: string) => void; onExit: () => void }> = ({ examId, onFinishExam, onExit }) => {
  const exam = getExams().find(e => e.id === examId);
  if (!exam?.questions.length) return <section><h1>Không tìm thấy đề bài</h1><button onClick={onExit}>Quay lại</button></section>;
  if (getCloudSnapshot() && !getCloudSnapshot()!.attempts.some(a => a.exam_id === exam.id)) return <section><h1>Lượt làm đã kết thúc</h1><button onClick={onExit}>Về bài tập</button></section>;
  return <Attempt key={exam.id} examId={exam.id} onFinishExam={onFinishExam} onExit={onExit} />;
};
const Attempt: React.FC<{ examId: string; onFinishExam: (id: string) => void; onExit: () => void }> = ({ examId, onFinishExam, onExit }) => {
  const exam = getExams().find(e => e.id === examId)!;
  const student = getCurrentUser();
  const draftKey = `draft_exam_${student.id}_${examId}`;
  const attempt = getCloudSnapshot()?.attempts.find(a => a.exam_id === examId);
  const attemptId = useRef(attempt?.id);
  const [draft, setDraft] = useState<Draft>(() => {
    if (getCloudSnapshot()) {
      const saved = getCloudSnapshot()!.drafts[student.id + ':' + draftKey] as Draft | undefined;
      const validSaved = saved && attempt && saved.startedAt === Date.parse(attempt.started_at);
      return { startedAt: Date.parse(attempt!.started_at), endsAt: Date.parse(attempt!.ends_at), questions: exam.questions,
        answers: validSaved ? saved.answers : {}, index: validSaved ? Math.max(0, Math.min(exam.questions.length - 1, saved.index || 0)) : 0,
        bookmarks: validSaved && Array.isArray(saved.bookmarks) ? saved.bookmarks : [] };
    }
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (saved && Number.isFinite(saved.startedAt) && Number.isFinite(saved.endsAt) && saved.questions?.length && saved.answers && Array.isArray(saved.bookmarks)) return saved;
    } catch { /* An invalid draft must not prevent opening the exam. */ }
    return { startedAt: Date.now(), endsAt: Date.now() + exam.timeLimitMinutes * 60000, questions: (exam.shuffleQuestions ? shuffle(exam.questions) : exam.questions).map(q => ({ ...q, options: q.options && exam.shuffleOptions ? shuffle(q.options) : q.options })), answers: {}, index: 0, bookmarks: [] };
  });
  const [remaining, setRemaining] = useState(Math.max(0, Math.ceil((draft.endsAt - Date.now()) / 1000)));
  const [confirm, setConfirm] = useState<'exit' | 'submit' | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const sending = useRef(false), lastAutoSubmit = useRef(0);
  const submitted = useRef(false);
  const submitRef = useRef<() => void>(() => {});
  const current = draft.questions[draft.index] || draft.questions[0];
  const answer = draft.answers[current.id] || '';
  const answered = draft.questions.filter(q => draft.answers[q.id]?.trim()).length;
  const setAnswer = (value: string) => setDraft(prev => ({ ...prev, answers: { ...prev.answers, [current.id]: value } }));
  useEffect(() => {
    if (getCloudSnapshot()) {
      const timer = setTimeout(() => {
        if (!submitted.current && !sending.current) void cloudRequest('saveDraft', { id: draftKey, payload: { ...draft, questions: undefined } }).catch(() => setError('Chưa đồng bộ bản nháp. Giữ trang này mở và kiểm tra kết nối.'));
      }, 1000);
      return () => clearTimeout(timer);
    }
    try { if (!submitted.current) localStorage.setItem(draftKey, JSON.stringify(draft)); }
    catch { setError('Không thể lưu bản nháp. Hãy kiểm tra dung lượng trình duyệt.'); }
  }, [draft, draftKey]);
  const submit = async () => {
    if (submitted.current || sending.current) return;
    sending.current = true; setBusy(true);
    const records: AnswerRecord[] = draft.questions.map(q => {
      const value = draft.answers[q.id]?.trim() || '';
      const correct = q.type === 'multiple_choice' ? !!q.options?.some(o => o.isCorrect && (o.id === value || o.label === value)) : q.type === 'true_false' ? !!q.statements?.length && q.statements.every(s => { try { return JSON.parse(value)[s.id] === s.isCorrect; } catch { return false; } }) : !!q.correctAnswers && isEquivalentAnswer(value, q.correctAnswers);
      return { questionId: q.id, selectedAnswerText: value, selectedOptionId: q.type === 'multiple_choice' ? value : undefined, isCorrect: correct, score: correct ? 10 / draft.questions.length : 0, timeSpentSeconds: 0 };
    });
    const correctCount = records.filter(a => a.isCorrect).length;
    const id = `sub-${crypto.randomUUID()}`;
    try {
      const saved = getCloudSnapshot() ? await cloudRequest('submit', { attemptId: attemptId.current, answers: draft.answers }) : await saveSubmission({ id, examId, examTitle: exam.title, studentId: student.id, studentName: student.fullName, startedAt: new Date(draft.startedAt).toISOString(), submittedAt: new Date().toISOString(), durationSeconds: Math.min(exam.timeLimitMinutes * 60, Math.max(0, Math.floor((Date.now() - draft.startedAt) / 1000))), score: Number((correctCount * 10 / draft.questions.length).toFixed(1)), totalQuestions: draft.questions.length, correctCount, wrongCount: draft.questions.length - correctCount, answers: records, speedRating: 'normal', isLate: Date.now() > Date.parse(exam.deadline) });
      submitted.current = true; if (!getCloudSnapshot()) localStorage.removeItem(draftKey); onFinishExam(saved.id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Chưa lưu được bài làm. Hãy thử nộp lại.'); }
    finally { sending.current = false; setBusy(false); }
  };
  submitRef.current = submit;
  useEffect(() => {
    const tick = () => { const seconds = Math.max(0, Math.ceil((draft.endsAt - Date.now()) / 1000)); setRemaining(seconds); if (!seconds && Date.now() - lastAutoSubmit.current > 15000) { lastAutoSubmit.current = Date.now(); submitRef.current(); } };
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [draft.endsAt]);
  const leave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (getCloudSnapshot()) await cloudRequest('saveDraft', { id: draftKey, payload: { ...draft, questions: undefined } });
      onExit();
    } catch (e) { setError(e instanceof Error ? e.message : 'Chưa lưu được bản nháp, hãy thử lại.'); }
    finally { setBusy(false); }
  };
  return <div className="attempt-view">
    <header className="attempt-header"><button className="icon-button" title="Rời bài làm" onClick={() => setConfirm('exit')}><X size={22} /></button><h1>{exam.title}</h1><span className={`exam-timer ${remaining < 60 ? 'incorrect' : ''}`} role="timer"><Clock size={18} />{Math.floor(remaining / 60).toString().padStart(2, '0')}:{(remaining % 60).toString().padStart(2, '0')}</span></header>
    {error && <p role="alert" className="incorrect">{error}</p>}{busy && <p role="status">Đang nộp bài...</p>}
    <div className="attempt-layout"><section className="question-panel"><div className="solution-heading"><strong>Câu {draft.index + 1} / {draft.questions.length}</strong><button className="icon-button" title="Đánh dấu xem lại" aria-pressed={draft.bookmarks.includes(current.id)} onClick={() => setDraft(prev => ({ ...prev, bookmarks: prev.bookmarks.includes(current.id) ? prev.bookmarks.filter(id => id !== current.id) : [...prev.bookmarks, current.id] }))}><Flag size={20} fill={draft.bookmarks.includes(current.id) ? '#fbbf24' : 'none'} /></button></div>
      <h2>{<MathText text={current.content} />}</h2>{current.mathFormula && <div className="question-formula"><MathRenderer formula={current.mathFormula} /></div>}
      {current.svgIllustration && <img className="question-illustration" alt="Hình minh họa câu hỏi" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(current.svgIllustration)}`} />}
      {current.type === 'multiple_choice' && <div className="answer-options">{current.options?.map(option => <button key={option.id} aria-pressed={answer === option.id} className={answer === option.id ? 'selected' : ''} onClick={() => setAnswer(option.id)}><strong>{option.label}</strong><span>{<MathText text={option.text} />}</span></button>)}</div>}
      {current.type === 'fill_in_the_blank' && <label className="answer-input">Đáp án<input aria-label="Đáp án" autoComplete="off" value={answer} maxLength={100} onChange={e => setAnswer(e.target.value)} placeholder="Nhập số hoặc phân số" /><div className="math-input-tools">{['-', '/', ','].map(symbol => <button key={symbol} className="secondary-button" onClick={() => setAnswer(answer + symbol)}>{symbol}</button>)}</div></label>}
      {current.type === 'true_false' && current.statements?.map(statement => { let selected: Record<string, boolean> = {}; try { selected = JSON.parse(answer || '{}'); } catch {} return <div className="statement" key={statement.id}><p>{<MathText text={statement.text} />}</p><div className="filter-tabs">{[true, false].map(value => <button key={String(value)} aria-pressed={selected[statement.id] === value} onClick={() => setAnswer(JSON.stringify({ ...selected, [statement.id]: value }))}>{value ? 'Đúng' : 'Sai'}</button>)}</div></div>; })}
      <div className="question-controls"><button className="secondary-button" disabled={draft.index === 0} onClick={() => setDraft(prev => ({ ...prev, index: prev.index - 1 }))}><ArrowLeft size={18} />Trước</button><button className="primary-button" onClick={() => draft.index < draft.questions.length - 1 ? setDraft(prev => ({ ...prev, index: prev.index + 1 })) : setConfirm('submit')}>{draft.index < draft.questions.length - 1 ? <>Tiếp<ArrowRight size={18} /></> : 'Nộp bài'}</button></div>
    </section><aside className="question-navigator"><h2>Tiến độ bài làm</h2><p>{answered}/{draft.questions.length} câu đã trả lời</p><div className="question-grid">{draft.questions.map((q, index) => <button key={q.id} aria-current={index === draft.index ? 'step' : undefined} title={`Câu ${index + 1}${draft.bookmarks.includes(q.id) ? ' - đã đánh dấu' : ''}`} className={`${draft.answers[q.id] ? 'answered' : ''} ${index === draft.index ? 'current' : ''}`} onClick={() => setDraft(prev => ({ ...prev, index }))}>{index + 1}{draft.bookmarks.includes(q.id) && <Flag size={10} />}</button>)}</div><button className="primary-button" onClick={() => setConfirm('submit')}><Send size={16} />Nộp bài</button></aside></div>
    {confirm && <div className="app-modal"><div className="confirm-content" role="dialog" aria-modal="true" aria-label={confirm === 'exit' ? 'Rời bài làm' : 'Nộp bài'}><h2>{confirm === 'exit' ? 'Rời bài làm?' : 'Nộp bài?'}</h2><p>{confirm === 'exit' ? 'Bản nháp được giữ. Thời gian làm bài vẫn tiếp tục chạy.' : `Đã trả lời ${answered}/${draft.questions.length} câu. Sau khi nộp không thể sửa đáp án của lượt này.`}</p><div className="result-actions"><button className="secondary-button" disabled={busy} onClick={() => setConfirm(null)}>Tiếp tục làm</button><button className="primary-button" disabled={busy} onClick={confirm === 'exit' ? leave : submit}>{busy ? 'Đang lưu...' : confirm === 'exit' ? 'Rời bài' : 'Xác nhận nộp'}</button></div></div></div>}
  </div>;
};
