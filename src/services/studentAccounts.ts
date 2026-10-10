import { CURRENT_TEACHER } from '../data/mockData';
import { User } from '../types';
import { addStudent, getCurrentUser, getParents, getStudents, notifyListeners } from './storage';
import { makeCredential, saveCredentials } from './localAuth';
import { cloudRequest, getCloudSnapshot } from './cloudStore';

export type RosterStudent = { fullName: string; birthDate: string; username: string; initialPassword: string };
const plain = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
export function parseRoster(text: string): RosterStudent[] {
  const rows = JSON.parse(text);
  if (!Array.isArray(rows) || !rows.length || rows.length > 200) throw new Error('Danh sách phải có từ 1 đến 200 học sinh.');
  const names = new Set<string>();
  return rows.map((row, i) => {
    const fullName = typeof row.fullName === 'string' ? row.fullName.trim().replace(/\s+/g, ' ') : '';
    const match = typeof row.birthDate === 'string' && row.birthDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!fullName || !match) throw new Error(`Dòng ${i + 1}: nhập họ tên và ngày sinh dd/mm/yyyy.`);
    const [, day, month, year] = match;
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.getUTCDate() !== Number(day) || date.getUTCMonth() + 1 !== Number(month) || date.getUTCFullYear() !== Number(year) || date.getTime() > Date.now() || Number(year) < 1900) throw new Error(`Dòng ${i + 1}: ngày sinh không hợp lệ.`);
    const base = plain(fullName.split(' ').slice(-2).join('')).toLowerCase();
    const username = base[0].toUpperCase() + base.slice(1) + day + month;
    if (!/^[A-Za-z0-9]+$/.test(username)) throw new Error(`Dòng ${i + 1}: không tạo được tên đăng nhập.`);
    if (names.has(username.toLowerCase())) throw new Error(`Trùng tên đăng nhập ${username}. Hãy kiểm tra danh sách.`);
    names.add(username.toLowerCase());
    return { fullName, birthDate: `${year}-${month}-${day}`, username, initialPassword: day + month + year };
  });
}

function teacherOnly() { if (getCurrentUser().role !== 'teacher') throw new Error('Chỉ giáo viên có thể cấp tài khoản.'); }
const accounts = () => [CURRENT_TEACHER, ...getStudents(), ...getParents()];
function checkUsername(username: string) {
  if (!/^[A-Za-z0-9_]+$/.test(username)) throw new Error('Tên đăng nhập chỉ gồm chữ không dấu, số và dấu gạch dưới.');
  if (accounts().some(u => u.username.toLowerCase() === username.toLowerCase())) throw new Error(`Tên đăng nhập ${username} đã tồn tại.`);
}
function transaction(write: () => void) {
  const keys = ['toan6_students', 'toan6_parents', 'toan6_credentials'];
  const saved = keys.map(key => localStorage.getItem(key));
  try { write(); } catch (e) { keys.forEach((key, i) => saved[i] === null ? localStorage.removeItem(key) : localStorage.setItem(key, saved[i]!)); notifyListeners(); throw e; }
}
export async function importStudentAccounts(rows: RosterStudent[]) {
  teacherOnly();
  const checked = parseRoster(JSON.stringify(rows.map(r => ({ fullName: r.fullName, birthDate: r.birthDate.split('-').reverse().join('/') }))));
  checked.forEach(r => checkUsername(r.username));
  if (getCloudSnapshot()) return await cloudRequest('importStudents', { students: checked });
  const credentials = await Promise.all(checked.map(r => makeCredential(r.initialPassword)));
  teacherOnly(); checked.forEach(r => checkUsername(r.username));
  transaction(() => {
    const entries = checked.map((r, i) => ({ userId: addStudent({ fullName: r.fullName, birthDate: r.birthDate, username: r.username }).student.id, credential: credentials[i] }));
    saveCredentials(entries);
  });
  notifyListeners();
  return checked.length;
}

export async function linkParentAccount(studentId: string, input: { fullName: string; username: string; phone: string }, password: string) {
  teacherOnly();
  const fullName = input.fullName.trim(), username = input.username.trim(), phone = input.phone.replace(/\D/g, '');
  if (!fullName) throw new Error('Nhập họ tên phụ huynh.');
  if (phone && !/^\d{10,15}$/.test(phone)) throw new Error('Số điện thoại cần 10 đến 15 chữ số.');
  checkUsername(username);
  if (getCloudSnapshot()) return await cloudRequest('linkParent', { studentId, input: { fullName, username, phone }, password });
  const credential = await makeCredential(password);
  teacherOnly(); checkUsername(username);
  const students = getStudents(), parents = getParents();
  const student = students.find(s => s.id === studentId);
  if (!student) throw new Error('Không tìm thấy học sinh.');
  if (student.parentId || parents.some(p => p.studentId === studentId)) throw new Error('Học sinh đã có tài khoản phụ huynh liên kết.');
  if (phone && parents.some(p => p.phone === phone)) throw new Error('Số điện thoại đã có tài khoản phụ huynh.');
  const parent: User = { id: `ph-${crypto.randomUUID()}`, fullName, username, phone: phone || undefined, role: 'parent', studentId, studentName: student.fullName, className: student.className, classId: student.classId, status: 'active' };
  transaction(() => {
    saveCredentials([{ userId: parent.id, credential }]);
    localStorage.setItem('toan6_parents', JSON.stringify([...parents, parent]));
    localStorage.setItem('toan6_students', JSON.stringify(students.map(s => s.id === studentId ? { ...s, parentId: parent.id, parentName: fullName } : s)));
  });
  notifyListeners();
  return parent;
}
