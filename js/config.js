/**
 * CẤU HÌNH HỆ THỐNG CLASSROOM APP
 * Lưu trữ cấu hình Supabase, Gemini AI, và các hằng số ứng dụng
 */

const CONFIG = {
  APP_NAME: "HỌC LIỆU & VUI HỌC TIN HỌC TIỂU HỌC",
  APP_SUBTITLE: "Hệ thống Quản lý Kế hoạch bài dạy CV 2345 & Game Hub Tin học 3-5",
  BRAND_BANNER: "ANH ĐÀO - CLASSROOM APP",
  VERSION: "2.0.0",

  // Cấu hình Supabase (Thầy có thể cập nhật trong Cài đặt hoặc tại đây)
  SUPABASE: {
    URL: localStorage.getItem("sb_url") || "",
    ANON_KEY: localStorage.getItem("sb_anon_key") || "",
    BUCKET_DOCS: "lesson-plans",
    BUCKET_GAMES: "game-assets"
  },

  // Cấu hình AI Gemini
  AI: {
    GEMINI_API_KEY: localStorage.getItem("gemini_api_key") || "",
    DEFAULT_MODEL: "gemini-1.5-flash"
  },

  // Khối lớp hỗ trợ
  GRADES: [
    { level: 3, name: "Tin học Lớp 3", icon: "🎒", color: "from-cyan-500 to-blue-500" },
    { level: 4, name: "Tin học Lớp 4", icon: "🚀", color: "from-emerald-500 to-teal-500" },
    { level: 5, name: "Tin học Lớp 5", icon: "⭐", color: "from-amber-500 to-orange-500" }
  ],

  // Bộ sách giáo khoa
  BOOKS: [
    { code: "KNTT", name: "Kết Nối Tri Thức Với Cuộc Sống", publisher: "NXB Giáo dục Việt Nam", icon: "📘" },
    { code: "CANH_DIEU", name: "Cánh Diều", publisher: "NXB ĐH Sư Phạm", icon: "🪁" },
    { code: "CHAN_TROI", name: "Chân Trời Sáng Tạo", publisher: "NXB Giáo dục Việt Nam", icon: "🌅" }
  ],

  // Vai trò người dùng
  ROLES: {
    TEACHER: "teacher",
    STUDENT: "student",
    ADMIN: "admin"
  }
};

window.CONFIG = CONFIG;
