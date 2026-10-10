import React, { useState } from 'react';
import { BarChart3, CheckCircle2, Eye, Plus, X } from 'lucide-react';
import { getExams, getStudents, getSubmissions } from '../../services/storage';
import { MathRenderer } from '../common/MathRenderer';

export const AssignedExams: React.FC<{ assignedId?: string; onDismiss: () => void; onCreate: () => void; onViewResults: (id: string) => void }> = ({ assignedId, onDismiss, onCreate, onViewResults }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<string>();
  const exams = getExams().filter(e => e.type !== 'practice').sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const students = getStudents();
  const submissions = getSubmissions();
  const assigned = exams.find(e => e.id === assignedId);
  const isActive = (exam: typeof exams[number]) => exam.status === 'active' && Date.parse(exam.deadline) > Date.now();
  const visible = exams.filter(e => e.title.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')) && (filter === 'all' || (filter === 'active' ? isActive(e) : !isActive(e))));
  const preview = exams.find(e => e.id === previewId);
  const date = (value: string) => new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' });
  return <section className="space-y-4">
    <div className="page-heading"><h1>Bài đã giao</h1><p>Lớp 6A · {exams.length} bài</p></div>
    {assigned && <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-lg p-4" role="status"><CheckCircle2 size={22} className="shrink-0" /><div className="min-w-0 flex-1"><strong>Đã giao bài thành công</strong><p className="break-words">{assigned.title} · {assigned.questions.length} câu · Giao cho cả lớp 6A</p></div><button className="icon-button shrink-0" aria-label="Đóng xác nhận giao bài" onClick={onDismiss}><X size={18} /></button></div>}
    <div className="flex flex-wrap items-center gap-3 justify-between"><input className="min-w-0 border border-slate-200 rounded-lg px-3 py-2" aria-label="Tìm bài đã giao" placeholder="Tìm tên bài..." value={search} onChange={e => setSearch(e.target.value)} /><div className="filter-tabs">{[['all', 'Tất cả'], ['active', 'Đang giao'], ['closed', 'Đã kết thúc']].map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div><button className="primary-button" onClick={onCreate}><Plus size={17} />Giao bài mới</button></div>
    <div className="exam-list">{visible.map(exam => {
      const recipients = students.filter(s => exam.assignedTo === 'all' || exam.assignedTo.includes(s.id));
      const submitted = new Set(submissions.filter(s => s.examId === exam.id).map(s => s.studentId));
      return <article className="exam-item" key={exam.id}><div className="min-w-0"><span className={`status ${isActive(exam) ? '' : 'closed'}`}>{isActive(exam) ? 'Đang giao' : 'Đã kết thúc'}</span><h2 className="break-words">{exam.title}</h2><p>{exam.chapterTitle || `Chương ${exam.chapterId}`} · {exam.questions.length} câu · {exam.timeLimitMinutes} phút</p><p>Đã giao: {date(exam.createdAt)}</p><p>Hạn nộp: {date(exam.deadline)}</p><p>Đã nộp: {recipients.filter(s => submitted.has(s.id)).length}/{recipients.length} học sinh</p></div><div className="item-actions"><button className="secondary-button" aria-expanded={previewId === exam.id} onClick={() => setPreviewId(previewId === exam.id ? undefined : exam.id)}><Eye size={17} />Xem đề</button><button className="primary-button" onClick={() => onViewResults(exam.id)}><BarChart3 size={17} />Xem kết quả</button></div></article>;
    })}{!visible.length && <p className="empty-state">{exams.length ? 'Không có bài phù hợp.' : 'Chưa có bài đã giao.'}</p>}</div>
    {preview && <section className="exam-preview"><div className="flex items-center justify-between gap-3"><h2 className="break-words">{preview.title}</h2><button className="icon-button shrink-0" aria-label="Đóng xem đề" onClick={() => setPreviewId(undefined)}><X size={18} /></button></div>{preview.questions.map((q, i) => <article className="solution-item" key={q.id}><h3>Câu {i + 1}</h3><p>{q.content}</p>{q.mathFormula && <MathRenderer formula={q.mathFormula} />}{q.options?.map(o => <p key={o.id}>{o.label}. {o.text}</p>)}{q.statements?.map(s => <p key={s.id}>{s.text}</p>)}</article>)}</section>}
  </section>;
};
