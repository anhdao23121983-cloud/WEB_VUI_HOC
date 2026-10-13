/**
 * STUDENT MANAGEMENT PORTAL COMPONENT
 * Phân hệ Quản Lý Học Sinh & Bảng Xếp Hạng Đấu Trường Tin Học
 * - Hiển thị 100% danh sách học sinh đăng ký trong hệ thống (Supabase + LocalStorage)
 * - Bảng xếp hạng kết quả thi đấu Đấu Trường Tin Học toàn diện (Điểm cao, Tổng sao, Tốc độ, Kỷ lục)
 * - Tặng sao khen thưởng, Đăng ký nhanh học sinh mới và Xuất Excel
 */

class StudentManagementPortal {
  constructor() {
    this.currentTab = "list"; // 'list' (Danh sách học sinh) | 'leaderboard' (Bảng xếp hạng Đấu Trường)
    this.gradeFilter = "all"; // 'all' | 3 | 4 | 5
    this.classFilter = "all"; // 'all' | '3A' | '3B' | '4A' | '4B' | '5A' | '5B'
    this.timeFilter = "all";  // 'all' | 'today' | 'week' | 'month'
    this.searchQuery = "";
    this.studentsList = [];
    this.leaderboardData = [];
    this.recentMatches = [];
    this.selectedStudentForReward = null;
  }

  // 1. TẢI DỮ LIỆU TỔNG HỢP TỪ SUPABASE & LOCALSTORAGE
  async loadData() {
    // 1.1 Lấy toàn bộ người dùng và lọc học sinh
    let allUsers = [];
    if (window.adminService) {
      allUsers = await window.adminService.getAllUsers();
    } else {
      const db = JSON.parse(localStorage.getItem("app_mock_db")) || window.MOCK_DATABASE || {};
      allUsers = db.users || [];
    }

    // Lọc danh sách học sinh (role = 'student' hoặc không phải teacher/admin)
    this.studentsList = allUsers.filter(u => u.role === "student" || (!u.role || (u.role !== "teacher" && u.role !== "admin")));

    // 1.2 Lấy dữ liệu Bảng xếp hạng Đấu Trường Tin Học
    if (window.arenaService) {
      this.leaderboardData = await window.arenaService.getStudentLeaderboard(this.gradeFilter, this.classFilter, this.timeFilter);
      if (this.leaderboardData.length === 0 && window.arenaService.syncArenaWithStudents) {
        await window.arenaService.syncArenaWithStudents(true);
        this.leaderboardData = await window.arenaService.getStudentLeaderboard(this.gradeFilter, this.classFilter, this.timeFilter);
      }
    } else {
      this.leaderboardData = [];
    }

    // 1.3 Lấy danh sách các trận đấu gần nhất
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
    this.recentMatches = (db.arena_matches || []).slice(0, 10);
  }

  // 2. RENDER MÀN HÌNH CHÍNH
  async render(containerId = "main-content-area") {
    const container = document.getElementById(containerId);
    if (!container) return;

    await this.loadData();

    // Thống kê nhanh
    const totalStudents = this.studentsList.length;
    const countLop3 = this.studentsList.filter(s => (s.grade || s.grade_level) === 3).length;
    const countLop4 = this.studentsList.filter(s => (s.grade || s.grade_level) === 4).length;
    const countLop5 = this.studentsList.filter(s => (s.grade || s.grade_level) === 5).length;
    const totalStars = this.studentsList.reduce((sum, s) => sum + (s.stars || 0), 0);
    const topArenaChamp = this.leaderboardData.length > 0 ? this.leaderboardData[0] : null;

    // Danh sách lớp học động & đếm số lượng học sinh từng lớp
    const defaultClasses = ["3A", "3B", "4A", "4B", "5A", "5B"];
    const foundClasses = Array.from(new Set(this.studentsList.map(s => s.className || s.class_name).filter(Boolean)));
    const combinedClasses = Array.from(new Set([...defaultClasses, ...foundClasses])).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    let visibleClasses = combinedClasses;
    if (this.gradeFilter !== "all") {
      visibleClasses = visibleClasses.filter(c => c.startsWith(this.gradeFilter.toString()));
    }

    const allClassOptions = visibleClasses.map(clsName => {
      const count = this.studentsList.filter(s => (s.className || s.class_name) === clsName).length;
      const g = parseInt(clsName.charAt(0), 10);
      const icon = g === 3 ? "🎒" : (g === 4 ? "🚀" : "⭐");
      return { name: clsName, count, icon, grade: g };
    });

    container.innerHTML = `
      <div class="space-y-6 animate-pop">
        <!-- Banner Tiêu Đề Quản Lý Học Sinh -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge badge-amber font-black">👨‍🎓 QUẢN TRỊ HỌC VIÊN</span>
              <span class="badge bg-white/20 text-white font-bold">Chuẩn GDPT 2018</span>
              <span class="badge bg-emerald-500/30 text-emerald-100 border border-emerald-300/40 font-black">🟢 ${totalStudents} Học Sinh Đã Đăng Ký</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">QUẢN LÝ HỌC SINH & ĐẤU TRƯỜNG TIN HỌC</h2>
            <p class="text-cyan-100 text-xs md:text-sm">Theo dõi toàn bộ học sinh đăng ký tài khoản, kết quả tranh tài Bảng Vàng và trao thưởng Sao Hoa Điểm 10.</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="window.dataSyncManager.syncAllPermanent()" class="btn bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-black shadow-lg flex items-center gap-2 px-3.5 py-2.5 border-2 border-white rounded-2xl hover:scale-105 transition-all text-xs" title="Lưu trữ vĩnh viễn toàn bộ dữ liệu vào mã nguồn web và server">
              <span>☁️</span> <span>Lưu Trữ Vĩnh Viễn</span>
            </button>
            <button onclick="window.dataSyncManager.exportBackupFile()" class="btn bg-white/20 hover:bg-white/30 text-white font-black flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs hover:scale-105 transition-all" title="Tải file sao lưu hệ thống về máy tính">
              <span>💾</span> <span>Sao Lưu (.json)</span>
            </button>
            <label class="btn bg-white/20 hover:bg-white/30 text-white font-black flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs hover:scale-105 transition-all cursor-pointer" title="Khôi phục toàn bộ từ file sao lưu">
              <span>📥</span> <span>Khôi Phục</span>
              <input type="file" accept=".json" onchange="window.dataSyncManager.importBackupFile(this.files[0])" class="hidden">
            </label>
            <button onclick="studentManagementPortal.openAddStudentModal()" class="btn bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-lg flex items-center gap-2 px-3.5 py-2.5 rounded-2xl hover:scale-105 transition-all text-xs">
              <span>➕</span> <span>Thêm Học Sinh</span>
            </button>
            <button onclick="studentManagementPortal.exportExcel()" class="btn bg-white/20 hover:bg-white/30 text-white font-black flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs hover:scale-105 transition-all" title="Xuất toàn bộ danh sách ra file Excel">
              <span>📊</span> <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        <!-- Banner Thông Báo Chế Độ Bảo Vệ Dữ Liệu Quản Trị -->
        <div class="p-3.5 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl border border-emerald-500/40 shadow-sm flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2.5 text-xs font-bold">
            <span class="text-base p-1.5 bg-emerald-500/20 rounded-xl text-emerald-300 shrink-0">🛡️</span>
            <div>
              <span class="text-emerald-300 font-black uppercase text-[11px] block">CHẾ ĐỘ BẢO VỆ DỮ LIỆU TOÀN DIỆN ĐANG BẬT</span>
              <p class="text-slate-300 text-[11px] font-normal">Khi tài khoản Quản trị viên chưa ra lệnh xóa, hệ thống từ chối tuyệt đối mọi hành vi xóa hoặc làm mất mát thông tin trên website.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.dataSyncManager.syncAllPermanent()" class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-xl shadow transition-all cursor-pointer">
              ⚡ Đồng Bộ Vĩnh Viễn Ngay
            </button>
          </div>
        </div>

        <!-- 4 Thẻ Thống Kê Tổng Quan (KPIs) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-4 flex items-center gap-3">
            <span class="text-3xl p-3 bg-blue-100 text-blue-700 rounded-2xl shrink-0">🎒</span>
            <div>
              <p class="text-[11px] text-slate-500 font-bold uppercase">Tổng Số Học Sinh</p>
              <h4 class="text-xl font-black text-slate-900">${totalStudents} em</h4>
              <p class="text-[10px] text-blue-600 font-semibold">L3: ${countLop3} • L4: ${countLop4} • L5: ${countLop5}</p>
            </div>
          </div>

          <div class="glass-card p-4 flex items-center gap-3">
            <span class="text-3xl p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">⭐</span>
            <div>
              <p class="text-[11px] text-slate-500 font-bold uppercase">Tổng Sao Tích Lũy</p>
              <h4 class="text-xl font-black text-amber-600">${totalStars.toLocaleString()} ⭐</h4>
              <p class="text-[10px] text-slate-500 font-semibold">Toàn bộ trường học</p>
            </div>
          </div>

          <div class="glass-card p-4 flex items-center gap-3">
            <span class="text-3xl p-3 bg-yellow-100 text-yellow-800 rounded-2xl shrink-0">🏆</span>
            <div>
              <p class="text-[11px] text-slate-500 font-bold uppercase">Quán Quân Đấu Trường</p>
              <h4 class="text-base font-black text-slate-900 truncate max-w-[140px]">${topArenaChamp ? topArenaChamp.studentName : 'Chưa có'}</h4>
              <p class="text-[10px] text-emerald-600 font-bold">${topArenaChamp ? `${topArenaChamp.highestScore} điểm (${topArenaChamp.studentClass})` : 'Chờ thi đấu'}</p>
            </div>
          </div>

          <div class="glass-card p-4 flex items-center gap-3">
            <span class="text-3xl p-3 bg-teal-100 text-teal-800 rounded-2xl shrink-0">⚡</span>
            <div>
              <p class="text-[11px] text-slate-500 font-bold uppercase">Đấu Thủ Tranh Tài</p>
              <h4 class="text-xl font-black text-teal-800">${this.leaderboardData.length} em</h4>
              <p class="text-[10px] text-slate-500 font-semibold">Đã tham gia Đấu Trường</p>
            </div>
          </div>
        </div>

        <!-- 2 Tab Chuyển Đổi: Danh Sách Học Sinh vs Bảng Xếp Hạng Đấu Trường -->
        <div class="p-3 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="studentManagementPortal.switchTab('list')" class="px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${this.currentTab === 'list' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📋</span> <span>Danh Sách Học Sinh Có Đăng Ký (${totalStudents})</span>
            </button>
            <button onclick="studentManagementPortal.switchTab('leaderboard')" class="px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${this.currentTab === 'leaderboard' ? 'bg-amber-500 text-amber-950 shadow-md ring-2 ring-amber-300' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'}">
              <span class="animate-pulse">⚡</span> <span>Bảng Xếp Hạng Đấu Trường Tin Học (${this.leaderboardData.length})</span>
            </button>
            <button onclick="studentManagementPortal.syncArenaData()" class="px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:scale-105 cursor-pointer">
              <span id="sync-icon">🔄</span> <span>Đồng Bộ Học Sinh & Điểm Số</span>
            </button>
          </div>

          <!-- Bộ lọc Khối Lớp và Lớp Học -->
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-500 hidden sm:inline">Khối:</span>
              <select onchange="studentManagementPortal.filterGrade(this.value)" class="form-control text-xs font-bold py-1.5 px-2.5 rounded-xl border-slate-300">
                <option value="all" ${this.gradeFilter === 'all' ? 'selected' : ''}>Tất Cả Khối (3-5)</option>
                <option value="3" ${this.gradeFilter === 3 ? 'selected' : ''}>Khối Lớp 3</option>
                <option value="4" ${this.gradeFilter === 4 ? 'selected' : ''}>Khối Lớp 4</option>
                <option value="5" ${this.gradeFilter === 5 ? 'selected' : ''}>Khối Lớp 5</option>
              </select>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-500 hidden sm:inline">Lớp:</span>
              <select onchange="studentManagementPortal.filterClass(this.value)" class="form-control text-xs font-bold py-1.5 px-2.5 rounded-xl border-slate-300">
                <option value="all" ${this.classFilter === 'all' ? 'selected' : ''}>Tất Cả Lớp</option>
                ${allClassOptions.map(c => `
                  <option value="${c.name}" ${this.classFilter === c.name ? 'selected' : ''}>Lớp ${c.name} (${c.count} em)</option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- THANH BỘ LỌC NHANH THEO TỪNG LỚP (QUICK CLASS PILL FILTER BAR) -->
        <div class="p-3 bg-gradient-to-r from-slate-50 via-teal-50/40 to-emerald-50/30 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs font-black text-slate-700 flex items-center gap-1 shrink-0 mr-1">
              <span class="text-base">🏫</span> <span>LỌC NHANH LỚP:</span>
            </span>

            <button onclick="studentManagementPortal.filterClass('all')" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${this.classFilter === 'all' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-105 border border-emerald-400' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}">
              <span>Tất Cả Lớp</span>
              <span class="px-1.5 py-0.5 ${this.classFilter === 'all' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'} rounded-full text-[10px] font-bold">${totalStudents}</span>
            </button>

            ${allClassOptions.map(cls => `
              <button onclick="studentManagementPortal.filterClass('${cls.name}')" class="px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${this.classFilter === cls.name ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md scale-105 border border-teal-400 ring-2 ring-teal-200' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}">
                <span>${cls.icon} Lớp ${cls.name}</span>
                <span class="px-1.5 py-0.5 ${this.classFilter === cls.name ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'} rounded-full text-[10px] font-bold">${cls.count}</span>
              </button>
            `).join('')}
          </div>

          ${this.classFilter !== 'all' ? `
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-teal-900 bg-teal-100/90 px-2.5 py-1 rounded-xl border border-teal-300 flex items-center gap-1 shadow-xs">
                <span>🎯</span> Đang xem: <b>Lớp ${this.classFilter}</b>
              </span>
              <button onclick="studentManagementPortal.filterClass('all')" class="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer" title="Bỏ lọc để xem tất cả các lớp">
                <span>✕</span> Xem tất cả
              </button>
            </div>
          ` : ''}
        </div>

        <!-- VÙNG NỘI DUNG THEO TAB ĐANG CHỌN -->
        <div id="student-portal-tab-content">
          ${this.currentTab === "list" ? this.renderStudentsListHtml() : this.renderLeaderboardHtml()}
        </div>

        <!-- MODAL TẶNG SAO KHEN THƯỞNG CHO HỌC SINH -->
        <div id="modal-award-stars" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-pop">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="font-black text-slate-900 text-base flex items-center gap-2">
                <span class="text-xl">⭐</span> <span>TẶNG SAO KHEN THƯỞNG HỌC SINH</span>
              </h3>
              <button onclick="studentManagementPortal.closeRewardModal()" class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div class="space-y-3">
              <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
                <span id="reward-student-avatar" class="text-3xl">👦</span>
                <div>
                  <h4 id="reward-student-name" class="font-black text-slate-900 text-sm">Nguyễn Văn An</h4>
                  <p id="reward-student-info" class="text-xs text-slate-600">Lớp 3A • Hiện có: 180 ⭐</p>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Số sao tặng thưởng:</label>
                <div class="grid grid-cols-4 gap-2 mb-2">
                  <button type="button" onclick="document.getElementById('reward-stars-amount').value=10" class="btn btn-outline btn-sm font-bold text-xs py-1.5">+10 ⭐</button>
                  <button type="button" onclick="document.getElementById('reward-stars-amount').value=20" class="btn btn-outline btn-sm font-bold text-xs py-1.5">+20 ⭐</button>
                  <button type="button" onclick="document.getElementById('reward-stars-amount').value=50" class="btn btn-outline btn-sm font-bold text-xs py-1.5 text-amber-700 bg-amber-50 border-amber-300">+50 ⭐</button>
                  <button type="button" onclick="document.getElementById('reward-stars-amount').value=100" class="btn btn-outline btn-sm font-bold text-xs py-1.5 text-rose-700 bg-rose-50 border-rose-300">+100 ⭐</button>
                </div>
                <input type="number" id="reward-stars-amount" value="20" min="1" max="500" class="form-control text-sm font-black text-amber-600">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Lý do khen thưởng:</label>
                <input type="text" id="reward-stars-reason" value="Tích cực tham gia và trả lời xuất sắc bài học Tin học" class="form-control text-xs">
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onclick="studentManagementPortal.closeRewardModal()" class="btn btn-outline btn-sm font-bold px-4">Hủy</button>
              <button onclick="studentManagementPortal.confirmAwardStars()" class="btn btn-emerald btn-sm font-black px-5 text-white">⭐ Xác Nhận Trao Thưởng</button>
            </div>
          </div>
        </div>

        <!-- MODAL ĐĂNG KÝ HỌC SINH MỚI -->
        <div id="modal-add-student" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-pop">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="font-black text-slate-900 text-base flex items-center gap-2">
                <span>➕</span> <span>CẤP TÀI KHOẢN HỌC SINH MỚI</span>
              </h3>
              <button onclick="studentManagementPortal.closeAddStudentModal()" class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Họ và tên học sinh (*):</label>
                <input type="text" id="new-std-fullname" placeholder="Ví dụ: Nguyễn Hoàng Anh" class="form-control text-xs font-bold">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Tên đăng nhập (*):</label>
                  <input type="text" id="new-std-username" placeholder="vd: hs3a_hoanganh" class="form-control text-xs font-bold">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Mật khẩu (ít nhất 6 ký tự):</label>
                  <input type="password" id="new-std-password" value="123456" class="form-control text-xs font-bold">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Khối lớp:</label>
                  <select id="new-std-grade" class="form-control text-xs font-bold" onchange="studentManagementPortal.updateClassSelect(this.value)">
                    <option value="3">Khối 3</option>
                    <option value="4">Khối 4</option>
                    <option value="5">Khối 5</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Lớp học:</label>
                  <input type="text" id="new-std-class" value="3A" placeholder="vd: 3A, 4B" class="form-control text-xs font-bold">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Trường học:</label>
                <input type="text" id="new-std-school" value="Trường Tiểu Học Vui Học" class="form-control text-xs">
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onclick="studentManagementPortal.closeAddStudentModal()" class="btn btn-outline btn-sm font-bold px-4">Hủy</button>
              <button onclick="studentManagementPortal.submitAddStudent()" class="btn btn-primary btn-sm font-black px-5">Tạo Tài Khoản</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 3. RENDER TAB 1: DANH SÁCH HỌC SINH ĐĂNG KÝ
  renderStudentsListHtml() {
    let list = [...this.studentsList];

    // Lọc theo khối
    if (this.gradeFilter !== "all") {
      list = list.filter(s => (s.grade || s.grade_level) === parseInt(this.gradeFilter));
    }

    // Lọc theo lớp học
    if (this.classFilter !== "all") {
      list = list.filter(s => (s.className || s.class_name) === this.classFilter);
    }

    // Lọc theo từ khóa tìm kiếm
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.username && s.username.toLowerCase().includes(q)) ||
        (s.className && s.className.toLowerCase().includes(q))
      );
    }

    return `
      <div class="glass-card p-5 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📋</span>
            <h3 class="font-black text-slate-900 text-sm md:text-base">
              ${this.classFilter !== 'all' ? `DANH SÁCH HỌC SINH LỚP ${this.classFilter}` : (this.gradeFilter !== 'all' ? `DANH SÁCH HỌC SINH KHỐI ${this.gradeFilter}` : 'DANH SÁCH TẤT CẢ HỌC SINH ĐĂNG KÝ')} (${list.length} em)
            </h3>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <div class="relative">
              <input type="text" value="${this.searchQuery}" oninput="studentManagementPortal.handleSearch(this.value)" placeholder="🔍 Tìm tên, tài khoản, lớp..." class="form-control text-xs font-bold py-1.5 px-3 w-56 rounded-xl border-slate-300">
            </div>
          </div>
        </div>

        ${list.length === 0 ? `
          <div class="p-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <span class="text-5xl block animate-bounce">🔍</span>
            <h4 class="font-black text-slate-700 text-base">Không tìm thấy học sinh nào ${this.classFilter !== 'all' ? `thuộc Lớp ${this.classFilter}` : ''}</h4>
            <p class="text-xs text-slate-500">${this.classFilter !== 'all' ? `Hiện chưa có học sinh nào thuộc Lớp ${this.classFilter} trong hệ thống.` : 'Thầy có thể thử xóa bớt từ khóa tìm kiếm hoặc bấm nút "➕ Thêm Học Sinh" ở góc trên.'}</p>
            ${this.classFilter !== 'all' ? `
              <button onclick="studentManagementPortal.filterClass('all')" class="btn btn-outline btn-sm font-bold text-xs mt-2">Xem lại tất cả các lớp</button>
            ` : ''}
          </div>
        ` : `
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th class="p-3 text-center w-12">STT</th>
                  <th class="p-3">Học Sinh</th>
                  <th class="p-3">Tài Khoản</th>
                  <th class="p-3 text-center">Lớp</th>
                  <th class="p-3 text-center">Khối</th>
                  <th class="p-3 text-center">Sao Vàng ⭐</th>
                  <th class="p-3 text-center">Trạng Thái</th>
                  <th class="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${list.map((st, idx) => {
                  const avatar = st.avatar || "👦";
                  const name = st.name || st.full_name || st.username;
                  const username = st.username;
                  const className = st.className || st.class_name || "3A";
                  const grade = st.grade || st.grade_level || 3;
                  const stars = st.stars || 0;
                  const isActive = st.isActive !== false;

                  return `
                    <tr class="hover:bg-blue-50/40 transition-colors group">
                      <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                      <td class="p-3 font-bold text-slate-900">
                        <div class="flex items-center gap-2.5">
                          <span class="text-2xl p-1 bg-white rounded-xl shadow-xs border border-slate-200">${avatar}</span>
                          <div>
                            <p class="font-black text-slate-900 text-xs">${name}</p>
                            <p class="text-[10px] text-slate-500 font-normal">${st.school || 'Trường Tiểu Học Vui Học'}</p>
                          </div>
                        </div>
                      </td>
                      <td class="p-3 font-mono font-bold text-slate-600">${username}</td>
                      <td class="p-3 text-center">
                        <span class="px-2.5 py-1 bg-blue-100 text-blue-800 font-black text-[11px] rounded-lg">${className}</span>
                      </td>
                      <td class="p-3 text-center font-bold text-slate-700">Lớp ${grade}</td>
                      <td class="p-3 text-center">
                        <span class="inline-flex items-center gap-1 font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                          <span>⭐</span> <span>${stars.toLocaleString()}</span>
                        </span>
                      </td>
                      <td class="p-3 text-center">
                        ${isActive ? `
                          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Hoạt động
                          </span>
                        ` : `
                          <span class="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Tạm khóa</span>
                        `}
                      </td>
                      <td class="p-3 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button onclick="studentManagementPortal.openRewardModal('${username}', '${name}', '${avatar}', ${stars}, '${className}')" class="btn btn-outline btn-xs font-black text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300 flex items-center gap-1" title="Tặng sao khen thưởng">
                            <span>⭐</span> <span>Tặng Sao</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  // 4. RENDER TAB 2: BẢNG XẾP HẠNG ĐẤU TRƯỜNG TIN HỌC
  renderLeaderboardHtml() {
    let list = [...this.leaderboardData];

    return `
      <div class="space-y-6">
        <!-- Bảng Vinh Danh Top 3 Cao Nhất -->
        ${list.length >= 3 ? `
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Hạng 2 Bạc -->
            <div class="glass-card p-5 text-center space-y-2 border-2 border-slate-300 bg-gradient-to-b from-slate-50 to-white order-2 md:order-1 relative overflow-hidden">
              <span class="text-3xl block">🥈</span>
              <span class="text-4xl block">${list[1].avatar || '🐱'}</span>
              <h4 class="font-black text-slate-900 text-sm leading-tight">${list[1].studentName}</h4>
              <p class="text-xs text-slate-500 font-bold">${list[1].studentClass} • Lớp ${list[1].grade}</p>
              <div class="p-2 bg-slate-100 rounded-xl text-slate-800 font-black text-xs">
                🎯 ${list[1].highestScore} Điểm • ⭐ ${list[1].totalStars} Sao
              </div>
            </div>

            <!-- Hạng 1 Vàng (Vinh Quang) -->
            <div class="glass-card p-6 text-center space-y-2 border-2 border-amber-400 bg-gradient-to-b from-amber-50 via-yellow-50/50 to-white order-1 md:order-2 shadow-xl ring-2 ring-amber-300 relative overflow-hidden scale-105">
              <div class="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white font-black text-[10px] rounded-full uppercase">QUÁN QUÂN</div>
              <span class="text-4xl block animate-bounce">🥇</span>
              <span class="text-5xl block">${list[0].avatar || '🚀'}</span>
              <h4 class="font-black text-amber-950 text-base leading-tight">${list[0].studentName}</h4>
              <p class="text-xs text-amber-800 font-bold">${list[0].studentClass} • Lớp ${list[0].grade}</p>
              <div class="p-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 rounded-xl font-black text-sm shadow-md">
                👑 ${list[0].highestScore} Điểm Kỷ Lục • ⭐ ${list[0].totalStars} Sao
              </div>
            </div>

            <!-- Hạng 3 Đồng -->
            <div class="glass-card p-5 text-center space-y-2 border-2 border-amber-700/40 bg-gradient-to-b from-amber-50/30 to-white order-3 relative overflow-hidden">
              <span class="text-3xl block">🥉</span>
              <span class="text-4xl block">${list[2].avatar || '🤖'}</span>
              <h4 class="font-black text-slate-900 text-sm leading-tight">${list[2].studentName}</h4>
              <p class="text-xs text-slate-500 font-bold">${list[2].studentClass} • Lớp ${list[2].grade}</p>
              <div class="p-2 bg-amber-100/60 rounded-xl text-amber-900 font-black text-xs">
                🎯 ${list[2].highestScore} Điểm • ⭐ ${list[2].totalStars} Sao
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Bảng Xếp Hạng Chi Tiết Toàn Bộ Học Sinh -->
        <div class="glass-card p-5 space-y-4">
          <div class="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">🏆</span>
              <h3 class="font-black text-slate-900 text-sm md:text-base">
                BẢNG XẾP HẠNG TOÀN DIỆN ĐẤU TRƯỜNG TIN HỌC ${this.classFilter !== 'all' ? `- LỚP ${this.classFilter}` : (this.gradeFilter !== 'all' ? `- KHỐI ${this.gradeFilter}` : '')} (${list.length} đấu thủ)
              </h3>
            </div>

            <!-- Bộ lọc thời gian & Đồng bộ nhanh -->
            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="studentManagementPortal.syncArenaData()" class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer">
                <span>🔄</span> <span>Đồng Bộ Điểm Số</span>
              </button>
              <span class="text-xs font-bold text-slate-500">Khung giờ:</span>
              <div class="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
                <button onclick="studentManagementPortal.filterTime('all')" class="px-3 py-1 rounded-lg text-xs font-bold ${this.timeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}">Tất Cả</button>
                <button onclick="studentManagementPortal.filterTime('today')" class="px-3 py-1 rounded-lg text-xs font-bold ${this.timeFilter === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}">Hôm Nay</button>
                <button onclick="studentManagementPortal.filterTime('week')" class="px-3 py-1 rounded-lg text-xs font-bold ${this.timeFilter === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}">Tuần Này</button>
                <button onclick="studentManagementPortal.filterTime('month')" class="px-3 py-1 rounded-lg text-xs font-bold ${this.timeFilter === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}">Tháng Này</button>
              </div>
            </div>
          </div>

          ${list.length === 0 ? `
            <div class="p-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span class="text-5xl block animate-bounce">⚡</span>
              <h4 class="font-black text-slate-700 text-base">Chưa có kết quả thi đấu ${this.classFilter !== 'all' ? `của Lớp ${this.classFilter}` : ''} trong khung thời gian này</h4>
              <p class="text-xs text-slate-500">Hãy khuyến khích các em học sinh vào mục "Đấu Trường Tin Học" để bắt đầu tranh tài giành Cúp Vàng!</p>
              ${this.classFilter !== 'all' ? `
                <button onclick="studentManagementPortal.filterClass('all')" class="btn btn-outline btn-sm font-bold text-xs mt-2">Xem bảng xếp hạng tất cả các lớp</button>
              ` : ''}
            </div>
          ` : `
            <div class="overflow-x-auto rounded-2xl border border-slate-200">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th class="p-3 text-center w-14">Hạng</th>
                    <th class="p-3">Học Sinh</th>
                    <th class="p-3 text-center">Lớp</th>
                    <th class="p-3 text-center">Điểm Kỷ Lục</th>
                    <th class="p-3 text-center">Tổng Sao ⭐</th>
                    <th class="p-3 text-center">Số Trận Đấu</th>
                    <th class="p-3 text-center">Thắng Hoàn Hảo</th>
                    <th class="p-3 text-center">Tốc Độ Kỷ Lục</th>
                    <th class="p-3 text-center">Danh Hiệu</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${list.map((st, idx) => {
                    const rank = idx + 1;
                    let rankBadge = `<span class="font-black text-slate-500 text-sm">#${rank}</span>`;
                    let rowBg = "hover:bg-amber-50/30";

                    if (rank === 1) {
                      rankBadge = `<span class="text-xl" title="Hạng 1 Quán Quân">🥇</span>`;
                      rowBg = "bg-amber-50/50 hover:bg-amber-100/50 font-bold";
                    } else if (rank === 2) {
                      rankBadge = `<span class="text-xl" title="Hạng 2">🥈</span>`;
                      rowBg = "bg-slate-50/50 hover:bg-slate-100/50";
                    } else if (rank === 3) {
                      rankBadge = `<span class="text-xl" title="Hạng 3">🥉</span>`;
                      rowBg = "bg-amber-50/20 hover:bg-amber-100/30";
                    }

                    const badgeTitle = rank === 1 ? "🥇 Đại Kiện Tướng Tin Học" : (rank <= 3 ? "🥈 Bậc Thầy Đấu Trường" : "⭐ Tân Binh Công Nghệ");

                    return `
                      <tr class="${rowBg} transition-colors">
                        <td class="p-3 text-center">${rankBadge}</td>
                        <td class="p-3 font-bold text-slate-900">
                          <div class="flex items-center gap-2">
                            <span class="text-xl">${st.avatar || '🤖'}</span>
                            <span class="font-black text-slate-900">${st.studentName}</span>
                          </div>
                        </td>
                        <td class="p-3 text-center">
                          <span class="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded">${st.studentClass}</span>
                        </td>
                        <td class="p-3 text-center">
                          <span class="font-black text-emerald-700 text-xs px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                            ${st.highestScore} đ
                          </span>
                        </td>
                        <td class="p-3 text-center font-black text-amber-600">
                          +${st.totalStars} ⭐
                        </td>
                        <td class="p-3 text-center font-bold text-slate-700">
                          ${st.matchesPlayed} trận
                        </td>
                        <td class="p-3 text-center font-bold text-indigo-700">
                          ${st.perfectWins || 0} trận 💯
                        </td>
                        <td class="p-3 text-center font-mono font-bold text-slate-500">
                          ${st.bestDuration ? `${st.bestDuration}s` : '--'}
                        </td>
                        <td class="p-3 text-center">
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${rank <= 3 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600'}">
                            ${badgeTitle}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Dòng Thời Gian Trận Đấu Gần Đây (Live Feed) -->
        ${this.recentMatches.length > 0 ? `
          <div class="glass-card p-5 space-y-3">
            <h4 class="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <span>⚡</span> <span>CÁC TRẬN THI ĐẤU ĐẤU TRƯỜNG VỪA DIỄN RA</span>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${this.recentMatches.map(m => `
                <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">${m.avatar || '🤖'}</span>
                    <div>
                      <p class="font-black text-slate-900">${m.studentName} <span class="text-blue-700 font-bold">(${m.studentClass})</span></p>
                      <p class="text-[10px] text-slate-500">${m.totalCorrect}/${m.totalQuestions} câu đúng • Tốc độ: ${m.durationSeconds}s</p>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="font-black text-emerald-600 text-xs block">${m.score} điểm</span>
                    <span class="text-[10px] text-amber-600 font-bold">+${m.starsEarned || 0} ⭐</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 5. CÁC HÀM XỬ LÝ SỰ KIỆN (EVENT HANDLERS)
  async switchTab(tab) {
    this.currentTab = tab;
    await this.render();
  }

  async filterGrade(grade) {
    this.gradeFilter = grade === "all" ? "all" : parseInt(grade, 10);
    // Nếu khối lớp thay đổi mà lớp đang lọc không thuộc khối đó thì đặt lại classFilter = 'all'
    if (this.gradeFilter !== "all" && this.classFilter !== "all") {
      const classGrade = parseInt(this.classFilter.charAt(0), 10);
      if (classGrade !== this.gradeFilter) {
        this.classFilter = "all";
      }
    }
    await this.render();
  }

  async filterClass(className) {
    this.classFilter = className;
    // Nếu chọn lớp cụ thể, tự động đồng bộ khối lớp
    if (className !== "all") {
      const g = parseInt(className.charAt(0), 10);
      if (!isNaN(g) && (g === 3 || g === 4 || g === 5)) {
        this.gradeFilter = g;
      }
    }
    await this.render();
    if (className !== "all") {
      window.app?.showToast(`🔍 Đang hiển thị học sinh Lớp ${className}`, "info");
    } else {
      window.app?.showToast(`🔍 Đang hiển thị tất cả các lớp`, "info");
    }
  }

  async filterTime(time) {
    this.timeFilter = time;
    await this.render();
  }

  handleSearch(query) {
    this.searchQuery = query;
    const content = document.getElementById("student-portal-tab-content");
    if (content && this.currentTab === "list") {
      content.innerHTML = this.renderStudentsListHtml();
    }
  }

  // Mở modal tặng sao
  openRewardModal(username, name, avatar, currentStars, className) {
    this.selectedStudentForReward = { username, name, avatar, currentStars, className };
    const modal = document.getElementById("modal-award-stars");
    if (!modal) return;

    document.getElementById("reward-student-avatar").innerText = avatar;
    document.getElementById("reward-student-name").innerText = name;
    document.getElementById("reward-student-info").innerText = `Lớp ${className} • Hiện có: ${currentStars} ⭐`;
    document.getElementById("reward-stars-amount").value = 20;
    document.getElementById("reward-stars-reason").value = "Tích cực tham gia và trả lời xuất sắc bài học Tin học";

    modal.classList.remove("hidden");
  }

  closeRewardModal() {
    const modal = document.getElementById("modal-award-stars");
    if (modal) modal.classList.add("hidden");
    this.selectedStudentForReward = null;
  }

  async confirmAwardStars() {
    if (!this.selectedStudentForReward) return;
    const amount = parseInt(document.getElementById("reward-stars-amount").value, 10) || 10;
    const reason = document.getElementById("reward-stars-reason").value.trim() || "Khen thưởng học tập";
    const { username, name } = this.selectedStudentForReward;

    // 1. Cập nhật LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || window.MOCK_DATABASE || {};
    if (db.users) {
      const u = db.users.find(x => x.username === username);
      if (u) {
        u.stars = (u.stars || 0) + amount;
        localStorage.setItem("app_mock_db", JSON.stringify(db));
      }
    }

    // 2. Cập nhật Supabase nếu có
    if (window.authService?.awardStarsToStudent) {
      await window.authService.awardStarsToStudent(name, amount, reason);
    }

    this.closeRewardModal();
    window.app.showToast(`⭐ Đã trao tặng +${amount} Sao Vàng cho học sinh "${name}" thành công!`, "success");
    this.render();
  }

  // Mở modal tạo học sinh mới
  openAddStudentModal() {
    const modal = document.getElementById("modal-add-student");
    if (!modal) return;
    document.getElementById("new-std-fullname").value = "";
    document.getElementById("new-std-username").value = "";
    document.getElementById("new-std-password").value = "123456";
    document.getElementById("new-std-grade").value = "3";
    document.getElementById("new-std-class").value = "3A";
    modal.classList.remove("hidden");
  }

  closeAddStudentModal() {
    const modal = document.getElementById("modal-add-student");
    if (modal) modal.classList.add("hidden");
  }

  updateClassSelect(grade) {
    const classInput = document.getElementById("new-std-class");
    if (classInput) {
      classInput.value = `${grade}A`;
    }
  }

  async submitAddStudent() {
    const fullName = document.getElementById("new-std-fullname").value.trim();
    const username = document.getElementById("new-std-username").value.trim();
    const password = document.getElementById("new-std-password").value.trim();
    const gradeLevel = parseInt(document.getElementById("new-std-grade").value, 10) || 3;
    const className = document.getElementById("new-std-class").value.trim() || `${gradeLevel}A`;
    const schoolName = document.getElementById("new-std-school").value.trim() || "Trường Tiểu Học Vui Học";

    if (!fullName || !username || !password) {
      window.app.showToast("Vui lòng điền đầy đủ Họ tên, Tên đăng nhập và Mật khẩu!", "warning");
      return;
    }

    if (password.length < 6) {
      window.app.showToast("Mật khẩu phải từ 6 ký tự trở lên!", "warning");
      return;
    }

    const res = await window.authService.register({
      username,
      password,
      fullName,
      role: "student",
      schoolName,
      className,
      gradeLevel
    });

    if (res.success) {
      this.closeAddStudentModal();
      window.app.showToast(`🎉 Đã cấp tài khoản học sinh "${fullName}" (${username}) thành công!`, "success");
      this.render();
    } else {
      window.app.showToast(`⚠️ Không thể tạo tài khoản: ${res.error}`, "danger");
    }
  }

  // 6. ĐỒNG BỘ ĐIỂM SỐ & HỌC SINH THAM GIA ĐẤU TRƯỜNG
  async syncArenaData() {
    const syncIcons = document.querySelectorAll("#sync-icon");
    syncIcons.forEach(icon => icon.classList.add("animate-spin"));

    if (window.app?.showToast) {
      window.app.showToast("🔄 Đang đồng bộ danh sách học sinh và điểm số Đấu Trường...", "info");
    }

    try {
      if (window.arenaService?.syncArenaWithStudents) {
        await window.arenaService.syncArenaWithStudents(true);
      }
      await this.loadData();
      await this.render();
      
      if (window.app?.showToast) {
        window.app.showToast(`🎉 Đã đồng bộ thành công kết quả thi đấu Đấu Trường cho ${this.leaderboardData.length} học sinh!`, "success");
      }
    } catch (err) {
      console.error("Lỗi đồng bộ đấu trường:", err);
      if (window.app?.showToast) {
        window.app.showToast("⚠️ Có lỗi khi đồng bộ, đã khôi phục dữ liệu gần nhất.", "warning");
      }
    } finally {
      syncIcons.forEach(icon => icon.classList.remove("animate-spin"));
    }
  }

  // Xuất file Excel danh sách học sinh (có hỗ trợ xuất theo lớp đang lọc)
  exportExcel() {
    if (!window.XLSX) {
      window.app?.showToast("Đang tải thư viện Excel, vui lòng thử lại sau giây lát!", "warning");
      return;
    }

    let exportList = [...this.studentsList];
    if (this.gradeFilter !== "all") {
      exportList = exportList.filter(s => (s.grade || s.grade_level) === parseInt(this.gradeFilter));
    }
    if (this.classFilter !== "all") {
      exportList = exportList.filter(s => (s.className || s.class_name) === this.classFilter);
    }

    const data = exportList.map((st, idx) => ({
      "STT": idx + 1,
      "Họ và Tên": st.name || st.full_name,
      "Tên Đăng Nhập": st.username,
      "Lớp": st.className || st.class_name || "3A",
      "Khối Lớp": st.grade || st.grade_level || 3,
      "Trường Học": st.school || st.school_name || "Trường Tiểu Học",
      "Sao Vàng ⭐": st.stars || 0,
      "Trạng Thái": st.isActive !== false ? "Đang hoạt động" : "Tạm khóa"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    const sheetName = this.classFilter !== "all" ? `Lop_${this.classFilter}` : "DanhSachHocSinh";
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = this.classFilter !== "all"
      ? `Danh_Sach_Hoc_Sinh_Lop_${this.classFilter}_${dateStr}.xlsx`
      : `Danh_Sach_Hoc_Sinh_TinHoc_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    window.app?.showToast(`📊 Đã xuất file Excel ${this.classFilter !== "all" ? `Lớp ${this.classFilter}` : "toàn trường"} (${exportList.length} học sinh) thành công!`, "success");
  }
}

window.studentManagementPortal = new StudentManagementPortal();
