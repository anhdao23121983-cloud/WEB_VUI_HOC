/**
 * AUTH SERVICE (DỊCH VỤ XÁC THỰC & PHÂN QUYỀN)
 * Quản lý phiên đăng nhập của Giáo viên, Học sinh và Admin
 */

class AuthService {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem("app_current_user")) || null;
    this.listeners = [];
  }

  // Đăng ký nhận thông báo thay đổi trạng thái đăng nhập
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  // Lấy thông tin người dùng hiện tại
  getUser() {
    return this.currentUser;
  }

  // Kiểm tra quyền Giáo viên
  isTeacher() {
    return this.currentUser && this.currentUser.role === CONFIG.ROLES.TEACHER;
  }

  // Kiểm tra quyền Học sinh
  isStudent() {
    return this.currentUser && this.currentUser.role === CONFIG.ROLES.STUDENT;
  }

  // 1. Đăng nhập Giáo viên
  loginTeacher(email, password) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    
    // Kiểm tra tài khoản mẫu hoặc tài khoản giáo viên mới
    let teacher = db.users.find(u => u.email === email && u.role === CONFIG.ROLES.TEACHER);
    
    if (!teacher && (email === "anhdao" || email === "admin" || email === "anhdao.teacher@vuihoc.edu.vn")) {
      teacher = db.users[0];
    } else if (!teacher) {
      // Cho phép đăng nhập linh hoạt hoặc tạo tài khoản mới nếu chưa có
      teacher = {
        id: "u_teacher_" + Date.now(),
        email: email,
        name: email.split("@")[0] || "Thầy Giáo Mới",
        role: CONFIG.ROLES.TEACHER,
        school: "Trường Tiểu Học",
        avatar: "👨‍🏫"
      };
      db.users.push(teacher);
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    this.currentUser = teacher;
    localStorage.setItem("app_current_user", JSON.stringify(teacher));
    this.notifyListeners();
    return { success: true, user: teacher };
  }

  // 2. Đăng nhập nhanh cho Học sinh bằng Mã hoặc Tên
  loginStudentByCode(studentCode) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const cleanCode = studentCode.trim().toUpperCase();

    let student = db.users.find(u => u.studentCode === cleanCode);
    
    if (!student) {
      // Nếu mã mới -> Tạo tài khoản học sinh nhanh
      student = {
        id: "u_student_" + Date.now(),
        studentCode: cleanCode,
        name: "Học Sinh " + cleanCode,
        role: CONFIG.ROLES.STUDENT,
        grade: 3,
        className: "3A",
        stars: 50,
        avatar: "🎒"
      };
      db.users.push(student);
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    this.currentUser = student;
    localStorage.setItem("app_current_user", JSON.stringify(student));
    this.notifyListeners();
    return { success: true, user: student };
  }

  // Đăng xuất
  logout() {
    this.currentUser = null;
    localStorage.removeItem("app_current_user");
    this.notifyListeners();
  }
}

window.authService = new AuthService();
