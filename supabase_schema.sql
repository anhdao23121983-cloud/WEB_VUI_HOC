-- ==============================================================================
-- CƠ SỞ DỮ LIỆU SUPABASE POSTGRESQL - CLASSROOM APP (WEB VUI HỌC TIN HỌC 3-5)
-- BẢN SỬA LỖI ĐẦY ĐỦ: XÓA CẤU TRÚC CŨ VÀ TẠO LẠI ĐỒNG BỘ 100% CHUẨN XÁC
-- Dán toàn bộ mã này vào mục: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. XÓA BẢNG CŨ (NẾU ĐÃ TỒN TẠI VỚI CỘT CŨ) ĐỂ TRÁNH LỖI XUNG ĐỘT CỘT
DROP TABLE IF EXISTS public.lesson_plans CASCADE;
DROP TABLE IF EXISTS public.student_progress CASCADE;
DROP TABLE IF EXISTS public.educational_games CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.curriculum_lessons CASCADE;
DROP TABLE IF EXISTS public.curriculum_books CASCADE;

-- 2. TẠO BẢNG KẾ HOẠCH BÀI DẠY CÔNG VĂN 2345 (LESSON_PLANS)
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

-- 3. TẠO BẢNG HỒ SƠ NGƯỜI DÙNG (PROFILES)
CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_code TEXT UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('teacher', 'student', 'admin')) DEFAULT 'student',
    school_name TEXT DEFAULT 'Trường Tiểu Học',
    grade_level INTEGER DEFAULT 3,
    class_name TEXT DEFAULT '3A',
    stars INTEGER DEFAULT 0,
    avatar TEXT DEFAULT '🎒',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TẠO BẢNG DANH MỤC TRÒ CHƠI HỌC TẬP (EDUCATIONAL_GAMES)
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

-- 5. TẠO BẢNG TIẾN ĐỘ & ĐIỂM SỐ HỌC SINH (STUDENT_PROGRESS)
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
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Cấp quyền truy cập mở cho Website
CREATE POLICY "Allow public read lesson_plans" ON public.lesson_plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert lesson_plans" ON public.lesson_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update lesson_plans" ON public.lesson_plans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete lesson_plans" ON public.lesson_plans FOR DELETE USING (true);

CREATE POLICY "Allow public all profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow public all educational_games" ON public.educational_games FOR ALL USING (true);
CREATE POLICY "Allow public all student_progress" ON public.student_progress FOR ALL USING (true);

-- ==============================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ==============================================================================
INSERT INTO public.educational_games (id, title, grade_level, game_type, icon, description, badge)
VALUES
  ('game_hardware_match', '🧩 Thử Tài Phần Cứng Máy Tính', 3, 'interactive_drag', '🖥️', 'Kéo thả và nối đúng tên 4 bộ phận cơ bản của máy tính để bàn để mở khóa kho báu!', 'Kỹ Sư Phần Cứng Nhí'),
  ('game_bee_typing', '🐝 Ong Vàng Luyện Gõ 10 Ngón', 3, 'typing_master', '⌨️', 'Luyện đặt ngón tay đúng trên hàng phím cơ sở (F, J) để giúp chú Ong Vàng thu thập mật ngọt!', 'Bậc Thầy Gõ Phím'),
  ('game_knight_maze', '⚔️ Hiệp Sĩ Mê Cung Thuật Toán', 4, 'logic_puzzle', '🧭', 'Lập trình chuỗi lệnh (Tiến, Rẽ Trái, Rẽ Phải) giúp Hiệp Sĩ vượt cạm bẫy đến đích!', 'Nhà Thám Hiểm Thuật Toán'),
  ('game_cyber_quiz', '🛡️ Đố Vui Tin Học & An Toàn Số', 5, 'quiz_challenge', '💡', 'Thử thách trắc nghiệm 10 câu hỏi siêu tốc về mạng Internet và bảo vệ mật khẩu an toàn!', 'Vệ Binh Không Gian Mạng')
ON CONFLICT (id) DO NOTHING;

-- Chèn Kế hoạch bài dạy mẫu ban đầu chuẩn CV 2345
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
