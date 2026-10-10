import React, { useEffect, useState } from 'react';
import { X, BookOpen, Users, LayoutDashboard, ClipboardList, BarChart3, Settings, LogOut, KeyRound, Trash2, Download } from 'lucide-react';
import { getCurrentUser, getParents, getStudents, resetAllDataToDefault, subscribeToStore, getExams, getSubmissions, getWrongQuestions, getQuestionBank, createExam } from './services/storage';
import { createClassBackup, downloadClassBackup } from './services/classBackup';
import { getSessionUser } from './services/localAuth';
import { CLOUD_ENABLED, cloudConnectionError, cloudLogout, restoreCloudSession } from './services/cloudSession';
import { cloudRequest, getCloudSnapshot } from './services/cloudStore';
import { SupabaseMigration } from './components/teacher/SupabaseMigration';
import { getMessages, unreadMessageCount } from './services/messages';
import { getReminders, readReminders, remindChild } from './services/reminders';
import { Exam, Question } from './types';
const ClassOverview = React.lazy(() => import('./components/teacher/ClassOverview').then(m => ({ default: m.ClassOverview })));
const StudentManagement = React.lazy(() => import('./components/teacher/StudentManagement').then(m => ({ default: m.StudentManagement })));
const QuestionBank = React.lazy(() => import('./components/teacher/QuestionBank').then(m => ({ default: m.QuestionBank })));
const CreateExam = React.lazy(() => import('./components/teacher/CreateExam').then(m => ({ default: m.CreateExam })));
const AssignedExams = React.lazy(() => import('./components/teacher/AssignedExams').then(m => ({ default: m.AssignedExams })));
const ClassAnalytics = React.lazy(() => import('./components/teacher/ClassAnalytics').then(m => ({ default: m.ClassAnalytics })));
import { CreateAccountModal } from './components/teacher/CreateAccountModal';
import { SelfPractice } from './components/student/SelfPractice';
const WrongQuestionBook = React.lazy(() => import('./components/student/WrongQuestionBook').then(m => ({ default: m.WrongQuestionBook })));
const ExamTaking = React.lazy(() => import('./components/student/ExamTaking').then(m => ({ default: m.ExamTaking })));
const ExamResult = React.lazy(() => import('./components/student/ExamResult').then(m => ({ default: m.ExamResult })));
import { MessageCenter } from './components/common/MessageCenter';
import { ChangePassword } from './components/auth/ChangePassword';
import { LoginView } from './components/auth/LoginView';
import { SetupGuideModal } from './components/guide/SetupGuideModal';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { StudentHome } from './components/student/StudentHome';
import { ParentDashboard } from './components/parent/ParentDashboard';

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => !CLOUD_ENABLED && !!getSessionUser());
  const [loading, setLoading] = useState(CLOUD_ENABLED), [bootError, setBootError] = useState('');
  useEffect(() => {
    if (!CLOUD_ENABLED) return;
    let alive = true;
    restoreCloudSession().then(ok => { if (alive) setAuthenticated(ok); }).catch(e => { if (alive) setBootError(e instanceof Error ? e.message : 'Chưa kết nối được Supabase.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  const logout = () => { setAuthenticated(false); sessionStorage.removeItem('toan6_login_session'); sessionStorage.removeItem('toan6_session_user'); if (CLOUD_ENABLED) void cloudLogout().catch(() => {}); };
  if (loading) return <main className="login-page legacy-theme"><p role="status">Đang kết nối lớp học...</p></main>;
  if (bootError) return <main className="login-page legacy-theme"><div><p role="alert">{bootError}</p><button className="primary-button" onClick={() => location.reload()}>Kết nối lại</button><button className="secondary-button" onClick={() => { logout(); setBootError(''); }}>Đăng nhập lại</button></div></main>;
  if (!authenticated) return <main className="login-page legacy-theme"><LoginView onLoginSuccess={() => { sessionStorage.setItem('toan6_login_session', 'active'); setAuthenticated(true); }} /></main>;
  return <AuthenticatedApp onLogout={logout} />;
}

function AuthenticatedApp({ onLogout }: { onLogout: () => void }) {
  const [user, setUser] = useState(getCurrentUser);
  const [, setRevision] = useState(0);
  const [tab, setTab] = useState('overview');
  const [menu, setMenu] = useState(false);
  const [guide, setGuide] = useState(false);
  const [account, setAccount] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [activeExam, setActiveExam] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [selectedExam, setSelectedExam] = useState<string | undefined>();
  const [assignedId, setAssignedId] = useState<string>();
  const [selectedParent, setSelectedParent] = useState<string>();
  const [messageNotice, setMessageNotice] = useState<{ parentId: string; name: string; count: number }>();
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | undefined>();
  useEffect(() => subscribeToStore(() => { setUser(getCurrentUser()); setRevision(r => r + 1); }), []);
  useEffect(() => {
    if (user.role !== 'teacher') return;
    const seen = new Set<string>();
    const check = () => {
      const incoming = getMessages().filter(m => m.senderId !== user.id && !m.readAt);
      const fresh = incoming.filter(m => !seen.has(m.id));
      incoming.forEach(m => seen.add(m.id));
      if (fresh.length) {
        const latest = fresh[fresh.length - 1];
        const parent = getParents().find(p => p.id === latest.parentId);
        setMessageNotice({ parentId: latest.parentId, name: parent?.fullName || 'Phụ huynh', count: incoming.length });
      } else setMessageNotice(prev => prev && incoming.some(m => m.parentId === prev.parentId) ? { ...prev, count: incoming.length } : undefined);
    };
    check();
    return subscribeToStore(check);
  }, [user.id, user.role]);
  useEffect(() => {
    setTab('overview'); setResult(null); setMenu(false);
    if (CLOUD_ENABLED) { setActiveExam(null); return; }
    const savedId = localStorage.getItem(`active_exam_${user.id}`);
    setActiveExam(savedId && getExams().some(e => e.id === savedId) && localStorage.getItem(`draft_exam_${user.id}_${savedId}`) ? savedId : null);
  }, [user.id]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timer); }, [notice]);
  const studentId = user.role === 'parent' ? user.studentId : user.id;
  const submissions = getSubmissions().filter(s => s.studentId === studentId);
  const exams = getExams().filter(e => e.type !== 'practice' && (e.assignedTo === 'all' || e.assignedTo.includes(studentId || '')));
  const navigate = (next: string) => {
    const aliases: Record<string, string> = { home: 'overview', self_practice: 'practice', wrong_book: 'wrong', progress: 'history', parent_overview: 'overview', parent_progress: 'progress', parent_history: 'history', parent_contact: 'contact' };
    setTab(aliases[next] || next); setMenu(false); setResult(null); setSelectedStudent(undefined); setSelectedExam(undefined); window.scrollTo({ top: 0 });
  };
  const startExam = async (id: string) => {
    if (CLOUD_ENABLED) {
      try { await cloudRequest('startExam', { examId: id }); setActiveExam(id); setResult(null); }
      catch (e) { setNotice(e instanceof Error ? e.message : 'Chưa bắt đầu được bài làm.'); }
      return;
    }
    const exam = getExams().find(e => e.id === id);
    if (!exam?.questions.length) return setNotice('Đề bài chưa có câu hỏi.');
    const draft = localStorage.getItem(`draft_exam_${user.id}_${id}`);
    if (!draft && exam.type !== 'practice' && (exam.status !== 'active' || Date.now() > Date.parse(exam.deadline))) return setNotice('Bài tập đã hết hạn.');
    if (!draft && submissions.filter(s => s.examId === id).length >= exam.maxRetries) return setNotice('Bạn đã dùng hết lượt làm bài.');
    localStorage.setItem(`active_exam_${user.id}`, id);
    setActiveExam(id); setResult(null);
  };
  const practice = async (questions: Question[]) => {
    if (!questions.length) return setNotice('Chưa có câu hỏi trong bài đã chọn.');
    const exam: Exam = { id: `practice-${crypto.randomUUID()}`, title: `Ôn luyện: ${questions[0].lessonTitle}`, type: 'practice', chapterId: questions[0].chapterId, lessonIds: [...new Set(questions.map(q => q.lessonId))], matrix: { nhanBietPercent: 40, thongHieuPercent: 30, vanDungPercent: 20, vanDungCaoPercent: 10 }, timeLimitMinutes: Math.max(5, Math.ceil(questions.reduce((s, q) => s + q.estimatedSeconds, 0) / 60)), deadline: new Date(Date.now() + 86400000).toISOString(), maxRetries: 999, shuffleQuestions: true, shuffleOptions: true, showSolutionAfter: 'submit', assignedTo: [user.id], createdBy: user.id, createdAt: new Date().toISOString(), questions, status: 'active' };
    try { await createExam(exam); if (CLOUD_ENABLED) await startExam(exam.id); else { localStorage.setItem(`active_exam_${user.id}`, exam.id); setActiveExam(exam.id); } }
    catch (e) { setNotice(e instanceof Error ? e.message : 'Chưa tạo được bài ôn luyện.'); }
  };
  const teacherNav = [['overview', 'Tổng quan', LayoutDashboard], ['students', 'Học sinh', Users], ['questions', 'Ngân hàng câu hỏi', BookOpen], ['create_exam', 'Tạo đề & giao bài', ClipboardList], ['analytics', 'Kết quả', BarChart3], ['settings', 'Cài đặt', Settings]] as const;
  const learnerNav = user.role === 'parent' ? [['overview', 'Tổng quan', LayoutDashboard], ['progress', 'Tiến độ', BarChart3], ['history', 'Sổ bài làm', ClipboardList], ['contact', 'Liên hệ', Users]] as const : [['overview', 'Trang chủ', LayoutDashboard], ['practice', 'Tự ôn luyện', BookOpen], ['exam', 'Làm bài', ClipboardList], ['wrong', 'Sổ câu sai', BookOpen], ['history', 'Tiến độ', BarChart3]] as const;
  const nav = user.role === 'teacher' ? teacherNav : learnerNav;
  const average = submissions.length ? (submissions.reduce((s, item) => s + item.score, 0) / submissions.length).toFixed(1) : '--';
  return <div className={`app-shell legacy-theme role-${user.role}`}>
    {!activeExam && <>
      {menu && <button className="nav-backdrop" aria-label="Đóng điều hướng" onClick={() => setMenu(false)} />}
      {user.role === 'teacher' ? <div className={`original-sidebar ${menu ? 'is-open' : ''}`}><Sidebar currentTab={tab} onSelectTab={navigate} onOpenCreateExam={() => navigate('create_exam')} currentUser={user} onLogout={onLogout} onChangePassword={() => navigate('password')} unreadCount={unreadMessageCount()} /></div> : <aside className={`app-sidebar ${menu ? 'is-open' : ''}`}><div className="app-brand"><span className="material-symbols-outlined">functions</span><div><strong>Toán 6</strong><small>Kết nối tri thức</small></div></div><div className="user-context"><strong>{user.fullName}</strong><span>{user.className || 'Lớp 6D'}</span></div><nav>{nav.map(([id, label, Icon]) => <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={20} /><span>{label}</span></button>)}</nav><div className="sidebar-account-actions"><button className="secondary-button" onClick={() => navigate('password')}><KeyRound size={16} />Đổi mật khẩu</button><button className="secondary-button" onClick={onLogout}><LogOut size={16} />Đăng xuất</button></div></aside>}
      <div className="legacy-header"><Header currentUser={user} onQuickAssign={() => navigate('create_exam')} onSearch={query => { navigate('students'); setStudentSearch(query); }} onOpenHelp={() => setGuide(true)} onOpenContact={() => navigate('contact')} onOpenMenu={() => setMenu(!menu)} onNotify={async () => { if (user.role !== 'student') return navigate('contact'); const reminders = getReminders().filter(r => !r.readAt); setNotice(reminders.length ? reminders.map(r => r.body).join(' · ') : 'Chưa có thông báo mới.'); try { await readReminders(); } catch (e) { setNotice(e instanceof Error ? e.message : 'Chưa lưu được trạng thái thông báo.'); } }} /></div>
    </>}
    <main className={activeExam ? 'exam-workspace' : 'app-workspace'} key={user.id}>{CLOUD_ENABLED && cloudConnectionError() && <p className="form-error" role="alert">{cloudConnectionError()} Dữ liệu mới chưa được xác nhận.</p>}<React.Suspense fallback={<div className="view-loading" role="status">Đang tải...</div>}>
      {activeExam ? <ExamTaking key={activeExam} examId={activeExam} onExit={() => { localStorage.removeItem(`active_exam_${user.id}`); setActiveExam(null); }} onFinishExam={id => { localStorage.removeItem(`active_exam_${user.id}`); setActiveExam(null); setResult(id); }} /> : result ? <ExamResult submissionId={result} onGoHome={() => navigate(user.role === 'teacher' ? 'analytics' : 'overview')} onSelfPractice={() => navigate('practice')} onRetryWrong={() => navigate('wrong')} /> : tab === 'password' ? <ChangePassword /> : user.role === 'teacher' ? <>
        {tab === 'overview' && <ClassOverview onViewExam={id => { navigate('analytics'); setSelectedExam(id); }} onNavigateTab={navigate} onOpenCreateExam={() => navigate('create_exam')} onOpenCreateAccount={() => setAccount(true)} />}
        {tab === 'students' && <StudentManagement initialQuery={studentSearch} onOpenCreateAccount={() => setAccount(true)} onSelectStudentDetail={id => { navigate('analytics'); setSelectedStudent(id); }} />}
        {tab === 'questions' && <QuestionBank />}
        {tab === 'create_exam' && <CreateExam onSuccess={id => { setAssignedId(id); navigate('assigned'); }} />}
        {tab === 'assigned' && <AssignedExams assignedId={assignedId} onDismiss={() => setAssignedId(undefined)} onCreate={() => navigate('create_exam')} onViewResults={id => { navigate('analytics'); setSelectedExam(id); }} />}
        {tab === 'analytics' && <ClassAnalytics initialExamId={selectedExam} studentId={selectedStudent} onViewSubmission={setResult} />}
        {tab === 'contact' && <MessageCenter initialParentId={selectedParent} />}
        {tab === 'settings' && <section className="space-y-4"><h1>Cài đặt lớp học</h1>{CLOUD_ENABLED ? <p className={cloudConnectionError() ? 'form-error' : 'correct'} role="status">{cloudConnectionError() ? 'Chưa kết nối được Supabase.' : 'Đang dùng dữ liệu Supabase.'}</p> : <><button className="primary-button" onClick={() => { try { if (getSessionUser()?.role !== 'teacher') throw new Error('Chỉ giáo viên được sao lưu dữ liệu lớp.'); const backup = createClassBackup(localStorage); downloadClassBackup(backup); setNotice(`Đã yêu cầu tải bản sao lưu: ${backup.counts.students} học sinh, ${backup.counts.questions} câu hỏi.`); } catch (e) { setNotice(e instanceof Error ? e.message : 'Chưa tải được bản sao lưu.'); } }}><Download size={17} />Tải bản sao lưu dữ liệu lớp</button><p className="muted">Dữ liệu lưu trên trình duyệt này. Bản sao lưu chứa thông tin riêng tư, không đưa lên GitHub.</p></>}<dl className="space-y-2"><div>Học sinh: {getStudents().length}</div><div>Phụ huynh: {getParents().length}</div><div>Bài đã giao: {getExams().filter(e => e.type !== 'practice').length}</div><div>Bài làm: {getSubmissions().length}</div><div>Tin nhắn: {getMessages().length}</div><div>Ngân hàng câu hỏi: {getQuestionBank().length} câu</div></dl>{!CLOUD_ENABLED && <><SupabaseMigration /><button className="secondary-button text-red-600" onClick={() => setResetConfirm(true)}><Trash2 size={17} />Xóa dữ liệu lớp thử nghiệm</button></>}</section>}
      </> : <>
        {tab === 'overview' && (user.role === 'student' ? <StudentHome onStartExam={startExam} onNavigateTab={navigate} onViewResult={setResult} /> : <ParentDashboard onOpenHistory={() => navigate('history')} onOpenContact={() => navigate('contact')} onRemindChild={async () => { try { await remindChild(); setNotice(CLOUD_ENABLED ? 'Đã gửi nhắc nhở cho học sinh.' : 'Đã lưu nhắc nhở trên trình duyệt này.'); } catch (e) { setNotice(e instanceof Error ? e.message : 'Chưa lưu được nhắc nhở.'); } }} />)}
        {(tab === 'exam' || tab === 'progress') && <><div className="page-heading"><h1>{user.role === 'parent' ? 'Tiến độ học tập' : 'Bài tập & kiểm tra đã giao'}</h1><p>{user.role === 'parent' ? user.studentName || 'Bài làm của con' : user.fullName}</p></div><div className="summary-grid"><div><span>Bài đã nộp</span><strong>{submissions.length}</strong></div><div><span>Điểm trung bình</span><strong>{average}<small> / 10</small></strong></div><div><span>Câu cần ôn lại</span><strong>{getWrongQuestions(studentId).filter(q => !q.isResolved).length}</strong></div></div><div className="exam-list">{exams.map(exam => {
          const attempts = submissions.filter(s => s.examId === exam.id);
          const expired = Date.now() > Date.parse(exam.deadline) || exam.status === 'closed';
          const draft = CLOUD_ENABLED ? getCloudSnapshot()?.attempts.some(a => a.exam_id === exam.id && Date.parse(a.ends_at) + 300000 > Date.now()) : !!localStorage.getItem(`draft_exam_${user.id}_${exam.id}`);
          return <article className="exam-item" key={exam.id}><div><span className={`status ${expired ? 'closed' : ''}`}>{expired ? 'Đã hết hạn' : 'Đang giao'}</span><h2>{exam.title}</h2><p>{exam.questions.length} câu · {exam.timeLimitMinutes} phút</p><p>Hạn nộp: {new Date(exam.deadline).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>{attempts.length > 0 && <p>Đã nộp {attempts.length} lượt · Điểm gần nhất: {attempts[0].score}/10</p>}</div><div className="item-actions">{user.role === 'student' && <button className="primary-button" disabled={!draft && (expired || attempts.length >= exam.maxRetries)} onClick={() => startExam(exam.id)}>{draft ? 'Tiếp tục' : expired ? 'Đã hết hạn' : attempts.length >= exam.maxRetries ? 'Đã hết lượt' : attempts.length ? 'Làm lại' : 'Làm bài'}</button>}{attempts[0] && <button className="secondary-button" onClick={() => setResult(attempts[0].id)}>Xem kết quả</button>}</div></article>;
        })}{!exams.length && <p className="empty-state">Chưa có bài tập được giao.</p>}</div></>}
        {tab === 'practice' && <SelfPractice onStartCustomPractice={(chapter, lesson) => practice(getQuestionBank().filter(q => q.chapterId === chapter && (!lesson || q.lessonId === lesson)).slice(0, 10))} />}
        {tab === 'wrong' && <WrongQuestionBook onPracticeAgain={qid => practice(getWrongQuestions(user.id).filter(w => qid ? w.questionId === qid : !w.isResolved).map(w => w.question))} />}
        {tab === 'history' && <section><h1>Kết quả học tập</h1><div className="exam-list">{submissions.map(s => <article className="exam-item" key={s.id}><div><h2>{s.examTitle}</h2><p>{new Date(s.submittedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · {s.correctCount}/{s.totalQuestions} câu đúng</p></div><div className="item-actions"><strong>{s.score}/10</strong><button className="secondary-button" onClick={() => setResult(s.id)}>Chi tiết</button></div></article>)}{!submissions.length && <p className="empty-state">Chưa có bài làm.</p>}</div></section>}
        {tab === 'contact' && <MessageCenter />}
      </>}
    </React.Suspense>{!activeExam && <footer className="account-footer"><button className="secondary-button" onClick={() => navigate('password')}><KeyRound size={16} />Đổi mật khẩu</button><button className="secondary-button" onClick={onLogout}><LogOut size={16} />Đăng xuất</button></footer>}</main>
    {!activeExam && user.role !== 'teacher' && <div className="original-bottom-nav"><BottomNav role={user.role} activeTab={user.role === 'parent' ? ({ overview: 'parent_overview', progress: 'parent_progress', history: 'parent_history', contact: 'parent_contact' }[tab] || tab) : ({ overview: 'home', practice: 'self_practice', exam: 'exam', wrong: 'wrong_book', history: 'progress' }[tab] || tab)} onSelectTab={navigate} unresolvedWrongCount={getWrongQuestions(studentId).filter(q => !q.isResolved).length} /></div>}
    {messageNotice ? <div className="app-notice" role="status"><div className="min-w-0"><strong>Tin nhắn mới từ {messageNotice.name}</strong><p>{messageNotice.count} tin nhắn chưa đọc</p></div><button className="secondary-button" onClick={() => { setSelectedParent(messageNotice.parentId); navigate('contact'); setMessageNotice(undefined); }}>Xem tin nhắn</button><button className="icon-button" aria-label="Đóng thông báo tin nhắn" onClick={() => setMessageNotice(undefined)}><X size={18} /></button></div> : notice && <div className="app-notice" role="status">{notice}<button className="icon-button" aria-label="Đóng thông báo" onClick={() => setNotice('')}><X size={18} /></button></div>}
    <CreateAccountModal isOpen={account} onClose={() => setAccount(false)} onSuccess={() => { setAccount(false); setNotice('Đã tạo tài khoản và liên kết phụ huynh.'); }} />
    {resetConfirm && <div className="modal-backdrop"><section className="modal-panel space-y-4" role="alertdialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">Xóa dữ liệu lớp thử nghiệm?</h2><p>Tài khoản học sinh/phụ huynh, bài giao, bài làm, tin nhắn và bản nháp sẽ bị xóa vĩnh viễn. Giữ ngân hàng câu hỏi và tài khoản giáo viên.</p><div className="result-actions"><button className="secondary-button" onClick={() => setResetConfirm(false)}>Hủy</button><button className="primary-button" onClick={() => { try { resetAllDataToDefault(); setAssignedId(undefined); setSelectedParent(undefined); setMessageNotice(undefined); setResetConfirm(false); setNotice('Đã dọn dữ liệu lớp. Giữ nguyên ngân hàng câu hỏi và tài khoản giáo viên.'); } catch { setNotice('Chưa dọn xong dữ liệu. Hãy kiểm tra và thử lại.'); } }}><Trash2 size={17} />Xác nhận xóa dữ liệu thử</button></div></section></div>}
    <SetupGuideModal isOpen={guide} onClose={() => setGuide(false)} />
  </div>;
}
