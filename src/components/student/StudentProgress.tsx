import React from 'react';

export const StudentProgress: React.FC = () => {
  return (
    <div className="space-y-4 max-w-md mx-auto pb-8">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">Tiến độ học tập &amp; Huy hiệu</h1>
          <p className="text-xs text-slate-500">Thành tích môn Toán 6 của em Nguyễn Minh Khang</p>
        </div>
        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">
          Hạng 5 Lớp 6A4
        </span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <span className="text-2xl font-black text-blue-700">8.4</span>
          <span className="text-xs text-slate-500 block font-medium">Điểm trung bình HK II</span>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
            Xuất sắc
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <span className="text-2xl font-black text-orange-600">380</span>
          <span className="text-xs text-slate-500 block font-medium">Tổng Sao XP tích lũy</span>
          <span className="text-[10px] text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded-full inline-block">
            +85 sao tuần này
          </span>
        </div>
      </div>

      {/* Badges Collection */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-500 text-base fill-icon">military_tech</span>
          <span>Bộ sưu tập Huy hiệu</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-emerald-200 space-y-1 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold text-lg">
              🏅
            </div>
            <div className="font-bold text-slate-900 text-xs">Bậc thầy phép cộng</div>
            <div className="text-[10px] text-emerald-700">Đã mở khóa 🎉</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-orange-200 space-y-1 text-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 mx-auto flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <div className="font-bold text-slate-900 text-xs">Chiến binh đúng giờ</div>
            <div className="text-[10px] text-orange-700">Đạt 5/5 bài đúng hạn</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-blue-200 space-y-1 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center font-bold text-lg">
              📐
            </div>
            <div className="font-bold text-slate-900 text-xs">Bậc thầy Hình phẳng</div>
            <div className="text-[10px] text-blue-700">90% mức độ thành thạo</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-center opacity-70">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center font-bold text-lg">
              🔒
            </div>
            <div className="font-bold text-slate-700 text-xs">Chuyên gia Phân số</div>
            <div className="text-[10px] text-slate-400">Cần đạt 80% Chương VI</div>
          </div>
        </div>
      </section>

      {/* Weekly target */}
      <section className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-blue-900 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>Mục tiêu tuần 24: Duy trì chuỗi Streak 7 ngày</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          Mỗi ngày hoàn thành tối thiểu 1 phiếu bài tập hoặc luyện 5 câu trong sổ câu sai để nhận phần thưởng cuối tuần!
        </p>
      </section>
    </div>
  );
};
