import React from 'react';
import { User, Role } from '../../types';
import { CURRENT_TEACHER, INITIAL_STUDENTS, INITIAL_PARENTS } from '../../data/mockData';
import { setCurrentUser } from '../../services/storage';

interface TopRoleBarProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  onOpenLogin: () => void;
  onOpenGuide: () => void;
}

export const TopRoleBar: React.FC<TopRoleBarProps> = ({
  currentUser,
  onSelectUser,
  onOpenLogin,
  onOpenGuide,
}) => {
  const handleSelectRole = (role: Role) => {
    let targetUser: User;
    if (role === 'teacher') {
      targetUser = CURRENT_TEACHER;
    } else if (role === 'student') {
      targetUser = INITIAL_STUDENTS[0]; // Nguyễn Minh Khang
    } else {
      targetUser = INITIAL_PARENTS[0]; // Anh Nguyễn Văn Thành
    }
    setCurrentUser(targetUser);
    onSelectUser(targetUser);
  };

  return (
    <div className="bg-slate-900 text-white text-xs border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Quick Role Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
            Chế độ xem:
          </span>

          {/* Teacher Tab */}
          <button
            onClick={() => handleSelectRole('teacher')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition text-xs whitespace-nowrap cursor-pointer ${
              currentUser.role === 'teacher'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">school</span>
            <span className="role-label-full">1. Giáo viên (Cô Tâm - 6D)</span><span className="role-label-short">Giáo viên</span>
            {currentUser.role === 'teacher' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          {/* Student Tab */}
          <button
            onClick={() => handleSelectRole('student')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition text-xs whitespace-nowrap cursor-pointer ${
              currentUser.role === 'student'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">backpack</span>
            <span className="role-label-full">2. Học sinh (Em Minh Khang)</span><span className="role-label-short">Học sinh</span>
            {currentUser.role === 'student' && (
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
            )}
          </button>

          {/* Parent Tab */}
          <button
            onClick={() => handleSelectRole('parent')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition text-xs whitespace-nowrap cursor-pointer ${
              currentUser.role === 'parent'
                ? 'bg-orange-600 text-white shadow-sm ring-2 ring-orange-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">family_restroom</span>
            <span className="role-label-full">3. Phụ huynh (Bố Minh Khang)</span><span className="role-label-short">Phụ huynh</span>
            {currentUser.role === 'parent' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
            )}
          </button>
        </div>

        {/* Right: Quick Tools (Mobile frame toggle, Login modal, Supabase Guide) */}
        <div className="flex items-center gap-2">

          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium text-xs border border-slate-700"
            title="Đăng xuất và trở về màn hình đăng nhập"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 transition font-medium text-xs border border-emerald-600/50"
            title="Hướng dẫn tạo CSDL Supabase & Triển khai Vercel"
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
            <span className="hidden sm:inline">HD CSDL Supabase</span>
          </button>
        </div>
      </div>
    </div>
  );
};
