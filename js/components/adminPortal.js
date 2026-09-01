/**
 * ADMIN PORTAL COMPONENT
 * Giao diện Quản trị viên & Phân quyền dành cho Giáo viên quản trị và Ban giám hiệu
 */

class AdminPortal {
  constructor() {
    this.currentSubTab = "users";
    this.usersList = [];
    this.roleFilter = "all";
    this.searchQuery = "";
    this.editingUser = null;
  }

  async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = await window.adminService.getSystemAnalytics();
    this.usersList = await window.adminService.getAllUsers();
    const permissions = window.adminService.getPermissions();

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Stats Summary Bar -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-4 flex items-center gap-3">
            <span class="text-3xl p-3 bg-indigo-100 text-indigo-700 rounded-2xl">👥</span>
            <div>
              <p class="text-[11px] text-slate-500 font-bold uppercase">Tổng Thành Viên</p>
              <h4 class="text-xl font-black text-slate-800">${stats.totalUsers} người</h4>
              <p class="text-[10px] text-indigo-600 font-semibold">${stats.teacherCount} GV • ${stats.studentCount} HS</p>
            </div>
          </div>

          <div class="glass-card p-4 flex items-center gap-3">
            <span class="text-3xl p-3 bg-cyan-100 text-cyan-700 rounded-2xl">📋</span>
            <div>
              <p class="text-[11px] text-slate-500 font-bold uppercase">Giáo Án CV 2345</p>
              <h4 class="text-xl font-black text-slate-800">${stats.totalPlans} bài dạy</h4>
              <p class="text-[10px] text-cyan-600 font-semibold">Chuẩn GDPT 2018</p>
            </div>
          </div>

          <div class="glass-card p-4 flex items-center gap-3">
            <span class="text-3xl p-3 bg-emerald-100 text-emerald-700 rounded-2xl">❓</span>
            <div>
              <p class="text-[11px] text-slate-500 font-bold uppercase">Ngân Hàng Câu Hỏi</p>
              <h4 class="text-xl font-black text-slate-800">${stats.totalQuizzes} câu hỏi</h4>
              <p class="text-[10px] text-emerald-600 font-semibold">Tích hợp AI</p>
            </div>
          </div>

          <div class="glass-card p-4 flex items-center gap-3">
            <span class="text-3xl p-3 bg-amber-100 text-amber-700 rounded-2xl">⭐</span>
            <div>
              <p class="text-[11px] text-slate-500 font-bold uppercase">Tổng Sao Vàng</p>
              <h4 class="text-xl font-black text-slate-800">${stats.totalStars} ⭐</h4>
              <p class="text-[10px] text-amber-600 font-semibold">Toàn trường</p>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs Quản Trị -->
        <div class="glass-card p-6 space-y-5">
          <div class="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-3">
            <div class="flex items-center gap-2">
              <button onclick="adminPortal.switchSubTab('users')" id="admin-tab-btn-users" class="btn btn-primary btn-sm font-bold">
                👥 Quản Lý Thành Viên & Phân Quyền
              </button>
              <button onclick="adminPortal.switchSubTab('permissions')" id="admin-tab-btn-permissions" class="btn btn-outline btn-sm font-bold">
                🔒 Ma Trận Phân Quyền
              </button>
            </div>

            <!-- Tìm kiếm & Lọc Vai Trò & Xuất Excel & Nhập Hàng Loạt -->
            <div class="flex items-center gap-2 flex-wrap" id="admin-role-filter-box">
              <div class="relative">
                <input type="text" oninput="adminPortal.handleSearch(this.value)" placeholder="🔍 Tìm tên hoặc username..." class="form-control text-xs font-bold py-1 px-3 w-48 border-slate-300">
              </div>
              <select onchange="adminPortal.filterUsers(this.value)" class="form-control text-xs font-bold py-1 px-3 w-36">
                <option value="all">Tất Cả Vai Trò</option>
                <option value="admin">Quản Trị Viên (Admin)</option>
                <option value="teacher">Giáo Viên</option>
                <option value="student">Học Sinh</option>
              </select>

              <!-- Nút 📊 Xuất Excel Danh Sách -->
              <button onclick="adminPortal.exportUsersExcel()" class="btn btn-outline btn-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300" title="Xuất toàn bộ danh sách tài khoản ra file Excel">
                📊 Xuất Excel
              </button>
              <!-- Nút 🎴 In Thẻ A4 QR Code -->
              <button onclick="adminPortal.printStudentCardsA4()" class="btn btn-outline btn-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-300" title="In thẻ đăng nhập A4 có mã QR Code cho học sinh">
                🎴 In Thẻ A4 QR
              </button>
              <!-- Nút 📥 Nhập Hàng Loạt -->
              <button onclick="adminPortal.openImportModal()" class="btn btn-primary btn-sm font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm" title="Tải file Excel hoặc dán CSV để tạo 40+ học sinh cùng lúc">
                📥 Nhập Hàng Loạt
              </button>
              <!-- Nút 🚀 Chuyển Niên Học Mới -->
              <button onclick="adminPortal.promoteAcademicYear()" class="btn btn-primary btn-sm font-bold bg-amber-600 hover:bg-amber-700 shadow-sm" title="Nâng khối lớp (Khối 3->4, Khối 4->5) và đặt lại mật khẩu 123456 cho toàn trường">
                🚀 Chuyển Niên Học Mới
              </button>
            </div>
          </div>

          <!-- SUB-TAB 1: QUẢN LÝ THÀNH VIÊN -->
          <div id="admin-subtab-users">
            ${this.renderUsersTable()}
          </div>

          <!-- SUB-TAB 2: MA TRẬN PHÂN QUYỀN -->
          <div id="admin-subtab-permissions" class="hidden space-y-4">
            ${this.renderPermissionMatrix(permissions)}
          </div>
        </div>
      </div>
    `;
  }

  switchSubTab(tab) {
    this.currentSubTab = tab;
    const tabUsers = document.getElementById("admin-subtab-users");
    const tabPerms = document.getElementById("admin-subtab-permissions");
    const btnUsers = document.getElementById("admin-tab-btn-users");
    const btnPerms = document.getElementById("admin-tab-btn-permissions");
    const filterBox = document.getElementById("admin-role-filter-box");

    if (tab === "users") {
      tabUsers?.classList.remove("hidden");
      tabPerms?.classList.add("hidden");
      filterBox?.classList.remove("hidden");
      if (btnUsers) btnUsers.className = "btn btn-primary btn-sm font-bold";
      if (btnPerms) btnPerms.className = "btn btn-outline btn-sm font-bold";
    } else {
      tabUsers?.classList.add("hidden");
      tabPerms?.classList.remove("hidden");
      filterBox?.classList.add("hidden");
      if (btnUsers) btnUsers.className = "btn btn-outline btn-sm font-bold";
      if (btnPerms) btnPerms.className = "btn btn-primary btn-sm font-bold";
    }
  }

  handleSearch(query) {
    this.searchQuery = (query || "").trim().toLowerCase();
    const container = document.getElementById("admin-subtab-users");
    if (container) container.innerHTML = this.renderUsersTable();
  }

  filterUsers(role) {
    this.roleFilter = role;
    const container = document.getElementById("admin-subtab-users");
    if (container) container.innerHTML = this.renderUsersTable();
  }

  // Render bảng danh sách thành viên
  renderUsersTable() {
    let list = this.usersList;

    if (this.roleFilter !== "all") {
      list = list.filter(u => u.role === this.roleFilter);
    }

    if (this.searchQuery) {
      list = list.filter(u => 
        (u.name && u.name.toLowerCase().includes(this.searchQuery)) ||
        (u.username && u.username.toLowerCase().includes(this.searchQuery))
      );
    }

    if (list.length === 0) {
      return `
        <div class="text-center py-10 glass-card space-y-2 text-slate-400">
          <span class="text-4xl block">🔍</span>
          <p class="font-bold text-slate-600">Không tìm thấy thành viên nào phù hợp với bộ lọc.</p>
        </div>
      `;
    }

    return `
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-100 text-slate-700 border-b border-slate-200">
              <th class="p-3 font-extrabold">Avatar & Tên</th>
              <th class="p-3 font-extrabold">Username</th>
              <th class="p-3 font-extrabold">Mật Khẩu</th>
              <th class="p-3 font-extrabold">Vai Trò (Phân Quyền)</th>
              <th class="p-3 font-extrabold">Khối & Lớp</th>
              <th class="p-3 font-extrabold">Sao (⭐)</th>
              <th class="p-3 font-extrabold">Trạng Thái</th>
              <th class="p-3 font-extrabold text-right">Thao Tác Admin</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(u => `
              <tr class="border-b border-slate-100 hover:bg-slate-50 transition-all">
                <td class="p-3 flex items-center gap-2.5">
                  <span class="text-2xl">${u.avatar || "🎒"}</span>
                  <div>
                    <p class="font-black text-slate-900 text-xs">${u.name}</p>
                    <p class="text-[10px] text-slate-400">ID: ${u.id ? u.id.substring(0, 8) : 'local'}</p>
                  </div>
                </td>
                <td class="p-3 font-mono font-bold text-cyan-800">${u.username}</td>
                <td class="p-3 font-mono text-slate-500">
                  <span>${u.password ? '••••••' : '123456'}</span>
                </td>
                <td class="p-3">
                  <select onchange="adminPortal.changeUserRole('${u.username}', this.value)" class="form-control text-xs font-bold py-1 px-2 w-32 ${u.role === 'admin' ? 'text-purple-700 border-purple-300 bg-purple-50' : u.role === 'teacher' ? 'text-cyan-700 border-cyan-300 bg-cyan-50' : 'text-slate-700'}">
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>👑 Admin</option>
                    <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>👨‍🏫 Giáo Viên</option>
                    <option value="student" ${u.role === 'student' ? 'selected' : ''}>🎒 Học Sinh</option>
                  </select>
                </td>
                <td class="p-3 font-semibold text-slate-600">Khối ${u.grade || 3} ${u.className ? `• Lớp ${u.className}` : ''}</td>
                <td class="p-3 font-black text-amber-500">${u.stars || 0} ⭐</td>
                <td class="p-3">
                  <span class="badge ${u.isActive !== false ? 'badge-emerald' : 'badge-slate'} font-bold text-[10px]">
                    ${u.isActive !== false ? '● Hoạt Động' : '🔒 Đã Khóa'}
                  </span>
                </td>
                <td class="p-3 text-right space-x-1 whitespace-nowrap">
                  <!-- Nút ✏️ Sửa Thông Tin -->
                  <button onclick="adminPortal.openEditUserModal('${u.username}')" class="btn btn-primary btn-sm text-[11px] py-1 px-2.5 bg-purple-600 hover:bg-purple-700 font-bold shadow-sm" title="Chỉnh sửa Họ tên, Mật khẩu và Lớp học">
                    ✏️ Sửa
                  </button>
                  <!-- Nút 📊 Biểu Đồ Radar Năng Lực 3D -->
                  <button onclick="adminPortal.openSkillRadarModal('${u.username}', '${(u.name || u.username).replace(/'/g, "\\'")}')" class="btn btn-outline btn-sm text-[11px] py-1 px-2 text-purple-700 bg-purple-50 border-purple-200 font-bold" title="Xem biểu đồ Radar 5 Chủ đề Tin học GDPT 2018">
                    📊 Radar
                  </button>
                  <!-- Nút 📜 Nhật Ký Hoạt Động -->
                  <button onclick="adminPortal.openAuditLogModal('${u.username}', '${(u.name || u.username).replace(/'/g, "\\'")}')" class="btn btn-outline btn-sm text-[11px] py-1 px-2 text-indigo-700 bg-indigo-50 border-indigo-200 font-bold" title="Xem nhật ký lịch sử làm bài thi & đăng nhập">
                    📜 Nhật Ký
                  </button>
                  <!-- Nút 🔑 Đặt Lại MK -->
                  <button onclick="adminPortal.resetPassword('${u.username}')" class="btn btn-outline btn-sm text-[11px] py-1 px-1.5" title="Đặt lại mật khẩu mặc định 123456">
                    🔑 MK
                  </button>
                  <!-- Nút 🔒 Khóa / Mở -->
                  <button onclick="adminPortal.toggleStatus('${u.username}')" class="btn btn-outline btn-sm text-[11px] py-1 px-1.5 ${u.isActive !== false ? 'text-amber-600 border-amber-200' : 'text-emerald-600 border-emerald-200'}" title="${u.isActive !== false ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản'}">
                    ${u.isActive !== false ? '🔒' : '🔓'}
                  </button>
                  <!-- Nút 🗑️ Xóa Tài Khoản -->
                  ${u.username !== 'admin' ? `
                    <button onclick="adminPortal.deleteUser('${u.username}', '${(u.name || u.username).replace(/'/g, "\\'")}')" class="btn btn-outline btn-sm text-[11px] py-1 px-2 text-rose-600 hover:bg-rose-50 border-rose-200 font-bold" title="Xóa tài khoản này khỏi hệ thống & Supabase">
                      🗑️ Xóa
                    </button>
                  ` : ''}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // Render Ma trận quyền hạn
  renderPermissionMatrix(perms) {
    return `
      <div class="space-y-4 text-xs">
        <div class="p-4 bg-cyan-50 rounded-2xl border border-cyan-200 space-y-1">
          <h4 class="font-black text-cyan-900 text-sm">🛡️ BẢNG CẤU HÌNH PHÂN QUYỀN HỆ THỐNG</h4>
          <p class="text-cyan-800 font-medium">Quy định các chức năng và quyền hạn của Giáo viên và Học sinh trên website.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
            <h5 class="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-2">
              <span>🎒</span> <span>Quyền Của Học Sinh</span>
            </h5>
            <div class="space-y-2.5">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="perm-avatar" ${perms.allowStudentAvatarChange ? 'checked' : ''} class="w-4 h-4 text-cyan-600 rounded">
                <span class="font-semibold text-slate-700">Cho phép tự đổi ảnh đại diện (Avatar 16 nhân vật)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="perm-quiz" ${perms.allowDirectQuizPlay ? 'checked' : ''} class="w-4 h-4 text-cyan-600 rounded">
                <span class="font-semibold text-slate-700">Cho phép làm bài trắc nghiệm tự do không giới hạn</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="perm-3d" ${perms.enable3DComputerRoom ? 'checked' : ''} class="w-4 h-4 text-cyan-600 rounded">
                <span class="font-semibold text-slate-700">Mở phòng máy vi tính thực tế ảo 3D</span>
              </label>
            </div>
          </div>

          <div class="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
            <h5 class="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-2">
              <span>👨‍🏫</span> <span>Quyền Của Giáo Viên</span>
            </h5>
            <div class="space-y-2.5">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="perm-word" ${perms.allowTeacherExportWord ? 'checked' : ''} class="w-4 h-4 text-cyan-600 rounded">
                <span class="font-semibold text-slate-700">Cho phép xuất trực tiếp file Word (.doc) kế hoạch bài dạy</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="perm-approval" ${perms.requirePlanApproval ? 'checked' : ''} class="w-4 h-4 text-cyan-600 rounded">
                <span class="font-semibold text-slate-700">Yêu cầu Ban Giám Hiệu duyệt giáo án trước khi công khai</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-slate-200">
          <button onclick="adminPortal.savePermissions()" class="btn btn-primary btn-sm font-black px-6 shadow-md">
            💾 Lưu Cấu Hình Phân Quyền
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // CÁC THAO TÁC CỦA ADMIN: CHỈNH SỬA & XÓA TÀI KHOẢN THÀNH VIÊN
  // =========================================================================

  // Mở modal chỉnh sửa thành viên
  openEditUserModal(username) {
    const user = this.usersList.find(u => u.username === username);
    if (!user) return;

    this.editingUser = user;

    const modal = document.getElementById("admin-edit-user-modal");
    const hiddenUser = document.getElementById("admin-edit-username-hidden");
    const dispUser = document.getElementById("admin-edit-username-disp");
    const fullnameInput = document.getElementById("admin-edit-fullname-input");
    const pwdInput = document.getElementById("admin-edit-password-input");
    const roleSelect = document.getElementById("admin-edit-role-select");
    const gradeSelect = document.getElementById("admin-edit-grade-select");
    const classInput = document.getElementById("admin-edit-classname-input");

    if (hiddenUser) hiddenUser.value = user.username;
    if (dispUser) dispUser.value = user.username;
    if (fullnameInput) fullnameInput.value = user.name || "";
    if (pwdInput) pwdInput.value = "";
    if (roleSelect) roleSelect.value = user.role || "student";
    if (gradeSelect) gradeSelect.value = user.grade || 3;
    if (classInput) classInput.value = user.className || "3A";

    if (modal) modal.classList.add("active");
  }

  closeEditModal() {
    const modal = document.getElementById("admin-edit-user-modal");
    if (modal) modal.classList.remove("active");
    this.editingUser = null;
  }

  // Lưu thông tin chỉnh sửa từ modal
  async submitUserEdit() {
    const username = document.getElementById("admin-edit-username-hidden")?.value;
    const fullname = document.getElementById("admin-edit-fullname-input")?.value || "";
    const newPassword = document.getElementById("admin-edit-password-input")?.value || "";
    const role = document.getElementById("admin-edit-role-select")?.value || "student";
    const grade = parseInt(document.getElementById("admin-edit-grade-select")?.value) || 3;
    const className = document.getElementById("admin-edit-classname-input")?.value || "3A";

    if (!username) return;

    const btn = document.getElementById("btn-submit-admin-edit-user");
    if (btn) {
      btn.innerHTML = "⏳ Đang lưu & đồng bộ Supabase...";
      btn.classList.add("pointer-events-none");
    }

    const updatePayload = {
      name: fullname,
      role: role,
      grade: grade,
      className: className
    };

    if (newPassword.trim()) {
      updatePayload.password = newPassword.trim();
    }

    const res = await window.adminService.adminUpdateUser(username, updatePayload);

    if (btn) {
      btn.innerHTML = "💾 Lưu Thay Đổi & Đồng Bộ Supabase";
      btn.classList.remove("pointer-events-none");
    }

    if (res.success) {
      window.app.showToast(`🎉 Đã cập nhật thành công thông tin cho '${fullname || username}'!`, "success");
      this.closeEditModal();
      this.render("teacher-tab-admin");
    } else {
      window.app.showToast("Không thể cập nhật thành viên, vui lòng thử lại!", "error");
    }
  }

  // Xóa tài khoản thành viên khỏi hệ thống & Supabase
  async deleteUser(username, name) {
    if (username === "admin") {
      window.app.showToast("Không thể xóa tài khoản Quản trị viên gốc hệ thống (admin)!", "warning");
      return;
    }

    if (!confirm(`⚠️ CẢNH BÁO QUẢN TRỊ:\nThầy Cô có chắc chắn muốn XÓA VĨNH VIỄN tài khoản '${name || username}' (${username}) khỏi CSDL Supabase và hệ thống không?`)) {
      return;
    }

    const res = await window.adminService.adminDeleteUser(username);

    if (res.success) {
      window.app.showToast(`🗑️ Đã xóa thành công tài khoản '${name || username}' khỏi CSDL Supabase & Hệ thống!`, "success");
      this.render("teacher-tab-admin");
    } else {
      window.app.showToast(res.error || "Không thể xóa tài khoản!", "error");
    }
  }

  // Đổi vai trò người dùng
  async changeUserRole(username, newRole) {
    const res = await window.adminService.updateUserRole(username, newRole);
    if (res.success) {
      window.app.showToast(`✨ Đã chuyển quyền '${username}' thành '${newRole.toUpperCase()}'!`, "success");
      this.usersList = await window.adminService.getAllUsers();
    } else {
      window.app.showToast(res.error || "Không thể đổi vai trò!", "error");
    }
  }

  // Khóa / Mở khóa tài khoản
  async toggleStatus(username) {
    const res = await window.adminService.toggleUserStatus(username);
    if (res.success) {
      window.app.showToast(`Đã ${res.isActive ? "MỞ KHÓA" : "KHÓA"} tài khoản '${username}'!`, "info");
      this.usersList = await window.adminService.getAllUsers();
      document.getElementById("admin-subtab-users").innerHTML = this.renderUsersTable();
    }
  }

  // Đặt lại mật khẩu
  async resetPassword(username) {
    if (!confirm(`Đặt lại mật khẩu cho '${username}' về mặc định là '123456'?`)) return;
    await window.adminService.resetUserPassword(username, "123456");
    window.app.showToast(`🔑 Đã đặt lại mật khẩu cho '${username}' thành: 123456`, "success");
  }

  // Lưu phân quyền
  savePermissions() {
    const perms = {
      allowStudentAvatarChange: document.getElementById("perm-avatar")?.checked !== false,
      allowTeacherExportWord: document.getElementById("perm-word")?.checked !== false,
      allowDirectQuizPlay: document.getElementById("perm-quiz")?.checked !== false,
      requirePlanApproval: document.getElementById("perm-approval")?.checked === true,
      enable3DComputerRoom: document.getElementById("perm-3d")?.checked !== false
    };

    window.adminService.savePermissions(perms);
    window.app.showToast("🛡️ Đã lưu cấu hình phân quyền hệ thống thành công!", "success");
  }

  // =========================================================================
  // GỢI Ý 2: XUẤT DANH SÁCH TẤT CẢ THÀNH VIÊN RA FILE EXCEL (.XLS)
  // =========================================================================
  async exportUsersExcel() {
    const users = await window.adminService.getAllUsers();
    if (!users || users.length === 0) {
      window.app.showToast("Không có dữ liệu thành viên để xuất!", "warning");
      return;
    }

    let tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #cccccc; padding: 8px; text-align: left; } th { background-color: #f1f5f9; font-weight: bold; }</style></head>
      <body>
        <h2>DANH SÁCH THÀNH VIÊN HỆ THỐNG VUI HỌC TIN HỌC 3-5</h2>
        <p><i>Trường Tiểu Học Vui Học • Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}</i></p>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ và Tên</th>
              <th>Username</th>
              <th>Mật Khẩu Mặc Định</th>
              <th>Vai Trò</th>
              <th>Khối Lớp</th>
              <th>Lớp Học</th>
              <th>Số Sao (⭐)</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
    `;

    users.forEach((u, idx) => {
      tableHTML += `
        <tr>
          <td>${idx + 1}</td>
          <td>${u.name || ''}</td>
          <td>${u.username || ''}</td>
          <td>123456</td>
          <td>${u.role === 'admin' ? 'Quản Trị Viên' : u.role === 'teacher' ? 'Giáo Viên' : 'Học Sinh'}</td>
          <td>Khối ${u.grade || 3}</td>
          <td>${u.className || '3A'}</td>
          <td>${u.stars || 0}</td>
          <td>${u.isActive !== false ? 'Hoạt động' : 'Đã khóa'}</td>
        </tr>
      `;
    });

    tableHTML += `</tbody></table></body></html>`;

    const blob = new Blob(["\ufeff" + tableHTML], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Danh_Sach_Thanh_Vien_VuiHoc_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    window.app.showToast("📊 Đã xuất file Excel danh sách thành viên thành công!", "success");
  }

  // =========================================================================
  // GỢI Ý 3: NHẬP HÀNG LOẠT HỌC SINH TỪ FILE EXCEL / CSV
  // =========================================================================
  openImportModal() {
    const modal = document.getElementById("admin-import-users-modal");
    if (modal) modal.classList.add("active");
  }

  closeImportModal() {
    const modal = document.getElementById("admin-import-users-modal");
    if (modal) modal.classList.remove("active");
  }

  fillSampleImportData() {
    const textarea = document.getElementById("admin-import-csv-text");
    if (textarea) {
      textarea.value = `Nguyễn Văn An, hs3a01, 123456, 3, 3A\nTrần Thị Bình, hs3a02, 123456, 3, 3A\nLê Hoàng Cường, hs4b01, 123456, 4, 4B\nPhạm Đức Dũng, hs4b02, 123456, 4, 4B\nĐỗ Mai Anh, hs5a01, 123456, 5, 5A`;
    }
  }

  async submitBatchImport() {
    const text = document.getElementById("admin-import-csv-text")?.value || "";
    if (!text.trim()) {
      window.app.showToast("Vui lòng dán nội dung CSV hoặc danh sách học sinh từ Excel!", "warning");
      return;
    }

    const lines = text.trim().split("\n");
    const usersToImport = [];

    lines.forEach(line => {
      const parts = line.split(",").map(s => s.trim());
      if (parts.length >= 2) {
        usersToImport.push({
          name: parts[0],
          username: parts[1],
          password: parts[2] || "123456",
          grade: parseInt(parts[3]) || 3,
          className: parts[4] || "3A",
          role: "student"
        });
      }
    });

    if (usersToImport.length === 0) {
      window.app.showToast("Không tìm thấy dòng dữ liệu hợp lệ!", "warning");
      return;
    }

    const btn = document.getElementById("btn-submit-batch-import");
    if (btn) {
      btn.innerHTML = "⏳ Đang tạo tài khoản & đồng bộ Supabase...";
      btn.classList.add("pointer-events-none");
    }

    const res = await window.adminService.batchImportUsers(usersToImport);

    if (btn) {
      btn.innerHTML = "🚀 Tạo Hàng Loạt & Đồng Bộ Supabase";
      btn.classList.remove("pointer-events-none");
    }

    if (res.success) {
      window.app.showToast(`🎉 Đã nhập hàng loạt ${res.count} tài khoản Học sinh lên Supabase thành công!`, "success");
      this.closeImportModal();
      this.render("teacher-tab-admin");
    } else {
      window.app.showToast(res.error || "Lỗi nhập hàng loạt!", "error");
    }
  }

  // =========================================================================
  // GỢI Ý 5: XEM NHẬT KÝ LỊCH SỬ HOẠT ĐỘNG (AUDIT LOGS)
  // =========================================================================
  async openAuditLogModal(username, name) {
    const titleEl = document.getElementById("admin-audit-user-title");
    const bodyEl = document.getElementById("admin-audit-log-body");
    const modal = document.getElementById("admin-audit-log-modal");

    if (titleEl) titleEl.innerText = `📜 NHẬT KÝ LỊCH SỬ HOẠT ĐỘNG: ${name || username} (${username})`;

    if (bodyEl) {
      bodyEl.innerHTML = `<p class="text-center py-6 font-bold text-slate-500">⏳ Đang tải nhật ký từ Supabase...</p>`;
    }

    if (modal) modal.classList.add("active");

    const logs = await window.adminService.getUserAuditLogs(username);

    if (bodyEl) {
      if (!logs || logs.length === 0) {
        bodyEl.innerHTML = `<p class="text-center py-6 font-bold text-slate-400">Chưa ghi nhận hoạt động nào của tài khoản này.</p>`;
        return;
      }

      bodyEl.innerHTML = logs.map(log => `
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
          <div class="space-y-1">
            <span class="badge ${log.type === 'warning' ? 'badge-rose bg-rose-100 text-rose-700' : log.type === 'exam' ? 'badge-amber bg-amber-100 text-amber-800' : 'badge-cyan bg-cyan-100 text-cyan-800'} font-black text-[10px]">
              ${log.action}
            </span>
            <p class="font-semibold text-slate-700 text-xs">${log.detail}</p>
          </div>
          <span class="text-[10px] font-mono text-slate-400 whitespace-nowrap">${new Date(log.timestamp).toLocaleTimeString('vi-VN')} ${new Date(log.timestamp).toLocaleDateString('vi-VN')}</span>
        </div>
      `).join("");
    }
  }

  // =========================================================================
  // GỢI Ý 1: IN THẺ TÀI KHOẢN HỌC SINH KÈM MÃ QR CODE KÍCH THƯỚC A4
  // =========================================================================
  async printStudentCardsA4() {
    const users = await window.adminService.getAllUsers();
    const students = users.filter(u => u.role === "student");

    if (!students || students.length === 0) {
      window.app.showToast("Không tìm thấy học sinh nào để in thẻ!", "warning");
      return;
    }

    const printWin = window.open("", "_blank");
    if (!printWin) return;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>In Thẻ Học Sinh Kèm QR Code Đăng Nhập Vui Học</title>
        <meta charset="utf-8">
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
          .page-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; page-break-after: always; }
          .student-card { border: 2px dashed #94a3b8; border-radius: 16px; padding: 14px; background: white; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; }
          .card-info { font-size: 12px; color: #1e293b; }
          .card-title { font-size: 11px; font-weight: 800; color: #4338ca; text-transform: uppercase; margin: 0 0 4px 0; }
          .card-name { font-size: 15px; font-weight: 900; color: #0f172a; margin: 0 0 6px 0; }
          .card-user { font-family: monospace; font-weight: bold; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 6px; display: inline-block; }
          .card-pwd { font-family: monospace; color: #64748b; font-size: 11px; margin-top: 4px; }
          .qr-box { text-align: center; }
          .qr-box img { width: 90px; h-height: 90px; border-radius: 8px; border: 1px solid #cbd5e1; }
          .qr-box p { font-size: 9px; font-weight: bold; color: #64748b; margin: 2px 0 0 0; }
        </style>
      </head>
      <body onload="window.print()">
        <div class="page-grid">
    `;

    students.forEach(st => {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(st.username)}`;
      html += `
        <div class="student-card">
          <div class="card-info">
            <p class="card-title">🎓 VUI HỌC TIN HỌC 3-5 • THẺ THÀNH VIÊN</p>
            <p class="card-name">${st.avatar || '👦'} ${st.name}</p>
            <p>Khối ${st.grade || 3} • Lớp <b>${st.className || '3A'}</b></p>
            <p>Tên ĐN: <span class="card-user">${st.username}</span></p>
            <p class="card-pwd">Mật khẩu: <b>123456</b></p>
          </div>
          <div class="qr-box">
            <img src="${qrUrl}" alt="QR Login">
            <p>Quét Quét Đăng Nhập</p>
          </div>
        </div>
      `;
    });

    html += `</div></body></html>`;

    printWin.document.write(html);
    printWin.document.close();
  }

  // =========================================================================
  // GỢI Ý 4: TỰ ĐỘNG CHUYỂN NIÊN HỌC MỚI (NÂNG LỚP & RESET MK 123456)
  // =========================================================================
  async promoteAcademicYear() {
    if (!confirm("⚠️ CẢNH BÁO NĂM HỌC MỚI:\nThầy Cô có chắc chắn muốn NÂNG KHỐI LỚP (Khối 3->4, Khối 4->5) và ĐẶT LẠI MẬT KHẨU '123456' cho toàn bộ học sinh không?")) {
      return;
    }

    const res = await window.adminService.promoteAcademicYear();
    if (res.success) {
      window.app.showToast(`🎉 Đã nâng khối lớp và reset mật khẩu mượt mượt cho ${res.count} học sinh thành công!`, "success");
      this.render("teacher-tab-admin");
    } else {
      window.app.showToast("Không thể nâng niên học mới, vui lòng thử lại!", "error");
    }
  }

  // =========================================================================
  // GỢI Ý 5: BIỂU ĐỒ RADAR 3D PHÂN TÍCH NĂNG LỰC HỌC TẬP GDPT 2018
  // =========================================================================
  async openSkillRadarModal(username, name) {
    const titleEl = document.getElementById("admin-radar-user-title");
    const containerEl = document.getElementById("admin-radar-chart-container");
    const detailsGridEl = document.getElementById("admin-radar-details-grid");
    const modal = document.getElementById("admin-skill-radar-modal");

    if (titleEl) titleEl.innerText = `📊 MA TRẬN NĂNG LỰC GDPT 2018: ${name || username} (${username})`;
    if (modal) modal.classList.add("active");

    const data = await window.adminService.getStudentCompetencyRadar(username);

    if (containerEl) {
      // Đồ họa SVG Radar 5 trục
      containerEl.innerHTML = `
        <svg viewBox="0 0 400 340" class="w-full max-w-sm h-64 select-none drop-shadow-lg">
          <!-- Background Polygon Grids -->
          <polygon points="200,30 350,130 300,280 100,280 50,130" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4"/>
          <polygon points="200,80 300,145 265,245 135,245 100,145" fill="none" stroke="#475569" stroke-width="1"/>
          
          <!-- Axes lines -->
          <line x1="200" y1="175" x2="200" y2="30" stroke="#475569" stroke-width="1"/>
          <line x1="200" y1="175" x2="350" y2="130" stroke="#475569" stroke-width="1"/>
          <line x1="200" y1="175" x2="300" y2="280" stroke="#475569" stroke-width="1"/>
          <line x1="200" y1="175" x2="100" y2="280" stroke="#475569" stroke-width="1"/>
          <line x1="200" y1="175" x2="50" y2="130" stroke="#475569" stroke-width="1"/>

          <!-- Dynamic Radar Skill Polygon -->
          <polygon points="
            200,${175 - (data.topicA * 1.45)} 
            ${200 + (data.topicB * 1.5 * 0.95)},${175 - (data.topicB * 0.45)} 
            ${200 + (data.topicC * 1.0 * 0.95)},${175 + (data.topicC * 1.05)} 
            ${200 - (data.topicD * 1.0 * 0.95)},${175 + (data.topicD * 1.05)} 
            ${200 - (data.topicE * 1.5 * 0.95)},${175 - (data.topicE * 0.45)}" 
            fill="rgba(168, 85, 247, 0.4)" stroke="#a855f7" stroke-width="3"/>

          <!-- Glowing Nodes -->
          <circle cx="200" cy="${175 - (data.topicA * 1.45)}" r="5" fill="#f59e0b"/>
          <circle cx="${200 + (data.topicB * 1.5 * 0.95)}" cy="${175 - (data.topicB * 0.45)}" r="5" fill="#10b981"/>
          <circle cx="${200 + (data.topicC * 1.0 * 0.95)}" cy="${175 + (data.topicC * 1.05)}" r="5" fill="#06b6d4"/>
          <circle cx="${200 - (data.topicD * 1.0 * 0.95)}" cy="${175 + (data.topicD * 1.05)}" r="5" fill="#ec4899"/>
          <circle cx="${200 - (data.topicE * 1.5 * 0.95)}" cy="${175 - (data.topicE * 0.45)}" r="5" fill="#3b82f6"/>

          <!-- Labels -->
          <text x="200" y="18" text-anchor="middle" fill="#f59e0b" font-weight="bold" font-size="11">A. Máy Tính & Em (${data.topicA}%)</text>
          <text x="355" y="125" text-anchor="start" fill="#10b981" font-weight="bold" font-size="11">B. Mạng Mát (${data.topicB}%)</text>
          <text x="305" y="300" text-anchor="middle" fill="#06b6d4" font-weight="bold" font-size="11">C. Sắp Xếp (${data.topicC}%)</text>
          <text x="95" y="300" text-anchor="middle" fill="#ec4899" font-weight="bold" font-size="11">D. Đạo Đức (${data.topicD}%)</text>
          <text x="45" y="125" text-anchor="end" fill="#3b82f6" font-weight="bold" font-size="11">E. Lập Trình (${data.topicE}%)</text>
        </svg>
      `;
    }

    if (detailsGridEl) {
      detailsGridEl.innerHTML = `
        <div class="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
          ⭐ <b>Chủ đề A (Máy tính & Em):</b> ${data.topicA}% • Level: ${data.topicA >= 85 ? 'Tốt' : 'Đạt'}
        </div>
        <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
          🌐 <b>Chủ đề B (Mạng máy tính):</b> ${data.topicB}% • Level: ${data.topicB >= 80 ? 'Tốt' : 'Đạt'}
        </div>
        <div class="p-2 bg-cyan-50 rounded-xl border border-cyan-200 text-cyan-900">
          📂 <b>Chủ đề C (Sắp xếp thư mục):</b> ${data.topicC}% • Level: ${data.topicC >= 85 ? 'Xuất sắc' : 'Tốt'}
        </div>
        <div class="p-2 bg-pink-50 rounded-xl border border-pink-200 text-pink-900">
          🛡️ <b>Chủ đề D (Đạo đức Tin học):</b> ${data.topicD}% • Level: ${data.topicD >= 85 ? 'Xuất sắc' : 'Tốt'}
        </div>
        <div class="p-2 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 col-span-2">
          🤖 <b>Chủ đề E (Giải quyết vấn đề & Lập trình Robot):</b> ${data.topicE}% • Level: ${data.topicE >= 80 ? 'Tốt' : 'Đạt'}
        </div>
      `;
    }
  }
}

window.adminPortal = new AdminPortal();
