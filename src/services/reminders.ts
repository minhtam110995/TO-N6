import { getCurrentUser, getStudents, notifyListeners } from './storage';
import { cloudRequest, getCloudSnapshot } from './cloudStore';
type Reminder = { id: string; studentId: string; body: string; createdAt: string; readAt?: string };
const KEY = 'toan6_reminders';
export function getReminders(): Reminder[] {
  const user = getCurrentUser();
  const all: Reminder[] = getCloudSnapshot()?.reminders || JSON.parse(localStorage.getItem(KEY) || '[]');
  return user.role === 'student' ? all.filter(r => r.studentId === user.id) : [];
}
export function remindChild() {
  if (getCloudSnapshot()) return cloudRequest('remindChild');
  const parent = getCurrentUser();
  if (parent.role !== 'parent' || !getStudents().some(s => s.id === parent.studentId && s.parentId === parent.id)) throw new Error('Chưa liên kết tài khoản học sinh.');
  const all: Reminder[] = JSON.parse(localStorage.getItem(KEY) || '[]');
  all.push({ id: crypto.randomUUID(), studentId: parent.studentId!, body: `${parent.fullName} nhắc em hoàn thành bài tập được giao.`, createdAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(all)); notifyListeners();
}
export function readReminders() {
  if (getCloudSnapshot()) return cloudRequest('readReminders');
  const user = getCurrentUser(); if (user.role !== 'student') return;
  const all: Reminder[] = JSON.parse(localStorage.getItem(KEY) || '[]');
  all.filter(r => r.studentId === user.id && !r.readAt).forEach(r => { r.readAt = new Date().toISOString(); });
  localStorage.setItem(KEY, JSON.stringify(all)); notifyListeners();
}
