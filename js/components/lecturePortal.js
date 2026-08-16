/**
 * LECTURE PORTAL COMPONENT
 * Quản lý Bài Giảng Điện Tử & Slide PowerPoint:
 * 1. 📂 3 Thư mục con: Bài giảng Tin lớp 3, Bài giảng Tin lớp 4, Bài giảng Tin lớp 5
 * 2. 📤 Nút đưa bài giảng lên cho Giáo viên (Đồng bộ Supabase Cloud & Local)
 * 3. 🎨 Bút Laser đỏ & Bút dạ quang khi Trình chiếu Slide (Laser Pointer & Pen Tool)
 * 4. ⚡ Đố vui 10s tương tác trực tiếp trên Slide (In-Slide Quick Quiz 10s)
 * 5. 📖 Sách 3D lật trang siêu thực có âm thanh sột soạt (3D Flipbook E-Book Viewer)
 * 6. 📈 Bảng Vàng Xếp Hạng & Báo Cáo Mức Độ Yêu Thích Bài Giảng Của Trường
 * 7. 🎬 Video hoạt họa thuyết minh AI đa giọng đọc và chuyển cảnh tự động
 * 8. 📄 Tải Giáo Án Word chuẩn Công văn 2345 & 📦 Gói Học Liệu Trọn Bộ
 * 9. 🍂 Lọc Học Kỳ 1 & 🌸 Học Kỳ 2 theo chương trình GDPT 2018
 * 10. ⏱️ Đồng hồ hoạt động nhóm 1-10P có Nhạc Lofi & Chuông báo hết giờ
 */

class LecturePortal {
  constructor() {
    this.currentGrade = "all";
    this.currentBookSeries = "all";
    this.currentSemester = "all"; // 'all' | 'sem1' | 'sem2'
    this.currentTab = "all"; // 'all' | 'my_lectures' | 'favorites'
    this.selectedFolder = "all"; // 'all' | 3 | 4 | 5
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

    // 3D Flipbook State
    this.activeFlipbookLecture = null;
    this.flipbookPages = [];
    this.currentFlipbookIndex = 0; // Chứa cặp trang: 0 = trang 1-2, 2 = trang 3-4...
    this.isAutoFlipRunning = false;
    this.autoFlipTimer = null;

    // In-Slide Quick Quiz 10s State
    this.inSlideQuizActive = false;
    this.inSlideQuizTimer = 10;
    this.inSlideQuizInterval = null;
    this.currentInSlideQuestion = null;
    this.isInSlideAnswerRevealed = false;

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

    // Drawing Canvas State (Laser & Pen)
    this.isDrawingActive = false;
    this.drawTool = "laser"; // 'laser' | 'highlighter' | 'red_pen' | 'blue_pen' | 'chalk' | 'eraser'
    this.isPainting = false;
    this.activeCanvas = null;
    this.activeCtx = null;
    this.lastX = 0;
    this.lastY = 0;
    this.laserTimer = null;

    // Group Work Timer State
    this.groupTimerSeconds = 180;
    this.groupTimerInitial = 180;
    this.groupTimerInterval = null;
    this.isGroupTimerRunning = false;
    this.isLofiMusicOn = true;
    this.audioCtx = null;
    this.lofiOscillator = null;
  }

  async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');
    
    // Tải toàn bộ bài giảng
    const effectiveGrade = this.selectedFolder !== "all" ? this.selectedFolder : this.currentGrade;
    let allLectures = await window.lectureService.getAllLectures(effectiveGrade, this.searchQuery, this.currentBookSeries, this.currentSemester);
    const favoriteIds = window.lectureService.getFavoriteIds();
    
    // Thống kê theo 3 thư mục con
    const rawAll = await window.lectureService.getAllLectures("all");
    const countLop3 = rawAll.filter(l => l.grade === 3).length;
    const countLop4 = rawAll.filter(l => l.grade === 4).length;
    const countLop5 = rawAll.filter(l => l.grade === 5).length;

    // Đếm số lượng theo danh mục
    const myLecturesCount = user ? allLectures.filter(l => (l.createdByUsername === user.username) || (l.authorName === user.name) || user.role === 'admin').length : 0;
    const favoritesCount = allLectures.filter(l => favoriteIds.includes(l.id)).length;

    if (this.currentTab === "my_lectures" && user) {
      this.lectures = allLectures.filter(l => (l.createdByUsername === user.username) || (l.authorName === user.name) || user.role === 'admin');
    } else if (this.currentTab === "favorites") {
      this.lectures = allLectures.filter(l => favoriteIds.includes(l.id));
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
            <p class="text-cyan-100 text-xs md:text-sm">Trình chiếu slide có Bút Laser & Đố vui 10s, Sách 3D lật trang, Video hoạt họa AI và Bảng Vàng Thống Kê</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="lecturePortal.openGroupTimerModal()" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md">
              <span class="text-base">⏱️</span> <span>Đồng Hồ Nhóm</span>
            </button>
            <button onclick="lecturePortal.openAnalyticsModal()" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md" title="Mở Báo Cáo Thống Kê & Bảng Vàng Yêu Thích Của Trường">
              <span>📈</span> <span>Bảng Vàng & Thống Kê</span>
            </button>
            <button onclick="lectureUploadModal.openModal(${effectiveGrade !== 'all' ? effectiveGrade : 3})" class="btn btn-amber btn-lg font-black shadow-xl flex items-center gap-2 shrink-0 hover:scale-105 transition-all">
              <span class="text-xl">📤</span> <span>Đưa Bài Giảng Lên</span>
            </button>
          </div>
        </div>

        <!-- 3 THƯ MỤC CON: BÀI GIẢNG MÔN TIN LỚP 3, LỚP 4, LỚP 5 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>📁 THƯ MỤC BÀI GIẢNG THEO KHỐI LỚP</span>
              <span class="badge badge-cyan text-xs font-black">GDPT 2018</span>
            </h3>
            ${this.selectedFolder !== 'all' ? `
              <button onclick="lecturePortal.selectFolder('all')" class="text-xs font-bold text-cyan-700 hover:text-cyan-900 bg-cyan-50 px-3 py-1 rounded-xl border border-cyan-200">
                ✕ Hiển thị tất cả các lớp
              </button>
            ` : ''}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Thư mục 1: Lớp 3 -->
            <div onclick="lecturePortal.selectFolder(3)" class="p-5 rounded-3xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between space-y-3 group ${this.selectedFolder === 3 ? 'border-cyan-600 bg-gradient-to-br from-cyan-50 via-white to-blue-50/40 ring-2 ring-cyan-400' : 'border-slate-200 bg-white hover:border-cyan-400'}">
              <div class="flex items-center justify-between">
                <span class="text-4xl p-2.5 bg-blue-100 text-blue-800 rounded-2xl group-hover:scale-110 transition-all">🎒</span>
                <span class="badge bg-blue-600 text-white font-black text-xs">${countLop3} Bài Giảng</span>
              </div>
              <div>
                <h4 class="font-black text-base text-slate-900 group-hover:text-blue-700">Bài Giảng Môn Tin Lớp 3</h4>
                <p class="text-xs text-slate-500 mt-0.5">Khám phá máy tính, bàn phím chuột, thư mục & sắp xếp đồ vật</p>
              </div>
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-blue-700 font-black flex items-center gap-1">📂 Vào thư mục ➔</span>
                <button onclick="event.stopPropagation(); lectureUploadModal.openModal(3)" class="text-amber-800 font-bold bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
                  <span>➕</span> <span>Đưa Bài Lên</span>
                </button>
              </div>
            </div>

            <!-- Thư mục 2: Lớp 4 -->
            <div onclick="lecturePortal.selectFolder(4)" class="p-5 rounded-3xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between space-y-3 group ${this.selectedFolder === 4 ? 'border-purple-600 bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 ring-2 ring-purple-400' : 'border-slate-200 bg-white hover:border-purple-400'}">
              <div class="flex items-center justify-between">
                <span class="text-4xl p-2.5 bg-purple-100 text-purple-800 rounded-2xl group-hover:scale-110 transition-all">🚀</span>
                <span class="badge bg-purple-600 text-white font-black text-xs">${countLop4} Bài Giảng</span>
              </div>
              <div>
                <h4 class="font-black text-base text-slate-900 group-hover:text-purple-700">Bài Giảng Môn Tin Lớp 4</h4>
                <p class="text-xs text-slate-500 mt-0.5">Soạn thảo văn bản Word, Chèn ảnh, Tìm kiếm Internet & Lập trình Scratch</p>
              </div>
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-purple-700 font-black flex items-center gap-1">📂 Vào thư mục ➔</span>
                <button onclick="event.stopPropagation(); lectureUploadModal.openModal(4)" class="text-amber-800 font-bold bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
                  <span>➕</span> <span>Đưa Bài Lên</span>
                </button>
              </div>
            </div>

            <!-- Thư mục 3: Lớp 5 -->
            <div onclick="lecturePortal.selectFolder(5)" class="p-5 rounded-3xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between space-y-3 group ${this.selectedFolder === 5 ? 'border-emerald-600 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 ring-2 ring-emerald-400' : 'border-slate-200 bg-white hover:border-emerald-400'}">
              <div class="flex items-center justify-between">
                <span class="text-4xl p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl group-hover:scale-110 transition-all">⭐</span>
                <span class="badge bg-emerald-600 text-white font-black text-xs">${countLop5} Bài Giảng</span>
              </div>
              <div>
                <h4 class="font-black text-base text-slate-900 group-hover:text-emerald-700">Bài Giảng Môn Tin Lớp 5</h4>
                <p class="text-xs text-slate-500 mt-0.5">Bảng tính điện tử, Trình chiếu nâng cao, Đạo đức số & Dự án đa phương tiện</p>
              </div>
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-emerald-700 font-black flex items-center gap-1">📂 Vào thư mục ➔</span>
                <button onclick="event.stopPropagation(); lectureUploadModal.openModal(5)" class="text-amber-800 font-bold bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
                  <span>➕</span> <span>Đưa Bài Lên</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Thanh 3 Tab Chuyển Đổi: Tất Cả | Bài Giảng Của Tôi | Bài Giảng Yêu Thích -->
        <div class="flex items-center gap-2.5 border-b border-slate-200 pb-2 flex-wrap">
          <button onclick="lecturePortal.switchTab('all')" class="px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'all' ? 'bg-cyan-700 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            <span>📂 Tất Cả Bài Giảng</span>
            <span class="badge ${this.currentTab === 'all' ? 'bg-white/25 text-white' : 'badge-slate'} text-[10px]">${allLectures.length}</span>
          </button>
          
          <button onclick="lecturePortal.switchTab('favorites')" class="px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'favorites' ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            <span>⭐ Bài Giảng Yêu Thích</span>
            <span class="badge ${this.currentTab === 'favorites' ? 'bg-white/25 text-white' : 'badge-rose'} text-[10px]">${favoritesCount}</span>
          </button>

          <button onclick="lecturePortal.switchTab('my_lectures')" class="px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'my_lectures' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            <span>👨‍🏫 Bài Giảng Của Tôi</span>
            <span class="badge ${this.currentTab === 'my_lectures' ? 'bg-white/25 text-white' : 'badge-amber'} text-[10px]">${myLecturesCount}</span>
          </button>
        </div>

        <!-- Thanh Bộ Lọc Kép: Khối Lớp + 3 Bộ Sách Giáo Khoa + Học Kỳ 1 & 2 + Ô Tìm Kiếm -->
        <div class="glass-card p-5 space-y-4">
          <!-- Hàng 1: Lọc Khối Lớp & Tìm Kiếm -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-500 mr-1">Khối Lớp:</span>
              <button onclick="lecturePortal.selectGrade('all')" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 'all' && this.selectedFolder === 'all' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                Tất Cả Khối
              </button>
              <button onclick="lecturePortal.selectFolder(3)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.selectedFolder === 3 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                🎒 Lớp 3
              </button>
              <button onclick="lecturePortal.selectFolder(4)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.selectedFolder === 4 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                🚀 Lớp 4
              </button>
              <button onclick="lecturePortal.selectFolder(5)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.selectedFolder === 5 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                ⭐ Lớp 5
              </button>
            </div>

            <!-- Ô Tìm Kiếm -->
            <div class="relative w-full md:w-80">
              <input type="text" id="lecture-search-input" value="${this.searchQuery}" oninput="lecturePortal.handleSearch(this.value)" placeholder="Tìm bài giảng, tác giả, chủ đề..." class="form-control text-xs pl-9 font-medium">
              <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
          </div>

          <!-- Hàng 2: Lọc Theo 3 Bộ Sách Giáo Khoa & Phân Loại Học Kỳ 1 - Học Kỳ 2 -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/70">
            <!-- Bộ Sách -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-500 mr-1">Bộ Sách:</span>
              <button onclick="lecturePortal.selectBookSeries('all')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'all' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                Tất Cả
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

            <!-- Phân loại Học Kỳ 1 & Học Kỳ 2 -->
            <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <span class="text-[11px] font-bold text-slate-500 px-1">🗓️ Học Kỳ:</span>
              <button onclick="lecturePortal.selectSemester('all')" class="px-2.5 py-1 rounded-lg text-xs font-black transition-all ${this.currentSemester === 'all' ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
                Cả Năm
              </button>
              <button onclick="lecturePortal.selectSemester('sem1')" class="px-2.5 py-1 rounded-lg text-xs font-black transition-all ${this.currentSemester === 'sem1' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
                🍂 Học Kỳ 1
              </button>
              <button onclick="lecturePortal.selectSemester('sem2')" class="px-2.5 py-1 rounded-lg text-xs font-black transition-all ${this.currentSemester === 'sem2' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
                🌸 Học Kỳ 2
              </button>
            </div>
          </div>
        </div>

        <!-- Danh Sách Card Bài Giảng Điện Tử -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>📚 DANH SÁCH BÀI GIẢNG ${this.selectedFolder !== 'all' ? `KHỐI ${this.selectedFolder}` : ''} ${this.currentSemester === 'sem1' ? '(HỌC KỲ 1)' : (this.currentSemester === 'sem2' ? '(HỌC KỲ 2)' : '')}</span>
              <span class="badge badge-cyan font-black text-xs">${this.lectures.length} Bài</span>
            </h3>
            <button onclick="lectureUploadModal.openModal(${this.selectedFolder !== 'all' ? this.selectedFolder : 3})" class="btn btn-amber btn-xs font-black shadow-md flex items-center gap-1">
              <span>➕</span> <span>Đưa Bài Giảng Lên</span>
            </button>
          </div>

          ${this.renderLectureGrid(isTeacher, user)}
        </div>
      </div>
    `;
  }

  selectFolder(grade) {
    this.selectedFolder = grade;
    this.currentGrade = grade;
    this.render("main-content-area");
  }

  selectSemester(sem) {
    this.currentSemester = sem;
    this.render("main-content-area");
  }

  // Render lưới thẻ bài giảng
  renderLectureGrid(isTeacher, user) {
    if (this.lectures.length === 0) {
      return `
        <div class="text-center py-16 glass-card space-y-3 text-slate-400">
          <span class="text-6xl block mb-2 animate-bounce">📊</span>
          <p class="font-black text-slate-700 text-base">Chưa có bài giảng nào trong mục này.</p>
          <p class="text-xs text-slate-500">Thầy Cô hãy bấm vào nút dưới đây để tải lên bài giảng PowerPoint (.pptx, .ppt, .pdf) của mình!</p>
          <button onclick="lectureUploadModal.openModal(${this.selectedFolder !== 'all' ? this.selectedFolder : 3})" class="btn btn-amber btn-md font-black mt-2 shadow-lg hover:scale-105 transition-all">
            📤 Đưa Bài Giảng Lên Ngay
          </button>
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
          const isFav = window.lectureService.isFavorite(l.id);
          const semesterText = l.semester === "sem2" ? "🌸 Học Kỳ 2" : "🍂 Học Kỳ 1";

          return `
            <div class="glass-card overflow-hidden hover:border-cyan-500 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group relative">
              <!-- Header Thumbnail Gradient -->
              <div class="p-5 bg-gradient-to-br ${l.thumbnailColor || 'from-blue-600 to-cyan-500'} text-white space-y-2 relative">
                <div class="flex items-center justify-between gap-1 flex-wrap">
                  <div class="flex items-center gap-1">
                    <span class="badge ${sInfo.bg} text-white font-black text-[10px] uppercase backdrop-blur-sm">
                      ${sInfo.name} • Lớp ${l.grade}
                    </span>
                    <span class="badge bg-black/20 text-amber-200 font-bold text-[10px]">
                      ${semesterText}
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      ${l.slideCount || 20} Slide
                    </span>
                    <!-- Nút Bookmark Yêu thích ⭐ -->
                    <button onclick="lecturePortal.toggleFavorite('${l.id}')" class="p-1 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all hover:scale-110" title="${isFav ? 'Bỏ lưu bài giảng yêu thích' : 'Lưu vào bài giảng yêu thích'}">
                      <span class="text-sm">${isFav ? '⭐' : '🤍'}</span>
                    </button>
                  </div>
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
                  <!-- Hàng 1: Video hoạt họa AI + Sách 3D Lật Trang Siêu Thực -->
                  <div class="grid grid-cols-2 gap-2">
                    <button onclick="lecturePortal.openSlideVideoPlayer('${l.id}')" class="btn btn-amber btn-sm font-black flex items-center justify-center gap-1 shadow-sm" title="Tự động chuyển Slide thành Video hoạt họa AI có thuyết minh tiếng Việt">
                      <span>🎬</span> <span>Video Hoạt Họa AI</span>
                    </button>
                    <button onclick="lecturePortal.openFlipbook('${l.id}')" class="btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white btn-sm font-black flex items-center justify-center gap-1 shadow-sm hover:scale-105 transition-all" title="Trình chiếu Sách 3D Lật Trang Siêu Thực có âm thanh sột soạt">
                      <span>📖</span> <span>Sách 3D Lật Trang</span>
                    </button>
                  </div>

                  <!-- Hàng 2: Tải Giáo Án CV 2345 (.doc) + Khởi Động 3P + Phiếu Bài Tập Word -->
                  <div class="grid grid-cols-3 gap-1.5">
                    <button onclick="lecturePortal.downloadLessonPlanDoc('${l.id}')" class="btn btn-outline btn-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 flex items-center justify-center gap-1" title="Tải Kế hoạch bài dạy Giáo án Word chuẩn Công văn 2345">
                      <span>📄</span> <span>Giáo Án</span>
                    </button>
                    <button onclick="lecturePortal.openIcebreakerGame('${l.id}')" class="btn btn-outline btn-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 flex items-center justify-center gap-1" title="Trò chơi đố vui khởi động 3 phút đầu giờ">
                      <span>⚡</span> <span>Khởi Động</span>
                    </button>
                    <button onclick="lecturePortal.downloadWorksheet('${l.id}')" class="btn btn-outline btn-xs font-black text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border-cyan-200 flex items-center justify-center gap-1" title="Tải Phiếu bài tập in ấn Word (.doc) cho học sinh">
                      <span>📝</span> <span>Phiếu BT</span>
                    </button>
                  </div>

                  <!-- Hàng 3: Trình chiếu Slide (Có Bút Laser & Đố vui 10s) + Tải PPT + Gói Trọn Bộ + Sửa + Xóa -->
                  <div class="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 flex-wrap">
                    <button onclick="lecturePortal.previewLecture('${l.id}')" class="btn btn-primary btn-sm flex-1 font-black flex items-center justify-center gap-1 shadow-sm" title="Trình chiếu Slide toàn màn hình có Bút Laser & Đố Vui 10s">
                      <span>🎨</span> <span>Trình Chiếu & Laser</span>
                    </button>
                    <button onclick="lecturePortal.downloadLecture('${l.id}')" class="btn btn-outline btn-sm font-bold flex items-center gap-1" title="Tải file PowerPoint về máy">
                      <span>📥</span> <span>Tải PPT</span>
                    </button>
                    <button onclick="lecturePortal.downloadBundleZip('${l.id}')" class="btn btn-outline btn-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border-amber-300 flex items-center gap-1" title="Tải trọn bộ Gói học liệu (Slide PPTX + Giáo án Word + Phiếu bài tập)">
                      <span>📦</span> <span>Trọn Gói</span>
                    </button>

                    <button onclick="lectureUploadModal.openEditModal('${l.id}')" class="p-2 text-cyan-700 hover:bg-cyan-100 rounded-xl font-bold border border-cyan-200 transition-all hover:scale-105" title="Chỉnh sửa thông tin & đổi file PowerPoint">
                      ✏️
                    </button>
                    <button onclick="lecturePortal.openDeleteConfirmModal('${l.id}', '${l.title.replace(/'/g, "\\'")}')" class="p-2 text-rose-600 hover:bg-rose-100 rounded-xl font-bold border border-rose-200 transition-all hover:scale-105" title="Xóa bỏ bài giảng này khỏi hệ thống & Supabase">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // Đánh dấu yêu thích bài giảng
  toggleFavorite(id) {
    const isFav = window.lectureService.toggleFavorite(id);
    window.app.showToast(isFav ? "⭐ Đã thêm bài giảng vào mục Yêu Thích!" : "Đã xóa khỏi mục Yêu Thích!", "info");
    this.render("main-content-area");
  }

  // Chuyển Tab (Tất cả vs Bài giảng của tôi vs Yêu thích)
  switchTab(tab) {
    this.currentTab = tab;
    this.render("main-content-area");
  }

  selectGrade(grade) {
    this.currentGrade = grade;
    this.selectedFolder = grade;
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
  // OPTION 3: BẢNG VÀNG XẾP HẠNG & BÁO CÁO MỨC ĐỘ YÊU THÍCH BÀI GIẢNG CỦA TRƯỜNG
  // =========================================================================
  async openAnalyticsModal() {
    const modal = document.getElementById("lecture-analytics-modal");
    const contentEl = document.getElementById("lec-analytics-content");
    if (!modal || !contentEl) return;

    window.app.showToast("📊 Đang tổng hợp số liệu Bảng Vàng & Mức độ yêu thích...", "info");
    const summary = await window.lectureService.getAnalyticsSummary();

    const maxViews = Math.max(...Object.values(summary.gradeStats).map(g => g.views), 10);

    contentEl.innerHTML = `
      <div class="space-y-6 text-xs text-slate-800 animate-pop">
        <!-- 4 Khung Thống Kê Tổng Quan -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div class="p-3 bg-blue-50 rounded-2xl border border-blue-200">
            <span class="text-2xl block mb-1">📚</span>
            <p class="text-xs text-slate-500 font-bold">Tổng Bài Giảng</p>
            <h4 class="text-xl font-black text-blue-900 font-mono">${summary.totalLectures}</h4>
          </div>
          <div class="p-3 bg-cyan-50 rounded-2xl border border-cyan-200">
            <span class="text-2xl block mb-1">👁️</span>
            <p class="text-xs text-slate-500 font-bold">Tổng Lượt Xem</p>
            <h4 class="text-xl font-black text-cyan-900 font-mono">${summary.totalViews}</h4>
          </div>
          <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span class="text-2xl block mb-1">📥</span>
            <p class="text-xs text-slate-500 font-bold">Lượt Tải PPT</p>
            <h4 class="text-xl font-black text-emerald-900 font-mono">${summary.totalDownloads}</h4>
          </div>
          <div class="p-3 bg-rose-50 rounded-2xl border border-rose-200">
            <span class="text-2xl block mb-1">⭐</span>
            <p class="text-xs text-slate-500 font-bold">Đã Yêu Thích</p>
            <h4 class="text-xl font-black text-rose-900 font-mono">${summary.totalFavorites}</h4>
          </div>
        </div>

        <!-- BẢNG VÀNG: TOP 5 BÀI GIẢNG ĐƯỢC YÊU THÍCH & XEM NHIỀU NHẤT -->
        <div class="space-y-2.5">
          <h4 class="font-black text-slate-900 text-sm flex items-center gap-1.5">
            <span>🏆 BẢNG VÀNG BÀI GIẢNG YÊU THÍCH NHẤT TRƯỜNG</span>
            <span class="badge badge-amber text-[10px] font-black">TOP 5</span>
          </h4>

          <div class="space-y-2">
            ${summary.topLectures.map((item, index) => {
              const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
              const medalColors = ["bg-amber-50 border-amber-300", "bg-slate-100 border-slate-300", "bg-amber-100/50 border-amber-200", "bg-white border-slate-200", "bg-white border-slate-200"];

              return `
                <div class="p-3 rounded-2xl border ${medalColors[index] || 'bg-white border-slate-200'} flex items-center justify-between gap-3 shadow-xs hover:scale-101 transition-all">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">${medals[index] || (index + 1)}</span>
                    <div>
                      <h5 class="font-black text-slate-900 text-xs line-clamp-1">${item.title}</h5>
                      <p class="text-[11px] text-slate-500">Lớp ${item.grade} • ${item.authorName || 'Thầy Anh Đào'} • ${item.bookSeries || 'KNTT'}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 text-right shrink-0">
                    <div>
                      <span class="badge badge-cyan font-black text-[10px]">👁️ ${item.viewCount || 0}</span>
                      <span class="badge badge-emerald font-black text-[10px] ml-1">📥 ${item.downloadCount || 0}</span>
                    </div>
                    <button onclick="lecturePortal.previewLecture('${item.id}'); document.getElementById('lecture-analytics-modal').classList.remove('active');" class="btn btn-primary btn-xs font-bold">
                      Xem
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Tỷ Lệ Tương Tác Theo Khối Lớp -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <h4 class="font-black text-slate-900 text-xs">📊 Phân Bố Học Liệu Theo Khối Lớp:</h4>
          
          <div class="space-y-2">
            <div>
              <div class="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>🎒 Khối Lớp 3: ${summary.gradeStats[3].count} bài (${summary.gradeStats[3].views} lượt xem)</span>
                <span>${Math.round((summary.gradeStats[3].views / Math.max(summary.totalViews, 1)) * 100)}%</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: ${Math.max(5, (summary.gradeStats[3].views / Math.max(summary.totalViews, 1)) * 100)}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>🚀 Khối Lớp 4: ${summary.gradeStats[4].count} bài (${summary.gradeStats[4].views} lượt xem)</span>
                <span>${Math.round((summary.gradeStats[4].views / Math.max(summary.totalViews, 1)) * 100)}%</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-purple-600 h-2 rounded-full" style="width: ${Math.max(5, (summary.gradeStats[4].views / Math.max(summary.totalViews, 1)) * 100)}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>⭐ Khối Lớp 5: ${summary.gradeStats[5].count} bài (${summary.gradeStats[5].views} lượt xem)</span>
                <span>${Math.round((summary.gradeStats[5].views / Math.max(summary.totalViews, 1)) * 100)}%</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-emerald-600 h-2 rounded-full" style="width: ${Math.max(5, (summary.gradeStats[5].views / Math.max(summary.totalViews, 1)) * 100)}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
  }

  // =========================================================================
  // OPTION 4: ĐỐ VUI 10S TRÊN SLIDE (IN-SLIDE QUICK QUIZ 10S BLITZ)
  // =========================================================================
  toggleInSlideQuiz() {
    const overlay = document.getElementById("in-slide-quiz-overlay");
    if (!overlay) return;

    this.inSlideQuizActive = !this.inSlideQuizActive;
    if (this.inSlideQuizActive) {
      overlay.classList.remove("hidden");
      this.loadInSlideQuestion();
      this.startInSlideCountdown();
    } else {
      overlay.classList.add("hidden");
      if (this.inSlideQuizInterval) clearInterval(this.inSlideQuizInterval);
    }
  }

  loadInSlideQuestion() {
    const defaultQ = {
      question: "Thiết bị nào sau đây dùng để hiển thị hình ảnh và kết quả làm việc của máy tính?",
      options: ["A. Màn hình", "B. Bàn phím", "C. Chuột", "D. Thân máy"],
      correct: 0,
      explanation: "Màn hình là thiết bị xuất hiển thị hình ảnh cho người dùng quan sát."
    };

    const questions = [
      defaultQ,
      {
        question: "Hai phím cơ sở có gờ nổi trên hàng phím cơ sở là hai phím nào?",
        options: ["A. Phím F và J", "B. Phím G và H", "C. Phím A và L", "D. Phím D và K"],
        correct: 0,
        explanation: "Phím F (ngón trỏ trái) và phím J (ngón trỏ phải) là hai phím có gờ nổi mốc đặt tay."
      },
      {
        question: "Để lưu bài tập vào thư mục của em, em nên đặt tên tệp tin như thế nào?",
        options: ["A. Khong_dau_ngan_gon", "B. ?*:/\\", "C. Để trống tên", "D. Tùy ý dài 100 từ"],
        correct: 0,
        explanation: "Nên đặt tên tệp tin ngắn gọn, không dấu hoặc có ý nghĩa rõ ràng để dễ tìm kiếm."
      },
      {
        question: "Khoảng cách chuẩn từ mắt đến màn hình máy tính để bảo vệ thị lực là bao nhiêu?",
        options: ["A. 50cm đến 80cm", "B. 10cm", "C. 20cm", "D. Càng gần càng tốt"],
        correct: 0,
        explanation: "Khoảng cách từ 50cm đến 80cm (khoảng 1 sải tay) giúp bảo vệ thị lực và tránh mỏi mắt."
      }
    ];

    this.currentInSlideQuestion = questions[Math.floor(Math.random() * questions.length)];
    this.isInSlideAnswerRevealed = false;

    const qBox = document.getElementById("in-slide-question-box");
    const optGrid = document.getElementById("in-slide-options-grid");
    const btnReveal = document.getElementById("btn-reveal-answer");

    if (qBox) qBox.innerText = `❓ ${this.currentInSlideQuestion.question}`;
    if (btnReveal) btnReveal.innerHTML = "📢 Công Bố Đáp Án";

    if (optGrid) {
      optGrid.innerHTML = this.currentInSlideQuestion.options.map((opt, idx) => `
        <button id="in-slide-opt-${idx}" onclick="lecturePortal.selectInSlideOption(${idx})" class="p-2 bg-slate-900 hover:bg-cyan-900 border border-slate-700 hover:border-cyan-400 rounded-xl text-left font-bold text-[11px] text-white transition-all">
          ${opt}
        </button>
      `).join("");
    }
  }

  startInSlideCountdown() {
    if (this.inSlideQuizInterval) clearInterval(this.inSlideQuizInterval);
    this.inSlideQuizTimer = 10;

    const timerBadge = document.getElementById("in-slide-timer-badge");
    const progressEl = document.getElementById("in-slide-timer-progress");

    if (timerBadge) timerBadge.innerText = "10s";
    if (progressEl) progressEl.style.width = "100%";

    this.inSlideQuizInterval = setInterval(() => {
      this.inSlideQuizTimer--;
      if (timerBadge) timerBadge.innerText = `${this.inSlideQuizTimer}s`;

      if (progressEl) {
        progressEl.style.width = `${(this.inSlideQuizTimer / 10) * 100}%`;
      }

      this.playTickSound();

      if (this.inSlideQuizTimer <= 0) {
        clearInterval(this.inSlideQuizInterval);
        if (timerBadge) timerBadge.innerText = "HẾT GIỜ!";
        this.revealInSlideAnswer();
      }
    }, 1000);
  }

  selectInSlideOption(index) {
    if (this.isInSlideAnswerRevealed) return;
    this.revealInSlideAnswer(index);
  }

  revealInSlideAnswer(userSelectedIndex = null) {
    if (this.isInSlideAnswerRevealed) return;
    this.isInSlideAnswerRevealed = true;
    if (this.inSlideQuizInterval) clearInterval(this.inSlideQuizInterval);

    const q = this.currentInSlideQuestion;
    if (!q) return;

    const correctBtn = document.getElementById(`in-slide-opt-${q.correct}`);
    if (correctBtn) {
      correctBtn.classList.remove("bg-slate-900", "border-slate-700");
      correctBtn.classList.add("bg-emerald-600", "border-emerald-300", "text-white", "animate-bounce");
    }

    if (userSelectedIndex !== null && userSelectedIndex !== q.correct) {
      const wrongBtn = document.getElementById(`in-slide-opt-${userSelectedIndex}`);
      if (wrongBtn) {
        wrongBtn.classList.remove("bg-slate-900", "border-slate-700");
        wrongBtn.classList.add("bg-rose-600", "border-rose-300", "text-white");
      }
    }

    this.playTingSound();

    if (window.Simulation3D?.triggerFireworks) {
      window.Simulation3D.triggerFireworks();
    }

    window.app.showToast(`🎉 Đáp án chính xác là: ${q.options[q.correct]}!`, "success");
  }

  restartInSlideQuiz() {
    this.loadInSlideQuestion();
    this.startInSlideCountdown();
  }

  playTickSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  playTingSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.1 + 0.8);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.1);
        osc.stop(this.audioCtx.currentTime + idx * 0.1 + 0.8);
      });
    } catch (e) {}
  }

  // =========================================================================
  // OPTION 5: TRÌNH CHIẾU SÁCH 3D LẬT TRANG SIÊU THỰC (3D FLIPBOOK E-BOOK VIEWER)
  // =========================================================================
  async openFlipbook(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    this.activeFlipbookLecture = lecture;
    this.flipbookPages = window.lectureService.generateFlipbookPages(lecture);
    this.currentFlipbookIndex = 0;
    this.isAutoFlipRunning = false;

    const modal = document.getElementById("lecture-flipbook-modal");
    const titleEl = document.getElementById("flipbook-title-disp");

    if (titleEl) titleEl.innerText = `SÁCH 3D: ${lecture.title.toUpperCase()}`;
    if (modal) modal.classList.add("active");

    this.renderFlipbookPages();
    this.playPageFlipSound();
  }

  closeFlipbookModal() {
    this.stopAutoFlipbook();
    const modal = document.getElementById("lecture-flipbook-modal");
    if (modal) modal.classList.remove("active");
    this.activeFlipbookLecture = null;
  }

  renderFlipbookPages() {
    const leftEl = document.getElementById("flipbook-left-page");
    const rightEl = document.getElementById("flipbook-right-page");
    const indicatorEl = document.getElementById("flipbook-page-indicator");

    if (!leftEl || !rightEl) return;

    const totalPages = this.flipbookPages.length;
    const pageL = this.flipbookPages[this.currentFlipbookIndex];
    const pageR = this.flipbookPages[this.currentFlipbookIndex + 1];

    if (indicatorEl) {
      indicatorEl.innerText = `Trang ${this.currentFlipbookIndex + 1} - ${Math.min(this.currentFlipbookIndex + 2, totalPages)} / ${totalPages}`;
    }

    // Render Trang Trái
    if (pageL) {
      leftEl.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <span class="badge badge-cyan font-black text-[10px]">${pageL.badge}</span>
          <span class="text-xs font-bold text-slate-400">Trang ${pageL.pageNum}</span>
        </div>

        <div class="my-auto py-2">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">${pageL.icon}</span>
            <h4 class="font-black text-sm md:text-base text-slate-900">${pageL.title}</h4>
          </div>
          ${pageL.content}
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-400">
          <span>📖 Sách Giáo Khoa Tin Học GDPT 2018</span>
          <span>Trang ${pageL.pageNum}</span>
        </div>
      `;
    } else {
      leftEl.innerHTML = `<div class="my-auto text-center text-slate-300 font-bold">Trang trống</div>`;
    }

    // Render Trang Phải
    if (pageR) {
      rightEl.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <span class="badge badge-amber font-black text-[10px]">${pageR.badge}</span>
          <span class="text-xs font-bold text-slate-400">Trang ${pageR.pageNum}</span>
        </div>

        <div class="my-auto py-2">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">${pageR.icon}</span>
            <h4 class="font-black text-sm md:text-base text-slate-900">${pageR.title}</h4>
          </div>
          ${pageR.content}
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-400">
          <span>${this.activeFlipbookLecture.title}</span>
          <span>Trang ${pageR.pageNum}</span>
        </div>
      `;
    } else {
      rightEl.innerHTML = `
        <div class="my-auto text-center space-y-2 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <span class="text-5xl block">🎉</span>
          <h4 class="font-black text-slate-900 text-sm">HẾT BÀI HỌC</h4>
          <p class="text-xs text-slate-500">Em hãy đăng nhập Web Vui Học để làm bài tập trắc nghiệm và thí nghiệm 3D nhé!</p>
        </div>
      `;
    }
  }

  nextFlipbookPage() {
    if (this.currentFlipbookIndex + 2 < this.flipbookPages.length) {
      this.currentFlipbookIndex += 2;
      this.renderFlipbookPages();
      this.playPageFlipSound();
    } else {
      window.app.showToast("📖 Đã đến trang cuối cùng của bài học!", "info");
      this.stopAutoFlipbook();
    }
  }

  prevFlipbookPage() {
    if (this.currentFlipbookIndex >= 2) {
      this.currentFlipbookIndex -= 2;
      this.renderFlipbookPages();
      this.playPageFlipSound();
    }
  }

  toggleAutoFlipbook() {
    this.isAutoFlipRunning = !this.isAutoFlipRunning;
    const btn = document.getElementById("btn-toggle-auto-flip");

    if (this.isAutoFlipRunning) {
      if (btn) btn.innerHTML = "<span>⏸️</span> <span>Dừng Tự Động Lật</span>";
      window.app.showToast("▶️ Bắt đầu tự động lật trang mỗi 5 giây!", "info");

      this.autoFlipTimer = setInterval(() => {
        if (this.currentFlipbookIndex + 2 < this.flipbookPages.length) {
          this.nextFlipbookPage();
        } else {
          this.currentFlipbookIndex = 0;
          this.renderFlipbookPages();
          this.playPageFlipSound();
        }
      }, 5000);
    } else {
      this.stopAutoFlipbook();
    }
  }

  stopAutoFlipbook() {
    this.isAutoFlipRunning = false;
    if (this.autoFlipTimer) clearInterval(this.autoFlipTimer);
    const btn = document.getElementById("btn-toggle-auto-flip");
    if (btn) btn.innerHTML = "<span>▶️</span> <span>Tự Động Lật (5s)</span>";
  }

  playPageFlipSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      // Mô phỏng âm thanh lật giấy sột soạt (white noise burst with bandpass filter)
      const bufferSize = this.audioCtx.sampleRate * 0.15; // 150ms
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      filter.Q.setValueAtTime(1.5, this.audioCtx.currentTime);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      whiteNoise.start();
    } catch (e) {}
  }

  // =========================================================================
  // OPTION 1: TRÌNH CHIẾU SLIDE & BẢNG VẼ BÚT LASER / DẠ QUANG
  // =========================================================================
  async previewLecture(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    window.lectureService.incrementViewCount(lectureId);

    const modal = document.getElementById("lecture-preview-modal");
    const iframe = document.getElementById("lec-preview-iframe");
    const titleEl = document.getElementById("lec-preview-title");

    if (titleEl) titleEl.innerText = `${lecture.title} (Lớp ${lecture.grade})`;
    if (iframe) {
      iframe.src = lecture.fileUrl || "https://docs.google.com/presentation/d/e/2PACX-1vT1Z5u7.../embed";
    }

    if (modal) modal.classList.add("active");
    this.initDrawingCanvas("lec-preview-canvas");
  }

  closePreviewModal() {
    const modal = document.getElementById("lecture-preview-modal");
    if (modal) modal.classList.remove("active");
    this.disableDrawingMode("lec-preview-canvas");
    if (this.inSlideQuizActive) this.toggleInSlideQuiz();
  }

  toggleDrawingMode(canvasId) {
    this.isDrawingActive = !this.isDrawingActive;
    const toolbar = document.getElementById(`drawing-toolbar-${canvasId}`);
    const canvas = document.getElementById(canvasId);

    if (this.isDrawingActive) {
      if (toolbar) toolbar.classList.remove("hidden");
      if (canvas) {
        canvas.style.pointerEvents = "auto";
        canvas.style.cursor = this.drawTool === "laser" ? "none" : "crosshair";
      }
      window.app.showToast("🎨 Đã bật chế độ Bút vẽ & Laser Slide! Thầy Cô hãy vẽ trực tiếp lên màn hình.", "info");
    } else {
      if (toolbar) toolbar.classList.add("hidden");
      if (canvas) {
        canvas.style.pointerEvents = "none";
        canvas.style.cursor = "default";
      }
    }
  }

  disableDrawingMode(canvasId) {
    this.isDrawingActive = false;
    const toolbar = document.getElementById(`drawing-toolbar-${canvasId}`);
    const canvas = document.getElementById(canvasId);
    if (toolbar) toolbar.classList.add("hidden");
    if (canvas) canvas.style.pointerEvents = "none";
  }

  setDrawTool(tool) {
    this.drawTool = tool;
    const canvas = document.getElementById("lec-preview-canvas");
    if (canvas) {
      canvas.style.cursor = tool === "laser" ? "none" : "crosshair";
    }
    const toolNames = {
      laser: "🔴 Bút Chỉ Laser Phát Quang",
      highlighter: "✨ Bút Dạ Quang Vàng",
      red_pen: "🔴 Bút Viết Nét Đỏ",
      blue_pen: "🔵 Bút Viết Nét Xanh",
      chalk: "⚪ Phấn Trắng",
      eraser: "🧹 Tẩy Xóa Nét Vẽ"
    };
    window.app.showToast(`Đã chọn: ${toolNames[tool] || tool}`, "info");
  }

  initDrawingCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    canvas.width = canvas.offsetWidth || 900;
    canvas.height = canvas.offsetHeight || 550;

    const ctx = canvas.getContext("2d");
    this.activeCanvas = canvas;
    this.activeCtx = ctx;

    const startDraw = (e) => {
      if (!this.isDrawingActive) return;
      this.isPainting = true;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      this.lastX = clientX - rect.left;
      this.lastY = clientY - rect.top;

      if (this.drawTool === "laser") {
        this.renderLaserPointer(this.lastX, this.lastY);
      }
    };

    const drawMove = (e) => {
      if (!this.isDrawingActive) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const curX = clientX - rect.left;
      const curY = clientY - rect.top;

      if (this.drawTool === "laser") {
        this.renderLaserPointer(curX, curY);
        return;
      }

      if (!this.isPainting) return;

      ctx.beginPath();
      ctx.moveTo(this.lastX, this.lastY);
      ctx.lineTo(curX, curY);

      if (this.drawTool === "highlighter") {
        ctx.strokeStyle = "rgba(250, 204, 21, 0.4)";
        ctx.lineWidth = 22;
        ctx.lineCap = "square";
        ctx.globalCompositeOperation = "source-over";
      } else if (this.drawTool === "red_pen") {
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.globalCompositeOperation = "source-over";
      } else if (this.drawTool === "blue_pen") {
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.globalCompositeOperation = "source-over";
      } else if (this.drawTool === "chalk") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.globalCompositeOperation = "source-over";
      } else if (this.drawTool === "eraser") {
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = 28;
        ctx.lineCap = "round";
        ctx.globalCompositeOperation = "destination-out";
      }

      ctx.stroke();
      this.lastX = curX;
      this.lastY = curY;
    };

    const stopDraw = () => {
      this.isPainting = false;
    };

    canvas.onmousedown = startDraw;
    canvas.onmousemove = drawMove;
    canvas.onmouseup = stopDraw;
    canvas.onmouseleave = stopDraw;

    canvas.ontouchstart = startDraw;
    canvas.ontouchmove = drawMove;
    canvas.ontouchend = stopDraw;
  }

  renderLaserPointer(x, y) {
    if (!this.activeCtx) return;
    const ctx = this.activeCtx;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    if (this.laserTimer) clearTimeout(this.laserTimer);
    this.laserTimer = setTimeout(() => {
      if (this.drawTool === "laser") {
        ctx.clearRect(x - 20, y - 20, 40, 40);
      }
    }, 400);
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
  // VIDEO HOẠT HỌA AI THUYẾT MINH & TỰ ĐỘNG CHUYỂN SLIDE
  // =========================================================================
  async openSlideVideoPlayer(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    this.activeVideoLecture = lecture;
    this.videoSlideFrames = window.lectureService.generateSlideFrames(lecture);
    this.currentSlideIndex = 0;
    this.isVideoPlaying = false;

    const modal = document.getElementById("slide-video-player-modal");
    if (!modal) return;

    modal.classList.add("active");
    this.renderCurrentVideoSlide();
  }

  closeSlideVideoPlayer() {
    this.stopVideoAutoPlay();
    if (this.speechSynth) this.speechSynth.cancel();
    const modal = document.getElementById("slide-video-player-modal");
    if (modal) modal.classList.remove("active");
    this.activeVideoLecture = null;
  }

  renderCurrentVideoSlide() {
    const slide = this.videoSlideFrames[this.currentSlideIndex];
    if (!slide) return;

    const screen = document.getElementById("video-slide-screen");
    if (!screen) return;

    const totalSlides = this.videoSlideFrames.length;
    const progressPct = ((this.currentSlideIndex + 1) / totalSlides) * 100;

    screen.innerHTML = `
      <div class="relative w-full h-full p-6 md:p-10 flex flex-col justify-between rounded-3xl ${slide.bgGradient} text-white shadow-2xl overflow-hidden border border-white/20 animate-pop">
        <!-- Header Slide -->
        <div class="flex items-center justify-between border-b border-white/20 pb-3">
          <div class="flex items-center gap-2">
            <span class="badge bg-white/20 text-white font-black text-xs uppercase tracking-wider backdrop-blur-md">
              ${this.activeVideoLecture.bookSeries} • LỚP ${this.activeVideoLecture.grade}
            </span>
            <span class="badge bg-amber-400 text-slate-950 font-black text-xs">
              ${slide.title}
            </span>
          </div>
          <span class="text-xs font-bold bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
            Slide ${this.currentSlideIndex + 1} / ${totalSlides}
          </span>
        </div>

        <!-- Main Slide Body -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
          <div class="md:col-span-4 text-center">
            <div class="text-7xl md:text-8xl animate-bounce filter drop-shadow-2xl mb-2">
              ${slide.icon}
            </div>
            <h3 class="text-lg md:text-xl font-black text-amber-300">${slide.subtitle}</h3>
          </div>

          <div class="md:col-span-8 space-y-3">
            <div class="p-4 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 space-y-2">
              <h4 class="font-black text-cyan-200 text-sm">📌 Nội Dung Cốt Lõi:</h4>
              <ul class="space-y-1.5 text-xs md:text-sm">
                ${slide.bulletPoints.map(pt => `
                  <li class="flex items-start gap-2">
                    <span class="text-amber-400 font-bold">✔</span>
                    <span>${pt}</span>
                  </li>
                `).join("")}
              </ul>
            </div>

            <!-- Khung Lời Thuyết Minh AI Subtitle -->
            <div class="p-3 bg-amber-400/10 border border-amber-400/40 rounded-xl text-xs text-amber-100 flex items-center gap-2">
              <span class="text-base animate-pulse">🎙️</span>
              <span class="font-semibold italic">"${slide.narrative}"</span>
            </div>
          </div>
        </div>

        <!-- Footer Slide -->
        <div class="flex items-center justify-between border-t border-white/20 pt-3 text-xs text-white/80">
          <span>👨‍🏫 Tác giả: <b>${this.activeVideoLecture.authorName}</b></span>
          <span class="font-bold">Trường Tiểu Học Vui Học • GDPT 2018</span>
        </div>
      </div>
    `;

    const progressEl = document.getElementById("video-slide-progress-bar");
    if (progressEl) progressEl.style.width = `${progressPct}%`;

    const counterEl = document.getElementById("video-slide-progress-text");
    if (counterEl) counterEl.innerText = `Trang ${this.currentSlideIndex + 1} / ${totalSlides}`;

    if (this.isVideoPlaying) {
      this.speakNarrative(slide.narrative);
    }
  }

  speakNarrative(text) {
    if (!this.speechSynth) return;
    try {
      this.speechSynth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "vi-VN";
      utter.rate = this.speechRate;
      utter.pitch = this.voiceGender === "female" ? 1.15 : 0.85;

      utter.onend = () => {
        if (this.isVideoPlaying) {
          setTimeout(() => {
            this.nextSlideVideo();
          }, 1500);
        }
      };

      this.speechSynth.speak(utter);
    } catch (e) {}
  }

  togglePlayVideo() {
    this.isVideoPlaying = !this.isVideoPlaying;
    const btn = document.getElementById("btn-toggle-video-play");

    if (this.isVideoPlaying) {
      if (btn) btn.innerHTML = "<span>⏸️</span> <span>Tạm Dừng</span>";
      const slide = this.videoSlideFrames[this.currentSlideIndex];
      if (slide) this.speakNarrative(slide.narrative);
    } else {
      if (btn) btn.innerHTML = "<span>▶️</span> <span>Phát Video</span>";
      if (this.speechSynth) this.speechSynth.cancel();
    }
  }

  stopVideoAutoPlay() {
    this.isVideoPlaying = false;
    if (this.videoTimer) clearTimeout(this.videoTimer);
  }

  nextSlideVideo() {
    if (this.currentSlideIndex < this.videoSlideFrames.length - 1) {
      this.currentSlideIndex++;
      this.renderCurrentVideoSlide();
    } else {
      this.stopVideoAutoPlay();
      if (this.speechSynth) this.speechSynth.cancel();
      window.app.showToast("🎉 Đã hoàn thành trình chiếu video hoạt họa bài giảng!", "success");
      const btn = document.getElementById("btn-toggle-video-play");
      if (btn) btn.innerHTML = "<span>🔄</span> <span>Phát Lại Từ Đầu</span>";
    }
  }

  prevSlideVideo() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.renderCurrentVideoSlide();
    }
  }

  setVoiceGender(gender) {
    this.voiceGender = gender;
    window.app.showToast(gender === "female" ? "🎙️ Đã chọn giọng Cô Giáo (Nữ)" : "🎙️ Đã chọn giọng Thầy Giáo (Nam)", "info");
    if (this.isVideoPlaying) {
      const slide = this.videoSlideFrames[this.currentSlideIndex];
      if (slide) this.speakNarrative(slide.narrative);
    }
  }

  setSpeechRate(rate) {
    this.speechRate = parseFloat(rate) || 0.95;
    window.app.showToast(`⚡ Tốc độ giọng đọc: ${this.speechRate}x`, "info");
    if (this.isVideoPlaying) {
      const slide = this.videoSlideFrames[this.currentSlideIndex];
      if (slide) this.speakNarrative(slide.narrative);
    }
  }

  // =========================================================================
  // TẢI GIÁO ÁN WORD CV 2345 & GÓI HỌC LIỆU TRỌN BỘ (.ZIP)
  // =========================================================================
  async downloadLessonPlanDoc(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    window.app.showToast(`⏳ Đang tạo Kế Hoạch Bài Dạy Word chuẩn Công văn 2345 cho "${lecture.title}"...`, "info");
    
    if (window.docExportService?.exportLessonPlanByLecture) {
      window.docExportService.exportLessonPlanByLecture(lecture);
      setTimeout(() => {
        window.app.showToast("🎉 Đã tải xuống Giáo Án Word (.doc) chuẩn Công văn 2345 thành công!", "success");
      }, 800);
    }
  }

  async downloadWorksheet(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    window.app.showToast(`⏳ Đang tạo Phiếu Bài Tập Word cho "${lecture.title}"...`, "info");
    
    if (window.docExportService?.exportWorksheetDoc) {
      window.docExportService.exportWorksheetDoc(lecture);
      setTimeout(() => {
        window.app.showToast("🎉 Đã tải xuống Phiếu Bài Tập Word (.doc) thành công!", "success");
      }, 800);
    }
  }

  async downloadBundleZip(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    window.app.showToast(`📦 Đang chuẩn bị trọn gói học liệu cho "${lecture.title}"...`, "info");

    setTimeout(() => {
      this.downloadLecture(lectureId);
    }, 200);

    setTimeout(() => {
      this.downloadLessonPlanDoc(lectureId);
    }, 800);

    setTimeout(() => {
      this.downloadWorksheet(lectureId);
    }, 1400);

    setTimeout(() => {
      window.app.showToast("🎉 Đã xuất trọn bộ Gói Học Liệu (Slide PPTX + Giáo Án Word + Phiếu Bài Tập)!", "success");
    }, 1800);
  }

  async downloadLecture(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    window.lectureService.incrementDownloadCount(lectureId);
    window.app.showToast(`📥 Đang tải file PowerPoint: "${lecture.fileName || 'BaiGiang.pptx'}"...`, "info");

    const a = document.createElement("a");
    a.href = lecture.fileUrl || "https://example.com/slide.pptx";
    a.download = lecture.fileName || "BaiGiang_TinHoc.pptx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      window.app.showToast("🎉 Tải file bài giảng thành công!", "success");
      this.render("main-content-area");
    }, 800);
  }

  // =========================================================================
  // TRÒ CHƠI KHỞI ĐỘNG 3 PHÚT (ICEBREAKER GAME)
  // =========================================================================
  async openIcebreakerGame(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    this.icebreakerQuestions = window.lectureService.generateIcebreakerQuestions(lecture);
    this.icebreakerCurrentQ = 0;
    this.icebreakerScore = 0;
    this.icebreakerTimer = 180;

    const modal = document.getElementById("icebreaker-game-modal");
    if (!modal) return;

    modal.classList.add("active");
    this.renderCurrentIcebreakerQuestion();
    this.startIcebreakerTimer();
  }

  closeIcebreakerModal() {
    if (this.icebreakerInterval) clearInterval(this.icebreakerInterval);
    const modal = document.getElementById("icebreaker-game-modal");
    if (modal) modal.classList.remove("active");
  }

  startIcebreakerTimer() {
    if (this.icebreakerInterval) clearInterval(this.icebreakerInterval);
    this.icebreakerInterval = setInterval(() => {
      this.icebreakerTimer--;
      const mins = Math.floor(this.icebreakerTimer / 60);
      const secs = this.icebreakerTimer % 60;
      const disp = document.getElementById("icebreaker-timer-disp");
      if (disp) disp.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

      if (this.icebreakerTimer <= 0) {
        clearInterval(this.icebreakerInterval);
        window.app.showToast("⏱️ Hết 3 phút khởi động!", "warning");
      }
    }, 1000);
  }

  renderCurrentIcebreakerQuestion() {
    const q = this.icebreakerQuestions[this.icebreakerCurrentQ];
    const container = document.getElementById("icebreaker-quiz-container");
    if (!q || !container) return;

    container.innerHTML = `
      <div class="space-y-4 animate-pop">
        <div class="flex items-center justify-between">
          <span class="badge badge-amber font-black text-xs">CÂU ${this.icebreakerCurrentQ + 1} / ${this.icebreakerQuestions.length}</span>
          <span class="badge badge-emerald font-black text-xs">Điểm: ${this.icebreakerScore}</span>
        </div>

        <div class="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2">
          <span class="text-4xl block mb-2">⚡</span>
          <h3 class="text-base md:text-lg font-black text-slate-900 leading-snug">${q.question}</h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          ${q.options.map((opt, idx) => `
            <button onclick="lecturePortal.answerIcebreaker(${idx})" class="p-4 bg-white border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 rounded-2xl text-left font-bold text-xs md:text-sm text-slate-800 transition-all shadow-sm active:scale-98">
              ${opt}
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  answerIcebreaker(selectedIndex) {
    const q = this.icebreakerQuestions[this.icebreakerCurrentQ];
    if (selectedIndex === q.correct) {
      this.icebreakerScore += 10;
      window.app.showToast("✅ Chính xác! +10 Điểm", "success");
    } else {
      window.app.showToast(`❌ Chưa đúng! ${q.explanation}`, "error");
    }

    this.icebreakerCurrentQ++;
    if (this.icebreakerCurrentQ < this.icebreakerQuestions.length) {
      setTimeout(() => this.renderCurrentIcebreakerQuestion(), 800);
    } else {
      if (this.icebreakerInterval) clearInterval(this.icebreakerInterval);
      const container = document.getElementById("icebreaker-quiz-container");
      if (container) {
        container.innerHTML = `
          <div class="text-center py-8 space-y-4 animate-pop">
            <span class="text-6xl block animate-bounce">🏆</span>
            <h3 class="text-xl font-black text-slate-900">HOÀN THÀNH KHỞI ĐỘNG!</h3>
            <p class="text-base font-black text-amber-600">Tổng điểm: ${this.icebreakerScore} / ${this.icebreakerQuestions.length * 10}</p>
            <p class="text-xs text-slate-500">Cả lớp đã sẵn sàng bước vào bài học mới đầy hứng khởi!</p>
          </div>
        `;
      }
    }
  }

  // =========================================================================
  // ĐỒNG HỒ ĐẾM NGƯỢC HOẠT ĐỘNG NHÓM (GROUP WORK TIMER 1-10 PHÚT)
  // =========================================================================
  openGroupTimerModal() {
    const modal = document.getElementById("group-timer-modal");
    if (modal) modal.classList.add("active");
    this.updateTimerDisplay();
  }

  closeGroupTimerModal() {
    this.pauseGroupTimer();
    const modal = document.getElementById("group-timer-modal");
    if (modal) modal.classList.remove("active");
  }

  setGroupTimerMinutes(minutes) {
    this.pauseGroupTimer();
    this.groupTimerSeconds = minutes * 60;
    this.groupTimerInitial = this.groupTimerSeconds;
    this.updateTimerDisplay();
    window.app.showToast(`⏱️ Đã đặt đồng hồ nhóm: ${minutes} Phút!`, "info");
  }

  addTimerSeconds(seconds) {
    this.groupTimerSeconds += seconds;
    this.groupTimerInitial = Math.max(this.groupTimerInitial, this.groupTimerSeconds);
    this.updateTimerDisplay();
  }

  toggleGroupTimer() {
    if (this.isGroupTimerRunning) {
      this.pauseGroupTimer();
    } else {
      this.startGroupTimer();
    }
  }

  startGroupTimer() {
    if (this.groupTimerSeconds <= 0) return;
    this.isGroupTimerRunning = true;
    const btn = document.getElementById("btn-toggle-group-timer");
    if (btn) btn.innerHTML = "<span>⏸️</span> <span>Tạm Dừng</span>";

    if (this.isLofiMusicOn) {
      this.startLofiAmbientMusic();
    }

    if (this.groupTimerInterval) clearInterval(this.groupTimerInterval);
    this.groupTimerInterval = setInterval(() => {
      this.groupTimerSeconds--;
      this.updateTimerDisplay();

      if (this.groupTimerSeconds <= 0) {
        this.finishGroupTimer();
      }
    }, 1000);
  }

  pauseGroupTimer() {
    this.isGroupTimerRunning = false;
    if (this.groupTimerInterval) clearInterval(this.groupTimerInterval);
    const btn = document.getElementById("btn-toggle-group-timer");
    if (btn) btn.innerHTML = "<span>▶️</span> <span>Bắt Đầu Đếm Giờ</span>";
    this.stopLofiAmbientMusic();
  }

  resetGroupTimer() {
    this.pauseGroupTimer();
    this.groupTimerSeconds = this.groupTimerInitial || 180;
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.groupTimerSeconds / 60);
    const secs = this.groupTimerSeconds % 60;
    const timeStr = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const disp = document.getElementById("group-timer-clock-disp");
    const ring = document.getElementById("group-timer-progress-ring");

    if (disp) disp.innerText = timeStr;

    if (ring && this.groupTimerInitial > 0) {
      const percent = (this.groupTimerSeconds / this.groupTimerInitial) * 100;
      ring.style.width = `${percent}%`;
    }
  }

  finishGroupTimer() {
    this.pauseGroupTimer();
    this.playBellChime();
    window.app.showToast("🔔 HẾT GIỜ HOẠT ĐỘNG NHÓM! Các nhóm hãy tổng kết kết quả thảo luận!", "warning");
  }

  toggleLofiMusic() {
    this.isLofiMusicOn = !this.isLofiMusicOn;
    const btn = document.getElementById("btn-toggle-lofi-timer");
    if (btn) {
      btn.innerHTML = this.isLofiMusicOn ? "<span>🎵 Nhạc Lofi: BẬT</span>" : "<span>🔇 Nhạc Lofi: TẮT</span>";
    }
    if (this.isGroupTimerRunning) {
      if (this.isLofiMusicOn) this.startLofiAmbientMusic();
      else this.stopLofiAmbientMusic();
    }
  }

  startLofiAmbientMusic() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      this.lofiOscillator = osc;
    } catch (e) {}
  }

  stopLofiAmbientMusic() {
    if (this.lofiOscillator) {
      try {
        this.lofiOscillator.stop();
        this.lofiOscillator.disconnect();
      } catch (e) {}
      this.lofiOscillator = null;
    }
  }

  playBellChime() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.15);

        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.15 + 1.2);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.15);
        osc.stop(this.audioCtx.currentTime + idx * 0.15 + 1.2);
      });
    } catch (e) {}
  }

  // =========================================================================
  // XÓA BÀI GIẢNG ĐIỆN TỬ
  // =========================================================================
  openDeleteConfirmModal(lectureId, lectureTitle) {
    this.pendingDeleteId = lectureId;
    this.pendingDeleteTitle = lectureTitle;

    const modal = document.getElementById("lecture-delete-confirm-modal");
    const nameEl = document.getElementById("delete-lec-name-target");
    if (nameEl) nameEl.innerText = `"${lectureTitle}"`;
    if (modal) modal.classList.add("active");
  }

  closeDeleteConfirmModal() {
    this.pendingDeleteId = null;
    this.pendingDeleteTitle = "";
    const modal = document.getElementById("lecture-delete-confirm-modal");
    if (modal) modal.classList.remove("active");
  }

  async confirmDeleteLecture() {
    if (!this.pendingDeleteId) return;
    const lectureId = this.pendingDeleteId;
    const lectureTitle = this.pendingDeleteTitle;

    const res = await window.lectureService.deleteLecture(lectureId);
    this.closeDeleteConfirmModal();

    if (res.success) {
      window.app.showToast(`🗑️ Đã xóa bài giảng "${lectureTitle}" thành công!`, "success");
      this.render("main-content-area");
    } else {
      window.app.showToast("Không thể xóa bài giảng, vui lòng thử lại!", "error");
    }
  }
}

window.lecturePortal = new LecturePortal();
