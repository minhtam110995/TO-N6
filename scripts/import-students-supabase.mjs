import { readFile } from 'node:fs/promises';
import { pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const root = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: root + '.env.local', quiet: true });
const file = process.argv[2];
const apply = process.argv.includes('--apply');
const expectedTeacher = 'fe5b3bef-86aa-437a-b501-9cee2ef5e474';
const classId = 'class-6d';
let step = 'preflight';

function assert(condition, message) { if (!condition) throw new Error(message); }

try {
  assert(file, 'Provide a private class backup JSON path.');
  const backup = JSON.parse(await readFile(file, 'utf8'));
  assert(backup.format === 'toan6-local-backup' && backup.version === 1 && backup.classId === classId, 'Unexpected backup format or class.');
  const students = JSON.parse(backup.records.toan6_students || '[]');
  const parents = JSON.parse(backup.records.toan6_parents || '[]');
  const credentials = JSON.parse(backup.records.toan6_credentials || '{}');
  assert(Array.isArray(students) && students.length === 42, 'Expected exactly 42 students.');
  assert(Array.isArray(parents) && parents.length === 0, 'Parent records require a separate migration.');
  const ids = new Set(), emails = new Set();
  const prepared = students.map(student => {
    assert(student.role === 'student' && student.classId === classId && student.status === 'active', 'Unexpected student role, class or status.');
    assert(typeof student.id === 'string' && !ids.has(student.id), 'Duplicate or missing student ID.'); ids.add(student.id);
    assert(typeof student.username === 'string' && /^[A-Za-z0-9_]+$/.test(student.username), 'Invalid username.');
    assert(typeof student.fullName === 'string' && student.fullName.trim(), 'Missing student name.');
    const email = student.username.toLowerCase() + '@students.toan6d.invalid';
    assert(!emails.has(email), 'Duplicate student login.'); emails.add(email);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(student.birthDate || '') && new Date(student.birthDate).toISOString().slice(0,10) === student.birthDate, 'Invalid birth date.');
    const [year, month, day] = student.birthDate.split('-');
    const password = day + month + year;
    const credential = credentials[student.id];
    assert(credential && Array.isArray(credential.salt) && /^[a-f0-9]{64}$/.test(credential.hash || ''), 'Missing local password hash.');
    const derived = pbkdf2Sync(password, Buffer.from(credential.salt), 100000, 32, 'sha256');
    assert(timingSafeEqual(derived, Buffer.from(credential.hash, 'hex')), 'A student password has changed; do not reset it.');
    return { student, email, password };
  });
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  assert(url?.startsWith('https://') && secret, 'Missing server configuration.');
  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  step = 'teacher-check';
  const { data: teacher, error: teacherError } = await admin.from('toan6_profiles')
    .select('id,auth_user_id,class_id,role,status').eq('id','user-teacher-01').single();
  assert(!teacherError && teacher?.auth_user_id === expectedTeacher && teacher.class_id === classId && teacher.role === 'teacher' && teacher.status === 'active', 'Teacher linkage not verified.');
  const { data: schoolClass, error: classError } = await admin.from('toan6_classes').select('teacher_auth_id').eq('id',classId).single();
  assert(!classError && schoolClass?.teacher_auth_id === expectedTeacher, 'Class ownership not verified.');
  const { data: profiles, error: profilesError } = await admin.from('toan6_profiles').select('id,auth_user_id,username,class_id,role');
  assert(!profilesError && profiles.length < 1000, 'Unable to safely verify existing profiles.');
  step = 'auth-preflight';
  const authUsers = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    assert(!error, 'Unable to verify existing Auth users.'); authUsers.push(...data.users);
    if (data.users.length < 1000) break;
  }
  // Existing credentials are never overwritten. Resume only our own provisioning.
  for (const row of prepared) {
    const profile = profiles.find(p => p.id === row.student.id);
    assert(!profiles.some(p => p.id !== row.student.id && p.username.toLowerCase() === row.student.username.toLowerCase()), 'Username conflict.');
    const existing = authUsers.find(u => u.email?.toLowerCase() === row.email);
    if (existing) {
      assert(existing.app_metadata?.toan6_source_id === row.student.id && existing.app_metadata?.toan6_class_id === classId, 'Existing Auth login belongs to another provisioning process.');
      assert(!profile || (profile.class_id === classId && profile.role === 'student' && profile.auth_user_id === existing.id && profile.username === row.student.username), 'Profile linkage conflict.');
    } else assert(!profile, 'Existing student profile has no matching Auth login.');
    row.existing = existing;
  }
  console.log(JSON.stringify({ phase:'preflight', validatedStudents:prepared.length, existingAccounts:prepared.filter(r=>r.existing).length, applying:apply }));
  if (apply) {
    const rows = [];
    let created = 0;
    for (const row of prepared) {
      let user = row.existing;
      if (!user) {
        step = 'create-student-auth';
        const { data, error } = await admin.auth.admin.createUser({ email:row.email, password:row.password, email_confirm:true,
          app_metadata:{ toan6_source_id:row.student.id, toan6_class_id:classId } });
        assert(!error && data.user, 'Unable to provision an account. Rerun after checking Auth; do not delete accounts.');
        user = data.user; created++;
      }
      rows.push({ id:row.student.id, auth_user_id:user.id, class_id:classId, username:row.student.username,
        full_name:row.student.fullName, role:'student', birth_date:row.student.birthDate, status:'active' });
    }
    step = 'save-profiles';
    const { error } = await admin.from('toan6_profiles').upsert(rows,{onConflict:'id',ignoreDuplicates:true});
    assert(!error, 'Profiles were not saved. Accounts can be resumed safely; passwords were not reset.');
    step = 'verify-profiles';
    const { data: saved, error: savedError } = await admin.from('toan6_profiles').select('id,auth_user_id,username,class_id,role,birth_date,full_name,status').eq('class_id',classId).eq('role','student');
    assert(!savedError && saved.length === rows.length && rows.every(row=>saved.some(s=>Object.keys(row).every(key=>s[key]===row[key]))), 'Stored profiles do not match the roster.');
    // Check a real student login and RLS without revealing their password or data.
    step = 'verify-student-login';
    const publicKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
    assert(publicKey, 'Missing public key for student verification.');
    const studentClient = createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    const { error: loginError } = await studentClient.auth.signInWithPassword({email:prepared[0].email,password:prepared[0].password});
    assert(!loginError, 'Student login failed.');
    try {
      const { data: own, error: ownError } = await studentClient.from('toan6_profiles').select('id');
      assert(!ownError && own.length===1 && own[0].id===prepared[0].student.id, 'Student profile isolation failed.');
      const { data: questions, error: questionError } = await studentClient.from('toan6_questions').select('id');
      assert(!questionError && questions.length===0, 'Student answer-key protection failed.');
    } finally { await studentClient.auth.signOut({scope:'local'}); }
    console.log(JSON.stringify({phase:'verified',students:saved.length,newAuthAccounts:created,studentLogin:true,studentIsolation:true,answerKeysProtected:true,localDataUnchanged:true}));
  }
} catch {
  console.error(JSON.stringify({phase:step,success:false,message:'Migration stopped. No existing password was overwritten. Check this phase before retrying.'}));
  process.exitCode=1;
}
