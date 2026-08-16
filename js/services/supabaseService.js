/**
 * SUPABASE SERVICE (TẦNG KẾT NỐI DATABASE TRỰC TIẾP VỚI SUPABASE CLOUD)
 * Khởi tạo Supabase Client v2 và đồng bộ dữ liệu hai chiều
 */

class SupabaseService {
  constructor() {
    this.rawUrl = CONFIG.SUPABASE.URL || "https://xqqckatsnsxukgeuxeit.supabase.co";
    // Chuẩn hóa tên miền nếu Thầy nhập .supabase.com -> .supabase.co
    this.url = this.rawUrl.replace(".supabase.com", ".supabase.co");
    this.key = CONFIG.SUPABASE.ANON_KEY;
    this.client = null;
    this.isLive = false;

    this.initClient();
  }

  // Khởi tạo Supabase Client
  initClient() {
    try {
      if (window.supabase && typeof window.supabase.createClient === "function" && this.url && this.key) {
        this.client = window.supabase.createClient(this.url, this.key);
        this.isLive = true;
        console.log("✅ Đã kết nối Supabase Cloud:", this.url);
      } else {
        console.warn("⚠️ Supabase Client SDK chưa sẵn sàng, sử dụng chế độ dự phòng Cục bộ.");
        this.isLive = false;
      }
    } catch (e) {
      console.error("Lỗi khởi tạo Supabase:", e);
      this.isLive = false;
    }
  }

  // Cập nhật cấu hình mới
  updateConfig(url, key) {
    this.rawUrl = url.trim();
    this.url = this.rawUrl.replace(".supabase.com", ".supabase.co");
    this.key = key.trim();
    localStorage.setItem("sb_url", this.url);
    localStorage.setItem("sb_anon_key", this.key);
    this.initClient();
    return this.isLive;
  }

  // Lấy trạng thái kết nối
  getStatus() {
    return {
      connected: this.isLive,
      url: this.url,
      mode: this.isLive ? "Supabase Cloud Live (Đã kết nối)" : "Bộ nhớ Cục bộ (Local Storage)"
    };
  }

  // 1. LẤY DANH SÁCH KẾ HOẠCH BÀI DẠY (LESSON_PLANS)
  async getLessonPlans() {
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from("lesson_plans")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          // Chuẩn hóa format trả về
          return data.map(item => ({
            id: item.id,
            title: item.title,
            grade: item.grade_level,
            subject: "Tin học",
            duration: item.duration_periods ? `${item.duration_periods} tiết` : "2 tiết",
            teacherName: item.teacher_name || "Cô Giáo Anh Đào",
            schoolName: item.school_name || "Trường Tiểu Học",
            createdAt: item.created_at,
            objectives: item.objectives || {},
            equipment: item.equipment || {},
            activities: item.teaching_steps || [],
            evaluation: item.notes || ""
          }));
        }
      } catch (err) {
        console.warn("Lỗi đọc dữ liệu từ Supabase, chuyển về LocalStorage:", err);
      }
    }

    // Dự phòng LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    return db.lessonPlans || [];
  }

  // 2. LƯU HOẶC CẬP NHẬT KẾ HOẠCH BÀI DẠY
  async saveLessonPlan(planData) {
    // 1. Lưu dự phòng vào LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.lessonPlans) db.lessonPlans = [];

    const existingIndex = db.lessonPlans.findIndex(p => p.id === planData.id);
    if (existingIndex >= 0) {
      db.lessonPlans[existingIndex] = { ...db.lessonPlans[existingIndex], ...planData, updatedAt: new Date().toISOString() };
    } else {
      planData.id = planData.id || ("plan_" + Date.now());
      planData.createdAt = new Date().toISOString();
      db.lessonPlans.unshift(planData);
    }
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // 2. Đồng bộ lên Supabase nếu có kết nối
    if (this.isLive && this.client) {
      try {
        const payload = {
          title: planData.title,
          grade_level: parseInt(planData.grade) || 3,
          duration_periods: parseInt(planData.duration) || 2,
          teacher_name: planData.teacherName || "Cô Giáo Anh Đào",
          school_name: planData.schoolName || "Trường Tiểu Học",
          objectives: planData.objectives,
          equipment: planData.equipment,
          teaching_steps: planData.activities,
          notes: planData.evaluation,
          is_public: true,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await this.client
          .from("lesson_plans")
          .insert([payload])
          .select();

        if (error) {
          console.warn("Chưa ghi được lên Supabase (có thể bảng đang khởi tạo):", error.message);
        } else {
          console.log("✅ Đã đồng bộ giáo án lên Supabase Cloud thành công!");
        }
      } catch (err) {
        console.warn("Lỗi đồng bộ Supabase:", err);
      }
    }

    return { success: true, plan: planData };
  }

  // 3. XÓA KẾ HOẠCH BÀI DẠY
  async deleteLessonPlan(planId) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    db.lessonPlans = (db.lessonPlans || []).filter(p => p.id !== planId);
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    if (this.isLive && this.client && planId.length > 20) {
      try {
        await this.client.from("lesson_plans").delete().eq("id", planId);
      } catch (err) {
        console.warn("Lỗi xóa trên Supabase:", err);
      }
    }

    return { success: true };
  }

  // 4. LƯU ĐIỂM HỌC TẬP VÀ SAO CỦA HỌC SINH
  async recordGameScore(studentId, gameId, score, stars) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    
    // Cập nhật điểm Local
    const student = (db.users || []).find(u => u.id === studentId || u.studentCode === studentId);
    if (student) {
      student.stars = (student.stars || 0) + stars;
    }

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

    db.leaderboard.sort((a, b) => b.stars - a.stars);
    db.leaderboard.forEach((item, idx) => item.rank = idx + 1);
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // Đồng bộ lên bảng student_progress của Supabase
    if (this.isLive && this.client) {
      try {
        await this.client.from("student_progress").insert([{
          student_name: student ? student.name : studentId,
          game_id: gameId,
          score: score,
          stars_earned: stars,
  isReady() {
    return this.isLive && !!this.client;
  }

  // 5. TẶNG SAO KHEN THƯỞNG TRỰC TIẾP TRÊN LỚP (ĐỒNG BỘ SUPABASE & LOCALSTORAGE)
  async awardStarsDirectly(studentName, starsToAdd = 10, reason = "Trả lời đúng câu hỏi trên Slide") {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.users) db.users = [];
    if (!db.leaderboard) db.leaderboard = [];

    let student = db.users.find(u => (u.name || "").toLowerCase() === studentName.toLowerCase() || (u.username || "").toLowerCase() === studentName.toLowerCase());
    let currentStars = 0;

    if (student) {
      student.stars = (student.stars || 0) + starsToAdd;
      currentStars = student.stars;
    } else {
      // Nếu chưa có trong danh sách local, tạo hồ sơ học sinh
      student = {
        id: "u_" + Date.now(),
        username: studentName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: studentName,
        role: "student",
        className: "3A",
        stars: 50 + starsToAdd,
        avatar: "⭐"
      };
      db.users.push(student);
      currentStars = student.stars;
    }

    // Cập nhật Bảng Vàng (Leaderboard)
    let leader = db.leaderboard.find(l => (l.name || "").toLowerCase() === studentName.toLowerCase());
    if (leader) {
      leader.stars = currentStars;
    } else {
      db.leaderboard.push({
        rank: db.leaderboard.length + 1,
        name: studentName,
        class: student.className || "3A",
        stars: currentStars,
        badge: "⭐ Ngôi Sao Giờ Học",
        avatar: student.avatar || "🎒"
      });
    }

    db.leaderboard.sort((a, b) => b.stars - a.stars);
    db.leaderboard.forEach((item, idx) => item.rank = idx + 1);
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // Cập nhật current user nếu trùng
    const currentUser = JSON.parse(localStorage.getItem("app_current_user"));
    if (currentUser && ((currentUser.name || "").toLowerCase() === studentName.toLowerCase() || (currentUser.username || "").toLowerCase() === studentName.toLowerCase())) {
      currentUser.stars = currentStars;
      localStorage.setItem("app_current_user", JSON.stringify(currentUser));
      if (window.authService) window.authService.currentUser = currentUser;
    }

    // ĐỒNG BỘ LÊN CƠ SỞ DỮ LIỆU SUPABASE CLOUD (TABLE: student_rewards & app_users)
    if (this.isReady()) {
      try {
        // 1. Ghi log khen thưởng vào bảng student_rewards
        await this.client.from("student_rewards").insert([{
          student_name: studentName,
          stars_added: starsToAdd,
          reason: reason,
          awarded_by: currentUser ? (currentUser.name || currentUser.username) : "Giáo Viên",
          created_at: new Date().toISOString()
        }]);

        // 2. Cập nhật số sao tích lũy trong app_users nếu có tài khoản
        const { data: userRow } = await this.client
          .from("app_users")
          .select("id, stars")
          .ilike("full_name", studentName)
          .maybeSingle();

        if (userRow) {
          await this.client
            .from("app_users")
            .update({ stars: (userRow.stars || 0) + starsToAdd })
            .eq("id", userRow.id);
        }
      } catch (err) {
        console.warn("Lưu khen thưởng lên Supabase Cloud có cảnh báo (dữ liệu đã an toàn trên Local):", err);
      }
    }

    return {
      success: true,
      studentName: studentName,
      starsAdded: starsToAdd,
      totalStars: currentStars
    };
  }
}

window.supabaseService = new SupabaseService();

