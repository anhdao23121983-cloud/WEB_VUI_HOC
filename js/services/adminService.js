/**
 * ADMIN SERVICE (DỊCH VỤ PHÂN QUYỀN & QUẢN TRỊ TOÀN DIỆN WEBSITE)
 * Dành cho Giáo viên quản trị và Ban giám hiệu quản lý thành viên, vai trò và thống kê
 */

class AdminService {
  constructor() {
    this.defaultPermissions = {
      allowStudentAvatarChange: true,
      allowTeacherExportWord: true,
      allowDirectQuizPlay: true,
      requirePlanApproval: false,
      enable3DComputerRoom: true
    };
  }

  // 1. Lấy danh sách toàn bộ người dùng trong hệ thống
  async getAllUsers() {
    // 1. Kiểm tra Supabase
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const { data, error } = await client
          .from("app_users")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(u => ({
            id: u.id,
            username: u.username,
            name: u.full_name,
            role: u.role || "student",
            school: u.school_name,
            grade: u.grade_level,
            className: u.class_name,
            stars: u.stars || 0,
            avatar: u.avatar || "🎒",
            isActive: u.is_active !== false,
            createdAt: u.created_at
          }));
        }
      } catch (err) {
        console.warn("Lỗi đọc danh sách user từ Supabase:", err);
      }
    }

    // 2. Dự phòng LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    return db.users || [];
  }

  // 2. Phân quyền vai trò người dùng (Admin, Teacher, Student)
  async updateUserRole(username, newRole) {
    const validRoles = ["admin", "teacher", "student"];
    if (!validRoles.includes(newRole)) {
      return { success: false, error: "Vai trò không hợp lệ!" };
    }

    // 1. Cập nhật LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const user = (db.users || []).find(u => u.username === username);
    if (user) {
      user.role = newRole;
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    // 2. Cập nhật Supabase
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        await client
          .from("app_users")
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq("username", username);
      } catch (err) {
        console.warn("Lỗi cập nhật vai trò trên Supabase:", err);
      }
    }

    // Cập nhật session hiện tại nếu chính mình được đổi
    const curUser = window.authService?.getUser();
    if (curUser && curUser.username === username) {
      curUser.role = newRole;
      localStorage.setItem("app_current_user", JSON.stringify(curUser));
      window.authService.notifyListeners();
    }

    return { success: true, newRole };
  }

  // 3. Khóa / Mở khóa tài khoản
  async toggleUserStatus(username) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const user = (db.users || []).find(u => u.username === username);
    let newStatus = true;

    if (user) {
      user.isActive = !user.isActive;
      newStatus = user.isActive;
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        await client
          .from("app_users")
          .update({ is_active: newStatus, updated_at: new Date().toISOString() })
          .eq("username", username);
      } catch (err) {
        console.warn("Lỗi cập nhật trạng thái user trên Supabase:", err);
      }
    }

    return { success: true, isActive: newStatus };
  }

  // 4. Đặt lại mật khẩu cho thành viên
  async resetUserPassword(username, newPassword = "123456") {
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        await client
          .from("app_users")
          .update({ password: newPassword, updated_at: new Date().toISOString() })
          .eq("username", username);
      } catch (err) {
        console.warn("Lỗi reset mật khẩu trên Supabase:", err);
      }
    }

    return { success: true };
  }

  // 5. Thống kê toàn diện hệ thống (Analytics)
  async getSystemAnalytics() {
    const users = await this.getAllUsers();
    const plans = await window.supabaseService?.getLessonPlans() || [];
    const quizzes = await window.quizService?.getAllQuizzes() || [];

    const stats = {
      totalUsers: users.length,
      adminCount: users.filter(u => u.role === "admin").length,
      teacherCount: users.filter(u => u.role === "teacher").length,
      studentCount: users.filter(u => u.role === "student").length,
      totalPlans: plans.length,
      totalQuizzes: quizzes.length,
      totalStars: users.reduce((sum, u) => sum + (u.stars || 0), 0),
      grade3Students: users.filter(u => u.grade === 3).length,
      grade4Students: users.filter(u => u.grade === 4).length,
      grade5Students: users.filter(u => u.grade === 5).length
    };

    return stats;
  }

  // 6. Cấu hình bảng quyền hạn hệ thống
  getPermissions() {
    const saved = localStorage.getItem("app_permission_matrix");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return this.defaultPermissions;
  }

  savePermissions(matrix) {
    localStorage.setItem("app_permission_matrix", JSON.stringify(matrix));
    return { success: true };
  }

  // 7. Admin chỉnh sửa thông tin thành viên (Họ tên, Mật khẩu, Vai trò, Khối Lớp, Lớp)
  async adminUpdateUser(username, updateData) {
    // 1. Cập nhật LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.users) db.users = [];
    const idx = db.users.findIndex(u => (u.username || "").toLowerCase() === username.toLowerCase());

    if (idx >= 0) {
      if (updateData.name) db.users[idx].name = updateData.name;
      if (updateData.role) db.users[idx].role = updateData.role;
      if (updateData.className) db.users[idx].className = updateData.className;
      if (updateData.grade) db.users[idx].grade = parseInt(updateData.grade);
      if (updateData.password) db.users[idx].password = updateData.password;
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    // 2. Cập nhật Supabase Cloud
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const payload = {
          updated_at: new Date().toISOString()
        };

        if (updateData.name) payload.full_name = updateData.name;
        if (updateData.role) payload.role = updateData.role;
        if (updateData.className) payload.class_name = updateData.className;
        if (updateData.grade) payload.grade_level = parseInt(updateData.grade);
        if (updateData.password && updateData.password.trim()) payload.password = updateData.password.trim();

        await client.from("app_users").update(payload).eq("username", username);
      } catch (err) {
        console.warn("Lỗi adminUpdateUser trên Supabase:", err);
      }
    }

    // Nếu sửa chính tài khoản đang đăng nhập
    const curUser = window.authService?.getUser();
    if (curUser && curUser.username === username) {
      if (updateData.name) curUser.name = updateData.name;
      if (updateData.role) curUser.role = updateData.role;
      if (updateData.className) curUser.className = updateData.className;
      if (updateData.grade) curUser.grade = parseInt(updateData.grade);
      localStorage.setItem("app_current_user", JSON.stringify(curUser));
      window.authService.notifyListeners();
    }

    return { success: true };
  }

  // 8. Admin xóa tài khoản thành viên (Giáo viên hoặc Học sinh)
  async adminDeleteUser(username) {
    if (username === "admin") {
      return { success: false, error: "Không thể xóa tài khoản Quản trị viên gốc hệ thống (admin)!" };
    }

    // 1. Xóa trong LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.users) {
      db.users = db.users.filter(u => (u.username || "").toLowerCase() !== username.toLowerCase());
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    // 2. Xóa trên Supabase Cloud
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        await client.from("app_users").delete().eq("username", username);
      } catch (err) {
        console.warn("Lỗi adminDeleteUser trên Supabase:", err);
      }
    }

    return { success: true };
  }
}

window.adminService = new AdminService();
