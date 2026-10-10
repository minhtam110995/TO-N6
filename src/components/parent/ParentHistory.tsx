import React, { useState } from 'react';
import { getSubmissions } from '../../services/storage';

interface ParentHistoryProps {
  onOpenContact: () => void;
  onViewSubmissionDetail?: (subId: string) => void;
}

export const ParentHistory: React.FC<ParentHistoryProps> = ({
  onOpenContact,
  onViewSubmissionDetail,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'high' | 'low'>('all');
  const submissions = getSubmissions();

  return (
    <div className="w-full max-w-[420px] mx-auto space-y-4 pb-8">
      {/* Title */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">Lịch sử bài làm của con</h1>
          <p className="text-xs text-slate-500">Tổng hợp 18 bài luyện tập và kiểm tra định kỳ</p>
        </div>
        <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs">
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          Học kỳ II
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
            filterType === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <span>Tất cả</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">18</span>
        </button>

        <button
          onClick={() => setFilterType('high')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1 ${
            filterType === 'high' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <span>Điểm cao &gt;= 8</span>
          <span className="text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.2 rounded-full text-[10px]">12</span>
        </button>

        <button
          onClick={() => setFilterType('low')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1 ${
            filterType === 'low' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <span>Cần cải thiện &lt; 7</span>
          <span className="text-red-700 bg-red-100 font-bold px-1.5 py-0.2 rounded-full text-[10px]">3</span>
        </button>
      </div>

      {/* TỐC ĐỘ LÀM BÀI CỦA CON (BENTO METRIC) */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-base">speed</span>
            </div>
            <span className="font-bold text-xs text-slate-900">Tốc độ làm bài của con</span>
          </div>
          <span className="text-[11px] text-slate-400">So với chuẩn GV</span>
        </div>

        {/* Segmented bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
          <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: '44.4%' }}></div>
          <div className="h-full bg-blue-600" style={{ width: '50%' }}></div>
          <div className="h-full bg-orange-500 rounded-r-full" style={{ width: '5.6%' }}></div>
        </div>

        {/* 3 Metric columns */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
            <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
              <span className="material-symbols-outlined text-sm">bolt</span>
              Nhanh hơn
            </div>
            <div className="font-bold text-base text-slate-900 mt-0.5">
              8 <span className="text-xs font-normal text-slate-500">bài</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Tư duy nhanh nhẹn</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
            <div className="flex items-center gap-1 text-blue-700 font-bold text-[11px]">
              <span className="material-symbols-outlined text-sm">timer</span>
              Đúng mức
            </div>
            <div className="font-bold text-base text-slate-900 mt-0.5">
              9 <span className="text-xs font-normal text-slate-500">bài</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Tập trung, cẩn thận</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
            <div className="flex items-center gap-1 text-orange-700 font-bold text-[11px]">
              <span className="material-symbols-outlined text-sm">hourglass_bottom</span>
              Chậm hơn
            </div>
            <div className="font-bold text-base text-slate-900 mt-0.5">
              1 <span className="text-xs font-normal text-slate-500">bài</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Khó ở tìm x</div>
          </div>
        </div>
      </section>

      {/* DANH SÁCH BÀI TẬP CHI TIẾT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Bài nộp gần đây nhất</span>
          <span className="text-blue-600 font-semibold cursor-pointer">Theo thời gian ↓</span>
        </div>

        {/* Card 1: Điểm 8.5 */}
        <article className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                Kiểm tra 15 phút
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-1">Phân số bằng nhau &amp; Rút gọn phân số</h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-xs">schedule</span>
                Hôm qua, 11/03/2025 lúc 20:45
              </p>
            </div>
            <div className="text-center px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 min-w-[55px]">
              <div className="text-xl font-extrabold text-emerald-700">8.5</div>
              <span className="text-[10px] font-bold text-emerald-700">Giỏi</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
              <div>
                <div className="font-bold text-slate-900">Đúng 17/20</div>
                <div className="text-red-600 text-[10px]">Sai 3 câu</div>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">timer</span>
              <div>
                <div className="font-bold text-slate-900">22p 15s</div>
                <div className="text-emerald-700 text-[10px] font-semibold">⚡ Nhanh hơn 5p</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-xl p-2.5 border-l-4 border-blue-600 text-xs text-slate-700 space-y-0.5">
            <div className="font-bold text-blue-900 text-[11px] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">psychology</span>
              Lời phê của Cô Mai (GV Toán):
            </div>
            <p className="text-[11px] leading-relaxed">
              "Khang nắm chắc bài, cần cẩn thận hơn ở bước tìm ƯCLN để tối giản phân số."
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => alert('Danh sách câu đúng: 1, 2, 4, 5, 6, 8... Câu sai: 3, 7, 14 (đã lưu vào sổ sai để con luyện lại).')}
              className="py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Câu đúng/sai
            </button>
            <button
              onClick={() => onViewSubmissionDetail ? onViewSubmissionDetail('sub-khang-01') : alert('Đang mở chi tiết bài làm...')}
              className="py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
            >
              Xem bài làm
            </button>
          </div>
        </article>

        {/* Card 2: Điểm 7.5 */}
        <article className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                Ôn tập cuối Chương V
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-1">Số thập phân &amp; Các phép tính</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">08/03/2025</p>
            </div>
            <div className="text-center px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 min-w-[55px]">
              <div className="text-xl font-extrabold text-blue-700">7.5</div>
              <span className="text-[10px] font-bold text-blue-700">Khá</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">task_alt</span>
              <div>
                <div className="font-bold text-slate-900">Đúng 15/20</div>
                <div className="text-red-600 text-[10px]">Sai 5 câu</div>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">schedule</span>
              <div>
                <div className="font-bold text-slate-900">28p / 30p</div>
                <div className="text-slate-400 text-[10px]">Đúng mức dự kiến</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 text-xs">
            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
              <span className="material-symbols-outlined text-sm">verified</span>
              Đã tự sửa 4/5 câu trong Sổ câu sai
            </span>
            <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
          </div>
        </article>

        {/* Card 3: Điểm 6.0 */}
        <article className="bg-white rounded-2xl p-4 border border-orange-200 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                Bài 10 - Chương II
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-1">Quy tắc dấu ngoặc &amp; Phép nhân số nguyên</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">02/03/2025</p>
            </div>
            <div className="text-center px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 min-w-[55px]">
              <div className="text-xl font-extrabold text-orange-600">6.0</div>
              <span className="text-[10px] font-bold text-orange-600">Cần cố gắng</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600 text-lg">priority_high</span>
              <div>
                <div className="font-bold text-slate-900">Đúng 12/20</div>
                <div className="text-red-600 text-[10px]">Sai 8 câu</div>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
              <span className="material-symbols-outlined text-orange-600 text-lg">hourglass_top</span>
              <div>
                <div className="font-bold text-slate-900">35p / 25p</div>
                <div className="text-orange-700 text-[10px] font-semibold">Chậm hơn 10p</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50/60 rounded-xl p-2.5 border-l-4 border-orange-500 text-xs text-slate-700 space-y-0.5">
            <div className="font-bold text-orange-900 text-[11px]">Lời phê của Cô Mai:</div>
            <p className="text-[11px] leading-relaxed">
              "Con còn lúng túng khi đổi dấu trong ngoặc có dấu trừ phía trước, phụ huynh nhắc con luyện lại."
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => alert('Chi tiết bài 10: Sai ở câu số 4, 8, 11, 14, 15, 17, 18, 19 do chưa đổi dấu.')}
              className="py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Xem chi tiết
            </button>
            <button
              onClick={() => alert('Đã gửi thông báo nhắc con ôn lại chuyên đề Quy tắc dấu ngoặc!')}
              className="py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs"
            >
              Nhắc con ôn lại
            </button>
          </div>
        </article>
      </div>

      {/* Banner Liên hệ giáo viên bộ môn */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
            CM
          </div>
          <div>
            <div className="text-xs text-blue-700 font-bold">Giáo viên bộ môn Toán 6A2</div>
            <h4 className="font-bold text-sm text-slate-900">Cô Hoàng Thị Mai</h4>
            <p className="text-[11px] text-slate-500">Thường phản hồi trong 15 phút</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Cần hỗ trợ thêm về phương pháp học và kết quả của con? Nhắn tin trao đổi trực tiếp với cô giáo.
        </p>
        <button
          onClick={onOpenContact}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
        >
          <span className="material-symbols-outlined text-base">chat</span>
          <span>Nhắn tin với Cô Mai</span>
        </button>
      </section>
    </div>
  );
};
