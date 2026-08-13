/**
 * TEACHER PORTAL COMPONENT
 * Không gian làm việc cho Giáo viên: Quản lý SGK, Soạn giáo án CV 2345, Theo dõi điểm học sinh
 */

class TeacherPortal {
  constructor() {
    this.selectedGrade = 3;
    this.selectedBook = "KNTT";
  }

  async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = window.authService?.getUser() || { name: "Thầy Giáo Anh Đào", school: "Trường Tiểu Học" };
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const plans = await window.supabaseService.getLessonPlans();
    const leaderboard = db.leaderboard || [];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Banner Chào Mừng Giáo Viên -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-1">
            <span class="badge badge-amber font-bold">👩‍🏫 KHÔNG GIAN DÀNH CHO GIÁO VIÊN</span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">XIN CHÀO ${user.name.toUpperCase()}</h2>
            <p class="text-cyan-100 text-sm">${user.school} | Hệ thống Soạn Kế Hoạch Bài Dạy Chuẩn Công Văn 2345 & Tích Hợp AI</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="teacherPortal.openCreatePlanModal()" class="btn btn-emerald btn-lg font-bold shadow-lg">
              <span>✨ Soạn Giáo Án Mới (CV 2345)</span>
            </button>
            <button onclick="teacherPortal.openSettingsModal()" class="btn btn-outline btn-lg font-bold">
              <span>⚙️ Cài Đặt API & DB</span>
            </button>
          </div>
        </div>

        <!-- Thống Kê Nhanh (Stats Cards) -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="glass-card p-4 flex items-center gap-4">
            <span class="text-3xl p-3 bg-cyan-100 text-cyan-700 rounded-2xl">📝</span>
            <div>
              <p class="text-xs text-slate-500 font-bold">GIÁO ÁN ĐÃ LƯU</p>
              <h4 class="text-2xl font-black text-slate-800">${plans.length} bài</h4>
            </div>
          </div>
          <div class="glass-card p-4 flex items-center gap-4">
            <span class="text-3xl p-3 bg-emerald-100 text-emerald-700 rounded-2xl">📚</span>
            <div>
              <p class="text-xs text-slate-500 font-bold">KHỐI LỚP QUẢN LÝ</p>
              <h4 class="text-2xl font-black text-slate-800">Lớp 3, 4, 5</h4>
            </div>
          </div>
          <div class="glass-card p-4 flex items-center gap-4">
            <span class="text-3xl p-3 bg-amber-100 text-amber-700 rounded-2xl">⭐</span>
            <div>
              <p class="text-xs text-slate-500 font-bold">TỔNG SAO HỌC SINH</p>
              <h4 class="text-2xl font-black text-slate-800">${leaderboard.reduce((acc, cur) => acc + (cur.stars || 0), 0)} ⭐</h4>
            </div>
          </div>
          <div class="glass-card p-4 flex items-center gap-4">
            <span class="text-3xl p-3 bg-blue-100 text-blue-700 rounded-2xl">🛡️</span>
            <div>
              <p class="text-xs text-slate-500 font-bold">TRẠNG THÁI DB</p>
              <h4 class="text-sm font-black text-emerald-600 flex items-center gap-1">● Sẵn Sàng (Dual-Mode)</h4>
            </div>
          </div>
        </div>

        <!-- Khu vực Tab Quản lý -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div class="flex items-center gap-2">
              <button onclick="teacherPortal.switchTab('plans')" id="tab-btn-plans" class="btn btn-primary btn-sm">📋 Danh Sách Giáo Án (CV 2345)</button>
              <button onclick="teacherPortal.switchTab('curriculum')" id="tab-btn-curriculum" class="btn btn-outline btn-sm">📖 Khung SGK Tin Học 3-5</button>
              <button onclick="teacherPortal.switchTab('scores')" id="tab-btn-scores" class="btn btn-outline btn-sm">🏆 Bảng Điểm & Học Sinh</button>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-500">Lọc Khối Lớp:</span>
              <select id="teacher-grade-filter" onchange="teacherPortal.filterByGrade(this.value)" class="form-control text-xs font-bold py-1 px-3 w-32">
                <option value="all">Tất cả Khối</option>
                <option value="3" ${this.selectedGrade === 3 ? "selected" : ""}>Lớp 3</option>
                <option value="4" ${this.selectedGrade === 4 ? "selected" : ""}>Lớp 4</option>
                <option value="5" ${this.selectedGrade === 5 ? "selected" : ""}>Lớp 5</option>
              </select>
            </div>
          </div>

          <!-- Nội dung Tab 1: Danh sách Giáo án -->
          <div id="teacher-tab-plans" class="space-y-4">
            ${this.renderPlansList(plans)}
          </div>

          <!-- Nội dung Tab 2: Khung SGK -->
          <div id="teacher-tab-curriculum" class="hidden space-y-4">
            ${this.renderCurriculumOverview()}
          </div>

          <!-- Nội dung Tab 3: Bảng Điểm -->
          <div id="teacher-tab-scores" class="hidden space-y-4">
            ${this.renderScoresTable(leaderboard)}
          </div>
        </div>
      </div>
    `;
  }

  // Render Danh sách Giáo án
  renderPlansList(plans) {
    if (!plans || plans.length === 0) {
      return `
        <div class="text-center py-12 text-slate-500">
          <span class="text-5xl block mb-2">📂</span>
          <p class="font-bold">Chưa có kế hoạch bài dạy nào được lưu.</p>
          <button onclick="teacherPortal.openCreatePlanModal()" class="btn btn-primary btn-sm mt-3">✨ Soạn Giáo Án Đầu Tiên Bằng AI</button>
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-1 gap-4">
        ${plans.map(plan => `
          <div class="p-5 bg-white rounded-xl border border-slate-200 hover:border-cyan-500 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="badge badge-cyan font-bold">Lớp ${plan.grade}</span>
                <span class="badge badge-slate font-bold">Môn ${plan.subject || "Tin học"}</span>
                <span class="text-xs text-slate-400">Thời lượng: ${plan.duration || "2 tiết"}</span>
              </div>
              <h4 class="text-lg font-bold text-slate-900">${plan.title}</h4>
              <p class="text-xs text-slate-600">Giáo viên: <b>${plan.teacherName || "Thầy Anh Đào"}</b> | Đã lưu: ${plan.createdAt ? new Date(plan.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}</p>
            </div>
            
            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="teacherPortal.previewPlan('${plan.id}')" class="btn btn-outline btn-sm">👁️ Xem Chi Tiết</button>
              <button onclick="teacherPortal.exportPlanWord('${plan.id}')" class="btn btn-primary btn-sm">📄 Xuất Word (.doc)</button>
              <button onclick="teacherPortal.deletePlan('${plan.id}')" class="btn btn-outline btn-sm text-rose-600 hover:bg-rose-50 border-rose-200">🗑️ Xóa</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // Render Khung SGK
  renderCurriculumOverview() {
    const grades = [3, 4, 5];
    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${grades.map(g => {
          const data = CURRICULUM_DATA[g];
          return `
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-extrabold text-slate-800 text-lg">📘 TIN HỌC LỚP ${g}</h4>
                <span class="badge badge-emerald font-bold">${data.topics.length} Chủ đề</span>
              </div>
              <div class="space-y-3">
                ${data.topics.map(t => `
                  <div class="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                    <p class="font-bold text-cyan-800 mb-1">${t.name}</p>
                    <p class="text-slate-500 mb-2">${t.description}</p>
                    <div class="space-y-1">
                      ${t.lessons.map(l => `
                        <div class="flex items-center justify-between text-slate-700">
                          <span>• Bài ${l.number}: ${l.title}</span>
                          <button onclick="teacherPortal.quickPlanFromLesson(${g}, '${l.title}', '${t.name}')" class="text-cyan-600 font-bold hover:underline">Soạn 2345 🪄</button>
                        </div>
                      `).join("")}
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // Render Bảng Điểm Học Sinh
  renderScoresTable(leaderboard) {
    return `
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-100 text-slate-700 border-b border-slate-200">
              <th class="p-3 font-extrabold">Hạng</th>
              <th class="p-3 font-extrabold">Học Sinh</th>
              <th class="p-3 font-extrabold">Lớp</th>
              <th class="p-3 font-extrabold">Số Sao Đạt Được</th>
              <th class="p-3 font-extrabold">Danh Hiệu</th>
            </tr>
          </thead>
          <tbody>
            ${leaderboard.map(item => `
              <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="p-3 font-bold text-cyan-700">#${item.rank}</td>
                <td class="p-3 font-bold text-slate-900 flex items-center gap-2">
                  <span class="text-lg">${item.avatar}</span>
                  <span>${item.name}</span>
                </td>
                <td class="p-3 font-semibold text-slate-600">${item.class}</td>
                <td class="p-3 font-black text-amber-600">${item.stars} ⭐</td>
                <td class="p-3"><span class="badge badge-amber font-bold">${item.badge}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // Chuyển đổi Tab
  switchTab(tabName) {
    ['plans', 'curriculum', 'scores'].forEach(t => {
      const content = document.getElementById(`teacher-tab-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (content && btn) {
        if (t === tabName) {
          content.classList.remove("hidden");
          btn.className = "btn btn-primary btn-sm";
        } else {
          content.classList.add("hidden");
          btn.className = "btn btn-outline btn-sm";
        }
      }
    });
  }

  // Mở Modal Soạn Kế Hoạch Bài Dạy
  openCreatePlanModal() {
    const modal = document.getElementById("lesson-planner-modal");
    if (modal) modal.classList.add("active");
  }

  // Soạn nhanh từ bài học SGK
  quickPlanFromLesson(grade, lessonTitle, topicName) {
    this.openCreatePlanModal();
    const titleInput = document.getElementById("plan-input-title");
    const gradeSelect = document.getElementById("plan-input-grade");
    if (titleInput) titleInput.value = lessonTitle;
    if (gradeSelect) gradeSelect.value = grade;
    
    // Kích hoạt nút AI sinh ngay
    if (window.lessonPlannerModal) {
      window.lessonPlannerModal.generateWithAI();
    }
  }

  // Xuất file Word
  exportPlanWord(planId) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const plan = (db.lessonPlans || []).find(p => p.id === planId);
    if (plan) {
      window.docExportService?.exportToWord(plan);
      if (window.app) window.app.showToast("📄 Đang tải xuống file Word Kế hoạch bài dạy!", "success");
    }
  }

  // Xem chi tiết giáo án
  previewPlan(planId) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const plan = (db.lessonPlans || []).find(p => p.id === planId);
    if (!plan) return;

    const modal = document.getElementById("plan-preview-modal");
    const content = document.getElementById("plan-preview-content");
    if (modal && content) {
      content.innerHTML = `
        <div class="space-y-4 text-slate-800">
          <div class="text-center pb-4 border-b border-slate-200">
            <span class="badge badge-cyan font-bold mb-2">LỚP ${plan.grade} - ${plan.subject || "Tin học"}</span>
            <h3 class="text-2xl font-black text-slate-900">${plan.title}</h3>
            <p class="text-xs text-slate-500 mt-1">Giáo viên: <b>${plan.teacherName || "Thầy Anh Đào"}</b> | Thời lượng: ${plan.duration || "2 tiết"}</p>
          </div>

          <div>
            <h4 class="font-bold text-cyan-800 text-base">I. YÊU CẦU CẦN ĐẠT</h4>
            <p class="text-xs font-semibold text-slate-700 mt-1"><b>1. Năng lực chung:</b> ${(plan.objectives?.competencies?.general || "").replace(/\n/g, "<br>")}</p>
            <p class="text-xs font-semibold text-slate-700 mt-1"><b>2. Năng lực đặc thù:</b> ${(plan.objectives?.competencies?.specific || "").replace(/\n/g, "<br>")}</p>
            <p class="text-xs font-semibold text-slate-700 mt-1"><b>3. Phẩm chất:</b> ${(plan.objectives?.qualities || "").replace(/\n/g, "<br>")}</p>
          </div>

          <div>
            <h4 class="font-bold text-cyan-800 text-base">II. ĐỒ DÙNG DẠY HỌC</h4>
            <p class="text-xs text-slate-700"><b>• Giáo viên:</b> ${plan.equipment?.teacher || "Máy tính, bài giảng điện tử."}</p>
            <p class="text-xs text-slate-700"><b>• Học sinh:</b> ${plan.equipment?.student || "SGK, vở ghi."}</p>
          </div>

          <div>
            <h4 class="font-bold text-cyan-800 text-base">III. TIẾN TRÌNH DẠY HỌC</h4>
            <div class="space-y-3 mt-2">
              ${(plan.activities || []).map(a => `
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <p class="font-bold text-slate-900">${a.name}</p>
                  <p class="text-slate-600 mt-1"><b>Mục tiêu:</b> ${a.objective}</p>
                  <p class="text-slate-600"><b>Nội dung:</b> ${a.content}</p>
                  <p class="text-slate-600"><b>Tổ chức:</b> ${a.organization}</p>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button onclick="teacherPortal.exportPlanWord('${plan.id}')" class="btn btn-primary btn-sm">📄 Xuất File Word</button>
            <button onclick="document.getElementById('plan-preview-modal').classList.remove('active')" class="btn btn-outline btn-sm">Đóng</button>
          </div>
        </div>
      `;
      modal.classList.add("active");
    }
  }

  // Xóa giáo án
  deletePlan(planId) {
    if (confirm("Thầy có chắc chắn muốn xóa giáo án này không?")) {
      window.supabaseService?.deleteLessonPlan(planId);
      this.render("main-content-area");
      if (window.app) window.app.showToast("🗑️ Đã xóa kế hoạch bài dạy thành công!", "info");
    }
  }

  // Mở Cài đặt API & Database
  openSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (modal) {
      const sbUrl = document.getElementById("settings-sb-url");
      const sbKey = document.getElementById("settings-sb-key");
      const aiKey = document.getElementById("settings-ai-key");
      if (sbUrl) sbUrl.value = localStorage.getItem("sb_url") || "";
      if (sbKey) sbKey.value = localStorage.getItem("sb_anon_key") || "";
      if (aiKey) aiKey.value = localStorage.getItem("gemini_api_key") || "";
      modal.classList.add("active");
    }
  }
}

window.teacherPortal = new TeacherPortal();
