import React, { useState } from 'react';
import { RefreshCw, Save, Send } from 'lucide-react';
import { createExam, generateExamQuestions, getCurrentUser, getQuestionBank } from '../../services/storage';
import { CHAPTERS_DATA } from '../../data/seedQuestions';
import { ExamMatrix, Question } from '../../types';
import { MathRenderer, MathText } from '../common/MathRenderer';
import { MATRIX_LEVELS, matrixCounts, suggestMatrix } from '../../services/examMatrix';
import { readDraft, saveDraft, removeDraft } from '../../services/drafts';

const defaultConfig = () => ({ title: '', chapter: 0, lessons: [] as number[], count: 4, time: 20, retries: 1, deadline: new Date(Date.now() + 7 * 86400000 + 7 * 3600000).toISOString().slice(0, 16), shuffleQuestions: true, shuffleOptions: true, solution: 'submit' as 'submit' | 'deadline', matrix: { nhanBietPercent: 25, thongHieuPercent: 25, vanDungPercent: 25, vanDungCaoPercent: 25 } });
const levels: [keyof ExamMatrix, string][] = [['nhanBietPercent', 'Nhận biết'], ['thongHieuPercent', 'Thông hiểu'], ['vanDungPercent', 'Vận dụng'], ['vanDungCaoPercent', 'Vận dụng cao']];
const generationKey = (config: ReturnType<typeof defaultConfig>) => JSON.stringify({ chapter: config.chapter, lessons: config.lessons, count: config.count, matrix: config.matrix });
export const CreateExam: React.FC<{ onSuccess: (id: string) => void }> = ({ onSuccess }) => {
  const [config, setConfig] = useState(() => {
    try { const saved = readDraft('teacher_exam_draft_v2'); if (saved?.config && typeof saved.config.title === 'string' && saved.config.matrix && (saved.config.chapter === 0 || CHAPTERS_DATA.some(c => c.id === saved.config.chapter))) return saved.config as ReturnType<typeof defaultConfig>; } catch {}
    return defaultConfig();
  });
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = readDraft('teacher_exam_draft_v2');
      if (saved?.generatedKey !== generationKey(config) || !Array.isArray(saved.questionIds) || saved.questionIds.length !== config.count) return [];
      const bank = getQuestionBank(); const items = saved.questionIds.map((id: string) => bank.find(q => q.id === id));
      const counts = matrixCounts(config.matrix, config.count);
      return items.every((q: Question | undefined) => q && q.chapterId === config.chapter && (!config.lessons.length || config.lessons.includes(q.lessonId))) && new Set(saved.questionIds).size === items.length && MATRIX_LEVELS.every((level, i) => items.filter((q: Question | undefined) => q?.level === level).length === counts[i]) ? items : [];
    } catch { return []; }
  });
  const [generatedKey, setGeneratedKey] = useState(() => questions.length ? generationKey(config) : '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const bank = getQuestionBank();
  const chapter = CHAPTERS_DATA.find(c => c.id === config.chapter);
  const pool = bank.filter(q => q.chapterId === config.chapter && (!config.lessons.length || config.lessons.includes(q.lessonId)));
  const key = generationKey(config);
  const total = Object.values(config.matrix).reduce((a, b) => a + b, 0);
  const available = MATRIX_LEVELS.map(level => pool.filter(q => q.level === level).length);
  let required: number[] = [];
  let generationError = '';
  try {
    if (!chapter) throw new Error('Chọn chương trước khi sinh đề.');
    required = matrixCounts(config.matrix, config.count);
    if (config.count > pool.length) generationError = `Phạm vi đã chọn chỉ có ${pool.length} câu, chưa đủ ${config.count} câu.`;
    else generationError = required.map((count, i) => count > available[i] ? `${levels[i][1]}: cần ${count} câu, hiện có ${available[i]}` : '').filter(Boolean).join(' · ');
  } catch (e) { generationError = (e as Error).message; }
  const readyToAssign = questions.length === config.count && key === generatedKey && !generationError;
  const update = <K extends keyof typeof config>(field: K, value: typeof config[K]) => { setConfig(prev => ({ ...prev, [field]: value })); setMessage(''); setError(''); };
  const generate = () => {
    if (generationError) return setError(generationError);
    try { setQuestions(generateExamQuestions(config.chapter, config.lessons, config.count, config.matrix)); setGeneratedKey(key); setError(''); }
    catch (cause) { setError((cause as Error).message); }
  };
  const assign = async () => {
    if (busy) return;
    if (!chapter) return setError('Chọn chương trước khi giao bài.');
    const deadline = new Date(`${config.deadline}:00+07:00`);
    if (!config.title.trim() || !Number.isFinite(deadline.getTime()) || deadline.getTime() <= Date.now()) return setError('Nhập tên đề và hạn nộp trong tương lai.');
    if (config.time < 1 || config.retries < 1 || !Number.isInteger(config.time) || !Number.isInteger(config.retries)) return setError('Thời gian và số lượt làm phải là số nguyên dương.');
    if (!readyToAssign) return setError(!questions.length ? 'Chưa có đề. Hãy sinh đề trước khi giao bài.' : 'Cấu hình đã thay đổi. Hãy sinh lại đề trước khi giao bài.');
    setBusy(true);
    try {
      const id = `exam-${crypto.randomUUID()}`;
      await createExam({ id, title: config.title.trim(), type: 'test', chapterId: config.chapter, chapterTitle: chapter.title, lessonIds: config.lessons, questionCount: questions.length, matrix: config.matrix, timeLimitMinutes: config.time, deadline: deadline.toISOString(), maxRetries: config.retries, shuffleQuestions: config.shuffleQuestions, shuffleOptions: config.shuffleOptions, showSolutionAfter: config.solution, assignedTo: 'all', createdBy: getCurrentUser().id, createdAt: new Date().toISOString(), questions, status: 'active' });
      void removeDraft('teacher_exam_draft_v2').catch(() => {}); onSuccess(id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Chưa lưu được đề.'); } finally { setBusy(false); }
  };
  return <section><div className="page-heading"><h1>Tạo đề & giao bài</h1><p>Lớp 6D</p></div><div className="result-actions"><button className="secondary-button" disabled={busy} onClick={async () => { setBusy(true); try { await saveDraft('teacher_exam_draft_v2', { config, questionIds: readyToAssign ? questions.map(q => q.id) : [], generatedKey: readyToAssign ? generatedKey : '' }); setMessage('Đã lưu bản nháp.'); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể lưu bản nháp.'); } finally { setBusy(false); } }}><Save size={17} />Lưu bản nháp</button><button className="secondary-button" onClick={generate} disabled={busy || !!generationError}><RefreshCw size={17} />{questions.length ? 'Sinh lại đề' : 'Sinh đề'}</button><button className="primary-button" onClick={assign} disabled={busy || !readyToAssign}><Send size={17} />{busy ? 'Đang lưu...' : 'Giao bài'}</button></div>{error && <p className="form-error" role="alert">{error}</p>}{message && <p role="status" className="correct">{message}</p>}
    {chapter && generationError && <p className="form-error" role="status">{generationError}</p>}<div className="create-exam-layout"><div className="exam-config">
      <label>Tên đề<input placeholder="Nhập tên đề" value={config.title} onChange={e => update('title', e.target.value)} /></label>
      <label>Chương<select value={config.chapter} onChange={e => { setConfig(prev => ({ ...prev, chapter: Number(e.target.value), lessons: [] })); setQuestions([]); setGeneratedKey(''); setError(''); setMessage(''); }}><option value={0}>Chọn chương</option>{CHAPTERS_DATA.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
      {chapter && <fieldset><legend>Bài học</legend>{chapter.lessons.map(lesson => <label className="checkbox-row" key={lesson.id}><input type="checkbox" checked={config.lessons.includes(lesson.id)} onChange={e => update('lessons', e.target.checked ? [...config.lessons, lesson.id] : config.lessons.filter(id => id !== lesson.id))} /><span>{lesson.title} <small>({bank.filter(q => q.lessonId === lesson.id && q.chapterId === chapter.id).length} câu)</small></span></label>)}</fieldset>}
      {chapter && <p className="muted">Có {pool.length} câu trong phạm vi đã chọn.</p>}
      <div className="form-grid"><label>Số câu<input type="number" min={1} max={100} value={config.count} onChange={e => update('count', Number(e.target.value))} /></label><label>Thời gian (phút)<input type="number" min={1} max={180} value={config.time} onChange={e => update('time', Number(e.target.value))} /></label><label>Lượt làm tối đa<input type="number" min={1} max={999} value={config.retries} onChange={e => update('retries', Number(e.target.value))} /></label><label>Hạn nộp (giờ Việt Nam)<input type="datetime-local" value={config.deadline} onChange={e => update('deadline', e.target.value)} /></label></div>
      <fieldset><legend>Ma trận · Tổng {total}%</legend><button className="secondary-button" disabled={!chapter} onClick={() => { try { update('matrix', suggestMatrix(pool, config.count)); } catch (e) { setError((e as Error).message); } }}>Gợi ý ma trận theo ngân hàng</button><div className="form-grid">{levels.map(([field, label]) => <label key={field}>{label} (%)<small>Hiện có {available[levels.findIndex(([key]) => key === field)]} câu</small><input type="number" min={0} max={100} value={config.matrix[field]} onChange={e => update('matrix', { ...config.matrix, [field]: Number(e.target.value) })} /></label>)}</div></fieldset>
      <label className="checkbox-row"><input type="checkbox" checked={config.shuffleQuestions} onChange={e => update('shuffleQuestions', e.target.checked)} />Đảo câu hỏi</label><label className="checkbox-row"><input type="checkbox" checked={config.shuffleOptions} onChange={e => update('shuffleOptions', e.target.checked)} />Đảo thứ tự đáp án</label>
      <label>Mở lời giải<select value={config.solution} onChange={e => update('solution', e.target.value as 'submit' | 'deadline')}><option value="submit">Sau khi nộp bài</option><option value="deadline">Sau hạn nộp</option></select></label><button className="primary-button" onClick={generate} disabled={!!generationError}><RefreshCw size={17} />Sinh đề</button>
    </div><div className="exam-preview"><h2>Xem trước · {questions.length} câu</h2>{key !== generatedKey && questions.length > 0 && <p className="form-error">Cấu hình đã đổi, cần sinh lại đề.</p>}{questions.map((q, index) => <article className="solution-item" key={q.id}><h3>Câu {index + 1}</h3><p>{<MathText text={q.content} />}</p>{q.mathFormula && <MathRenderer formula={q.mathFormula} />}{q.options?.map(o => <p key={o.id}>{o.label}. {<MathText text={o.text} />}</p>)}<button className="secondary-button" onClick={() => {
      const alternative = pool.find(item => item.level === q.level && !questions.some(existing => existing.id === item.id));
      if (!alternative) return setError('Chưa có câu khác cùng mức độ để thay thế.');
      setQuestions(prev => prev.map((item, i) => i === index ? alternative : item));
    }}>Đổi câu</button></article>)}{!questions.length && <p className="empty-state">Chưa sinh đề.</p>}</div></div>
  </section>;
};
