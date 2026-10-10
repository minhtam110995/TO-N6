import React, { useState } from 'react';
import { User } from '../../types';
import { CURRENT_TEACHER, INITIAL_STUDENTS, INITIAL_PARENTS } from '../../data/mockData';
import { setCurrentUser } from '../../services/storage';

interface RoleSwitcherProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  onOpenLogin: () => void;
  onOpenGuide: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentUser,
  onSelectUser,
  onOpenLogin,
  onOpenGuide
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitch = (user: User) => {
    setCurrentUser(user);
    onSelectUser(user);
    setIsOpen(false);
  };

  const roleBadge = (role: string) => {
    if (role === 'teacher') return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Giáo viên</span>;
    if (role === 'student') return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Học sinh</span>;
    return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Phụ huynh</span>;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-80 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Chuyển đổi vai trò trải nghiệm</h4>
              <p className="text-xs text-slate-500">Thử nghiệm 3 vai trò theo yêu cầu đề bài</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          <div className="py-2 space-y-1.5">
            {/* Teacher */}
            <button
              onClick={() => handleSwitch(CURRENT_TEACHER)}
              className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition ${
                currentUser.role === 'teacher' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  GV
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900">{CURRENT_TEACHER.fullName}</div>
                  <div className="text-[11px] text-slate-500">Quản lý lớp 6D, tạo đề, cấp mã</div>
                </div>
              </div>
              {roleBadge('teacher')}
            </button>

            {/* Student Khang */}
            <button
              onClick={() => handleSwitch(INITIAL_STUDENTS[0])}
              className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition ${
                currentUser.id === INITIAL_STUDENTS[0].id ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  HS
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900">{INITIAL_STUDENTS[0].fullName}</div>
                  <div className="text-[11px] text-slate-500">Làm bài, xem điểm 8.5, sổ câu sai</div>
                </div>
              </div>
              {roleBadge('student')}
            </button>

            {/* Parent Thanh */}
            <button
              onClick={() => handleSwitch(INITIAL_PARENTS[0])}
              className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition ${
                currentUser.id === INITIAL_PARENTS[0].id ? 'bg-orange-50 border border-orange-200' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                  PH
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900">{INITIAL_PARENTS[0].fullName}</div>
                  <div className="text-[11px] text-slate-500">Báo cáo tuần của con, nhắc làm bài</div>
                </div>
              </div>
              {roleBadge('parent')}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLogin();
              }}
              className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">lock_open</span>
              Màn hình Đăng nhập
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenGuide();
              }}
              className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 font-semibold hover:bg-emerald-100"
            >
              📖 Hướng dẫn Supabase
            </button>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition transform active:scale-95 border border-slate-700"
        title="Chuyển đổi vai trò kiểm thử nhanh"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-xs font-bold">{currentUser.fullName}</span>
        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
          {currentUser.role === 'teacher' ? 'GV' : currentUser.role === 'student' ? 'HS' : 'PH'}
        </span>
        <span className="material-symbols-outlined text-sm">swap_horiz</span>
      </button>
    </div>
  );
};
