import React from 'react';
import { Role } from '../../types';

interface BottomNavProps {
  role: Role;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  unresolvedWrongCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  role,
  activeTab,
  onSelectTab,
  unresolvedWrongCount = 3,
}) => {
  if (role === 'teacher') return null;

  if (role === 'student') {
    return (
      <nav className="fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg h-16 flex justify-around items-center px-2 select-none">
        {/* Tab 1: Trang chủ */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition active:translate-y-0.5 ${
            activeTab === 'home' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${activeTab === 'home' ? 'fill-icon' : ''}`}>
            home
          </span>
          <span className="text-[10px] mt-0.5">Trang chủ</span>
          {activeTab === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-0.5"></span>}
        </button>

        {/* Tab 2: Tự ôn luyện */}
        <button
          onClick={() => onSelectTab('self_practice')}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition active:translate-y-0.5 ${
            activeTab === 'self_practice' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${activeTab === 'self_practice' ? 'fill-icon' : ''}`}>
            menu_book
          </span>
          <span className="text-[10px] mt-0.5">Tự ôn luyện</span>
          {activeTab === 'self_practice' && <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-0.5"></span>}
        </button>

        {/* Tab 3: Làm bài (Featured Center Action) */}
        <button
          onClick={() => onSelectTab('exam')}
          className="flex flex-col items-center justify-center -mt-4 flex-1 group transition active:translate-y-0.5"
        >
          <div className="w-11 h-11 bg-blue-600 text-white rounded-full shadow-md flex items-center justify-center group-active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-2xl">edit_note</span>
          </div>
          <span className="text-[10px] mt-1 font-bold text-blue-700">Làm bài</span>
        </button>

        {/* Tab 4: Sổ câu sai */}
        <button
          onClick={() => onSelectTab('wrong_book')}
          className={`relative flex flex-col items-center justify-center py-1 flex-1 transition active:translate-y-0.5 ${
            activeTab === 'wrong_book' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <span className={`material-symbols-outlined text-xl ${activeTab === 'wrong_book' ? 'fill-icon' : ''}`}>
              auto_stories
            </span>
            {unresolvedWrongCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 border border-white"></span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Sổ câu sai</span>
          {activeTab === 'wrong_book' && <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-0.5"></span>}
        </button>

        {/* Tab 5: Tiến độ */}
        <button
          onClick={() => onSelectTab('progress')}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition active:translate-y-0.5 ${
            activeTab === 'progress' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${activeTab === 'progress' ? 'fill-icon' : ''}`}>
            military_tech
          </span>
          <span className="text-[10px] mt-0.5">Tiến độ</span>
          {activeTab === 'progress' && <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-0.5"></span>}
        </button>
      </nav>
    );
  }

  // Parent Navigation (4 tabs from Image 3 & 7)
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg h-16 flex justify-around items-center px-2 select-none">
      {/* Tab 1: Tổng quan */}
      <button
        onClick={() => onSelectTab('parent_overview')}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition active:translate-y-0.5 ${
          activeTab === 'parent_overview' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <span className={`material-symbols-outlined text-xl ${activeTab === 'parent_overview' ? 'fill-icon' : ''}`}>
          dashboard
        </span>
        <span className="text-[10px] mt-0.5">Tổng quan</span>
        {activeTab === 'parent_overview' && <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-0.5"></span>}
      </button>

      {/* Tab 2: Tiến độ */}
      <button
        onClick={() => onSelectTab('parent_progress')}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition active:translate-y-0.5 ${
          activeTab === 'parent_progress' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <span className={`material-symbols-outlined text-xl ${activeTab === 'parent_progress' ? 'fill-icon' : ''}`}>
          monitoring
        </span>
        <span className="text-[10px] mt-0.5">Tiến độ</span>
        {activeTab === 'parent_progress' && <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-0.5"></span>}
      </button>

      {/* Tab 3: Sổ bài làm */}
      <button
        onClick={() => onSelectTab('parent_history')}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition active:translate-y-0.5 ${
          activeTab === 'parent_history' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <span className={`material-symbols-outlined text-xl ${activeTab === 'parent_history' ? 'fill-icon' : ''}`}>
          menu_book
        </span>
        <span className="text-[10px] mt-0.5">Sổ bài làm</span>
        {activeTab === 'parent_history' && <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-0.5"></span>}
      </button>

      {/* Tab 4: Liên hệ */}
      <button
        onClick={() => onSelectTab('parent_contact')}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition active:translate-y-0.5 ${
          activeTab === 'parent_contact' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <span className={`material-symbols-outlined text-xl ${activeTab === 'parent_contact' ? 'fill-icon' : ''}`}>
          chat
        </span>
        <span className="text-[10px] mt-0.5">Liên hệ</span>
        {activeTab === 'parent_contact' && <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-0.5"></span>}
      </button>
    </nav>
  );
};
