import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createCloudApi, CloudError } from '../server/cloud-core.mjs';

dotenv.config({ path: fileURLToPath(new URL('../.env.local', import.meta.url)), quiet: true });
const admin = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
const api = createCloudApi(process.env);
const prefix = 'qa' + randomUUID().replaceAll('-', '');
const classId = prefix + '-class';
const authIds = new Set();
let step = 'setup';
const checked = async query => { const { data, error } = await query; if (error) throw new Error(error.message); return data; };
const profiles = {};
const sessions = {};
const denied = async promise => assert.rejects(promise, e => e instanceof CloudError && e.status === 403);

async function user(name, role, studentId) {
  const username = prefix + name;
  const password = randomUUID() + 'aA1!';
  const email = username + '@students.toan6d.invalid';
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error('Fixture Auth creation failed');
  authIds.add(data.user.id);
  const profile = { id: prefix + '-' + name, auth_user_id: data.user.id, class_id: classId, username, full_name: 'QA ' + name, role, status: 'active', linked_student_id: studentId || null };
  profiles[name] = profile;
  return { profile, password };
}

try {
  const teacher = await user('teacher', 'teacher');
  await checked(admin.from('toan6_classes').insert({ id: classId, name: 'QA disposable', school_year: '2026-2027', teacher_auth_id: teacher.profile.auth_user_id }));
  const a = await user('studentA', 'student');
  const b = await user('studentB', 'student');
  const parent = await user('parentA', 'parent', a.profile.id);
  await checked(admin.from('toan6_profiles').insert([teacher.profile, a.profile, b.profile, parent.profile]));
  for (const [name, fixture] of Object.entries({ teacher, studentA: a, studentB: b, parentA: parent })) {
    const login = await api.dispatch('login', { username: fixture.profile.username, password: fixture.password, role: fixture.profile.role }, null, prefix + name);
    sessions[name] = login.session.access_token;
    assert.equal(login.snapshot.user.id, fixture.profile.id);
    if (fixture.profile.role !== 'teacher') assert.deepEqual(login.snapshot.students.map(s => s.id), [fixture.profile.role === 'parent' ? a.profile.id : fixture.profile.id]);
  }
  const call = (name, op, body = {}) => api.dispatch(op, body, sessions[name]);
  step = 'bank and assignment';
  const q = { id: prefix + '-q', chapterId: 6, chapterTitle: 'Chương VI: Phân số', lessonId: 23, lessonTitle: 'Bài 23: Mở rộng phân số', type: 'fill_in_the_blank', level: 'nhan_biet', content: '1/2 = ?', correctAnswers: ['0.5'], solutionSteps: [{ step: 1, title: 'Lời giải', explanation: '1/2 = 0,5' }], estimatedSeconds: 60, difficultyScore: 0.5 };
  await call('teacher', 'saveQuestion', { question: q });
  await denied(call('studentA', 'saveQuestion', { question: q }));
  const bank = (await call('studentA', 'snapshot')).snapshot.bank;
  assert.equal(bank.length, 1); assert.equal('correctAnswers' in bank[0], false);
  const exam = { id: prefix + '-exam', title: 'QA assignment', type: 'homework', questions: [q], timeLimitMinutes: 20, maxRetries: 1, deadline: new Date(Date.now() + 3600000).toISOString(), showSolutionAfter: 'deadline', assignedTo: [a.profile.id] };
  await call('teacher', 'createExam', { exam });
  assert.equal((await call('studentB', 'snapshot')).snapshot.exams.length, 0);
  assert.equal('correctAnswers' in (await call('studentA', 'snapshot')).snapshot.exams[0].questions[0], false);
  await denied(call('studentB', 'startExam', { examId: exam.id }));
  step = 'server timed submission';
  const attempt = (await call('studentA', 'startExam', { examId: exam.id })).result;
  assert.ok(Date.parse(attempt.ends_at) > Date.parse(attempt.started_at));
  assert.equal((await call('studentA', 'startExam', { examId: exam.id })).result.id, attempt.id);
  await denied(call('studentB', 'submit', { attemptId: attempt.id, answers: { [q.id]: '0.5' } }));
  const submission = (await call('studentA', 'submit', { attemptId: attempt.id, answers: { [q.id]: '9' }, score: 10, correctCount: 1 })).result;
  assert.equal(submission.score, 0); assert.equal(submission.correctCount, 0);
  const repeated = (await call('studentA', 'submit', { attemptId: attempt.id, answers: { [q.id]: '0.5' } })).result;
  assert.equal(repeated.id, submission.id); assert.equal(repeated.score, 0);
  const student = (await call('studentA', 'snapshot')).snapshot;
  assert.equal(student.submissions.length, 1); assert.equal(student.wrong.length, 1);
  assert.equal(student.wrong[0].correctAnswer, ''); assert.equal('correctAnswers' in student.wrong[0].question, false);
  const teacherSnapshot = (await call('teacher', 'snapshot')).snapshot;
  assert.equal(teacherSnapshot.submissions[0].answers[0].selectedAnswerText, '9');
  assert.equal((await call('parentA', 'snapshot')).snapshot.submissions[0].studentId, a.profile.id);
  assert.equal((await call('studentB', 'snapshot')).snapshot.submissions.length, 0);
  step = 'parent messages and reminders';
  const messageId = prefix + '-message';
  await call('parentA', 'sendMessage', { id: messageId, parentId: parent.profile.id, body: 'QA parent message' });
  await call('parentA', 'sendMessage', { id: messageId, parentId: parent.profile.id, body: 'QA parent message' });
  assert.equal((await call('teacher', 'snapshot')).snapshot.messages.length, 1);
  assert.equal((await call('teacher', 'snapshot')).snapshot.messages[0].readAt, undefined);
  await call('teacher', 'readMessages', { parentId: parent.profile.id });
  assert.ok((await call('parentA', 'snapshot')).snapshot.messages[0].readAt);
  await denied(call('studentA', 'sendMessage', { parentId: parent.profile.id, body: 'Blocked' }));
  await call('parentA', 'remindChild');
  assert.equal((await call('studentA', 'snapshot')).snapshot.reminders.length, 1);
  assert.equal((await call('studentB', 'snapshot')).snapshot.reminders.length, 0);
  await call('studentA', 'readReminders');
  assert.ok((await call('studentA', 'snapshot')).snapshot.reminders[0].readAt);
  step = 'RLS and draft isolation';
  const publicClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY,
    { global: { headers: { Authorization: 'Bearer ' + sessions.studentA } }, auth: { persistSession: false, autoRefreshToken: false } });
  const forbidden = await publicClient.rpc('toan6_begin_attempt', { p_student: a.profile.id, p_exam: exam.id });
  assert.ok(forbidden.error);
  const rawBank = await publicClient.from('toan6_questions').select('payload');
  assert.ok(rawBank.error || rawBank.data.length === 0);
  await call('studentA', 'saveDraft', { id: 'draft', payload: { answers: { [q.id]: '9' } } });
  assert.equal(Object.keys((await call('studentA', 'snapshot')).snapshot.drafts).length, 1);
  assert.equal(Object.keys((await call('studentB', 'snapshot')).snapshot.drafts).length, 0);
  step = 'parent provisioning and password change';
  const parentPassword = randomUUID() + 'aA1!';
  const linked = (await call('teacher', 'linkParent', { studentId: b.profile.id, input: { fullName: 'QA parent B', username: prefix + 'linkedparent', phone: '' }, password: parentPassword })).result;
  authIds.add(linked.auth_user_id);
  const parentLogin = await api.dispatch('login', { username: linked.username, password: parentPassword, role: 'parent' }, null, prefix + 'linkedparent');
  assert.deepEqual(parentLogin.snapshot.students.map(s => s.id), [b.profile.id]);
  await denied(call('studentA', 'linkParent', { studentId: b.profile.id, input: {}, password: parentPassword }));
  const newPassword = randomUUID() + 'aA1!';
  const changed = (await call('studentB', 'changePassword', { oldPassword: b.password, newPassword })).result;
  assert.ok(changed.session.access_token);
  const updatedLogin = await api.dispatch('login', { username: b.profile.username, password: newPassword, role: 'student' }, null, prefix + 'updated');
  assert.equal(updatedLogin.snapshot.user.id, b.profile.id);
  console.log('PASS: assignment delivery, server grading, idempotent submit, answer hiding, role isolation, parent messages, reminders, drafts and RLS.');
  if (process.argv.includes('--ui')) {
    console.log('DISPOSABLE_UI_FIXTURES ' + JSON.stringify({ teacher: { username: teacher.profile.username, password: teacher.password }, student: { username: a.profile.username, password: a.password }, parent: { username: parent.profile.username, password: parent.password } }));
    console.log('Waiting for Enter to clean up the disposable UI class.');
    await new Promise(resolve => { process.stdin.once('data', resolve); process.stdin.resume(); });
    process.stdin.pause();
  }
} catch (e) {
  console.error('FAIL at ' + step + ': ' + e.message + (e.cause ? ' [' + e.cause.code + ': ' + e.cause.message + ']' : '')); process.exitCode = 1;
} finally {
  // All cleanup queries are restricted to this random disposable class.
  for (const table of ['toan6_attempts', 'toan6_wrong_questions', 'toan6_drafts', 'toan6_reminders', 'toan6_messages', 'toan6_submissions', 'toan6_exams', 'toan6_questions', 'toan6_profiles', 'toan6_classes']) {
    const query = admin.from(table).delete().eq(table === 'toan6_classes' ? 'id' : 'class_id', classId);
    const { error } = await query;
    if (error) { console.error('Fixture cleanup failed: ' + table); process.exitCode = 1; }
  }
  for (const id of authIds) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) { console.error('Fixture Auth cleanup failed'); process.exitCode = 1; }
  }
  console.log('Disposable fixture cleanup completed; real class data was not modified.');
}
