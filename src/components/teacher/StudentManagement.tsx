import React, { useState, useMemo } from 'react';
import { getStudents, getParents } from '../../services/storage';

interface StudentManagementProps {
  onOpenCreateAccount: () => void;
  onSelectStudentDetail: (studentId: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  onOpenCreateAccount,
  onSelectStudentDetail,
}) => {
  const students = getStudents();
  const parents = getParents();

  const [searchTerm, setSearchTerm] = useState('');
  const [academicFilter, setAcademicFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [parentFilter, setParentFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>(['hs-01', 'hs-02', 'hs-03']);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.parentName && s.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.phone && s.phone.includes(searchTerm));

      const matchGroup = groupFilter === 'all' || s.group === groupFilter;

      // Mock academic performance
      let academicTier = 'kha';
      if (s.id === 'hs-01' || s.id === 'hs-05') academicTier = 'gioi';
      if (s.id === 'hs-02') academicTier = 'xuatsac';
      if (s.id === 'hs-03') academicTier = 'phudao';

      const matchAcademic =
        academicFilter === 'all' ||
        (academicFilter === 'gioi' && (academicTier === 'gioi' || academicTier === 'xuatsac')) ||
        (academicFilter === 'kha' && academicTier === 'kha') ||
        (academicFilter === 'phudao' && academicTier === 'phudao');

      const isParentActive = s.id !== 'hs-03'; // student 3 parent hasn't installed app
      const matchParent =
        parentFilter === 'all' ||
        (parentFilter === 'active' && isParentActive) ||
        (parentFilter === 'inactive' && !isParentActive);

      return matchSearch && matchGroup && matchAcademic && matchParent;
    });
  }, [students, searchTerm, groupFilter, academicFilter, parentFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleResetPassword = (name: string) => {
    showToast(`Đã đặt lại mật khẩu cho ${name} về mặc định "Toan6@2026"!`);
  };

  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "STT,Họ và tên,Tên đăng nhập,Ngày sinh,Tổ,Phụ huynh,SĐT\n" +
      students.map((s, idx) => `${idx + 1},${s.fullName},${s.username},${s.birthDate || ''},${s.group || ''},${s.parentName || ''},${s.phone || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Danh_sach_lop_6A4_Toan6.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã tải tệp Excel/CSV danh sách học sinh và mật khẩu lớp 6A4!");
  };

  const handlePrintQR = () => {
    showToast("Đang chuẩn bị tệp in thẻ QR đăng nhập nhanh cho 40 học sinh lớp 6A4...");
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Actions Header */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>Toán 6</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Khối 6</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-blue-600 font-semibold">Lớp 6A4 (40 học sinh) - Năm học 2026-2027</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quản lý học sinh Lớp 6A4 - Cô Tâm</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Đang hoạt động (40/40 đã kích hoạt tài khoản)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrintQR}
            className="tactile-btn inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 shadow-2xs"
          >
            <span className="material-symbols-outlined text-blue-600 text-lg">qr_code_scanner</span>
            <span>In thẻ QR đăng nhập</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="tactile-btn inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 shadow-2xs"
          >
            <span className="material-symbols-outlined text-emerald-600 text-lg">file_download</span>
            <span>Xuất danh sách &amp; Mã</span>
          </button>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.xlsx, .xls, .csv';
              input.onchange = () => {
                showToast('Đã tải lên tệp Excel danh sách thành công! Đang tự động sinh tài khoản...');
              };
              input.click();
            }}
            className="tactile-btn inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 hover:bg-blue-100 shadow-2xs"
          >
            <span className="material-symbols-outlined text-blue-700 text-lg">upload_file</span>
            <span>Nhập từ Excel</span>
          </button>
          <button
            onClick={onOpenCreateAccount}
            className="tactile-btn inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span>Thêm học sinh mới</span>
          </button>
        </div>
      </section>

      {/* 4 STAT METRIC CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Tổng số học sinh</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">40</span>
              <span className="text-xs font-semibold text-slate-500">em</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-blue-600 font-semibold">Nam: 21</span>
              <span>•</span>
              <span className="text-orange-600 font-semibold">Nữ: 19</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-2xl">diversity_3</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Tài khoản Phụ huynh</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">38<span className="text-slate-400 font-normal text-base">/40</span></span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">95%</span>
            </div>
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span> 2 PH chưa cài app
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-2xl">family_restroom</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600"></div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Điểm TB môn Toán</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-600">7.8</span>
              <span className="text-xs font-medium text-slate-400">/ 10</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <span className="material-symbols-outlined text-xs">trending_up</span> +0.4
              </span>
            </div>
            <p className="text-xs text-slate-500">So với HK I (7.4)</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-2xl">grade</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Cần hỗ trợ &amp; Phụ đạo</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-orange-600">04</span>
              <span className="text-xs font-semibold text-slate-500">em</span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">Quan tâm</span>
            </div>
            <p className="text-xs text-orange-600 font-medium">Chương VI: Phân số &amp; Số thập phân</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <span className="material-symbols-outlined text-2xl">support_agent</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600"></div>
        </div>
      </section>

      {/* FILTER & BULK ACTIONS TOOLBAR */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Tên học sinh, Mã HS (hs6a2_...), Tên phụ huynh hoặc SĐT..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Academic */}
            <select
              value={academicFilter}
              onChange={e => setAcademicFilter(e.target.value)}
              className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
            >
              <option value="all">Học lực: Tất cả</option>
              <option value="gioi">Giỏi &amp; Xuất sắc (≥ 8.0)</option>
              <option value="kha">Khá (6.5 - 7.9)</option>
              <option value="phudao">Cần phụ đạo (&lt; 5.0)</option>
            </select>

            {/* Group */}
            <select
              value={groupFilter}
              onChange={e => setGroupFilter(e.target.value)}
              className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
            >
              <option value="all">Tổ: Tất cả (4 tổ)</option>
              <option value="Tổ 1">Tổ 1</option>
              <option value="Tổ 2">Tổ 2</option>
              <option value="Tổ 3">Tổ 3</option>
              <option value="Tổ 4">Tổ 4</option>
            </select>

            {/* Parent connection */}
            <select
              value={parentFilter}
              onChange={e => setParentFilter(e.target.value)}
              className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
            >
              <option value="all">Liên kết PH: Tất cả</option>
              <option value="active">Đã kích hoạt app (38)</option>
              <option value="inactive">Chưa cài app (2)</option>
            </select>

            {/* Reset Filter */}
            <button
              onClick={() => {
                setSearchTerm('');
                setAcademicFilter('all');
                setGroupFilter('all');
                setParentFilter('all');
              }}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition"
              title="Đặt lại bộ lọc"
            >
              <span className="material-symbols-outlined text-lg">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Bulk Action Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Đã chọn: <strong className="text-blue-600 font-bold">{selectedIds.length} học sinh</strong>
            </span>
            <div className="h-4 w-px bg-slate-200"></div>
            <button
              onClick={() => showToast(`Đã đặt lại mật khẩu về mặc định cho ${selectedIds.length} học sinh!`)}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">lock_reset</span>
              Đặt lại mật khẩu đã chọn
            </button>
            <button
              onClick={() => showToast(`Đã gửi thông báo nhắc học đến phụ huynh của ${selectedIds.length} em!`)}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">outgoing_mail</span>
              Gửi thông báo đến phụ huynh
            </button>
            <button
              onClick={() => showToast(`Đã mở giao diện phân chia tổ học tập cho ${selectedIds.length} học sinh!`)}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">drive_file_move</span>
              Chuyển Tổ / Nhóm
            </button>
          </div>
          <div className="text-slate-500 text-xs">
            Hiển thị kết quả: <strong>1 - {Math.min(pageSize, filteredStudents.length)}</strong> trên <strong>{filteredStudents.length}</strong>
          </div>
        </div>
      </section>

      {/* MAIN DATA TABLE */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-2 w-12 text-center">STT</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Phụ huynh liên kết</th>
                <th className="py-3 px-4">Tình hình học Toán (HK II)</th>
                <th className="py-3 px-4">Tài khoản &amp; Bảo mật</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((student, idx) => {
                const isChecked = selectedIds.includes(student.id);
                const isWarning = student.id === 'hs-03';
                const isStar = student.id === 'hs-02';

                let scoreAvg = '7.8';
                let tierLabel = 'Khá';
                let doneCount = '21/24';
                let lateCount = '0 bài trễ';
                let percent = 91;

                if (student.id === 'hs-01') {
                  scoreAvg = '8.8'; tierLabel = 'Giỏi'; doneCount = '24/24'; lateCount = '0 bài trễ'; percent = 100;
                } else if (student.id === 'hs-02') {
                  scoreAvg = '9.2'; tierLabel = 'Xuất sắc'; doneCount = '24/24'; lateCount = '0 bài trễ'; percent = 100;
                } else if (student.id === 'hs-03') {
                  scoreAvg = '4.5'; tierLabel = 'Cần cố gắng'; doneCount = '14/24'; lateCount = '5 bài trễ'; percent = 58;
                } else if (student.id === 'hs-04') {
                  scoreAvg = '7.6'; tierLabel = 'Khá'; doneCount = '20/24'; lateCount = '1 bài trễ'; percent = 87;
                } else if (student.id === 'hs-05') {
                  scoreAvg = '8.4'; tierLabel = 'Giỏi'; doneCount = '22/24'; lateCount = '0 bài trễ'; percent = 95;
                }

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/70 transition ${isWarning ? 'bg-red-50/20' : ''}`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectOne(student.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-500 font-semibold">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 border border-blue-200">
                          {student.fullName.split(' ').pop()?.slice(0, 2).toUpperCase() || 'HS'}
                        </div>
                        <div>
                          <div
                            onClick={() => onSelectStudentDetail(student.id)}
                            className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
                          >
                            {student.fullName}
                            <span className="inline-block px-1.5 py-0.2 text-[10px] font-bold bg-blue-50 text-blue-700 rounded">
                              {student.group || 'Tổ 1'}
                            </span>
                            {isWarning && (
                              <span className="inline-block px-1.5 py-0.2 text-[10px] font-bold bg-red-100 text-red-700 rounded">
                                Cần hỗ trợ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-blue-700 font-semibold">{student.username}</span>
                            <span>•</span>
                            <span>{student.birthDate || '12/03/2013'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-xs text-slate-900">{student.parentName || 'Chưa cập nhật'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{student.phone || '0912.xxx.xxx'}</div>
                        {isWarning ? (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            <span>Chưa cài app PH</span>
                          </div>
                        ) : (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            <span>Đã kích hoạt app</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-[200px]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`px-1.5 py-0.2 rounded font-bold ${
                            isWarning ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            TB: {scoreAvg} ({tierLabel})
                          </span>
                          <span className="font-bold text-slate-700">Nộp: {percent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isWarning ? 'bg-orange-500' : 'bg-blue-600'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Bài đúng: {doneCount}</span>
                          <span className={isWarning ? 'text-red-600 font-bold' : 'text-emerald-700 font-semibold'}>
                            {lateCount}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                        <span className="material-symbols-outlined text-emerald-600 text-xs">lock</span>
                        Đang hoạt động
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Đăng nhập: {student.lastActive || 'Hôm qua'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleResetPassword(student.fullName)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          title="Đặt lại mật khẩu"
                        >
                          <span className="material-symbols-outlined text-base">key</span>
                        </button>
                        <button
                          onClick={() => onSelectStudentDetail(student.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          title="Xem sổ theo dõi chi tiết"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </button>
                        <button
                          onClick={() => showToast(`Đã mở khung nhắn tin với Phụ huynh em ${student.fullName}`)}
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-slate-100 rounded-lg transition"
                          title="Nhắn tin phụ huynh"
                        >
                          <span className="material-symbols-outlined text-base">chat</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
            >
              <option value={10}>10 học sinh / trang</option>
              <option value={20}>20 học sinh / trang</option>
              <option value={40}>Tất cả 40 học sinh</option>
            </select>
            <span>trong tổng số 40 học sinh</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs">1</button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold text-xs">2</button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold text-xs">3</button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold text-xs">4</button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* AUTO-CREDENTIALS INFO SECTION */}
      <section className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-2xl">security</span>
              <h2 className="font-bold text-base text-slate-900">Cơ chế Cấp tài khoản Tự động cho Lớp 6A2</h2>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">Quy chuẩn GDPT</span>
            </div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Hệ thống tự động sinh tài khoản kép (Học sinh &amp; Phụ huynh đồng bộ) ngay khi thêm mới hoặc tải lên tệp Excel danh sách lớp. Học sinh đăng nhập làm bài tập, Phụ huynh đăng nhập để nhận báo cáo tiến độ tuần theo SGK Toán 6.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-left font-mono text-xs space-y-1 shadow-2xs">
              <div className="text-slate-500 font-sans text-[11px] font-bold">MẪU TÀI KHOẢN MẶC ĐỊNH:</div>
              <div><span className="text-slate-500">Tên đăng nhập HS:</span> <strong className="text-blue-600 font-bold">hs6a2_[hoten]</strong></div>
              <div><span className="text-slate-500">Mật khẩu mặc định:</span> <strong className="text-orange-600 font-bold">Toan6@2025</strong></div>
              <div><span className="text-slate-500">Tài khoản PH:</span> <strong className="text-emerald-700 font-bold">ph_hs6a2_[hoten]</strong> (kèm mã OTP qua SĐT)</div>
            </div>
            <button
              onClick={onOpenCreateAccount}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-600 text-xs font-bold border border-blue-300 hover:bg-blue-50 transition shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Cấu hình cấp mã</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
