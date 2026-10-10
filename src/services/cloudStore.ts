import type { User, Exam, Question, Submission, WrongQuestionItem, WeakTopic } from '../types';

export type CloudSnapshot = {
  user: User; students: User[]; parents: User[]; exams: Exam[]; submissions: Submission[];
  wrong: WrongQuestionItem[]; weakTopics: WeakTopic[]; bank?: Question[];
  messages: { id: string; parentId: string; senderId: string; body: string; createdAt: string; readAt?: string }[];
  reminders: { id: string; studentId: string; body: string; createdAt: string; readAt?: string }[];
  drafts: Record<string, unknown>;
  attempts: { id: string; exam_id: string; started_at: string; ends_at: string }[];
};
let snapshot: CloudSnapshot | undefined;
let requester: ((op: string, body?: Record<string, unknown>) => Promise<any>) | undefined;
export const getCloudSnapshot = () => snapshot;
export function setCloudSnapshot(next: CloudSnapshot) {
  const sameUser = snapshot?.user.id === next.user.id && snapshot?.user.role === next.user.role;
  snapshot = { ...next, bank: next.bank ?? (sameUser ? snapshot?.bank : []) };
}
export function connectCloud(request: typeof requester) { requester = request; }
export function clearCloudStore() { snapshot = undefined; requester = undefined; }
export function cloudRequest(op: string, body?: Record<string, unknown>) {
  if (!requester || !snapshot) return Promise.reject(new Error('Chưa có phiên Supabase. Hãy đăng nhập lại.'));
  return requester(op, body);
}
