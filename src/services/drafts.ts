import { cloudRequest, getCloudSnapshot } from './cloudStore';

export function readDraft(key: string): any {
  const snapshot = getCloudSnapshot();
  if (snapshot) return snapshot.drafts[snapshot.user.id + ':' + key];
  return JSON.parse(localStorage.getItem(key) || 'null');
}
export async function saveDraft(key: string, payload: Record<string, unknown>) {
  if (getCloudSnapshot()) await cloudRequest('saveDraft', { id: key, payload });
  else localStorage.setItem(key, JSON.stringify(payload));
}
export async function removeDraft(key: string) {
  if (getCloudSnapshot()) await cloudRequest('deleteDraft', { id: key });
  else localStorage.removeItem(key);
}
