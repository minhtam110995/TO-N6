const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { transformSync } = require('esbuild');

function fixture(initialData = {}) {
  const data = new Map(Object.entries(initialData));
  const localStorage = { get length() { return data.size; }, key: index => [...data.keys()][index] ?? null, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) };
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} }; cache.set(filename, module);
    const code = transformSync(fs.readFileSync(filename, 'utf8'), { loader: filename.endsWith('.tsx') ? 'tsx' : 'ts', format: 'cjs', target: 'es2022' }).code;
    vm.runInNewContext(code, { exports: module.exports, module, localStorage, console, crypto: require('node:crypto').webcrypto, TextEncoder, require: name => {
      if (!name.startsWith('.')) return require(name);
      const base = path.resolve(path.dirname(filename), name);
      return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
    } }, { filename });
    return module.exports;
  }
  return { storage: load(path.join(__dirname, '../src/services/storage.ts')), localStorage, snapshot: () => Object.fromEntries(data), load: name => load(path.join(__dirname, '../src', name)) };
}

test('cloud store reads only the authenticated snapshot and never optimistically writes local records', async () => {
  const f = fixture();
  const bridge = f.load('services/cloudStore.ts');
  const user = { id: 'cloud-student', role: 'student', username: 'cloud', fullName: 'Cloud student', status: 'active' };
  const snapshot = { user, students: [user], parents: [], exams: [], submissions: [], wrong: [], weakTopics: [], bank: [], messages: [], reminders: [], drafts: {}, attempts: [] };
  bridge.setCloudSnapshot(snapshot);
  const before = f.snapshot();
  bridge.connectCloud(async () => { throw new Error('offline'); });
  assert.equal(f.storage.getCurrentUser().id, user.id);
  assert.deepEqual(f.storage.getStudents().map(s => s.id), [user.id]);
  assert.equal(f.storage.getQuestionBank().length, 0);
  await assert.rejects(f.storage.createExam({ id: 'pending' }), /offline/);
  assert.equal(f.storage.getExams().length, 0);
  assert.deepEqual(f.snapshot(), before);
  bridge.setCloudSnapshot({ ...snapshot, bank: [{ id: 'teacher-secret' }], user: { ...user, id: 'teacher', role: 'teacher' } });
  const { bank, ...another } = snapshot;
  bridge.setCloudSnapshot(another);
  assert.equal(f.storage.getQuestionBank().length, 0);
  bridge.clearCloudStore();
});

test('students receive class assignments in their home screen and keep them after reopening on the same browser', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const f = fixture();
  const { CURRENT_TEACHER } = f.load('data/mockData.ts');
  const a = f.storage.addStudent({ fullName: 'Student A', username: 'delivery_a' }).student;
  const b = f.storage.addStudent({ fullName: 'Student B', username: 'delivery_b' }).student;
  const questions = f.storage.generateExamQuestions(1, [1], 2, { nhanBietPercent: 100, thongHieuPercent: 0, vanDungPercent: 0, vanDungCaoPercent: 0 });
  const base = { questions, type: 'test', chapterId: 1, lessonIds: [1], assignedTo: 'all', createdBy: CURRENT_TEACHER.id, createdAt: new Date().toISOString(), deadline: new Date(Date.now() + 86400000).toISOString(), status: 'active', timeLimitMinutes: 20, maxRetries: 1 };
  let updates = 0;
  const unsubscribe = f.storage.subscribeToStore(() => updates++);
  f.storage.createExam({ ...base, id: 'delivery-class', title: 'Delivery to whole class' });
  assert.equal(updates, 1);
  unsubscribe();
  f.storage.createExam({ ...base, id: 'delivery-private', title: 'Delivery only to A', assignedTo: [a.id] });
  f.storage.createExam({ ...base, id: 'delivery-practice', title: 'Not a class assignment', type: 'practice' });
  const renderHome = (fixture, student) => {
    fixture.storage.setCurrentUser(student);
    const { StudentHome } = fixture.load('components/student/StudentHome.tsx');
    return renderToStaticMarkup(React.createElement(StudentHome, { onStartExam: () => {}, onNavigateTab: () => {} }));
  };
  const htmlA = renderHome(f, a);
  assert.ok(htmlA.includes('Delivery to whole class'));
  assert.ok(htmlA.includes('Delivery only to A'));
  assert.ok(htmlA.includes('Làm bài ngay'));
  assert.ok(!htmlA.includes('Not a class assignment'));
  const htmlB = renderHome(f, b);
  assert.ok(htmlB.includes('Delivery to whole class'));
  assert.ok(!htmlB.includes('Delivery only to A'));
  const reopened = fixture(f.snapshot());
  assert.ok(renderHome(reopened, b).includes('Delivery to whole class'));
  assert.equal(reopened.storage.getExams().find(e => e.id === 'delivery-class').questions.length, 2);
  const otherBrowser = fixture();
  assert.equal(otherBrowser.storage.getExams().length, 0);
});

test('saving a submission preserves other students wrong questions and resolves correct retries', () => {
  const { storage, localStorage } = fixture();
  const question = storage.getQuestionBank()[0];
  const wrong = studentId => ({ id: 'wrong-' + studentId, questionId: question.id, studentId, question, wrongCount: 1, isResolved: false });
  localStorage.setItem('toan6_wrong_questions', JSON.stringify([wrong('a'), wrong('b')]));
  storage.saveSubmission({ id: 'test-correct', studentId: 'a', examId: 'test', submittedAt: new Date().toISOString(), answers: [{ questionId: question.id, isCorrect: true }] });
  assert.equal(storage.getWrongQuestions('b').length, 1);
  assert.equal(storage.getWrongQuestions('a')[0].isResolved, true);
  storage.saveSubmission({ id: 'test-wrong', studentId: 'a', examId: 'test', submittedAt: new Date().toISOString(), answers: [{ questionId: question.id, isCorrect: false, selectedAnswerText: 'wrong' }] });
  assert.equal(storage.getWrongQuestions('b').length, 1);
  assert.equal(storage.getWrongQuestions('a')[0].wrongCount, 2);
  assert.equal(storage.getWrongQuestions('a')[0].wrongAnswer, 'wrong');
});

test('clean defaults contain no demo class data and preserve questions on reset', () => {
  const { storage } = fixture();
  assert.equal(storage.getStudents().length, 0); assert.equal(storage.getParents().length, 0);
  assert.equal(storage.getExams().length, 0); assert.equal(storage.getSubmissions().length, 0);
  const count = storage.getQuestionBank().length;
  storage.saveQuestion({ ...storage.getQuestionBank()[0], id: 'custom-kept' });
  storage.resetAllDataToDefault();
  assert.equal(storage.getQuestionBank().length, count + 1);
  assert.ok(storage.getQuestionBank().some(q => q.id === 'custom-kept'));
});

test('migration removes old demo records but keeps the existing question bank', () => {
  const { storage } = fixture({ toan6_data_version: 'old-demo', toan6_students: '[{"id":"old"}]', toan6_submissions: '[{"id":"old-sub"}]', toan6_questions_bank: '[{"id":"question-to-keep"}]' });
  assert.equal(storage.getStudents().length, 0); assert.equal(storage.getSubmissions().length, 0);
  assert.ok(storage.getQuestionBank().some(q => q.id === 'question-to-keep'));
  assert.equal(storage.getQuestionBank().length, 1968);
});

test('assignment, submission, wrong book, teacher review, parent link and reminders share the same records', () => {
  const { storage, load } = fixture(); const reminders = load('services/reminders.ts');
  const { CURRENT_TEACHER } = load('data/mockData.ts');
  const { student, parent } = storage.addStudent({ fullName: 'QA Student', username: 'qa_student' }, { fullName: 'QA Parent', phone: '0900000003' });
  const questions = storage.generateExamQuestions(1, [1], 2, { nhanBietPercent: 100, thongHieuPercent: 0, vanDungPercent: 0, vanDungCaoPercent: 0 });
  const exam = { id: 'exam-qa', title: 'QA', questions, assignedTo: [student.id], type: 'test', chapterId: 1 };
  storage.createExam(exam);
  storage.setCurrentUser(student);
  assert.ok(storage.getExams().some(e => e.assignedTo.includes(student.id)));
  storage.saveSubmission({ id: 'submission-qa', examId: exam.id, studentId: student.id, studentName: student.fullName, score: 5, submittedAt: new Date().toISOString(), answers: questions.map((q, i) => ({ questionId: q.id, selectedAnswerText: i ? 'wrong' : '6', isCorrect: !i })) });
  storage.setCurrentUser(CURRENT_TEACHER);
  assert.equal(storage.getSubmissions().find(s => s.id === 'submission-qa').answers[1].selectedAnswerText, 'wrong');
  storage.setCurrentUser(parent);
  assert.equal(storage.getSubmissions().filter(s => s.studentId === parent.studentId).length, 1);
  assert.equal(storage.getWrongQuestions(parent.studentId).length, 1);
  reminders.remindChild();
  storage.setCurrentUser(student); assert.equal(reminders.getReminders().filter(r => !r.readAt).length, 1);
  reminders.readReminders(); assert.equal(reminders.getReminders().filter(r => !r.readAt).length, 0);
});

test('bank has 2000 unique exercises evenly divided across nine chapters and covers every lesson', () => {
  const { load } = fixture(); const { ADDITIONAL_QUESTIONS, CHAPTER_QUESTION_TARGETS } = load('data/additionalQuestions.ts');
  const { CHAPTERS_DATA, SEED_QUESTIONS, isEquivalentAnswer } = load('data/seedQuestions.ts');
  const bank = [...SEED_QUESTIONS, ...ADDITIONAL_QUESTIONS];
  assert.equal(bank.length, 2000); assert.equal(new Set(bank.map(q => q.id)).size, 2000);
  assert.equal(new Set(bank.map(q => q.content)).size, 2000);
  for (const chapter of CHAPTERS_DATA) {
    const list = ADDITIONAL_QUESTIONS.filter(q => q.chapterId === chapter.id);
    assert.equal(bank.filter(q => q.chapterId === chapter.id).length, CHAPTER_QUESTION_TARGETS.find(t => t.chapterId === chapter.id).count);
    assert.ok([222, 223].includes(bank.filter(q => q.chapterId === chapter.id).length));
    assert.equal(new Set(list.map(q => q.content)).size, list.length);
    chapter.lessons.forEach(lesson => assert.ok(list.some(q => q.lessonId === lesson.id)));
    list.forEach(q => { assert.ok(q.solutionSteps[0].explanation); assert.ok(isEquivalentAnswer(q.correctAnswers[0], q.correctAnswers)); });
  }
  assert.ok(isEquivalentAnswer('-0,5', ['-1/2']));
  assert.equal(isEquivalentAnswer('1/2abc', ['0.5']), false);
  assert.equal(isEquivalentAnswer('12 rubbish', ['12']), false);
  assert.equal(isEquivalentAnswer('0.5009', ['0.5']), false);
});

test('expanded place values and angles remain valid for all generated variants', () => {
  const { load } = fixture(); const { ADDITIONAL_QUESTIONS } = load('data/additionalQuestions.ts');
  for (const q of ADDITIONAL_QUESTIONS.filter(q => q.lessonId === 2)) {
    const number = Number(q.content.match(/Trong số (\d+)/)[1]);
    assert.equal(Number(q.correctAnswers[0]), Math.floor(number / 1000) % 10 * 1000);
  }
  for (const q of ADDITIONAL_QUESTIONS.filter(q => q.lessonId === 37)) {
    const values = [...q.content.matchAll(/(\d+)°/g)].map(m => Number(m[1]));
    assert.ok(values[0] > 0 && values[0] < 180 && values[1] > 0 && values[1] < values[0]);
    assert.equal(Number(q.correctAnswers[0]), values[0] - values[1]);
  }
});

test('upgrading an existing bank preserves custom questions, accounts, passwords and assignments', () => {
  const initial = fixture(); const { CURRENT_TEACHER } = initial.load('data/mockData.ts');
  initial.storage.saveQuestion({ ...initial.storage.getQuestionBank()[0], id: 'teacher-custom', content: 'Custom question kept' });
  const student = initial.storage.addStudent({ fullName: 'Keep me', username: 'keep_me' }).student;
  initial.localStorage.setItem('toan6_credentials', JSON.stringify({ [CURRENT_TEACHER.id]: { hash: 'kept' } }));
  initial.storage.createExam({ id: 'kept-exam', type: 'test' });
  initial.localStorage.removeItem('toan6_bank_2000_v2');
  initial.localStorage.removeItem('toan6_class_6d_v1');
  initial.localStorage.setItem('toan6_students', JSON.stringify([{ ...student, className: 'Lớp 6A', classId: 'class-6a4' }]));
  const upgraded = fixture(initial.snapshot());
  assert.equal(upgraded.storage.getQuestionBank().length, 2001);
  assert.ok(upgraded.storage.getQuestionBank().some(q => q.id === 'teacher-custom'));
  assert.equal(upgraded.storage.getStudents()[0].id, student.id);
  assert.equal(upgraded.storage.getStudents()[0].className, 'Lớp 6D');
  assert.equal(upgraded.storage.getStudents()[0].classId, 'class-6d');
  assert.equal(upgraded.storage.getExams()[0].id, 'kept-exam');
  assert.ok(upgraded.localStorage.getItem('toan6_credentials').includes('kept'));
});

test('file import validates answers, classifies lessons, and deduplicates', () => {
  const { storage, load } = fixture(); const { parseQuestionFile } = load('services/questionImport.ts');
  const parsed = parseQuestionFile('content,answer,lessonId,solution\r\n"Tính 17/23 + 2/23",19/23,25,"Cộng tử số"', 'csv');
  assert.equal(parsed[0].chapterId, 6); assert.equal(parsed[0].lessonId, 25);
  assert.equal(storage.importQuestions(parsed), 1); assert.equal(storage.importQuestions(parsed), 0);
  assert.equal(parseQuestionFile(JSON.stringify([{ content: 'Tìm trung điểm của đoạn thẳng.', answer: '3' }]), 'json')[0].lessonId, 35);
  assert.equal(parseQuestionFile(JSON.stringify([{ content: 'Tính giá trị.', answer: '3' }]), 'json')[0].lessonId, 0);
  assert.throws(() => parseQuestionFile(JSON.stringify([{ content: 'Thiếu đáp án' }]), 'json'));
  assert.throws(() => parseQuestionFile(JSON.stringify([{ content: 'Sai chương', answer: '3', chapterId: 1, lessonId: 25 }]), 'json'));
  const roundtrip = parseQuestionFile(JSON.stringify(storage.getQuestionBank()), 'json');
  assert.equal(roundtrip.length, storage.getQuestionBank().length);
});

test('linked accounts use individual passwords and exchange messages without leaking to other parents', async () => {
  const { storage, load } = fixture(); const auth = load('services/localAuth.ts'); const messages = load('services/messages.ts');
  const { CURRENT_TEACHER } = load('data/mockData.ts');
  const a = storage.addStudent({ fullName: 'Test A', username: 'test_a' }, { fullName: 'Parent A', phone: '0900000001' });
  const b = storage.addStudent({ fullName: 'Test B', username: 'test_b' }, { fullName: 'Parent B', phone: '0900000002' });
  assert.equal(a.student.parentId, a.parent.id); assert.equal(a.parent.studentId, a.student.id);
  assert.equal(a.parent.username, '0900000001');
  auth.saveCredentials([{ userId: a.student.id, credential: await auth.makeCredential('Testing123') }]);
  assert.ok(await auth.verifyPassword(a.student, 'Testing123')); assert.equal(await auth.verifyPassword(a.student, 'wrong'), false);
  await assert.rejects(auth.changePassword(a.student, 'wrong', 'Changed123'));
  await auth.changePassword(a.student, 'Testing123', 'Changed123');
  assert.equal(await auth.verifyPassword(a.student, 'Testing123'), false); assert.ok(await auth.verifyPassword(a.student, 'Changed123'));
  storage.setCurrentUser(a.parent); messages.sendMessage(a.parent.id, 'Trao đổi kiểm thử');
  storage.setCurrentUser(b.parent); assert.equal(messages.getMessages().length, 0);
  assert.throws(() => messages.sendMessage(a.parent.id, 'Không được phép'));
  storage.setCurrentUser(CURRENT_TEACHER); assert.equal(messages.unreadMessageCount(), 1);
  messages.markMessagesRead(a.parent.id); assert.equal(messages.unreadMessageCount(), 0);
  messages.sendMessage(a.parent.id, 'Cô đã nhận');
  storage.setCurrentUser(a.parent); assert.equal(messages.getMessages().length, 2); assert.equal(messages.unreadMessageCount(), 1);
});

test('generation respects selected lesson, zero percentages, and unique question IDs', () => {
  const { storage, localStorage } = fixture();
  const template = storage.getQuestionBank()[0];
  const questions = Array.from({ length: 8 }, (_, i) => ({ ...template, id: 'q-' + i, chapterId: 6, lessonId: i < 4 ? 23 : 24, level: 'nhan_biet' }));
  localStorage.setItem('toan6_questions_bank', JSON.stringify(questions));
  const matrix = { nhanBietPercent: 100, thongHieuPercent: 0, vanDungPercent: 0, vanDungCaoPercent: 0 };
  const generated = storage.generateExamQuestions(6, [23], 4, matrix);
  assert.equal(generated.length, 4);
  assert.equal(new Set(generated.map(q => q.id)).size, 4);
  assert.ok(generated.every(q => q.lessonId === 23));
  assert.throws(() => storage.generateExamQuestions(6, [23], 5, matrix));
  assert.throws(() => storage.generateExamQuestions(6, [23], 4, { ...matrix, nhanBietPercent: 50, thongHieuPercent: 50 }));
});

test('matrix suggestion fits every chapter and the first two lessons of chapter I', () => {
  const { storage, load } = fixture(); const { suggestMatrix, matrixCounts } = load('services/examMatrix.ts');
  const bank = storage.getQuestionBank();
  const firstLessons = bank.filter(q => q.chapterId === 1 && [1, 2].includes(q.lessonId));
  const suggested = suggestMatrix(firstLessons, 4);
  assert.equal(suggested.nhanBietPercent, 100); assert.equal(suggested.vanDungCaoPercent, 0);
  assert.equal(storage.generateExamQuestions(1, [1, 2], 4, suggested).length, 4);
  assert.throws(() => storage.generateExamQuestions(1, [1, 2], 4, { nhanBietPercent: 25, thongHieuPercent: 25, vanDungPercent: 25, vanDungCaoPercent: 25 }));
  for (let chapter = 1; chapter <= 9; chapter++) {
    const pool = bank.filter(q => q.chapterId === chapter);
    for (let count = 1; count <= Math.min(100, pool.length); count++) {
      const matrix = suggestMatrix(pool, count);
      assert.equal(Object.values(matrix).reduce((a, b) => a + b, 0), 100);
      assert.equal(matrixCounts(matrix, count).reduce((a, b) => a + b, 0), count);
      assert.equal(storage.generateExamQuestions(chapter, [], count, matrix).length, count);
    }
  }
});

test('reset leaves unrelated browser storage intact', () => {
  const { storage, localStorage } = fixture();
  localStorage.setItem('another-app', 'keep'); storage.resetAllDataToDefault();
  assert.equal(localStorage.getItem('another-app'), 'keep');
});

test('reset clears all trial class records and drafts but preserves teacher credentials and the exact question bank', async () => {
  const f = fixture(); const auth = f.load('services/localAuth.ts');
  const { CURRENT_TEACHER } = f.load('data/mockData.ts');
  const { student, parent } = f.storage.addStudent({ fullName: 'Trial', username: 'trial' }, { fullName: 'Trial parent', phone: '0900000010' });
  auth.saveCredentials([{ userId: CURRENT_TEACHER.id, credential: await auth.makeCredential('TeacherChanged123') }, { userId: student.id, credential: await auth.makeCredential('Student123') }]);
  f.storage.setCurrentUser(parent); f.load('services/messages.ts').sendMessage(parent.id, 'Trial chat');
  f.storage.createExam({ id: 'trial', type: 'test' });
  f.localStorage.setItem('toan6_submissions', '[{"id":"trial"}]');
  for (const key of ['draft_exam_trial', 'active_exam_trial', 'teacher_exam_draft_v2', 'parent_contact_draft_trial']) f.localStorage.setItem(key, 'trial');
  const bank = f.localStorage.getItem('toan6_questions_bank');
  f.storage.resetAllDataToDefault();
  assert.equal(f.storage.getStudents().length, 0); assert.equal(f.storage.getParents().length, 0);
  assert.equal(f.storage.getExams().length, 0); assert.equal(f.storage.getSubmissions().length, 0);
  assert.equal(f.localStorage.getItem('toan6_messages'), null);
  for (const key of ['draft_exam_trial', 'active_exam_trial', 'teacher_exam_draft_v2', 'parent_contact_draft_trial']) assert.equal(f.localStorage.getItem(key), null);
  assert.equal(f.localStorage.getItem('toan6_questions_bank'), bank);
  assert.ok(await auth.verifyPassword(CURRENT_TEACHER, 'TeacherChanged123'));
  assert.equal(await auth.verifyPassword(student, 'Student123'), false);
});

test('math text stacks fractions without changing prose, units or chained dates', () => {
  const { load } = fixture();
  const { splitMathText } = load('services/mathText.ts');
  const parts = splitMathText('Tìm x để x/22 = 9/11.');
  assert.equal(JSON.stringify(parts), JSON.stringify(['Tìm x để ', { top: 'x', bottom: '22' }, ' = ', { top: '9', bottom: '11' }, '.']));
  assert.equal(JSON.stringify(splitMathText('(-3)/4 + 2/(-5)')), JSON.stringify([{ top: '(-3)', bottom: '4' }, ' + ', { top: '2', bottom: '(-5)' }]));
  for (const text of ['Vận tốc 12 km/h', 'Ngày 10/10/2026', 'Lớp 6D', 'https://example.com']) assert.equal(JSON.stringify(splitMathText(text)), JSON.stringify([text]));
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { MathText } = load('components/common/MathRenderer.tsx');
  const html = renderToStaticMarkup(React.createElement(MathText, { text: 'x/22 = 9/11' }));
  assert.equal((html.match(/border-b-2/g) || []).length, 2);
  assert.ok(!html.includes('x/22'));
});

test('new exam starts blank and only shows lesson choices after selecting a chapter, while saved drafts survive', () => {
  const f = fixture();
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const render = () => renderToStaticMarkup(React.createElement(f.load('components/teacher/CreateExam.tsx').CreateExam, { onSuccess: () => {} }));
  const empty = render();
  assert.ok(empty.includes('value="0" selected=""'));
  assert.ok(empty.includes('placeholder="Nhập tên đề"'));
  assert.ok(!empty.includes('<legend>Bài học</legend>'));
  assert.ok(!empty.includes('value="Luyện tập phân số"'));
  f.localStorage.setItem('teacher_exam_draft_v2', JSON.stringify({ config: { title: 'My saved draft', chapter: 1, lessons: [1], count: 4, time: 20, retries: 1, deadline: '2026-12-01T10:00', shuffleQuestions: true, shuffleOptions: true, solution: 'submit', matrix: { nhanBietPercent: 100, thongHieuPercent: 0, vanDungPercent: 0, vanDungCaoPercent: 0 } } }));
  const draft = render();
  assert.ok(draft.includes('value="My saved draft"'));
  assert.ok(draft.includes('<legend>Bài học</legend>'));
  assert.ok(draft.includes('Bài 1:'));
  assert.ok(!draft.includes('Bài 23:'));
});

test('parent messages notify the store and remain unread for the teacher until opening that conversation', () => {
  const f = fixture(); const messages = f.load('services/messages.ts');
  const { CURRENT_TEACHER } = f.load('data/mockData.ts');
  const a = f.storage.addStudent({ fullName: 'A', username: 'notify_a' }, { fullName: 'Parent A', phone: '0900000007' });
  const b = f.storage.addStudent({ fullName: 'B', username: 'notify_b' }, { fullName: 'Parent B', phone: '0900000008' });
  let notifications = 0;
  const unsubscribe = f.storage.subscribeToStore(() => notifications++);
  f.storage.setCurrentUser(a.parent); const before = notifications;
  messages.sendMessage(a.parent.id, 'Message from parent A');
  assert.equal(notifications, before + 1);
  f.storage.setCurrentUser(b.parent); messages.sendMessage(b.parent.id, 'Message from parent B');
  f.storage.setCurrentUser(CURRENT_TEACHER);
  assert.equal(messages.unreadMessageCount(), 2);
  messages.markMessagesRead(a.parent.id);
  assert.equal(messages.unreadMessageCount(), 1);
  assert.ok(messages.getMessages(a.parent.id)[0].readAt);
  assert.equal(messages.getMessages(b.parent.id)[0].readAt, undefined);
  unsubscribe();
});

test('roster accounts use the last two name parts and birth dates, reject duplicates and invalid dates', async () => {
  const f = fixture(); const svc = f.load('services/studentAccounts.ts'); const auth = f.load('services/localAuth.ts');
  const rows = svc.parseRoster(JSON.stringify([{ fullName: 'Nguyễn Test Anh', birthDate: '27/11/2015' }, { fullName: 'Lê Test Dương', birthDate: '21/04/2014' }]));
  assert.equal(rows[0].username, 'Testanh2711'); assert.equal(rows[0].initialPassword, '27112015');
  assert.equal(rows[1].username, 'Testduong2104'); assert.equal(rows[1].birthDate, '2014-04-21');
  assert.throws(() => svc.parseRoster('[{"fullName":"Test A","birthDate":"31/02/2015"}]'));
  assert.throws(() => svc.parseRoster('[{"fullName":"Test A","birthDate":"27/11/2015"},{"fullName":"Other Test A","birthDate":"27/11/2015"}]'));
  assert.equal(await svc.importStudentAccounts(rows), 2);
  const student = f.storage.getStudents()[0];
  assert.equal(student.className, 'Lớp 6D'); assert.equal(student.birthDate, '2015-11-27'); assert.equal(student.parentId, undefined);
  assert.ok(await auth.verifyPassword(student, '27112015'));
  assert.ok(!f.localStorage.getItem('toan6_credentials').includes('27112015'));
  await assert.rejects(svc.importStudentAccounts(rows));
  assert.equal(f.storage.getStudents().length, 2);
});

test('adding a parent later links both records and only exposes their own child', async () => {
  const f = fixture(); const svc = f.load('services/studentAccounts.ts'); const auth = f.load('services/localAuth.ts');
  const { CURRENT_TEACHER } = f.load('data/mockData.ts');
  const a = f.storage.addStudent({ fullName: 'Synthetic A', username: 'synthetic_a' }).student;
  const b = f.storage.addStudent({ fullName: 'Synthetic B', username: 'synthetic_b' }).student;
  const parent = await svc.linkParentAccount(a.id, { fullName: 'Synthetic parent', username: 'ph_synthetic_a', phone: '0900000099' }, 'ParentTesting123');
  assert.equal(parent.studentId, a.id); assert.equal(parent.studentName, a.fullName);
  assert.equal(f.storage.getStudents().find(s => s.id === a.id).parentId, parent.id);
  assert.equal(f.storage.getStudents().find(s => s.id === b.id).parentId, undefined);
  assert.ok(await auth.verifyPassword(parent, 'ParentTesting123'));
  await assert.rejects(svc.linkParentAccount(a.id, { fullName: 'Second parent', username: 'second_parent', phone: '' }, 'ParentTesting123'));
  f.storage.setCurrentUser(parent);
  await assert.rejects(svc.linkParentAccount(b.id, { fullName: 'Unauthorized', username: 'unauthorized', phone: '' }, 'ParentTesting123'));
  f.storage.setCurrentUser(CURRENT_TEACHER);
  assert.equal(f.storage.getParents().length, 1);
});

test('roster import rolls back class records if saving credentials fails', async () => {
  const f = fixture(); const svc = f.load('services/studentAccounts.ts');
  const rows = svc.parseRoster('[{"fullName":"Synthetic Student","birthDate":"01/01/2015"}]');
  const write = f.localStorage.setItem; let fail = true;
  f.localStorage.setItem = (key, value) => { if (key === 'toan6_credentials' && fail) { fail = false; throw new Error('quota'); } write(key, value); };
  await assert.rejects(svc.importStudentAccounts(rows));
  assert.equal(f.storage.getStudents().length, 0); assert.equal(f.storage.getParents().length, 0);
});
test('class backup preserves class records, password hashes and drafts without sessions or unrelated secrets', () => {
  const f = fixture();
  const { createClassBackup } = f.load('services/classBackup.ts');
  f.storage.addStudent({ fullName: 'Backup Student', username: 'backup_student' });
  f.localStorage.setItem('toan6_credentials', JSON.stringify({ 'test-id': { salt: [1, 2], hash: 'test-hash' } }));
  f.localStorage.setItem('teacher_exam_draft', '{"title":"Backup draft"}');
  f.localStorage.setItem('toan6_messages', '[{"id":"message-test","body":"Test"}]');
  f.localStorage.setItem('toan6_login_session', 'active');
  f.localStorage.setItem('toan6_session_user', 'test-id');
  f.localStorage.setItem('SUPABASE_SECRET_KEY', 'never-export');
  const before = JSON.stringify(f.snapshot());
  const backup = createClassBackup(f.localStorage, '2026-10-10T00:00:00.000Z');
  assert.equal(backup.format, 'toan6-local-backup');
  assert.equal(backup.counts.students, 1);
  assert.equal(backup.counts.questions, 2000);
  assert.equal(backup.counts.messages, 1);
  assert.equal(backup.records.toan6_credentials, f.localStorage.getItem('toan6_credentials'));
  assert.equal(backup.records.teacher_exam_draft, '{"title":"Backup draft"}');
  assert.equal(backup.records.toan6_session_user, undefined);
  assert.equal(backup.records.toan6_current_user, undefined);
  assert.equal(backup.records.toan6_login_session, undefined);
  assert.equal(backup.records.SUPABASE_SECRET_KEY, undefined);
  assert.equal(JSON.stringify(f.snapshot()), before);
});

test('class backup refuses malformed class collections instead of hiding data loss', () => {
  const f = fixture();
  const { createClassBackup } = f.load('services/classBackup.ts');
  f.localStorage.setItem('toan6_students', '{}');
  assert.throws(() => createClassBackup(f.localStorage), /toan6_students/);
});
test('cloud bank import validates all questions before contacting Supabase', async () => {
  const f = fixture();
  const { importCloudQuestionBank, validateCloudQuestionBank } = f.load('services/cloudQuestionImport.ts');
  const bank = f.storage.getQuestionBank();
  assert.doesNotThrow(() => validateCloudQuestionBank(bank));
  assert.throws(() => validateCloudQuestionBank([]), /Ngân hàng/);
  assert.throws(() => validateCloudQuestionBank([bank[0], bank[0]]), /trùng/);
  assert.throws(() => validateCloudQuestionBank([{ ...bank[0], chapterId: 10 }]), /không hợp lệ/);
  let called = false;
  await assert.rejects(importCloudQuestionBank({ auth: { getUser: () => { called = true; } } }, []));
  assert.equal(called, false);
});

test('cloud import checks the authenticated teacher and exact imported count, without altering local data', async () => {
  const f = fixture();
  const { importCloudQuestionBank } = f.load('services/cloudQuestionImport.ts');
  const bank = f.storage.getQuestionBank();
  const before = JSON.stringify(f.snapshot());
  let role = 'teacher', rpcCount = 2000, rpcCalls = 0;
  const query = { select: () => query, eq: () => query, single: async () => ({ data: { class_id: 'class-6d', role, status: 'active' }, error: null }) };
  const client = { auth: { getUser: async () => ({ data: { user: { id: 'auth-test' } }, error: null }) }, from: () => query,
    rpc: async (name, args) => { rpcCalls++; assert.equal(name, 'toan6_import_question_bank'); assert.equal(args.target_class, 'class-6d'); assert.equal(args.questions.length, 2000); return { data: rpcCount, error: null }; } };
  assert.equal(await importCloudQuestionBank(client, bank), 2000);
  assert.equal(JSON.stringify(f.snapshot()), before);
  role = 'parent';
  await assert.rejects(importCloudQuestionBank(client, bank), /giáo viên/);
  assert.equal(rpcCalls, 1);
  role = 'teacher'; rpcCount = 1999;
  await assert.rejects(importCloudQuestionBank(client, bank), /chưa khớp/);
});
