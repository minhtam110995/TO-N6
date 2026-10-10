import { User, Exam, Submission, WrongQuestionItem, WeakTopic } from '../types';

export const CURRENT_TEACHER: User = {
  id: 'user-teacher-01',
  username: 'cotamtoan',
  fullName: 'Cô Tâm',
  role: 'teacher',
  className: 'Lớp 6A',
  classId: 'class-6a4',
  status: 'active',
};

// Empty defaults: class data is created by the teacher, never auto-seeded.
export const INITIAL_STUDENTS: User[] = [];
export const INITIAL_PARENTS: User[] = [];
export const INITIAL_EXAMS: Exam[] = [];
export const INITIAL_SUBMISSIONS: Submission[] = [];
export const INITIAL_WRONG_QUESTIONS: WrongQuestionItem[] = [];
export const INITIAL_WEAK_TOPICS: WeakTopic[] = [];
