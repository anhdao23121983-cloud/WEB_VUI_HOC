/**
 * LECTURE PORTAL COMPONENT
 * Quản lý Bài Giảng Điện Tử & Slide PowerPoint:
 * 1. 📂 3 Thư mục con: Bài giảng Tin lớp 3, Bài giảng Tin lớp 4, Bài giảng Tin lớp 5
 * 2. 📤 Nút đưa bài giảng lên cho Giáo viên (Đồng bộ Supabase Cloud & Local)
 * 3. 🎨 Bút Laser đỏ & Bút dạ quang khi Trình chiếu Slide (Laser Pointer & Pen Tool)
 * 4. ⚡ Đố vui 10s tương tác trực tiếp trên Slide (In-Slide Quick Quiz 10s)
 * 5. 🧩 Trò chơi Ô Chữ Bí Mật 3D & ⚙️ Soạn Ô Chữ Tùy Biến (Custom Crossword Maker)
 * 6. 🎡 Vòng Quay May Mắn gọi tên học sinh ngẫu nhiên trên Slide (In-Slide Lucky Wheel)
 * 7. 🔔 Đấu Trường Rung Chuông Vàng 3D củng cố bài học (In-Slide Golden Bell Arena)
 * 8. 🃏 Trò chơi Ghép Thẻ Trí Nhớ 3D trên Slide (In-Slide 3D Memory Card Match)
 * 9. ⚡ Trò chơi Nối Cột Định Nghĩa 3D & ⚙️ Soạn Cặp Nối Cột (Custom Column Match Maker)
 * 10. 🎈 Trò chơi Bắn Bong Bóng 3D & ⚙️ Soạn Nhiệm Vụ Bắn Bóng (Custom Bubble Mission Maker)
 * 11. 🐱 Trò chơi Thả Khối Scratch 3D & ⚙️ Soạn Thử Thách Scratch (Custom Scratch Mission Maker)
 * 12. ⭐ Bảng Khen Thưởng & 🌟 Bắn Thông Báo 50 Sao Toàn Trường Realtime
 * 13. 📖 Sách 3D lật trang siêu thực có 🌙 Chế Độ Ban Đêm Neon & 🔊 Giọng đọc AI E-Book
 * 14. 📈 Bảng Vàng Xếp Hạng & Báo Cáo Mức Độ Yêu Thích Bài Giảng Của Trường
 * 15. 🎬 Video hoạt họa thuyết minh AI đa giọng đọc và chuyển cảnh tự động
 * 16. 📄 Tải Giáo Án Word chuẩn Công văn 2345 & 📦 Gói Học Liệu Trọn Bộ
 * 17. 🍂 Lọc Học Kỳ 1 & 🌸 Học Kỳ 2 theo chương trình GDPT 2018
 * 18. ⏱️ Đồng hồ hoạt động nhóm 1-10P có Nhạc Lofi & Chuông báo hết giờ
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
    this.currentFlipbookIndex = 0;
    this.isAutoFlipRunning = false;
    this.autoFlipTimer = null;
    this.isReadingAloud = false;
    this.isFlipbookDarkMode = localStorage.getItem("flipbook_dark_mode") === "true";

    // In-Slide Quick Quiz 10s State
    this.inSlideQuizActive = false;
    this.inSlideQuizTimer = 10;
    this.inSlideQuizInterval = null;
    this.currentInSlideQuestion = null;
    this.isInSlideAnswerRevealed = false;

    // In-Slide 3D Crossword State
    this.crosswordActive = false;
    this.selectedCrosswordRow = 0;
    this.crosswordData = null;

    // In-Slide Lucky Wheel State
    this.luckyWheelActive = false;
    this.wheelNames = [
      "1. Minh Anh", "2. Bảo Nam", "3. Linh Chi", "4. Gia Huy", "5. Tuấn Kiệt",
      "6. Thảo Nguyên", "7. Quốc Hưng", "8. Ngọc Mai", "9. Đức Trọng", "10. Hà My",
      "11. Hoàng Long", "12. Phương Linh", "13. Hải Đăng", "14. Quỳnh Anh", "15. Đăng Khoa",
      "16. Khánh An", "17. Tiến Đạt", "18. Cẩm Tú", "19. Hữu Phước", "20. Bảo Châu"
    ];
    this.wheelAngle = 0;
    this.isWheelSpinning = false;
    this.wheelAnimId = null;

    // In-Slide Golden Bell Arena State
    this.goldenBellActive = false;
    this.goldenBellQIndex = 0;
    this.goldenBellTimer = 15;
    this.goldenBellInterval = null;
    this.goldenBellSurvivors = 35;
    this.isGoldenBellRevealed = false;
    this.goldenBellQuestions = [];

    // In-Slide 3D Memory Card Match State
    this.memoryCardActive = false;
    this.memoryCards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.memoryFlips = 0;
    this.isMemoryLock = false;

    // In-Slide 3D Column Match State
    this.columnMatchActive = false;
    this.columnMatchData = null;
    this.columnLeftItems = [];
    this.columnRightItems = [];
    this.selectedLeftId = null;
    this.selectedRightId = null;
    this.matchedConnections = [];

    // In-Slide 3D Bubble Pop Game State
    this.bubblePopActive = false;
    this.bubblePopMissions = [];
    this.currentBubbleMissionIdx = 0;
    this.bubbles = [];
    this.bubbleParticles = [];
    this.bubbleScore = 0;
    this.bubbleTarget = 5;
    this.bubbleAnimId = null;

    // In-Slide 3D Scratch Block State
    this.scratchActive = false;
    this.scratchMissions = [];
    this.currentScratchMissionIdx = 0;
    this.scratchWorkspace = [];
    this.scratchCatState = { x: 0, y: 0, angle: 0, costume: 1 };
    this.isScratchRunning = false;

    // In-Slide Star Awarding State
    this.starAwardActive = false;
    this.recentStarLogs = [];
    this.broadcastTimer = null;

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
            <p class="text-cyan-100 text-xs md:text-sm">Trình chiếu slide có Bút Laser, Lập Trình Scratch 3D, Nối Cột 3D, Bắn Bóng 3D, Ghép Thẻ, Rung Chuông, Tặng Sao & Vinh Danh Toàn Trường</p>
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
                    <span>👩‍🏫 Tác giả: <b>${l.authorName || 'Cô Anh Đào'}</b></span>
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
                    <button onclick="lecturePortal.openFlipbook('${l.id}')" class="btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white btn-sm font-black flex items-center justify-center gap-1 shadow-sm hover:scale-105 transition-all" title="Trình chiếu Sách 3D Lật Trang Siêu Thực có chế độ Ban Đêm Neon & Giọng đọc AI">
                      <span>📖</span> <span>Sách 3D & Giọng AI</span>
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

                  <!-- Hàng 3: Trình chiếu Slide (Có Bút Laser, Scratch 3D, Nối cột 3D, Bắn bóng, Ghép thẻ, Rung Chuông) + Tải PPT + Gói Trọn Bộ + Sửa + Xóa -->
                  <div class="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 flex-wrap">
                    <button onclick="lecturePortal.previewLecture('${l.id}')" class="btn btn-primary btn-sm flex-1 font-black flex items-center justify-center gap-1 shadow-sm" title="Trình chiếu Slide toàn màn hình có Bút Laser, Scratch 3D, Nối Cột 3D, Bắn Bóng 3D, Ghép Thẻ, Rung Chuông Vàng & Tặng Sao Trực Tiếp">
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
  // OPTION 2: SOẠN & TÙY BIẾN THỬ THÁCH SCRATCH 3D (CUSTOM SCRATCH MISSION MAKER)
  // =========================================================================
  toggleInSlideScratch() {
    const overlay = document.getElementById("in-slide-scratch-block-overlay");
    if (!overlay) return;

    this.scratchActive = !this.scratchActive;
    if (this.scratchActive) {
      if (this.inSlideQuizActive) this.toggleInSlideQuiz();
      if (this.crosswordActive) this.toggleInSlideCrossword();
      if (this.luckyWheelActive) this.toggleInSlideLuckyWheel();
      if (this.goldenBellActive) this.toggleInSlideGoldenBell();
      if (this.memoryCardActive) this.toggleInSlideMemoryCard();
      if (this.columnMatchActive) this.toggleInSlideColumnMatch();
      if (this.bubblePopActive) this.toggleInSlideBubblePop();
      overlay.classList.remove("hidden");
      this.initScratchGame();
    } else {
      overlay.classList.add("hidden");
    }
  }

  openScratchMakerModal() {
    const modal = document.getElementById("scratch-mission-maker-modal");
    if (!modal) return;

    const curMission = this.scratchMissions[this.currentScratchMissionIdx];
    const titleInput = document.getElementById("maker-scratch-title");
    const goalInput = document.getElementById("maker-scratch-goal");
    const orderInput = document.getElementById("maker-scratch-order");

    if (curMission) {
      if (titleInput) titleInput.value = curMission.title;
      if (goalInput) goalInput.value = curMission.goal;
      if (orderInput) orderInput.value = curMission.targetOrder.join(", ");
    }

    modal.classList.add("active");
  }

  loadPresetScratchMission(idx) {
    this.switchScratchMission(idx);
    const modal = document.getElementById("scratch-mission-maker-modal");
    if (modal) modal.classList.remove("active");
    window.app.showToast(`🎉 Đã nạp thử thách mẫu ${idx + 1}!`, "success");
  }

  saveCustomScratchMissionFromForm() {
    const titleInput = document.getElementById("maker-scratch-title");
    const goalInput = document.getElementById("maker-scratch-goal");
    const orderInput = document.getElementById("maker-scratch-order");

    if (!titleInput || !goalInput || !orderInput) return;

    const title = (titleInput.value || "THỬ THÁCH SCRATCH TÙY BIẾN").trim();
    const goal = (goalInput.value || "Lập trình cho chú mèo theo yêu cầu bài dạy").trim();
    const orderStr = orderInput.value.trim();
    const targetOrder = orderStr.split(",").map(s => s.trim()).filter(s => s.length > 0);

    if (targetOrder.length < 2) {
      window.app.showToast("Chuỗi khối lệnh phải có ít nhất 2 khối lệnh hợp lệ!", "warning");
      return;
    }

    const availableBlocks = [
      { id: "event_flag", type: "event", color: "bg-amber-500 border-amber-400 text-slate-950", icon: "🏳️", text: "Khi bấm cờ xanh" },
      { id: "motion_move10", type: "motion", color: "bg-blue-600 border-blue-400 text-white", icon: "👣", text: "Di chuyển 10 bước" },
      { id: "motion_move50", type: "motion", color: "bg-blue-600 border-blue-400 text-white", icon: "👣", text: "Di chuyển 50 bước" },
      { id: "motion_turn90", type: "motion", color: "bg-blue-600 border-blue-400 text-white", icon: "🔄", text: "Xoay phải 90 độ" },
      { id: "sound_meow", type: "sound", color: "bg-pink-600 border-pink-400 text-white", icon: "🐱", text: "Phát âm thanh Meow" },
      { id: "looks_sayhello", type: "looks", color: "bg-purple-600 border-purple-400 text-white", icon: "💬", text: "Nói 'Xin chào!' 2s" },
      { id: "looks_nextcostume", type: "looks", color: "bg-purple-600 border-purple-400 text-white", icon: "👗", text: "Đổi trang phục tiếp theo" },
      { id: "control_repeat10", type: "control", color: "bg-amber-600 border-amber-400 text-white", icon: "🔁", text: "Lặp lại 10 lần" },
      { id: "control_repeat4", type: "control", color: "bg-amber-600 border-amber-400 text-white", icon: "🔁", text: "Lặp lại 4 lần" },
      { id: "control_wait", type: "control", color: "bg-amber-600 border-amber-400 text-white", icon: "⏳", text: "Đợi 0.5 giây" }
    ];

    const customMission = {
      id: this.scratchMissions.length,
      title: title,
      goal: goal,
      targetOrder: targetOrder,
      availableBlocks: availableBlocks
    };

    this.scratchMissions.push(customMission);
    this.currentScratchMissionIdx = this.scratchMissions.length - 1;

    const modal = document.getElementById("scratch-mission-maker-modal");
    if (modal) modal.classList.remove("active");

    const titleEl = document.getElementById("scratch-mission-title");
    const goalEl = document.getElementById("scratch-mission-goal");

    if (titleEl) titleEl.innerText = title;
    if (goalEl) goalEl.innerText = goal;

    this.scratchWorkspace = [];
    this.resetScratchStage();
    this.renderScratchPalette();
    this.renderScratchWorkspace();

    window.app.showToast(`🎉 Đã áp dụng thành công thử thách Scratch: "${title}"!`, "success");
  }

  initScratchGame() {
    this.scratchMissions = [
      {
        id: 0,
        title: "THỬ THÁCH 1: MÈO ĐI & CHÀO HỎI",
        goal: "Lập trình cho chú mèo: Khi bấm cờ xanh ➔ Di chuyển 10 bước ➔ Nói 'Xin chào các bạn!' trong 2 giây",
        targetOrder: ["event_flag", "motion_move10", "looks_sayhello"],
        availableBlocks: [
          { id: "event_flag", type: "event", color: "bg-amber-500 border-amber-400 text-slate-950", icon: "🏳️", text: "Khi bấm cờ xanh" },
          { id: "motion_move10", type: "motion", color: "bg-blue-600 border-blue-400 text-white", icon: "👣", text: "Di chuyển 10 bước" },
          { id: "looks_sayhello", type: "looks", color: "bg-purple-600 border-purple-400 text-white", icon: "💬", text: "Nói 'Xin chào!' 2s" },
          { id: "sound_meow", type: "sound", color: "bg-pink-600 border-pink-400 text-white", icon: "🐱", text: "Phát âm thanh Meow" },
          { id: "motion_turn90", type: "motion", color: "bg-blue-600 border-blue-400 text-white", icon: "🔄", text: "Xoay phải 90 độ" }
        ]
      },
      {
        id: 1,
        title: "THỬ THÁCH 2: MÈO NHẢY & KÊU MEOW",
        goal: "Lập trình cho chú mèo: Khi bấm cờ xanh ➔ Phát âm thanh Meow ➔ Xoay phải 90 độ ➔ Đổi trang phục tiếp theo",
        targetOrder: ["event_flag", "sound_meow", "motion_turn90", "looks_nextcostume"],
        availableBlocks: [
          { id: "event_flag", type: "event", color: "bg-amber-500 border-amber-400 text-slate-950", icon: "🏳️", text: "Khi bấm cờ xanh" },
          { id: "sound_meow", type: "sound", color: "bg-pink-600 border-pink-400 text-white", icon: "🐱", text: "Phát âm thanh Meow" },
          { id: "motion_turn90", type: "motion", color: "bg-blue-600 border-blue-400 text-white", icon: "🔄", text: "Xoay phải 90 độ" },
          { id: "looks_nextcostume", type: "looks", color: "bg-purple-600 border-purple-400 text-white", icon: "👗", text: "Đổi trang phục tiếp theo" },
          { id: "motion_move10", type: "motion", color: "bg-blue-600 border-blue-400 text-white", icon: "👣", text: "Di chuyển 10 bước" }
        ]
      },
      {
        id: 2,
        title: "THỬ THÁCH 3: VÒNG LẶP BƯỚC ĐI 10 LẦN",
        goal: "Lập trình thuật toán: Khi bấm cờ xanh ➔ Lặp lại 10 lần (Di chuyển 10 bước + Đợi 0.5s)",
        targetOrder: ["event_flag", "control_repeat10", "motion_move10", "control_wait"],
        availableBlocks: [
          { id: "event_flag", type: "event", color: "bg-amber-500 border-amber-400 text-slate-950", icon: "🏳️", text: "Khi bấm cờ xanh" },
          { id: "control_repeat10", type: "control", color: "bg-amber-600 border-amber-400 text-white", icon: "🔁", text: "Lặp lại 10 lần" },
          { id: "motion_move10", type: "motion", color: "bg-blue-600 border-blue-400 text-white", icon: "👣", text: "Di chuyển 10 bước" },
          { id: "control_wait", type: "control", color: "bg-amber-600 border-amber-400 text-white", icon: "⏳", text: "Đợi 0.5 giây" },
          { id: "sound_meow", type: "sound", color: "bg-pink-600 border-pink-400 text-white", icon: "🐱", text: "Phát âm thanh Meow" }
        ]
      },
      {
        id: 3,
        title: "THỬ THÁCH 4: VẼ HÌNH VUÔNG 4 CẠNH",
        goal: "Lập trình cho chú mèo vẽ hình vuông: Khi bấm cờ xanh ➔ Lặp lại 4 lần (Di chuyển 50 bước + Xoay phải 90 độ)",
        targetOrder: ["event_flag", "control_repeat4", "motion_move50", "motion_turn90"],
        availableBlocks: [
          { id: "event_flag", type: "event", color: "bg-amber-500 border-amber-400 text-slate-950", icon: "🏳️", text: "Khi bấm cờ xanh" },
          { id: "control_repeat4", type: "control", color: "bg-amber-600 border-amber-400 text-white", icon: "🔁", text: "Lặp lại 4 lần" },
          { id: "motion_move50", type: "motion", color: "bg-blue-600 border-blue-400 text-white", icon: "👣", text: "Di chuyển 50 bước" },
          { id: "motion_turn90", type: "motion", color: "bg-blue-600 border-blue-400 text-white", icon: "🔄", text: "Xoay phải 90 độ" },
          { id: "looks_sayhello", type: "looks", color: "bg-purple-600 border-purple-400 text-white", icon: "💬", text: "Nói 'Đã vẽ xong!'" }
        ]
      }
    ];

    this.scratchWorkspace = [];
    this.resetScratchStage();
    this.renderScratchPalette();
    this.renderScratchWorkspace();
  }

  switchScratchMission(idx) {
    this.currentScratchMissionIdx = parseInt(idx, 10) || 0;
    const curMission = this.scratchMissions[this.currentScratchMissionIdx];

    const titleEl = document.getElementById("scratch-mission-title");
    const goalEl = document.getElementById("scratch-mission-goal");
    const selectEl = document.getElementById("scratch-mission-select");

    if (titleEl) titleEl.innerText = curMission.title;
    if (goalEl) goalEl.innerText = curMission.goal;
    if (selectEl) selectEl.value = this.currentScratchMissionIdx;

    this.scratchWorkspace = [];
    this.resetScratchStage();
    this.renderScratchPalette();
    this.renderScratchWorkspace();
    window.app.showToast(`🎯 Đã mở: "${curMission.title}"!`, "info");
  }

  renderScratchPalette() {
    const paletteEl = document.getElementById("scratch-palette-blocks");
    if (!paletteEl) return;

    const curMission = this.scratchMissions[this.currentScratchMissionIdx];
    paletteEl.innerHTML = curMission.availableBlocks.map(b => `
      <div onclick="lecturePortal.addBlockToWorkspace('${b.id}')" class="p-2 rounded-xl border-2 cursor-pointer shadow-sm hover:scale-102 transition-all select-none flex items-center justify-between ${b.color}">
        <div class="flex items-center gap-1.5">
          <span class="text-base">${b.icon}</span>
          <span class="font-black text-xs">${b.text}</span>
        </div>
        <span class="text-xs font-bold bg-black/20 px-1.5 py-0.5 rounded-md">➕ Thêm</span>
      </div>
    `).join("");
  }

  addBlockToWorkspace(blockId) {
    const curMission = this.scratchMissions[this.currentScratchMissionIdx];
    const block = curMission.availableBlocks.find(b => b.id === blockId);
    if (!block) return;

    this.scratchWorkspace.push(JSON.parse(JSON.stringify(block)));
    this.playTickSound();
    this.renderScratchWorkspace();
  }

  removeBlockFromWorkspace(index) {
    this.scratchWorkspace.splice(index, 1);
    this.playTickSound();
    this.renderScratchWorkspace();
  }

  clearScratchWorkspace() {
    this.scratchWorkspace = [];
    this.renderScratchWorkspace();
    window.app.showToast("🧹 Đã làm sạch kịch bản Scratch!", "info");
  }

  renderScratchWorkspace() {
    const listEl = document.getElementById("scratch-workspace-list");
    const countEl = document.getElementById("scratch-blocks-count");

    if (countEl) countEl.innerText = `Số khối: ${this.scratchWorkspace.length}`;
    if (!listEl) return;

    if (this.scratchWorkspace.length === 0) {
      listEl.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs italic">
          <span class="text-3xl block mb-1 opacity-40">🧩</span>
          <span>Bấm các khối lệnh bên cạnh để ghép vào kịch bản này!</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.scratchWorkspace.map((b, idx) => `
      <div id="scratch-ws-block-${idx}" class="p-2 rounded-xl border-2 shadow-md transition-all flex items-center justify-between select-none relative group ${b.color}">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-mono opacity-80">${idx + 1}.</span>
          <span class="text-base">${b.icon}</span>
          <span class="font-black text-xs">${b.text}</span>
        </div>
        <button onclick="lecturePortal.removeBlockFromWorkspace(${idx})" class="text-xs font-bold text-white/80 hover:text-white bg-black/30 hover:bg-rose-600 px-1.5 py-0.5 rounded-lg transition-all" title="Xóa khối này">
          ✕
        </button>
      </div>
    `).join("");
  }

  resetScratchStage() {
    this.scratchCatState = { x: 0, y: 0, angle: 0, costume: 1 };
    this.isScratchRunning = false;

    const sprite = document.getElementById("scratch-cat-sprite");
    const speech = document.getElementById("scratch-cat-speech");
    const coordsEl = document.getElementById("scratch-coords-disp");

    if (sprite) {
      sprite.style.transform = `translate(0px, 0px) rotate(0deg)`;
    }
    if (speech) speech.classList.add("hidden");
    if (coordsEl) coordsEl.innerText = "x: 0 | y: 0";
  }

  async runScratchScript() {
    if (this.isScratchRunning) return;
    if (this.scratchWorkspace.length === 0) {
      window.app.showToast("Thầy Cô và các bạn hãy ghép ít nhất 1 khối lệnh vào kịch bản nhé!", "warning");
      return;
    }

    this.isScratchRunning = true;
    this.resetScratchStage();
    window.app.showToast("🚀 Bắt đầu thực thi kịch bản Scratch...", "info");

    const curMission = this.scratchMissions[this.currentScratchMissionIdx];
    const userBlockIds = this.scratchWorkspace.map(b => b.id);

    // Chạy tuần tự từng khối lệnh
    for (let i = 0; i < this.scratchWorkspace.length; i++) {
      const block = this.scratchWorkspace[i];
      const blockEl = document.getElementById(`scratch-ws-block-${i}`);

      if (blockEl) {
        blockEl.classList.add("ring-4", "ring-yellow-300", "scale-105");
      }

      await this.executeScratchBlock(block);

      if (blockEl) {
        blockEl.classList.remove("ring-4", "ring-yellow-300", "scale-105");
      }
      await new Promise(res => setTimeout(res, 350));
    }

    this.isScratchRunning = false;

    // Kiểm tra tính chính xác của chuỗi khối lệnh so với mục tiêu bài học
    const isExactMatch = curMission.targetOrder.length === userBlockIds.length &&
      curMission.targetOrder.every((val, idx) => val === userBlockIds[idx]);

    if (isExactMatch) {
      this.celebrateScratchWin();
    } else {
      window.app.showToast("💡 Thuật toán đã chạy xong! Hãy đối chiếu lại với yêu cầu thử thách để ghép đúng 100% nhé.", "info");
    }
  }

  async executeScratchBlock(block) {
    const sprite = document.getElementById("scratch-cat-sprite");
    const speech = document.getElementById("scratch-cat-speech");
    const speechText = document.getElementById("scratch-speech-text");
    const coordsEl = document.getElementById("scratch-coords-disp");

    if (block.id === "event_flag") {
      this.playTickSound();
    } else if (block.id === "motion_move10") {
      this.scratchCatState.x += 25;
      if (sprite) sprite.style.transform = `translate(${this.scratchCatState.x}px, ${this.scratchCatState.y}px) rotate(${this.scratchCatState.angle}deg)`;
      this.playTickSound();
    } else if (block.id === "motion_move50") {
      this.scratchCatState.x += 50;
      if (sprite) sprite.style.transform = `translate(${this.scratchCatState.x}px, ${this.scratchCatState.y}px) rotate(${this.scratchCatState.angle}deg)`;
      this.playTickSound();
    } else if (block.id === "motion_turn90") {
      this.scratchCatState.angle += 90;
      if (sprite) sprite.style.transform = `translate(${this.scratchCatState.x}px, ${this.scratchCatState.y}px) rotate(${this.scratchCatState.angle}deg)`;
      this.playTickSound();
    } else if (block.id === "sound_meow") {
      this.playMeowSound();
    } else if (block.id === "looks_sayhello") {
      if (speechText) speechText.innerText = "Xin chào các bạn!";
      if (speech) speech.classList.remove("hidden");
      this.playTingSound();
      await new Promise(res => setTimeout(res, 1200));
      if (speech) speech.classList.add("hidden");
    } else if (block.id === "looks_nextcostume") {
      const emojiEl = document.getElementById("scratch-cat-emoji");
      if (emojiEl) emojiEl.innerText = emojiEl.innerText === "🐱" ? "😸" : "🐱";
      this.playTickSound();
    } else if (block.id.startsWith("control_repeat")) {
      this.playTickSound();
    } else if (block.id === "control_wait") {
      await new Promise(res => setTimeout(res, 500));
    }

    if (coordsEl) coordsEl.innerText = `x: ${this.scratchCatState.x} | y: ${this.scratchCatState.y}`;
  }

  playMeowSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(330, this.audioCtx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.4);
    } catch (e) {}
  }

  celebrateScratchWin() {
    this.playStarTingSound();
    if (window.Simulation3D?.triggerFireworks) {
      window.Simulation3D.triggerFireworks();
    }
    window.app.showToast("🎉 CHÍNH XÁC 100%! Bạn đã hoàn thành xuất sắc thuật toán khối Scratch!", "success");
    this.openStarAwardForScratchWinner();
  }

  openStarAwardForScratchWinner() {
    this.toggleInSlideStarAward(this.wheelNames[0] ? this.wheelNames[0].replace(/^\d+\.\s*/, '') : "Lập Trình Viên Scratch Nhí", "Hoàn thành xuất sắc thuật toán trong Trò chơi Khối Lập Trình Scratch 3D");
  }

  // =========================================================================
  // OPTION 4: SOẠN & TÙY BIẾN NHIỆM VỤ BẮN BÓNG 3D (CUSTOM BUBBLE MISSION MAKER)
  // =========================================================================
  toggleInSlideBubblePop() {
    const overlay = document.getElementById("in-slide-bubble-pop-overlay");
    if (!overlay) return;

    this.bubblePopActive = !this.bubblePopActive;
    if (this.bubblePopActive) {
      if (this.inSlideQuizActive) this.toggleInSlideQuiz();
      if (this.crosswordActive) this.toggleInSlideCrossword();
      if (this.luckyWheelActive) this.toggleInSlideLuckyWheel();
      if (this.goldenBellActive) this.toggleInSlideGoldenBell();
      if (this.memoryCardActive) this.toggleInSlideMemoryCard();
      if (this.columnMatchActive) this.toggleInSlideColumnMatch();
      if (this.scratchActive) this.toggleInSlideScratch();
      overlay.classList.remove("hidden");
      this.initBubblePopGame();
    } else {
      overlay.classList.add("hidden");
      if (this.bubbleAnimId) cancelAnimationFrame(this.bubbleAnimId);
    }
  }

  openBubblePopMakerModal() {
    const modal = document.getElementById("bubble-pop-maker-modal");
    if (!modal) return;

    const curMission = this.bubblePopMissions[this.currentBubbleMissionIdx % this.bubblePopMissions.length];
    const missionInput = document.getElementById("maker-bubble-mission-text");
    const targetsInput = document.getElementById("maker-bubble-targets-input");
    const distractorsInput = document.getElementById("maker-bubble-distractors-input");

    if (curMission) {
      if (missionInput) missionInput.value = curMission.mission;
      if (targetsInput) {
        targetsInput.value = curMission.pool.filter(p => p.isTarget).map(p => p.text).join("\n");
      }
      if (distractorsInput) {
        distractorsInput.value = curMission.pool.filter(p => !p.isTarget).map(p => p.text).join("\n");
      }
    }

    modal.classList.add("active");
  }

  loadPresetBubbleMission(presetKey) {
    const presets = {
      input: {
        mission: "Nhiệm vụ: Bắn vỡ tất cả các bong bóng chứa THIẾT BỊ VÀO (INPUT)",
        targetCount: 5,
        targets: ["Bàn phím", "Chuột máy", "Micro", "Webcam", "Máy quét Scanner"],
        distractors: ["Màn hình", "Máy in", "Loa", "Tai nghe"]
      },
      output: {
        mission: "Nhiệm vụ: Bắn vỡ tất cả các bong bóng chứa THIẾT BỊ RA (OUTPUT)",
        targetCount: 4,
        targets: ["Màn hình", "Máy in", "Loa nghe", "Tai nghe"],
        distractors: ["Chuột", "Bàn phím", "Micro", "Webcam"]
      },
      keyboard: {
        mission: "Nhiệm vụ: Bắn vỡ các bong bóng chứa PHÍM HÀNG CƠ SỞ (HOME ROW)",
        targetCount: 5,
        targets: ["Phím F (Gờ nổi)", "Phím J (Gờ nổi)", "Phím A", "Phím S", "Phím L"],
        distractors: ["Phím Q (Hàng trên)", "Phím Z (Hàng dưới)", "Phím Số 1", "Phím Cách Space"]
      },
      storage: {
        mission: "Nhiệm vụ: Bắn vỡ các bong bóng chứa THIẾT BỊ LƯU TRỮ DỮ LIỆU",
        targetCount: 4,
        targets: ["Ổ đĩa cứng HDD", "Ổ đĩa SSD", "Thẻ nhớ SD", "USB Flash Drive"],
        distractors: ["Màn hình", "Bàn phím", "Chuột", "Máy in"]
      }
    };

    const chosen = presets[presetKey] || presets.input;
    const pool = [
      ...chosen.targets.map(t => ({ text: t, isTarget: true, icon: "🎯" })),
      ...chosen.distractors.map(d => ({ text: d, isTarget: false, icon: "🚫" }))
    ];

    const missionObj = {
      mission: chosen.mission,
      targetCount: chosen.targetCount,
      pool: pool
    };

    this.bubblePopMissions[this.currentBubbleMissionIdx] = missionObj;

    const modal = document.getElementById("bubble-pop-maker-modal");
    if (modal) modal.classList.remove("active");

    this.initBubblePopGame();
    window.app.showToast(`🎉 Đã nạp nhiệm vụ: "${chosen.mission}"!`, "success");
  }

  saveCustomBubbleMissionFromForm() {
    const missionInput = document.getElementById("maker-bubble-mission-text");
    const targetsInput = document.getElementById("maker-bubble-targets-input");
    const distractorsInput = document.getElementById("maker-bubble-distractors-input");

    if (!missionInput || !targetsInput || !distractorsInput) return;

    const missionText = (missionInput.value || "Nhiệm vụ: Bắn vỡ các từ khóa theo yêu cầu").trim();
    const targets = targetsInput.value.split("\n").map(s => s.trim()).filter(s => s.length > 0);
    const distractors = distractorsInput.value.split("\n").map(s => s.trim()).filter(s => s.length > 0);

    if (targets.length < 2) {
      window.app.showToast("Thầy Cô hãy nhập ít nhất 2 từ khóa đúng mục tiêu!", "warning");
      return;
    }

    const pool = [
      ...targets.map(t => ({ text: t, isTarget: true, icon: "🎯" })),
      ...distractors.map(d => ({ text: d, isTarget: false, icon: "🚫" }))
    ];

    const customMission = {
      mission: missionText,
      targetCount: Math.min(targets.length, 5),
      pool: pool
    };

    this.bubblePopMissions.push(customMission);
    this.currentBubbleMissionIdx = this.bubblePopMissions.length - 1;

    const modal = document.getElementById("bubble-pop-maker-modal");
    if (modal) modal.classList.remove("active");

    this.initBubblePopGame();
    window.app.showToast(`🎉 Đã áp dụng thành công nhiệm vụ bắn bóng: "${missionText}"!`, "success");
  }

  initBubblePopGame() {
    if (this.bubblePopMissions.length === 0) {
      this.bubblePopMissions = [
        {
          mission: "Nhiệm vụ: Bắn vỡ tất cả các bong bóng chứa THIẾT BỊ VÀO (INPUT)",
          targetCount: 5,
          pool: [
            { text: "Bàn phím", isTarget: true, icon: "⌨️" },
            { text: "Chuột máy", isTarget: true, icon: "🖱️" },
            { text: "Micro", isTarget: true, icon: "🎙️" },
            { text: "Webcam", isTarget: true, icon: "📷" },
            { text: "Máy quét Scanner", isTarget: true, icon: "📠" },
            { text: "Màn hình", isTarget: false, icon: "🖥️" },
            { text: "Máy in", isTarget: false, icon: "🖨️" },
            { text: "Loa", isTarget: false, icon: "🔊" },
            { text: "Tai nghe", isTarget: false, icon: "🎧" }
          ]
        },
        {
          mission: "Nhiệm vụ: Bắn vỡ tất cả các bong bóng chứa THIẾT BỊ RA (OUTPUT)",
          targetCount: 4,
          pool: [
            { text: "Màn hình", isTarget: true, icon: "🖥️" },
            { text: "Máy in", isTarget: true, icon: "🖨️" },
            { text: "Loa nghe", isTarget: true, icon: "🔊" },
            { text: "Tai nghe", isTarget: true, icon: "🎧" },
            { text: "Chuột", isTarget: false, icon: "🖱️" },
            { text: "Bàn phím", isTarget: false, icon: "⌨️" },
            { text: "Micro", isTarget: false, icon: "🎙️" }
          ]
        },
        {
          mission: "Nhiệm vụ: Bắn vỡ các bong bóng chứa PHÍM THUỘC HÀNG CƠ SỞ (HOME ROW)",
          targetCount: 5,
          pool: [
            { text: "Phím F (Gờ nổi)", isTarget: true, icon: "🔤" },
            { text: "Phím J (Gờ nổi)", isTarget: true, icon: "🔤" },
            { text: "Phím A", isTarget: true, icon: "🔤" },
            { text: "Phím S", isTarget: true, icon: "🔤" },
            { text: "Phím L", isTarget: true, icon: "🔤" },
            { text: "Phím Q (Hàng trên)", isTarget: false, icon: "🚫" },
            { text: "Phím Z (Hàng dưới)", isTarget: false, icon: "🚫" },
            { text: "Phím Số 1", isTarget: false, icon: "🚫" }
          ]
        }
      ];
    }

    const curMission = this.bubblePopMissions[this.currentBubbleMissionIdx % this.bubblePopMissions.length];
    this.bubbleScore = 0;
    this.bubbleTarget = curMission.targetCount;
    this.bubbles = [];
    this.bubbleParticles = [];

    const missionTextEl = document.getElementById("bubble-pop-mission-text");
    const scoreBadge = document.getElementById("bubble-pop-score-badge");

    if (missionTextEl) missionTextEl.innerText = curMission.mission;
    if (scoreBadge) scoreBadge.innerText = `Đã bắn: 0 / ${this.bubbleTarget}`;

    const canvas = document.getElementById("bubble-pop-canvas");
    if (!canvas) return;

    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = canvas.parentElement.clientHeight || 400;

    const colors = [
      { bg: "rgba(59, 130, 246, 0.75)", border: "#93c5fd" },
      { bg: "rgba(16, 185, 129, 0.75)", border: "#6ee7b7" },
      { bg: "rgba(245, 158, 11, 0.75)", border: "#fde68a" },
      { bg: "rgba(236, 72, 153, 0.75)", border: "#fbcfe8" },
      { bg: "rgba(139, 92, 246, 0.75)", border: "#c4b5fd" }
    ];

    // Tạo các quả bóng ban đầu
    for (let i = 0; i < 7; i++) {
      const item = curMission.pool[Math.floor(Math.random() * curMission.pool.length)];
      const color = colors[i % colors.length];
      this.bubbles.push({
        id: i,
        text: item.text,
        icon: item.icon,
        isTarget: item.isTarget,
        x: 60 + Math.random() * (canvas.width - 120),
        y: canvas.height + 40 + i * 55,
        radius: 42,
        speedY: 1.0 + Math.random() * 0.9,
        swingOffset: Math.random() * Math.PI * 2,
        color: color
      });
    }

    // Lắng nghe click / touch trên canvas
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      this.checkBubbleClick(clickX, clickY);
    };

    if (this.bubbleAnimId) cancelAnimationFrame(this.bubbleAnimId);
    this.animateBubblePop();
  }

  animateBubblePop() {
    const canvas = document.getElementById("bubble-pop-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const curMission = this.bubblePopMissions[this.currentBubbleMissionIdx % this.bubblePopMissions.length];

    // Vẽ và cập nhật bóng bay
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y -= b.speedY;
      b.x += Math.sin(b.y * 0.02 + b.swingOffset) * 0.6;

      // Vẽ quả bóng 3D dạ quang
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color.bg;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = b.color.border;
      ctx.stroke();

      // Đốm sáng phản quang 3D
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fill();

      // Vẽ Icon & Chữ
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "18px sans-serif";
      ctx.fillText(b.icon, b.x, b.y - 4);

      ctx.font = "bold 10px sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(b.text, b.x, b.y + 14);
      ctx.restore();

      // Nếu bay khỏi đỉnh màn hình -> hồi sinh từ dưới
      if (b.y < -b.radius) {
        const item = curMission.pool[Math.floor(Math.random() * curMission.pool.length)];
        b.y = canvas.height + b.radius;
        b.x = 60 + Math.random() * (canvas.width - 120);
        b.text = item.text;
        b.icon = item.icon;
        b.isTarget = item.isTarget;
      }
    }

    // Vẽ và cập nhật hạt nổ (Particles)
    for (let i = this.bubbleParticles.length - 1; i >= 0; i--) {
      const p = this.bubbleParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;

      if (p.alpha <= 0) {
        this.bubbleParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    if (this.bubblePopActive) {
      this.bubbleAnimId = requestAnimationFrame(() => this.animateBubblePop());
    }
  }

  checkBubbleClick(clickX, clickY) {
    const canvas = document.getElementById("bubble-pop-canvas");
    const scoreBadge = document.getElementById("bubble-pop-score-badge");
    const curMission = this.bubblePopMissions[this.currentBubbleMissionIdx % this.bubblePopMissions.length];

    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      const dist = Math.hypot(clickX - b.x, clickY - b.y);

      if (dist < b.radius + 6) {
        if (b.isTarget) {
          // Bắn đúng mục tiêu!
          this.playPopSound();
          this.createBubbleExplosion(b.x, b.y, b.color.border);
          this.bubbleScore++;

          if (scoreBadge) scoreBadge.innerText = `Đã bắn: ${this.bubbleScore} / ${this.bubbleTarget}`;
          window.app.showToast(`🎯 Tuyệt vời! "${b.text}" chính xác!`, "success");

          // Tái sinh bóng mới
          const item = curMission.pool[Math.floor(Math.random() * curMission.pool.length)];
          b.y = canvas.height + b.radius;
          b.x = 60 + Math.random() * (canvas.width - 120);
          b.text = item.text;
          b.icon = item.icon;
          b.isTarget = item.isTarget;

          if (this.bubbleScore >= this.bubbleTarget) {
            this.celebrateBubbleWin();
          }
        } else {
          // Bắn nhầm từ khóa không thuộc yêu cầu
          window.app.showToast(`❌ "${b.text}" không thuộc yêu cầu nhiệm vụ này!`, "warning");
          b.y += 40; // Đẩy tụt bóng xuống
        }
        break;
      }
    }
  }

  createBubbleExplosion(x, y, color) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14;
      const speed = 2 + Math.random() * 3.5;
      this.bubbleParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: color,
        alpha: 1.0
      });
    }
  }

  playPopSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  switchBubblePopMission() {
    this.currentBubbleMissionIdx++;
    this.initBubblePopGame();
    window.app.showToast("🎯 Đã chuyển sang nhiệm vụ mới!", "info");
  }

  restartBubblePopGame() {
    this.initBubblePopGame();
  }

  celebrateBubbleWin() {
    this.playStarTingSound();
    if (window.Simulation3D?.triggerFireworks) {
      window.Simulation3D.triggerFireworks();
    }
    window.app.showToast(`🎉 XUẤT SẮC! Cả lớp đã bắn hạ toàn bộ ${this.bubbleTarget} mục tiêu chính xác!`, "success");
    this.openStarAwardForBubbleWinner();
  }

  openStarAwardForBubbleWinner() {
    this.toggleInSlideStarAward(this.wheelNames[0] ? this.wheelNames[0].replace(/^\d+\.\s*/, '') : "Xạ Thủ Bắn Bóng Xuất Sắc", "Bắn nổ chính xác tất cả các từ khóa trong trò chơi Bong Bóng 3D");
  }

  // =========================================================================
  // TRÒ CHƠI NỐI CỘT ĐỊNH NGHĨA 3D & SOẠN CẶP NỐI (CUSTOM COLUMN MATCH)
  // =========================================================================
  toggleInSlideColumnMatch() {
    const overlay = document.getElementById("in-slide-column-match-overlay");
    if (!overlay) return;

    this.columnMatchActive = !this.columnMatchActive;
    if (this.columnMatchActive) {
      if (this.inSlideQuizActive) this.toggleInSlideQuiz();
      if (this.crosswordActive) this.toggleInSlideCrossword();
      if (this.luckyWheelActive) this.toggleInSlideLuckyWheel();
      if (this.goldenBellActive) this.toggleInSlideGoldenBell();
      if (this.memoryCardActive) this.toggleInSlideMemoryCard();
      if (this.bubblePopActive) this.toggleInSlideBubblePop();
      if (this.scratchActive) this.toggleInSlideScratch();
      overlay.classList.remove("hidden");
      if (!this.columnMatchData) {
        this.loadPresetColumnMatch('devices');
      } else {
        this.initColumnMatchGame();
      }
    } else {
      overlay.classList.add("hidden");
    }
  }

  openColumnMatchMakerModal() {
    const modal = document.getElementById("column-match-maker-modal");
    if (!modal) return;

    const titleInput = document.getElementById("maker-column-title");
    const rowsInput = document.getElementById("maker-column-rows-input");

    if (this.columnMatchData) {
      if (titleInput) titleInput.value = this.columnMatchData.title;
      if (rowsInput) {
        rowsInput.value = this.columnMatchData.pairs.map(p => `${p.left} | ${p.right}`).join("\n");
      }
    }

    modal.classList.add("active");
  }

  loadPresetColumnMatch(presetKey) {
    const presets = {
      devices: {
        title: "CHỦ ĐỀ 1: THIẾT BỊ MÁY TÍNH & CHỨC NĂNG",
        pairs: [
          { id: 1, left: "🖥️ Màn hình máy tính", right: "Hiển thị hình ảnh, chữ viết và kết quả làm việc cho em quan sát" },
          { id: 2, left: "🖱️ Chuột máy tính", right: "Điều khiển con trỏ trên màn hình và thực hiện nhấp chọn đối tượng" },
          { id: 3, left: "⌨️ Bàn phím máy tính", right: "Nhập các ký tự văn bản, chữ cái, con số và phím điều khiển vào máy tính" },
          { id: 4, left: "🔲 Thân máy (CPU)", right: "Chứa bộ vi xử lý đóng vai trò bộ não xử lý toàn bộ dữ liệu máy tính" }
        ]
      },
      mouse: {
        title: "CHỦ ĐỀ 2: CÁC THAO TÁC CƠ BẢN VỚI CHUỘT MÁY TÍNH",
        pairs: [
          { id: 1, left: "🖱️ Nháy chuột trái", right: "Nhấn nút chuột trái một lần rồi thả tay để chọn một đối tượng" },
          { id: 2, left: "🖱️ Nháy đúp chuột", right: "Nhấn nút chuột trái liên tiếp 2 lần thật nhanh để mở tệp hoặc phần mềm" },
          { id: 3, left: "🖱️ Nháy chuột phải", right: "Nhấn nút chuột phải một lần để mở bảng menu lối tắt tính năng" },
          { id: 4, left: "🖱️ Kéo thả chuột", right: "Nhấn giữ nút chuột trái, di chuyển đối tượng đến vị trí mới rồi thả tay" }
        ]
      },
      keyboard: {
        title: "CHỦ ĐỀ 3: CÁC HÀNG PHÍM TRÊN BÀN PHÍM MÁY TÍNH",
        pairs: [
          { id: 1, left: "⌨️ Hàng phím cơ sở", right: "Chứa 2 phím có gờ mốc đặt tay F và J cùng các phím A, S, D, K, L" },
          { id: 2, left: "⌨️ Hàng phím trên", right: "Nằm ngay phía trên hàng cơ sở, chứa các phím Q, W, E, R, T, Y, U, I, O, P" },
          { id: 3, left: "⌨️ Hàng phím dưới", right: "Nằm ngay phía dưới hàng cơ sở, chứa các phím Z, X, C, V, B, N, M" },
          { id: 4, left: "⌨️ Phím cách (Space)", right: "Phím dài nhất nằm ở hàng phím dưới cùng dùng để tạo dấu cách giữa các từ" }
        ]
      },
      software: {
        title: "CHỦ ĐỀ 4: PHẦN MỀM HỌC TẬP VÀ BIỂU TƯỢNG",
        pairs: [
          { id: 1, left: "📝 MS Word (W màu xanh)", right: "Phần mềm dùng để soạn thảo bài thơ, kể chuyện và định dạng văn bản" },
          { id: 2, left: "🎨 Paint (Bảng pha màu)", right: "Phần mềm dùng để vẽ tranh, tô màu và tạo các hình khối sáng tạo" },
          { id: 3, left: "🐱 Scratch (Chú mèo vàng)", right: "Môi trường lập trình kéo thả các khối lệnh tạo trò chơi và hoạt hình" },
          { id: 4, left: "🌐 Trình duyệt Web", right: "Phần mềm Chrome hoặc Cốc Cốc dùng để tra cứu kiến thức trên Internet" }
        ]
      }
    };

    const chosen = presets[presetKey] || presets.devices;
    this.columnMatchData = JSON.parse(JSON.stringify(chosen));

    const modal = document.getElementById("column-match-maker-modal");
    if (modal) modal.classList.remove("active");

    const themeTitle = document.getElementById("column-match-theme-title");
    if (themeTitle) themeTitle.innerText = this.columnMatchData.title;

    this.initColumnMatchGame();
    window.app.showToast(`🎉 Đã tải bộ nối cột: "${chosen.title}"!`, "success");
  }

  saveCustomColumnMatchFromForm() {
    const titleInput = document.getElementById("maker-column-title");
    const rowsInput = document.getElementById("maker-column-rows-input");

    if (!titleInput || !rowsInput) return;

    const title = (titleInput.value || "BỘ NỐI CỘT TÙY BIẾN").trim();
    const lines = rowsInput.value.split("\n").filter(l => l.trim().length > 0);

    if (lines.length < 2) {
      window.app.showToast("Thầy Cô hãy nhập ít nhất 2 cặp nối (Cột A | Cột B)!", "warning");
      return;
    }

    const pairs = lines.map((line, idx) => {
      const parts = line.split("|");
      const left = (parts[0] || `Khái niệm ${idx + 1}`).trim();
      const right = (parts[1] || `Định nghĩa ${idx + 1}`).trim();
      return { id: idx + 1, left, right };
    });

    this.columnMatchData = {
      title: title,
      pairs: pairs
    };

    const modal = document.getElementById("column-match-maker-modal");
    if (modal) modal.classList.remove("active");

    const themeTitle = document.getElementById("column-match-theme-title");
    if (themeTitle) themeTitle.innerText = this.columnMatchData.title;

    this.initColumnMatchGame();
    window.app.showToast(`🎉 Đã áp dụng thành công bộ nối cột: "${title}"!`, "success");
  }

  initColumnMatchGame() {
    const pairs = (this.columnMatchData && this.columnMatchData.pairs) ? this.columnMatchData.pairs : [
      { id: 1, left: "🖥️ Màn hình máy tính", right: "Hiển thị hình ảnh, chữ viết và kết quả làm việc cho em quan sát" },
      { id: 2, left: "🖱️ Chuột máy tính", right: "Điều khiển con trỏ trên màn hình và thực hiện nhấp chọn đối tượng" },
      { id: 3, left: "⌨️ Bàn phím máy tính", right: "Nhập các ký tự văn bản, chữ cái, con số và phím điều khiển vào máy tính" },
      { id: 4, left: "🔲 Thân máy (CPU)", right: "Chứa bộ vi xử lý đóng vai trò bộ não xử lý toàn bộ dữ liệu máy tính" }
    ];

    this.columnLeftItems = pairs.map(p => ({ id: p.id, text: p.left })).sort(() => Math.random() - 0.5);
    this.columnRightItems = pairs.map(p => ({ id: p.id, text: p.right })).sort(() => Math.random() - 0.5);
    this.selectedLeftId = null;
    this.selectedRightId = null;
    this.matchedConnections = [];

    this.renderColumnMatchUI();
  }

  renderColumnMatchUI() {
    const leftListEl = document.getElementById("column-match-left-list");
    const rightListEl = document.getElementById("column-match-right-list");
    const progressBadge = document.getElementById("column-match-progress-badge");
    const totalPairs = this.columnLeftItems.length;

    if (progressBadge) {
      progressBadge.innerText = `Đã nối: ${this.matchedConnections.length} / ${totalPairs} Cặp`;
    }

    if (leftListEl) {
      leftListEl.innerHTML = this.columnLeftItems.map(item => {
        const isMatched = this.matchedConnections.some(c => c.leftId === item.id);
        const isSelected = this.selectedLeftId === item.id;

        return `
          <button id="col-left-${item.id}" onclick="lecturePortal.selectColumnLeft(${item.id})" class="w-full p-3 rounded-2xl border-2 text-left font-bold text-xs transition-all flex items-center justify-between ${isMatched ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 pointer-events-none ring-1 ring-emerald-400' : (isSelected ? 'bg-cyan-600 border-cyan-300 text-white shadow-lg scale-102 ring-2 ring-cyan-300' : 'bg-slate-900 border-slate-700 hover:border-cyan-400 text-white')}">
            <span>${item.text}</span>
            <span class="text-sm">${isMatched ? '✅' : (isSelected ? '👉' : '⚪')}</span>
          </button>
        `;
      }).join("");
    }

    if (rightListEl) {
      rightListEl.innerHTML = this.columnRightItems.map(item => {
        const isMatched = this.matchedConnections.some(c => c.rightId === item.id);
        const isSelected = this.selectedRightId === item.id;

        return `
          <button id="col-right-${item.id}" onclick="lecturePortal.selectColumnRight(${item.id})" class="w-full p-3 rounded-2xl border-2 text-left font-bold text-xs transition-all flex items-center justify-between ${isMatched ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 pointer-events-none ring-1 ring-emerald-400' : (isSelected ? 'bg-indigo-600 border-indigo-300 text-white shadow-lg scale-102 ring-2 ring-indigo-300' : 'bg-slate-900 border-slate-700 hover:border-indigo-400 text-white')}">
            <span>${item.text}</span>
            <span class="text-sm">${isMatched ? '✅' : (isSelected ? '👈' : '⚪')}</span>
          </button>
        `;
      }).join("");
    }
  }

  selectColumnLeft(id) {
    if (this.matchedConnections.some(c => c.leftId === id)) return;
    this.selectedLeftId = id;
    this.playTickSound();
    this.renderColumnMatchUI();

    if (this.selectedRightId !== null) {
      this.checkColumnConnection();
    }
  }

  selectColumnRight(id) {
    if (this.matchedConnections.some(c => c.rightId === id)) return;
    this.selectedRightId = id;
    this.playTickSound();
    this.renderColumnMatchUI();

    if (this.selectedLeftId !== null) {
      this.checkColumnConnection();
    }
  }

  checkColumnConnection() {
    if (this.selectedLeftId === null || this.selectedRightId === null) return;

    if (this.selectedLeftId === this.selectedRightId) {
      this.matchedConnections.push({
        leftId: this.selectedLeftId,
        rightId: this.selectedRightId
      });

      this.selectedLeftId = null;
      this.selectedRightId = null;
      this.playTingSound();
      this.renderColumnMatchUI();

      window.app.showToast("✅ Chính xác! Bạn đã nối đúng chức năng thiết bị!", "success");

      if (this.matchedConnections.length === this.columnLeftItems.length) {
        this.celebrateColumnMatchWin();
      }
    } else {
      const leftBtn = document.getElementById(`col-left-${this.selectedLeftId}`);
      const rightBtn = document.getElementById(`col-right-${this.selectedRightId}`);

      if (leftBtn) leftBtn.classList.add("bg-rose-600", "border-rose-400", "animate-shake");
      if (rightBtn) rightBtn.classList.add("bg-rose-600", "border-rose-400", "animate-shake");

      window.app.showToast("❌ Chưa chính xác, hãy đọc kỹ lại chức năng và thử lại nhé!", "error");

      setTimeout(() => {
        this.selectedLeftId = null;
        this.selectedRightId = null;
        this.renderColumnMatchUI();
      }, 700);
    }
  }

  celebrateColumnMatchWin() {
    this.playStarTingSound();
    if (window.Simulation3D?.triggerFireworks) {
      window.Simulation3D.triggerFireworks();
    }
    window.app.showToast("🎉 XUẤT SẮC! Cả lớp đã hoàn thành chính xác toàn bộ các cặp nối định nghĩa!", "success");
    this.openStarAwardForColumnWinner();
  }

  openStarAwardForColumnWinner() {
    this.toggleInSlideStarAward(this.wheelNames[0] ? this.wheelNames[0].replace(/^\d+\.\s*/, '') : "Đội Nối Cột Xuất Sắc", "Hoàn thành xuất sắc thử thách Nối Cột Định Nghĩa 3D");
  }

  // =========================================================================
  // BẢNG KHEN THƯỞNG & BẮN THÔNG BÁO 50 SAO TOÀN TRƯỜNG REALTIME
  // =========================================================================
  toggleInSlideStarAward(prefilledStudentName = "", defaultReason = "Phát biểu đúng và tích cực xây dựng bài học trên Slide") {
    const overlay = document.getElementById("in-slide-star-award-overlay");
    if (!overlay) return;

    this.starAwardActive = !this.starAwardActive;
    if (this.starAwardActive) {
      overlay.classList.remove("hidden");
      
      const nameInput = document.getElementById("star-award-student-name");
      const reasonInput = document.getElementById("star-award-reason");

      if (nameInput) nameInput.value = prefilledStudentName || (this.wheelNames[0] ? this.wheelNames[0].replace(/^\d+\.\s*/, '') : "Học Sinh Xuất Sắc");
      if (reasonInput) reasonInput.value = defaultReason;

      this.renderRecentStarLogs();
    } else {
      overlay.classList.add("hidden");
    }
  }

  async submitStarAward(starsToAdd = 10) {
    const nameInput = document.getElementById("star-award-student-name");
    const reasonInput = document.getElementById("star-award-reason");

    const rawName = (nameInput ? nameInput.value : "").trim();
    const studentName = rawName.replace(/^\d+\.\s*/, '');
    const reason = (reasonInput ? reasonInput.value : "").trim() || "Thưởng sao tích cực trên Slide";

    if (!studentName) {
      window.app.showToast("Vui lòng nhập tên học sinh được khen thưởng!", "warning");
      return;
    }

    window.app.showToast(`⭐ Đang cộng +${starsToAdd} Sao Vàng cho bạn "${studentName}"...`, "info");

    const result = await window.authService.awardStarsToStudent(studentName, starsToAdd, reason);

    if (result.success) {
      this.playStarTingSound();

      if (window.Simulation3D?.triggerFireworks) {
        window.Simulation3D.triggerFireworks();
      }

      this.recentStarLogs.unshift({
        name: studentName,
        stars: starsToAdd,
        reason: reason,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });

      this.renderRecentStarLogs();

      // NẾU TẶNG 50 SAO -> BẮN THÔNG BÁO TOÀN TRƯỜNG REALTIME
      if (starsToAdd >= 50) {
        this.triggerSchoolWideStarBroadcast(studentName, starsToAdd, reason);
      }

      window.app.showToast(`🎉 Đã tặng +${starsToAdd} Sao Vàng cho bạn "${studentName}"! Tổng sao: ${result.totalStars} ⭐`, "success");
    } else {
      window.app.showToast("Có lỗi khi tặng sao, vui lòng thử lại!", "error");
    }
  }

  triggerSchoolWideStarBroadcast(studentName, stars, reason) {
    const banner = document.getElementById("school-wide-star-broadcast");
    const textEl = document.getElementById("star-broadcast-text");

    if (textEl) {
      textEl.innerHTML = `Chúc mừng bạn <b>${studentName}</b> vừa được thưởng <b>${stars} Sao Vàng</b> vì <i>${reason}</i>!`;
    }

    if (banner) {
      banner.classList.remove("hidden");
      this.playFanfareSound();

      if (this.broadcastTimer) clearTimeout(this.broadcastTimer);
      this.broadcastTimer = setTimeout(() => {
        banner.classList.add("hidden");
      }, 7000);
    }
  }

  playFanfareSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
      const durations = [0.15, 0.15, 0.15, 0.35, 0.15, 0.6];
      let offset = 0;

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + offset);

        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + offset + durations[idx]);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + offset);
        osc.stop(this.audioCtx.currentTime + offset + durations[idx]);

        offset += durations[idx] * 0.85;
      });
    } catch (e) {}
  }

  renderRecentStarLogs() {
    const listEl = document.getElementById("star-award-log-items");
    if (!listEl) return;

    if (this.recentStarLogs.length === 0) {
      listEl.innerHTML = `<p class="italic text-slate-600">Chưa có lượt tặng sao nào trong tiết học này.</p>`;
      return;
    }

    listEl.innerHTML = this.recentStarLogs.map(log => `
      <div class="flex items-center justify-between p-1.5 bg-slate-950/80 rounded-xl border border-amber-400/20">
        <div>
          <span class="font-black text-amber-300">⭐ +${log.stars}</span>
          <span class="font-bold text-white ml-1">${log.name}</span>
          <span class="text-slate-500 text-[10px] block">${log.reason}</span>
        </div>
        <span class="text-[10px] text-slate-400 font-mono">${log.time}</span>
      </div>
    `).join("");
  }

  playStarTingSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      [587.33, 739.99, 880.00, 1174.66, 1479.98, 1760.00].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.08);
        osc.stop(this.audioCtx.currentTime + idx * 0.08 + 0.6);
      });
    } catch (e) {}
  }

  // =========================================================================
  // TRÒ CHƠI GHÉP THẺ TRÍ NHỚ 3D TRÊN SLIDE (IN-SLIDE MEMORY CARD MATCH)
  // =========================================================================
  toggleInSlideMemoryCard() {
    const overlay = document.getElementById("in-slide-memory-card-overlay");
    if (!overlay) return;

    this.memoryCardActive = !this.memoryCardActive;
    if (this.memoryCardActive) {
      if (this.inSlideQuizActive) this.toggleInSlideQuiz();
      if (this.crosswordActive) this.toggleInSlideCrossword();
      if (this.luckyWheelActive) this.toggleInSlideLuckyWheel();
      if (this.goldenBellActive) this.toggleInSlideGoldenBell();
      if (this.columnMatchActive) this.toggleInSlideColumnMatch();
      if (this.bubblePopActive) this.toggleInSlideBubblePop();
      if (this.scratchActive) this.toggleInSlideScratch();
      overlay.classList.remove("hidden");
      this.initMemoryCardGame();
    } else {
      overlay.classList.add("hidden");
    }
  }

  initMemoryCardGame() {
    const items = [
      { id: 1, icon: "🖥️", name: "Màn hình" },
      { id: 2, icon: "🖱️", name: "Chuột máy" },
      { id: 3, icon: "⌨️", name: "Bàn phím" },
      { id: 4, icon: "🖨️", name: "Máy in" },
      { id: 5, icon: "🤖", name: "Robot" },
      { id: 6, icon: "🌐", name: "Internet" }
    ];

    const deck = [...items, ...items].map((item, index) => ({
      uniqueId: index,
      id: item.id,
      icon: item.icon,
      name: item.name,
      flipped: false,
      matched: false
    })).sort(() => Math.random() - 0.5);

    this.memoryCards = deck;
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.memoryFlips = 0;
    this.isMemoryLock = false;

    this.renderMemoryGrid();
  }

  renderMemoryGrid() {
    const grid = document.getElementById("in-slide-memory-grid");
    const flipsEl = document.getElementById("memory-card-flips");
    const matchesEl = document.getElementById("memory-card-matches");

    if (flipsEl) flipsEl.innerText = `Lượt lật: ${this.memoryFlips}`;
    if (matchesEl) matchesEl.innerText = `Đã ghép: ${this.matchedPairs} / 6`;

    if (!grid) return;

    grid.innerHTML = this.memoryCards.map((card, idx) => {
      const isVisible = card.flipped || card.matched;

      return `
        <div onclick="lecturePortal.flipMemoryCard(${idx})" class="h-28 md:h-32 rounded-2xl cursor-pointer select-none transition-all duration-500 transform ${isVisible ? 'rotate-y-180 scale-105' : 'hover:scale-102 hover:border-pink-400'}">
          <div class="w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center p-2 shadow-lg transition-all duration-300 ${isVisible ? (card.matched ? 'bg-gradient-to-br from-emerald-600 to-teal-800 border-emerald-300 text-white animate-pop ring-2 ring-emerald-400' : 'bg-gradient-to-br from-pink-600 to-rose-800 border-pink-300 text-white') : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-transparent'}">
            ${isVisible ? `
              <span class="text-3xl md:text-4xl block mb-1 filter drop-shadow-md">${card.icon}</span>
              <span class="text-[11px] font-black text-center tracking-tight leading-tight">${card.name}</span>
            ` : `
              <span class="text-2xl text-pink-400 opacity-60">❓</span>
            `}
          </div>
        </div>
      `;
    }).join("");
  }

  flipMemoryCard(index) {
    if (this.isMemoryLock) return;
    const card = this.memoryCards[index];
    if (!card || card.flipped || card.matched) return;

    card.flipped = true;
    this.flippedCards.push({ card, index });
    this.playTickSound();
    this.renderMemoryGrid();

    if (this.flippedCards.length === 2) {
      this.memoryFlips++;
      this.isMemoryLock = true;

      const [first, second] = this.flippedCards;

      if (first.card.id === second.card.id) {
        setTimeout(() => {
          first.card.matched = true;
          second.card.matched = true;
          this.matchedPairs++;
          this.flippedCards = [];
          this.isMemoryLock = false;
          this.playTingSound();
          this.renderMemoryGrid();

          if (this.matchedPairs === 6) {
            this.celebrateMemoryGameWin();
          }
        }, 500);
      } else {
        setTimeout(() => {
          first.card.flipped = false;
          second.card.flipped = false;
          this.flippedCards = [];
          this.isMemoryLock = false;
          this.renderMemoryGrid();
        }, 900);
      }
    }
  }

  celebrateMemoryGameWin() {
    this.playStarTingSound();
    if (window.Simulation3D?.triggerFireworks) {
      window.Simulation3D.triggerFireworks();
    }
    window.app.showToast(`🎉 XUẤT SẮC! Cả lớp đã ghép đúng tất cả 6 cặp thẻ trong ${this.memoryFlips} lượt lật!`, "success");
    this.openStarAwardModalForMemoryWinner();
  }

  openStarAwardModalForMemoryWinner() {
    this.toggleInSlideStarAward(this.wheelNames[0] ? this.wheelNames[0].replace(/^\d+\.\s*/, '') : "Nhóm Ghép Thẻ Xuất Sắc", "Hoàn thành xuất sắc trò chơi Ghép Thẻ Trí Nhớ 3D");
  }

  // =========================================================================
  // BẢNG VÀNG XẾP HẠNG & BÁO CÁO MỨC ĐỘ YÊU THÍCH BÀI GIẢNG CỦA TRƯỜNG
  // =========================================================================
  async openAnalyticsModal() {
    const modal = document.getElementById("lecture-analytics-modal");
    const contentEl = document.getElementById("lec-analytics-content");
    if (!modal || !contentEl) return;

    window.app.showToast("📊 Đang tổng hợp số liệu Bảng Vàng & Mức độ yêu thích...", "info");
    const summary = await window.lectureService.getAnalyticsSummary();

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
                      <p class="text-[11px] text-slate-500">Lớp ${item.grade} • ${item.authorName || 'Cô Anh Đào'} • ${item.bookSeries || 'KNTT'}</p>
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
  // ĐỐ VUI 10S TRÊN SLIDE (IN-SLIDE QUICK QUIZ 10S BLITZ)
  // =========================================================================
  toggleInSlideQuiz() {
    const overlay = document.getElementById("in-slide-quiz-overlay");
    if (!overlay) return;

    this.inSlideQuizActive = !this.inSlideQuizActive;
    if (this.inSlideQuizActive) {
      if (this.crosswordActive) this.toggleInSlideCrossword();
      if (this.luckyWheelActive) this.toggleInSlideLuckyWheel();
      if (this.goldenBellActive) this.toggleInSlideGoldenBell();
      if (this.memoryCardActive) this.toggleInSlideMemoryCard();
      if (this.columnMatchActive) this.toggleInSlideColumnMatch();
      if (this.bubblePopActive) this.toggleInSlideBubblePop();
      if (this.scratchActive) this.toggleInSlideScratch();
      overlay.classList.remove("hidden");
      this.loadInSlideQuestion();
      this.startInSlideCountdown();
    } else {
      overlay.classList.add("hidden");
      if (this.inSlideQuizInterval) clearInterval(this.inSlideQuizInterval);
    }
  }

  loadInSlideQuestion() {
    const questions = [
      {
        question: "Thiết bị nào sau đây dùng để hiển thị hình ảnh và kết quả làm việc của máy tính?",
        options: ["A. Màn hình", "B. Bàn phím", "C. Chuột", "D. Thân máy"],
        correct: 0,
        explanation: "Màn hình là thiết bị xuất hiển thị hình ảnh cho người dùng quan sát."
      },
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

  // =========================================================================
  // ĐẤU TRƯỜNG RUNG CHUÔNG VÀNG 3D TRÊN SLIDE (IN-SLIDE GOLDEN BELL)
  // =========================================================================
  toggleInSlideGoldenBell() {
    const overlay = document.getElementById("in-slide-golden-bell-overlay");
    if (!overlay) return;

    this.goldenBellActive = !this.goldenBellActive;
    if (this.goldenBellActive) {
      if (this.inSlideQuizActive) this.toggleInSlideQuiz();
      if (this.crosswordActive) this.toggleInSlideCrossword();
      if (this.luckyWheelActive) this.toggleInSlideLuckyWheel();
      if (this.memoryCardActive) this.toggleInSlideMemoryCard();
      if (this.columnMatchActive) this.toggleInSlideColumnMatch();
      if (this.bubblePopActive) this.toggleInSlideBubblePop();
      if (this.scratchActive) this.toggleInSlideScratch();
      overlay.classList.remove("hidden");
      this.initGoldenBellArena();
    } else {
      overlay.classList.add("hidden");
      if (this.goldenBellInterval) clearInterval(this.goldenBellInterval);
    }
  }

  initGoldenBellArena() {
    this.goldenBellQuestions = [
      {
        q: "Thiết bị nào đóng vai trò 'Bộ não' xử lý toàn bộ lệnh và dữ liệu của máy tính?",
        opts: ["A. Bộ vi xử lý (CPU - Thân máy)", "B. Màn hình máy tính", "C. Chuột quang", "D. Bàn phím"],
        correct: 0,
        explanation: "CPU (Central Processing Unit) nằm trong thân máy là bộ não điều khiển toàn bộ hoạt động."
      },
      {
        q: "Để gõ chữ tiếng Việt 'Â' theo kiểu gõ Telex, em sẽ bấm tổ hợp phím nào?",
        opts: ["A. aa", "B. aw", "C. as", "D. af"],
        correct: 0,
        explanation: "Trong kiểu gõ Telex: aa = â, ee = ê, oo = ô, ow = ơ, uw = ư, dd = đ."
      },
      {
        q: "Hành động nào sau đây là AN TOÀN VÀ ĐÚNG QUY TẮC trong phòng thực hành máy tính?",
        opts: ["A. Mang đồ ăn, nước ngọt vào bàn máy", "B. Báo ngay với Thầy Cô khi phát hiện dây điện bị hở", "C. Tự ý cắm rút phích cắm điện nguồn", "D. Chạy nhảy đùa nghịch"],
        correct: 1,
        explanation: "Luôn báo với Thầy Cô quản lý phòng máy khi có sự cố kỹ thuật để đảm bảo an toàn."
      },
      {
        q: "Trong phần mềm Scratch, khối lệnh nào giúp nhân vật xoay một góc 90 độ?",
        opts: ["A. Khối Xoay trong nhóm Chuyển động (Motion)", "B. Khối Sự kiện", "C. Khối Âm thanh", "D. Khối Cảm biến"],
        correct: 0,
        explanation: "Khối 'Turn right 90 degrees' thuộc nhóm lệnh Chuyển động màu xanh dương."
      },
      {
        q: "CÂU HỎI QUYẾT ĐỊNH RUNG CHUÔNG VÀNG: Thông tin khi đưa lên Internet có tính chất gì quan trọng nhất?",
        opts: ["A. Lan truyền nhanh và khó thu hồi hoàn toàn", "B. Tự biến mất sau 1 ngày", "C. Chỉ bạn thân mới thấy", "D. Không bao giờ lưu lại"],
        correct: 0,
        explanation: "Thông tin số trên Internet có tính lan truyền toàn cầu, vì vậy cần suy nghĩ cẩn trọng trước khi đăng tải!"
      }
    ];

    this.goldenBellQIndex = 0;
    this.goldenBellSurvivors = 35;
    this.isGoldenBellRevealed = false;
    this.loadGoldenBellQuestion();
  }

  loadGoldenBellQuestion() {
    const q = this.goldenBellQuestions[this.goldenBellQIndex];
    if (!q) return;

    this.isGoldenBellRevealed = false;

    const qIndexBadge = document.getElementById("golden-bell-q-index");
    const qTextEl = document.getElementById("golden-bell-question-text");
    const optGrid = document.getElementById("golden-bell-options-grid");
    const survivorsEl = document.getElementById("golden-bell-survivors");
    const btnReveal = document.getElementById("btn-reveal-golden-bell");

    if (qIndexBadge) qIndexBadge.innerText = `CÂU HỎI ${this.goldenBellQIndex + 1} / ${this.goldenBellQuestions.length}`;
    if (qTextEl) qTextEl.innerText = `🔔 CÂU ${this.goldenBellQIndex + 1}: ${q.q}`;
    if (survivorsEl) survivorsEl.innerText = `${this.goldenBellSurvivors} / 35 Thí sinh`;
    if (btnReveal) btnReveal.innerHTML = "📢 Công Bố Đáp Án & Loại Thí Sinh";

    if (optGrid) {
      optGrid.innerHTML = q.opts.map((opt, idx) => `
        <button id="gb-opt-${idx}" onclick="lecturePortal.selectGoldenBellOption(${idx})" class="p-3 bg-slate-900 hover:bg-amber-950 border border-slate-700 hover:border-amber-400 rounded-2xl text-left font-bold text-xs text-white transition-all">
          ${opt}
        </button>
      `).join("");
    }

    this.startGoldenBellTimer();
  }

  startGoldenBellTimer() {
    if (this.goldenBellInterval) clearInterval(this.goldenBellInterval);
    this.goldenBellTimer = 15;

    const timerBadge = document.getElementById("golden-bell-timer-badge");
    const progressEl = document.getElementById("golden-bell-timer-progress");

    if (timerBadge) timerBadge.innerText = "15s";
    if (progressEl) progressEl.style.width = "100%";

    this.goldenBellInterval = setInterval(() => {
      this.goldenBellTimer--;
      if (timerBadge) timerBadge.innerText = `${this.goldenBellTimer}s`;

      if (progressEl) {
        progressEl.style.width = `${(this.goldenBellTimer / 15) * 100}%`;
      }

      this.playTickSound();

      if (this.goldenBellTimer <= 0) {
        clearInterval(this.goldenBellInterval);
        if (timerBadge) timerBadge.innerText = "HẾT GIỜ RUNG CHUÔNG!";
        this.revealGoldenBellAnswer();
      }
    }, 1000);
  }

  selectGoldenBellOption(index) {
    if (this.isGoldenBellRevealed) return;
    this.revealGoldenBellAnswer(index);
  }

  revealGoldenBellAnswer(userSelectedIndex = null) {
    if (this.isGoldenBellRevealed) return;
    this.isGoldenBellRevealed = true;
    if (this.goldenBellInterval) clearInterval(this.goldenBellInterval);

    const q = this.goldenBellQuestions[this.goldenBellQIndex];
    if (!q) return;

    const correctBtn = document.getElementById(`gb-opt-${q.correct}`);
    if (correctBtn) {
      correctBtn.classList.remove("bg-slate-900", "border-slate-700");
      correctBtn.classList.add("bg-emerald-600", "border-emerald-300", "text-white", "animate-bounce");
    }

    if (userSelectedIndex !== null && userSelectedIndex !== q.correct) {
      const wrongBtn = document.getElementById(`gb-opt-${userSelectedIndex}`);
      if (wrongBtn) {
        wrongBtn.classList.remove("bg-slate-900", "border-slate-700");
        wrongBtn.classList.add("bg-rose-600", "border-rose-300", "text-white");
      }
    }

    this.ringGoldenBellSound();

    const survivorDrop = [35, 28, 19, 10, 3];
    this.goldenBellSurvivors = survivorDrop[this.goldenBellQIndex] || 3;
    const survivorsEl = document.getElementById("golden-bell-survivors");
    if (survivorsEl) survivorsEl.innerText = `${this.goldenBellSurvivors} / 35 Thí sinh`;

    const btnReveal = document.getElementById("btn-reveal-golden-bell");
    if (btnReveal) {
      if (this.goldenBellQIndex < this.goldenBellQuestions.length - 1) {
        btnReveal.innerHTML = "<span>Bước Sang Câu Tiếp Theo ➔</span>";
        btnReveal.onclick = () => {
          this.goldenBellQIndex++;
          this.loadGoldenBellQuestion();
        };
      } else {
        btnReveal.innerHTML = "<span>👑 VINH DANH QUÁN QUÂN RUNG CHUÔNG VÀNG</span>";
        btnReveal.onclick = () => this.celebrateGoldenBellWinner();
      }
    }
  }

  ringGoldenBellSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, this.audioCtx.currentTime);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1174.66, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.audioCtx.currentTime + 1.8);
      osc2.stop(this.audioCtx.currentTime + 1.8);
    } catch (e) {}
  }

  celebrateGoldenBellWinner() {
    this.ringGoldenBellSound();
    if (window.Simulation3D?.triggerFireworks) {
      window.Simulation3D.triggerFireworks();
    }

    const body = document.getElementById("golden-bell-arena-body");
    if (body) {
      body.innerHTML = `
        <div class="text-center py-6 space-y-4 animate-pop">
          <span class="text-7xl block animate-bounce filter drop-shadow-2xl">🔔 👑 🌿</span>
          <h3 class="text-2xl font-black text-amber-300">VINH DANH QUÁN QUÂN RUNG CHUÔNG VÀNG!</h3>
          <div class="inline-block p-4 bg-amber-400/20 border-2 border-amber-400 rounded-3xl text-amber-200 font-bold text-xs md:text-sm">
            🏆 Chúc mừng <b>3 Thí Sinh Xuất Sắc Nhất Lớp</b> đã vượt qua cả 5 câu hỏi và Rung Chuông Vàng thành công!
          </div>
          <div class="pt-2">
            <button onclick="lecturePortal.toggleInSlideStarAward('Quán Quân Rung Chuông Vàng', 'Vượt qua 5/5 câu hỏi và Rung Chuông Vàng thành công')" class="btn btn-amber btn-md font-black shadow-xl hover:scale-105 transition-all">
              ⭐ Tặng +50 Sao Cho Quán Quân
            </button>
          </div>
        </div>
      `;
    }

    window.app.showToast("🎉 CHÚC MỪNG QUÁN QUÂN ĐÃ RUNG ĐƯỢC CHUÔNG VÀNG!", "success");
  }

  restartGoldenBellArena() {
    this.initGoldenBellArena();
  }

  // =========================================================================
  // TRÒ CHƠI Ô CHỮ BÍ MẬT 3D & SOẠN TÙY BIẾN (CUSTOM CROSSWORD MAKER)
  // =========================================================================
  toggleInSlideCrossword() {
    const overlay = document.getElementById("in-slide-crossword-overlay");
    if (!overlay) return;

    this.crosswordActive = !this.crosswordActive;
    if (this.crosswordActive) {
      if (this.inSlideQuizActive) this.toggleInSlideQuiz();
      if (this.luckyWheelActive) this.toggleInSlideLuckyWheel();
      if (this.goldenBellActive) this.toggleInSlideGoldenBell();
      if (this.memoryCardActive) this.toggleInSlideMemoryCard();
      if (this.columnMatchActive) this.toggleInSlideColumnMatch();
      if (this.bubblePopActive) this.toggleInSlideBubblePop();
      if (this.scratchActive) this.toggleInSlideScratch();
      overlay.classList.remove("hidden");
      if (!this.crosswordData) {
        this.loadPresetCrossword('computer');
      } else {
        this.renderCrosswordGrid();
        this.renderAlphabetButtons();
        this.selectCrosswordRow(0);
      }
    } else {
      overlay.classList.add("hidden");
    }
  }

  openCrosswordMakerModal() {
    const modal = document.getElementById("crossword-maker-modal");
    if (!modal) return;

    const kwInput = document.getElementById("maker-secret-keyword");
    const rowsInput = document.getElementById("maker-rows-input");

    if (this.crosswordData) {
      if (kwInput) kwInput.value = this.crosswordData.secretKeyword;
      if (rowsInput) {
        rowsInput.value = this.crosswordData.rows.map(r => `${r.word} | ${r.clue}`).join("\n");
      }
    }

    modal.classList.add("active");
  }

  loadPresetCrossword(topicKey) {
    const presets = {
      computer: {
        title: "CHỦ ĐỀ: MÁY TÍNH & THIẾT BỊ SỐ",
        secretKeyword: "MAYTINH",
        rows: [
          { word: "MANHINH", clue: "Thiết bị dùng để hiển thị chữ và hình ảnh cho người dùng nhìn thấy.", revealed: false, keyCharIndex: 0 },
          { word: "ANTOAN", clue: "Quy tắc hàng đầu khi sử dụng điện và thiết bị công nghệ trong phòng máy.", revealed: false, keyCharIndex: 0 },
          { word: "YNGHIA", clue: "Đặt tên thư mục hoặc tệp tin phải rõ ràng và có...", revealed: false, keyCharIndex: 0 },
          { word: "THUMUC", clue: "Nơi lưu trữ và sắp xếp các tệp tin bài học như một ngăn kéo tủ.", revealed: false, keyCharIndex: 0 },
          { word: "INTERNET", clue: "Mạng lưới thông tin toàn cầu kết nối hàng triệu máy tính.", revealed: false, keyCharIndex: 0 },
          { word: "NHAPCHU", clue: "Thao tác gõ các ký tự văn bản thông qua bàn phím.", revealed: false, keyCharIndex: 0 },
          { word: "HOCBAI", clue: "Mục đích chính của em khi sử dụng Web Vui Học mỗi ngày.", revealed: false, keyCharIndex: 0 }
        ]
      },
      safety: {
        title: "CHỦ ĐỀ: AN TOÀN & BẢN QUYỀN SỐ",
        secretKeyword: "ANTOAN",
        rows: [
          { word: "AMTHANH", clue: "Tín hiệu phát ra từ loa hoặc tai nghe khi nghe nhạc.", revealed: false, keyCharIndex: 0 },
          { word: "NHACNHO", clue: "Hành động Thầy Cô khuyên bảo khi học sinh dùng máy sai cách.", revealed: false, keyCharIndex: 0 },
          { word: "THONGTIN", clue: "Dữ liệu cá nhân cần bảo mật và không tùy tiện chia sẻ trên mạng.", revealed: false, keyCharIndex: 0 },
          { word: "ONGBATIN", clue: "Hỏi ý kiến người lớn trước khi truy cập trang web lạ.", revealed: false, keyCharIndex: 0 },
          { word: "ANTOANSO", clue: "Kỹ năng sống cần thiết trong thời đại công nghệ 4.0.", revealed: false, keyCharIndex: 0 },
          { word: "NGANHANG", clue: "Nơi tuyệt đối không cung cấp mã OTP cho người lạ.", revealed: false, keyCharIndex: 0 }
        ]
      },
      scratch: {
        title: "CHỦ ĐỀ: LẬP TRÌNH SCRATCH NHÍ",
        secretKeyword: "SCRATCH",
        rows: [
          { word: "SANXUAT", clue: "Tạo ra sản phẩm trò chơi hoặc hoạt hình của riêng em.", revealed: false, keyCharIndex: 0 },
          { word: "CHUOT", clue: "Thiết bị dùng để kéo thả các khối lệnh nhiều màu sắc.", revealed: false, keyCharIndex: 0 },
          { word: "ROBOT", clue: "Thiết bị thông minh có thể lập trình để di chuyển và tự động hóa.", revealed: false, keyCharIndex: 0 },
          { word: "AMTHANH", clue: "Khối lệnh màu hồng tím giúp nhân vật phát tiếng kêu Meow.", revealed: false, keyCharIndex: 0 },
          { word: "TOADO", clue: "Vị trí trục X và Y của nhân vật trên sân khấu lập trình.", revealed: false, keyCharIndex: 0 },
          { word: "CHUYENDONG", clue: "Khối lệnh màu xanh dương giúp nhân vật di chuyển 10 bước.", revealed: false, keyCharIndex: 0 },
          { word: "HINHNEN", clue: "Phông nền sân khấu Backdrop trang trí cho dự án Scratch.", revealed: false, keyCharIndex: 0 }
        ]
      },
      word: {
        title: "CHỦ ĐỀ: SOẠN THẢO VĂN BẢN WORD",
        secretKeyword: "VANBAN",
        rows: [
          { word: "VIETCHU", clue: "Thao tác gõ nội dung bài thơ hoặc câu chuyện vào trang Word.", revealed: false, keyCharIndex: 0 },
          { word: "ANHTRANG", clue: "Chèn hình ảnh minh họa sinh động vào tài liệu văn bản.", revealed: false, keyCharIndex: 0 },
          { word: "NGONNGU", clue: "Bộ gõ tiếng Việt Unikey kiểu gõ Telex hoặc Vni quen thuộc.", revealed: false, keyCharIndex: 0 },
          { word: "BANGTIN", clue: "Chèn bảng dữ liệu gồm nhiều hàng và cột trong Word.", revealed: false, keyCharIndex: 0 },
          { word: "ANDANH", clue: "Chọn kiểu chữ in đậm, in nghiêng hoặc gạch chân.", revealed: false, keyCharIndex: 0 },
          { word: "NHIEUMAU", clue: "Đổi màu sắc rực rỡ cho chữ cái tiêu đề bài viết.", revealed: false, keyCharIndex: 0 }
        ]
      },
      folder: {
        title: "CHỦ ĐỀ: THƯ MỤC VÀ TỆP TIN",
        secretKeyword: "THUMUC",
        rows: [
          { word: "THUMUCME", clue: "Thư mục lớn nhất chứa các thư mục con bên trong.", revealed: false, keyCharIndex: 0 },
          { word: "HINHANH", clue: "Tệp tin có đuôi mở rộng .png hoặc .jpg lưu ảnh chụp.", revealed: false, keyCharIndex: 0 },
          { word: "UNIXFILE", clue: "Hệ điều hành quản lý tệp tin và cây thư mục an toàn.", revealed: false, keyCharIndex: 0 },
          { word: "MAYTINH", clue: "Ổ đĩa C, D hoặc USB lưu giữ toàn bộ dữ liệu học tập.", revealed: false, keyCharIndex: 0 },
          { word: "USERDATA", clue: "Dữ liệu riêng của từng người dùng trên máy tính.", revealed: false, keyCharIndex: 0 },
          { word: "CHINHDUA", clue: "Thao tác đổi tên Rename hoặc di chuyển tệp tin.", revealed: false, keyCharIndex: 0 }
        ]
      },
      internet: {
        title: "CHỦ ĐỀ: MẠNG INTERNET TOÀN CẦU",
        secretKeyword: "INTERNET",
        rows: [
          { word: "INTERNET", clue: "Mạng lưới kết nối máy tính không giới hạn trên toàn thế giới.", revealed: false, keyCharIndex: 0 },
          { word: "NETIZEN", clue: "Công dân số tham gia giao tiếp văn minh trên môi trường mạng.", revealed: false, keyCharIndex: 0 },
          { word: "TIMKIEM", clue: "Sử dụng máy tìm kiếm Google để tra cứu thông tin học tập.", revealed: false, keyCharIndex: 0 },
          { word: "EMAIL", clue: "Thư điện tử giúp gửi tài liệu nhanh chóng qua mạng.", revealed: false, keyCharIndex: 0 },
          { word: "ROUTER", clue: "Thiết bị phát sóng Wifi kết nối mạng không dây trong nhà.", revealed: false, keyCharIndex: 0 },
          { word: "NETWORK", clue: "Mạng máy tính cục bộ kết nối các máy trong phòng tin học.", revealed: false, keyCharIndex: 0 },
          { word: "ELEARN", clue: "Học tập trực tuyến trên Web Vui Học mọi lúc mọi nơi.", revealed: false, keyCharIndex: 0 },
          { word: "TRINHDUYET", clue: "Phần mềm Chrome hoặc Cốc Cốc dùng để lướt web.", revealed: false, keyCharIndex: 0 }
        ]
      }
    };

    const chosen = presets[topicKey] || presets.computer;
    this.crosswordData = JSON.parse(JSON.stringify(chosen));
    this.selectedCrosswordRow = 0;

    const modal = document.getElementById("crossword-maker-modal");
    if (modal) modal.classList.remove("active");

    const titleDisp = document.getElementById("crossword-title-display");
    if (titleDisp) titleDisp.innerText = this.crosswordData.title;

    this.renderCrosswordGrid();
    this.renderAlphabetButtons();
    this.selectCrosswordRow(0);

    window.app.showToast(`🎉 Đã tải bộ ô chữ: "${chosen.title}"!`, "success");
  }

  saveCustomCrosswordFromForm() {
    const kwInput = document.getElementById("maker-secret-keyword");
    const rowsInput = document.getElementById("maker-rows-input");

    if (!kwInput || !rowsInput) return;

    const keyword = kwInput.value.trim().toUpperCase().replace(/[^A-Z]/g, '');
    const lines = rowsInput.value.split("\n").filter(l => l.trim().length > 0);

    if (keyword.length < 3) {
      window.app.showToast("Từ khóa bí mật phải có ít nhất 3 chữ cái in hoa!", "warning");
      return;
    }

    if (lines.length < 3) {
      window.app.showToast("Thầy Cô hãy nhập ít nhất 3 hàng câu đố!", "warning");
      return;
    }

    const rows = lines.map((line, idx) => {
      const parts = line.split("|");
      const word = (parts[0] || `HANG${idx + 1}`).trim().toUpperCase().replace(/[^A-Z]/g, '');
      const clue = (parts[1] || `Gợi ý câu đố cho hàng ${idx + 1}`).trim();
      return {
        word: word.length > 0 ? word : `TU${idx + 1}`,
        clue: clue,
        revealed: false,
        keyCharIndex: 0
      };
    });

    this.crosswordData = {
      title: `BỘ Ô CHỮ TÙY BIẾN: "${keyword}"`,
      secretKeyword: keyword,
      rows: rows
    };

    const modal = document.getElementById("crossword-maker-modal");
    if (modal) modal.classList.remove("active");

    const titleDisp = document.getElementById("crossword-title-display");
    if (titleDisp) titleDisp.innerText = this.crosswordData.title;

    this.selectedCrosswordRow = 0;
    this.renderCrosswordGrid();
    this.renderAlphabetButtons();
    this.selectCrosswordRow(0);

    window.app.showToast(`🎉 Đã áp dụng thành công bộ ô chữ tùy biến "${keyword}"!`, "success");
  }

  renderCrosswordGrid() {
    const grid = document.getElementById("in-slide-crossword-grid");
    if (!grid || !this.crosswordData) return;

    grid.innerHTML = this.crosswordData.rows.map((row, rIdx) => {
      const isSelected = this.selectedCrosswordRow === rIdx;
      return `
        <div onclick="lecturePortal.selectCrosswordRow(${rIdx})" class="flex items-center gap-2 p-1.5 rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-indigo-600/30 border border-indigo-400' : 'hover:bg-white/5'}">
          <span class="badge ${isSelected ? 'badge-amber' : 'bg-white/10 text-white'} text-[10px] font-black w-14 text-center">Hàng ${rIdx + 1}</span>
          
          <div class="flex items-center gap-1.5">
            ${row.word.split('').map((char, cIdx) => {
              const isKeyChar = cIdx === row.keyCharIndex;
              const isShown = row.revealed;

              return `
                <div class="w-8 h-8 md:w-9 md:h-9 rounded-xl border-2 font-black text-sm md:text-base flex items-center justify-center transition-all duration-500 select-none ${isShown ? (isKeyChar ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-md transform rotate-y-360 scale-105' : 'bg-emerald-600 border-emerald-400 text-white shadow-sm') : (isKeyChar ? 'bg-indigo-950 border-amber-400 text-transparent ring-1 ring-amber-400' : 'bg-slate-900 border-slate-700 text-transparent')}">
                  ${isShown ? char : (isKeyChar ? '⭐' : '')}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");
  }

  selectCrosswordRow(rowIndex) {
    this.selectedCrosswordRow = rowIndex;
    this.renderCrosswordGrid();

    const row = this.crosswordData.rows[rowIndex];
    if (!row) return;

    const clueLabel = document.getElementById("crossword-clue-label");
    const clueText = document.getElementById("crossword-clue-text");

    if (clueLabel) clueLabel.innerText = `HÀNG ${rowIndex + 1} (${row.word.length} CHỮ CÁI)`;
    if (clueText) clueText.innerText = row.clue;
  }

  revealCurrentCrosswordRow() {
    const row = this.crosswordData.rows[this.selectedCrosswordRow];
    if (!row) return;

    row.revealed = true;
    this.renderCrosswordGrid();
    this.playTingSound();
    window.app.showToast(`🎉 Đã mở khóa hàng ${this.selectedCrosswordRow + 1}: ${row.word}!`, "success");

    if (this.crosswordData.rows.every(r => r.revealed)) {
      this.celebrateCrosswordWin();
    }
  }

  revealSecretKeyword() {
    this.crosswordData.rows.forEach(r => r.revealed = true);
    this.renderCrosswordGrid();
    this.celebrateCrosswordWin();
  }

  celebrateCrosswordWin() {
    this.playTingSound();
    if (window.Simulation3D?.triggerFireworks) {
      window.Simulation3D.triggerFireworks();
    }
    window.app.showToast(`👑 CHÚC MỪNG CẢ LỚP ĐÃ GIẢI ĐƯỢC TỪ KHÓA BÍ MẬT: "${this.crosswordData.secretKeyword}"!`, "success");
    this.toggleInSlideStarAward("Cả Lớp Xuất Sắc", `Giải thành công từ khóa Ô Chữ Bí Mật: ${this.crosswordData.secretKeyword}`);
  }

  renderAlphabetButtons() {
    const container = document.getElementById("crossword-alphabet-buttons");
    if (!container) return;

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    container.innerHTML = alphabet.map(char => `
      <button onclick="lecturePortal.guessCrosswordLetter('${char}')" class="w-6 h-6 rounded-lg bg-slate-900 hover:bg-amber-400 hover:text-slate-950 border border-slate-700 text-[10px] font-black transition-all">
        ${char}
      </button>
    `).join("");
  }

  guessCrosswordLetter(letter) {
    const row = this.crosswordData.rows[this.selectedCrosswordRow];
    if (!row) return;

    if (row.word.includes(letter)) {
      row.revealed = true;
      this.renderCrosswordGrid();
      this.playTingSound();
      window.app.showToast(`✅ Chính xác! Chữ '${letter}' có trong hàng ${this.selectedCrosswordRow + 1}!`, "success");
    } else {
      window.app.showToast(`❌ Chưa đúng, hàng này không có chữ '${letter}'!`, "info");
    }
  }

  // =========================================================================
  // VÒNG QUAY MAY MẮN GỌI TÊN HỌC SINH 3D (IN-SLIDE LUCKY WHEEL)
  // =========================================================================
  toggleInSlideLuckyWheel() {
    const overlay = document.getElementById("in-slide-lucky-wheel-overlay");
    if (!overlay) return;

    this.luckyWheelActive = !this.luckyWheelActive;
    if (this.luckyWheelActive) {
      if (this.inSlideQuizActive) this.toggleInSlideQuiz();
      if (this.crosswordActive) this.toggleInSlideCrossword();
      if (this.goldenBellActive) this.toggleInSlideGoldenBell();
      if (this.memoryCardActive) this.toggleInSlideMemoryCard();
      if (this.columnMatchActive) this.toggleInSlideColumnMatch();
      if (this.bubblePopActive) this.toggleInSlideBubblePop();
      if (this.scratchActive) this.toggleInSlideScratch();
      overlay.classList.remove("hidden");
      
      const input = document.getElementById("lucky-wheel-names-input");
      if (input) input.value = this.wheelNames.join("\n");

      this.drawLuckyWheel();
    } else {
      overlay.classList.add("hidden");
    }
  }

  updateWheelNames(text) {
    const list = text.split("\n").map(n => n.trim()).filter(n => n.length > 0);
    if (list.length >= 2) {
      this.wheelNames = list;
      this.drawLuckyWheel();
      window.app.showToast(`🎯 Đã cập nhật danh sách ${list.length} học sinh cho vòng quay!`, "info");
    } else {
      window.app.showToast("Cần ít nhất 2 học sinh để tạo vòng quay!", "warning");
    }
  }

  resetWheelToNumberList() {
    const list = [];
    for (let i = 1; i <= 35; i++) {
      list.push(`Số ${i < 10 ? '0' : ''}${i}`);
    }
    this.wheelNames = list;
    const input = document.getElementById("lucky-wheel-names-input");
    if (input) input.value = this.wheelNames.join("\n");
    this.drawLuckyWheel();
    window.app.showToast("🔢 Đã chuyển sang danh sách 35 số thứ tự học sinh!", "info");
  }

  drawLuckyWheel() {
    const canvas = document.getElementById("lucky-wheel-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const numSlices = this.wheelNames.length;
    const sliceAngle = (Math.PI * 2) / numSlices;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = [
      "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6",
      "#06b6d4", "#f97316", "#14b8a6", "#6366f1", "#84cc16"
    ];

    for (let i = 0; i < numSlices; i++) {
      const angle = this.wheelAngle + i * sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = numSlices > 25 ? "bold 9px sans-serif" : (numSlices > 15 ? "bold 11px sans-serif" : "bold 13px sans-serif");
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      
      const displayName = this.wheelNames[i].length > 14 ? this.wheelNames[i].substring(0, 12) + ".." : this.wheelNames[i];
      ctx.fillText(displayName, radius - 15, 4);
      ctx.restore();
    }
  }

  spinLuckyWheel() {
    if (this.isWheelSpinning) return;
    this.isWheelSpinning = true;

    const winnerNameEl = document.getElementById("lucky-wheel-winner-name");
    const winnerBoxEl = document.getElementById("lucky-wheel-winner-box");
    if (winnerNameEl) winnerNameEl.innerText = "Đang quay cuồng nhiệt...";
    if (winnerBoxEl) winnerBoxEl.classList.remove("border-amber-400", "bg-amber-950/60");

    let currentVelocity = 0.35 + Math.random() * 0.25;
    const deceleration = 0.988;
    let lastSliceIndex = -1;

    const animateSpin = () => {
      this.wheelAngle += currentVelocity;
      currentVelocity *= deceleration;

      const numSlices = this.wheelNames.length;
      const sliceAngle = (Math.PI * 2) / numSlices;
      const normalizedAngle = (Math.PI * 1.5 - (this.wheelAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const currentSliceIndex = Math.floor(normalizedAngle / sliceAngle) % numSlices;

      if (currentSliceIndex !== lastSliceIndex) {
        this.playTickSound();
        lastSliceIndex = currentSliceIndex;
      }

      this.drawLuckyWheel();

      if (currentVelocity > 0.002) {
        this.wheelAnimId = requestAnimationFrame(animateSpin);
      } else {
        this.isWheelSpinning = false;
        const winner = this.wheelNames[currentSliceIndex];
        
        if (winnerNameEl) winnerNameEl.innerText = `🎉 ${winner}!`;
        if (winnerBoxEl) {
          winnerBoxEl.classList.add("border-amber-400", "bg-amber-950/60", "animate-bounce");
        }

        this.playTingSound();

        if (window.Simulation3D?.triggerFireworks) {
          window.Simulation3D.triggerFireworks();
        }

        window.app.showToast(`⭐ Mời bạn [${winner}] đứng lên phát biểu nhé!`, "success");
      }
    };

    this.wheelAnimId = requestAnimationFrame(animateSpin);
  }

  // =========================================================================
  // SÁCH 3D LẬT TRANG & CHẾ ĐỘ BAN ĐÊM NEON (DARK NEON MODE)
  // =========================================================================
  toggleFlipbookDarkMode() {
    this.isFlipbookDarkMode = !this.isFlipbookDarkMode;
    localStorage.setItem("flipbook_dark_mode", this.isFlipbookDarkMode);

    const btn = document.getElementById("btn-flipbook-dark-mode");
    if (btn) {
      btn.innerHTML = this.isFlipbookDarkMode ? "<span>☀️</span> <span>Ban Ngày</span>" : "<span>🌙</span> <span>Ban Đêm Neon</span>";
      btn.classList.toggle("text-cyan-300", this.isFlipbookDarkMode);
    }

    this.renderFlipbookPages();
    window.app.showToast(this.isFlipbookDarkMode ? "🌙 Đã bật Chế Độ Ban Đêm Neon dạ quang êm mắt!" : "☀️ Đã chuyển sang Chế Độ Ban Ngày sáng rõ!", "info");
  }

  async openFlipbook(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    this.activeFlipbookLecture = lecture;
    this.flipbookPages = window.lectureService.generateFlipbookPages(lecture);
    this.currentFlipbookIndex = 0;
    this.isAutoFlipRunning = false;
    this.isReadingAloud = false;

    const modal = document.getElementById("lecture-flipbook-modal");
    const titleEl = document.getElementById("flipbook-title-disp");
    const darkBtn = document.getElementById("btn-flipbook-dark-mode");

    if (titleEl) titleEl.innerText = `SÁCH 3D: ${lecture.title.toUpperCase()}`;
    if (darkBtn) {
      darkBtn.innerHTML = this.isFlipbookDarkMode ? "<span>☀️</span> <span>Ban Ngày</span>" : "<span>🌙</span> <span>Ban Đêm Neon</span>";
    }

    if (modal) modal.classList.add("active");

    this.renderFlipbookPages();
    this.playPageFlipSound();
  }

  closeFlipbookModal() {
    this.stopAutoFlipbook();
    this.stopReadAloud();
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

    const pageClassDark = "bg-slate-950 text-slate-100 border-slate-800 shadow-[0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30";
    const pageClassLight = "bg-white text-slate-900 border-slate-200 shadow-2xl";

    if (this.isFlipbookDarkMode) {
      leftEl.className = `w-1/2 h-[92%] p-6 md:p-8 rounded-l-3xl border-r flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${pageClassDark}`;
      rightEl.className = `w-1/2 h-[92%] p-6 md:p-8 rounded-r-3xl border-l flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${pageClassDark}`;
    } else {
      leftEl.className = `w-1/2 h-[92%] p-6 md:p-8 rounded-l-3xl border-r flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${pageClassLight}`;
      rightEl.className = `w-1/2 h-[92%] p-6 md:p-8 rounded-r-3xl border-l flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${pageClassLight}`;
    }

    if (pageL) {
      leftEl.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b ${this.isFlipbookDarkMode ? 'border-slate-800' : 'border-slate-200'}">
          <span class="badge ${this.isFlipbookDarkMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'badge-cyan'} font-black text-[10px]">${pageL.badge}</span>
          <span class="text-xs font-bold ${this.isFlipbookDarkMode ? 'text-cyan-400' : 'text-slate-400'}">Trang ${pageL.pageNum}</span>
        </div>

        <div class="my-auto py-2">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">${pageL.icon}</span>
            <h4 class="font-black text-sm md:text-base ${this.isFlipbookDarkMode ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'text-slate-900'}">${pageL.title}</h4>
          </div>
          ${pageL.content}
        </div>

        <div class="flex items-center justify-between pt-2 border-t ${this.isFlipbookDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'} text-[10px]">
          <span>📖 Sách Giáo Khoa Tin Học GDPT 2018</span>
          <span>Trang ${pageL.pageNum}</span>
        </div>
      `;
    } else {
      leftEl.innerHTML = `<div class="my-auto text-center text-slate-300 font-bold">Trang trống</div>`;
    }

    if (pageR) {
      rightEl.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b ${this.isFlipbookDarkMode ? 'border-slate-800' : 'border-slate-200'}">
          <span class="badge ${this.isFlipbookDarkMode ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' : 'badge-amber'} font-black text-[10px]">${pageR.badge}</span>
          <span class="text-xs font-bold ${this.isFlipbookDarkMode ? 'text-amber-400' : 'text-slate-400'}">Trang ${pageR.pageNum}</span>
        </div>

        <div class="my-auto py-2">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">${pageR.icon}</span>
            <h4 class="font-black text-sm md:text-base ${this.isFlipbookDarkMode ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-900'}">${pageR.title}</h4>
          </div>
          ${pageR.content}
        </div>

        <div class="flex items-center justify-between pt-2 border-t ${this.isFlipbookDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'} text-[10px]">
          <span>${this.activeFlipbookLecture.title}</span>
          <span>Trang ${pageR.pageNum}</span>
        </div>
      `;
    } else {
      rightEl.innerHTML = `
        <div class="my-auto text-center space-y-2 p-6 ${this.isFlipbookDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'} rounded-2xl border">
          <span class="text-5xl block">🎉</span>
          <h4 class="font-black text-amber-300 text-sm">HẾT BÀI HỌC</h4>
          <p class="text-xs">Em hãy đăng nhập Web Vui Học để làm bài tập trắc nghiệm và thí nghiệm 3D nhé!</p>
        </div>
      `;
    }

    if (this.isReadingAloud) {
      this.readCurrentFlipbookPage();
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
      if (btn) btn.innerHTML = "<span>⏸️</span> <span>Dừng (5s)</span>";
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
    if (btn) btn.innerHTML = "<span>▶️</span> <span>Tự Động (5s)</span>";
  }

  // Giọng đọc AI đọc to nội dung trang sách (E-Book Read-Aloud)
  toggleReadAloudFlipbook() {
    this.isReadingAloud = !this.isReadingAloud;
    const btn = document.getElementById("btn-read-aloud-flipbook");

    if (this.isReadingAloud) {
      if (btn) btn.innerHTML = "<span>⏸️</span> <span>Dừng Đọc</span>";
      window.app.showToast("🔊 Đang đọc nội dung trang sách bằng giọng đọc AI...", "info");
      this.readCurrentFlipbookPage();
    } else {
      this.stopReadAloud();
    }
  }

  stopReadAloud() {
    this.isReadingAloud = false;
    if (this.speechSynth) this.speechSynth.cancel();
    const btn = document.getElementById("btn-read-aloud-flipbook");
    if (btn) btn.innerHTML = "<span>🔊</span> <span>Đọc Sách AI</span>";
  }

  readCurrentFlipbookPage() {
    if (!this.speechSynth) return;
    this.speechSynth.cancel();

    const pageL = this.flipbookPages[this.currentFlipbookIndex];
    const pageR = this.flipbookPages[this.currentFlipbookIndex + 1];

    let fullText = "";
    if (pageL) {
      fullText += `Trang ${pageL.pageNum}: ${pageL.title}. `;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = pageL.content;
      fullText += tempDiv.innerText + " ";
    }
    if (pageR) {
      fullText += `Trang ${pageR.pageNum}: ${pageR.title}. `;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = pageR.content;
      fullText += tempDiv.innerText;
    }

    const utter = new SpeechSynthesisUtterance(fullText);
    utter.lang = "vi-VN";
    utter.rate = this.speechRate;
    utter.pitch = this.voiceGender === "female" ? 1.15 : 0.85;

    utter.onend = () => {
      if (this.isReadingAloud) {
        setTimeout(() => {
          if (this.currentFlipbookIndex + 2 < this.flipbookPages.length) {
            this.nextFlipbookPage();
          } else {
            this.stopReadAloud();
            window.app.showToast("🎉 Đã đọc xong toàn bộ cuốn sách bài học!", "success");
          }
        }, 1500);
      }
    };

    this.speechSynth.speak(utter);
  }

  playPageFlipSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const bufferSize = this.audioCtx.sampleRate * 0.15;
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
  // TRÌNH CHIẾU SLIDE & BẢNG VẼ BÚT LASER / DẠ QUANG
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
    if (this.crosswordActive) this.toggleInSlideCrossword();
    if (this.luckyWheelActive) this.toggleInSlideLuckyWheel();
    if (this.goldenBellActive) this.toggleInSlideGoldenBell();
    if (this.memoryCardActive) this.toggleInSlideMemoryCard();
    if (this.columnMatchActive) this.toggleInSlideColumnMatch();
    if (this.bubblePopActive) this.toggleInSlideBubblePop();
    if (this.scratchActive) this.toggleInSlideScratch();
    if (this.starAwardActive) this.toggleInSlideStarAward();
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
