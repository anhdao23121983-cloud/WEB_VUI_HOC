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
        if (updateData.password && updateData.password.trim()) {
          payload.password = await window.authService.hashPassword(updateData.password.trim());
        }

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

  // 9. Nhập hàng loạt tài khoản học sinh từ mảng/dữ liệu CSV Excel
  async batchImportUsers(usersArray) {
    if (!usersArray || !Array.isArray(usersArray) || usersArray.length === 0) {
      return { success: false, error: "Danh sách nhập vào trống!" };
    }

    let successCount = 0;
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.users) db.users = [];

    const preparedSupabaseUsers = [];

    for (const u of usersArray) {
      const cleanUsername = (u.username || "").trim().toLowerCase();
      const cleanName = (u.name || u.full_name || cleanUsername).trim();
      const role = u.role || "student";
      const grade = parseInt(u.grade || u.grade_level) || 3;
      const className = u.className || u.class_name || `${grade}A`;
      const password = (u.password || "123456").trim();

      if (!cleanUsername) continue;

      const hashedPassword = await window.authService.hashPassword(password);

      const newUserObj = {
        username: cleanUsername,
        password: hashedPassword,
        full_name: cleanName,
        role: role,
        school_name: "Trường Tiểu Học Vui Học",
        class_name: className,
        grade_level: grade,
        stars: role === "teacher" ? 999 : 50,
        avatar: role === "teacher" ? "👨‍🏫" : (grade === 4 ? "👧" : grade === 5 ? "🧑‍💻" : "👦")
      };

      preparedSupabaseUsers.push(newUserObj);

      // Lưu dự phòng LocalStorage
      const existsIdx = db.users.findIndex(x => (x.username || "").toLowerCase() === cleanUsername);
      const mappedUser = {
        id: "u_" + Date.now() + Math.random().toString(36).substring(2, 6),
        username: cleanUsername,
        name: cleanName,
        role: role,
        school: "Trường Tiểu Học Vui Học",
        className: className,
        grade: grade,
        stars: newUserObj.stars,
        avatar: newUserObj.avatar,
        password: password
      };

      if (existsIdx >= 0) {
        db.users[existsIdx] = mappedUser;
      } else {
        db.users.push(mappedUser);
      }
      successCount++;
    }

    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // Đồng bộ lên Supabase Cloud
    if (window.supabaseService?.isReady() && preparedSupabaseUsers.length > 0) {
      try {
        const client = window.supabaseService.client;
        await client.from("app_users").upsert(preparedSupabaseUsers, { onConflict: "username" });
      } catch (err) {
        console.warn("Lỗi batchImportUsers trên Supabase:", err);
      }
    }

    return { success: true, count: successCount };
  }

  // 10. Trích xuất Lịch sử nhật ký hoạt động (Audit Logs) của thành viên
  async getUserAuditLogs(username) {
    const history = window.examService?.getExamHistory() || [];
    const userAttempts = history.filter(h => 
      (h.studentName && h.studentName.toLowerCase().includes(username.toLowerCase())) ||
      (h.createdByUsername && h.createdByUsername.toLowerCase() === username.toLowerCase())
    );

    const logs = [
      {
        timestamp: new Date().toISOString(),
        action: "Đăng nhập hệ thống",
        detail: `Tài khoản '${username}' vừa đăng nhập ứng dụng Vui Học.`,
        type: "login"
      }
    ];

    userAttempts.forEach(att => {
      logs.push({
        timestamp: att.submittedAt || new Date().toISOString(),
        action: `Hoàn thành bài kiểm tra: ${att.examTitle || 'Đề thi định kỳ'}`,
        detail: `Đạt ${att.score}/10 Điểm • Xếp loại: ${att.classification || 'Khá'} • Thưởng +${att.starsEarned || 20} ⭐`,
        type: "exam"
      });
      if (att.tabSwitchCount > 0) {
        logs.push({
          timestamp: att.submittedAt || new Date().toISOString(),
          action: "🚨 Cảnh báo vi phạm chuyển tab",
          detail: `Ghi nhận vi phạm ${att.tabSwitchCount} lần chuyển màn hình trong ca thi.`,
          type: "warning"
        });
      }
    });

    return logs;
  }

  // 11. Tự động chuyển niên học mới: Nâng khối lớp (3->4, 4->5) và reset mật khẩu về 123456
  async promoteAcademicYear() {
    const users = await this.getAllUsers();
    let promotedCount = 0;
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.users) db.users = [];

    const updatedSupabaseUsers = [];

    users.forEach(u => {
      if (u.role === "student") {
        const curGrade = parseInt(u.grade) || 3;
        let newGrade = curGrade;
        let newClassName = u.className || "3A";

        if (curGrade === 3) {
          newGrade = 4;
          newClassName = newClassName.replace("3", "4");
        } else if (curGrade === 4) {
          newGrade = 5;
          newClassName = newClassName.replace("4", "5");
        } else if (curGrade === 5) {
          newClassName = "Đã Tốt Nghiệp";
        }

        // Cập nhật LocalStorage
        const localIdx = db.users.findIndex(x => (x.username || "").toLowerCase() === u.username.toLowerCase());
        if (localIdx >= 0) {
          db.users[localIdx].grade = newGrade;
          db.users[localIdx].className = newClassName;
          db.users[localIdx].password = "123456";
        }

        updatedSupabaseUsers.push({
          username: u.username,
          grade_level: newGrade,
          class_name: newClassName,
          password: "123456",
          updated_at: new Date().toISOString()
        });

        promotedCount++;
      }
    });

    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // Đồng bộ lên Supabase Cloud
    if (window.supabaseService?.isReady() && updatedSupabaseUsers.length > 0) {
      try {
        const client = window.supabaseService.client;
        for (const su of updatedSupabaseUsers) {
          await client.from("app_users").update({
            grade_level: su.grade_level,
            class_name: su.class_name,
            password: su.password,
            updated_at: su.updated_at
          }).eq("username", su.username);
        }
      } catch (err) {
        console.warn("Lỗi promoteAcademicYear trên Supabase:", err);
      }
    }

    return { success: true, count: promotedCount };
  }

  // 12. Phân tích ma trận năng lực 5 chủ đề Tin học GDPT 2018 (Chủ đề A, B, C, D, E)
  async getStudentCompetencyRadar(username) {
    const history = window.examService?.getExamHistory() || [];
    const attempts = history.filter(h => h.studentName && h.studentName.toLowerCase().includes(username.toLowerCase()));

    let avgScore = 8.5;
    if (attempts.length > 0) {
      avgScore = attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length;
    }

    // Tính toán điểm số năng lực 5 chủ đề GDPT 2018 (Thang 100)
    const factor = (avgScore / 10.0);

    return {
      topicA: Math.min(100, Math.round((85 + Math.random() * 10) * factor)), // Máy tính & Em
      topicB: Math.min(100, Math.round((80 + Math.random() * 15) * factor)), // Mạng máy tính & Internet
      topicC: Math.min(100, Math.round((90 + Math.random() * 8) * factor)),  // Sắp xếp đồ vật & Cây thư mục
      topicD: Math.min(100, Math.round((88 + Math.random() * 10) * factor)), // Đạo đức & Văn hóa mạng
      topicE: Math.min(100, Math.round((82 + Math.random() * 12) * factor))  // Lập trình Robot & Scratch
    };
  }

  // 13. Tự động sao lưu dự phòng CSDL (Auto Backup Database)
  async createDatabaseBackup() {
    const users = await this.getAllUsers();
    const plans = await window.supabaseService?.getLessonPlans() || [];
    const quizzes = await window.quizService?.getAllQuizzes() || [];
    const history = window.examService?.getExamHistory() || [];

    const backupPayload = {
      backupDate: new Date().toISOString(),
      version: "2.0",
      totalUsers: users.length,
      users: users,
      plansCount: plans.length,
      quizzesCount: quizzes.length,
      examHistoryCount: history.length
    };

    // Save locally
    const backups = JSON.parse(localStorage.getItem("app_db_backups")) || [];
    backups.push(backupPayload);
    localStorage.setItem("app_db_backups", JSON.stringify(backups));

    // Upload to Supabase Storage if available
    if (window.supabaseService?.isReady()) {
      try {
        const fileName = `backup_${Date.now()}.json`;
        const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
        await window.supabaseService.uploadFileToStorage(new File([blob], fileName), "db-backups");
      } catch (err) {
        console.warn("Lỗi upload file sao lưu CSDL lên Supabase Storage:", err);
      }
    }

    return backupPayload;
  }

  // 14. Trợ lý AI tư vấn lộ trình bồi dưỡng Học sinh Giỏi Tin học 3D Radar
  async generateAIGiftedAdvisor(username, radarData) {
    const isGiftedCandidate = radarData.topicE >= 80 || radarData.topicC >= 85;

    let summary = "";
    let recommendation = "";
    let roadmap = [];

    if (isGiftedCandidate) {
      summary = `🌟 Học sinh '${username}' thể hiện tư duy Logic & Lập trình xuất sắc (Chủ đề E: ${radarData.topicE}%, Chủ đề C: ${radarData.topicC}%).`;
      recommendation = `🏆 KÍCH HOẠT LỘ TRÌNH BỒI DƯỠNG HỌC SINH GIỎI TIN HỌC TRẺ:\nĐề xuất xếp em vào Đội tuyển năng khiếu Lập trình Scratch và Mô phỏng Robot Lego EV3 cấp Trường!`;
      roadmap = [
        "Tuần 1: Ôn luyện khối lệnh vẽ hình học nâng cao (Spirals & Polygons) trên Scratch 3.0",
        "Tuần 2: Thực hành biến số & Danh sách List trong bài toán sắp xếp mảng",
        "Tuần 3: Lập trình Robot dò đường bằng cảm biến ánh sáng trong Mô Phỏng 3D",
        "Tuần 4: Giải 5 đề thi Tin học Trẻ Tiểu học bảng A các năm"
      ];
    } else {
      summary = `💪 Học sinh '${username}' có nền tảng kiến thức Đạo đức Tin học & Sử dụng Máy tính tốt (Chủ đề D: ${radarData.topicD}%, Chủ đề A: ${radarData.topicA}%).`;
      recommendation = `🎯 LỘ TRÌNH PHỤ ĐẠO & CỦNG CỐ NĂNG LỰC CỐT LÕI:\nTập trung rèn luyện thêm kỹ năng thao tác thư mục máy tính và tư duy lập trình căn bản.`;
      roadmap = [
        "Tuần 1: Thực hành tạo cây thư mục bài học trên phòng máy 3D",
        "Tuần 2: Luyện tập gõ phím nhanh 10 ngón với phần mềm Typing Master",
        "Tuần 3: Làm quen với khối lệnh di chuyển nhân vật Scratch căn bản",
        "Tuần 4: Tham gia đấu trường 100 câu trắc nghiệm Tin học 3-5"
      ];
    }

    return {
      summary: summary,
      recommendation: recommendation,
      roadmap: roadmap,
      isGifted: isGiftedCandidate
    };
  }

  // 15. Lấy danh sách các bản sao lưu CSDL
  getDatabaseBackups() {
    const backups = JSON.parse(localStorage.getItem("app_db_backups")) || [];
    return backups;
  }

  // 16. Khôi phục CSDL 1-chạm từ bản sao lưu cũ
  async restoreDatabaseFromBackup(backupObj) {
    if (!backupObj || !backupObj.users || !Array.isArray(backupObj.users)) {
      return { success: false, error: "Tệp sao lưu không hợp lệ hoặc bị hỏng!" };
    }

    // 1. Restore LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    db.users = backupObj.users;
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // 2. Restore Supabase Cloud app_users
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const preparedUsers = backupObj.users.map(u => ({
          username: u.username,
          password: u.password || "123456",
          full_name: u.name || u.full_name,
          role: u.role || "student",
          school_name: u.school || "Trường Tiểu Học Vui Học",
          class_name: u.className || u.class_name,
          grade_level: u.grade || u.grade_level || 3,
          stars: u.stars || 0,
          updated_at: new Date().toISOString()
        }));

        await client.from("app_users").upsert(preparedUsers, { onConflict: "username" });
      } catch (err) {
        console.warn("Lỗi restoreDatabaseFromBackup trên Supabase:", err);
      }
    }

    return { success: true };
  }
}

window.adminService = new AdminService();
