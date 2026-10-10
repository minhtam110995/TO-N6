import React from 'react';
import { User } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreateExam: () => void;
  currentUser: User;
  onSwitchToStudent?: () => void;
  onSwitchToParent?: () => void;
  onLogout?: () => void;
  onChangePassword?: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateExam,
  currentUser,
  onSwitchToStudent,
  onSwitchToParent,
  onLogout,
  onChangePassword,
  unreadCount = 0,
}) => {
  const navItems = [
    { id: 'overview', label: 'Tổng quan lớp', icon: 'dashboard' },
    { id: 'students', label: 'Quản lý học sinh', icon: 'groups' },
    { id: 'questions', label: 'Ngân hàng câu hỏi', icon: 'quiz' },
    { id: 'create_exam', label: 'Tạo đề & Giao bài', icon: 'assignment_add' },
    { id: 'assigned', label: 'Bài đã giao', icon: 'assignment_turned_in' },
    { id: 'analytics', label: 'Thống kê kết quả', icon: 'analytics' },
    { id: 'contact', label: `Hộp thư phụ huynh${unreadCount ? ` (${unreadCount})` : ''}`, icon: 'forum' },
    { id: 'settings', label: 'Cài đặt lớp học', icon: 'settings' },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col z-40 bg-white border-r border-slate-200 shadow-xs select-none">
      <div className="w-64 h-full p-4 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <span className="material-symbols-outlined text-2xl fill-icon">functions</span>
            </div>
            <div>
              <h1 className="font-bold text-base text-blue-700 tracking-tight leading-tight">Toán 6</h1>
              <p className="text-[11px] text-slate-400 font-medium">Kết nối tri thức</p>
            </div>
          </div>

          {/* Teacher Profile Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
              CT
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 truncate">Cô Tâm</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Trực tuyến"></span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">GV Toán 6D</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${isActive ? 'text-blue-700 fill-icon' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom CTA & Role switchers */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="sidebar-account-actions"><button className="secondary-button" onClick={onChangePassword}><span className="material-symbols-outlined">key</span>Đổi mật khẩu</button><button className="secondary-button" onClick={onLogout}><span className="material-symbols-outlined">logout</span>Đăng xuất</button></div>
          <button
            onClick={onOpenCreateExam}
            className="tactile-btn-orange w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Tạo bài tập mới</span>
          </button>

          {/* Quick role previews */}
          {(onSwitchToStudent || onSwitchToParent) && <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Xem trước màn hình Mobile:
            </span>
            {onSwitchToStudent && (
              <button
                onClick={onSwitchToStudent}
                className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center justify-between text-[11px] transition"
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-emerald-600">backpack</span>
                  App Học sinh (Khang)
                </span>
                <span className="text-[10px] bg-emerald-200 px-1 rounded text-emerald-900 font-bold">Mở</span>
              </button>
            )}
            {onSwitchToParent && (
              <button
                onClick={onSwitchToParent}
                className="w-full py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg font-semibold flex items-center justify-between text-[11px] transition"
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-orange-600">family_restroom</span>
                  App Phụ huynh (Bố)
                </span>
                <span className="text-[10px] bg-orange-200 px-1 rounded text-orange-900 font-bold">Mở</span>
              </button>
            )}
          </div>}

          <div className="text-center">
            <span className="text-[10px] text-slate-400">Năm học 2026-2027 • Lớp 6D</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
