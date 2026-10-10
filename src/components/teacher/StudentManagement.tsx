import React, { useEffect, useState } from 'react';
import { Download, UserPlus, Upload } from 'lucide-react';
import { getStudents, getParents, getSubmissions } from '../../services/storage';
import { RosterImport } from './RosterImport';
import { LinkParentModal } from './LinkParentModal';
import { User } from '../../types';
export const StudentManagement: React.FC<{ initialQuery?: string; onOpenCreateAccount: () => void; onSelectStudentDetail: (id: string) => void }> = ({ initialQuery = '', onOpenCreateAccount, onSelectStudentDetail }) => {
  const [query, setQuery] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [parentStudent, setParentStudent] = useState<User>();
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { setQuery(initialQuery); setPage(1); }, [initialQuery]);
  const students = getStudents(); const parents = getParents(); const submissions = getSubmissions();
  const filtered = students.filter(s => `${s.fullName} ${s.username} ${s.parentName || ''} ${s.phone || ''}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')));
  const pages = Math.max(1, Math.ceil(filtered.length / 10)); const currentPage = Math.min(page, pages);
  const exportCSV = () => {
    const quote = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Họ tên', 'Tên đăng nhập', 'Phụ huynh', 'Số điện thoại'], ...filtered.map(s => [s.fullName, s.username, s.parentName, s.phone])];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(r => r.map(quote).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Hoc_sinh_Toan6.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section>{message && <p role="status" className="correct">{message}</p>}{importOpen && <RosterImport onClose={() => setImportOpen(false)} onDone={count => { setImportOpen(false); setMessage(`Đã thêm ${count} học sinh và cấp tài khoản.`); }} />}{parentStudent && <LinkParentModal key={parentStudent.id} student={parentStudent} onClose={() => setParentStudent(undefined)} onDone={() => { setParentStudent(undefined); setMessage('Đã tạo tài khoản phụ huynh và liên kết đúng học sinh.'); }} />}<div className="page-heading"><h1>Học sinh lớp 6D</h1><p>{students.length} tài khoản</p></div><div className="result-actions"><button className="primary-button" onClick={onOpenCreateAccount}><UserPlus size={17} />Thêm học sinh</button><button className="secondary-button" onClick={() => setImportOpen(true)}><Upload size={17} />Nạp danh sách học sinh</button><button className="secondary-button" onClick={exportCSV}><Download size={17} />Xuất CSV</button></div><div className="student-filters"><label>Tìm học sinh<input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Tên, tài khoản, phụ huynh" /></label></div><div className="table-scroll"><table className="results-table"><thead><tr><th>Học sinh</th><th>Ngày sinh</th><th>Tài khoản</th><th>Phụ huynh</th><th>Bài đã nộp</th><th>Kết quả</th></tr></thead><tbody>{filtered.slice((currentPage - 1) * 10, currentPage * 10).map(s => {
    const parent = parents.find(p => p.studentId === s.id); const count = submissions.filter(sub => sub.studentId === s.id).length;
    return <tr key={s.id}><td>{s.fullName}</td><td>{s.birthDate?.split('-').reverse().join('/') || '--'}</td><td>{s.username}</td><td>{parent ? <><strong>{parent.fullName}</strong><p>{parent.username}</p><p>{parent.phone}</p></> : <button className="secondary-button" onClick={() => setParentStudent(s)}><UserPlus size={16} />Thêm phụ huynh</button>}</td><td>{count}</td><td><button className="secondary-button" onClick={() => onSelectStudentDetail(s.id)}>Xem</button></td></tr>;
  })}</tbody></table></div>{!filtered.length && <p className="empty-state">Không tìm thấy học sinh.</p>}<div className="pagination"><button className="secondary-button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Trước</button><span>{currentPage}/{pages} · {filtered.length} học sinh</span><button className="secondary-button" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Tiếp</button></div></section>;
};
