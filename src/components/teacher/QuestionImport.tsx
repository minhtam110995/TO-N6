import { MathText } from '../common/MathRenderer';
import React, { useState } from 'react';
import { Upload, X, Download } from 'lucide-react';
import { Question } from '../../types';
import { CHAPTERS_DATA } from '../../data/seedQuestions';
import { parseQuestionFile, assignLesson } from '../../services/questionImport';
import { importQuestions } from '../../services/storage';
export function QuestionImport({ onClose, onDone }: { onClose: () => void; onDone: (count: number) => void }) {
  const [questions, setQuestions] = useState<Question[]>([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const unresolved = questions.filter(q => !q.lessonId).length;
  const template = () => {
    const text = 'content,answer,lessonId,level,solution\r\n"Tính 3/7 + 2/7.","5/7",25,nhan_biet,"Cộng tử số, giữ nguyên mẫu."';
    const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'Mau_cau_hoi.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="app-modal"><div className="question-import" role="dialog" aria-modal="true" aria-label="Nạp câu hỏi từ file"><div className="solution-heading"><h2>Nạp câu hỏi từ file</h2><button className="icon-button" title="Đóng" onClick={onClose}><X size={20} /></button></div><div className="result-actions"><label className="secondary-button"><Upload size={16} />Chọn JSON / CSV<input type="file" accept=".json,.csv" aria-label="File câu hỏi" disabled={busy} onChange={async e => {
    const file = e.target.files?.[0]; if (!file) return; setError(''); setQuestions([]); setBusy(true);
    try { if (file.size > 10 * 1024 * 1024) throw new Error('File tối đa 10 MB.'); setQuestions(parseQuestionFile(await file.text(), file.name.split('.').pop()?.toLowerCase() || '')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không đọc được file.'); } finally { setBusy(false); }
  }} /></label><button className="secondary-button" onClick={template}><Download size={16} />Tải mẫu CSV</button></div>{error && <p className="form-error" role="alert">{error}</p>}{questions.length > 0 && <><p>{questions.length} câu · {unresolved} câu cần chọn bài học trước khi nạp.</p><div className="import-preview">{questions.map((q, i) => <div key={q.id}><p><strong>{i + 1}.</strong> {<MathText text={q.content} />}</p><label>Bài học<select value={q.lessonId} onChange={e => setQuestions(prev => prev.map((item, j) => j === i ? assignLesson(item, Number(e.target.value)) : item))}><option value={0}>Chưa phân loại</option>{CHAPTERS_DATA.map(c => <optgroup label={c.title} key={c.id}>{c.lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</optgroup>)}</select></label><small>{q.chapterTitle || 'Chưa xác định chương'}</small></div>)}</div></>}<div className="result-actions"><button className="secondary-button" onClick={onClose} disabled={busy}>Hủy</button><button className="primary-button" disabled={busy || !questions.length || unresolved > 0} onClick={async () => { setBusy(true); try { onDone(await importQuestions(questions)); } catch (e) { setError(e instanceof Error ? e.message : 'Chưa lưu được ngân hàng.'); } finally { setBusy(false); } }}>{busy ? 'Đang nạp...' : `Nạp ${questions.length} câu`}</button></div></div></div>;
}
