import React, { useState } from 'react';
import { User, Role } from '../../types';
import { CURRENT_TEACHER, INITIAL_STUDENTS, INITIAL_PARENTS } from '../../data/mockData';
import { setCurrentUser, getStudents, getParents } from '../../services/storage';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onCancel?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onCancel }) => {
  const [role, setRole] = useState<Role>('student');
  const [username, setUsername] = useState('hs6a2_khang');
  const [password, setPassword] = useState('Toan6@2025');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const roleConfig = {
    student: {
      label: 'Mã học sinh hoặc Tên đăng nhập',
      placeholder: 'VD: hs6a4_khang hoặc HS2604',
      icon: 'badge',
      hint: 'Nhập mã học sinh do Cô Tâm cung cấp để bắt đầu giải toán, làm phiếu bài tập và tích lũy điểm sao!',
      defaultUser: 'hs6a4_khang',
      defaultPass: 'Toan6@2026',
    },
    teacher: {
      label: 'Email giáo viên hoặc Tên đăng nhập',
      placeholder: 'VD: cotamtoan hoặc tamneu1995',
      icon: 'mail',
      hint: 'Khu vực quản trị dành cho Cô Tâm - Giáo viên bộ môn Toán lớp 6A4 để giao bài tập và xem thống kê.',
      defaultUser: 'cotamtoan',
      defaultPass: 'Toan6@2026',
    },
    parent: {
      label: 'Số điện thoại phụ huynh đăng ký',
      placeholder: 'VD: 0912.345.678 (SĐT nhận tin nhắn từ trường)',
      icon: 'phone_android',
      hint: 'Phụ huynh tra cứu tiến độ làm bài, bảng xếp hạng sao tích lũy và nhận xét chi tiết của giáo viên.',
      defaultUser: '0912.345.678',
      defaultPass: 'Toan6@2026',
    },
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setUsername(roleConfig[newRole].defaultUser);
    setPassword(roleConfig[newRole].defaultPass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Vui lòng nhập tên đăng nhập hoặc số điện thoại!');
      return;
    }

    let authenticatedUser: User;
    if (role === 'teacher') {
      authenticatedUser = CURRENT_TEACHER;
    } else if (role === 'student') {
      const allStudents = getStudents();
      authenticatedUser = allStudents.find(s => s.username === username || s.fullName.toLowerCase().includes(username.toLowerCase())) || INITIAL_STUDENTS[0];
    } else {
      const allParents = getParents();
      authenticatedUser = allParents.find(p => p.phone === username || p.username === username) || INITIAL_PARENTS[0];
    }

    setCurrentUser(authenticatedUser);
    onLoginSuccess(authenticatedUser);
  };

  return (
    <div className="w-full max-w-[580px] mx-auto px-4 py-6 flex-1 flex flex-col justify-center">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4">
        {onCancel ? (
          <button onClick={onCancel} className="p-2 text-blue-600 hover:bg-slate-100 rounded-xl">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : <div />}
        <h2 className="font-bold text-sm text-blue-700">Toán 6 - Kết nối tri thức</h2>
        <button onClick={() => setShowHelpModal(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 border-2 border-blue-200 shadow-xs mb-3 relative">
          <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">local_fire_department</span>
            <span>KNTT</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">functions</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-1 text-xs">
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-semibold">
            EduMath 6 Connect
          </span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold">
            Lớp 6 THCS
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng nhập học tập</h1>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống học tập &amp; kiểm tra trực tuyến môn Toán Lớp 6
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Bạn tham gia với tư cách là:
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`h-11 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition ${
                role === 'student'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">school</span>
              <span>Học sinh</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              className={`h-11 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition ${
                role === 'teacher'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">co_present</span>
              <span>Giáo viên</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('parent')}
              className={`h-11 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition ${
                role === 'parent'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">family_restroom</span>
              <span>Phụ huynh</span>
            </button>
          </div>

          <div className="mt-2.5 px-3 py-2 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2 text-slate-600 text-[11px] leading-relaxed">
            <span className="material-symbols-outlined text-blue-600 text-sm shrink-0 mt-0.5">tips_and_updates</span>
            <span>{roleConfig[role].hint}</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {roleConfig[role].label}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                {roleConfig[role].icon}
              </span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={roleConfig[role].placeholder}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <label className="font-bold text-slate-700">Mật khẩu</label>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-base">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 pt-0.5">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Ghi nhớ đăng nhập trên máy này</span>
          </label>

          <button
            type="submit"
            className="tactile-btn-blue w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
          >
            <span>Đăng nhập ngay</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </form>

        {/* Notice */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
            <span className="material-symbols-outlined text-blue-600 text-lg shrink-0 mt-0.5">info</span>
            <div>
              <strong className="text-slate-900">Lưu ý quan trọng: </strong>
              Tài khoản được nhà trường và Giáo viên bộ môn cấp trực tiếp theo danh sách lớp. Học sinh &amp; Phụ huynh không cần đăng ký tài khoản mới.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="w-full py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span className="material-symbols-outlined text-base">chat</span>
            <span>Chưa có mã hoặc quên mật khẩu? Nhắn Cô Tâm hỗ trợ</span>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Trợ giúp đăng nhập Toán 6</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2.5">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900">👩‍🏫 Giáo viên phụ trách môn Toán:</p>
                <p className="font-semibold text-slate-800">Cô Tâm - GVCN &amp; Giáo viên Toán 6A4</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Zalo / SĐT: 0988.765.432 (7h30 - 21h30)</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Cú pháp nhắn tin cấp lại mật khẩu:</p>
                <div className="p-2 bg-slate-100 rounded font-mono text-[11px] text-slate-800 select-all mt-1">
                  TOAN6 [Họ tên học sinh] [Lớp 6A4] [QuenMatKhau]
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Đã hiểu, quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
