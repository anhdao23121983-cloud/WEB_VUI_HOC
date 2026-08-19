/**
 * CẤU HÌNH HỆ THỐNG CLASSROOM APP
 * Đã tích hợp Supabase Project URL và Public Key của Thầy
 */

const CONFIG = {
  APP_NAME: "HỌC LIỆU & VUI HỌC TIN HỌC",
  APP_SUBTITLE: "Hệ thống Quản lý Kế hoạch bài dạy CV 2345 & Game Hub Tin học 3-5",
  BRAND_BANNER: "ANH ĐÀO - CLASSROOM APP",
  VERSION: "2.1.0",

  // Cấu hình Supabase Trực Tuyến
  SUPABASE: {
    URL: localStorage.getItem("sb_url") || "https://xqqckatsnsxukgeuxeit.supabase.co",
    ANON_KEY: localStorage.getItem("sb_anon_key") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxcWNrYXRzbnN4dWtnZXV4ZWl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE4Mjk2MywiZXhwIjoyMTAxNzU4OTYzfQ.Kd5ZQVXw1nV5AbSfB3iFt-AAGr7nUS9sS1AzWHkoOHQ",
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
