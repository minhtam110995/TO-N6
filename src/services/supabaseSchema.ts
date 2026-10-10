export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- CƠ SỞ DỮ LIỆU "TOÁN 6 - KẾT NỐI TRI THỨC VỚI CUỘC SỐNG"
-- HỆ THỐNG SUPABASE POSTGRESQL + ROW LEVEL SECURITY (RLS)
-- ========================================================

-- 1. BẢNG NGƯỜI DÙNG & PHÂN QUYỀN (USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'parent')),
  phone TEXT,
  email TEXT,
  class_id TEXT DEFAULT 'class-6d',
  class_name TEXT DEFAULT 'Lớp 6D',
  student_group TEXT, -- Tổ 1, Tổ 2, Tổ 3, Tổ 4
  birth_date DATE,
  linked_student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Dành cho Phụ huynh liên kết với con
  linked_parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- Dành cho Học sinh liên kết với PH
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG NGÂN HÀNG CÂU HỎI (9 CHƯƠNG TOÁN 6 KNTT)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  chapter_id INT NOT NULL CHECK (chapter_id BETWEEN 1 AND 9),
  chapter_title TEXT NOT NULL,
  lesson_id INT NOT NULL,
  lesson_title TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao')),
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'fill_in_the_blank')),
  content TEXT NOT NULL,
  math_formula TEXT,
  options JSONB, -- Mảng các đáp án A, B, C, D
  correct_answers JSONB, -- Mảng các giá trị chấp nhận được cho câu điền số
  solution_steps JSONB NOT NULL, -- Lời giải chi tiết từng bước
  teacher_advice TEXT,
  estimated_seconds INT DEFAULT 60,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG ĐỀ THI & BÀI TẬP (EXAMS)
CREATE TABLE IF NOT EXISTS public.exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('homework', 'practice', 'test')),
  chapter_id INT NOT NULL,
  lesson_ids JSONB,
  question_count INT NOT NULL,
  matrix JSONB NOT NULL, -- Tỉ lệ % 4 mức độ: {nhanBiet, thongHieu, vanDung, vanDungCao}
  time_limit_minutes INT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  max_retries INT DEFAULT 1,
  shuffle_questions BOOLEAN DEFAULT TRUE,
  shuffle_options BOOLEAN DEFAULT TRUE,
  show_solution_after TEXT DEFAULT 'submit' CHECK (show_solution_after IN ('submit', 'deadline')),
  assigned_to TEXT DEFAULT 'all', -- 'all' hoặc mảng student_ids
  questions JSONB NOT NULL, -- Danh sách câu hỏi của đề
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed'))
);

-- 4. BẢNG BÀI LÀM CỦA HỌC SINH (SUBMISSIONS)
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  exam_title TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL,
  duration_seconds INT NOT NULL,
  score NUMERIC(4,2) NOT NULL, -- Điểm thang 10
  total_questions INT NOT NULL,
  correct_count INT NOT NULL,
  wrong_count INT NOT NULL,
  answers JSONB NOT NULL, -- Nhật ký làm từng câu: {questionId, selected, timeSpent, isCorrect}
  speed_rating TEXT CHECK (speed_rating IN ('fast', 'normal', 'slow')),
  is_late BOOLEAN DEFAULT FALSE,
  teacher_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG SỔ CÂU SAI THÔNG MINH (WRONG_QUESTIONS)
CREATE TABLE IF NOT EXISTS public.wrong_questions (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wrong_answer TEXT,
  correct_answer TEXT,
  wrong_count INT DEFAULT 1,
  last_wrong_at TIMESTAMPTZ DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT FALSE,
  teacher_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- CHÍNH SÁCH BẢO MẬT THEO DÒNG (ROW LEVEL SECURITY - RLS)
-- ========================================================

-- Kích hoạt RLS cho toàn bộ bảng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wrong_questions ENABLE ROW LEVEL SECURITY;

-- Hàm trợ giúp: Kiểm tra quyền Giáo viên
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. CHÍNH SÁCH BẢNG PROFILES (HỒ SƠ NGƯỜI DÙNG)
-- Giáo viên thấy toàn bộ hồ sơ trong lớp
CREATE POLICY "Teacher full access profiles" ON public.profiles
  FOR ALL USING (public.is_teacher());

-- Học sinh chỉ thấy hồ sơ của chính mình
CREATE POLICY "Student view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Phụ huynh chỉ thấy hồ sơ của con mình và chính mình
CREATE POLICY "Parent view self and linked student" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR id IN (
      SELECT linked_student_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 2. CHÍNH SÁCH BẢNG SUBMISSIONS (BÀI LÀM)
-- Giáo viên thấy toàn bộ bài làm của cả lớp
CREATE POLICY "Teacher view all submissions" ON public.submissions
  FOR ALL USING (public.is_teacher());

-- Học sinh CHỈ thấy bài làm của chính mình
CREATE POLICY "Student view own submissions" ON public.submissions
  FOR SELECT USING (student_id = auth.uid());

-- Học sinh nộp bài làm của chính mình
CREATE POLICY "Student insert own submissions" ON public.submissions
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Phụ huynh CHỈ thấy bài làm của con mình
CREATE POLICY "Parent view linked student submissions" ON public.submissions
  FOR SELECT USING (
    student_id IN (
      SELECT linked_student_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 3. CHÍNH SÁCH BẢNG WRONG_QUESTIONS (SỔ CÂU SAI)
CREATE POLICY "Teacher view all wrong questions" ON public.wrong_questions
  FOR ALL USING (public.is_teacher());

CREATE POLICY "Student view own wrong questions" ON public.wrong_questions
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Parent view child wrong questions" ON public.wrong_questions
  FOR SELECT USING (
    student_id IN (
      SELECT linked_student_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 4. CHÍNH SÁCH BẢNG EXAMS & QUESTIONS
-- Ai cũng được xem câu hỏi và đề thi khi đã đăng nhập
CREATE POLICY "Authenticated users view questions" ON public.questions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers manage questions" ON public.questions
  FOR ALL USING (public.is_teacher());

CREATE POLICY "Authenticated users view exams" ON public.exams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers manage exams" ON public.exams
  FOR ALL USING (public.is_teacher());
`;

export const SETUP_GUIDE_CONTENT = {
  title: 'Hướng dẫn cài đặt Supabase & Vercel cho giáo viên',
  steps: [
    {
      step: 1,
      title: 'Tạo dự án Supabase miễn phí (Database Postgres + RLS)',
      desc: 'Truy cập https://supabase.com, nhấn "Start your project" và đăng nhập bằng tài khoản Google/GitHub. Nhấn "New project", đặt tên "toan-6-kntt", chọn mật khẩu database và vị trí máy chủ Singapore (gần Việt Nam nhất).',
    },
    {
      step: 2,
      title: 'Chạy mã SQL khởi tạo cơ sở dữ liệu & phân quyền',
      desc: 'Trong trang quản trị Supabase, mở mục "SQL Editor" ở thanh bên trái, nhấn "New query". Dán toàn bộ đoạn mã SQL bên dưới vào và nhấn nút "Run" (chạy). Hệ thống sẽ tạo đủ 5 bảng dữ liệu và thiết lập phân quyền RLS chuẩn 100% bảo mật học sinh - phụ huynh.',
    },
    {
      step: 3,
      title: 'Lấy khóa kết nối (API Keys)',
      desc: 'Vào mục "Project Settings" -> "API", sao chép 2 thông tin: Project URL và anon / public API Key. Dán vào file môi trường .env (VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY).',
    },
    {
      step: 4,
      title: 'Triển khai lên Vercel miễn phí (1 cú nhấp chuột)',
      desc: 'Truy cập https://vercel.com, đăng nhập và chọn "Add New" -> "Project". Kết nối với kho mã nguồn của bạn, điền 2 biến môi trường ở Bước 3 vào mục "Environment Variables", sau đó nhấn "Deploy". Chỉ sau 1 phút, web app sẽ có tên miền trực tuyến miễn phí và sẵn sàng gửi cho học sinh & phụ huynh!',
    }
  ]
};
