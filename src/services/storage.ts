import { User, Exam, Submission, WrongQuestionItem, Question, CognitiveLevel, WeakTopic } from '../types';
import { CURRENT_TEACHER } from '../data/mockData';
import { SEED_QUESTIONS } from '../data/seedQuestions';
import { ADDITIONAL_QUESTIONS } from '../data/additionalQuestions';
import { matrixCounts } from './examMatrix';

const DATA_VERSION = 'toan6_clean_class_v1';

const STORAGE_KEYS = {
  VERSION: 'toan6_data_version',
  CURRENT_USER: 'toan6_current_user',
  STUDENTS: 'toan6_students',
  PARENTS: 'toan6_parents',
  EXAMS: 'toan6_exams',
  SUBMISSIONS: 'toan6_submissions',
  WRONG_QUESTIONS: 'toan6_wrong_questions',
  QUESTIONS_BANK: 'toan6_questions_bank',
  WEAK_TOPICS: 'toan6_weak_topics',
  ACTIVE_EXAM_DRAFT: 'toan6_active_exam_draft',
};

// Check version and migrate cleanly to 2026-2027 Cô Tâm 6A4
function checkVersionMigration() {
  const currentVer = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (currentVer !== DATA_VERSION) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(CURRENT_TEACHER));
    [STORAGE_KEYS.STUDENTS, STORAGE_KEYS.PARENTS, STORAGE_KEYS.EXAMS, STORAGE_KEYS.SUBMISSIONS, STORAGE_KEYS.WRONG_QUESTIONS, STORAGE_KEYS.WEAK_TOPICS].forEach(key => localStorage.setItem(key, '[]'));
    Object.keys(localStorage).filter(key => /^(draft_exam_|active_exam_|parent_contact_draft_|teacher_exam_draft)/.test(key)).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('toan6_messages');
    localStorage.removeItem('toan6_reminders');
    localStorage.removeItem('toan6_credentials');
    if (typeof sessionStorage !== 'undefined') { sessionStorage.removeItem('toan6_login_session'); sessionStorage.removeItem('toan6_session_user'); }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS_BANK)) localStorage.setItem(STORAGE_KEYS.QUESTIONS_BANK, JSON.stringify(SEED_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
  }
  if (!localStorage.getItem('toan6_bank_expansion_v1')) {
    const bank: Question[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS_BANK) || '[]');
    const ids = new Set(bank.map(q => q.id));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS_BANK, JSON.stringify([...bank, ...ADDITIONAL_QUESTIONS.filter(q => !ids.has(q.id))]));
    localStorage.setItem('toan6_bank_expansion_v1', 'done');
  }
}
checkVersionMigration();

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key?.startsWith('toan6_')) listener(); };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => { listeners.delete(listener); if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage); };
}

export function notifyListeners() {
  listeners.forEach(l => l());
}

export function getCurrentUser(): User {
  const sessionId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('toan6_session_user') : null;
  if (sessionId) return [CURRENT_TEACHER, ...getStudents(), ...getParents()].find(u => u.id === sessionId) || CURRENT_TEACHER;
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return CURRENT_TEACHER;
}

export function setCurrentUser(user: User) {
  if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('toan6_session_user', user.id);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  notifyListeners();
}

export function getStudents(): User[] {
  const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return [];
}

export function addStudent(studentData: Partial<User>, parentData?: Partial<User>): { student: User; parent?: User } {
  const students = getStudents();
  const parents = getParents();

  const newStudentId = `hs-${crypto.randomUUID()}`;
  const newParentId = `ph-${crypto.randomUUID()}`;

  const cleanName = (studentData.fullName || 'Học sinh')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '');

  const username = studentData.username || `hs6a4_${cleanName}`;
  if ([CURRENT_TEACHER, ...students, ...parents].some(u => u.username === username)) throw new Error('Tên đăng nhập đã tồn tại.');
  const parentUsername = parentData?.username || parentData?.phone || `ph_${username}`;
  if (parentData && (parentUsername === username || [CURRENT_TEACHER, ...students, ...parents].some(u => u.username === parentUsername))) throw new Error('Tên đăng nhập phụ huynh đã tồn tại.');
  if (parentData?.phone && parents.some(p => p.phone?.replace(/\D/g, '') === parentData.phone?.replace(/\D/g, ''))) throw new Error('Số điện thoại phụ huynh đã có tài khoản.');

  const newStudent: User = {
    id: newStudentId,
    username,
    fullName: studentData.fullName || 'Học sinh mới',
    role: 'student',
    group: studentData.group || 'Tổ 1',
    birthDate: studentData.birthDate,
    className: 'Lớp 6A',
    classId: 'class-6a4',
    phone: studentData.phone,
    status: 'active',
    lastActive: 'Vừa tạo',
    parentId: parentData ? newParentId : undefined,
    parentName: parentData?.fullName,
  };

  students.push(newStudent);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

  let newParent: User | undefined;
  if (parentData) {
    newParent = {
      id: newParentId,
      username: parentData.username || parentData.phone || `ph_${username}`,
      fullName: parentData.fullName || 'Phụ huynh',
      role: 'parent',
      phone: parentData.phone,
      studentId: newStudentId,
      studentName: newStudent.fullName,
      email: parentData.email,
      className: 'Lớp 6A',
      classId: 'class-6a4',
      status: 'active',
      lastActive: 'Vừa tạo',
    };
    parents.push(newParent);
    localStorage.setItem(STORAGE_KEYS.PARENTS, JSON.stringify(parents));
  }

  notifyListeners();
  return { student: newStudent, parent: newParent };
}

export function getParents(): User[] {
  const saved = localStorage.getItem(STORAGE_KEYS.PARENTS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return [];
}

export function getExams(): Exam[] {
  const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return [];
}

export function createExam(exam: Exam) {
  const exams = getExams();
  exams.unshift(exam);
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  notifyListeners();
}

export function getSubmissions(): Submission[] {
  const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveSubmission(submission: Submission) {
  const subs = getSubmissions();
  subs.unshift(submission);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(subs));

  // If wrong answers, record into wrong questions book
  const wrongAnswers = submission.answers.filter(a => !a.isCorrect);
  const allQuestions = [...getQuestionBank(), ...(getExams().find(e => e.id === submission.examId)?.questions || [])];
  const wrongItems = getWrongQuestions();

  submission.answers.filter(a => a.isCorrect).forEach(a => {
    const item = wrongItems.find(w => w.studentId === submission.studentId && w.questionId === a.questionId);
    if (item) item.isResolved = true;
  });

  wrongAnswers.forEach(ans => {
    const q = allQuestions.find(item => item.id === ans.questionId);
    if (q) {
      const existing = wrongItems.find(w => w.questionId === q.id && w.studentId === submission.studentId);
      if (existing) {
        existing.wrongCount += 1;
        existing.isResolved = false;
        existing.lastWrongAt = submission.submittedAt;
        existing.wrongAnswer = q.options?.find(o => o.id === ans.selectedAnswerText || o.label === ans.selectedAnswerText)?.text || ans.selectedAnswerText || 'Chưa trả lời';
      } else {
        wrongItems.unshift({
          id: `wq-${Date.now()}-${Math.random()}`,
          questionId: q.id,
          studentId: submission.studentId,
          question: q,
          wrongAnswer: q.options?.find(o => o.id === ans.selectedAnswerText || o.label === ans.selectedAnswerText)?.text || ans.selectedAnswerText || ans.selectedOptionId || 'Chưa trả lời',
          correctAnswer: q.correctAnswers ? q.correctAnswers[0] : (q.options?.find(o => o.isCorrect)?.label || ''),
          wrongCount: 1,
          lastWrongAt: submission.submittedAt,
          isResolved: false,
          teacherNote: q.teacherAdvice || 'Cần chú ý lại các bước giải cơ bản.'
        });
      }
    }
  });
  localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(wrongItems));

  notifyListeners();
}

export function getWrongQuestions(studentId?: string): WrongQuestionItem[] {
  const saved = localStorage.getItem(STORAGE_KEYS.WRONG_QUESTIONS);
  if (saved) {
    try {
      const items: WrongQuestionItem[] = JSON.parse(saved);
      if (studentId) {
        return items.filter(i => i.studentId === studentId);
      }
      return items;
    } catch {
      // fallback
    }
  }
  return [];
}

export function resolveWrongQuestion(wrongItemId: string) {
  const items = getWrongQuestions();
  const target = items.find(i => i.id === wrongItemId);
  if (target) {
    target.isResolved = true;
    localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(items));
    notifyListeners();
  }
}

export function getWeakTopics(): WeakTopic[] {
  const saved = localStorage.getItem(STORAGE_KEYS.WEAK_TOPICS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return [];
}

export function getQuestionBank(): Question[] {
  const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS_BANK);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.QUESTIONS_BANK, JSON.stringify(SEED_QUESTIONS));
  return SEED_QUESTIONS;
}

export function saveQuestion(question: Question) {
  const bank = getQuestionBank();
  const index = bank.findIndex(q => q.id === question.id);
  if (index >= 0) {
    bank[index] = question;
  } else {
    bank.unshift(question);
  }
  localStorage.setItem(STORAGE_KEYS.QUESTIONS_BANK, JSON.stringify(bank));
  notifyListeners();
}

export function deleteQuestion(questionId: string) {
  const bank = getQuestionBank().filter(q => q.id !== questionId);
  localStorage.setItem(STORAGE_KEYS.QUESTIONS_BANK, JSON.stringify(bank));
  notifyListeners();
}

export function importQuestions(questions: Question[]) {
  const bank = getQuestionBank();
  const fingerprints = new Set(bank.map(q => `${q.lessonId}|${q.content.trim()}|${q.mathFormula || ''}`));
  let added = 0;
  for (const q of questions) {
    const fingerprint = `${q.lessonId}|${q.content.trim()}|${q.mathFormula || ''}`;
    if (fingerprints.has(fingerprint)) continue;
    fingerprints.add(fingerprint); bank.push({ ...q, id: `q-import-${crypto.randomUUID()}` }); added++;
  }
  localStorage.setItem(STORAGE_KEYS.QUESTIONS_BANK, JSON.stringify(bank)); notifyListeners();
  return added;
}

export function resetAllDataToDefault() {
  Object.values(STORAGE_KEYS).filter(key => key !== STORAGE_KEYS.QUESTIONS_BANK).forEach(key => localStorage.removeItem(key));
  checkVersionMigration();
  notifyListeners();
}

// Auto-generate exam according to matrix
export function generateExamQuestions(
  chapterId: number,
  lessonIds: number[],
  totalCount: number,
  matrix: { nhanBietPercent: number; thongHieuPercent: number; vanDungPercent: number; vanDungCaoPercent: number }
): Question[] {
  if (!Number.isInteger(totalCount) || totalCount < 1) throw new Error('Số câu phải là số nguyên dương.');
  const allQuestions = getQuestionBank();
  
  // Filter relevant questions
  let pool = allQuestions.filter(q => q.chapterId === chapterId);
  if (lessonIds.length > 0) {
    pool = pool.filter(q => lessonIds.includes(q.lessonId));
  }

  if (pool.length < totalCount) throw new Error(`Chỉ có ${pool.length} câu trong phạm vi đã chọn. Hãy giảm số câu hoặc chọn thêm bài.`);

  const byLevel: Record<CognitiveLevel, Question[]> = {
    nhan_biet: pool.filter(q => q.level === 'nhan_biet'),
    thong_hieu: pool.filter(q => q.level === 'thong_hieu'),
    van_dung: pool.filter(q => q.level === 'van_dung'),
    van_dung_cao: pool.filter(q => q.level === 'van_dung_cao'),
  };

  const counts = matrixCounts(matrix, totalCount);
  const [countNB, countTH, countVD, countVDC] = counts;

  const pickRandom = (arr: Question[], n: number): Question[] => {
    if (arr.length < n) throw new Error('Ngân hàng chưa đủ câu theo ma trận đã chọn. Hãy điều chỉnh ma trận hoặc bổ sung câu hỏi.');
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
  };

  const selected = [
    ...pickRandom(byLevel.nhan_biet, countNB),
    ...pickRandom(byLevel.thong_hieu, countTH),
    ...pickRandom(byLevel.van_dung, countVD),
    ...pickRandom(byLevel.van_dung_cao, countVDC),
  ];

  return selected.slice(0, totalCount);
}
