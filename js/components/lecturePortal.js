/**
 * LECTURE PORTAL COMPONENT
 * Quản lý Bài Giảng Điện Tử: Tải lên, Chỉnh sửa/Đổi file, Xóa bỏ, Bảng vẽ Bút dạ quang/Phấn trắng, Thống kê Analytics, Lọc SGK, Video hoạt họa, Phiếu bài tập & Game Khởi động
 */

class LecturePortal {
  constructor() {
    this.currentGrade = "all";
    this.currentBookSeries = "all";
    this.currentTab = "all"; // 'all' | 'my_lectures'
    this.searchQuery = "";
    this.lectures = [];

    // Video Player & Voice State
    this.activeVideoLecture = null;
    this.videoSlideFrames = [];
    this.currentSlideIndex = 0;
    this.isVideoPlaying = false;
    this.videoTimer = null;
    this.speechSynth = window.speechSynthesis || null;
    this.voiceGender = "female"; // female | male
    this.speechRate = 0.95; // 0.8 | 0.95 | 1.2
    this.is3DFlipEnabled = true;

    // Icebreaker Game State
    this.icebreakerActive = false;
    this.icebreakerScore = 0;
    this.icebreakerTimer = 180;
    this.icebreakerInterval = null;
    this.icebreakerCurrentQ = 0;
    this.icebreakerQuestions = [];

    // Delete Confirmation State
    this.pendingDeleteId = null;
    this.pendingDeleteTitle = "";

    // Drawing Canvas State
    this.isDrawingActive = false;
    this.drawTool = "highlighter"; // 'highlighter' | 'red_pen' | 'chalk' | 'eraser'
    this.isPainting = false;
    this.activeCanvas = null;
    this.activeCtx = null;
  }

  async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');
    
    // Tải toàn bộ bài giảng
    let allLectures = await window.lectureService.getAllLectures(this.currentGrade, this.searchQuery, this.currentBookSeries);
    
    // Đếm số bài giảng của tôi
    const myLecturesCount = user ? allLectures.filter(l => (l.createdByUsername === user.username) || (l.authorName === user.name) || user.role === 'admin').length : 0;

    if (this.currentTab === "my_lectures" && user) {
      this.lectures = allLectures.filter(l => (l.createdByUsername === user.username) || (l.authorName === user.name) || user.role === 'admin');
    } else {
      this.lectures = allLectures;
    }

    container.innerHTML = `
      <div class="space-y-6 animate-pop">
        <!-- Banner Kho Bài Giảng Rực Rỡ -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="badge badge-amber font-black">📊 HỌC LIỆU SỐ TIỂU HỌC</span>
              <span class="badge bg-white/20 text-white font-bold">Chuẩn GDPT 2018 & CV 2345</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">KHO BÀI GIẢNG ĐIỆN TỬ & POWERPOINT</h2>
            <p class="text-cyan-100 text-xs md:text-sm">Quản lý tải lên, chỉnh sửa, đổi file, xóa bỏ bài giảng của giáo viên và đồng bộ trực tiếp lên Supabase Cloud</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            ${isTeacher ? `
              <button onclick="lecturePortal.openAnalyticsModal()" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-4 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md">
                <span>📈</span> <span>Thống Kê</span>
              </button>
              <button onclick="lectureUploadModal.openModal(${this.currentGrade === 'all' ? 3 : this.currentGrade})" class="btn btn-amber btn-lg font-black shadow-xl flex items-center gap-2 shrink-0 hover:scale-105 transition-all">
                <span class="text-xl">📤</span> <span>Tải Lên Bài Giảng</span>
              </button>
            ` : `
              <div class="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 text-center text-xs text-white">
                <span class="font-bold block text-amber-300">💡 Dành Cho Học Sinh:</span>
                <span>Em có thể xem Video hoạt họa, làm Game Khởi động và tải Phiếu bài tập!</span>
              </div>
            `}
          </div>
        </div>

        <!-- Thanh Tab Chuyển Đổi: Tất Cả Bài Giảng vs Bài Giảng Của Tôi -->
        ${isTeacher ? `
          <div class="flex items-center gap-3 border-b border-slate-200 pb-2">
            <button onclick="lecturePortal.switchTab('all')" class="px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'all' ? 'bg-cyan-700 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
              <span>📂 Tất Cả Bài Giảng</span>
              <span class="badge ${this.currentTab === 'all' ? 'bg-white/25 text-white' : 'badge-slate'} text-[10px]">${allLectures.length}</span>
            </button>
            <button onclick="lecturePortal.switchTab('my_lectures')" class="px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'my_lectures' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
              <span>👨‍🏫 Bài Giảng Của Tôi (Quản Lý, Sửa & Xóa)</span>
              <span class="badge ${this.currentTab === 'my_lectures' ? 'bg-white/25 text-white' : 'badge-amber'} text-[10px]">${myLecturesCount}</span>
            </button>
          </div>
        ` : ''}

        <!-- Thanh Bộ Lọc Kép: Khối Lớp + 3 Bộ Sách Giáo Khoa + Ô Tìm Kiếm -->
        <div class="glass-card p-5 space-y-4">
          <!-- Hàng 1: Lọc Khối Lớp & Tìm Kiếm -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-500 mr-1">Khối Lớp:</span>
              <button onclick="lecturePortal.selectGrade('all')" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 'all' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                Tất Cả Khối
              </button>
              <button onclick="lecturePortal.selectGrade(3)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 3 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                🎒 Lớp 3
              </button>
              <button onclick="lecturePortal.selectGrade(4)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 4 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                🚀 Lớp 4
              </button>
              <button onclick="lecturePortal.selectGrade(5)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 5 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                ⭐ Lớp 5
              </button>
            </div>

            <!-- Ô Tìm Kiếm -->
            <div class="relative w-full md:w-80">
              <input type="text" id="lecture-search-input" value="${this.searchQuery}" oninput="lecturePortal.handleSearch(this.value)" placeholder="Tìm bài giảng, tác giả, chủ đề..." class="form-control text-xs pl-9 font-medium">
              <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
          </div>

          <!-- Hàng 2: Lọc Theo 3 Bộ Sách Giáo Khoa -->
          <div class="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200/70">
            <span class="text-xs font-bold text-slate-500 mr-1">Bộ Sách Giáo Khoa:</span>
            <button onclick="lecturePortal.selectBookSeries('all')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'all' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Tất Cả Bộ Sách
            </button>
            <button onclick="lecturePortal.selectBookSeries('KNTT')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'KNTT' ? 'bg-blue-600 text-white shadow' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}">
              📘 Kết Nối Tri Thức
            </button>
            <button onclick="lecturePortal.selectBookSeries('CD')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'CD' ? 'bg-amber-600 text-white shadow' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
              📙 Cánh Diều
            </button>
            <button onclick="lecturePortal.selectBookSeries('CTST')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'CTST' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
              📗 Chân Trời Sáng Tạo
            </button>
          </div>
        </div>

        <!-- Danh Sách Card Bài Giảng Điện Tử -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>📚 DANH SÁCH BÀI GIẢNG</span>
              <span class="badge badge-cyan font-black text-xs">${this.lectures.length} Bài</span>
            </h3>
            ${isTeacher ? `
              <button onclick="lectureUploadModal.openModal()" class="btn btn-outline btn-xs font-black text-amber-800 border-amber-300 hover:bg-amber-50 flex items-center gap-1">
                <span>➕</span> <span>Tải Lên Nhanh</span>
              </button>
            ` : ''}
          </div>

          ${this.renderLectureGrid(isTeacher, user)}
        </div>
      </div>
    `;
  }

  // Render lưới thẻ bài giảng
  renderLectureGrid(isTeacher, user) {
    if (this.lectures.length === 0) {
      return `
        <div class="text-center py-16 glass-card space-y-3 text-slate-400">
          <span class="text-6xl block mb-2">📊</span>
          <p class="font-black text-slate-700 text-base">Chưa có bài giảng điện tử nào trong mục này.</p>
          <p class="text-xs text-slate-500">Thầy Cô hãy bấm nút <b>'Tải Lên Bài Giảng Mới'</b> để tải lên file PowerPoint đầu tiên!</p>
          ${isTeacher ? `
            <button onclick="lectureUploadModal.openModal()" class="btn btn-primary btn-sm font-black mt-2">
              📤 Tải Lên Ngay
            </button>
          ` : ''}
        </div>
      `;
    }

    const seriesLabels = {
      "KNTT": { name: "Kết Nối Tri Thức", bg: "bg-blue-600" },
      "CD": { name: "Cánh Diều", bg: "bg-amber-600" },
      "CTST": { name: "Chân Trời Sáng Tạo", bg: "bg-emerald-600" }
    };

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.lectures.map(l => {
          const sInfo = seriesLabels[l.bookSeries] || seriesLabels["KNTT"];
          const canManage = user && (user.role === 'admin' || user.username === l.createdByUsername || user.name === l.authorName || isTeacher);

          return `
            <div class="glass-card overflow-hidden hover:border-cyan-500 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group relative">
              <!-- Header Thumbnail Gradient -->
              <div class="p-5 bg-gradient-to-br ${l.thumbnailColor || 'from-blue-600 to-cyan-500'} text-white space-y-2 relative">
                <div class="flex items-center justify-between gap-1 flex-wrap">
                  <span class="badge ${sInfo.bg} text-white font-black text-[10px] uppercase backdrop-blur-sm">
                    ${sInfo.name} • Lớp ${l.grade}
                  </span>
                  <span class="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    ${l.slideCount || 20} Slide
                  </span>
                </div>

                <div class="flex items-center gap-3 pt-2">
                  <span class="text-4xl filter drop-shadow-md group-hover:scale-110 transition-all">📊</span>
                  <div>
                    <p class="text-[11px] font-bold text-cyan-100 uppercase tracking-wider">${l.topicName || 'Chủ đề Tin học'}</p>
                    <h4 class="font-black text-base text-white leading-snug line-clamp-2">${l.title}</h4>
                  </div>
                </div>
              </div>

              <!-- Body Details -->
              <div class="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <p class="text-slate-600 line-clamp-2 leading-relaxed">
                  ${l.description || 'Bài giảng thiết kế trực quan theo chuẩn GDPT 2018, hỗ trợ trình chiếu và thuyết minh hoạt họa.'}
                </p>

                <div class="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div class="flex items-center justify-between">
                    <span>👨‍🏫 Tác giả: <b>${l.authorName || 'Thầy Anh Đào'}</b></span>
                    <span>📦 Dung lượng: <b>${l.fileSizeText || '5.2 MB'}</b></span>
                  </div>
                  <div class="flex items-center justify-between text-slate-400">
                    <span>👁️ ${l.viewCount || 0} lượt xem</span>
                    <span>📥 ${l.downloadCount || 0} lượt tải</span>
                  </div>
                </div>

                <!-- Hàng nút hành động đa năng -->
                <div class="space-y-2 pt-2 border-t border-slate-100">
                  <!-- Hàng 1: Video hoạt họa + Game Khởi động 3 phút -->
                  <div class="grid grid-cols-2 gap-2">
                    <button onclick="lecturePortal.openSlideVideoPlayer('${l.id}')" class="btn btn-amber btn-sm font-black flex items-center justify-center gap-1 shadow-sm" title="Xem Video bài giảng hoạt họa có thuyết minh giọng đọc">
                      <span>🎬</span> <span>Video Hoạt Họa</span>
                    </button>
                    <button onclick="lecturePortal.openIcebreakerGame('${l.id}')" class="btn btn-emerald btn-sm font-black flex items-center justify-center gap-1 shadow-sm" title="Trò chơi đố vui khởi động 3 phút đầu giờ">
                      <span>⚡</span> <span>Khởi Động 3P</span>
                    </button>
                  </div>

                  <!-- Hàng 2: AI Tóm Tắt + Phiếu Bài Tập Word -->
                  <div class="grid grid-cols-2 gap-2">
                    <button onclick="lecturePortal.openAISummary('${l.id}')" class="btn btn-outline btn-sm font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 flex items-center justify-center gap-1">
                      <span>✨</span> <span>AI Tóm Tắt</span>
                    </button>
                    <button onclick="lecturePortal.downloadWorksheet('${l.id}')" class="btn btn-outline btn-sm font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 flex items-center justify-center gap-1" title="Tải Phiếu bài tập in ấn Word (.doc) cho học sinh">
                      <span>📝</span> <span>Phiếu Bài Tập</span>
                    </button>
                  </div>

                  <!-- Hàng 3: Trình chiếu + Tải PPT + Sửa + Xóa -->
                  <div class="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                    <button onclick="lecturePortal.previewLecture('${l.id}')" class="btn btn-primary btn-sm flex-1 font-black flex items-center justify-center gap-1 shadow-sm">
                      <span>👁️</span> <span>Trình Chiếu</span>
                    </button>
                    <button onclick="lecturePortal.downloadLecture('${l.id}')" class="btn btn-outline btn-sm font-bold flex items-center gap-1" title="Tải file PowerPoint về máy">
                      <span>📥</span> <span>Tải PPT</span>
                    </button>

                    ${canManage ? `
                      <button onclick="lectureUploadModal.openEditModal('${l.id}')" class="p-2 text-cyan-700 hover:bg-cyan-100 rounded-xl font-bold border border-cyan-200 transition-all hover:scale-105" title="Chỉnh sửa thông tin & đổi file PowerPoint">
                        ✏️
                      </button>
                      <button onclick="lecturePortal.openDeleteConfirmModal('${l.id}', '${l.title.replace(/'/g, "\\'")}')" class="p-2 text-rose-600 hover:bg-rose-100 rounded-xl font-bold border border-rose-200 transition-all hover:scale-105" title="Xóa bỏ bài giảng này khỏi hệ thống & Supabase">
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

  // Chuyển Tab (Tất cả vs Bài giảng của tôi)
  switchTab(tab) {
    this.currentTab = tab;
    this.render("main-content-area");
  }

  selectGrade(grade) {
    this.currentGrade = grade;
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
  // BẢNG VẼ BÚT DẠ QUANG & PHẤN TRẮNG TRÊN SLIDE (DRAWING CANVAS)
  // =========================================================================
  toggleDrawingMode(canvasId) {
    this.isDrawingActive = !this.isDrawingActive;
    const canvas = document.getElementById(canvasId);
    const toolbar = document.getElementById("drawing-toolbar-" + canvasId);

    if (canvas) {
      canvas.style.pointerEvents = this.isDrawingActive ? "auto" : "none";
      if (this.isDrawingActive) {
        this.initCanvas(canvas);
      }
    }

    if (toolbar) {
      if (this.isDrawingActive) toolbar.classList.remove("hidden");
      else toolbar.classList.add("hidden");
    }

    window.app.showToast(`🎨 Bút vẽ trên slide: ${this.isDrawingActive ? 'BẬT (Nhấp và vẽ)' : 'TẮT'}`, "info");
  }

  initCanvas(canvas) {
    this.activeCanvas = canvas;
    this.activeCtx = canvas.getContext("2d");
    
    // Tự động điều chỉnh kích thước canvas theo khung cha
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Gắn sự kiện chuột & cảm ứng
    canvas.onmousedown = (e) => this.startPaint(e);
    canvas.onmousemove = (e) => this.drawPaint(e);
    canvas.onmouseup = () => this.stopPaint();
    canvas.onmouseleave = () => this.stopPaint();

    canvas.ontouchstart = (e) => this.startPaint(e.touches[0]);
    canvas.ontouchmove = (e) => this.drawPaint(e.touches[0]);
    canvas.ontouchend = () => this.stopPaint();
  }

  setDrawTool(tool) {
    this.drawTool = tool;
    window.app.showToast(`🖌️ Đã chọn: ${tool === 'highlighter' ? 'Bút Dạ Quang Vàng' : tool === 'red_pen' ? 'Bút Đỏ Giảng Bài' : tool === 'chalk' ? 'Bút Phấn Trắng' : 'Tẩy Xóa'}`, "info");
  }

  startPaint(e) {
    if (!this.isDrawingActive || !this.activeCtx) return;
    this.isPainting = true;
    const rect = this.activeCanvas.getBoundingClientRect();
    this.activeCtx.beginPath();
    this.activeCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  drawPaint(e) {
    if (!this.isPainting || !this.activeCtx) return;
    const rect = this.activeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.drawTool === "highlighter") {
      this.activeCtx.strokeStyle = "rgba(255, 235, 59, 0.45)";
      this.activeCtx.lineWidth = 18;
      this.activeCtx.lineCap = "round";
      this.activeCtx.globalCompositeOperation = "source-over";
    } else if (this.drawTool === "red_pen") {
      this.activeCtx.strokeStyle = "#ef4444";
      this.activeCtx.lineWidth = 4;
      this.activeCtx.lineCap = "round";
      this.activeCtx.globalCompositeOperation = "source-over";
    } else if (this.drawTool === "chalk") {
      this.activeCtx.strokeStyle = "#ffffff";
      this.activeCtx.lineWidth = 4;
      this.activeCtx.lineCap = "round";
      this.activeCtx.globalCompositeOperation = "source-over";
    } else if (this.drawTool === "eraser") {
      this.activeCtx.lineWidth = 24;
      this.activeCtx.globalCompositeOperation = "destination-out";
    }

    this.activeCtx.lineTo(x, y);
    this.activeCtx.stroke();
  }

  stopPaint() {
    this.isPainting = false;
  }

  clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.app.showToast("🧹 Đã xóa sạch nét vẽ trên màn hình!", "info");
    }
  }

  // =========================================================================
  // THỐNG KÊ ANALYTICS LƯỢT XEM & LƯỢT TẢI BÀI GIẢNG
  // =========================================================================
  async openAnalyticsModal() {
    const data = await window.lectureService.getAnalyticsSummary();
    const modal = document.getElementById("lecture-analytics-modal");
    const content = document.getElementById("lec-analytics-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-6 text-xs text-slate-800 animate-pop">
          <!-- 4 Thẻ KPI Tóm Tắt -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div class="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
              <span class="text-2xl block mb-1">📚</span>
              <p class="text-slate-500 font-bold text-[10px]">TỔNG BÀI GIẢNG</p>
              <p class="text-xl font-black text-blue-700">${data.totalLectures}</p>
            </div>
            <div class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span class="text-2xl block mb-1">👁️</span>
              <p class="text-slate-500 font-bold text-[10px]">TỔNG LƯỢT XEM</p>
              <p class="text-xl font-black text-emerald-700">${data.totalViews}</p>
            </div>
            <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
              <span class="text-2xl block mb-1">📥</span>
              <p class="text-slate-500 font-bold text-[10px]">TỔNG LƯỢT TẢI</p>
              <p class="text-xl font-black text-amber-700">${data.totalDownloads}</p>
            </div>
            <div class="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl">
              <span class="text-2xl block mb-1">⭐</span>
              <p class="text-slate-500 font-bold text-[10px]">TƯƠNG TÁC TB</p>
              <p class="text-xl font-black text-purple-700">${Math.round((data.totalViews + data.totalDownloads) / (data.totalLectures || 1))}</p>
            </div>
          </div>

          <!-- Phân Bố Theo Khối Lớp -->
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 class="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <span>🎒</span> <span>PHÂN BỐ BÀI GIẢNG & LƯỢT HỌC THEO KHỐI LỚP</span>
            </h4>
            <div class="space-y-2">
              <div>
                <div class="flex justify-between text-[11px] font-bold text-slate-700 pb-1">
                  <span>Khối Lớp 3 (${data.gradeStats[3].count} bài)</span>
                  <span>${data.gradeStats[3].views} xem • ${data.gradeStats[3].downloads} tải</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div class="bg-cyan-600 h-2 rounded-full" style="width: ${data.totalLectures ? (data.gradeStats[3].count / data.totalLectures) * 100 : 0}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] font-bold text-slate-700 pb-1">
                  <span>Khối Lớp 4 (${data.gradeStats[4].count} bài)</span>
                  <span>${data.gradeStats[4].views} xem • ${data.gradeStats[4].downloads} tải</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div class="bg-amber-500 h-2 rounded-full" style="width: ${data.totalLectures ? (data.gradeStats[4].count / data.totalLectures) * 100 : 0}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] font-bold text-slate-700 pb-1">
                  <span>Khối Lớp 5 (${data.gradeStats[5].count} bài)</span>
                  <span>${data.gradeStats[5].views} xem • ${data.gradeStats[5].downloads} tải</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div class="bg-purple-600 h-2 rounded-full" style="width: ${data.totalLectures ? (data.gradeStats[5].count / data.totalLectures) * 100 : 0}%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Bài Giảng Phổ Biến Nhất -->
          <div class="space-y-2">
            <h4 class="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <span>🏆</span> <span>TOP BÀI GIẢNG ĐƯỢC HỌC SINH ÔN TẬP NHIỀU NHẤT</span>
            </h4>
            <div class="space-y-1.5">
              ${data.topLectures.map((l, idx) => `
                <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full ${idx === 0 ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-600'} font-black text-xs flex items-center justify-center">${idx + 1}</span>
                    <div>
                      <p class="font-bold text-slate-900 text-xs">${l.title}</p>
                      <p class="text-[10px] text-slate-500">Lớp ${l.grade} • Tác giả: ${l.authorName}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="badge badge-cyan text-[10px] font-bold">👁️ ${l.viewCount || 0}</span>
                    <span class="badge badge-amber text-[10px] font-bold">📥 ${l.downloadCount || 0}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  // =========================================================================
  // XÓA BÀI GIẢNG (DELETE LECTURE WITH CONFIRMATION & SUPABASE SYNC)
  // =========================================================================
  openDeleteConfirmModal(id, title) {
    this.pendingDeleteId = id;
    this.pendingDeleteTitle = title;

    const modal = document.getElementById("lecture-delete-modal");
    const nameDisp = document.getElementById("lec-delete-name-disp");

    if (nameDisp) nameDisp.innerText = title;
    if (modal) modal.classList.add("active");
  }

  closeDeleteModal() {
    this.pendingDeleteId = null;
    this.pendingDeleteTitle = "";
    const modal = document.getElementById("lecture-delete-modal");
    if (modal) modal.classList.remove("active");
  }

  async executeDeleteLecture() {
    if (!this.pendingDeleteId) return;

    const id = this.pendingDeleteId;
    const title = this.pendingDeleteTitle;

    const btn = document.getElementById("btn-confirm-delete-lecture");
    if (btn) {
      btn.innerHTML = "⏳ Đang xóa từ Supabase...";
      btn.classList.add("pointer-events-none");
    }

    const res = await window.lectureService.deleteLecture(id);

    if (btn) {
      btn.innerHTML = "🗑️ Xóa Vĩnh Viễn";
      btn.classList.remove("pointer-events-none");
    }

    this.closeDeleteModal();

    if (res.success) {
      window.app.showToast(`🗑️ Đã xóa bài giảng "${title}" thành công khỏi hệ thống & Supabase!`, "success");
      this.render("main-content-area");
    } else {
      window.app.showToast("Không thể xóa bài giảng, vui lòng thử lại!", "error");
    }
  }

  // =========================================================================
  // XUẤT PHIẾU BÀI TẬP IN (.DOC) CHO HỌC SINH
  // =========================================================================
  async downloadWorksheet(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    if (window.docExportService) {
      window.docExportService.exportWorksheetDoc(lecture);
      window.app.showToast(`📝 Đã tạo và tải Phiếu bài tập Word cho bài: ${lecture.title}!`, "success");
    }
  }

  // =========================================================================
  // AI TÓM TẮT BÀI GIẢNG (AI SLIDE SUMMARY)
  // =========================================================================
  async openAISummary(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    window.app.showToast("✨ AI đang phân tích và trích xuất nội dung cốt lõi...", "info");
    const summary = await window.lectureService.generateAISlideSummary(lecture.title, lecture.grade, lecture.topicName);

    const modal = document.getElementById("lecture-ai-summary-modal");
    const content = document.getElementById("lec-ai-summary-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-4 text-xs text-slate-800 animate-pop">
          <div class="p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl border border-indigo-200 flex items-start justify-between gap-3">
            <div>
              <span class="badge bg-indigo-600 text-white font-black text-[10px]">AI PEDAGOGICAL SUMMARY</span>
              <h3 class="text-base font-black text-slate-900 mt-1">${summary.title}</h3>
              <p class="text-[11px] text-cyan-800 font-semibold">Khối Lớp ${summary.grade} • ${summary.topicName || 'Chủ đề Tin học GDPT 2018'}</p>
            </div>
            <span class="text-3xl">✨</span>
          </div>

          <div class="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
            <h4 class="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
              <span>🎯</span> <span>YÊU CẦU CẦN ĐẠT CỐT LÕI (MỤC TIÊU BÀI DẠY)</span>
            </h4>
            <ul class="list-disc list-inside text-emerald-800 space-y-1 font-medium pl-1">
              ${summary.competencies.map(c => `<li>${c}</li>`).join("")}
            </ul>
          </div>

          <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
            <h4 class="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
              <span>💡</span> <span>KIẾN THỨC TRỌNG TÂM CẦN GHI NHỚ</span>
            </h4>
            <ul class="list-disc list-inside text-amber-800 space-y-1 font-medium pl-1">
              ${summary.corePoints.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>

          <div class="p-3.5 bg-cyan-50 rounded-xl border border-cyan-200 space-y-1.5">
            <h4 class="font-extrabold text-cyan-900 text-xs flex items-center gap-1.5">
              <span>🚀</span> <span>GỢI Ý HOẠT ĐỘNG DẠY HỌC & THỰC HÀNH TƯƠNG TÁC</span>
            </h4>
            <ul class="list-disc list-inside text-cyan-800 space-y-1 font-medium pl-1">
              ${summary.suggestedActivities.map(a => `<li>${a}</li>`).join("")}
            </ul>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-400">
            <span>Độ tin cậy: <b>${summary.aiConfidence}</b></span>
            <button onclick="document.getElementById('lecture-ai-summary-modal').classList.remove('active')" class="btn btn-primary btn-sm font-black">
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  // =========================================================================
  // SLIDE-TO-VIDEO: CHỌN GIỌNG ĐỌC NAM/NỮ, TỐC ĐỘ VÀ HIỆU ỨNG 3D FLIP
  // =========================================================================
  async openSlideVideoPlayer(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    this.activeVideoLecture = lecture;
    this.videoSlideFrames = window.lectureService.generateSlideFrames(lecture);
    this.currentSlideIndex = 0;
    this.isVideoPlaying = false;
    if (this.videoTimer) clearInterval(this.videoTimer);

    const modal = document.getElementById("slide-video-player-modal");
    if (modal) modal.classList.add("active");

    this.renderVideoSlide();
  }

  closeSlideVideoPlayer() {
    this.pauseVideo();
    if (this.speechSynth) this.speechSynth.cancel();
    const modal = document.getElementById("slide-video-player-modal");
    if (modal) modal.classList.remove("active");
  }

  setVoiceGender(gender) {
    this.voiceGender = gender;
    window.app.showToast(`🎙️ Đã chuyển sang Giọng đọc ${gender === 'female' ? 'Cô giáo (Nữ)' : 'Thầy giáo (Nam)'}!`, "info");
    const frame = this.videoSlideFrames[this.currentSlideIndex];
    if (frame) this.speakNarration(frame.narration);
  }

  setSpeechRate(rate) {
    this.speechRate = parseFloat(rate);
    window.app.showToast(`⚡ Tốc độ đọc: ${rate}x`, "info");
  }

  toggle3DFlip() {
    this.is3DFlipEnabled = !this.is3DFlipEnabled;
    window.app.showToast(`📖 Chế độ hiệu ứng 3D Lật Sách: ${this.is3DFlipEnabled ? 'BẬT' : 'TẮT'}`, "info");
    this.renderVideoSlide();
  }

  renderVideoSlide() {
    const frame = this.videoSlideFrames[this.currentSlideIndex];
    if (!frame) return;

    const screenContainer = document.getElementById("video-slide-screen");
    const progressText = document.getElementById("video-slide-progress-text");
    const progressBar = document.getElementById("video-slide-progress-bar");

    if (progressText) progressText.innerText = `Trang ${this.currentSlideIndex + 1}/${this.videoSlideFrames.length}`;
    if (progressBar) progressBar.style.width = `${((this.currentSlideIndex + 1) / this.videoSlideFrames.length) * 100}%`;

    const flipAnimClass = this.is3DFlipEnabled ? "animate-pop duration-500 transform-gpu" : "";

    if (screenContainer) {
      screenContainer.className = `w-full h-full bg-gradient-to-br ${frame.color} text-white p-6 md:p-8 flex flex-col justify-between rounded-2xl shadow-2xl transition-all relative overflow-hidden ${flipAnimClass}`;
      screenContainer.innerHTML = `
        <div class="absolute -right-10 -bottom-10 text-9xl opacity-10 select-none pointer-events-none">${frame.icon}</div>

        <div class="space-y-1 relative z-10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-3xl">${frame.icon}</span>
              <span class="text-xs font-black tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">${frame.heading}</span>
            </div>
            <span class="badge bg-black/30 text-amber-300 font-black text-[10px]">
              ${this.is3DFlipEnabled ? '📖 3D Flip Active' : '📺 Flat Mode'}
            </span>
          </div>
          <h2 class="text-lg md:text-2xl font-black text-white pt-1">${frame.subtitle}</h2>
        </div>

        <div class="bg-black/30 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/20 space-y-2.5 my-auto relative z-10 shadow-inner">
          ${frame.bulletPoints.map(bp => `
            <div class="flex items-start gap-2.5 text-xs md:text-sm font-bold text-white/95">
              <span class="text-amber-300 mt-0.5">⭐</span>
              <span>${bp}</span>
            </div>
          `).join("")}
        </div>

        <div class="p-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 text-[11px] text-cyan-100 flex items-center justify-between gap-2 relative z-10">
          <div class="flex items-center gap-2">
            <span class="text-base animate-pulse">🎙️</span>
            <span><b>Thuyết minh (${this.voiceGender === 'female' ? 'Cô Giáo' : 'Thầy Giáo'}):</b> "${frame.narration}"</span>
          </div>
          <button onclick="lecturePortal.speakNarration('${frame.narration.replace(/'/g, "\\'")}')" class="btn btn-outline btn-xs text-white border-white/40 hover:bg-white/20 shrink-0" title="Nghe lại lời thuyết minh">
            🔊 Nghe Lại
          </button>
        </div>
      `;
    }

    this.speakNarration(frame.narration);
  }

  speakNarration(text) {
    if (!this.speechSynth) return;
    this.speechSynth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = this.speechRate;
    utterance.pitch = this.voiceGender === "female" ? 1.2 : 0.85;

    const voices = this.speechSynth.getVoices();
    const viVoices = voices.filter(v => v.lang.includes("vi") || v.lang.includes("VN"));

    if (viVoices.length > 0) {
      if (this.voiceGender === "female") {
        utterance.voice = viVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("hoaimy") || v.name.toLowerCase().includes("google")) || viVoices[0];
      } else {
        utterance.voice = viVoices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("an")) || viVoices[viVoices.length - 1];
      }
    }

    this.speechSynth.speak(utterance);
  }

  togglePlayVideo() {
    this.isVideoPlaying = !this.isVideoPlaying;
    const btn = document.getElementById("btn-toggle-video-play");

    if (this.isVideoPlaying) {
      if (btn) btn.innerHTML = "<span>⏸️</span> <span>Tạm Dừng</span>";
      this.startVideoAutoAdvance();
    } else {
      if (btn) btn.innerHTML = "<span>▶️</span> <span>Phát Video</span>";
      this.pauseVideo();
    }
  }

  startVideoAutoAdvance() {
    if (this.videoTimer) clearInterval(this.videoTimer);
    this.videoTimer = setInterval(() => {
      if (this.currentSlideIndex + 1 < this.videoSlideFrames.length) {
        this.currentSlideIndex++;
        this.renderVideoSlide();
      } else {
        this.pauseVideo();
        const btn = document.getElementById("btn-toggle-video-play");
        if (btn) btn.innerHTML = "<span>🔄</span> <span>Phát Lại Từ Đầu</span>";
        window.app.showToast("🎉 Đã hoàn thành xem Video bài giảng hoạt họa!", "success");
      }
    }, 9500);
  }

  pauseVideo() {
    this.isVideoPlaying = false;
    if (this.videoTimer) clearInterval(this.videoTimer);
  }

  nextSlideVideo() {
    if (this.currentSlideIndex + 1 < this.videoSlideFrames.length) {
      this.currentSlideIndex++;
      this.renderVideoSlide();
    }
  }

  prevSlideVideo() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.renderVideoSlide();
    }
  }

  // =========================================================================
  // GAME KHỞI ĐỘNG NHANH 3 PHÚT (ICE-BREAKER MINIGAME)
  // =========================================================================
  async openIcebreakerGame(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    this.icebreakerScore = 0;
    this.icebreakerTimer = 180;
    this.icebreakerCurrentQ = 0;
    if (this.icebreakerInterval) clearInterval(this.icebreakerInterval);

    this.icebreakerQuestions = [
      {
        q: "⚡ Câu Đố 1: Thiết bị nào giúp em nhìn thấy chữ, tranh ảnh và video bài học?",
        options: ["A. Chuột máy tính", "B. Màn hình", "C. Thân máy", "D. Bàn phím"],
        correct: 1,
        hint: "Thiết bị có mặt kính phát sáng!"
      },
      {
        q: "⚡ Câu Đố 2: Trước khi rời khỏi phòng tin học, chúng mình cần làm gì để an toàn?",
        options: ["A. Rút phích cắm nguồn giật mạnh", "B. Tắt máy tính đúng quy trình và xếp ghế gọn", "C. Để nguyên máy chạy", "D. Vứt rác trên bàn"],
        correct: 1,
        hint: "Bấm Start ➡️ Shut down và bảo quản máy!"
      },
      {
        q: "⚡ Câu Đố 3: Phím F và J trên bàn phím có điểm gì đặc biệt để đặt ngón trỏ?",
        options: ["A. Có gờ nổi nhỏ", "B. Có màu đỏ", "C. Có kích thước to gấp đôi", "D. Nằm ở hàng phím số"],
        correct: 0,
        hint: "Hai phím có gờ định vị hàng phím cơ sở!"
      }
    ];

    const modal = document.getElementById("icebreaker-game-modal");
    if (modal) modal.classList.add("active");

    this.startIcebreakerTimer();
    this.renderIcebreakerQuestion(lecture.title);
  }

  startIcebreakerTimer() {
    const timerDisp = document.getElementById("icebreaker-timer-disp");
    this.icebreakerInterval = setInterval(() => {
      this.icebreakerTimer--;
      const mins = Math.floor(this.icebreakerTimer / 60);
      const secs = this.icebreakerTimer % 60;
      if (timerDisp) timerDisp.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      if (this.icebreakerTimer <= 0) {
        clearInterval(this.icebreakerInterval);
        this.finishIcebreaker();
      }
    }, 1000);
  }

  renderIcebreakerQuestion(lectureTitle) {
    const container = document.getElementById("icebreaker-game-content");
    const q = this.icebreakerQuestions[this.icebreakerCurrentQ];

    if (!q) {
      this.finishIcebreaker();
      return;
    }

    if (container) {
      container.innerHTML = `
        <div class="space-y-5 animate-pop">
          <div class="text-center space-y-1">
            <span class="badge badge-emerald font-black">CÂU HỎI ${this.icebreakerCurrentQ + 1}/3</span>
            <h3 class="text-lg font-black text-slate-900">${q.q}</h3>
            <p class="text-xs text-slate-500 font-semibold">💡 Gợi ý: ${q.hint}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${q.options.map((opt, idx) => `
              <button onclick="lecturePortal.answerIcebreaker(${idx})" class="p-4 bg-slate-50 hover:bg-cyan-50 border-2 border-slate-200 hover:border-cyan-500 rounded-2xl font-bold text-xs text-slate-800 text-left transition-all hover:scale-102 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 font-black text-xs flex items-center justify-center shrink-0">${['A', 'B', 'C', 'D'][idx]}</span>
                <span>${opt}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `;
    }
  }

  answerIcebreaker(selectedIndex) {
    const q = this.icebreakerQuestions[this.icebreakerCurrentQ];
    if (selectedIndex === q.correct) {
      this.icebreakerScore += 10;
      window.app.showToast("🎉 Chính xác! +10 Điểm Khởi Động ⭐", "success");
    } else {
      window.app.showToast("Tiếc quá, chưa chính xác rồi!", "warning");
    }

    this.icebreakerCurrentQ++;
    if (this.icebreakerCurrentQ < this.icebreakerQuestions.length) {
      this.renderIcebreakerQuestion();
    } else {
      this.finishIcebreaker();
    }
  }

  finishIcebreaker() {
    if (this.icebreakerInterval) clearInterval(this.icebreakerInterval);
    const container = document.getElementById("icebreaker-game-content");

    if (container) {
      container.innerHTML = `
        <div class="text-center py-6 space-y-4 animate-pop">
          <span class="text-6xl block">🏆</span>
          <h3 class="text-2xl font-black text-slate-900">HOÀN THÀNH KHỞI ĐỘNG ĐẦU GIỜ!</h3>
          <p class="text-xs text-slate-600">Cả lớp đã sẵn sàng năng lượng tích cực 100% để bước vào bài giảng chính thức!</p>
          
          <div class="inline-block p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <p class="text-xs font-bold text-amber-800">Tổng Điểm Khởi Động Đạt Được:</p>
            <p class="text-3xl font-black text-amber-600">${this.icebreakerScore}/30 ⭐</p>
          </div>

          <div class="pt-3">
            <button onclick="document.getElementById('icebreaker-game-modal').classList.remove('active')" class="btn btn-primary font-black btn-md px-8 shadow-lg">
              🚀 Bắt Đầu Giảng Bài Ngay!
            </button>
          </div>
        </div>
      `;
    }
  }

  closeIcebreakerModal() {
    if (this.icebreakerInterval) clearInterval(this.icebreakerInterval);
    const modal = document.getElementById("icebreaker-game-modal");
    if (modal) modal.classList.remove("active");
  }

  // =========================================================================
  // TRÌNH CHIẾU ONLINE & TẢI VỀ
  // =========================================================================
  async previewLecture(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    await window.lectureService.recordAction(id, 'view');

    const modal = document.getElementById("lecture-preview-modal");
    const titleDisp = document.getElementById("lec-preview-title");
    const frame = document.getElementById("lec-preview-iframe");

    if (titleDisp) titleDisp.innerText = lecture.title;

    if (frame) {
      let embedUrl = lecture.fileUrl;
      if (embedUrl.startsWith("http") && !embedUrl.includes("view.officeapps.live.com") && !embedUrl.includes("drive.google.com") && !embedUrl.includes("canva.com")) {
        embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(embedUrl)}`;
      }
      frame.src = embedUrl;
    }

    if (modal) modal.classList.add("active");
  }

  closePreviewModal() {
    const modal = document.getElementById("lecture-preview-modal");
    const frame = document.getElementById("lec-preview-iframe");
    if (frame) frame.src = "";
    if (modal) modal.classList.remove("active");
  }

  async downloadLecture(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    await window.lectureService.recordAction(id, 'download');

    if (lecture.fileUrl.startsWith("data:") || lecture.fileUrl.startsWith("blob:")) {
      const a = document.createElement("a");
      a.href = lecture.fileUrl;
      a.download = lecture.fileName || "BaiGiang_TinHoc.pptx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(lecture.fileUrl, "_blank");
    }

    window.app.showToast(`📥 Đang tải xuống bài giảng: ${lecture.fileName}`, "success");
    this.render("main-content-area");
  }
}

window.lecturePortal = new LecturePortal();
