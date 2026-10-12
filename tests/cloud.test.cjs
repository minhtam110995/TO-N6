const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = import('../server/cloud-core.mjs');

test('snapshot loads independent tables concurrently while preserving learner answer privacy', async () => {
  const { createCloudApi } = await core;
  let active = 0, peak = 0;
  const actor = { id: 'student', role: 'student', class_id: 'class', full_name: 'Test', status: 'active' };
  const question = { id: 'q', correctAnswers: ['secret'], solutionSteps: ['secret'] };
  const fake = { from(table) {
    const query = { select() { return this; }, eq() { return this; }, order() { return this; }, is() { return this; },
      async range() {
        active++; peak = Math.max(peak, active);
        await new Promise(resolve => setTimeout(resolve, 10)); active--;
        return { data: table === 'toan6_profiles' ? [actor] : table === 'toan6_questions' ? [{ payload: question }] : [], error: null };
      } };
    return query;
  } };
  const api = createCloudApi({ SUPABASE_URL: 'https://test.invalid', SUPABASE_SECRET_KEY: 'server', SUPABASE_PUBLISHABLE_KEY: 'public' }, () => fake);
  const snapshot = await api.snapshot(actor);
  assert.ok(peak >= 5, 'table reads should overlap instead of serializing network latency');
  assert.equal(snapshot.user.id, actor.id);
  assert.equal(snapshot.bank.length, 1);
  assert.equal(JSON.stringify(snapshot.bank).includes('secret'), false);
});

test('API rejects bad methods, cross-origin requests and invalid JSON without exposing secrets', async () => {
  const { createCloudHandler } = await core;
  const handler = createCloudHandler({ SUPABASE_SECRET_KEY: 'never-expose' });
  for (const fixture of [
    { method: 'GET', headers: {}, expected: 405 },
    { method: 'POST', headers: { origin: 'https://untrusted.invalid', host: 'localhost:3000' }, body: {}, expected: 403 },
    { method: 'POST', headers: {}, body: '{bad', expected: 400 },
    { method: 'POST', headers: {}, body: { op: 'snapshot' }, expected: 503 }
  ]) {
    const response = { statusCode: 0, setHeader() {}, end(body) { this.body = body; } };
    await handler(fixture, response);
    assert.equal(response.statusCode, fixture.expected);
    assert.equal(response.body.includes('never-expose'), false);
  }
});

test('cloud grading uses canonical answers, including equivalent fractions', async () => {
  const { gradeQuestions } = await core;
  const questions = [
    { id: 'mc', type: 'multiple_choice', options: [{ id: 'a', label: 'A', isCorrect: true }, { id: 'b', label: 'B', isCorrect: false }] },
    { id: 'fill', type: 'fill_in_the_blank', correctAnswers: ['1/2'] },
    { id: 'tf', type: 'true_false', statements: [{ id: 'one', isCorrect: true }, { id: 'two', isCorrect: false }] }
  ];
  assert.deepEqual(gradeQuestions(questions, { mc: 'B', fill: '50%', tf: '{"one":true,"two":false}', score: 10 }).map(a => a.isCorrect), [false, true, true]);
  assert.deepEqual(gradeQuestions(questions, { tf: 'null' }).map(a => a.isCorrect), [false, false, false]);
});

test('learner question payload removes every answer field', async () => {
  const { stripAnswers } = await core;
  const q = stripAnswers({ id: 'q', content: 'Question', correctAnswers: ['secret'], solutionSteps: ['secret'], teacherAdvice: 'secret', options: [{ id: 'a', text: 'A', isCorrect: true, note: 'secret' }], statements: [{ id: 's', text: 'S', isCorrect: false }] });
  assert.equal(JSON.stringify(q).includes('secret'), false);
  assert.equal('isCorrect' in q.options[0], false);
  assert.equal('isCorrect' in q.statements[0], false);
});

test('assignment scope and deadline solution visibility are independent', async () => {
  const { assignedTo, canReview } = await core;
  const exam = { id: 'e', assignedTo: ['a'], showSolutionAfter: 'deadline', deadline: '2030-01-01T00:00:00Z' };
  assert.equal(assignedTo(exam, 'a'), true);
  assert.equal(assignedTo(exam, 'b'), false);
  assert.equal(assignedTo({ ...exam, type: 'practice', createdBy: 'a', assignedTo: 'all' }, 'b'), false);
  assert.equal(canReview(exam, 'a', [{ examId: 'e', studentId: 'a' }], Date.parse('2029-01-01')), false);
  assert.equal(canReview(exam, 'a', [], Date.parse(exam.deadline)), true);
});
