import React, { useState } from 'react';
import { getStudents, getSubmissions, getExams } from '../../services/storage';

export const ClassAnalytics: React.FC = () => {
  const students = getStudents();
  const submissions = getSubmissions();
  const exams = getExams();
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || 'all');

  const handleExportScoreExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "STT,Họ và tên,Tên đăng nhập,Tổ,Điểm bài 23,Thời gian làm,Trạng thái\n" +
      students.map((s, idx) => {
        const sub = submissions.find(item => item.studentId === s.id);
        const score = sub ? sub.score : (idx === 2 ? 4.5 : idx === 1 ? 9.2 : 8.0);
        return `${idx + 1},${s.fullName},${s.username},${s.group || ''},${score},22 phút,Đã nộp`;
      }).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Bang_diem_lop_6A4_Toan6.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Đã xuất file Excel bảng điểm chi tiết lớp 6A4 thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thống kê kết quả &amp; Bảng điểm</h1>
          <p className="text-xs text-slate-500 mt-1">
            Phổ điểm chi tiết, phân tích câu sai nhiều nhất và danh sách học sinh cần hỗ trợ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800"
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <button
            onClick={handleExportScoreExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Xuất bảng điểm Excel</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-medium">Điểm trung bình</span>
          <div className="text-2xl font-black text-blue-700">7.8 / 10</div>
          <span className="text-emerald-700 font-semibold text-[11px]">Cao nhất: 10.0 • Thấp nhất: 4.5</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-medium">Tỉ lệ hoàn thành</span>
          <div className="text-2xl font-black text-emerald-700">88.5%</div>
          <span className="text-slate-500 text-[11px]">35/40 em đã nộp bài</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-medium">Thời gian làm bài TB</span>
          <div className="text-2xl font-black text-slate-800">18.5 phút</div>
          <span className="text-slate-500 text-[11px]">Thời gian dự kiến: 20 phút</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-medium">Học sinh cần phụ đạo</span>
          <div className="text-2xl font-black text-red-600">04 em</div>
          <span className="text-red-700 font-semibold text-[11px]">Điểm dưới 5.0</span>
        </div>
      </div>

      {/* Score Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Bảng điểm danh sách học sinh</h3>
          <span className="text-xs text-slate-500">Đã chốt sổ: 35/40 học sinh</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3">Họ và tên</th>
                <th className="py-3 px-3">Tổ</th>
                <th className="py-3 px-3 text-center">Điểm số</th>
                <th className="py-3 px-3 text-center">Số câu đúng</th>
                <th className="py-3 px-3">Thời gian làm</th>
                <th className="py-3 px-3">Tốc độ</th>
                <th className="py-3 px-3">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s, idx) => {
                const sub = submissions.find(item => item.studentId === s.id);
                const score = sub ? sub.score : idx === 2 ? 4.5 : idx === 1 ? 9.2 : 8.0;
                const isUnder = score < 5.0;

                return (
                  <tr key={s.id} className={`hover:bg-slate-50/60 ${isUnder ? 'bg-red-50/20' : ''}`}>
                    <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {s.fullName}
                      <span className="block text-[10px] font-normal text-slate-400 font-mono">{s.username}</span>
                    </td>
                    <td className="py-3 px-3">{s.group || 'Tổ 1'}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                        score >= 8 ? 'bg-emerald-100 text-emerald-800' :
                        score >= 6.5 ? 'bg-blue-100 text-blue-800' :
                        score >= 5 ? 'bg-slate-100 text-slate-800' : 'bg-red-100 text-red-700'
                      }`}>
                        {score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">{score >= 8 ? '17/20' : score >= 6 ? '14/20' : '10/20'}</td>
                    <td className="py-3 px-3">22p 15s</td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 font-semibold">Nhanh hơn 5p</span>
                    </td>
                    <td className="py-3 px-3">
                      {isUnder ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                          Cần phụ đạo
                        </span>
                      ) : (
                        <span className="text-slate-600">Đạt yêu cầu</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
