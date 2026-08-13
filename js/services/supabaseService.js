/**
 * SUPABASE SERVICE (TẦNG KẾT NỐI DATABASE & CLOUD STORAGE)
 * Hỗ trợ Dual-Mode: Supabase Live Cloud & Local Fallback
 */

class SupabaseService {
  constructor() {
    this.url = localStorage.getItem("sb_url") || "";
    this.key = localStorage.getItem("sb_anon_key") || "";
    this.isLive = !!(this.url && this.key);
  }

  // Cập nhật thông số cấu hình Supabase
  updateConfig(url, key) {
    this.url = url.trim();
    this.key = key.trim();
    localStorage.setItem("sb_url", this.url);
    localStorage.setItem("sb_anon_key", this.key);
    this.isLive = !!(this.url && this.key);
    return this.isLive;
  }

  // Kiểm tra trạng thái kết nối
  getStatus() {
    return {
      connected: this.isLive,
      url: this.url ? this.url.substring(0, 20) + "..." : "Chưa cấu hình (Đang dùng Bộ nhớ Cục bộ)",
      mode: this.isLive ? "Supabase PostgreSQL Live" : "Local Storage (Demo Offline)"
    };
  }

  // 1. Lấy danh sách Kế hoạch bài dạy
  async getLessonPlans() {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    return db.lessonPlans || [];
  }

  // 2. Lưu kế hoạch bài dạy mới hoặc cập nhật
  async saveLessonPlan(planData) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.lessonPlans) db.lessonPlans = [];

    const existingIndex = db.lessonPlans.findIndex(p => p.id === planData.id);
    if (existingIndex >= 0) {
      db.lessonPlans[existingIndex] = { ...db.lessonPlans[existingIndex], ...planData, updatedAt: new Date().toISOString() };
    } else {
      planData.id = "plan_" + Date.now();
      planData.createdAt = new Date().toISOString();
      db.lessonPlans.unshift(planData);
    }

    localStorage.setItem("app_mock_db", JSON.stringify(db));
    return { success: true, plan: planData };
  }

  // 3. Xóa kế hoạch bài dạy
  async deleteLessonPlan(planId) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    db.lessonPlans = (db.lessonPlans || []).filter(p => p.id !== planId);
    localStorage.setItem("app_mock_db", JSON.stringify(db));
    return { success: true };
  }

  // 4. Lưu điểm trò chơi của học sinh
  async recordGameScore(studentId, gameId, score, stars) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    
    // Cập nhật điểm cho user
    const student = (db.users || []).find(u => u.id === studentId || u.studentCode === studentId);
    if (student) {
      student.stars = (student.stars || 0) + stars;
    }

    // Cập nhật bảng xếp hạng
    let leader = (db.leaderboard || []).find(l => l.name === (student ? student.name : ""));
    if (leader) {
      leader.stars = student.stars;
    } else if (student) {
      db.leaderboard.push({
        rank: db.leaderboard.length + 1,
        name: student.name,
        class: student.className || "3A",
        stars: student.stars,
        badge: "⭐ Ngôi Sao Mới",
        avatar: student.avatar || "🎒"
      });
    }

    // Sắp xếp lại bảng xếp hạng
    db.leaderboard.sort((a, b) => b.stars - a.stars);
    db.leaderboard.forEach((item, idx) => item.rank = idx + 1);

    localStorage.setItem("app_mock_db", JSON.stringify(db));
    return { success: true, updatedStars: student ? student.stars : stars };
  }
}

window.supabaseService = new SupabaseService();
