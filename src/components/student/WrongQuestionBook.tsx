import React, { useState } from 'react';
import { getWrongQuestions, resolveWrongQuestion } from '../../services/storage';
import { WrongQuestionItem } from '../../types';

interface WrongQuestionBookProps {
  onPracticeAgain: (questionId?: string) => void;
}

export const WrongQuestionBook: React.FC<WrongQuestionBookProps> = ({ onPracticeAgain }) => {
  const [items, setItems] = useState<WrongQuestionItem[]>(() => getWrongQuestions('hs-01'));
  const [filterChapter, setFilterChapter] = useState<number>(0); // 0 = all

  const unresolvedCount = items.filter(i => !i.isResolved).length;
  const resolvedCount = items.filter(i => i.isResolved).length;
  const total = items.length || 1;
  const rate = Math.round((resolvedCount / total) * 100);

  const filtered = items.filter(item => {
    if (filterChapter === 0) return true;
    return item.question.chapterId === filterChapter;
  });

  const handleResolve = (id: string) => {
    resolveWrongQuestion(id);
    setItems(getWrongQuestions('hs-01'));
    alert('🎉 Tuyệt vời! Bạn đã sửa đúng câu này và ghi nhận vào tiến độ học tập!');
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-8">
      {/* Header: Sổ câu sai thông minh */}
      <section className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <span className="material-symbols-outlined text-2xl fill-icon">auto_stories</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight">Sổ câu sai thông minh</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Biến lỗi sai thành kinh nghiệm - Tự tin bứt phá điểm số!
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">verified</span>
            KNTT
          </span>
        </div>

        {/* 3 Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
          <div className="bg-red-50 p-2.5 rounded-xl text-center border border-red-200">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
              <span className="material-symbols-outlined text-sm">pending_actions</span>
              <span className="font-bold text-base">{unresolvedCount}</span>
            </div>
            <span className="text-[10px] text-slate-600 font-medium">Cần khắc phục</span>
          </div>

          <div className="bg-emerald-50 p-2.5 rounded-xl text-center border border-emerald-200">
            <div className="flex items-center justify-center gap-1 text-emerald-700 mb-0.5">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span className="font-bold text-base">{resolvedCount}</span>
            </div>
            <span className="text-[10px] text-slate-600 font-medium">Đã sửa đúng</span>
          </div>

          <div className="bg-blue-50 p-2.5 rounded-xl text-center border border-blue-200">
            <div className="flex items-center justify-center gap-1 text-blue-700 mb-0.5">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="font-bold text-base">{rate}%</span>
            </div>
            <span className="text-[10px] text-slate-600 font-medium">Tỉ lệ sửa đạt</span>
          </div>
        </div>
      </section>

      {/* Chapter Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setFilterChapter(0)}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
            filterChapter === 0 ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Tất cả ({items.length})
        </button>
        <button
          onClick={() => setFilterChapter(6)}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
            filterChapter === 6 ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Chương VI: Phân số (8)
        </button>
        <button
          onClick={() => setFilterChapter(2)}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
            filterChapter === 2 ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Chương II: Tính chia hết (4)
        </button>
      </div>

      {/* Quick Action Daily Mission */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 p-4 text-white shadow-xs">
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold">
              <span className="material-symbols-outlined text-xs fill-icon">bolt</span>
              Nhiệm vụ hàng ngày
            </div>
            <h3 className="font-bold text-sm leading-snug">
              Luyện nhanh 5 câu sai hôm nay để nhận thêm 20 Sao ⭐!
            </h3>
            <p className="text-[11px] text-white/90">
              Chỉ mất khoảng 3 - 5 phút để ghi nhớ lâu hơn.
            </p>
          </div>
          <button
            onClick={() => onPracticeAgain()}
            className="tactile-btn-orange px-3.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1"
          >
            <span>Bắt đầu sửa sai</span>
            <span className="material-symbols-outlined text-sm">play_arrow</span>
          </button>
        </div>
      </section>

      {/* Câu hỏi cần rèn luyện */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-base">history_edu</span>
            <span>Câu hỏi cần rèn luyện</span>
          </h2>
          <span className="text-[11px] text-slate-400">Sắp xếp: Mới nhất</span>
        </div>

        {filtered.map(item => (
          <article
            key={item.id}
            className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 transition ${
              item.isResolved ? 'border-emerald-300 opacity-90' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px]">
                {item.question.lessonTitle}
              </span>
              {item.isResolved ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">check</span> Đã sửa đúng
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  Mới sai {item.lastWrongAt}
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-800">{item.question.content}</p>

            {/* Math Formula if present */}
            {item.question.mathFormula && (
              <div className="p-2.5 bg-slate-50 rounded-xl text-center font-bold text-sm text-blue-700 border border-slate-200">
                {item.question.mathFormula}
              </div>
            )}

            {/* Error note */}
            <div className="bg-red-50/70 border-l-4 border-red-500 rounded-r-xl p-2.5 text-xs text-red-900 space-y-0.5">
              <span className="font-bold block text-[11px]">Ghi chú lỗi thường gặp:</span>
              <p>{item.teacherNote}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              {!item.isResolved ? (
                <button
                  onClick={() => handleResolve(item.id)}
                  className="tactile-btn-blue flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Làm lại câu này &amp; Sửa sai</span>
                </button>
              ) : (
                <div className="flex-1 text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                  ✓ Bạn đã nắm vững câu hỏi này!
                </div>
              )}
              <button
                onClick={() => alert(`Lời giải mẫu:\n${item.question.solutionSteps[0]?.explanation || 'Áp dụng quy tắc SGK'}`)}
                className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-blue-700 font-bold text-xs hover:bg-slate-50"
              >
                Lời giải
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* 3. Tiến độ thành thạo các chương */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-base">insights</span>
              <span>Tiến độ thành thạo các chương</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Đánh giá theo chuẩn GDPT Kết nối tri thức</p>
          </div>
          <span className="text-xs text-blue-600 font-bold">Chi tiết &gt;</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Chương VI */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Chương VI: Phân số
              </span>
              <span className="text-blue-600 font-bold">68% <span className="font-normal text-slate-400 text-[10px]">(Đang tiến bộ)</span></span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }}></div>
            </div>
            <span className="text-[10px] text-slate-400 block">Còn 8 dạng bài cần củng cố thêm trước kỳ thi giữa kỳ.</span>
          </div>

          {/* Chương V */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Chương V: Tính chia hết trong tập tự nhiên
              </span>
              <span className="text-emerald-700 font-bold">82% <span className="font-normal text-slate-400 text-[10px]">(Đạt yêu cầu)</span></span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }}></div>
            </div>
            <span className="text-[10px] text-slate-400 block">Đã thành thạo dấu hiệu chia hết cho 2, 3, 5, 9 và BCNN.</span>
          </div>

          {/* Chương IV */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Chương IV: Một số hình phẳng trong thực tiễn
              </span>
              <span className="text-orange-600 font-bold">90% <span className="font-normal text-slate-400 text-[10px]">(Rất tốt)</span></span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '90%' }}></div>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">military_tech</span>
              Đã nhận Huy hiệu "Bậc thầy Hình phẳng Lớp 6"
            </span>
          </div>
        </div>
      </section>

      {/* Motivational Note */}
      <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-200 flex items-center gap-2.5">
        <span className="material-symbols-outlined text-blue-600 text-xl shrink-0">psychology</span>
        <div>
          <h4 className="font-bold text-xs text-blue-900">Sai lầm là cơ hội vàng để học hỏi</h4>
          <p className="text-[11px] text-slate-600">Làm lại mỗi ngày 10 phút giúp tăng ngay 1.5 - 2 điểm bài kiểm tra sắp tới.</p>
        </div>
      </div>
    </div>
  );
};
