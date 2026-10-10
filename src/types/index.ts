export type Role = 'teacher' | 'student' | 'parent';

export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_in_the_blank';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  classId?: string;
  className?: string;
  studentId?: string; // For parents: linked student ID
  studentName?: string; // For parents: linked student name
  parentId?: string; // For students: linked parent ID
  parentName?: string;
  group?: string; // Tổ 1, Tổ 2...
  birthDate?: string;
  status: 'active' | 'inactive';
  lastActive?: string;
}

export interface Question {
  id: string;
  chapterId: number; // 1 to 9
  chapterTitle: string;
  lessonId: number;
  lessonTitle: string;
  level: CognitiveLevel; // Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao
  type: QuestionType;
  content: string; // Text or LaTeX
  mathFormula?: string; // Optional math expression
  options?: {
    id: string;
    label: string; // 'A', 'B', 'C', 'D'
    text: string;
    isCorrect: boolean;
    note?: string;
  }[];
  // For true_false: 4 statements
  statements?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  // For fill_in_the_blank
  correctAnswers?: string[]; // e.g. ["-3", "-3/1", "-3,0"] or ["-3/5", "-0.6", "-6/10"]
  solutionSteps: {
    step: number;
    title: string;
    explanation: string;
  }[];
  teacherAdvice?: string;
  estimatedSeconds: number; // e.g. 60
  svgIllustration?: string;
  difficultyScore?: number; // 0.5 to 1.0 point
}

export interface ExamMatrix {
  nhanBietPercent: number; // e.g. 40
  thongHieuPercent: number; // e.g. 30
  vanDungPercent: number; // e.g. 20
  vanDungCaoPercent: number; // e.g. 10
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  type: 'homework' | 'practice' | 'test' | 'quiz_15p' | 'midterm'; // bài tập, ôn tập, kiểm tra
  chapterId: number;
  chapterTitle?: string;
  lessonIds: number[];
  questionCount?: number;
  totalQuestions?: number;
  matrix: ExamMatrix;
  timeLimitMinutes: number; // e.g. 15, 20, 45
  deadline: string; // ISO date string
  maxRetries: number; // 1, 2, or 999 (unlimited)
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showSolutionAfter: 'submit' | 'deadline';
  assignedTo: 'all' | string[]; // 'all' or studentIds
  createdBy: string;
  createdAt: string;
  questions: Question[];
  status: 'active' | 'closed';
}

export interface AnswerRecord {
  questionId: string;
  selectedOptionId?: string; // A, B, C, D
  selectedAnswerText?: string;
  timeSpentSeconds: number;
  isCorrect: boolean;
  score: number;
  markedForReview?: boolean;
}

export interface Submission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  score: number; // out of 10
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  answers: AnswerRecord[];
  teacherFeedback?: string;
  speedRating: 'fast' | 'normal' | 'slow';
  isLate: boolean;
}

export interface WrongQuestionItem {
  id: string;
  questionId: string;
  studentId: string;
  question: Question;
  wrongAnswer: string;
  correctAnswer: string;
  wrongCount: number;
  lastWrongAt: string;
  isResolved: boolean;
  teacherNote?: string;
}

export interface WeakTopic {
  chapterId: number;
  lessonId: number;
  topicTitle: string;
  masteryPercentage: number; // e.g. 55%
  wrongFrequency: number;
  reason: string;
  parentAdvice: string;
}
