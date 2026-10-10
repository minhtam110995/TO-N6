import React, { useState } from 'react';
import { getSubmissions } from '../../services/storage';

interface ParentDashboardProps {
  onOpenHistory: () => void;
  onOpenContact: () => void;
  onRemindChild: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  onOpenHistory,
  onOpenContact,
  onRemindChild,
}) => {
  const [remindToast, setRemindToast] = useState(false);
  const submissions = getSubmissions();

  const handleRemind = () => {
    setRemindToast(true);
    setTimeout(() => setRemindToast(false), 3000);
    onRemindChild();
  };

  return (
    <div className="w-full max-w-[420px] mx-auto space-y-4 pb-8">
      {/* Toast Alert */}
      {remindToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 text-xs">
          <span className="material-symbols-outlined text-orange-400 text-lg">notification_add</span>
          <span>Đã gửi thông báo nhắc nhở làm Bài 23 đến điện thoại của con Minh Khang!</span>
        </div>
      )}

      {/* 1. QUICK PROFILE & SNAPSHOT BANNER */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Đang học tích cực
            </span>
            <span className="text-xs font-semibold text-slate-500">Tuần 24</span>
          </div>
          <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
            Toán 6 KNTT
            <span className="material-symbols-outlined text-sm">auto_stories</span>
          </span>
        </div>

        {/* 4 KPIs Grid Bento */}
        <div className="grid grid-cols-2 gap-2.5 pt-3">
          {/* KPI 1 */}
          <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-medium">Điểm TB tuần</span>
              <span className="material-symbols-outlined text-blue-600 text-base fill-icon">star</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">8.4</span>
              <span className="text-xs text-slate-400">/ 10</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              <span>+0.6 so với tuần trước</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-medium">Tổng thời gian</span>
              <span className="material-symbols-outlined text-orange-600 text-base">timer</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">4h 15p</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-700">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              <span>Đạt 105% mục tiêu</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-medium">Số bài đã nộp</span>
              <span className="material-symbols-outlined text-blue-600 text-base">assignment_turned_in</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              5 / 6 <span className="text-xs font-normal text-slate-400">bài</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Hoàn thành <strong className="text-slate-900">83%</strong> nhiệm vụ
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-medium">Bài trễ hạn</span>
              <span className="material-symbols-outlined text-emerald-600 text-base">verified</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">0 bài</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">sentiment_very_satisfied</span>
              <span>Đúng hạn tuyệt vời!</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. URGENT ALERT & HOMEWORK REMINDER */}
      <section className="bg-orange-50/70 border border-orange-200 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">alarm</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-orange-800 font-extrabold">
                CẦN HOÀN THÀNH HÔM NAY
              </span>
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.2 rounded-full">
                Hạn: 21:00 tối nay
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
              Bài 23: Mở rộng phân số. Phân số bằng nhau
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Sách Bài Tập trang 12 • 8 câu trắc nghiệm &amp; tự luận
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleRemind}
                className="tactile-btn-orange flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <span className="material-symbols-outlined text-base">notification_add</span>
                <span>Nhắc con làm bài</span>
              </button>
              <button
                onClick={onOpenHistory}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition"
              >
                Xem đề bài
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LINE CHART: SCORE OVER WEEKS */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Biến động điểm số qua các tuần</h3>
            <p className="text-xs text-slate-500">Học kỳ II (Toán 6 - Kết nối tri thức)</p>
          </div>
          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-full">
            TB: 7.9 đ
          </span>
        </div>

        {/* SVG Line Chart (matching design exactly) */}
        <div className="w-full pt-2">
          <svg className="w-full h-32 overflow-visible" viewBox="0 0 320 120">
            <defs>
              <linearGradient id="scoreAreaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line x1="20" y1="15" x2="310" y2="15" stroke="#f1f5f9" strokeDasharray="3,3" />
            <text x="5" y="18" fill="#94a3b8" fontSize="9">10</text>
            <line x1="20" y1="45" x2="310" y2="45" stroke="#f1f5f9" strokeDasharray="3,3" />
            <text x="10" y="48" fill="#94a3b8" fontSize="9">8</text>
            <line x1="20" y1="75" x2="310" y2="75" stroke="#f1f5f9" strokeDasharray="3,3" />
            <text x="10" y="78" fill="#94a3b8" fontSize="9">6</text>
            <line x1="20" y1="100" x2="310" y2="100" stroke="#cbd5e1" />
            <text x="10" y="103" fill="#94a3b8" fontSize="9">0</text>

            {/* Area */}
            <path
              d="M 35 52.5 C 65 52.5, 75 45, 100 45 C 125 45, 140 48, 165 48 C 190 48, 205 48, 230 48 C 255 48, 270 39, 295 39 L 295 100 L 35 100 Z"
              fill="url(#scoreAreaGradient)"
            />

            {/* Line */}
            <path
              d="M 35 52.5 C 65 52.5, 75 45, 100 45 C 125 45, 140 48, 165 48 C 190 48, 205 48, 230 48 C 255 48, 270 39, 295 39"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Points & Labels */}
            <circle cx="35" cy="52.5" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
            <text x="35" y="42" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">7.5</text>
            <text x="35" y="114" fill="#64748b" fontSize="9" textAnchor="middle">T20</text>

            <circle cx="100" cy="45" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
            <text x="100" y="35" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">8.0</text>
            <text x="100" y="114" fill="#64748b" fontSize="9" textAnchor="middle">T21</text>

            <circle cx="165" cy="48" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
            <text x="165" y="38" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">7.8</text>
            <text x="165" y="114" fill="#64748b" fontSize="9" textAnchor="middle">T22</text>

            <circle cx="230" cy="48" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
            <text x="230" y="38" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">7.8</text>
            <text x="230" y="114" fill="#64748b" fontSize="9" textAnchor="middle">T23</text>

            <circle cx="295" cy="39" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            <rect x="277" y="18" width="36" height="17" rx="4" fill="#004ac6" />
            <text x="295" y="30" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">8.4đ</text>
            <text x="295" y="114" fill="#004ac6" fontSize="9" fontWeight="bold" textAnchor="middle">T24</text>
          </svg>
        </div>

        {/* Insight Box */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
          <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5">insights</span>
          <p className="leading-relaxed">
            <strong className="text-emerald-700 font-bold">Đánh giá hệ thống: </strong>
            Điểm số có xu hướng tăng đều (+0.9 trong tháng), con tiến bộ rõ rệt ở phần Phân số và Số học.
          </p>
        </div>
      </section>

      {/* 4. BAR CHART: 7-DAY STUDY TIME */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Thời gian tự luyện 7 ngày qua</h3>
            <p className="text-xs text-slate-500">Khuyến nghị: 30 - 45 phút / ngày</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-base text-slate-900">36p</span>
            <span className="block text-[10px] text-slate-400">Trung bình/ngày</span>
          </div>
        </div>

        {/* 7 Bars Component */}
        <div className="pt-2">
          <div className="h-28 flex items-end justify-between gap-2 px-1 border-b border-slate-100 pb-1">
            {[
              { day: 'T2', min: '35p', height: '58%', highlight: false },
              { day: 'T3', min: '45p', height: '75%', highlight: false },
              { day: 'T4', min: '30p', height: '50%', highlight: false },
              { day: 'T5', min: '50p', height: '83%', highlight: false },
              { day: 'T6', min: '25p', height: '41%', highlight: false },
              { day: 'T7', min: '60p 🔥', height: '100%', highlight: true },
              { day: 'CN', min: '10p', height: '20%', highlight: false },
            ].map(col => (
              <div key={col.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className={`text-[10px] ${col.highlight ? 'font-bold text-orange-600' : 'text-slate-400'}`}>
                  {col.min}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    col.highlight ? 'bg-orange-500 shadow-xs' : 'bg-blue-100'
                  }`}
                  style={{ height: col.height }}
                ></div>
                <span className={`text-xs mt-0.5 ${col.highlight ? 'font-bold text-orange-600' : 'text-slate-600'}`}>
                  {col.day}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-orange-700 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Thứ 7 học hăng say nhất (Ôn tập cuối tuần)
            </span>
            <span className="text-emerald-700 font-bold text-[11px]">Đạt chuẩn 6/7 ngày</span>
          </div>
        </div>
      </section>

      {/* 5. WEAK TOPICS & PARENT GUIDANCE */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">flag</span>
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Chủ đề cần hỗ trợ</h3>
              <p className="text-[11px] text-slate-500">Dựa trên các bài tập làm sai nhiều lần</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
            2 chủ đề
          </span>
        </div>

        {/* Topic 1 */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                Chương II: Quy tắc dấu ngoặc khi thực hiện phép tính
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="text-slate-500">Mức nắm vững:</span>
                <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '55%' }}></div>
                </div>
                <span className="font-bold text-orange-600">55%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1 text-orange-700 font-bold text-[11px]">
              <span className="material-symbols-outlined text-sm">psychology</span>
              <span>Gợi ý đồng hành cùng con:</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Con thường nhầm dấu khi bỏ dấu ngoặc có dấu trừ đằng trước: ví dụ <code className="bg-slate-100 px-1 py-0.2 rounded font-mono font-bold text-slate-800">-(a - b) = -a + b</code>. Ba mẹ nhắc con đọc kỹ phần đóng khung màu cam trang 68 SGK.
            </p>
          </div>

          <button
            onClick={() => alert('Đã gửi thông điệp nhắc con Khang làm lại chuyên đề Quy tắc dấu ngoặc!')}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">replay</span>
            <span>Gợi ý con ôn lại chuyên đề này</span>
          </button>
        </div>

        {/* Topic 2 */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
          <div>
            <h4 className="font-bold text-xs text-slate-900">Rút gọn phân số về tối giản</h4>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-slate-500">Mức nắm vững:</span>
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="font-bold text-blue-700">65%</span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1 text-blue-700 font-bold text-[11px]">
              <span className="material-symbols-outlined text-sm">lightbulb</span>
              <span>Gợi ý đồng hành cùng con:</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Con hay quên chia cho Ước chung lớn nhất (ƯCLN) mà chỉ rút gọn 1 lần rồi dừng lại. Khuyên con kiểm tra xem tử và mẫu còn ước chung nào khác 1 không.
            </p>
          </div>
        </div>

        {/* Parent Communication Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onOpenContact}
            className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition"
          >
            <span className="material-symbols-outlined text-base">forum</span>
            <span>Trao đổi với Cô Tâm</span>
          </button>
          <button
            onClick={() => alert('Đã gửi tin nhắn động viên tới tài khoản học sinh của con Khang!')}
            className="tactile-btn-orange py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <span className="material-symbols-outlined text-base">favorite</span>
            <span>Gửi lời nhắn động viên</span>
          </button>
        </div>
      </section>

      {/* 6. RECENT HOMEWORK HISTORY SUMMARY */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Lịch sử bài làm gần đây</h3>
          <button
            onClick={onOpenHistory}
            className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>Xem toàn bộ</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        {/* Submissions */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
              <div>
                <div className="font-bold text-slate-900">Bài 22: Hình có trục đối xứng</div>
                <div className="text-[11px] text-slate-500">Hôm qua, 19:45 • Hoàn thành 100%</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-base text-emerald-700">9.5</span>
              <span className="text-[10px] text-slate-400 block">10 câu</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">assignment</span>
              <div>
                <div className="font-bold text-slate-900">Luyện tập chung: Phép nhân và chia hai số nguyên</div>
                <div className="text-[11px] text-slate-500">Thứ 5, 20:10 • Hoàn thành đúng hạn</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-base text-blue-700">8.0</span>
              <span className="text-[10px] text-slate-400 block">15 câu</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
