import React, { useEffect, useRef, useState } from 'react';
import { CloudUpload, LogIn, LogOut } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createTeacherCloudClient } from '../../services/supabaseClient';
import { getCloudTeacher, importCloudQuestionBank } from '../../services/cloudQuestionImport';
import { getQuestionBank } from '../../services/storage';

export function SupabaseMigration() {
  const client = useRef<SupabaseClient | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacher, setTeacher] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; void client.current?.auth.signOut({ scope: 'local' }); }; }, []);
  const disconnect = async () => {
    const old = client.current; client.current = undefined;
    setTeacher(''); setMessage(''); setPassword('');
    await old?.auth.signOut({ scope: 'local' });
  };
  return <section className="supabase-migration"><h2>Kết nối Supabase</h2>
    <p className="muted">Chuyển ngân hàng câu hỏi · Chưa bật đồng bộ toàn bộ lớp</p>
    {!teacher ? <form className="exam-config" autoComplete="off" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError(''); setMessage('');
      let next: SupabaseClient | undefined;
      try {
        next = createTeacherCloudClient();
        const { error: loginError } = await next.auth.signInWithPassword({ email: email.trim(), password });
        if (loginError) throw new Error('Email hoặc mật khẩu Supabase không đúng, hoặc tài khoản chưa xác nhận.');
        const profile = await getCloudTeacher(next);
        if (!alive.current) { await next.auth.signOut({ scope: 'local' }); return; }
        client.current = next; setTeacher(profile.full_name); setMessage('Đã xác thực giáo viên lớp 6D trên Supabase.');
      } catch (e) { await next?.auth.signOut({ scope: 'local' }); if (alive.current) setError(e instanceof Error ? e.message : 'Chưa kết nối được.'); }
      finally { if (alive.current) { setPassword(''); setBusy(false); } }
    }}><label>Email giáo viên Supabase<input type="email" required value={email} disabled={busy} autoComplete="off" onChange={e => setEmail(e.target.value)} /></label>
      <label>Mật khẩu Supabase<input type="password" required value={password} disabled={busy} autoComplete="off" onChange={e => setPassword(e.target.value)} /></label>
      <button className="primary-button" disabled={busy}><LogIn size={17} />{busy ? 'Đang kết nối...' : 'Kết nối tài khoản giáo viên'}</button></form>
      : <><p>Giáo viên: <strong>{teacher}</strong> · Lớp 6D</p><div className="result-actions">
        <button className="primary-button" disabled={busy} onClick={async () => {
          if (!client.current) return;
          setBusy(true); setError(''); setMessage('');
          try { const count = await importCloudQuestionBank(client.current, getQuestionBank()); if (alive.current) setMessage(`Đã nạp ${count} câu hỏi lên Supabase. Dữ liệu cục bộ vẫn giữ nguyên. Danh sách học sinh chưa chuyển.`); }
          catch (e) { if (alive.current) setError(e instanceof Error ? e.message : 'Chưa nạp được.'); }
          finally { if (alive.current) setBusy(false); }
        }}><CloudUpload size={17} />{busy ? 'Đang nạp...' : `Nạp ${getQuestionBank().length} câu hỏi lên Supabase`}</button>
        <button className="secondary-button" disabled={busy} onClick={() => void disconnect()}><LogOut size={17} />Ngắt kết nối</button>
      </div></>}
    {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="correct" role="status">{message}</p>}
  </section>;
}
