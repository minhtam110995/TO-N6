import React, { useState, useEffect } from 'react';
import { Exam, Question, AnswerRecord, Submission } from '../../types';
import { getExams, saveSubmission } from '../../services/storage';
import { MathRenderer } from '../common/MathRenderer';
import { isEquivalentAnswer } from '../../data/seedQuestions';

interface ExamTakingProps {
  examId?: string;
  onFinishExam: (submissionId: string) => void;
  onExit: () => void;
}

export const ExamTaking: React.FC<ExamTakingProps> = ({
  examId = 'exam-01',
  onFinishExam,
  onExit,
}) => {
  const exams = getExams();
  const currentExam: Exam = exams.find(e => e.id === examId) || exams[0];
  const questions: Question[] = currentExam.questions;

  const [currentIndex, setCurrentIndex] = useState(0); // 0-indexed (Question 1)
  const currentQ: Question = questions[currentIndex] || questions[0];

  // User responses map
  const [answersMap, setAnswersMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(`draft_exam_${examId}`);
    return saved ? JSON.parse(saved) : { [questions[0]?.id || '']: '-3' };
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showGridModal, setShowGridModal] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Timer
  const [secondsRemaining, setSecondsRemaining] = useState(currentExam.timeLimitMinutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save answers to draft storage automatically
  useEffect(() => {
    localStorage.setItem(`draft_exam_${examId}`, JSON.stringify(answersMap));
  }, [answersMap, examId]);

  const currentAnswer = answersMap[currentQ.id] || '';

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleKeypadPress = (val: string) => {
    setAnswersMap(prev => {
      const existing = prev[currentQ.id] || '';
      if (existing.length < 15) {
        return { ...prev, [currentQ.id]: existing + val };
      }
      return prev;
    });
  };

  const handleBackspace = () => {
    setAnswersMap(prev => {
      const existing = prev[currentQ.id] || '';
      return { ...prev, [currentQ.id]: existing.slice(0, -1) };
    });
  };

  const handleClear = () => {
    setAnswersMap(prev => ({ ...prev, [currentQ.id]: '' }));
  };

  const toggleBookmark = () => {
    setBookmarkedIds(prev =>
      prev.includes(currentQ.id) ? prev.filter(id => id !== currentQ.id) : [...prev, currentQ.id]
    );
  };

  const answeredCount = Object.keys(answersMap).filter(k => answersMap[k]?.trim().length > 0).length;

  const handleSubmitFinal = () => {
    // Grade the exam
    let correctCount = 0;
    const answerRecords: AnswerRecord[] = questions.map(q => {
      const userAns = answersMap[q.id]?.trim() || '';
      let isCorrect = false;

      if (q.type === 'multiple_choice') {
        const correctOpt = q.options?.find(o => o.isCorrect);
        if (correctOpt && (userAns === correctOpt.id || userAns === correctOpt.label)) {
          isCorrect = true;
        }
      } else if (q.type === 'fill_in_the_blank') {
        if (q.correctAnswers && isEquivalentAnswer(userAns, q.correctAnswers)) {
          isCorrect = true;
        }
      }

      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        selectedAnswerText: userAns,
        timeSpentSeconds: 45,
        isCorrect,
        score: isCorrect ? (q.difficultyScore || 0.5) : 0,
      };
    });

    const score = Number(((correctCount / questions.length) * 10).toFixed(1));
    const subId = `sub-${Date.now()}`;

    const submission: Submission = {
      id: subId,
      examId: currentExam.id,
      examTitle: currentExam.title,
      studentId: 'hs-01',
      studentName: 'Nguyễn Minh Khang',
      startedAt: new Date(Date.now() - (currentExam.timeLimitMinutes * 60 - secondsRemaining) * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      durationSeconds: currentExam.timeLimitMinutes * 60 - secondsRemaining,
      score,
      totalQuestions: questions.length,
      correctCount,
      wrongCount: questions.length - correctCount,
      answers: answerRecords,
      speedRating: secondsRemaining > 300 ? 'fast' : 'normal',
      isLate: false,
      teacherFeedback: score >= 8 ? 'Minh Khang làm bài rất xuất sắc, cần duy trì phong độ!' : 'Con cần củng cố lại các câu sai trong sổ tay!',
    };

    saveSubmission(submission);
    localStorage.removeItem(`draft_exam_${examId}`);
    setShowSubmitConfirm(false);
    onFinishExam(subId);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24 flex flex-col justify-between">
      {/* 1. STICKY TOP APP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {/* Quit / Pause */}
            <button
              onClick={() => setShowPauseModal(true)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Timer Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700">
              <span className="material-symbols-outlined text-base text-orange-600">alarm</span>
              <span className="font-bold text-sm font-mono">{formatTimer(secondsRemaining)}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Bookmark */}
              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition active:scale-95 ${
                  bookmarkedIds.includes(currentQ.id)
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span className={`material-symbols-outlined text-base ${bookmarkedIds.includes(currentQ.id) ? 'fill-icon text-amber-600' : ''}`}>
                  star
                </span>
                <span className="hidden sm:inline">Xem lại</span>
              </button>

              {/* Quick Submit */}
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
              >
                Nộp bài
              </button>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="text-blue-700 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">edit_document</span>
                Câu {currentIndex + 1} / {questions.length}
              </span>
              <span>
                Đã làm: <strong className="text-emerald-700 font-bold">{answeredCount}/{questions.length}</strong>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN LEARNING CANVAS */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-8 flex flex-col gap-3.5">
        {/* Topic Badge Card */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] shrink-0">
              Lớp 6
            </span>
            <p className="truncate font-semibold text-slate-800">
              {currentQ.chapterTitle} • {currentQ.lessonTitle}
            </p>
          </div>
          <span className="shrink-0 ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-blue-700 font-semibold text-[10px]">
            {currentQ.level === 'nhan_biet' ? 'Nhận biết' : currentQ.level === 'thong_hieu' ? 'Thông hiểu' : 'Vận dụng'}
          </span>
        </div>

        {/* Question Card */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm shrink-0">
              {currentIndex + 1}
            </span>
            <h2 className="font-bold text-sm text-slate-900 leading-snug">
              {currentQ.content}
            </h2>
          </div>

          {/* Vertical Math Formula Box */}
          {currentQ.mathFormula ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-2 flex items-center justify-center">
              <div className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <MathRenderer formula={currentQ.mathFormula} />
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-2 flex items-center justify-center">
              <div className="flex items-center gap-4 text-2xl font-bold text-slate-900 font-mono">
                <div className="flex flex-col items-center">
                  <span className="text-blue-700 px-2 italic">x</span>
                  <span className="w-12 h-0.5 bg-slate-900 block my-1"></span>
                  <span className="text-orange-700 px-2">(-5)</span>
                </div>
                <span className="text-blue-600">=</span>
                <div className="flex flex-col items-center">
                  <span className="px-2">12</span>
                  <span className="w-12 h-0.5 bg-slate-900 block my-1"></span>
                  <span className="px-2">20</span>
                </div>
              </div>
            </div>
          )}

          {/* Hint Toggle */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-semibold"
            >
              <span className="material-symbols-outlined text-base">lightbulb</span>
              <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý tính chất hai phân số bằng nhau'}</span>
            </button>
            <span className="text-slate-400">Điểm: {currentQ.difficultyScore || 0.5}</span>
          </div>

          {showHint && (
            <div className="p-3 rounded-xl bg-blue-50 text-xs text-blue-900 border-l-4 border-blue-600 leading-relaxed animate-in fade-in">
              Áp dụng quy tắc: <strong>a/b = c/d</strong> khi <strong>a · d = b · c</strong>. Do đó: <span className="font-bold">x · 20 = (-5) · 12</span>.
            </div>
          )}
        </section>

        {/* Options for Multiple Choice */}
        {currentQ.type === 'multiple_choice' && currentQ.options && (
          <section className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Chọn đáp án:</div>
            <div className="grid grid-cols-1 gap-2">
              {currentQ.options.map(opt => {
                const isSelected = currentAnswer === opt.id || currentAnswer === opt.label;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAnswersMap(prev => ({ ...prev, [currentQ.id]: opt.label }))}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition active:scale-[0.99] ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {opt.label}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-blue-600 text-base">check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Interactive Answer Input Display for Fill-in-the-blank */}
        {(currentQ.type === 'fill_in_the_blank' || !currentQ.options) && (
          <>
            <section className="bg-white border-2 border-blue-300 rounded-2xl p-3.5 shadow-xs flex flex-col items-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                KẾT QUẢ CỦA EM
              </span>
              <div className="flex items-center justify-center gap-2 py-1 px-4 rounded-xl bg-slate-50 border border-blue-200 min-w-[200px]">
                <span className="font-bold text-base text-slate-900 italic">x =</span>
                <div className="font-bold text-2xl text-blue-700 tracking-wider min-h-[32px] flex items-center">
                  {currentAnswer || <span className="text-slate-300 font-normal italic">?</span>}
                </div>
                <span className="w-0.5 h-5 bg-blue-600 animate-pulse ml-0.5"></span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Nhấn phím bên dưới để nhập số hoặc dấu</p>
            </section>

            {/* Custom Math Keypad for Grade 6 Mobile Touch */}
            <section className="bg-slate-100 border border-slate-200 rounded-2xl p-2.5 shadow-inner">
              <div className="grid grid-cols-4 gap-2">
                {/* Row 1 */}
                <button type="button" onClick={() => handleKeypadPress('1')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">1</button>
                <button type="button" onClick={() => handleKeypadPress('2')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">2</button>
                <button type="button" onClick={() => handleKeypadPress('3')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">3</button>
                <button type="button" onClick={handleBackspace} className="tactile-btn h-11 rounded-xl bg-red-100 text-red-700 font-bold flex items-center justify-center" title="Xóa 1 ký tự">
                  <span className="material-symbols-outlined text-xl">backspace</span>
                </button>

                {/* Row 2 */}
                <button type="button" onClick={() => handleKeypadPress('4')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">4</button>
                <button type="button" onClick={() => handleKeypadPress('5')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">5</button>
                <button type="button" onClick={() => handleKeypadPress('6')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">6</button>
                <button type="button" onClick={handleClear} className="tactile-btn h-11 rounded-xl bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center">
                  C
                </button>

                {/* Row 3 */}
                <button type="button" onClick={() => handleKeypadPress('7')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">7</button>
                <button type="button" onClick={() => handleKeypadPress('8')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">8</button>
                <button type="button" onClick={() => handleKeypadPress('9')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">9</button>
                <button type="button" onClick={() => handleKeypadPress('/')} className="tactile-btn h-11 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                  a/b
                </button>

                {/* Row 4 */}
                <button type="button" onClick={() => handleKeypadPress('-')} className="tactile-btn h-11 rounded-xl bg-blue-100 text-orange-700 font-bold text-lg flex items-center justify-center">
                  −
                </button>
                <button type="button" onClick={() => handleKeypadPress('0')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">0</button>
                <button type="button" onClick={() => handleKeypadPress(',')} className="tactile-btn h-11 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 flex items-center justify-center">
                  ,
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (currentIndex < questions.length - 1) {
                      setCurrentIndex(c => c + 1);
                    } else {
                      setShowSubmitConfirm(true);
                    }
                  }}
                  className="tactile-btn h-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl">check</span>
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-lg border-t border-slate-200">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between gap-2">
          {/* Previous Question */}
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
            className="tactile-btn flex items-center justify-center gap-1 h-11 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs min-w-[90px] disabled:opacity-40 active:scale-95 transition"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Câu trước</span>
          </button>

          {/* Grid Overview Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowGridModal(true)}
            className="tactile-btn flex flex-col items-center justify-center h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition"
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
            <span className="text-[10px] -mt-0.5 font-bold">{questions.length} câu</span>
          </button>

          {/* Next Question or Submit */}
          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex(c => c + 1)}
              className="tactile-btn flex-1 flex items-center justify-center gap-1 h-11 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs transition"
            >
              <span>Câu sau</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="tactile-btn flex-1 flex items-center justify-center gap-1 h-11 px-4 rounded-xl bg-orange-600 text-white font-bold text-xs transition"
            >
              <span>Nộp bài ngay</span>
              <span className="material-symbols-outlined text-base">check</span>
            </button>
          )}
        </div>
      </footer>

      {/* 4. MODAL: 20-QUESTION GRID MATRIX SHEET */}
      {showGridModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Danh sách câu hỏi</h3>
                <p className="text-xs text-slate-500">{currentExam.title}</p>
              </div>
              <button
                onClick={() => setShowGridModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between py-2.5 text-[11px] text-slate-600 border-b border-slate-100">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-600"></span> Đã làm
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border-2 border-blue-600 bg-blue-100"></span> Đang làm
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-100 text-amber-800 text-[10px] text-center font-bold">★</span> Đánh dấu
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-100"></span> Chưa làm
              </span>
            </div>

            {/* Matrix items */}
            <div className="py-4 overflow-y-auto grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answersMap[q.id]?.trim();
                const isBookmarked = bookmarkedIds.includes(q.id);

                let btnStyle = 'bg-slate-100 text-slate-700';
                if (isCurrent) {
                  btnStyle = 'border-2 border-blue-600 bg-blue-100 text-blue-900 font-extrabold ring-2 ring-blue-300';
                } else if (isBookmarked) {
                  btnStyle = 'bg-amber-100 text-amber-900 font-bold border border-amber-300';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-600 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowGridModal(false);
                    }}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center relative transition ${btnStyle}`}
                  >
                    {idx + 1}
                    {isBookmarked && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowGridModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs mt-2"
            >
              Đóng danh sách câu hỏi
            </button>
          </div>
        </div>
      )}

      {/* 5. CONFIRMATION MODAL: SUBMIT */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">assignment_turned_in</span>
            </div>
            <h3 className="font-bold text-base text-slate-900">Xác nhận nộp bài?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Em đã trả lời <strong className="text-blue-700 font-bold">{answeredCount}/{questions.length} câu</strong>.
              {answeredCount < questions.length && (
                <span className="text-red-600 font-semibold block mt-1">
                  Vẫn còn {questions.length - answeredCount} câu chưa làm!
                </span>
              )}
              Em có chắc chắn muốn nộp bài ngay bây giờ?
            </p>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Làm tiếp
              </button>
              <button
                type="button"
                onClick={handleSubmitFinal}
                className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: PAUSE / EXIT */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">pause_circle</span>
            </div>
            <h3 className="font-bold text-base text-slate-900">Tạm dừng làm bài</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống đã tự động lưu toàn bộ câu trả lời của em vào máy. Em có thể quay lại tiếp tục luyện tập bất cứ lúc nào!
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPauseModal(false)}
                className="py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Làm tiếp
              </button>
              <button
                type="button"
                onClick={onExit}
                className="py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Lưu &amp; Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
