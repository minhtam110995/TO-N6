const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { transformSync } = require('esbuild');

function fixture(initialData = {}) {
  const data = new Map(Object.entries(initialData));
  const localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) };
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} }; cache.set(filename, module);
    const code = transformSync(fs.readFileSync(filename, 'utf8'), { loader: filename.endsWith('.tsx') ? 'tsx' : 'ts', format: 'cjs', target: 'es2022' }).code;
    vm.runInNewContext(code, { exports: module.exports, module, localStorage, console, crypto: require('node:crypto').webcrypto, TextEncoder, require: name => name.startsWith('.') ? load(path.resolve(path.dirname(filename), name + '.ts')) : require(name) }, { filename });
    return module.exports;
  }
  return { storage: load(path.join(__dirname, '../src/services/storage.ts')), localStorage, snapshot: () => Object.fromEntries(data), load: name => load(path.join(__dirname, '../src', name)) };
}

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
  assert.equal(storage.getQuestionBank().length, 451);
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

test('expansion adds exactly 50 unique exercises in each chapter and covers every lesson', () => {
  const { load } = fixture(); const { ADDITIONAL_QUESTIONS } = load('data/additionalQuestions.ts');
  const { CHAPTERS_DATA, isEquivalentAnswer } = load('data/seedQuestions.ts');
  assert.equal(ADDITIONAL_QUESTIONS.length, 450); assert.equal(new Set(ADDITIONAL_QUESTIONS.map(q => q.id)).size, 450);
  for (const chapter of CHAPTERS_DATA) {
    const list = ADDITIONAL_QUESTIONS.filter(q => q.chapterId === chapter.id);
    assert.equal(list.length, 50); assert.equal(new Set(list.map(q => q.content)).size, 50);
    chapter.lessons.forEach(lesson => assert.ok(list.some(q => q.lessonId === lesson.id)));
    list.forEach(q => { assert.ok(q.solutionSteps[0].explanation); assert.ok(isEquivalentAnswer(q.correctAnswers[0], q.correctAnswers)); });
  }
  assert.ok(isEquivalentAnswer('-0,5', ['-1/2']));
  assert.equal(isEquivalentAnswer('1/2abc', ['0.5']), false);
  assert.equal(isEquivalentAnswer('12 rubbish', ['12']), false);
  assert.equal(isEquivalentAnswer('0.5009', ['0.5']), false);
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
