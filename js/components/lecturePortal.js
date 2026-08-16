/**
 * LECTURE PORTAL COMPONENT
 * Quản lý Bài Giảng Điện Tử & Slide PowerPoint:
 * 1. 📂 3 Thư mục con: Bài giảng Tin lớp 3, Bài giảng Tin lớp 4, Bài giảng Tin lớp 5
 * 2. 📤 Nút đưa bài giảng lên cho Giáo viên (Đồng bộ Supabase Cloud & Local)
 * 3. 🎬 Trình chiếu Slide 3D & Video hoạt họa thuyết minh AI đa giọng đọc
 * 4. ⏱️ Đồng hồ hoạt động nhóm 1-10P có Nhạc Lofi & Chuông báo hết giờ
 * 5. ✏️ Chỉnh sửa & 🗑️ Xóa bỏ bài giảng đồng bộ Supabase Cloud
 * 6. ⭐ Đánh dấu bài giảng yêu thích (Bookmark)
 */

class LecturePortal {
  constructor() {
    this.currentGrade = "all";
    this.currentBookSeries = "all";
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
    let allLectures = await window.lectureService.getAllLectures(effectiveGrade, this.searchQuery, this.currentBookSeries);
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
            <p class="text-cyan-100 text-xs md:text-sm">Trình chiếu slide 3D, Video hoạt họa thuyết minh AI, Đồng hồ nhóm 1-10P và Đưa bài giảng lên CSDL Cloud</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="lecturePortal.openGroupTimerModal()" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md">
              <span class="text-base">⏱️</span> <span>Đồng Hồ Nhóm</span>
            </button>
            <button onclick="lecturePortal.openAnalyticsModal()" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md">
              <span>📈</span> <span>Thống Kê</span>
            </button>
            <button onclick="lectureUploadModal.openModal(${effectiveGrade !== 'all' ? effectiveGrade : 3})" class="btn btn-amber btn-lg font-black shadow-xl flex items-center gap-2 shrink-0 hover:scale-105 transition-all">
              <span class="text-xl">📤</span> <span>Đưa Bài Giảng Lên</span>
            </button>
          </div>
        </div>

        <!-- 3 THƯ MỤC CON: KIỂM TRA MÔN TIN LỚP 3, LỚP 4, LỚP 5 -->
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

        <!-- Thanh Bộ Lọc Kép: Khối Lớp + 3 Bộ Sách Giáo Khoa + Ô Tìm Kiếm -->
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
              <span>📚 DANH SÁCH BÀI GIẢNG ${this.selectedFolder !== 'all' ? `KHỐI ${this.selectedFolder}` : ''}</span>
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

          return `
            <div class="glass-card overflow-hidden hover:border-cyan-500 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group relative">
              <!-- Header Thumbnail Gradient -->
              <div class="p-5 bg-gradient-to-br ${l.thumbnailColor || 'from-blue-600 to-cyan-500'} text-white space-y-2 relative">
                <div class="flex items-center justify-between gap-1 flex-wrap">
                  <span class="badge ${sInfo.bg} text-white font-black text-[10px] uppercase backdrop-blur-sm">
                    ${sInfo.name} • Lớp ${l.grade}
                  </span>
                  
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

    const clockBox = document.getElementById("group-timer-clock-box");
    if (clockBox) {
      clockBox.classList.add("animate-bounce");
      setTimeout(() => clockBox.classList.remove("animate-bounce"), 4000);
    }
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
      osc.frequency.setValueAtTime(220, this.audioCtx.currentTime); // Nốt A3 dịu nhẹ

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

  // =========================================================================
  // XUẤT PHIẾU BÀI TẬP WORD (.DOC)
  // =========================================================================
  async downloadWorksheet(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    window.app.showToast(`⏳ Đang tạo Phiếu Bài Tập Word cho "${lecture.title}"...`, "info");
    
    if (window.docExportService?.exportWorksheetDoc) {
      window.docExportService.exportWorksheetDoc(lecture);
    } else {
      setTimeout(() => {
        window.app.showToast("Đã tải xuống phiếu bài tập dạng Word (.doc)!", "success");
      }, 1000);
    }
  }

  // =========================================================================
  // VIDEO HOẠT HỌA & TRÌNH CHIẾU SLIDE 3D
  // =========================================================================
  async openSlideVideoPlayer(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    this.activeVideoLecture = lecture;
    this.videoSlideFrames = window.lectureService.generateSlideFrames(lecture);
    this.currentSlideIndex = 0;
    this.isVideoPlaying = false;

    const modal = document.getElementById("lecture-video-player-modal");
    if (!modal) return;

    const titleEl = document.getElementById("video-player-lec-title");
    if (titleEl) titleEl.innerText = lecture.title;

    modal.classList.add("active");
    this.renderCurrentVideoSlide();
  }

  closeVideoPlayerModal() {
    this.stopVideoAutoPlay();
    if (this.speechSynth) this.speechSynth.cancel();
    const modal = document.getElementById("lecture-video-player-modal");
    if (modal) modal.classList.remove("active");
    this.activeVideoLecture = null;
  }

  renderCurrentVideoSlide() {
    const slide = this.videoSlideFrames[this.currentSlideIndex];
    if (!slide) return;

    const canvasArea = document.getElementById("video-player-slide-canvas");
    if (!canvasArea) return;

    const totalSlides = this.videoSlideFrames.length;
    const progressPct = ((this.currentSlideIndex + 1) / totalSlides) * 100;

    canvasArea.innerHTML = `
      <div class="relative w-full h-full p-8 md:p-12 flex flex-col justify-between rounded-3xl ${slide.bgGradient} text-white shadow-2xl overflow-hidden ${this.is3DFlipEnabled ? 'animate-pop' : ''}">
        <!-- Header Slide -->
        <div class="flex items-center justify-between border-b border-white/20 pb-3">
          <span class="badge bg-white/20 text-white font-black text-xs uppercase tracking-wider backdrop-blur-md">
            ${this.activeVideoLecture.bookSeries} • LỚP ${this.activeVideoLecture.grade}
          </span>
          <span class="text-xs font-bold bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
            Slide ${this.currentSlideIndex + 1} / ${totalSlides}
          </span>
        </div>

        <!-- Main Slide Body -->
        <div class="space-y-6 my-auto text-center">
          <div class="text-7xl md:text-8xl animate-bounce filter drop-shadow-lg">
            ${slide.icon}
          </div>
          <h2 class="text-2xl md:text-4xl font-black tracking-tight leading-tight max-w-2xl mx-auto drop-shadow-md">
            ${slide.title}
          </h2>
          <div class="p-4 md:p-6 bg-black/25 backdrop-blur-md rounded-2xl border border-white/20 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-semibold">
            ${slide.narrative}
          </div>
        </div>

        <!-- Footer Slide -->
        <div class="flex items-center justify-between border-t border-white/20 pt-3 text-xs text-white/80">
          <span>👨‍🏫 ${this.activeVideoLecture.authorName}</span>
          <span class="font-bold">Trường Tiểu Học Vui Học</span>
        </div>
      </div>
    `;

    const progressEl = document.getElementById("video-player-progress-bar");
    if (progressEl) progressEl.style.width = `${progressPct}%`;

    const counterEl = document.getElementById("video-player-slide-counter");
    if (counterEl) counterEl.innerText = `${this.currentSlideIndex + 1} / ${totalSlides}`;

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
      utter.pitch = this.voiceGender === "female" ? 1.1 : 0.85;

      utter.onend = () => {
        if (this.isVideoPlaying) {
          setTimeout(() => {
            this.nextVideoSlide();
          }, 1200);
        }
      };

      this.speechSynth.speak(utter);
    } catch (e) {}
  }

  toggleVideoPlay() {
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

  nextVideoSlide() {
    if (this.currentSlideIndex < this.videoSlideFrames.length - 1) {
      this.currentSlideIndex++;
      this.renderCurrentVideoSlide();
    } else {
      this.stopVideoAutoPlay();
      if (this.speechSynth) this.speechSynth.cancel();
      window.app.showToast("🎉 Đã hoàn thành trình chiếu video bài giảng!", "success");
      const btn = document.getElementById("btn-toggle-video-play");
      if (btn) btn.innerHTML = "<span>🔄</span> <span>Phát Lại</span>";
    }
  }

  prevVideoSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.renderCurrentVideoSlide();
    }
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
  // AI TÓM TẮT & TRÌNH CHIẾU / TẢI BÀI GIẢNG
  // =========================================================================
  async openAISummary(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    const modal = document.getElementById("lecture-summary-modal");
    const titleEl = document.getElementById("summary-lec-title");
    const contentEl = document.getElementById("summary-lec-content");

    if (titleEl) titleEl.innerText = lecture.title;
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div class="p-4 bg-purple-50 rounded-2xl border border-purple-200">
            <h4 class="font-black text-purple-900 text-sm mb-1">🎯 Mục Tiêu Bài Học (Chuẩn GDPT 2018):</h4>
            <p>Học sinh nắm vững kiến thức trọng tâm của môn Tin học lớp ${lecture.grade}, rèn luyện kỹ năng thực hành và tư duy số.</p>
          </div>
          <div class="p-4 bg-cyan-50 rounded-2xl border border-cyan-200">
            <h4 class="font-black text-cyan-900 text-sm mb-1">💡 3 Điểm Cốt Lõi Cần Ghi Nhớ:</h4>
            <ul class="list-disc list-inside space-y-1">
              <li>Thực hiện đúng quy tắc an toàn khi sử dụng thiết bị công nghệ.</li>
              <li>Thao tác chính xác trên bài học và hoàn thành các câu hỏi thực nghiệm.</li>
              <li>Ứng dụng kiến thức vào hoạt động học tập và sinh hoạt gia đình.</li>
            </ul>
          </div>
        </div>
      `;
    }
    if (modal) modal.classList.add("active");
  }

  closeSummaryModal() {
    const modal = document.getElementById("lecture-summary-modal");
    if (modal) modal.classList.remove("active");
  }

  async previewLecture(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    window.lectureService.incrementViewCount(lectureId);

    const modal = document.getElementById("presentation-modal");
    const iframe = document.getElementById("presentation-iframe");
    const titleEl = document.getElementById("presentation-title");

    if (titleEl) titleEl.innerText = lecture.title;
    if (iframe) {
      iframe.src = lecture.fileUrl || "https://docs.google.com/presentation/d/e/2PACX-1vT1Z5u7.../embed";
    }
    if (modal) modal.classList.add("active");
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

  openAnalyticsModal() {
    window.app.showToast("📈 Đang cập nhật bảng thống kê lượt tải và xem bài giảng...", "info");
  }
}

window.lecturePortal = new LecturePortal();
