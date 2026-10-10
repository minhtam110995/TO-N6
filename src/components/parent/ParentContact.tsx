import React, { useState } from 'react';
import { getCurrentUser } from '../../services/storage';
export const ParentContact: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const key = `parent_contact_draft_${getCurrentUser().id}`;
  const [message, setMessage] = useState(() => localStorage.getItem(key) || '');
  const [saved, setSaved] = useState(false);
  return <section><h1>Liên hệ giáo viên</h1><p className="muted">Tin nhắn chưa được kết nối với giáo viên. Bạn có thể lưu nội dung để trao đổi sau.</p><form className="contact-form" onSubmit={e => { e.preventDefault(); localStorage.setItem(key, message); setSaved(true); }}><label>Nội dung trao đổi<textarea value={message} rows={8} onChange={e => { setMessage(e.target.value); setSaved(false); }} /></label><div className="result-actions"><button className="primary-button" type="submit">Lưu nội dung</button><button type="button" className="secondary-button" onClick={onBack}>Quay lại</button></div>{saved && <p role="status">Đã lưu trên trình duyệt này. Chưa gửi cho giáo viên.</p>}</form></section>;
};
