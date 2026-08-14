/**
 * EXAM PORTAL COMPONENT
 * Quản lý Menu KIỂM TRA & ĐÁNH GIÁ ĐỊNH KỲ:
 * Tải lên, Chỉnh sửa/Đổi file, Xóa bỏ đề thi (Đồng bộ Supabase), Lọc SGK, AI Ma trận Thông tư 27, Xuất đề thi Word
 */

class ExamPortal {
  constructor() {
    this.currentGrade = "all";
    this.currentExamType = "all";
    this.currentBookSeries = "all";
    this.currentTab = "all"; // 'all' | 'my_exams' | 'favorites'
    this.searchQuery = "";
    this.exams = [];

    // Delete state
    this.pendingDeleteId = null;
    this.pendingDeleteTitle = "";
  }

  async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');
    
    // Tải toàn bộ đề kiểm tra
    let allExams = await window.examService.getAllExams(this.currentGrade, this.searchQuery, this.currentExamType, this.currentBookSeries);
    const favoriteIds = window.examService.getFavoriteIds();
    
    // Đếm số lượng
    const myExamsCount = user ? allExams.filter(e => (e.createdByUsername === user.username) || (e.authorName === user.name) || user.role === 'admin').length : 0;
    const favoritesCount = allExams.filter(e => favoriteIds.includes(e.id)).length;

    if (this.currentTab === "my_exams" && user) {
      this.exams = allExams.filter(e => (e.createdByUsername === user.username) || (e.authorName === user.name) || user.role === 'admin');
    } else if (this.currentTab === "favorites") {
      this.exams = allExams.filter(e => favoriteIds.includes(e.id));
    } else {
      this.exams = allExams;
    }

    container.innerHTML = `
      <div class="space-y-6 animate-pop">
        <!-- Banner Ngân Hàng Đề Kiểm Tra Rực Rỡ -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="badge badge-emerald font-black">📝 KHẢO SÁT & ĐÁNH GIÁ ĐỊNH KỲ</span>
              <span class="badge bg-white/20 text-white font-bold">Chuẩn Thông Tư 27/2020 & GDPT 2018</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">NGÂN HÀNG ĐỀ KIỂM TRA & ĐÁNH GIÁ</h2>
            <p class="text-cyan-100 text-xs md:text-sm">Quản lý tải lên, chỉnh sửa, xóa bỏ đề kiểm tra 15P, Giữa kì, Cuối kì và Ma trận bản đặc tả chuẩn Bộ GD&ĐT</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            ${isTeacher ? `
              <button onclick="examUploadModal.openModal(${this.currentGrade === 'all' ? 3 : this.currentGrade})" class="btn btn-amber btn-lg font-black shadow-xl flex items-center gap-2 shrink-0 hover:scale-105 transition-all">
                <span class="text-xl">📤</span> <span>Tải Lên Đề Kiểm Tra</span>
              </button>
            ` : `
              <div class="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 text-center text-xs text-white">
                <span class="font-bold block text-amber-300">💡 Dành Cho Học Sinh:</span>
                <span>Em có thể tải đề ôn tập, xem ma trận kiến thức và luyện tập trước kỳ kiểm tra!</span>
              </div>
            `}
          </div>
        </div>

        <!-- Thanh 3 Tab Chuyển Đổi: Tất Cả | Đề Của Tôi | Đề Yêu Thích -->
        <div class="flex items-center gap-2.5 border-b border-slate-200 pb-2 flex-wrap">
          <button onclick="examPortal.switchTab('all')" class="px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'all' ? 'bg-cyan-700 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            <span>📂 Tất Cả Đề Kiểm Tra</span>
            <span class="badge ${this.currentTab === 'all' ? 'bg-white/25 text-white' : 'badge-slate'} text-[10px]">${allExams.length}</span>
          </button>
          
          <button onclick="examPortal.switchTab('favorites')" class="px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'favorites' ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            <span>⭐ Đề Thi Yêu Thích</span>
            <span class="badge ${this.currentTab === 'favorites' ? 'bg-white/25 text-white' : 'badge-rose'} text-[10px]">${favoritesCount}</span>
          </button>

          ${isTeacher ? `
            <button onclick="examPortal.switchTab('my_exams')" class="px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'my_exams' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
              <span>👨‍🏫 Đề Thi Của Tôi (Quản Lý, Sửa & Xóa)</span>
              <span class="badge ${this.currentTab === 'my_exams' ? 'bg-white/25 text-white' : 'badge-amber'} text-[10px]">${myExamsCount}</span>
            </button>
          ` : ''}
        </div>

        <!-- Thanh Bộ Lọc 3 Tầng: Khối Lớp + Loại Đề + 3 Bộ Sách Giáo Khoa -->
        <div class="glass-card p-5 space-y-4">
          <!-- Hàng 1: Lọc Khối Lớp & Tìm Kiếm -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-500 mr-1">Khối Lớp:</span>
              <button onclick="examPortal.selectGrade('all')" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 'all' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                Tất Cả Khối
              </button>
              <button onclick="examPortal.selectGrade(3)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 3 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                🎒 Lớp 3
              </button>
              <button onclick="examPortal.selectGrade(4)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 4 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                🚀 Lớp 4
              </button>
              <button onclick="examPortal.selectGrade(5)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 5 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                ⭐ Lớp 5
              </button>
            </div>

            <!-- Ô Tìm Kiếm -->
            <div class="relative w-full md:w-80">
              <input type="text" id="exam-search-input" value="${this.searchQuery}" oninput="examPortal.handleSearch(this.value)" placeholder="Tìm đề kiểm tra, tác giả, nội dung..." class="form-control text-xs pl-9 font-medium">
              <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
          </div>

          <!-- Hàng 2: Lọc Theo Loại Đề Kiểm Tra -->
          <div class="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200/70">
            <span class="text-xs font-bold text-slate-500 mr-1">Kỳ Đánh Giá:</span>
            <button onclick="examPortal.selectExamType('all')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'all' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Tất Cả Loại Đề
            </button>
            <button onclick="examPortal.selectExamType('regular')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'regular' ? 'bg-purple-600 text-white shadow' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'}">
              ⏱️ Thường Xuyên (15P)
            </button>
            <button onclick="examPortal.selectExamType('mid_term_1')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'mid_term_1' ? 'bg-amber-600 text-white shadow' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
              🍂 Giữa Học Kỳ I
            </button>
            <button onclick="examPortal.selectExamType('final_term_1')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'final_term_1' ? 'bg-blue-600 text-white shadow' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}">
              ❄️ Cuối Học Kỳ I
            </button>
            <button onclick="examPortal.selectExamType('mid_term_2')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'mid_term_2' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
              🌱 Giữa Học Kỳ II
            </button>
            <button onclick="examPortal.selectExamType('final_term_2')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'final_term_2' ? 'bg-rose-600 text-white shadow' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'}">
              ☀️ Cuối Học Kỳ II
            </button>
            <button onclick="examPortal.selectExamType('matrix')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'matrix' ? 'bg-indigo-600 text-white shadow' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'}">
              📐 Ma Trận & Bản Đặc Tả
            </button>
          </div>

          <!-- Hàng 3: Lọc Theo Bộ Sách Giáo Khoa -->
          <div class="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200/70">
            <span class="text-xs font-bold text-slate-500 mr-1">Bộ Sách Giáo Khoa:</span>
            <button onclick="examPortal.selectBookSeries('all')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'all' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Tất Cả Bộ Sách
            </button>
            <button onclick="examPortal.selectBookSeries('KNTT')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'KNTT' ? 'bg-blue-600 text-white shadow' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}">
              📘 Kết Nối Tri Thức
            </button>
            <button onclick="examPortal.selectBookSeries('CD')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'CD' ? 'bg-amber-600 text-white shadow' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
              📙 Cánh Diều
            </button>
            <button onclick="examPortal.selectBookSeries('CTST')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'CTST' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
              📗 Chân Trời Sáng Tạo
            </button>
          </div>
        </div>

        <!-- Danh Sách Card Đề Kiểm Tra -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>📝 DANH SÁCH ĐỀ KIỂM TRA</span>
              <span class="badge badge-emerald font-black text-xs">${this.exams.length} Đề</span>
            </h3>
            ${isTeacher ? `
              <button onclick="examUploadModal.openModal()" class="btn btn-outline btn-xs font-black text-emerald-800 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1">
                <span>➕</span> <span>Tải Lên Đề Mới</span>
              </button>
            ` : ''}
          </div>

          ${this.renderExamGrid(isTeacher, user)}
        </div>
      </div>
    `;
  }

  // Render lưới thẻ đề kiểm tra
  renderExamGrid(isTeacher, user) {
    if (this.exams.length === 0) {
      return `
        <div class="text-center py-16 glass-card space-y-3 text-slate-400">
          <span class="text-6xl block mb-2">📝</span>
          <p class="font-black text-slate-700 text-base">Chưa có đề kiểm tra nào trong mục này.</p>
          <p class="text-xs text-slate-500">Thầy Cô hãy bấm nút <b>'Tải Lên Đề Kiểm Tra'</b> để chia sẻ đề thi đầu tiên!</p>
          ${isTeacher ? `
            <button onclick="examUploadModal.openModal()" class="btn btn-emerald btn-sm font-black mt-2">
              📤 Tải Lên Ngay
            </button>
          ` : ''}
        </div>
      `;
    }

    const typeNames = {
      "regular": { name: "Thường Xuyên 15P", badge: "bg-purple-600" },
      "mid_term_1": { name: "Giữa Học Kỳ I", badge: "bg-amber-600" },
      "final_term_1": { name: "Cuối Học Kỳ I", badge: "bg-blue-600" },
      "mid_term_2": { name: "Giữa Học Kỳ II", badge: "bg-emerald-600" },
      "final_term_2": { name: "Cuối Học Kỳ II", badge: "bg-rose-600" },
      "matrix": { name: "Ma Trận & Bản Đặc Tả", badge: "bg-indigo-600" }
    };

    const seriesLabels = {
      "KNTT": { name: "Kết Nối Tri Thức", bg: "bg-blue-600" },
      "CD": { name: "Cánh Diều", bg: "bg-amber-600" },
      "CTST": { name: "Chân Trời Sáng Tạo", bg: "bg-emerald-600" }
    };

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.exams.map(e => {
          const tInfo = typeNames[e.examType] || typeNames["final_term_1"];
          const sInfo = seriesLabels[e.bookSeries] || seriesLabels["KNTT"];
          const canManage = user && (user.role === 'admin' || user.username === e.createdByUsername || user.name === e.authorName || isTeacher);
          const isFav = window.examService.isFavorite(e.id);

          return `
            <div class="glass-card overflow-hidden hover:border-emerald-500 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group relative">
              <!-- Header Gradient Thumbnail -->
              <div class="p-5 bg-gradient-to-br ${e.thumbnailColor || 'from-blue-700 to-indigo-600'} text-white space-y-2 relative">
                <div class="flex items-center justify-between gap-1 flex-wrap">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="badge ${tInfo.badge} text-white font-black text-[10px] uppercase backdrop-blur-sm">
                      ${tInfo.name}
                    </span>
                    <span class="badge ${sInfo.bg} text-white font-black text-[10px] uppercase backdrop-blur-sm">
                      Lớp ${e.grade} • ${sInfo.name}
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      ⏱️ ${e.durationMinutes || 35}p
                    </span>
                    <!-- Nút Bookmark Yêu Thích ⭐ -->
                    <button onclick="examPortal.toggleFavorite('${e.id}')" class="p-1 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all hover:scale-110" title="${isFav ? 'Bỏ lưu đề thi yêu thích' : 'Lưu vào đề thi yêu thích'}">
                      <span class="text-sm">${isFav ? '⭐' : '🤍'}</span>
                    </button>
                  </div>
                </div>

                <div class="flex items-center gap-3 pt-2">
                  <span class="text-4xl filter drop-shadow-md group-hover:scale-110 transition-all">📝</span>
                  <div>
                    <p class="text-[11px] font-bold text-cyan-100 uppercase tracking-wider">Thang điểm ${e.totalScore || 10} • TT 27/2020</p>
                    <h4 class="font-black text-base text-white leading-snug line-clamp-2">${e.title}</h4>
                  </div>
                </div>
              </div>

              <!-- Body Details -->
              <div class="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <p class="text-slate-600 line-clamp-2 leading-relaxed">
                  ${e.description || 'Đề kiểm tra đánh giá định kỳ môn Tin học, cấu trúc kết hợp trắc nghiệm lý thuyết và thực hành trên máy.'}
                </p>

                <div class="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div class="flex items-center justify-between">
                    <span>👨‍🏫 Người ra đề: <b>${e.authorName || 'Thầy Anh Đào'}</b></span>
                    <span>📦 Tệp: <b>${e.fileSizeText || '2.0 MB'}</b></span>
                  </div>
                  <div class="flex items-center justify-between text-slate-400">
                    <span>👁️ ${e.viewCount || 0} lượt xem</span>
                    <span>📥 ${e.downloadCount || 0} lượt tải</span>
                  </div>
                </div>

                <!-- Hàng nút hành động đa năng -->
                <div class="space-y-2 pt-2 border-t border-slate-100">
                  <!-- Hàng 1: AI Ma Trận Thông Tư 27 + Xuất Đề Word (.doc) -->
                  <div class="grid grid-cols-2 gap-2">
                    <button onclick="examPortal.openMatrixModal('${e.id}')" class="btn btn-outline btn-sm font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 flex items-center justify-center gap-1" title="Xem phân tích Ma trận đề 4 mức độ nhận thức">
                      <span>✨</span> <span>AI Ma Trận Đề</span>
                    </button>
                    <button onclick="examPortal.downloadExamDoc('${e.id}')" class="btn btn-emerald btn-sm font-black flex items-center justify-center gap-1 shadow-sm" title="Tải đề kiểm tra bản Word chuẩn Bộ GD&ĐT">
                      <span>📝</span> <span>Tải Đề Word</span>
                    </button>
                  </div>

                  <!-- Hàng 2: Xem Trực Tuyến + Sửa + Xóa -->
                  <div class="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                    <button onclick="examPortal.previewExam('${e.id}')" class="btn btn-primary btn-sm flex-1 font-black flex items-center justify-center gap-1 shadow-sm">
                      <span>👁️</span> <span>Xem Trực Tuyến</span>
                    </button>

                    ${canManage ? `
                      <button onclick="examUploadModal.openEditModal('${e.id}')" class="p-2 text-cyan-700 hover:bg-cyan-100 rounded-xl font-bold border border-cyan-200 transition-all hover:scale-105" title="Chỉnh sửa thông tin & đổi file đề thi">
                        ✏️
                      </button>
                      <button onclick="examPortal.openDeleteConfirmModal('${e.id}', '${e.title.replace(/'/g, "\\'")}')" class="p-2 text-rose-600 hover:bg-rose-100 rounded-xl font-bold border border-rose-200 transition-all hover:scale-105" title="Xóa bỏ đề thi này khỏi hệ thống & Supabase">
                        🗑️
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // Đánh dấu yêu thích
  toggleFavorite(id) {
    const isFav = window.examService.toggleFavorite(id);
    window.app.showToast(isFav ? "⭐ Đã thêm đề thi vào mục Yêu Thích!" : "Đã xóa khỏi mục Yêu Thích!", "info");
    this.render("main-content-area");
  }

  // Chuyển Tab
  switchTab(tab) {
    this.currentTab = tab;
    this.render("main-content-area");
  }

  selectGrade(grade) {
    this.currentGrade = grade;
    this.render("main-content-area");
  }

  selectExamType(type) {
    this.currentExamType = type;
    this.render("main-content-area");
  }

  selectBookSeries(series) {
    this.currentBookSeries = series;
    this.render("main-content-area");
  }

  handleSearch(query) {
    this.searchQuery = query;
    this.render("main-content-area");
  }

  // =========================================================================
  // XEM MA TRẬN ĐỀ THI & BẢN ĐẶC TẢ CHUẨN THÔNG TƯ 27 (AI MATRIX MODAL)
  // =========================================================================
  async openMatrixModal(id) {
    const exam = await window.examService.getExamById(id);
    if (!exam) return;

    window.app.showToast("✨ AI đang phân tích và sinh bảng ma trận đặc tả theo Thông tư 27...", "info");
    const matrix = await window.examService.generateAIMatrix(exam.title, exam.grade, exam.examType);

    const modal = document.getElementById("exam-matrix-modal");
    const content = document.getElementById("exam-matrix-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-5 text-xs text-slate-800 animate-pop">
          <div class="p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl border border-indigo-200 flex items-start justify-between gap-3">
            <div>
              <span class="badge bg-indigo-600 text-white font-black text-[10px]">MA TRẬN ĐỀ THEO THÔNG TƯ 27/2020</span>
              <h3 class="text-base font-black text-slate-900 mt-1">${matrix.title}</h3>
              <p class="text-[11px] text-cyan-800 font-semibold">Khối Lớp ${matrix.grade} • Thời gian làm bài: ${matrix.distribution.duration}</p>
            </div>
            <span class="text-3xl">📐</span>
          </div>

          <!-- Bảng 4 Mức Độ Nhận Thức -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden text-xs">
              <thead class="bg-slate-100 text-slate-700 font-black text-[11px]">
                <tr>
                  <th class="p-3 border border-slate-200">Mức Độ Nhận Thức</th>
                  <th class="p-3 border border-slate-200">Tỷ Lệ</th>
                  <th class="p-3 border border-slate-200">Số Lượng Câu Hỏi & Điểm</th>
                  <th class="p-3 border border-slate-200">Nội Dung Yêu Cầu Cần Đạt</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium text-slate-700">
                ${matrix.levels.map(lvl => `
                  <tr class="hover:bg-slate-50 transition-all">
                    <td class="p-3 font-bold border border-slate-200 text-slate-900">${lvl.level}</td>
                    <td class="p-3 font-black text-indigo-700 border border-slate-200">${lvl.percent}</td>
                    <td class="p-3 font-bold text-emerald-800 border border-slate-200">${lvl.questions}</td>
                    <td class="p-3 border border-slate-200 text-[11px]">${lvl.desc}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <!-- Phân Bố Điểm Số & Tiêu Chí Đánh Giá -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
              <h4 class="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                <span>🎯</span> <span>CẤU TRÚC ĐỀ THI</span>
              </h4>
              <p class="text-emerald-800 font-semibold">• Phần Lý Thuyết (Trắc nghiệm): <b>${matrix.distribution.theoryScore} Điểm (70%)</b></p>
              <p class="text-emerald-800 font-semibold">• Phần Thực Hành (Trên máy tính): <b>${matrix.distribution.practiceScore} Điểm (30%)</b></p>
            </div>

            <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
              <h4 class="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                <span>💡</span> <span>HƯỚNG DẪN XẾP LOẠI HỌC SINH</span>
              </h4>
              <p class="text-amber-800 font-medium">• Hoàn thành Tốt (T): Đạt từ 9.0 - 10.0 điểm</p>
              <p class="text-amber-800 font-medium">• Hoàn thành (H): Đạt từ 5.0 - 8.9 điểm</p>
              <p class="text-amber-800 font-medium">• Chưa hoàn thành (C): Dưới 5.0 điểm</p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-400">
            <span>Tiêu chuẩn: <b>GDPT 2018 & TT 27/2020</b></span>
            <div class="flex items-center gap-2">
              <button onclick="examPortal.downloadExamDoc('${exam.id}')" class="btn btn-emerald btn-sm font-black">
                📝 Tải Đề Thi & Ma Trận (.doc)
              </button>
              <button onclick="document.getElementById('exam-matrix-modal').classList.remove('active')" class="btn btn-outline btn-sm font-bold">
                Đóng
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  // =========================================================================
  // XUẤT ĐỀ THI WORD (.DOC) KÈM MA TRẬN & ĐÁP ÁN
  // =========================================================================
  async downloadExamDoc(id) {
    const exam = await window.examService.getExamById(id);
    if (!exam) return;

    await window.examService.recordAction(id, 'download');

    if (window.docExportService && window.docExportService.exportExamDoc) {
      window.docExportService.exportExamDoc(exam);
      window.app.showToast(`📝 Đang tải xuống Đề kiểm tra Word: ${exam.title}!`, "success");
    } else {
      window.app.showToast(`📥 Đang tải xuống tệp: ${exam.fileName}`, "success");
    }
  }

  // =========================================================================
  // XEM ĐỀ TRỰC TUYẾN (PREVIEW EXAM)
  // =========================================================================
  async previewExam(id) {
    const exam = await window.examService.getExamById(id);
    if (!exam) return;

    await window.examService.recordAction(id, 'view');

    const modal = document.getElementById("exam-preview-modal");
    const titleDisp = document.getElementById("exam-preview-title");
    const frame = document.getElementById("exam-preview-iframe");

    if (titleDisp) titleDisp.innerText = exam.title;

    if (frame) {
      let embedUrl = exam.fileUrl;
      if (embedUrl.startsWith("http") && !embedUrl.includes("view.officeapps.live.com") && !embedUrl.includes("drive.google.com")) {
        embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(embedUrl)}`;
      }
      frame.src = embedUrl;
    }

    if (modal) modal.classList.add("active");
  }

  closePreviewModal() {
    const modal = document.getElementById("exam-preview-modal");
    const frame = document.getElementById("exam-preview-iframe");
    if (frame) frame.src = "";
    if (modal) modal.classList.remove("active");
  }

  // =========================================================================
  // XÓA ĐỀ KIỂM TRA (DELETE EXAM WITH CONFIRMATION & SUPABASE SYNC)
  // =========================================================================
  openDeleteConfirmModal(id, title) {
    this.pendingDeleteId = id;
    this.pendingDeleteTitle = title;

    const modal = document.getElementById("exam-delete-modal");
    const nameDisp = document.getElementById("exam-delete-name-disp");

    if (nameDisp) nameDisp.innerText = title;
    if (modal) modal.classList.add("active");
  }

  closeDeleteModal() {
    this.pendingDeleteId = null;
    this.pendingDeleteTitle = "";
    const modal = document.getElementById("exam-delete-modal");
    if (modal) modal.classList.remove("active");
  }

  async executeDeleteExam() {
    if (!this.pendingDeleteId) return;

    const id = this.pendingDeleteId;
    const title = this.pendingDeleteTitle;

    const btn = document.getElementById("btn-confirm-delete-exam");
    if (btn) {
      btn.innerHTML = "⏳ Đang xóa từ Supabase...";
      btn.classList.add("pointer-events-none");
    }

    const res = await window.examService.deleteExam(id);

    if (btn) {
      btn.innerHTML = "🗑️ Xóa Vĩnh Viễn";
      btn.classList.remove("pointer-events-none");
    }

    this.closeDeleteModal();

    if (res.success) {
      window.app.showToast(`🗑️ Đã xóa đề kiểm tra "${title}" thành công khỏi hệ thống & Supabase!`, "success");
      this.render("main-content-area");
    } else {
      window.app.showToast("Không thể xóa đề kiểm tra, vui lòng thử lại!", "error");
    }
  }
}

window.examPortal = new ExamPortal();
