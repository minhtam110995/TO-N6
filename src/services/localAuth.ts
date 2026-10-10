import { User } from '../types';
import { CURRENT_TEACHER } from '../data/mockData';
import { getParents, getStudents } from './storage';

type Credential = { salt: number[]; hash: string };
const KEY = 'toan6_credentials';
const read = (): Record<string, Credential> => JSON.parse(localStorage.getItem(KEY) || '{}');
async function hashPassword(password: string, salt: number[]) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new Uint8Array(salt), iterations: 100000 }, key, 256);
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
}
export async function makeCredential(password: string): Promise<Credential> {
  if (password.length < 8) throw new Error('Mật khẩu phải có ít nhất 8 ký tự.');
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
  return { salt, hash: await hashPassword(password, salt) };
}
export function saveCredentials(entries: Array<{ userId: string; credential: Credential }>) {
  const records = read(); entries.forEach(entry => { records[entry.userId] = entry.credential; });
  localStorage.setItem(KEY, JSON.stringify(records));
}
export async function verifyPassword(user: User, password: string) {
  let record = read()[user.id];
  // One bootstrap account remains so an empty class can be administered.
  if (!record && user.id === CURRENT_TEACHER.id && password === 'Toan6@2026') {
    record = await makeCredential(password); saveCredentials([{ userId: user.id, credential: record }]);
  }
  return !!record && await hashPassword(password, record.salt) === record.hash;
}
export async function changePassword(user: User, oldPassword: string, newPassword: string) {
  if (!await verifyPassword(user, oldPassword)) throw new Error('Mật khẩu hiện tại không đúng.');
  if (oldPassword === newPassword) throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại.');
  const credential = await makeCredential(newPassword);
  saveCredentials([{ userId: user.id, credential }]);
}
export function getSessionUser(): User | undefined {
  const id = sessionStorage.getItem('toan6_session_user');
  if (sessionStorage.getItem('toan6_login_session') !== 'active') return;
  return [CURRENT_TEACHER, ...getStudents(), ...getParents()].find(user => user.id === id && user.status === 'active');
}
