import { createClient } from '@supabase/supabase-js';
import type { Role } from '../types';
import { clearCloudStore, connectCloud, getCloudSnapshot, setCloudSnapshot } from './cloudStore';
import { notifyListeners } from './storage';

export const CLOUD_ENABLED = import.meta.env.VITE_USE_SUPABASE === 'true';
let client: ReturnType<typeof createClient> | undefined;
let generation = 0;
let queue: Promise<unknown> = Promise.resolve();
let poll: ReturnType<typeof setTimeout>;
let connectionError = '';
export const cloudConnectionError = () => connectionError;
class CloudResponseError extends Error { constructor(message: string, public status: number) { super(message); } }
function authClient() {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key || key.startsWith('sb_secret_')) throw new Error('Cấu hình Supabase công khai không hợp lệ.');
    client = createClient(url, key, { auth: { storage: sessionStorage, storageKey: 'toan6-cloud-session', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
  }
  return client;
}
async function send(op: string, body: Record<string, unknown> = {}, token?: string) {
  const response = await fetch('/api/cloud', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify({ ...body, op }), signal: AbortSignal.timeout(30000), cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new CloudResponseError(data.error || 'Chưa xác nhận được dữ liệu trên Supabase.', response.status);
  return data;
}
function attach(snapshot: Parameters<typeof setCloudSnapshot>[0]) {
  setCloudSnapshot(snapshot); connectionError = '';
  connectCloud((op, body) => {
    const version = generation;
    const work = async () => {
      if (version !== generation) throw new Error('Phiên đăng nhập đã thay đổi.');
      const session = (await authClient().auth.getSession()).data.session;
      if (!session) throw new Error('Phiên hết hạn. Hãy đăng xuất và đăng nhập lại.');
      try {
        const data = await send(op, body, session.access_token);
        if (version !== generation) throw new Error('Phiên đăng nhập đã thay đổi.');
        if (op === 'changePassword' && data.result?.session) {
          const updated = await authClient().auth.setSession(data.result.session);
          if (updated.error) throw new Error('Đã đổi mật khẩu. Hãy đăng xuất rồi đăng nhập bằng mật khẩu mới.');
        }
        if (data.snapshot) setCloudSnapshot(data.snapshot);
        else if (data.drafts && getCloudSnapshot()) setCloudSnapshot({ ...getCloudSnapshot()!, drafts: data.drafts });
        connectionError = ''; notifyListeners(); return data.result;
      } catch (e) {
        if (version === generation) {
          connectionError = e instanceof CloudResponseError && e.status < 500 && e.status !== 401 ? '' : e instanceof Error ? e.message : 'Mất kết nối Supabase.';
          notifyListeners();
        }
        throw e;
      }
    };
    const next = queue.then(work, work); queue = next.catch(() => {}); return next;
  });
  notifyListeners();
  let ticks = 0;
  const version = generation;
  clearTimeout(poll);
  const refresh = async () => {
    if (version !== generation || !getCloudSnapshot()) return;
    if (document.visibilityState !== 'hidden') {
      try { const { cloudRequest } = await import('./cloudStore'); await cloudRequest('snapshot', { includeBank: ++ticks % 12 === 0 }); } catch { /* The connection banner exposes failed refreshes. */ }
    }
    if (version === generation) poll = setTimeout(refresh, 5000);
  };
  poll = setTimeout(refresh, 5000);
}
export async function cloudLogin(username: string, password: string, role: Role) {
  const version = ++generation;
  clearTimeout(poll); clearCloudStore();
  const data = await send('login', { username, password, role });
  if (version !== generation) throw new Error('Phiên đăng nhập đã thay đổi.');
  const session = await authClient().auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  if (session.error) throw new Error('Chưa lưu được phiên đăng nhập Supabase.');
  attach(data.snapshot); return data.snapshot.user;
}
export async function restoreCloudSession() {
  const version = ++generation;
  const session = (await authClient().auth.getSession()).data.session;
  if (!session) return false;
  const data = await send('snapshot', {}, session.access_token);
  if (version !== generation) return false;
  attach(data.snapshot); return true;
}
export async function cloudLogout() {
  generation++; clearTimeout(poll); clearCloudStore(); connectionError = ''; notifyListeners();
  try { if (client) await client.auth.signOut({ scope: 'local' }); }
  finally {
    client?.auth.stopAutoRefresh();
    sessionStorage.removeItem('toan6-cloud-session');
    client = undefined;
  }
}
