-- ==============================================================================
-- CƠ SỞ DỮ LIỆU SUPABASE POSTGRESQL - CLASSROOM APP (WEB VUI HỌC TIN HỌC 3-5)
-- HỆ THỐNG ĐỒNG BỘ ĐĂNG KÝ, ĐĂNG NHẬP, ĐĂNG XUẤT, SOẠN CÂU HỎI & PHÂN QUYỀN (FE - BE - DB)
-- Dán toàn bộ mã này vào mục: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. XÓA CẤU TRÚC CŨ ĐỂ TẠO LẠI ĐỒNG BỘ 100%
DROP TABLE IF EXISTS public.lesson_quizzes CASCADE;
DROP TABLE IF EXISTS public.app_users CASCADE;
DROP TABLE IF EXISTS public.lesson_plans CASCADE;
DROP TABLE IF EXISTS public.student_progress CASCADE;
DROP TABLE IF EXISTS public.educational_games CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.curriculum_lessons CASCADE;
DROP TABLE IF EXISTS public.curriculum_books CASCADE;

-- 2. TẠO BẢNG TÀI KHOẢN NGƯỜI DÙNG & PHÂN QUYỀN (APP_USERS)
CREATE TABLE public.app_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'student',
    school_name TEXT DEFAULT 'Trường Tiểu Học Vui Học',
    grade_level INTEGER DEFAULT 3,
    class_name TEXT DEFAULT '3A',
    stars INTEGER DEFAULT 50,
    avatar TEXT DEFAULT '🎒',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TẠO BẢNG KẾ HOẠCH BÀI DẠY CÔNG VĂN 2345 (LESSON_PLANS)
CREATE TABLE public.lesson_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 3,
    duration_periods INTEGER DEFAULT 2,
    teacher_name TEXT DEFAULT 'Thầy Giáo Anh Đào',
    school_name TEXT DEFAULT 'Trường Tiểu Học Vui Học',
    objectives JSONB DEFAULT '{}'::jsonb,
    equipment JSONB DEFAULT '{}'::jsonb,
    teaching_steps JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TẠO BẢNG CÂU HỎI TRẮC NGHIỆM BÀI HỌC (LESSON_QUIZZES)
CREATE TABLE public.lesson_quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    lesson_title TEXT NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 3,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Mảng 4 đáp án ["A...", "B...", "C...", "D..."]
    correct_index INTEGER NOT NULL DEFAULT 0,  -- 0: A, 1: B, 2: C, 3: D
    explanation TEXT DEFAULT '',
    stars INTEGER DEFAULT 15,
    created_by TEXT DEFAULT 'Thầy Giáo Anh Đào',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TẠO BẢNG DANH MỤC TRÒ CHƠI HỌC TẬP (EDUCATIONAL_GAMES)
CREATE TABLE public.educational_games (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    grade_level INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    badge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TẠO BẢNG TIẾN ĐỘ & ĐIỂM SỐ HỌC SINH (STUDENT_PROGRESS)
CREATE TABLE public.student_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name TEXT NOT NULL,
    game_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    stars_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- BẬT BẢO MẬT CẤP HÀNG (ROW LEVEL SECURITY - RLS) & PHÂN QUYỀN TRUY CẬP
-- ==============================================================================
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Cấp quyền truy cập mở cho Website
CREATE POLICY "Allow public all app_users" ON public.app_users FOR ALL USING (true);
CREATE POLICY "Allow public all lesson_plans" ON public.lesson_plans FOR ALL USING (true);
CREATE POLICY "Allow public all lesson_quizzes" ON public.lesson_quizzes FOR ALL USING (true);
CREATE POLICY "Allow public all educational_games" ON public.educational_games FOR ALL USING (true);
CREATE POLICY "Allow public all student_progress" ON public.student_progress FOR ALL USING (true);

-- ==============================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ==============================================================================

-- 1. Chèn tài khoản mẫu ban đầu (Admin, Giáo viên và Học sinh)
INSERT INTO public.app_users (username, password, full_name, role, school_name, grade_level, class_name, stars, avatar, is_active)
VALUES
  ('admin', '123456', 'Quản Trị Viên Tối Cao', 'admin', 'Hệ Thống Anh Đào Classroom', 0, 'Ban Giám Hiệu', 9999, '👑', true),
  ('anhdao', '123456', 'Thầy Giáo Anh Đào', 'teacher', 'Trường Tiểu Học Vui Học', 3, 'Tổ Tin Học', 999, '👨‍🏫', true),
  ('hs3a01', '123456', 'Nguyễn Văn An', 'student', 'Trường Tiểu Học Vui Học', 3, '3A', 180, '👦', true),
  ('hs4b02', '123456', 'Lê Thị Mai', 'student', 'Trường Tiểu Học Vui Học', 4, '4B', 240, '👧', true),
  ('hs5a03', '123456', 'Trần Đức Nam', 'student', 'Trường Tiểu Học Vui Học', 5, '5A', 310, '🧑‍💻', true)
ON CONFLICT (username) DO NOTHING;

-- 2. Chèn danh mục Game học tập
INSERT INTO public.educational_games (id, title, grade_level, game_type, icon, description, badge)
VALUES
  ('game_hardware_match', '🧩 Thử Tài Phần Cứng Máy Tính', 3, 'interactive_drag', '🖥️', 'Kéo thả và nối đúng tên 4 bộ phận cơ bản của máy tính để bàn để mở khóa kho báu!', 'Kỹ Sư Phần Cứng Nhí'),
  ('game_bee_typing', '🐝 Ong Vàng Luyện Gõ 10 Ngón', 3, 'typing_master', '⌨️', 'Luyện đặt ngón tay đúng trên hàng phím cơ sở (F, J) để giúp chú Ong Vàng thu thập mật ngọt!', 'Bậc Thầy Gõ Phím'),
  ('game_knight_maze', '⚔️ Hiệp Sĩ Mê Cung Thuật Toán', 4, 'logic_puzzle', '🧭', 'Lập trình chuỗi lệnh (Tiến, Rẽ Trái, Rẽ Phải) giúp Hiệp Sĩ vượt cạm bẫy đến đích!', 'Nhà Thám Hiểm Thuật Toán'),
  ('game_cyber_quiz', '🛡️ Đố Vui Tin Học & An Toàn Số', 5, 'quiz_challenge', '💡', 'Thử thách trắc nghiệm 10 câu hỏi siêu tốc về mạng Internet và bảo vệ mật khẩu an toàn!', 'Vệ Binh Không Gian Mạng'),
  ('game_3d_computer_power', '🖥️ Mô Phỏng 3D: Phòng Máy & Bật/Tắt Máy Tính', 3, '3d_simulation', '🌐', 'Trải nghiệm mô phỏng 3D phòng máy tính thực tế ảo, cắm nguồn điện, bật CPU, bật màn hình và tắt máy an toàn!', 'Bậc Thầy Vận Hành 3D')
ON CONFLICT (id) DO NOTHING;

-- 3. Chèn Kế hoạch bài dạy mẫu chuẩn CV 2345
INSERT INTO public.lesson_plans (title, grade_level, duration_periods, teacher_name, school_name, objectives, equipment, teaching_steps, notes)
VALUES (
  'KẾ HOẠCH BÀI DẠY: KHÁM PHÁ MÁY TÍNH',
  3,
  2,
  'Thầy Giáo Anh Đào',
  'Trường Tiểu Học Vui Học',
  '{"competencies": {"general": "Tự chủ và tự học: Nhận diện thiết bị máy tính; Giao tiếp hợp tác nhóm.", "specific": "Chỉ đúng 4 bộ phận cơ bản của máy tính để bàn (Thân máy, Màn hình, Bàn phím, Chuột)."}, "qualities": "Chăm chỉ, giữ gìn và bảo quản thiết bị."}'::jsonb,
  '{"teacher": "Máy chiếu, bài giảng PowerPoint, máy tính để bàn mẫu.", "student": "SGK Tin học 3, vở ghi."}'::jsonb,
  '[{"step": 1, "name": "1. HOẠT ĐỘNG KHỞI ĐỘNG (5 phút)", "content": "Giải câu đố vui về người bạn máy tính.", "objective": "Tạo hứng thú vào bài.", "organization": "GV đọc câu đố -> HS trả lời -> GV nhận xét dẫn vào bài."}, {"step": 2, "name": "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC (15 phút)", "content": "Khám phá 4 bộ phận cơ bản.", "objective": "Nhận biết tên gọi và chức năng.", "organization": "Thảo luận nhóm ghép thẻ tên với thiết bị thật."}, {"step": 3, "name": "3. HOẠT ĐỘNG LUYỆN TẬP (10 phút)", "content": "Chơi game Thử tài phần cứng trên Web Vui Học.", "objective": "Củng cố kỹ năng nhận diện.", "organization": "HS thực hành nối thiết bị trên máy tính."}, {"step": 4, "name": "4. HOẠT ĐỘNG VẬN DỤNG (5 phút)", "content": "Quy tắc an toàn khi dùng máy tính.", "objective": "Bảo vệ an toàn điện và thiết bị.", "organization": "Liên hệ thực tế gia đình và lớp học."}]'::jsonb,
  'Học sinh hào hứng tham gia và đạt 100% mục tiêu bài dạy.'
);

-- 4. Chèn Câu hỏi trắc nghiệm mẫu cho các bài học
INSERT INTO public.lesson_quizzes (lesson_id, lesson_title, grade_level, question, options, correct_index, explanation, stars, created_by)
VALUES
  (
    'L3_02',
    'Khám phá máy tính',
    3,
    'Bộ phận nào của máy tính để bàn có chức năng hiển thị kết quả làm việc cho em nhìn thấy?',
    '["A. Thân máy", "B. Màn hình", "C. Bàn phím", "D. Chuột máy tính"]'::jsonb,
    1,
    'Màn hình là thiết bị xuất dữ liệu dạng hình ảnh để chúng ta quan sát và làm việc.',
    15,
    'Thầy Giáo Anh Đào'
  ),
  (
    'L3_02',
    'Khám phá máy tính',
    3,
    'Bộ phận nào được coi là "Bộ não" trung tâm điều khiển mọi hoạt động của máy tính?',
    '["A. Chuột", "B. Bàn phím", "C. Thân máy tính (chứa CPU)", "D. Loa"]'::jsonb,
    2,
    'Bên trong Thân máy có bộ vi xử lý CPU đóng vai trò như bộ não xử lý mọi phép tính.',
    15,
    'Thầy Giáo Anh Đào'
  ),
  (
    'L3_03',
    'Em tập sử dụng chuột máy tính',
    3,
    'Khi cầm chuột máy tính bằng tay phải, ngón trỏ của em sẽ đặt vào nút nào?',
    '["A. Nút trái chuột", "B. Nút phải chuột", "C. Nút cuộn ở giữa", "D. Thân chuột"]'::jsonb,
    0,
    'Quy tắc cầm chuột chuẩn: Ngón trỏ đặt nút trái, ngón giữa đặt nút phải.',
    15,
    'Thầy Giáo Anh Đào'
  ),
  (
    'L4_01',
    'Phần cứng và phần mềm máy tính',
    4,
    'Vật nào sau đây là ví dụ về PHẦN CỨNG của máy tính?',
    '["A. Phần mềm Paint tập vẽ", "B. Hệ điều hành Windows", "C. Bàn phím và Chuột", "D. Trò chơi Minecraft"]'::jsonb,
    2,
    'Phần cứng là các thiết bị vật lý mà em có thể nhìn thấy và chạm tay vào được như bàn phím, chuột, màn hình.',
    20,
    'Thầy Giáo Anh Đào'
  ),
  (
    'L5_01',
    'Thu thập và tìm kiếm thông tin trên Internet',
    5,
    'Để tìm kiếm thông tin về bài học Lịch sử trên Internet, em nên sử dụng công cụ nào?',
    '["A. Phần mềm soạn thảo Word", "B. Máy tìm kiếm (Google, Bing...)", "C. Phần mềm Paint", "D. Trình nghe nhạc"]'::jsonb,
    1,
    'Máy tìm kiếm trên Internet giúp em tra cứu văn bản, hình ảnh, tài liệu học tập nhanh chóng và chính xác.',
    25,
    'Thầy Giáo Anh Đào'
  );
