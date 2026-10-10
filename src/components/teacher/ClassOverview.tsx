import React, { useState } from 'react';
import { getExams, getStudents } from '../../services/storage';

interface ClassOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateExam: () => void;
  onOpenCreateAccount: () => void;
}

export const ClassOverview: React.FC<ClassOverviewProps> = ({
  onNavigateTab,
  onOpenCreateExam,
  onOpenCreateAccount,
}) => {
  const students = getStudents();
  const exams = getExams();
  const [filterType, setFilterType] = useState<'all' | 'active' | 'completed'>('all');
  const [showReminderToast, setShowReminderToast] = useState(false);

  const handleRemindClass = () => {
    setShowReminderToast(true);
    setTimeout(() => setShowReminderToast(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {showReminderToast && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <div>
            <div className="font-bold text-sm">Đã gửi tin nhắn nhắc nhở!</div>
            <div className="text-xs text-slate-300">5 học sinh chưa nộp Bài 23 đã nhận được thông báo qua Zalo &amp; App.</div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan lớp 6A4 - Cô Tâm</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Đang hoạt động tốt
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tiến độ học tập môn Toán 6 (Bộ sách Kết nối tri thức với cuộc sống) - Năm học 2026-2027
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 shadow-xs">
            <span className="material-symbols-outlined text-blue-600 text-base">calendar_today</span>
            <span>Năm học 2026-2027 • Lớp 6A4</span>
          </div>
          <button
            onClick={() => alert('Đang xuất báo cáo tổng quan tuần 24 theo chuẩn mẫu PISA THCS...')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Xuất báo cáo tuần</span>
          </button>
        </div>
      </div>

      {/* 4 KPI METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Tổng số học sinh</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                40 <span className="text-sm font-normal text-slate-500">em</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>100% tài khoản đã kích hoạt</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Bài tập đang giao</span>
              <div className="text-3xl font-extrabold text-blue-600 mt-1">
                3 <span className="text-sm font-normal text-slate-500">bài tập</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">assignment</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-orange-600 font-semibold truncate">
            <span className="material-symbols-outlined text-base">timer</span>
            <span>1 bài hạn 23:59 hôm nay (Bài 23)</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Tỉ lệ nộp bài TB</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">88.5%</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">trending_up</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span className="material-symbols-outlined text-base">arrow_upward</span>
            <span>Tăng 4.2% so với tuần trước</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Điểm trung bình lớp</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                7.8 <span className="text-sm font-normal text-slate-500">/ 10</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">star</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="material-symbols-outlined text-base text-blue-600">pie_chart</span>
            <span>Phổ điểm Khá - Giỏi chiếm 65%</span>
          </div>
        </div>
      </section>

      {/* TWO CORE SECTIONS (BENTO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION 1: HỌC SINH CẦN QUAN TÂM (7 COLS) */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">warning</span>
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900">Học sinh cần quan tâm</h2>
                  <p className="text-xs text-slate-500">Cảnh báo sớm 4 học sinh có dấu hiệu đuối hoặc thiếu bài</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                4 học sinh
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Student 1: Trần Minh Khôi */}
              <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-200 text-red-800 font-bold flex items-center justify-center text-xs shrink-0">
                    MK
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Trần Minh Khôi</h3>
                      <span className="px-2 py-0.2 rounded bg-red-100 text-red-700 text-[11px] font-bold">
                        Điểm: 4.5/10
                      </span>
                    </div>
                    <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error_outline</span>
                      Sai nhiều: Rút gọn phân số • Chưa nộp 2 bài liên tiếp
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => alert('Gửi tin nhắn thông báo tình hình học tới Zalo Phụ huynh Ông Trần Văn Đức (0904.778.899)')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    <span>Nhắn PH</span>
                  </button>
                  <button
                    onClick={() => alert('Đã tạo phiếu giao bài phụ đạo 5 câu chuyên đề Rút gọn phân số cho em Khôi!')}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-sm">assignment_late</span>
                    <span>Giao phụ đạo</span>
                  </button>
                </div>
              </div>

              {/* Student 2: Lê Bảo Ngọc */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                    BN
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Lê Bảo Ngọc</h3>
                      <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">
                        Điểm: 5.0/10
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-amber-600">change_circle</span>
                      Hay nhầm quy tắc dấu ngoặc khi nhân số nguyên
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('students')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>Xem chi tiết</span>
                </button>
              </div>

              {/* Student 3: Đỗ Gia Huy */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                    GH
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Đỗ Gia Huy</h3>
                      <span className="px-2 py-0.2 rounded bg-slate-200 text-slate-700 text-[11px] font-semibold">
                        Hoàn thành 45%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-orange-600">schedule</span>
                      Nộp muộn 3 bài liên tiếp trong 2 tuần qua
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Đã gửi thông báo nhắc nhở làm bài đến em Đỗ Gia Huy.')}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">notifications_active</span>
                  <span>Nhắc nhở</span>
                </button>
              </div>

              {/* Student 4: Phạm Quỳnh Anh */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                    QA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Phạm Quỳnh Anh</h3>
                      <span className="px-2 py-0.2 rounded bg-slate-200 text-slate-700 text-[11px] font-semibold">
                        Điểm: 5.8/10
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-blue-600">lightbulb</span>
                      Cần củng cố: Phép chia hết và tìm ước chung lớn nhất
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Đã mở giao diện hỗ trợ kèm riêng cho em Quỳnh Anh.')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">support</span>
                  <span>Hỗ trợ bài</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Dữ liệu tự động cập nhật sau mỗi lượt nộp bài</span>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Xem toàn bộ sổ theo dõi (40 em)</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </section>

        {/* SECTION 2: 3 CHỦ ĐỀ CẢ LỚP YẾU NHẤT (5 COLS) */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">analytics</span>
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900">3 chủ đề cả lớp yếu nhất</h2>
                  <p className="text-xs text-slate-500">Chuẩn chương trình Toán 6 - Kết nối tri thức</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* Topic 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[11px] font-bold">
                      Tỉ lệ sai 42%
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">Bài 23: Rút gọn phân số về tối giản</h3>
                  </div>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">Yếu nhất</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white text-xs text-slate-600 border-l-2 border-blue-600">
                  <span className="font-bold text-slate-900">Nguyên nhân:</span> Hay quên chia cả tử và mẫu cho ƯCLN; nhầm lẫn dấu âm ở mẫu số.
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      alert('Hệ thống đã tự bốc 5 câu trọng tâm về Rút gọn phân số và sẵn sàng giao cho lớp!');
                      onOpenCreateExam();
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-base">quiz</span>
                    <span>Giao bài bổ trợ 5 câu</span>
                  </button>
                  <button
                    onClick={() => onNavigateTab('questions')}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    title="Mở ngân hàng câu hỏi"
                  >
                    <span className="material-symbols-outlined text-base">library_books</span>
                  </button>
                </div>
              </div>

              {/* Topic 2 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">
                      Tỉ lệ sai 38%
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">Bài 16: Phép nhân số nguyên &amp; dấu ngoặc</h3>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white text-xs text-slate-600 border-l-2 border-orange-500">
                  <span className="font-bold text-slate-900">Nguyên nhân:</span> Nhầm đổi dấu các số hạng bên trong khi trước dấu ngoặc là dấu trừ -(a - b).
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onOpenCreateExam()}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">add_task</span>
                    <span>Giao bài củng cố</span>
                  </button>
                </div>
              </div>

              {/* Topic 3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-bold">
                      Tỉ lệ sai 35%
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">Bài 8: Ước và bội. Ước chung lớn nhất</h3>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white text-xs text-slate-600 border-l-2 border-slate-400">
                  <span className="font-bold text-slate-900">Nguyên nhân:</span> Phân tích ra thừa số nguyên tố còn sót ước số nguyên tố 3 và 7.
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onOpenCreateExam()}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">add_task</span>
                    <span>Giao bài ôn tập</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Phân tích ma trận kiến thức SGK</span>
            <button
              onClick={() => onNavigateTab('questions')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Mở ngân hàng câu hỏi</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </section>
      </div>

      {/* FULL-WIDTH RECENT EXAMS PROGRESS TABLE */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">checklist</span>
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Tiến độ bài tập gần đây</h2>
              <p className="text-xs text-slate-500">Danh sách bài tập đang giao và kết quả nộp bài của học sinh lớp 6A2</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition ${filterType === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tất cả bài tập
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-3 py-1.5 rounded-lg transition ${filterType === 'active' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Đang diễn ra ({exams.length})
            </button>
            <button
              onClick={() => setFilterType('completed')}
              className={`px-3 py-1.5 rounded-lg transition ${filterType === 'completed' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Đã kết thúc
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Tên bài kiểm tra / Luyện tập</th>
                <th className="py-3 px-3">Chương trình SGK</th>
                <th className="py-3 px-3">Tiến độ nộp bài</th>
                <th className="py-3 px-3 text-center">Điểm TB</th>
                <th className="py-3 px-3">Hạn nộp</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {/* Row 1: Bài 23 */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" title="Sắp hết hạn"></span>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Bài 23: Phân số bằng nhau &amp; Tính chất</div>
                      <div className="text-[11px] text-slate-500">Trắc nghiệm 10 câu • Thời gian 20 phút</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                    Chương VI: Phân số
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <div className="w-44">
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-blue-600">35 / 40 em</span>
                      <span className="text-slate-500">87.5%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '87.5%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                    8.1
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <div className="text-orange-600 font-semibold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">alarm</span>
                    <span>23:59 hôm nay</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Còn 5 học sinh chưa nộp</div>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={() => onNavigateTab('analytics')}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs"
                  >
                    Xem chi tiết kết quả
                  </button>
                </td>
              </tr>

              {/* Row 2: Ôn tập Chương V */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" title="Đang diễn ra"></span>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Ôn tập cuối Chương V: Số thập phân</div>
                      <div className="text-[11px] text-slate-500">Trắc nghiệm kết hợp tự luận • 15 câu</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                    Chương V: Số thập phân
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <div className="w-44">
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-blue-600">38 / 40 em</span>
                      <span className="text-slate-500">95.0%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                    7.6
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <div className="text-slate-700 font-medium text-xs">14/03/2025</div>
                  <div className="text-[11px] text-slate-500">Còn 2 ngày</div>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={() => onNavigateTab('analytics')}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs"
                  >
                    Xem chi tiết kết quả
                  </button>
                </td>
              </tr>

              {/* Row 3: Kiểm tra 15 phút Số nguyên */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Hoàn thành 100%"></span>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Kiểm tra 15 phút: Tập hợp các số nguyên</div>
                      <div className="text-[11px] text-slate-500">Đề trắc nghiệm chuẩn hóa 10 câu</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                    Chương III: Số nguyên
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <div className="w-44">
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-emerald-700 font-bold">40 / 40 em</span>
                      <span className="text-emerald-700 font-bold">100%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                    8.4
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <div className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">done_all</span>
                    <span>Đã chốt sổ</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Đã chấm xong 100%</div>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={() => onNavigateTab('analytics')}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs"
                  >
                    Xem chi tiết kết quả
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-xs text-slate-500">Hiển thị 3 trên tổng số 18 bài tập đã tạo trong học kỳ</span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRemindClass}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>Nhắc nhở cả lớp làm bài sắp đến hạn</span>
            </button>
            <button
              onClick={onOpenCreateExam}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Tạo đề mới</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
