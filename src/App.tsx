import React, { useState, useEffect } from 'react';
import { User, Role } from './types';
import { getCurrentUser, subscribeToStore, setCurrentUser, getWrongQuestions } from './services/storage';
import { INITIAL_STUDENTS, INITIAL_PARENTS, CURRENT_TEACHER } from './data/mockData';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { TopRoleBar } from './components/common/TopRoleBar';
import { LoginView } from './components/auth/LoginView';
import { SetupGuideModal } from './components/guide/SetupGuideModal';

// Teacher components
import { ClassOverview } from './components/teacher/ClassOverview';
import { StudentManagement } from './components/teacher/StudentManagement';
import { CreateExam } from './components/teacher/CreateExam';
import { QuestionBank } from './components/teacher/QuestionBank';
import { ClassAnalytics } from './components/teacher/ClassAnalytics';
import { CreateAccountModal } from './components/teacher/CreateAccountModal';

// Student components
import { StudentHome } from './components/student/StudentHome';
import { ExamTaking } from './components/student/ExamTaking';
import { ExamResult } from './components/student/ExamResult';
import { WrongQuestionBook } from './components/student/WrongQuestionBook';
import { SelfPractice } from './components/student/SelfPractice';
import { StudentProgress } from './components/student/StudentProgress';

// Parent components
import { ParentDashboard } from './components/parent/ParentDashboard';
import { ParentHistory } from './components/parent/ParentHistory';
import { ParentContact } from './components/parent/ParentContact';

export default function App() {
  const [currentUser, setUser] = useState<User>(() => getCurrentUser());
  const [teacherTab, setTeacherTab] = useState<string>('overview');
  const [studentTab, setStudentTab] = useState<string>('home');
  const [parentTab, setParentTab] = useState<string>('parent_overview');

  // Phone frame mockup toggle for mobile roles on desktop
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // Modals & Navigation states
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [viewSubmissionId, setViewSubmissionId] = useState<string | null>(null);
  const [isParentInChat, setIsParentInChat] = useState<boolean>(false);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setUser(getCurrentUser());
    });
    return unsubscribe;
  }, []);

  // Sync tab defaults on role change
  useEffect(() => {
    setActiveExamId(null);
    setViewSubmissionId(null);
    setIsParentInChat(false);

    if (currentUser.role === 'teacher') {
      setTeacherTab('overview');
    } else if (currentUser.role === 'student') {
      setStudentTab('home');
    } else {
      setParentTab('parent_overview');
    }
  }, [currentUser.role]);

  // Handle start exam
  const handleStartExam = (examId: string) => {
    setActiveExamId(examId);
    setViewSubmissionId(null);
  };

  // Handle exam finished
  const handleExamFinished = (submissionId: string) => {
    setActiveExamId(null);
    setViewSubmissionId(submissionId);
  };

  const handleStartCustomPractice = (_chapterId: number, _lessonId?: number) => {
    setActiveExamId('exam-01');
  };

  const switchToStudent = () => {
    setCurrentUser(INITIAL_STUDENTS[0]);
    setUser(INITIAL_STUDENTS[0]);
  };

  const switchToParent = () => {
    setCurrentUser(INITIAL_PARENTS[0]);
    setUser(INITIAL_PARENTS[0]);
  };

  const switchToTeacher = () => {
    setCurrentUser(CURRENT_TEACHER);
    setUser(CURRENT_TEACHER);
  };

  const wrongQuestions = getWrongQuestions('hs-01');
  const unresolvedWrongCount = wrongQuestions.filter(q => !q.isResolved).length;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      {/* 1. TOP ROLE BAR: Always visible at the very top for 1-click switching */}
      <TopRoleBar
        currentUser={currentUser}
        onSelectUser={(u) => {
          setUser(u);
          setActiveExamId(null);
          setViewSubmissionId(null);
          setIsParentInChat(false);
        }}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
      />

      {/* 2. If student is taking an exam, render full screen interactive exam interface */}
      {currentUser.role === 'student' && activeExamId && (
        <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 sm:py-6">
          <ExamTaking
            examId={activeExamId}
            onFinishExam={handleExamFinished}
            onExit={() => setActiveExamId(null)}
          />
        </div>
      )}

      {/* 3. NORMAL VIEWS */}
      {(!activeExamId || currentUser.role !== 'student') && (
        <>
          {/* ======================================================== */}
          {/* TEACHER DESKTOP VIEW                                     */}
          {/* ======================================================== */}
          {currentUser.role === 'teacher' && (
            <div className="flex min-h-[calc(100vh-45px)]">
              <Sidebar
                currentTab={teacherTab}
                onSelectTab={setTeacherTab}
                onOpenCreateExam={() => setTeacherTab('create_exam')}
                currentUser={currentUser}
                onSwitchToStudent={switchToStudent}
                onSwitchToParent={switchToParent}
              />

              <div className="flex-1 flex flex-col min-w-0">
                <Header
                  currentUser={currentUser}
                  onQuickAssign={() => setTeacherTab('create_exam')}
                  onOpenHelp={() => setShowGuideModal(true)}
                />

                <main className="flex-1 p-6 md:p-8 ml-64 max-w-7xl">
                  {teacherTab === 'overview' && (
                    <ClassOverview
                      onNavigateTab={setTeacherTab}
                      onOpenCreateExam={() => setTeacherTab('create_exam')}
                      onOpenCreateAccount={() => setShowCreateAccountModal(true)}
                    />
                  )}

                  {teacherTab === 'students' && (
                    <StudentManagement
                      onOpenCreateAccount={() => setShowCreateAccountModal(true)}
                      onSelectStudentDetail={(_id) => setTeacherTab('analytics')}
                    />
                  )}

                  {teacherTab === 'questions' && (
                    <QuestionBank />
                  )}

                  {teacherTab === 'create_exam' && (
                    <CreateExam
                      onSuccess={() => {
                        alert('🎉 Đã giao bài tập thành công cho lớp 6A4!');
                        setTeacherTab('overview');
                      }}
                    />
                  )}

                  {teacherTab === 'analytics' && (
                    <ClassAnalytics />
                  )}

                  {teacherTab === 'settings' && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 max-w-3xl">
                      <h2 className="text-xl font-bold text-slate-900">Cài đặt lớp học &amp; Cấu hình hệ thống</h2>
                      <p className="text-xs text-slate-500">
                        Quản lý niên khóa, phân quyền giáo viên bộ môn và kết nối cơ sở dữ liệu Supabase.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-3">
                        <button
                          onClick={() => setShowGuideModal(true)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">database</span>
                          <span>Xem hướng dẫn kết nối Supabase &amp; Vercel</span>
                        </button>
                        <button
                          onClick={() => setShowCreateAccountModal(true)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                        >
                          Cấp tài khoản mới
                        </button>
                        <button
                          onClick={switchToStudent}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">backpack</span>
                          <span>Mở giao diện Học sinh</span>
                        </button>
                        <button
                          onClick={switchToParent}
                          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">family_restroom</span>
                          <span>Mở giao diện Phụ huynh</span>
                        </button>
                      </div>
                    </div>
                  )}
                </main>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STUDENT MOBILE VIEW (Em Nguyễn Minh Khang)               */}
          {/* ======================================================== */}
          {currentUser.role === 'student' && (
            <div className="flex-1 flex flex-col items-center justify-start py-4 px-2 sm:px-4 bg-slate-100/70">
              {/* Context Banner on Top */}
              <div className="w-full max-w-md mb-2 flex items-center justify-between px-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Đang xem: <strong>Giao diện Học sinh</strong> (Em Nguyễn Minh Khang)</span>
                </div>
                <button
                  onClick={switchToTeacher}
                  className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <span>Về Giáo viên</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>

              {/* Phone Frame Mockup Container */}
              <div
                className={`w-full transition-all duration-200 ${
                  isMobileFrame
                    ? 'max-w-[420px] bg-white rounded-[40px] shadow-2xl border-[10px] border-slate-800 overflow-hidden relative flex flex-col min-h-[780px]'
                    : 'max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col'
                }`}
              >
                {/* Simulated Phone Status Bar */}
                {isMobileFrame && (
                  <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-800 select-none border-b border-slate-50">
                    <span>9:41</span>
                    {/* Simulated Notch / Dynamic Island */}
                    <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto"></div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="material-symbols-outlined text-xs">signal_cellular_alt</span>
                      <span className="material-symbols-outlined text-xs">wifi</span>
                      <span className="material-symbols-outlined text-xs">battery_full</span>
                    </div>
                  </div>
                )}

                {/* Mobile Header */}
                <Header
                  currentUser={currentUser}
                  onOpenHelp={() => setShowGuideModal(true)}
                />

                {/* Main Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto px-4 py-3 pb-24">
                  {/* Result view if reviewing submission */}
                  {viewSubmissionId ? (
                    <ExamResult
                      submissionId={viewSubmissionId}
                      onRetryWrong={() => {
                        setViewSubmissionId(null);
                        setStudentTab('wrong_book');
                      }}
                      onGoHome={() => {
                        setViewSubmissionId(null);
                        setStudentTab('home');
                      }}
                      onSelfPractice={() => {
                        setViewSubmissionId(null);
                        setStudentTab('self_practice');
                      }}
                    />
                  ) : (
                    <>
                      {studentTab === 'home' && (
                        <StudentHome
                          onStartExam={handleStartExam}
                          onNavigateTab={setStudentTab}
                        />
                      )}

                      {studentTab === 'self_practice' && (
                        <SelfPractice onStartCustomPractice={handleStartCustomPractice} />
                      )}

                      {studentTab === 'exam' && (
                        <div className="space-y-4 pt-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="text-lg font-bold text-slate-900">Bài tập &amp; Kiểm tra đã giao</h2>
                              <p className="text-xs text-slate-500">Hoàn thành đúng hạn để nhận sao tích lũy!</p>
                            </div>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">Lớp 6A4</span>
                          </div>

                          {/* Active Exam Card */}
                          <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">timer</span>
                                Hạn chót: 21:00 hôm nay
                              </span>
                              <span className="text-xs font-bold text-slate-500">15 câu • 20 phút</span>
                            </div>

                            <h3 className="font-bold text-slate-900 text-sm">
                              Bài 23: Phân số bằng nhau (Kèm ôn tập rút gọn phân số)
                            </h3>
                            <p className="text-xs text-slate-600">
                              Yêu cầu: Nắm vững định nghĩa phân số bằng nhau và tính chất cơ bản của phân số.
                            </p>

                            <button
                              onClick={() => handleStartExam('exam-01')}
                              className="tactile-btn-blue w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-base">play_arrow</span>
                              <span>Bắt đầu làm bài ngay</span>
                            </button>
                          </div>

                          {/* Completed Exam Card */}
                          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 opacity-95">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">check_circle</span>
                                Đã hoàn thành • 8.5/10
                              </span>
                              <span className="text-xs text-slate-400">15 câu</span>
                            </div>

                            <h3 className="font-bold text-slate-800 text-sm">
                              Bài 22: Hình có trục đối xứng và tâm đối xứng
                            </h3>

                            <button
                              onClick={() => setViewSubmissionId('sub-01')}
                              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                              <span>Xem lại bài làm &amp; Lời giải chi tiết</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {studentTab === 'wrong_book' && (
                        <WrongQuestionBook onPracticeAgain={(_qid) => handleStartExam('exam-01')} />
                      )}

                      {studentTab === 'progress' && (
                        <StudentProgress />
                      )}
                    </>
                  )}
                </div>

                {/* Mobile Bottom Navigation */}
                <BottomNav
                  role="student"
                  activeTab={studentTab}
                  onSelectTab={(tab) => {
                    setViewSubmissionId(null);
                    setStudentTab(tab);
                  }}
                  unresolvedWrongCount={unresolvedWrongCount}
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PARENT MOBILE VIEW (Anh Nguyễn Văn Thành)                 */}
          {/* ======================================================== */}
          {currentUser.role === 'parent' && (
            <div className="flex-1 flex flex-col items-center justify-start py-4 px-2 sm:px-4 bg-slate-100/70">
              {/* Context Banner on Top */}
              <div className="w-full max-w-md mb-2 flex items-center justify-between px-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                  <span>Đang xem: <strong>Giao diện Phụ huynh</strong> (Anh Thành - Bố em Khang)</span>
                </div>
                <button
                  onClick={switchToTeacher}
                  className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <span>Về Giáo viên</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>

              {/* Phone Frame Mockup Container */}
              <div
                className={`w-full transition-all duration-200 ${
                  isMobileFrame
                    ? 'max-w-[420px] bg-white rounded-[40px] shadow-2xl border-[10px] border-slate-800 overflow-hidden relative flex flex-col min-h-[780px]'
                    : 'max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col'
                }`}
              >
                {/* Simulated Phone Status Bar */}
                {isMobileFrame && (
                  <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-800 select-none border-b border-slate-50">
                    <span>9:41</span>
                    {/* Simulated Notch / Dynamic Island */}
                    <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto"></div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="material-symbols-outlined text-xs">signal_cellular_alt</span>
                      <span className="material-symbols-outlined text-xs">wifi</span>
                      <span className="material-symbols-outlined text-xs">battery_full</span>
                    </div>
                  </div>
                )}

                {/* Mobile Header */}
                <Header
                  currentUser={currentUser}
                  onOpenContact={() => setIsParentInChat(true)}
                  onOpenHelp={() => setShowGuideModal(true)}
                />

                {/* Main Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto px-4 py-3 pb-24">
                  {isParentInChat ? (
                    <ParentContact onBack={() => setIsParentInChat(false)} />
                  ) : (
                    <>
                      {parentTab === 'parent_overview' && (
                        <ParentDashboard
                          onOpenHistory={() => setParentTab('parent_history')}
                          onOpenContact={() => setIsParentInChat(true)}
                          onRemindChild={() => {}}
                        />
                      )}

                      {parentTab === 'parent_progress' && (
                        <div className="space-y-4">
                          <StudentProgress />
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-2">
                            <h4 className="font-bold flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-blue-600 text-sm">info</span>
                              Ghi chú từ Cô Tâm (GVCN &amp; Giáo viên Toán 6A4)
                            </h4>
                            <p className="text-slate-700 leading-relaxed">
                              Em Khang tiếp thu nhanh lý thuyết các phép toán phân số và số nguyên. Gia đình tiếp tục động viên con duy trì chuỗi học tập 5 ngày liên tiếp và rèn thêm tính cẩn thận khi phá ngoặc nhé!
                            </p>
                            <button
                              onClick={() => setIsParentInChat(true)}
                              className="mt-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700"
                            >
                              Nhắn tin trao đổi với cô Tâm
                            </button>
                          </div>
                        </div>
                      )}

                      {parentTab === 'parent_history' && (
                        <ParentHistory
                          onOpenContact={() => setIsParentInChat(true)}
                          onViewSubmissionDetail={(_subId) => {
                            alert('Báo cáo phân tích: Con làm trong 18 phút (đúng mức thời gian dự kiến), hoàn thành 15/15 câu, đạt 8.5/10 điểm.');
                          }}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Mobile Bottom Navigation */}
                <BottomNav
                  role="parent"
                  activeTab={parentTab}
                  onSelectTab={(tab) => {
                    setIsParentInChat(false);
                    setParentTab(tab);
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Role Switcher with quick demo selector */}
      <RoleSwitcher
        currentUser={currentUser}
        onSelectUser={(u) => {
          setUser(u);
          setActiveExamId(null);
          setViewSubmissionId(null);
          setIsParentInChat(false);
        }}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 shadow-2xl relative">
            <LoginView
              onLoginSuccess={(u) => {
                setUser(u);
                setShowLoginModal(false);
              }}
              onCancel={() => setShowLoginModal(false)}
            />
          </div>
        </div>
      )}

      {/* Create Account Modal for Teacher */}
      <CreateAccountModal
        isOpen={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
        onSuccess={() => {
          setShowCreateAccountModal(false);
          alert('Cấp tài khoản học sinh & liên kết phụ huynh thành công!');
        }}
      />

      {/* Setup Guide Modal (Supabase & Vercel) */}
      <SetupGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
