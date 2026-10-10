import React, { useState } from 'react';
import { X } from 'lucide-react';
import { addStudent, getStudents } from '../../services/storage';
import { makeCredential, saveCredentials } from '../../services/localAuth';
import { cloudRequest, getCloudSnapshot } from '../../services/cloudStore';

export const CreateAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState(''), [username, setUsername] = useState('');
  const [parent, setParent] = useState(''), [phone, setPhone] = useState(''), [error, setError] = useState('');
  const [initialPassword, setPassword] = useState(''), [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  return <div className="app-modal"><div className="confirm-content" role="dialog" aria-modal="true" aria-label="Thêm học sinh">
    <div className="solution-heading"><h2>Thêm học sinh</h2><button className="icon-button" title="Đóng" onClick={onClose} disabled={busy}><X size={20} /></button></div>
    <form className="exam-config" onSubmit={async e => {
      e.preventDefault(); if (busy) return; setError('');
      if (!name.trim() || !username.trim()) return setError('Nhập họ tên và tên đăng nhập học sinh.');
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return setError('Tên đăng nhập chỉ gồm chữ không dấu, số và dấu gạch dưới.');
      if (getStudents().some(s => s.username.toLowerCase() === username.trim().toLowerCase())) return setError('Tên đăng nhập đã tồn tại.');
      if ((parent.trim() && !phone.trim()) || (!parent.trim() && phone.trim())) return setError('Nhập cả tên và số điện thoại phụ huynh để liên kết.');
      const normalizedPhone = phone.replace(/\D/g, '');
      if (parent.trim() && !/^\d{10,15}$/.test(normalizedPhone)) return setError('Số điện thoại cần 10 đến 15 chữ số.');
      setBusy(true);
      try {
        if (getCloudSnapshot()) await cloudRequest('createStudent', { student: { fullName: name.trim(), username: username.trim() }, password: initialPassword, parent: parent.trim() ? { fullName: parent.trim(), username: normalizedPhone, phone: normalizedPhone } : undefined });
        else {
          const studentCredential = await makeCredential(initialPassword), parentCredential = parent.trim() ? await makeCredential(initialPassword) : undefined;
          const { student, parent: linkedParent } = addStudent({ fullName: name.trim(), username: username.trim() }, parent.trim() ? { fullName: parent.trim(), phone: normalizedPhone } : undefined);
          saveCredentials([{ userId: student.id, credential: studentCredential }, ...(linkedParent && parentCredential ? [{ userId: linkedParent.id, credential: parentCredential }] : [])]);
        }
        setName(''); setUsername(''); setParent(''); setPhone(''); setPassword(''); onSuccess();
      } catch (e) { setError(e instanceof Error ? e.message : 'Chưa lưu được tài khoản.'); } finally { setBusy(false); }
    }}>
      <label>Họ tên học sinh<input required value={name} onChange={e => setName(e.target.value)} /></label><label>Tên đăng nhập<input required value={username} onChange={e => setUsername(e.target.value)} /></label>
      <label>Họ tên phụ huynh<input value={parent} onChange={e => setParent(e.target.value)} /></label><label>Số điện thoại phụ huynh<input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></label>
      <label>Mật khẩu ban đầu<input type="password" required minLength={8} autoComplete="new-password" value={initialPassword} onChange={e => setPassword(e.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={busy}>{busy ? 'Đang tạo...' : 'Tạo tài khoản'}</button>
    </form>
  </div></div>;
};
