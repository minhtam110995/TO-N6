import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { getStudents, getSubmissions, getExams } from '../../services/storage';
export const ClassAnalytics: React.FC<{ studentId?: string; initialExamId?: string; onViewSubmission?: (id: string) => void }> = ({ studentId, initialExamId, onViewSubmission }) => {
  const [selected, setSelected] = useState('all');
  useEffect(() => setSelected(initialExamId || 'all'), [initialExamId]);
  const students = getStudents().filter(s => !studentId || s.id === studentId);
  const exams = getExams().filter(e => e.type !== 'practice');
  const submissions = getSubmissions().filter(s => (!studentId || s.studentId === studentId) && (selected === 'all' || s.examId === selected));
  const rows = students.map(student => ({ student, submission: submissions.find(s => s.studentId === student.id) }));
  const exportCSV = () => {
    const quote = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const values = [['Họ tên', 'Tên đăng nhập', 'Đề bài', 'Điểm', 'Thời gian (giây)', 'Trạng thái'], ...rows.map(({ student, submission }) => [student.fullName, student.username, submission?.examTitle, submission?.score, submission?.durationSeconds, submission ? 'Đã nộp' : 'Chưa nộp'])];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + values.map(row => row.map(quote).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Ket_qua_Toan6.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section><h1>Kết quả học tập</h1><div className="result-actions"><label>Đề bài <select className="secondary-button" value={selected} onChange={e => setSelected(e.target.value)}><option value="all">Bài gần nhất của mỗi học sinh</option>{exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}</select></label><button className="secondary-button" onClick={exportCSV}><Download size={16} />Xuất CSV</button></div><div className="table-scroll"><table className="results-table"><thead><tr><th>Học sinh</th><th>Đề bài</th><th>Điểm</th><th>Thời gian</th><th>Trạng thái</th><th>Bài làm</th></tr></thead><tbody>{rows.map(({ student, submission }) => <tr key={student.id}><td>{student.fullName}</td><td>{submission?.examTitle || '--'}</td><td>{submission ? `${submission.score}/10` : '--'}</td><td>{submission ? `${Math.floor(submission.durationSeconds / 60)}p ${submission.durationSeconds % 60}s` : '--'}</td><td>{submission ? 'Đã nộp' : 'Chưa nộp'}</td><td>{submission && <button className="secondary-button" onClick={() => onViewSubmission?.(submission.id)}>Xem câu trả lời</button>}</td></tr>)}</tbody></table></div>{!students.length && <p className="empty-state">Chưa có học sinh. Tạo tài khoản trong mục Quản lý học sinh.</p>}<h2 className="submission-history-heading">Tất cả lượt nộp · {submissions.length}</h2><div className="exam-list">{submissions.map(s => <article key={s.id} className="exam-item"><div><h3>{s.studentName} · {s.examTitle}</h3><p>{new Date(s.submittedAt).toLocaleString('vi-VN')} · {s.score}/10</p></div><button className="secondary-button" onClick={() => onViewSubmission?.(s.id)}>Xem câu trả lời</button></article>)}{!submissions.length && <p className="empty-state">Chưa có bài làm được nộp.</p>}</div></section>;
};
