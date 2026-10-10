import { CURRENT_TEACHER } from '../data/mockData';
import { getCurrentUser, getParents, notifyListeners } from './storage';
export type Message = { id: string; parentId: string; senderId: string; body: string; createdAt: string; readAt?: string };
const KEY = 'toan6_messages';
export function getMessages(parentId?: string): Message[] {
  const user = getCurrentUser();
  const all: Message[] = JSON.parse(localStorage.getItem(KEY) || '[]');
  if (user.role === 'student') return [];
  return all.filter(m => user.role === 'parent' ? m.parentId === user.id : !parentId || m.parentId === parentId);
}
export function sendMessage(parentId: string, body: string) {
  const user = getCurrentUser(); const text = body.trim();
  if (!text || text.length > 3000) throw new Error('Tin nhắn phải có từ 1 đến 3000 ký tự.');
  if (user.role === 'student' || user.role === 'parent' && user.id !== parentId || !getParents().some(p => p.id === parentId)) throw new Error('Không có quyền gửi trong cuộc trao đổi này.');
  const messages: Message[] = JSON.parse(localStorage.getItem(KEY) || '[]');
  messages.push({ id: crypto.randomUUID(), parentId, senderId: user.id, body: text, createdAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(messages)); notifyListeners();
}
export function unreadMessageCount() {
  return getMessages().filter(m => !m.readAt && m.senderId !== getCurrentUser().id).length;
}
export function markMessagesRead(parentId: string) {
  const user = getCurrentUser();
  if (user.role === 'student' || user.role === 'parent' && user.id !== parentId) return;
  const messages: Message[] = JSON.parse(localStorage.getItem(KEY) || '[]'); let changed = false;
  messages.filter(m => m.parentId === parentId && !m.readAt && m.senderId !== user.id).forEach(m => { m.readAt = new Date().toISOString(); changed = true; });
  if (changed) { localStorage.setItem(KEY, JSON.stringify(messages)); notifyListeners(); }
}
export const TEACHER_ID = CURRENT_TEACHER.id;
