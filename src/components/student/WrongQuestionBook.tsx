import React, { useState } from 'react';
import { getCurrentUser, getWrongQuestions } from '../../services/storage';
import { MathRenderer } from '../common/MathRenderer';
export const WrongQuestionBook: React.FC<{ onPracticeAgain: (questionId?: string) => void }> = ({ onPracticeAgain }) => {
  const [filter, setFilter] = useState('unresolved');
  const items = getWrongQuestions(getCurrentUser().id);
  const unresolved = items.filter(i => !i.isResolved);
  const filtered = items.filter(i => filter === 'all' || (filter === 'resolved' ? i.isResolved : !i.isResolved));
  return <section><div className="page-heading"><h1>Sổ câu sai</h1><p>{unresolved.length} câu cần ôn lại · {items.filter(i => i.isResolved).length} câu đã sửa đúng</p></div><div className="result-actions"><button className="primary-button" disabled={!unresolved.length} onClick={() => onPracticeAgain()}>Luyện các câu chưa đúng</button></div><div className="filter-tabs" role="group" aria-label="Lọc câu sai">{[['unresolved', 'Cần ôn lại'], ['resolved', 'Đã sửa đúng'], ['all', 'Tất cả']].map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div><div className="solution-grid">{filtered.map(item => <article className="solution-item" key={item.id}><div className="solution-heading"><strong>{item.question.lessonTitle}</strong><span>{item.isResolved ? 'Đã sửa đúng' : `Sai ${item.wrongCount} lần`}</span></div><p>{item.question.content}</p>{item.question.mathFormula && <MathRenderer formula={item.question.mathFormula} />}<p>Đáp án đã chọn: {item.wrongAnswer}</p><button className="secondary-button" onClick={() => onPracticeAgain(item.questionId)}>Làm lại câu này</button></article>)}{!filtered.length && <p className="empty-state">Không có câu hỏi trong mục này.</p>}</div></section>;
};
