import Papa from 'papaparse';
import { CHAPTERS_DATA } from '../data/seedQuestions';
import { Question, CognitiveLevel, QuestionType } from '../types';
const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
const rules: [number, string[]][] = [
  [1, ['phan tu cua tap hop', 'tap hop a =']], [2, ['la ma', 'hang nghin', 'ghi so tu nhien']], [3, ['thu tu', 'so lien truoc', 'so lien sau']],
  [6, ['so du', 'chia co du']], [7, ['chia het cho 2', 'chia het cho 5']], [8, ['chia het cho 3', 'chia het cho 9']], [9, ['so nguyen to', 'hop so']],
  [10, ['uoc va boi']], [11, ['uoc chung', 'ucln']], [12, ['boi chung', 'bcnn']], [13, ['so doi', 'tap hop cac so nguyen']],
  [15, ['dau ngoac']], [18, ['tam giac deu', 'luc giac deu']], [19, ['canh doi', 'hinh thang can']], [20, ['dien tich', 'chu vi hinh']],
  [21, ['truc doi xung']], [22, ['tam doi xung']], [23, ['phan so bang nhau']], [24, ['hon so', 'so sanh phan so']],
  [25, ['cong phan so', 'tru phan so']], [26, ['nhan phan so', 'chia phan so']], [27, ['bai toan ve phan so']],
  [28, ['viet so thap phan']], [30, ['lam tron', 'uoc luong']], [31, ['phan tram', 'ti so']], [32, ['diem va duong thang']],
  [33, ['nam giua', 'hai tia doi']], [34, ['do dai doan thang']], [35, ['trung diem']], [37, ['so do goc', 'goc nhon', 'goc tu']],
  [38, ['thu thap du lieu']], [39, ['bieu do tranh']], [40, ['bieu do cot']], [41, ['bieu do cot kep']], [42, ['ket qua co the', 'su kien']], [43, ['xac suat thuc nghiem']],
];
export function assignLesson(question: Question, lessonId: number): Question {
  const chapter = CHAPTERS_DATA.find(c => c.lessons.some(l => l.id === lessonId));
  const lesson = chapter?.lessons.find(l => l.id === lessonId);
  if (!chapter || !lesson) return { ...question, chapterId: 0, lessonId: 0, chapterTitle: '', lessonTitle: '' };
  return { ...question, chapterId: chapter.id, chapterTitle: chapter.title, lessonId, lessonTitle: lesson.title };
}
export function parseQuestionFile(text: string, extension: string): Question[] {
  let rows: unknown;
  if (extension === 'json') { const data = JSON.parse(text.replace(/^\uFEFF/, '')); rows = Array.isArray(data) ? data : data.questions; }
  else if (extension === 'csv') {
    const result = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: 'greedy', transformHeader: h => h.trim().replace(/^\uFEFF/, '') });
    if (result.errors.length) throw new Error(`CSV không hợp lệ: ${result.errors[0].message}`);
    rows = result.data;
  } else throw new Error('Chọn file JSON hoặc CSV.');
  if (!Array.isArray(rows) || !rows.length || rows.length > 5000) throw new Error('File cần có từ 1 đến 5000 câu hỏi.');
  return rows.map((value, index) => {
    const row = value as Record<string, any>;
    const fail = (reason: string): never => { throw new Error(`Dòng ${index + 1}: ${reason}`); };
    if (!row || typeof row.content !== 'string' || !row.content.trim()) fail('thiếu nội dung content.');
    const type: QuestionType = row.type || 'fill_in_the_blank';
    if (!['multiple_choice', 'true_false', 'fill_in_the_blank'].includes(type)) fail('type không hợp lệ.');
    const level: CognitiveLevel = row.level || 'nhan_biet';
    if (!['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'].includes(level)) fail('level không hợp lệ.');
    let options = row.options;
    if (type === 'multiple_choice' && !options) options = ['A', 'B', 'C', 'D'].map(label => ({ id: `opt-${label.toLowerCase()}`, label, text: row[label], isCorrect: String(row.answer).toUpperCase() === label }));
    if (type === 'multiple_choice' && (!Array.isArray(options) || options.length < 2 || options.some(o => !o || typeof o.text !== 'string' || !o.text.trim() || typeof o.id !== 'string' || !o.id || typeof o.label !== 'string' || !o.label || typeof o.isCorrect !== 'boolean') || options.filter(o => o.isCorrect).length !== 1 || new Set(options.map(o => o.id)).size !== options.length || new Set(options.map(o => o.label)).size !== options.length)) fail('trắc nghiệm cần các lựa chọn và đúng một đáp án đúng.');
    let answers = row.correctAnswers || row.answer;
    if (typeof answers === 'string' && answers.startsWith('[')) { try { answers = JSON.parse(answers); } catch { fail('correctAnswers không phải mảng JSON hợp lệ.'); } }
    if (!Array.isArray(answers)) answers = answers === undefined ? [] : [String(answers)];
    if (type === 'fill_in_the_blank' && (!answers.length || answers.some((a: unknown) => typeof a !== 'string' || !a.trim()))) fail('thiếu đáp án correctAnswers/answer.');
    const statements = row.statements;
    if (type === 'true_false' && (!Array.isArray(statements) || !statements.length || statements.some(s => !s || typeof s.id !== 'string' || !s.id || typeof s.text !== 'string' || !s.text.trim() || typeof s.isCorrect !== 'boolean') || new Set(statements.map(s => s.id)).size !== statements.length)) fail('statements cần id, text và isCorrect.');
    const suppliedLesson = row.lessonId ? Number(row.lessonId) : Number(String(row.lessonTitle || row.content).match(/(?:Bài|Bai)\s*(\d+)\s*[:.]/i)?.[1] || 0);
    const content = normalize(row.content);
    const matches = rules.filter(([, words]) => words.some(word => content.includes(word))).map(([id]) => id);
    // A column-double keyword is more specific than column; midpoint overrides generic length.
    const inferred = matches.includes(41) ? 41 : matches.includes(35) ? 35 : matches.length === 1 ? matches[0] : 0;
    const seconds = row.estimatedSeconds ? Number(row.estimatedSeconds) : 60;
    if (!Number.isFinite(seconds) || seconds <= 0) fail('estimatedSeconds phải dương.');
    const solutionSteps = Array.isArray(row.solutionSteps) ? row.solutionSteps : [{ step: 1, title: 'Lời giải', explanation: String(row.solution || '') }];
    if (solutionSteps.some((s: any) => !s || typeof s.explanation !== 'string' || typeof s.title !== 'string' || !Number.isFinite(s.step))) fail('solutionSteps không hợp lệ.');
    const question = assignLesson({ id: `preview-${index}`, content: row.content.trim(), chapterId: 0, chapterTitle: '', lessonId: 0, lessonTitle: '', type, level, options, statements, correctAnswers: answers, solutionSteps, mathFormula: typeof row.mathFormula === 'string' ? row.mathFormula : undefined, estimatedSeconds: seconds }, suppliedLesson || inferred);
    if (suppliedLesson && !question.lessonId) fail('lessonId không tồn tại.');
    if (row.chapterId && (!CHAPTERS_DATA.some(c => c.id === Number(row.chapterId)) || question.chapterId && Number(row.chapterId) !== question.chapterId)) fail('chapterId không khớp bài học.');
    return question;
  });
}
