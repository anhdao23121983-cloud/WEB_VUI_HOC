/**
 * TEACHER PORTAL COMPONENT
 * Không gian làm việc cho Giáo viên & Quản trị: Quản lý SGK, Soạn giáo án CV 2345, Soạn câu hỏi trắc nghiệm & Phân quyền
 */

class TeacherPortal {
  constructor() {
    this.selectedGrade = 3;
    this.selectedBook = "KNTT";
  }

  async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = window.authService?.getUser();
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      if (window.app?.showToast) window.app.showToast("🚫 Quyền truy cập bị từ chối! Mục này dành riêng cho Giáo viên và Quản trị viên.", "error");
      window.location.hash = "student";
      return;
    }

    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const plans = await window.supabaseService.getLessonPlans();
    const leaderboard = db.leaderboard || [];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Banner Chào Mừng Giáo Viên / Quản Trị Viên -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="badge badge-amber font-bold">👩‍🏫 KHÔNG GIAN DÀNH CHO GIÁO VIÊN</span>
              ${user.role === 'admin' ? '<span class="badge bg-purple-500 text-white font-black">👑 QUẢN TRỊ VIÊN TỐI CAO</span>' : ''}
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">XIN CHÀO ${user.name.toUpperCase()}</h2>
            <p class="text-cyan-100 text-sm">${user.school || "Trường Tiểu Học Vui Học"} | Quản Lý Kế Hoạch Bài Dạy CV 2345, Ngân Hàng Câu Hỏi & Phân Quyền</p>
          </div>
          <div class="flex items-center gap-2.5 flex-wrap">
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
            <span class="text-3xl p-3 bg-purple-100 text-purple-700 rounded-2xl">🛡️</span>
            <div>
              <p class="text-xs text-slate-500 font-bold">VAI TRÒ CỦA BẠN</p>
              <h4 class="text-sm font-black text-purple-700 uppercase">${user.role === 'admin' ? '👑 Quản Trị Viên' : '👨‍🏫 Giáo Viên'}</h4>
            </div>
          </div>
        </div>

        <!-- Khu vực Tab Quản lý -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 flex-wrap gap-3">
            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="teacherPortal.switchTab('plans')" id="tab-btn-plans" class="btn btn-primary btn-sm">📋 Kế Hoạch Bài Dạy (CV 2345)</button>
              <button onclick="teacherPortal.switchTab('curriculum')" id="tab-btn-curriculum" class="btn btn-outline btn-sm">📖 Khung SGK & Soạn Câu Hỏi</button>
              <button onclick="teacherPortal.switchTab('scores')" id="tab-btn-scores" class="btn btn-outline btn-sm">🏆 Bảng Điểm & Học Sinh</button>
              <button onclick="teacherPortal.switchTab('admin')" id="tab-btn-admin" class="btn btn-outline btn-sm text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200">🛡️ Quản Trị & Phân Quyền</button>
            </div>
            <div class="flex items-center gap-2" id="grade-filter-container">
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

          <!-- Nội dung Tab 2: Khung SGK & Soạn Câu Hỏi -->
          <div id="teacher-tab-curriculum" class="hidden space-y-4">
            ${this.renderCurriculumOverview()}
          </div>

          <!-- Nội dung Tab 3: Bảng Điểm -->
          <div id="teacher-tab-scores" class="hidden space-y-4">
            ${this.renderScoresTable(leaderboard)}
          </div>

          <!-- Nội dung Tab 4: Quản Trị & Phân Quyền -->
          <div id="teacher-tab-admin" class="hidden space-y-4"></div>
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

    const currentUser = window.authService?.getUser();

    return `
      <div class="grid grid-cols-1 gap-4">
        ${plans.map(plan => {
          const isAuthorOrAdmin = currentUser && (
            currentUser.role === "admin" ||
            plan.authorId === currentUser.id ||
            plan.authorUsername === currentUser.username ||
            (!plan.authorUsername && currentUser.role === "teacher")
          );

          return `
          <div class="p-5 bg-white rounded-xl border border-slate-200 hover:border-cyan-500 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="badge badge-cyan font-bold">Lớp ${plan.grade}</span>
                <span class="badge badge-slate font-bold">Môn ${plan.subject || "Tin học"}</span>
                <span class="text-xs text-slate-400">Thời lượng: ${plan.duration || "2 tiết"}</span>
                ${isAuthorOrAdmin ? '<span class="badge badge-emerald font-bold text-[10px]">✏️ Bài của tôi</span>' : '<span class="badge badge-slate font-bold text-[10px]">🔒 Chỉ đọc</span>'}
              </div>
              <h4 class="text-lg font-bold text-slate-900">${plan.title}</h4>
              <p class="text-xs text-slate-600">Tác giả: <b>${plan.teacherName || "Cô Anh Đào"}</b> (${plan.authorUsername || "anhdao"}) | Đã lưu: ${plan.createdAt ? new Date(plan.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}</p>
            </div>
            
            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="teacherPortal.openQuizModalForPlan(${plan.grade}, '${plan.lessonId || plan.id}', '${plan.title}')" class="btn btn-amber btn-sm font-bold shadow-sm">
                ❓ Soạn Câu Hỏi
              </button>
              <button onclick="teacherPortal.previewPlan('${plan.id}')" class="btn btn-outline btn-sm">👁️ Xem Chi Tiết</button>
              <button onclick="teacherPortal.exportPlanWord('${plan.id}')" class="btn btn-primary btn-sm font-bold">📄 Xuất Word (.doc)</button>
              ${isAuthorOrAdmin ? `<button onclick="teacherPortal.deletePlan('${plan.id}')" class="btn btn-outline btn-sm text-rose-600 hover:bg-rose-50 border-rose-200">🗑️ Xóa</button>` : ''}
            </div>
          </div>
        `;
        }).join("")}
      </div>
    `;
  }

  // Render Khung SGK & Tích Hợp Nút Soạn Câu Hỏi Cho Từng Bài
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
                    <div class="space-y-2">
                      ${t.lessons.map(l => `
                        <div class="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1.5">
                          <span class="font-bold text-slate-800">• Bài ${l.number}: ${l.title}</span>
                          <div class="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <button onclick="teacherPortal.openQuizModalForPlan(${g}, '${l.id}', '${l.title}', '${t.name}')" class="text-amber-600 font-extrabold text-[11px] hover:underline flex items-center gap-1">
                              <span>❓ Soạn Trắc Nghiệm</span>
                            </button>
                            <button onclick="teacherPortal.quickPlanFromLesson(${g}, '${l.title}', '${t.name}')" class="text-cyan-600 font-bold text-[11px] hover:underline flex items-center gap-1">
                              <span>Soạn 2345 🪄</span>
                            </button>
                          </div>
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
    ['plans', 'curriculum', 'scores', 'admin'].forEach(t => {
      const content = document.getElementById(`teacher-tab-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (content && btn) {
        if (t === tabName) {
          content.classList.remove("hidden");
          btn.className = t === 'admin' ? 'btn btn-primary btn-sm font-bold bg-purple-700 border-purple-700' : 'btn btn-primary btn-sm font-bold';
          if (t === 'admin') {
            window.adminPortal.render("teacher-tab-admin");
          }
        } else {
          content.classList.add("hidden");
          btn.className = t === 'admin' ? 'btn btn-outline btn-sm text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200' : 'btn btn-outline btn-sm';
        }
      }
    });
  }

  // Mở modal soạn câu hỏi
  openQuizModalForPlan(grade, lessonId, lessonTitle, topicName = "") {
    if (window.quizAuthorModal) {
      window.quizAuthorModal.openModal(grade, lessonId, lessonTitle, topicName);
    }
  }

  // Mở modal tạo giáo án mới
  openCreatePlanModal() {
    if (window.lessonPlannerModal) {
      window.lessonPlannerModal.openModal();
    }
  }

  // Soạn nhanh giáo án từ bài học SGK
  quickPlanFromLesson(grade, lessonTitle, topicName) {
    if (window.lessonPlannerModal) {
      window.lessonPlannerModal.openModalWithPreset(grade, lessonTitle, topicName);
    }
  }

  // Xem chi tiết giáo án
  async previewPlan(planId) {
    const plans = await window.supabaseService.getLessonPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const modal = document.getElementById("plan-preview-modal");
    const content = document.getElementById("plan-preview-content");
    if (modal && content) {
      content.innerHTML = `
        <div class="space-y-4 text-slate-800">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span class="badge badge-emerald font-bold">Chuẩn Công Văn 2345/BGDĐT</span>
              <h3 class="text-xl font-black text-slate-900 mt-1">${plan.title}</h3>
            </div>
            <button onclick="document.getElementById('plan-preview-modal').classList.remove('active')" class="text-slate-400 text-2xl font-bold">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
            <div><b>Môn học:</b> ${plan.subject || "Tin học"}</div>
            <div><b>Khối lớp:</b> Lớp ${plan.grade}</div>
            <div><b>Thời lượng:</b> ${plan.duration || "2 tiết"}</div>
            <div><b>Giáo viên:</b> ${plan.teacherName || "Cô Anh Đào"}</div>
          </div>

          <div class="space-y-3 text-xs max-h-96 overflow-y-auto pr-2">
            <div>
              <h4 class="font-extrabold text-slate-900 text-sm mb-1 text-cyan-800">I. YÊU CẦU CẦN ĐẠT</h4>
              <p><b>1. Năng lực chung:</b> ${plan.objectives?.competencies?.general || "Tự chủ, tự học, giao tiếp hợp tác."}</p>
              <p class="mt-1"><b>2. Năng lực đặc thù:</b> ${plan.objectives?.competencies?.specific || "Năng lực tin học cơ bản."}</p>
              <p class="mt-1"><b>3. Phẩm chất:</b> ${plan.objectives?.qualities || "Chăm chỉ, trách nhiệm."}</p>
            </div>

            <div>
              <h4 class="font-extrabold text-slate-900 text-sm mb-1 text-cyan-800">II. ĐỒ DÙNG DẠY HỌC</h4>
              <p><b>- Giáo viên:</b> ${plan.equipment?.teacher || "Máy tính, máy chiếu, bài giảng."}</p>
              <p><b>- Học sinh:</b> ${plan.equipment?.student || "SGK, vở ghi."}</p>
            </div>

            <div>
              <h4 class="font-extrabold text-slate-900 text-sm mb-1 text-cyan-800">III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN 2345)</h4>
              <div class="space-y-2">
                ${(plan.activities || []).map(act => `
                  <div class="p-3 bg-white rounded-lg border border-slate-200">
                    <p class="font-bold text-slate-800 text-xs">${act.name || `Hoạt động ${act.step}`}</p>
                    <p class="text-slate-600 mt-1"><b>Nội dung:</b> ${act.content}</p>
                    <p class="text-slate-600 mt-0.5"><b>Tổ chức thực hiện:</b> ${act.organization}</p>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button onclick="teacherPortal.exportPlanWord('${plan.id}')" class="btn btn-primary btn-sm font-bold">📄 Xuất File Word (.doc)</button>
            <button onclick="document.getElementById('plan-preview-modal').classList.remove('active')" class="btn btn-outline btn-sm">Đóng</button>
          </div>
        </div>
      `;
      modal.classList.add("active");
    }
  }

  // Xuất file Word
  async exportPlanWord(planId) {
    const plans = await window.supabaseService.getLessonPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    window.docExportService.exportToWord(plan);
    window.app.showToast("📄 Đã xuất kế hoạch bài dạy chuẩn Word .doc!", "success");
  }

  // Xóa giáo án
  async deletePlan(planId) {
    const user = window.authService?.getUser();
    const plans = await window.supabaseService.getLessonPlans();
    const plan = plans.find(p => p.id === planId);

    if (plan && user) {
      const isAuthorOrAdmin = user.role === "admin" || plan.authorId === user.id || plan.authorUsername === user.username || !plan.authorUsername;
      if (!isAuthorOrAdmin) {
        window.app?.showToast("🚫 Thầy/Cô chỉ có thể xóa Kế hoạch bài dạy do chính mình tạo ra!", "error");
        return;
      }
    }

    if (!confirm("Thầy Cô có chắc chắn muốn xóa kế hoạch bài dạy này không?")) return;
    await window.supabaseService.deleteLessonPlan(planId);
    window.app.showToast("🗑️ Đã xóa giáo án thành công!", "info");
    this.render("main-content-area");
  }

  // Mở modal cấu hình Database & AI
  openSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (modal) modal.classList.add("active");
  }

  // Lọc theo khối
  filterByGrade(grade) {
    this.selectedGrade = grade === "all" ? "all" : parseInt(grade);
    this.render("main-content-area");
  }
}

window.teacherPortal = new TeacherPortal();
