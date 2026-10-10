import React, { useState } from 'react';
import { X } from 'lucide-react';
import { addStudent, getStudents } from '../../services/storage';
import { makeCredential, saveCredentials } from '../../services/localAuth';
export const CreateAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState(''); const [username, setUsername] = useState(''); const [group, setGroup] = useState('Tổ 1');
  const [parent, setParent] = useState(''); const [phone, setPhone] = useState(''); const [error, setError] = useState('');
  const [initialPassword, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  return <div className="app-modal"><div className="confirm-content" role="dialog" aria-modal="true" aria-label="Thêm học sinh"><div className="solution-heading"><h2>Thêm học sinh</h2><button className="icon-button" title="Đóng" onClick={onClose} disabled={busy}><X size={20} /></button></div><p className="muted">Tài khoản lưu cục bộ. Phụ huynh đăng nhập bằng số điện thoại; học sinh và phụ huynh có thể tự đổi mật khẩu ban đầu.</p><form className="exam-config" onSubmit={async e => {
    e.preventDefault(); setError('');
    if (!name.trim() || !username.trim()) return setError('Nhập họ tên và tên đăng nhập học sinh.');
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return setError('Tên đăng nhập chỉ gồm chữ không dấu, số và dấu gạch dưới.');
    if (getStudents().some(s => s.username === username.trim())) return setError('Tên đăng nhập đã tồn tại.');
    if ((parent.trim() && !phone.trim()) || (!parent.trim() && phone.trim())) return setError('Nhập cả tên và số điện thoại phụ huynh để liên kết.');
    if (parent.trim() && !/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) return setError('Số điện thoại cần 10 đến 15 chữ số.');
    setBusy(true);
    try {
      const studentCredential = await makeCredential(initialPassword);
      const parentCredential = parent.trim() ? await makeCredential(initialPassword) : undefined;
      const { student, parent: linkedParent } = addStudent({ fullName: name.trim(), username: username.trim(), group }, parent.trim() ? { fullName: parent.trim(), phone: phone.replace(/\D/g, '') } : undefined);
      saveCredentials([{ userId: student.id, credential: studentCredential }, ...(linkedParent && parentCredential ? [{ userId: linkedParent.id, credential: parentCredential }] : [])]);
      setName(''); setUsername(''); setParent(''); setPhone(''); setPassword(''); onSuccess();
    } catch (e) { setError(e instanceof Error ? e.message : 'Chưa lưu được tài khoản. Hãy thử lại.'); } finally { setBusy(false); }
  }}><label>Họ tên học sinh<input required value={name} onChange={e => setName(e.target.value)} /></label><label>Tên đăng nhập<input required value={username} onChange={e => setUsername(e.target.value)} /></label><label>Tổ<select value={group} onChange={e => setGroup(e.target.value)}>{[1, 2, 3, 4].map(n => <option key={n}>Tổ {n}</option>)}</select></label><label>Họ tên phụ huynh<input value={parent} onChange={e => setParent(e.target.value)} /></label><label>Số điện thoại phụ huynh<input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></label><label>Mật khẩu ban đầu<input type="password" required minLength={8} autoComplete="new-password" value={initialPassword} onChange={e => setPassword(e.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={busy}>{busy ? 'Đang tạo...' : 'Tạo tài khoản'}</button></form></div></div>;
};
