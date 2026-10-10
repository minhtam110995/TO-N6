import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getSubmissions } from '../../services/storage';
import { Submission } from '../../types';
import { SEED_QUESTIONS } from '../../data/seedQuestions';
import { MathRenderer } from '../common/MathRenderer';

interface ExamResultProps {
  submissionId?: string;
  onRetryWrong: () => void;
  onGoHome: () => void;
  onSelfPractice: () => void;
}

export const ExamResult: React.FC<ExamResultProps> = ({
  submissionId,
  onRetryWrong,
  onGoHome,
  onSelfPractice,
}) => {
  const submissions = getSubmissions();
  const sub: Submission = submissions.find(s => s.id === submissionId) || submissions[0];

  const [activeFilter, setActiveFilter] = useState<'all' | 'correct' | 'wrong'>('all');

  useEffect(() => {
    // Launch celebratory confetti if score >= 8
    if (sub.score >= 8) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [sub.score]);

  return (
    <div className="space-y-5 max-w-md mx-auto pb-8">
      {/* Top Gamification Bar */}
      <section className="flex items-center justify-between bg-white rounded-xl p-3 shadow-2xs border border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-800">{sub.examTitle}</span>
        </div>
        <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
          Kỳ I • GDPT
        </span>
      </section>

      {/* Hero Result Section */}
      <section className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 relative overflow-hidden text-center">
        {/* Glow decoration */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Circular Score */}
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-8 border-blue-100 flex flex-col items-center justify-center bg-slate-50 shadow-inner">
              <span className="text-3xl font-extrabold text-blue-700 leading-none">{sub.score}</span>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5">trên 10</span>
              <div className="absolute -bottom-2 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                <span className="material-symbols-outlined text-xs fill-icon">workspace_premium</span>
                <span>{sub.score >= 8 ? 'Đạt Giỏi' : sub.score >= 6.5 ? 'Đạt Khá' : 'Cần cố gắng'}</span>
              </div>
            </div>
          </div>

          <h2 className="text-base font-bold text-slate-900 mt-2">
            Rất xuất sắc, Minh Khang! 🎉
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Em đã nắm rất vững kiến thức <strong className="text-blue-700 font-semibold">Phân số bằng nhau &amp; Rút gọn phân số</strong>!
          </p>

          {/* Reward Badges */}
          <div className="flex items-center gap-3 mt-3.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80 text-xs font-bold text-orange-700">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-orange-600 fill-icon">star</span>
              <span>+85 Điểm sao ⭐</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200"></div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-orange-600 fill-icon">local_fire_department</span>
              <span>+1 Ngày chuỗi streak 🔥</span>
            </div>
          </div>

          {/* 3 Quick Stats Bento */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4">
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-center">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-1 text-emerald-700">
                <span className="material-symbols-outlined text-base fill-icon">check_circle</span>
              </div>
              <div className="text-sm font-bold text-slate-900">{sub.correctCount}/{sub.totalQuestions}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Câu đúng</div>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-red-200 text-center">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-1 text-red-600">
                <span className="material-symbols-outlined text-base fill-icon">cancel</span>
              </div>
              <div className="text-sm font-bold text-red-600">{sub.wrongCount}/{sub.totalQuestions}</div>
              <div className="text-[10px] text-red-700 font-semibold">Đã vào Sổ sai</div>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-center">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1 text-blue-700">
                <span className="material-symbols-outlined text-base fill-icon">schedule</span>
              </div>
              <div className="text-sm font-bold text-slate-900">22p 15s</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Nhanh hơn 5p</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={onRetryWrong}
          className="tactile-btn-orange flex-1 min-h-[46px] bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          <span>Luyện lại các câu sai ngay</span>
        </button>

        <button
          onClick={onGoHome}
          className="min-h-[46px] px-5 rounded-xl border-2 border-blue-600 text-blue-700 font-bold text-xs bg-white hover:bg-blue-50 flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <span className="material-symbols-outlined text-base">home</span>
          <span>Về Trang chủ</span>
        </button>
      </section>

      {/* Filter Solution Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <span>Xem lời giải chi tiết</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.2 rounded-full">
            20 câu
          </span>
        </h3>
        <span className="text-xs text-slate-400">Chạm để mở rộng</span>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Tất cả (20)
        </button>
        <button
          onClick={() => setActiveFilter('correct')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap ${
            activeFilter === 'correct' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800 border border-slate-200'
          }`}
        >
          Câu đúng (17)
        </button>
        <button
          onClick={() => setActiveFilter('wrong')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap ${
            activeFilter === 'wrong' ? 'bg-red-600 text-white' : 'bg-white text-red-700 border border-red-200'
          }`}
        >
          Câu sai (3)
        </button>
      </div>

      {/* Detailed Solution Cards */}
      <div className="space-y-3.5">
        {/* Card 1: Câu 3 (LÀM ĐÚNG) */}
        {(activeFilter === 'all' || activeFilter === 'correct') && (
          <article className="bg-white rounded-2xl border-2 border-emerald-300 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm fill-icon">check_circle</span>
                  Làm đúng (+5đ)
                </span>
              </div>
              <span className="material-symbols-outlined text-slate-300 text-base">bookmark</span>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-800">
                Tìm số nguyên <strong className="text-blue-700">x</strong> thỏa mãn đẳng thức phân số:
              </p>
              <div className="bg-slate-50 rounded-xl p-3 my-2 flex items-center justify-center border border-slate-200 font-mono font-bold text-lg text-slate-900">
                <div className="flex flex-col items-center">
                  <span className="text-blue-700">x</span>
                  <span className="w-10 h-0.5 bg-slate-900 my-0.5"></span>
                  <span className="text-orange-700">(-5)</span>
                </div>
                <span className="mx-3 text-blue-600">=</span>
                <div className="flex flex-col items-center">
                  <span>12</span>
                  <span className="w-10 h-0.5 bg-slate-900 my-0.5"></span>
                  <span>20</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Đáp án của em:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">x = -3</span>
                </div>
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-sm">check</span> Đúng
                </span>
              </div>
            </div>

            <details className="mt-2 text-xs group" open>
              <summary className="font-bold text-blue-700 cursor-pointer flex items-center justify-between list-none">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">lightbulb</span>
                  Xem lời giải từng bước
                </span>
                <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="mt-2 space-y-1.5 text-slate-700 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <p>
                  <strong>Bước 1: </strong>Áp dụng định nghĩa hai phân số bằng nhau: nếu a/b = c/d thì a · d = b · c.
                  Ta có phép nhân chéo: <strong>20 · x = 12 · (-5) = -60</strong>
                </p>
                <p>
                  <strong>Bước 2: </strong>Tìm x bằng phép chia: <strong>x = (-60) : 20 = -3</strong>.
                  Kết luận: Vậy <strong className="text-emerald-800">x = -3</strong>.
                </p>
              </div>
            </details>
          </article>
        )}

        {/* Card 2: Câu 7 (LÀM SAI - GHI CHÚ SỔ SAI) */}
        {(activeFilter === 'all' || activeFilter === 'wrong') && (
          <article className="bg-white rounded-2xl border-2 border-red-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                  07
                </span>
                <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm fill-icon">cancel</span>
                  Chưa chính xác (0đ)
                </span>
              </div>
              <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                Đã lưu Sổ câu sai
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-800">
                Rút gọn phân số sau về dạng <span className="text-red-600 font-bold underline">tối giản</span>:
              </p>

              <div className="bg-slate-50 rounded-xl p-2.5 my-2 text-center border border-slate-200 font-mono font-bold text-base">
                Phân số ban đầu: <span className="text-slate-900 font-bold">(-18) / 30</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-[10px] text-slate-500 block">Em đã chọn:</span>
                  <div className="font-bold text-red-700 mt-0.5 font-mono">(-9) / 15</div>
                  <span className="text-[10px] text-red-600 font-bold">✕ Sai (chưa tối giản)</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Đáp án đúng:</span>
                  <div className="font-bold text-emerald-800 mt-0.5 font-mono">(-3) / 5</div>
                  <span className="text-[10px] text-emerald-700 font-bold">✓ Chính xác</span>
                </div>
              </div>
            </div>

            <details className="mt-2 text-xs group" open>
              <summary className="font-bold text-blue-700 cursor-pointer flex items-center justify-between list-none">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">auto_stories</span>
                  Lời giải chi tiết &amp; Mẹo tránh bẫy
                </span>
                <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="mt-2 space-y-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                <p>
                  Để rút gọn một phân số về <strong className="text-blue-700">tối giản</strong>, ta chia cả tử và mẫu cho <strong className="text-slate-900">Ước chung lớn nhất (ƯCLN)</strong> của chúng:
                </p>
                <div className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-800">
                  ƯCLN(18, 30) = 6 ➔ (-18 : 6) / (30 : 6) = <strong>(-3) / 5</strong>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>💡 Lời khuyên của cô giáo: </strong>
                  "Em đã rút gọn đúng một bước khi chia cho 2, nhưng phân số (-9)/15 vẫn còn chia hết cho 3. Nhớ chia cho ƯCLN một lần duy nhất nhé!"
                </div>
              </div>
            </details>
          </article>
        )}

        {/* Card 3: Summary Completion */}
        <article className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              12
            </span>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Quy đồng mẫu hai phân số</h4>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs">check</span> Em làm đúng: Mẫu chung là 24
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-base">chevron_right</span>
        </article>
      </div>

      {/* Bottom Learning Path Recommendation Card */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-2xl">school</span>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-xs text-slate-900">Gợi ý bài tập tiếp theo</h4>
          <p className="text-[11px] text-slate-600">
            Luyện 5 câu ôn tập về <strong>Quy đồng mẫu số nhiều phân số</strong> để củng cố điểm 10.
          </p>
        </div>
        <button
          onClick={onSelfPractice}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shrink-0"
        >
          Học tiếp
        </button>
      </section>
    </div>
  );
};
