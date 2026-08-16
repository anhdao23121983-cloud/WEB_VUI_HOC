/**
 * AUTH SERVICE (DỊCH VỤ XÁC THỰC & PHÂN QUYỀN ĐỒNG BỘ SUPABASE)
 * Quản lý Đăng Ký, Đăng Nhập, Đăng Xuất và lưu trữ trực tiếp trên Supabase Database
 */

class AuthService {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem("app_current_user")) || null;
    this.listeners = [];
  }

  // Đăng ký nhận thông báo thay đổi phiên đăng nhập
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  getUser() {
    return this.currentUser;
  }

  isTeacher() {
    return this.currentUser && this.currentUser.role === CONFIG.ROLES.TEACHER;
  }

  isStudent() {
    return this.currentUser && this.currentUser.role === CONFIG.ROLES.STUDENT;
  }

  // =========================================================================
  // 1. ĐĂNG KÝ TÀI KHOẢN MỚI (ĐỒNG BỘ SUPABASE DATABASE)
  // =========================================================================
  async register({ username, password, fullName, role = "student", schoolName = "Trường Tiểu Học", className = "3A", gradeLevel = 3 }) {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanFullName = fullName.trim();

    if (!cleanUsername || !cleanPassword || !cleanFullName) {
      return { success: false, error: "Vui lòng điền đầy đủ Tên đăng nhập, Mật khẩu và Họ tên!" };
    }

    if (cleanPassword.length < 6) {
      return { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự!" };
    }

    const avatar = role === "teacher" ? "👨‍🏫" : (gradeLevel === 4 ? "👧" : (gradeLevel === 5 ? "🧑‍💻" : "👦"));

    const newUser = {
      username: cleanUsername,
      password: cleanPassword,
      full_name: cleanFullName,
      role: role,
      school_name: schoolName || "Trường Tiểu Học",
      class_name: className || "3A",
      grade_level: parseInt(gradeLevel) || 3,
      stars: role === "teacher" ? 999 : 50,
      avatar: avatar
    };

    // 1. Lưu lên Supabase nếu có kết nối
    if (window.supabaseService?.isLive && window.supabaseService?.client) {
      try {
        const client = window.supabaseService.client;
        
        // Kiểm tra xem username đã tồn tại chưa
        const { data: existingUser } = await client
          .from("app_users")
          .select("username")
          .eq("username", cleanUsername)
          .maybeSingle();

        if (existingUser) {
          return { success: false, error: "Tên đăng nhập này đã được sử dụng, vui lòng chọn tên khác!" };
        }

        const { data, error } = await client
          .from("app_users")
          .insert([newUser])
          .select()
          .single();

        if (error) {
          console.warn("Lỗi lưu user lên Supabase, chuyển lưu dự phòng:", error.message);
        } else if (data) {
          newUser.id = data.id;
        }
      } catch (err) {
        console.warn("Lỗi đồng bộ đăng ký Supabase:", err);
      }
    }

    // 2. Lưu dự phòng vào LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.users) db.users = [];
    
    // Kiểm tra local
    const existsLocally = db.users.find(u => (u.username || "").toLowerCase() === cleanUsername);
    if (existsLocally && !newUser.id) {
      return { success: false, error: "Tên đăng nhập đã tồn tại trong hệ thống!" };
    }

    const mappedUser = {
      id: newUser.id || ("u_" + Date.now()),
      username: cleanUsername,
      name: cleanFullName,
      role: role,
      school: schoolName,
      className: className,
      grade: parseInt(gradeLevel) || 3,
      stars: newUser.stars,
      avatar: avatar
    };

    db.users.push(mappedUser);
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // Đăng nhập luôn cho người dùng vừa tạo
    this.currentUser = mappedUser;
    localStorage.setItem("app_current_user", JSON.stringify(mappedUser));
    this.notifyListeners();

    return { success: true, user: mappedUser };
  }

  // =========================================================================
  // 2. ĐĂNG NHẬP BẰNG USERNAME & MẬT KHẨU (ĐỒNG BỘ SUPABASE DATABASE)
  // =========================================================================
  async login(username, password) {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, error: "Vui lòng nhập Tên đăng nhập và Mật khẩu!" };
    }

    // 1. Kiểm tra trên Supabase Cloud Database trước
    if (window.supabaseService?.isLive && window.supabaseService?.client) {
      try {
        const client = window.supabaseService.client;
        const { data: user, error } = await client
          .from("app_users")
          .select("*")
          .eq("username", cleanUsername)
          .eq("password", cleanPassword)
          .maybeSingle();

        if (user && !error) {
          const loggedUser = {
            id: user.id,
            username: user.username,
            name: user.full_name,
            role: user.role,
            school: user.school_name,
            className: user.class_name,
            grade: user.grade_level,
            stars: user.stars || 0,
            avatar: user.avatar || "🎒"
          };

          this.currentUser = loggedUser;
          localStorage.setItem("app_current_user", JSON.stringify(loggedUser));
          this.notifyListeners();
          return { success: true, user: loggedUser };
        }
      } catch (err) {
        console.warn("Lỗi kiểm tra đăng nhập trên Supabase, chuyển sang kiểm tra Local:", err);
      }
    }

    // 2. Kiểm tra trên LocalStorage Database
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    
    // Tìm theo username hoặc email hoặc mã học sinh
    let found = (db.users || []).find(u => 
      ((u.username && u.username.toLowerCase() === cleanUsername) || 
       (u.email && u.email.toLowerCase() === cleanUsername) ||
       (u.studentCode && u.studentCode.toLowerCase() === cleanUsername))
    );

    // Xử lý tài khoản mặc định
    if (!found) {
      if (cleanUsername === "anhdao" || cleanUsername === "teacher") {
        found = {
          id: "u_teacher_01",
          username: "anhdao",
          name: "Thầy Giáo Anh Đào",
          role: "teacher",
          school: "Trường Tiểu Học Vui Học",
          avatar: "👨‍🏫"
        };
      } else if (cleanUsername.startsWith("hs") || cleanUsername === "hocsinh") {
        found = {
          id: "u_student_01",
          username: cleanUsername,
          name: "Học Sinh " + cleanUsername.toUpperCase(),
          role: "student",
          grade: 3,
          className: "3A",
          stars: 180,
          avatar: "👦"
        };
      }
    }

    if (found) {
      this.currentUser = found;
      localStorage.setItem("app_current_user", JSON.stringify(found));
      this.notifyListeners();
      return { success: true, user: found };
    }

    return { success: false, error: "Tên đăng nhập hoặc mật khẩu không chính xác!" };
  }

  // =========================================================================
  // 3. ĐĂNG XUẤT TÀI KHOẢN
  // =========================================================================
  logout() {
    this.currentUser = null;
    localStorage.removeItem("app_current_user");
    this.notifyListeners();
    return { success: true };
  }

  // =========================================================================
  // 4. CẬP NHẬT HỒ SƠ & ĐỔI AVATAR / MẬT KHẨU (ĐỒNG BỘ SUPABASE)
  // =========================================================================
  async updateUserProfile({ name, avatar, password }) {
    if (!this.currentUser) return { success: false, error: "Chưa đăng nhập!" };

    const updates = {};
    if (name && name.trim()) {
      this.currentUser.name = name.trim();
      updates.full_name = name.trim();
    }
    if (avatar) {
      this.currentUser.avatar = avatar;
      updates.avatar = avatar;
    }
    if (password && password.trim()) {
      updates.password = password.trim();
    }

    // 1. Cập nhật Supabase
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        await client
          .from("app_users")
          .update(updates)
          .eq("username", this.currentUser.username);
      } catch (err) {
        console.warn("Lỗi cập nhật hồ sơ trên Supabase:", err);
      }
    }

    // 2. Cập nhật LocalStorage
    localStorage.setItem("app_current_user", JSON.stringify(this.currentUser));
    this.notifyListeners();

    return { success: true, user: this.currentUser };
  }

  // =========================================================================
  // 5. TẶNG SAO KHEN THƯỞNG CHO HỌC SINH (ĐỒNG BỘ SUPABASE & BẢNG VÀNG)
  // =========================================================================
  async awardStarsToStudent(studentName, starsToAdd = 10, reason = "Trả lời đúng câu hỏi trên Slide") {
    if (window.supabaseService?.awardStarsDirectly) {
      return await window.supabaseService.awardStarsDirectly(studentName, starsToAdd, reason);
    }
    return { success: false, error: "Dịch vụ tặng sao chưa sẵn sàng!" };
  }
}

window.authService = new AuthService();

