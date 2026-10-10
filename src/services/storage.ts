import { User, Exam, Submission, WrongQuestionItem, Question, CognitiveLevel, WeakTopic } from '../types';
import { CURRENT_TEACHER, INITIAL_STUDENTS, INITIAL_PARENTS, INITIAL_EXAMS, INITIAL_SUBMISSIONS, INITIAL_WRONG_QUESTIONS, INITIAL_WEAK_TOPICS } from '../data/mockData';
import { SEED_QUESTIONS } from '../data/seedQuestions';

const DATA_VERSION = 'toan6_kntt_v2026_cotam_6a4';

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
    localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(CURRENT_TEACHER));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.PARENTS, JSON.stringify(INITIAL_PARENTS));
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(INITIAL_WRONG_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS_BANK, JSON.stringify(SEED_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.WEAK_TOPICS, JSON.stringify(INITIAL_WEAK_TOPICS));
  }
}
checkVersionMigration();

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach(l => l());
}

export function getCurrentUser(): User {
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
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  return INITIAL_STUDENTS;
}

export function addStudent(studentData: Partial<User>, parentData?: Partial<User>): { student: User; parent?: User } {
  const students = getStudents();
  const parents = getParents();

  const newStudentId = `hs-${Date.now()}`;
  const newParentId = `ph-${Date.now()}`;

  const cleanName = (studentData.fullName || 'Học sinh')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '');

  const username = studentData.username || `hs6a4_${cleanName}`;

  const newStudent: User = {
    id: newStudentId,
    username,
    fullName: studentData.fullName || 'Học sinh mới',
    role: 'student',
    group: studentData.group || 'Tổ 1',
    birthDate: studentData.birthDate || '2015-01-01',
    className: 'Lớp 6A4',
    classId: 'class-6a4',
    phone: studentData.phone || '0988.123.456',
    status: 'active',
    lastActive: 'Vừa tạo',
    parentId: newParentId,
    parentName: parentData?.fullName || 'Phụ huynh',
  };

  students.push(newStudent);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

  let newParent: User | undefined;
  if (parentData) {
    newParent = {
      id: newParentId,
      username: parentData.username || `ph_${username}`,
      fullName: parentData.fullName || 'Phụ huynh',
      role: 'parent',
      phone: parentData.phone || '0988.123.456',
      studentId: newStudentId,
      className: 'Lớp 6A4',
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
  localStorage.setItem(STORAGE_KEYS.PARENTS, JSON.stringify(INITIAL_PARENTS));
  return INITIAL_PARENTS;
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
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
  return INITIAL_EXAMS;
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
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
  return INITIAL_SUBMISSIONS;
}

export function saveSubmission(submission: Submission) {
  const subs = getSubmissions();
  subs.unshift(submission);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(subs));

  // If wrong answers, record into wrong questions book
  const wrongAnswers = submission.answers.filter(a => !a.isCorrect);
  const allQuestions = getQuestionBank();
  const wrongItems = getWrongQuestions(submission.studentId);

  wrongAnswers.forEach(ans => {
    const q = allQuestions.find(item => item.id === ans.questionId);
    if (q) {
      const existing = wrongItems.find(w => w.questionId === q.id && w.studentId === submission.studentId);
      if (existing) {
        existing.wrongCount += 1;
        existing.isResolved = false;
        existing.lastWrongAt = 'Hôm nay';
      } else {
        wrongItems.unshift({
          id: `wq-${Date.now()}-${Math.random()}`,
          questionId: q.id,
          studentId: submission.studentId,
          question: q,
          wrongAnswer: ans.selectedAnswerText || ans.selectedOptionId || 'Chưa trả lời',
          correctAnswer: q.correctAnswers ? q.correctAnswers[0] : (q.options?.find(o => o.isCorrect)?.label || ''),
          wrongCount: 1,
          lastWrongAt: 'Hôm nay',
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
  localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(INITIAL_WRONG_QUESTIONS));
  return INITIAL_WRONG_QUESTIONS;
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
  localStorage.setItem(STORAGE_KEYS.WEAK_TOPICS, JSON.stringify(INITIAL_WEAK_TOPICS));
  return INITIAL_WEAK_TOPICS;
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

export function resetAllDataToDefault() {
  localStorage.clear();
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
  const allQuestions = getQuestionBank();
  
  // Filter relevant questions
  let pool = allQuestions.filter(q => q.chapterId === chapterId);
  if (lessonIds.length > 0) {
    pool = pool.filter(q => lessonIds.includes(q.lessonId));
  }

  // If pool too small, expand to whole chapter or all
  if (pool.length < totalCount) {
    pool = allQuestions.filter(q => q.chapterId === chapterId);
  }
  if (pool.length === 0) {
    pool = allQuestions;
  }

  const byLevel: Record<CognitiveLevel, Question[]> = {
    nhan_biet: pool.filter(q => q.level === 'nhan_biet'),
    thong_hieu: pool.filter(q => q.level === 'thong_hieu'),
    van_dung: pool.filter(q => q.level === 'van_dung'),
    van_dung_cao: pool.filter(q => q.level === 'van_dung_cao'),
  };

  const countNB = Math.max(1, Math.round((matrix.nhanBietPercent / 100) * totalCount));
  const countTH = Math.max(1, Math.round((matrix.thongHieuPercent / 100) * totalCount));
  const countVD = Math.max(1, Math.round((matrix.vanDungPercent / 100) * totalCount));
  const countVDC = Math.max(1, totalCount - countNB - countTH - countVD);

  const pickRandom = (arr: Question[], n: number): Question[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    const res: Question[] = [];
    for (let i = 0; i < n; i++) {
      if (shuffled[i]) {
        res.push(shuffled[i]);
      } else if (pool.length > 0) {
        res.push(pool[i % pool.length]);
      }
    }
    return res;
  };

  const selected = [
    ...pickRandom(byLevel.nhan_biet, countNB),
    ...pickRandom(byLevel.thong_hieu, countTH),
    ...pickRandom(byLevel.van_dung, countVD),
    ...pickRandom(byLevel.van_dung_cao, countVDC),
  ];

  return selected.slice(0, totalCount);
}
