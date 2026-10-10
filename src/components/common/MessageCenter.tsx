import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { getCurrentUser, getParents } from '../../services/storage';
import { getMessages, markMessagesRead, sendMessage } from '../../services/messages';
import { CLOUD_ENABLED } from '../../services/cloudSession';

export function MessageCenter({ initialParentId }: { initialParentId?: string }) {
  const user = getCurrentUser(), parents = getParents();
  const [selected, setSelected] = useState(user.role === 'parent' ? user.id : initialParentId || parents[0]?.id || '');
  const [body, setBody] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { if (user.role === 'teacher' && initialParentId) setSelected(initialParentId); }, [initialParentId, user.role]);
  const messages = getMessages(selected), unread = messages.filter(m => !m.readAt && m.senderId !== user.id).length;
  useEffect(() => {
    if (!selected || !unread) return;
    let alive = true;
    Promise.resolve(markMessagesRead(selected)).catch(e => { if (alive) setError(e instanceof Error ? e.message : 'Chưa đánh dấu đã đọc được.'); });
    return () => { alive = false; };
  }, [selected, unread]);
  return <section>
    <div className="page-heading"><h1>{user.role === 'teacher' ? 'Hộp thư phụ huynh' : 'Liên hệ Cô Tâm'}</h1>{!CLOUD_ENABLED && <p>Trao đổi cục bộ trên trình duyệt này. Chưa đồng bộ qua Supabase.</p>}</div>
    <div className="message-layout">
      {user.role === 'teacher' && <nav className="message-conversations" aria-label="Cuộc trao đổi">{parents.map(parent => {
        const count = getMessages(parent.id).filter(m => !m.readAt && m.senderId !== user.id).length;
        return <button key={parent.id} aria-pressed={selected === parent.id} onClick={() => { setSelected(parent.id); setBody(''); setError(''); }}><strong>{parent.fullName}{count > 0 && <span className="count-pill">{count}</span>}</strong><small>Phụ huynh của {parent.studentName}</small></button>;
      })}{!parents.length && <p className="empty-state">Chưa có tài khoản phụ huynh được liên kết.</p>}</nav>}
      <div className="message-thread">{selected ? <>
        <h2>{user.role === 'teacher' ? parents.find(p => p.id === selected)?.fullName : 'Cô Tâm'}</h2>
        <div className="message-list" aria-label="Tin nhắn">{messages.map(message => <article key={message.id} className={`message-bubble ${message.senderId === user.id ? 'sent' : ''}`}><p>{message.body}</p><small>{new Date(message.createdAt).toLocaleString('vi-VN')} · {message.readAt ? 'Đã đọc' : CLOUD_ENABLED ? 'Đã gửi' : 'Đã lưu cục bộ'}</small></article>)}{!messages.length && <p className="empty-state">Chưa có tin nhắn.</p>}</div>
        <form onSubmit={async e => {
          e.preventDefault(); if (busy) return; setError(''); setBusy(true);
          try { await sendMessage(selected, body); setBody(''); } catch (e) { setError(e instanceof Error ? e.message : 'Chưa gửi được tin.'); } finally { setBusy(false); }
        }}><label>Nội dung trao đổi<textarea required maxLength={3000} rows={3} value={body} onChange={e => setBody(e.target.value)} disabled={busy} /></label>{error && <p role="alert" className="form-error">{error}</p>}<button className="primary-button" disabled={busy || !body.trim()}><Send size={16} />{busy ? 'Đang gửi...' : 'Gửi tin nhắn'}</button></form>
      </> : <p className="empty-state">Chọn phụ huynh để trao đổi.</p>}</div>
    </div>
  </section>;
}
