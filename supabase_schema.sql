-- ==============================================================================
-- CƠ SỞ DỮ LIỆU SUPABASE POSTGRESQL - CLASSROOM APP (WEB VUI HỌC TIN HỌC 3-5)
-- HỆ THỐNG ĐỒNG BỘ ĐĂNG KÝ, ĐĂNG NHẬP, ĐĂNG XUẤT, SOẠN CÂU HỎI, PHÂN QUYỀN & BÀI GIẢNG ĐIỆN TỬ
-- Dán toàn bộ mã này vào mục: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. XÓA CẤU TRÚC CŨ ĐỂ TẠO LẠI ĐỒNG BỘ 100%
DROP TABLE IF EXISTS public.lecture_slides CASCADE;
DROP TABLE IF EXISTS public.lesson_quizzes CASCADE;
DROP TABLE IF EXISTS public.app_users CASCADE;
DROP TABLE IF EXISTS public.lesson_plans CASCADE;
DROP TABLE IF EXISTS public.student_progress CASCADE;
DROP TABLE IF EXISTS public.educational_games CASCADE;

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

-- 5. TẠO BẢNG QUẢN LÝ BÀI GIẢNG ĐIỆN TỬ & POWERPOINT (LECTURE_SLIDES)
CREATE TABLE public.lecture_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 3,
    topic_name TEXT DEFAULT 'Chủ đề A: Máy tính và em',
    book_series TEXT DEFAULT 'KNTT', -- KNTT, CD, CTST
    lesson_id TEXT,
    author_name TEXT DEFAULT 'Thầy Giáo Anh Đào',
    created_by_username TEXT DEFAULT 'anhdao',
    school_name TEXT DEFAULT 'Trường Tiểu Học Vui Học',
    file_name TEXT NOT NULL,
    file_size_text TEXT DEFAULT '5.2 MB',
    file_type TEXT DEFAULT 'pptx', -- pptx, ppt, pdf, link
    file_url TEXT NOT NULL,         -- Data URI / Supabase Storage URL / Embed Link
    slide_count INTEGER DEFAULT 18,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    thumbnail_color TEXT DEFAULT 'from-amber-500 to-rose-600',
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TẠO BẢNG ĐỀ KIỂM TRA & ĐÁNH GIÁ ĐỊNH KỲ THEO THÔNG TƯ 27 (EXAM_ASSESSMENTS)
CREATE TABLE public.exam_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 3,
    exam_type TEXT DEFAULT 'final_term_1', -- regular, mid_term_1, final_term_1, mid_term_2, final_term_2, matrix
    book_series TEXT DEFAULT 'KNTT',       -- KNTT, CD, CTST
    author_name TEXT DEFAULT 'Thầy Giáo Anh Đào',
    created_by_username TEXT DEFAULT 'anhdao',
    school_name TEXT DEFAULT 'Trường Tiểu Học Vui Học',
    duration_minutes INTEGER DEFAULT 35,
    total_score INTEGER DEFAULT 10,
    file_name TEXT NOT NULL,
    file_size_text TEXT DEFAULT '2.0 MB',
    file_type TEXT DEFAULT 'docx',         -- docx, doc, pdf, xlsx, pptx, link
    file_url TEXT NOT NULL,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    thumbnail_color TEXT DEFAULT 'from-blue-700 to-indigo-600',
    description TEXT DEFAULT '',
    matrix_json JSONB DEFAULT '{}'::jsonb, -- Ma trận 4 mức độ nhận thức
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TẠO BẢNG DANH MỤC TRÒ CHƠI HỌC TẬP (EDUCATIONAL_GAMES)
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

-- 8. TẠO BẢNG TIẾN ĐỘ & ĐIỂM SỐ HỌC SINH (STUDENT_PROGRESS)
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
ALTER TABLE public.lecture_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Cấp quyền truy cập mở cho Website
CREATE POLICY "Allow public all app_users" ON public.app_users FOR ALL USING (true);
CREATE POLICY "Allow public all lesson_plans" ON public.lesson_plans FOR ALL USING (true);
CREATE POLICY "Allow public all lesson_quizzes" ON public.lesson_quizzes FOR ALL USING (true);
CREATE POLICY "Allow public all lecture_slides" ON public.lecture_slides FOR ALL USING (true);
CREATE POLICY "Allow public all exam_assessments" ON public.exam_assessments FOR ALL USING (true);
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

-- 2. Chèn danh mục Bài giảng điện tử PowerPoint mẫu
INSERT INTO public.lecture_slides (title, grade_level, topic_name, lesson_id, author_name, school_name, file_name, file_size_text, file_type, file_url, slide_count, download_count, view_count, thumbnail_color, description)
VALUES
  (
    'Bài Giảng Điện Tử: Khám Phá Máy Tính Để Bàn',
    3,
    'Chủ đề A: Máy tính và em',
    'L3_02',
    'Thầy Giáo Anh Đào',
    'Trường Tiểu Học Vui Học',
    'BaiGiang_TinHoc3_KhamPhaMayTinh.pptx',
    '6.8 MB',
    'pptx',
    'https://view.officeapps.live.com/op/view.aspx?src=https://file-examples.com/storage/fe59972322649b1a5905d6a/2017/08/file_example_PPTX_250kB.pptx',
    22,
    145,
    520,
    'from-blue-600 to-cyan-500',
    'Bài giảng PowerPoint thiết kế hoạt họa sinh động 4 bộ phận máy tính: Thân máy, Màn hình, Bàn phím, Chuột.'
  ),
  (
    'Bài Giảng Điện Tử: Em Tập Sử Dụng Chuột Máy Tính',
    3,
    'Chủ đề A: Máy tính và em',
    'L3_03',
    'Thầy Giáo Anh Đào',
    'Trường Tiểu Học Vui Học',
    'BaiGiang_TinHoc3_TapSuDungChuot.pptx',
    '4.5 MB',
    'pptx',
    'https://view.officeapps.live.com/op/view.aspx?src=https://file-examples.com/storage/fe59972322649b1a5905d6a/2017/08/file_example_PPTX_250kB.pptx',
    18,
    98,
    380,
    'from-emerald-600 to-teal-500',
    'Hình ảnh hướng dẫn thực hành cầm chuột bằng tay phải, nháy đơn, nháy kép và kéo thả đối tượng.'
  ),
  (
    'Bài Giảng Điện Tử: Phần Cứng & Phần Mềm Máy Tính',
    4,
    'Chủ đề A: Máy tính và em',
    'L4_01',
    'Thầy Giáo Anh Đào',
    'Trường Tiểu Học Vui Học',
    'BaiGiang_TinHoc4_PhanCungPhanMem.pptx',
    '8.2 MB',
    'pptx',
    'https://view.officeapps.live.com/op/view.aspx?src=https://file-examples.com/storage/fe59972322649b1a5905d6a/2017/08/file_example_PPTX_250kB.pptx',
    26,
    180,
    640,
    'from-amber-500 to-orange-600',
    'Trực quan hóa sự khác biệt giữa phần cứng vật lý và các phần mềm ứng dụng trong đời sống.'
  ),
  (
    'Bài Giảng Điện Tử: Tìm Kiếm Thông Tin An Toàn Trên Internet',
    5,
    'Chủ đề C: Tổ chức lưu trữ và tìm kiếm',
    'L5_01',
    'Thầy Giáo Anh Đào',
    'Trường Tiểu Học Vui Học',
    'BaiGiang_TinHoc5_TimKiemInternet.pptx',
    '5.7 MB',
    'pptx',
    'https://view.officeapps.live.com/op/view.aspx?src=https://file-examples.com/storage/fe59972322649b1a5905d6a/2017/08/file_example_PPTX_250kB.pptx',
    24,
    210,
    890,
    'from-purple-600 to-indigo-600',
    'Kỹ năng tra cứu thông tin bằng từ khóa chính xác và bảo vệ an toàn thông tin cá nhân trên mạng.'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Chèn danh mục Game học tập
INSERT INTO public.educational_games (id, title, grade_level, game_type, icon, description, badge)
VALUES
  ('game_hardware_match', '🧩 Thử Tài Phần Cứng Máy Tính', 3, 'interactive_drag', '🖥️', 'Kéo thả và nối đúng tên 4 bộ phận cơ bản của máy tính để bàn để mở khóa kho báu!', 'Kỹ Sư Phần Cứng Nhí'),
  ('game_bee_typing', '🐝 Ong Vàng Luyện Gõ 10 Ngón', 3, 'typing_master', '⌨️', 'Luyện đặt ngón tay đúng trên hàng phím cơ sở (F, J) để giúp chú Ong Vàng thu thập mật ngọt!', 'Bậc Thầy Gõ Phím'),
  ('game_knight_maze', '⚔️ Hiệp Sĩ Mê Cung Thuật Toán', 4, 'logic_puzzle', '🧭', 'Lập trình chuỗi lệnh (Tiến, Rẽ Trái, Rẽ Phải) giúp Hiệp Sĩ vượt cạm bẫy đến đích!', 'Nhà Thám Hiểm Thuật Toán'),
  ('game_cyber_quiz', '🛡️ Đố Vui Tin Học & An Toàn Số', 5, 'quiz_challenge', '💡', 'Thử thách trắc nghiệm 10 câu hỏi siêu tốc về mạng Internet và bảo vệ mật khẩu an toàn!', 'Vệ Binh Không Gian Mạng'),
  ('game_3d_computer_power', '🖥️ Mô Phỏng 3D: Phòng Máy & Bật/Tắt Máy Tính', 3, '3d_simulation', '🌐', 'Trải nghiệm mô phỏng 3D phòng máy tính thực tế ảo, cắm nguồn điện, bật CPU, bật màn hình và tắt máy an toàn!', 'Bậc Thầy Vận Hành 3D')
ON CONFLICT (id) DO NOTHING;

-- 4. Chèn dữ liệu mẫu Đề Kiểm Tra Định Kỳ (exam_assessments)
INSERT INTO public.exam_assessments 
  (title, grade_level, exam_type, book_series, author_name, created_by_username, school_name, duration_minutes, total_score, file_name, file_size_text, file_type, file_url, download_count, view_count, thumbnail_color, description)
VALUES
  (
    'Đề Kiểm Tra Cuối Học Kỳ I - Tin Học Lớp 3 (Kèm Ma Trận & Bản Đặc Tả)',
    3,
    'final_term_1',
    'KNTT',
    'Thầy Giáo Anh Đào',
    'anhdao',
    'Trường Tiểu Học Vui Học',
    35,
    10,
    'De_Kiem_Tra_Cuoi_HK1_TinHoc3_KNTT.docx',
    '1.8 MB',
    'docx',
    '#',
    42,
    156,
    'from-blue-700 to-indigo-600',
    'Đề kiểm tra đánh giá định kỳ Cuối HK1 lớp 3 bộ sách Kết Nối Tri Thức. Cấu trúc 7 điểm Trắc nghiệm + 3 điểm Thực hành gõ phím và vẽ Paint.'
  ),
  (
    'Đề Kiểm Tra Giữa Học Kỳ I - Tin Học Lớp 4 (Cánh Diều)',
    4,
    'mid_term_1',
    'CD',
    'Thầy Giáo Anh Đào',
    'anhdao',
    'Trường Tiểu Học Vui Học',
    35,
    10,
    'De_Giua_HK1_TinHoc4_CanhDieu.docx',
    '2.3 MB',
    'docx',
    '#',
    38,
    120,
    'from-amber-600 to-orange-600',
    'Đề kiểm tra định kỳ Giữa HK1 Tin học 4: Phần cứng và phần mềm, tạo cây thư mục và quy tắc an toàn thông tin.'
  ),
  (
    'Bộ Ma Trận & Bản Đặc Tả Đề Kiểm Tra Cuối Học Kỳ II - Tin Học Lớp 5',
    5,
    'matrix',
    'CTST',
    'Thầy Giáo Anh Đào',
    'anhdao',
    'Trường Tiểu Học Vui Học',
    40,
    10,
    'Ma_Tran_Ban_Dac_Ta_TinHoc5_CTST.docx',
    '1.5 MB',
    'docx',
    '#',
    65,
    230,
    'from-emerald-700 to-teal-600',
    'Bản đặc tả ma trận chuẩn 4 mức độ nhận thức theo Thông tư 27 và hướng dẫn chấm bài thực hành lập trình Scratch / Soạn thảo trình chiếu.'
  ),
  (
    'Đề Kiểm Tra Thường Xuyên 15 Phút: Khám Phá Máy Tính (Lớp 3)',
    3,
    'regular',
    'KNTT',
    'Thầy Giáo Anh Đào',
    'anhdao',
    'Trường Tiểu Học Vui Học',
    15,
    10,
    'De_15P_KhamPhaMayTinh_Lop3.docx',
    '850 KB',
    'docx',
    '#',
    29,
    95,
    'from-purple-700 to-indigo-800',
    'Bài kiểm tra nhanh 15 phút đầu giờ: 10 câu trắc nghiệm nhanh kiểm tra nhận biết bàn phím, chuột và màn hình.'
  )
ON CONFLICT (id) DO NOTHING;

