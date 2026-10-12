import React, { useState } from 'react';
import { CHAPTERS_DATA } from '../../data/seedQuestions';
import { getQuestionBank } from '../../services/storage';
export const SelfPractice: React.FC<{ busy?: boolean; onStartCustomPractice: (chapterId: number, lessonId?: number) => void }> = ({ busy = false, onStartCustomPractice }) => {
  const [selected, setSelected] = useState(6);
  const chapter = CHAPTERS_DATA.find(c => c.id === selected)!;
  const bank = getQuestionBank();
  return <section><div className="page-heading"><h1>Ôn luyện theo bài</h1><p>Toán 6 · Kết nối tri thức</p></div><label className="chapter-selector">Chương <select className="secondary-button" value={selected} onChange={e => setSelected(Number(e.target.value))}>{CHAPTERS_DATA.map(c => <option value={c.id} key={c.id}>{c.title}</option>)}</select></label><div className="practice-grid">{chapter.lessons.map(lesson => {
    const count = bank.filter(q => q.chapterId === selected && q.lessonId === lesson.id).length;
    return <article className="exam-item" key={lesson.id}><div><h2>{lesson.title}</h2><p>{count} câu trong ngân hàng</p></div><button disabled={!count || busy} className="primary-button" onClick={() => onStartCustomPractice(selected, lesson.id)}>{busy ? 'Đang mở bài...' : 'Luyện tập'}</button></article>;
  })}</div></section>;
};
