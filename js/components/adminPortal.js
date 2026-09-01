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

            <!-- Tìm kiếm & Lọc Vai Trò -->
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
}

window.adminPortal = new AdminPortal();
