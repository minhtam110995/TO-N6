import React, { useState } from 'react';
import { User } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import { getStudents } from '../../services/storage';
import { unreadMessageCount } from '../../services/messages';
import { getReminders } from '../../services/reminders';

interface HeaderProps {
  currentUser: User;
  onQuickAssign?: () => void;
  onOpenHelp?: () => void;
  onOpenContact?: () => void;
  onOpenMenu?: () => void;
  onNotify?: () => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onQuickAssign,
  onOpenHelp,
  onOpenContact,
  onOpenMenu,
  onNotify,
  onSearch,
}) => {
  const [query, setQuery] = useState('');
  const unread = currentUser.role === 'student' ? getReminders().filter(r => !r.readAt).length : unreadMessageCount();
  // If teacher (Desktop layout)
  if (currentUser.role === 'teacher') {
    return (
      <header className="sticky top-0 w-full z-30 h-16 bg-white border-b border-slate-200 shadow-2xs flex justify-between items-center px-6 ml-64 select-none">
        <button className="icon-button mobile-menu" title="Mở điều hướng" onClick={onOpenMenu}><span className="material-symbols-outlined">menu</span></button>
        {/* Left: Search & Semester Context */}
        <div className="flex items-center gap-5 flex-1 max-w-xl">
          <form className="relative w-64" onSubmit={e => { e.preventDefault(); onSearch?.(query.trim()); }}>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Tìm học sinh..."
              aria-label="Tìm học sinh"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </form>
          <div className="hidden lg:flex items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              <span>Năm học 2026-2027 - Học kỳ I</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              <span className="material-symbols-outlined text-sm text-blue-600">groups</span>
              <span>Lớp 6D - {getStudents().length} học sinh</span>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <PWAInstallButton variant="header" />

          {onQuickAssign && (
            <button
              onClick={onQuickAssign}
              className="tactile-btn-blue hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-base">bolt</span>
              <span>Giao bài nhanh</span>
            </button>
          )}

          <button
            onClick={onNotify}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="Thông báo mới"
            aria-label={unread ? `${unread} tin nhắn chưa đọc` : 'Thông báo mới'}
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unread > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-orange-600 text-white text-[10px] font-bold">{unread > 99 ? '99+' : unread}</span>}
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="Trợ giúp & Hướng dẫn"
          >
            <span className="material-symbols-outlined text-xl">help</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* Teacher Profile Mini */}
          <div className="flex items-center gap-2 pl-1 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
              CT
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-bold text-slate-900 leading-tight">Cô Tâm</div>
              <div className="text-[10px] text-slate-500 leading-none">Chủ nhiệm 6D</div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Mobile Top App Bar for Student & Parent
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-2xs border-b border-slate-200 select-none">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        <button className="icon-button mobile-menu" title="Mở điều hướng" onClick={onOpenMenu}><span className="material-symbols-outlined">menu</span></button>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border-2 border-blue-200">
              {currentUser.fullName.split(' ').slice(-2).map(part => part[0]).join('')}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 leading-tight flex items-center gap-1">
              <span>{currentUser.role === 'student' ? currentUser.fullName : `${currentUser.studentName || 'Học sinh'} (Con)`}</span>
              {currentUser.role === 'parent' && (
                <span className="material-symbols-outlined text-xs text-slate-400">keyboard_arrow_down</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {currentUser.role === 'student' ? 'Lớp 6D • THCS' : 'Lớp 6D • GV: Cô Tâm'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {currentUser.role === 'parent' && onOpenContact && (
            <button
              onClick={onOpenContact}
              className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition"
              title="Nhắn tin với giáo viên"
            >
              <span className="material-symbols-outlined text-xl">chat</span>
            </button>
          )}

          <button
            onClick={onNotify}
            className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition relative"
            title="Thông báo"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
