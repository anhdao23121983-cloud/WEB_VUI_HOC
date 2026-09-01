/**
 * CLASSROOM APP - MAIN CONTROLLER & APPLICATION ROUTER
 * Quản lý Đăng Ký, Đăng Nhập, Đăng Xuất, Điều hướng và Đồng bộ Supabase
 */

class Application {
  constructor() {
    this.currentRoute = "landing";
    this.selectedRegisterRole = "teacher";
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
    } else if (route === "admin" || route === "members" || route === "users") {
      if (!user) {
        this.showToast("Vui lòng đăng nhập tài khoản Quản trị viên Admin!", "warning");
        window.location.hash = "auth";
        return;
      }
      if (user.role !== "admin" && user.role !== "teacher") {
        this.showToast("🚫 Quyền truy cập bị từ chối! Mục Quản Lý GV & HS chỉ dành cho Quản trị viên và Giáo viên.", "error");
        window.location.hash = "student";
        return;
      }
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.adminPortal.render("main-content-area");
    } else if (route === "teacher") {
      if (!user) {
        this.showToast("Vui lòng đăng nhập tài khoản Giáo viên hoặc Quản trị viên!", "warning");
        window.location.hash = "auth";
        return;
      }
      if (user.role !== "teacher" && user.role !== "admin") {
        this.showToast("🚫 Quyền truy cập bị từ chối! Mục Giáo Viên (CV 2345) chỉ dành cho Giáo viên và Quản trị viên.", "error");
        window.location.hash = "student";
        return;
      }
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.teacherPortal.render("main-content-area");
    } else if (route === "student") {
      if (!user) {
        this.showToast("Vui lòng đăng nhập tài khoản Học sinh!", "warning");
        window.location.hash = "auth";
        return;
      }
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.studentPortal.render("main-content-area");
    } else if (route === "gamehub") {
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.gameHub.render("main-content-area");
    } else if (route === "lectures") {
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.lecturePortal.render("main-content-area");
    } else if (route === "exams") {
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.examPortal.render("main-content-area");
    } else if (route === "lab3d" || route === "experiment3d") {
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.simulation3D.render("main-content-area");
    } else if (route === "arena" || route === "dautruong") {
      document.getElementById("portal-view")?.classList.remove("hidden");
      window.arenaPortal.render("main-content-area");
    } else {
      document.getElementById("landing-view")?.classList.remove("hidden");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // =========================================================================
  // XỬ LÝ AUTH UI (CHUYỂN TAB, ĐĂNG NHẬP, ĐĂNG KÝ, ĐĂNG XUẤT)
  // =========================================================================
  
  // Chuyển Tab Đăng Nhập / Đăng Ký
  switchAuthTab(tab) {
    const loginForm = document.getElementById("auth-form-login");
    const registerForm = document.getElementById("auth-form-register");
    const btnLogin = document.getElementById("auth-tab-btn-login");
    const btnRegister = document.getElementById("auth-tab-btn-register");

    if (tab === "login") {
      loginForm?.classList.remove("hidden");
      registerForm?.classList.add("hidden");
      btnLogin.className = "flex-1 py-2.5 text-xs font-black rounded-xl bg-white shadow text-cyan-800 transition-all";
      btnRegister.className = "flex-1 py-2.5 text-xs font-black rounded-xl text-slate-500 hover:text-slate-800 transition-all";
    } else {
      loginForm?.classList.add("hidden");
      registerForm?.classList.remove("hidden");
      btnRegister.className = "flex-1 py-2.5 text-xs font-black rounded-xl bg-white shadow text-emerald-800 transition-all";
      btnLogin.className = "flex-1 py-2.5 text-xs font-black rounded-xl text-slate-500 hover:text-slate-800 transition-all";
    }
  }

  // Thay đổi vai trò khi đăng ký (Giáo viên / Học sinh)
  handleRoleChange(role) {
    this.selectedRegisterRole = role;
    const labelTeacher = document.getElementById("role-label-teacher");
    const labelStudent = document.getElementById("role-label-student");
    const gradeGroup = document.getElementById("reg-grade-group");

    if (role === "teacher") {
      labelTeacher.className = "p-3 bg-cyan-50 rounded-xl border-2 border-cyan-500 cursor-pointer flex items-center gap-2 font-bold text-xs text-cyan-900";
      labelStudent.className = "p-3 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer flex items-center gap-2 font-bold text-xs text-slate-700";
      if (gradeGroup) gradeGroup.classList.add("hidden");
    } else {
      labelStudent.className = "p-3 bg-emerald-50 rounded-xl border-2 border-emerald-500 cursor-pointer flex items-center gap-2 font-bold text-xs text-emerald-900";
      labelTeacher.className = "p-3 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer flex items-center gap-2 font-bold text-xs text-slate-700";
      if (gradeGroup) gradeGroup.classList.remove("hidden");
    }
  }

  // Xử lý bấm Đăng Nhập
  async handleLogin() {
    const usernameInput = document.getElementById("login-username");
    const passInput = document.getElementById("login-password");
    const btnSubmit = document.getElementById("btn-submit-login");

    const username = usernameInput ? usernameInput.value : "";
    const password = passInput ? passInput.value : "";

    if (!username || !password) {
      this.showToast("Vui lòng nhập Tên đăng nhập và Mật khẩu!", "warning");
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span>⏳ Đang kiểm tra tài khoản trên Supabase...</span>`;
    }

    try {
      const result = await window.authService.login(username, password);
      if (result.success) {
        this.showToast(`🎉 Chào mừng ${result.user.name} đã đăng nhập thành công!`, "success");
        if (result.user.role === "teacher") {
          window.location.hash = "teacher";
        } else {
          window.location.hash = "student";
        }
      } else {
        this.showToast(result.error || "Tên đăng nhập hoặc mật khẩu không đúng!", "error");
      }
    } catch (err) {
      console.error(err);
      this.showToast("Có lỗi xảy ra trong quá trình xác thực!", "error");
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>🚀 ĐĂNG NHẬP VÀO HỆ THỐNG</span>`;
      }
    }
  }

  // Đăng nhập nhanh 1 chạm bằng tài khoản mẫu
  quickLogin(username, password) {
    const usernameInput = document.getElementById("login-username");
    const passInput = document.getElementById("login-password");
    if (usernameInput) usernameInput.value = username;
    if (passInput) passInput.value = password;
    this.handleLogin();
  }

  // Xử lý bấm Đăng Ký Tài Khoản Mới
  async handleRegister() {
    const username = document.getElementById("reg-username")?.value;
    const fullName = document.getElementById("reg-fullname")?.value;
    const schoolName = document.getElementById("reg-school")?.value;
    const gradeLevel = document.getElementById("reg-grade")?.value;
    const password = document.getElementById("reg-password")?.value;
    const confirmPassword = document.getElementById("reg-confirm-password")?.value;
    const btnSubmit = document.getElementById("btn-submit-register");

    if (!username || !fullName || !password) {
      this.showToast("Vui lòng điền đầy đủ các thông tin có dấu *!", "warning");
      return;
    }

    if (password !== confirmPassword) {
      this.showToast("Mật khẩu và xác nhận mật khẩu không khớp!", "error");
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span>⏳ Đang tạo tài khoản và đồng bộ Supabase...</span>`;
    }

    try {
      const result = await window.authService.register({
        username,
        password,
        fullName,
        role: this.selectedRegisterRole,
        schoolName,
        className: this.selectedRegisterRole === "teacher" ? "Tổ Tin Học" : `${gradeLevel}A`,
        gradeLevel: parseInt(gradeLevel) || 3
      });

      if (result.success) {
        this.showToast("✨ Đăng ký tài khoản thành công! Dữ liệu đã lưu trên Supabase.", "success");
        if (result.user.role === "teacher") {
          window.location.hash = "teacher";
        } else {
          window.location.hash = "student";
        }
      } else {
        this.showToast(result.error || "Không thể tạo tài khoản, vui lòng thử lại!", "error");
      }
    } catch (err) {
      console.error(err);
      this.showToast("Lỗi khi kết nối đăng ký tài khoản!", "error");
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>✨ TẠO TÀI KHOẢN & ĐỒNG BỘ SUPABASE</span>`;
      }
    }
  }

  // Đăng xuất
  handleLogout() {
    window.authService.logout();
    this.showToast("🚪 Đã đăng xuất tài khoản thành công!", "info");
    window.location.hash = "auth";
  }

  // Cập nhật thông tin người dùng trên Navbar
  updateNavUser(user) {
    const navUserBox = document.getElementById("nav-user-box");
    const navGuestBox = document.getElementById("nav-guest-box");
    const navUserName = document.getElementById("nav-user-name");
    const navUserRole = document.getElementById("nav-user-role");
    const navUserAvatar = document.getElementById("nav-user-avatar");
    const navBtnTeacher = document.getElementById("nav-btn-teacher");
    const heroBtnTeacher = document.getElementById("hero-btn-teacher");

    if (user) {
      if (navUserBox) navUserBox.classList.remove("hidden");
      if (navGuestBox) navGuestBox.classList.add("hidden");
      if (navUserName) navUserName.innerText = user.name;
      if (navUserRole) navUserRole.innerText = user.role === "teacher" ? "Giáo viên" : (user.role === "admin" ? "Quản trị viên" : `Học sinh (${user.className || "3A"})`);
      
      // Ẩn nút Giáo Viên (CV 2345) đối với tài khoản Học sinh
      if (user.role === "student") {
        if (navBtnTeacher) navBtnTeacher.classList.add("hidden");
        if (heroBtnTeacher) heroBtnTeacher.classList.add("hidden");
      } else {
        if (navBtnTeacher) navBtnTeacher.classList.remove("hidden");
        if (heroBtnTeacher) heroBtnTeacher.classList.remove("hidden");
      }

      if (navUserAvatar) {
        if (user.avatar && (user.avatar.startsWith("data:image/") || user.avatar.startsWith("http"))) {
          navUserAvatar.innerHTML = `<img src="${user.avatar}" alt="Avatar" class="w-6 h-6 object-cover rounded-full border border-cyan-400">`;
        } else {
          navUserAvatar.innerText = user.avatar || (user.role === "admin" ? "👑" : "👩‍🏫");
        }
      }
    } else {
      if (navUserBox) navUserBox.classList.add("hidden");
      if (navGuestBox) navGuestBox.classList.remove("hidden");
      if (navBtnTeacher) navBtnTeacher.classList.remove("hidden");
      if (heroBtnTeacher) heroBtnTeacher.classList.remove("hidden");
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

  // =========================================================================
  // MODALS & PROFILE MANAGEMENT (LIGHTBOX, ABOUT US, PROFILE & AVATAR)
  // =========================================================================

  // 1. Mở Lightbox xem Logo phóng to
  openLogoLightbox() {
    const modal = document.getElementById("logo-lightbox-modal");
    if (modal) modal.classList.add("active");
  }

  // 2. Mở Modal Giới thiệu Tác giả & Sứ mệnh
  openAboutModal() {
    const modal = document.getElementById("about-modal");
    if (modal) modal.classList.add("active");
  }

  // 3. Mở Modal Hồ sơ cá nhân
  openProfileModal() {
    const user = window.authService.getUser();
    if (!user) {
      this.showToast("Vui lòng đăng nhập để xem hồ sơ!", "warning");
      window.location.hash = "auth";
      return;
    }

    this.tempSelectedAvatar = user.avatar || "👩‍🏫";

    // Cập nhật thông tin lên UI Modal
    const curAvatar = document.getElementById("profile-current-avatar");
    const dispName = document.getElementById("profile-display-name");
    const dispRole = document.getElementById("profile-display-role");
    const dispStars = document.getElementById("profile-display-stars");
    const dispBadge = document.getElementById("profile-display-badge");
    const inputName = document.getElementById("profile-input-name");
    const inputPass = document.getElementById("profile-input-password");

    if (curAvatar) {
      if (this.tempSelectedAvatar.startsWith("data:image/") || this.tempSelectedAvatar.startsWith("http")) {
        curAvatar.innerHTML = `<img src="${this.tempSelectedAvatar}" alt="Avatar" class="w-full h-full object-cover rounded-2xl">`;
      } else {
        curAvatar.innerText = this.tempSelectedAvatar;
      }
    }

    if (dispName) dispName.innerText = user.name;
    if (dispRole) dispRole.innerText = user.role === "teacher" ? `Giáo Viên • ${user.school || "Tổ Tin Học"}` : `Học Sinh • Lớp ${user.className || "3A"}`;
    if (dispStars) dispStars.innerText = `⭐ ${user.stars || 0} Sao Vàng`;
    if (dispBadge) dispBadge.innerText = user.role === "teacher" ? "🏆 Bậc Thầy Sư Phạm" : "🏆 Chiến Binh Tin Học";
    if (inputName) inputName.value = user.name;
    if (inputPass) inputPass.value = "";

    const modal = document.getElementById("profile-modal");
    if (modal) modal.classList.add("active");
  }

  // Chọn avatar tạm thời từ danh sách Emoji
  selectAvatar(avatarEmoji) {
    this.tempSelectedAvatar = avatarEmoji;
    const curAvatar = document.getElementById("profile-current-avatar");
    if (curAvatar) curAvatar.innerText = avatarEmoji;
  }

  // Tải ảnh chân dung tùy chọn từ máy tính
  handleCustomAvatarUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      this.showToast("Vui lòng chọn file hình ảnh hợp lệ (.png, .jpg, .jpeg, .webp)!", "warning");
      return;
    }

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      this.showToast("Dung lượng ảnh không được vượt quá 5MB!", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.tempSelectedAvatar = dataUrl;
      const curAvatar = document.getElementById("profile-current-avatar");
      if (curAvatar) {
        curAvatar.innerHTML = `<img src="${dataUrl}" alt="Avatar Preview" class="w-full h-full object-cover rounded-2xl shadow-sm">`;
      }
      this.showToast("📷 Đã nạp ảnh chân dung! Hãy bấm 'Lưu Thay Đổi' để hoàn tất.", "info");
    };
    reader.readAsDataURL(file);
  }

  // Lưu thay đổi hồ sơ cá nhân
  async saveProfileChanges() {
    const inputName = document.getElementById("profile-input-name")?.value || "";
    const inputPass = document.getElementById("profile-input-password")?.value || "";

    if (!inputName.trim()) {
      this.showToast("Vui lòng không để trống Họ và Tên!", "warning");
      return;
    }

    const res = await window.authService.updateUserProfile({
      name: inputName,
      avatar: this.tempSelectedAvatar,
      password: inputPass
    });

    if (res.success) {
      document.getElementById("profile-modal")?.classList.remove("active");
      this.showToast("✨ Đã cập nhật hồ sơ và ảnh đại diện thành công!", "success");
    } else {
      this.showToast(res.error || "Không thể cập nhật hồ sơ!", "error");
    }
  }

  // =========================================================================
  // GỢI Ý 1: ĐĂNG NHẬP TỰ ĐỘNG BẰNG QUÉT MÃ QR CODE CAMERA WEBCAM
  // =========================================================================
  async openQRScannerModal() {
    const modal = document.getElementById("qr-login-modal");
    const video = document.getElementById("qr-webcam-video");
    const statusEl = document.getElementById("qr-scan-status");

    if (modal) modal.classList.add("active");
    if (statusEl) statusEl.innerText = "🎙️ Đang kết nối Camera Webcam... Hãy giơ mã QR Code lên!";

    try {
      this.qrMediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (video) {
        video.srcObject = this.qrMediaStream;
        video.play();
      }

      this.isScanningQR = true;
      this.scanQRCodeLoop();
    } catch (err) {
      console.warn("Lỗi mở Webcam:", err);
      if (statusEl) statusEl.innerText = "⚠️ Không thể truy cập Camera Webcam! Vui lòng cấp quyền micro/cam.";
    }
  }

  closeQRScannerModal() {
    this.isScanningQR = false;
    if (this.qrMediaStream) {
      this.qrMediaStream.getTracks().forEach(track => track.stop());
      this.qrMediaStream = null;
    }
    const modal = document.getElementById("qr-login-modal");
    if (modal) modal.classList.remove("active");
  }

  async scanQRCodeLoop() {
    if (!this.isScanningQR) return;

    const video = document.getElementById("qr-webcam-video");
    const canvas = document.getElementById("qr-canvas");
    const statusEl = document.getElementById("qr-scan-status");

    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      // 1. Dùng Native BarcodeDetector API nếu trình duyệt hỗ trợ
      if ("BarcodeDetector" in window) {
        try {
          const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0) {
            const qrText = barcodes[0].rawValue;
            this.handleScannedQRCode(qrText);
            return;
          }
        } catch (e) {
          // Fallback to canvas
        }
      }

      // 2. Fallback Canvas scan simulated parsing
      if (canvas) {
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }

    if (this.isScanningQR) {
      requestAnimationFrame(() => this.scanQRCodeLoop());
    }
  }

  async handleScannedQRCode(qrData) {
    if (!qrData || !this.isScanningQR) return;

    const cleanUsername = qrData.trim().toLowerCase();
    const statusEl = document.getElementById("qr-scan-status");

    if (statusEl) statusEl.innerText = `🎉 Đã quét thành công mã QR Code: ${cleanUsername}! Đang đăng nhập...`;

    this.closeQRScannerModal();
    this.showToast(`🎉 Đã nhận diện mã QR Code (${cleanUsername})! Đang đăng nhập tự động...`, "success");

    const res = await window.authService.login(cleanUsername, "123456");
    if (res.success) {
      this.showToast(`✨ Đăng nhập tự động thành công! Xin chào ${res.user.name}!`, "success");
      this.closeAuthModal();
    } else {
      this.showToast(res.error || "Không tìm thấy tài khoản tương ứng với mã QR Code!", "error");
    }
  }
}

window.app = new Application();
window.authPortal = window.app;
document.addEventListener("DOMContentLoaded", () => window.app.init());
