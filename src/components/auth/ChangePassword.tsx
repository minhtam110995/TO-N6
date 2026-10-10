import React, { useState } from 'react';
import { changePassword } from '../../services/localAuth';
import { getCurrentUser } from '../../services/storage';
export function ChangePassword() {
  const [oldPassword, setOld] = useState(''); const [newPassword, setNew] = useState(''); const [repeat, setRepeat] = useState('');
  const [error, setError] = useState(''); const [success, setSuccess] = useState(false); const [busy, setBusy] = useState(false);
  return <section><div className="page-heading"><h1>Đổi mật khẩu</h1><p>{getCurrentUser().fullName}</p></div><form className="exam-config account-password-form" onSubmit={async e => {
    e.preventDefault(); setError(''); setSuccess(false);
    if (newPassword !== repeat) return setError('Mật khẩu nhập lại không khớp.');
    setBusy(true);
    try { await changePassword(getCurrentUser(), oldPassword, newPassword); setOld(''); setNew(''); setRepeat(''); setSuccess(true); }
    catch (e) { setError(e instanceof Error ? e.message : 'Chưa đổi được mật khẩu.'); } finally { setBusy(false); }
  }}><label>Mật khẩu hiện tại<input type="password" autoComplete="current-password" required value={oldPassword} onChange={e => setOld(e.target.value)} /></label><label>Mật khẩu mới<input type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={e => setNew(e.target.value)} /></label><label>Nhập lại mật khẩu mới<input type="password" autoComplete="new-password" minLength={8} required value={repeat} onChange={e => setRepeat(e.target.value)} /></label>{error && <p role="alert" className="form-error">{error}</p>}{success && <p role="status" className="correct">Đã đổi mật khẩu trên trình duyệt này.</p>}<button className="primary-button" disabled={busy}>{busy ? 'Đang lưu...' : 'Đổi mật khẩu'}</button></form><p className="muted">Tài khoản hiện lưu cục bộ; mật khẩu chưa đồng bộ sang thiết bị khác.</p></section>;
}
