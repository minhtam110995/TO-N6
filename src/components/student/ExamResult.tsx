import React, { useState } from 'react';
import { getExams, getSubmissions, getCurrentUser } from '../../services/storage';
import { MathRenderer, MathText } from '../common/MathRenderer';

interface ExamResultProps { submissionId?: string; onRetryWrong: () => void; onGoHome: () => void; onSelfPractice: () => void }
export const ExamResult: React.FC<ExamResultProps> = ({ submissionId, onRetryWrong, onGoHome, onSelfPractice }) => {
  const [filter, setFilter] = useState('all');
  const sub = getSubmissions().find(s => s.id === submissionId);
  if (!sub) return <section><h1>Không tìm thấy bài làm</h1><button onClick={onGoHome}>Quay lại</button></section>;
  const exam = getExams().find(e => e.id === sub.examId);
  const teacherView = getCurrentUser().role === 'teacher';
  const showSolution = teacherView || exam?.showSolutionAfter !== 'deadline' || Date.now() >= Date.parse(exam.deadline);
  return <section className="result-view"><div className="page-heading"><h1>{sub.examTitle}</h1><p>{sub.studentName} · {new Date(sub.submittedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p></div>
    <div className="summary-grid"><div><span>Điểm</span><strong>{sub.score}<small> / 10</small></strong></div><div><span>Câu đúng</span><strong>{sub.correctCount}/{sub.totalQuestions}</strong></div><div><span>Thời gian</span><strong>{Math.floor(sub.durationSeconds / 60)}p {sub.durationSeconds % 60}s</strong></div></div>
    <div className="result-actions"><button className="secondary-button" onClick={onGoHome}>{teacherView ? 'Về thống kê kết quả' : 'Về bài tập'}</button>{getCurrentUser().role === 'student' && <><button className="secondary-button" onClick={onSelfPractice}>Ôn luyện</button><button className="primary-button" onClick={onRetryWrong}>Ôn câu sai</button></>}</div>
    <div className="filter-tabs" role="group" aria-label="Lọc câu trả lời">{[['all', 'Tất cả'], ['correct', 'Đúng'], ['wrong', 'Sai']].map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
    {!showSolution && <p className="muted">Lời giải sẽ mở sau hạn nộp.</p>}
    <div className="solution-grid">{sub.answers.map((answer, index) => {
      if (filter === 'correct' && !answer.isCorrect || filter === 'wrong' && answer.isCorrect) return null;
      const question = exam?.questions.find(q => q.id === answer.questionId);
      return <article className="solution-item" key={`${answer.questionId}-${index}`}><div className="solution-heading"><strong>Câu {index + 1}</strong><span className={answer.isCorrect ? 'correct' : 'incorrect'}>{answer.isCorrect ? 'Đúng' : 'Chưa đúng'}</span></div>
        {question && <p>{<MathText text={question.content} />}</p>}
        {question?.mathFormula && <MathRenderer formula={question.mathFormula} />}
        {question?.svgIllustration && <img className="question-illustration" alt="Hình minh họa câu hỏi" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(question.svgIllustration)}`} />}
        <p>{teacherView ? 'Học sinh trả lời' : 'Đáp án của bạn'}: {question?.type === 'multiple_choice' ? question.options?.find(o => o.id === answer.selectedAnswerText || o.label === answer.selectedAnswerText)?.text || answer.selectedAnswerText || 'Chưa trả lời' : question?.type === 'true_false' ? question.statements?.map(statement => { let selected: Record<string, boolean> = {}; try { selected = JSON.parse(answer.selectedAnswerText || '{}'); } catch {} return `${statement.text}: ${selected[statement.id] === undefined ? 'Chưa trả lời' : selected[statement.id] ? 'Đúng' : 'Sai'}`; }).join(' · ') : answer.selectedAnswerText || 'Chưa trả lời'}</p>
        {showSolution && question && <><p>Đáp án đúng: {question.type === 'true_false' ? question.statements?.map(s => `${s.text}: ${s.isCorrect ? 'Đúng' : 'Sai'}`).join(' · ') : question.correctAnswers?.join(' / ') || question.options?.find(o => o.isCorrect)?.text}</p>{question.solutionSteps.map(step => <div key={step.step}><strong>{step.title}</strong><p>{<MathText text={step.explanation} />}</p></div>)}</>}
      </article>;
    })}</div>
  </section>;
};
