import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { Role, User } from '../../types';
import { CURRENT_TEACHER } from '../../data/mockData';
import { getStudents, getParents, setCurrentUser } from '../../services/storage';
import { verifyPassword } from '../../services/localAuth';
import { CLOUD_ENABLED, cloudLogin } from '../../services/cloudSession';

export const LoginView: React.FC<{ onLoginSuccess: (user: User) => void; onCancel?: () => void }> = ({ onLoginSuccess, onCancel }) => {
  const [role, setRole] = useState<Role>('student'), [username, setUsername] = useState(''), [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const roles = [{ id: 'student', label: 'Học sinh', icon: 'school' }, { id: 'teacher', label: 'Giáo viên', icon: 'co_present' }, { id: 'parent', label: 'Phụ huynh', icon: 'family_restroom' }] as const;
  return <section className="login-panel">
    <header className="login-hero">{onCancel && <button className="icon-button" title="Đóng" onClick={onCancel}><X size={20} /></button>}<div className="login-emblem"><span className="material-symbols-outlined">functions</span><span className="login-kntt">KNTT</span></div><h1>TOÁN 6D - LỚP CÔ TÂM<br /><span>THCS BÁT TRÀNG</span></h1><p>Kết nối tri thức với cuộc sống</p></header>
    <div className="login-card"><h2>Đăng nhập học tập</h2><form className="exam-config" autoComplete="off" onSubmit={async e => {
      e.preventDefault(); if (busy) return; setError(''); setBusy(true);
      try {
        if (CLOUD_ENABLED) { const user = await cloudLogin(username.trim(), password, role); setPassword(''); onLoginSuccess(user); return; }
        const name = username.trim();
        const user = role === 'teacher' ? (CURRENT_TEACHER.username === name ? CURRENT_TEACHER : undefined) : role === 'student' ? getStudents().find(s => s.username === name) : getParents().find(p => p.username === name || p.phone?.replace(/\D/g, '') === name.replace(/\D/g, '') && /\d/.test(name));
        if (!user || user.status !== 'active' || !await verifyPassword(user, password)) return setError('Tài khoản hoặc mật khẩu không đúng.');
        setCurrentUser(user); onLoginSuccess(user);
      } catch (e) { setError(e instanceof Error ? e.message : 'Chưa đăng nhập được. Hãy kiểm tra kết nối.'); }
      finally { setBusy(false); }
    }}>
      <fieldset className="login-role-picker"><legend>Bạn tham gia với tư cách là:</legend><div role="group" aria-label="Vai trò">{roles.map(item => <button key={item.id} type="button" disabled={busy} aria-pressed={role === item.id} onClick={() => { setRole(item.id); setUsername(''); setPassword(''); setVisible(false); setError(''); }}><span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>{item.label}</button>)}</div></fieldset>
      <label>Tên đăng nhập hoặc số điện thoại<input required name="login-account" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Nhập tài khoản của bạn" value={username} onChange={e => setUsername(e.target.value)} disabled={busy} /></label>
      <label>Mật khẩu<div className="password-field"><input required name="login-secret" autoComplete="off" placeholder="Nhập mật khẩu" type={visible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /><button type="button" className="icon-button" title={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></label>
      {error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={busy}>{busy ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}<span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>
    </form><p className="login-demo-note"><span className="material-symbols-outlined" aria-hidden="true">info</span><span>{CLOUD_ENABLED ? 'Tài khoản do Cô Tâm cấp.' : 'Tài khoản do Cô Tâm cấp. Hiện lưu cục bộ trên trình duyệt, chưa đồng bộ qua Supabase.'}</span></p></div>
  </section>;
};
