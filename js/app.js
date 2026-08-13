/**
 * CLASSROOM APP - MAIN CONTROLLER & APPLICATION ROUTER
 * Quản lý trạng thái, Điều hướng trang, và Xử lý sự kiện toàn cục
 */

class Application {
  constructor() {
    this.currentRoute = "landing";
  }

  init() {
    console.log("Khởi động Hệ thống Classroom App - Tin học Tiểu học...");
    
    // Lắng nghe sự kiện hash URL
    window.addEventListener("hashchange", () => this.handleHashChange());
    
    // Lắng nghe trạng thái đăng nhập
    window.authService.onAuthStateChanged(user => this.updateNavUser(user));

    // Điều hướng tới route mặc định
    this.handleHashChange();

    // Cập nhật trạng thái Supabase
    this.checkSupabaseStatus();
  }

  // Xử lý thay đổi URL Hash
  handleHashChange() {
    const hash = window.location.hash.replace("#", "") || "landing";
    this.navigate(hash);
  }

  // Điều hướng màn hình
  navigate(route) {
    this.currentRoute = route;
    const user = window.authService.getUser();

    // Ẩn tất cả view
    const views = ["landing-view", "auth-view", "portal-view"];
    views.forEach(v => {
      const el = document.getElementById(v);
      if (el) el.classList.add("hidden");
    });

    const portalContent = document.getElementById("main-content-area");

    if (route === "landing") {
      document.getElementById("landing-view")?.classList.remove("hidden");
    } else if (route === "auth") {
      document.getElementById("auth-view")?.classList.remove("hidden");
    } else if (route === "teacher") {
      // Nếu chưa đăng nhập giáo viên -> Tự động đăng nhập mẫu để Thầy trải nghiệm liền
      if (!window.authService.isTeacher()) {
        window.authService.loginTeacher("anhdao.teacher@vuihoc.edu.vn", "123456");
      }
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.teacherPortal.render("main-content-area");
    } else if (route === "student") {
      // Nếu chưa đăng nhập học sinh -> Tự động đăng nhập học sinh mẫu
      if (!window.authService.isStudent()) {
        window.authService.loginStudentByCode("HS3A01");
      }
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.studentPortal.render("main-content-area");
    } else if (route === "gamehub") {
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.gameHub.render("main-content-area");
    } else {
      document.getElementById("landing-view")?.classList.remove("hidden");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Cập nhật thông tin người dùng trên Navbar
  updateNavUser(user) {
    const navUserBox = document.getElementById("nav-user-box");
    const navGuestBox = document.getElementById("nav-guest-box");
    const navUserName = document.getElementById("nav-user-name");
    const navUserRole = document.getElementById("nav-user-role");
    const navUserAvatar = document.getElementById("nav-user-avatar");

    if (user) {
      if (navUserBox) navUserBox.classList.remove("hidden");
      if (navGuestBox) navGuestBox.classList.add("hidden");
      if (navUserName) navUserName.innerText = user.name;
      if (navUserRole) navUserRole.innerText = user.role === "teacher" ? "Giáo viên" : `Học sinh (${user.className || "3A"})`;
      if (navUserAvatar) navUserAvatar.innerText = user.avatar || "👤";
    } else {
      if (navUserBox) navUserBox.classList.add("hidden");
      if (navGuestBox) navGuestBox.classList.remove("hidden");
    }
  }

  // Hiển thị Toast thông báo đẹp mắt
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "⚠️";
    if (type === "warning") icon = "🔔";

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Kiểm tra & cập nhật trạng thái kết nối Supabase
  checkSupabaseStatus() {
    const status = window.supabaseService.getStatus();
    const badge = document.getElementById("db-status-badge");
    if (badge) {
      if (status.connected) {
        badge.className = "badge badge-emerald font-bold";
        badge.innerHTML = `● Supabase Cloud Live`;
      } else {
        badge.className = "badge badge-cyan font-bold";
        badge.innerHTML = `● Local Database (Demo Mode)`;
      }
    }
  }

  // Lưu cấu hình hệ thống từ Modal
  saveSettings() {
    const sbUrl = document.getElementById("settings-sb-url")?.value || "";
    const sbKey = document.getElementById("settings-sb-key")?.value || "";
    const aiKey = document.getElementById("settings-ai-key")?.value || "";

    window.supabaseService.updateConfig(sbUrl, sbKey);
    window.aiPlannerService.setApiKey(aiKey);

    document.getElementById("settings-modal")?.classList.remove("active");
    this.checkSupabaseStatus();
    this.showToast("⚙️ Đã lưu cấu hình kết nối thành công!", "success");
  }
}

window.app = new Application();
document.addEventListener("DOMContentLoaded", () => window.app.init());
