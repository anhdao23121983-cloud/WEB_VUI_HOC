/**
 * LECTURE PORTAL COMPONENT
 * Quản lý Bài Giảng Điện Tử & Slide PowerPoint:
 * 1. 📂 3 Thư mục con: Bài giảng Tin lớp 3, Bài giảng Tin lớp 4, Bài giảng Tin lớp 5
 * 2. 📤 Nút đưa bài giảng lên cho Giáo viên (Đồng bộ Supabase Cloud & Local)
 * 3. 🎨 Bút Laser đỏ & Bút dạ quang khi Trình chiếu Slide (Laser Pointer & Pen Tool)
 * 4. ⚡ Đố vui 10s tương tác trực tiếp trên Slide (In-Slide Quick Quiz 10s)
 * 5. 🧩 Trò chơi Ô Chữ Bí Mật 3D & ⚙️ Soạn Ô Chữ Tùy Biến (Custom Crossword Maker - Modal 33)
 * 6. 🎡 Vòng Quay May Mắn gọi tên học sinh ngẫu nhiên trên Slide (In-Slide Lucky Wheel)
 * 7. 🔔 Đấu Trường Rung Chuông Vàng 3D củng cố bài học (In-Slide Golden Bell Arena)
 * 8. 🃏 Trò chơi Ghép Thẻ Trí Nhớ 3D trên Slide (In-Slide 3D Memory Card Match)
 * 9. ⚡ Trò chơi Nối Cột Định Nghĩa 3D & ⚙️ Soạn Cặp Nối Cột (Custom Column Match Maker - Modal 35)
 * 10. 🎈 Trò chơi Bắn Bong Bóng 3D & ⚙️ Soạn Nhiệm Vụ Bắn Bóng (Custom Bubble Mission Maker - Modal 36)
 * 11. 🐱 Trò chơi Thả Khối Scratch 3D & ⚙️ Soạn Thử Thách Scratch (Custom Scratch Mission Maker - Modal 37)
 * 12. 🤖 Mô Phỏng Mê Cung Thuật Toán Robot 3D Trên Slide (In-Slide 3D Robot Maze Algorithm)
 * 13. 🔔 Đấu Trường Bấm Chuông Trực Tuyến Bằng Điện Thoại (Realtime In-Class Buzzer - Modal 40)
 * 14. 🎙️ Ghi Âm Lời Giảng Cô Giáo Trực Tiếp Kèm Slide (In-Browser Voice Recorder - Modal 41)
 * 15. 📱 Mã QR Code Chia Sẻ Bài Giảng & In Phiếu QR 6 Ô (QR Lecture Share - Modal 38)
 * 16. 🖥️ Chế Độ Trình Chiếu 2 Màn Hình Dành Riêng Cho Cô Giáo (Dual-Screen Presenter View - Modal 39)
 * 17. 🔊 Giọng Đọc Nữ Tiếng Việt Chuẩn Cô Giáo Tiểu Học Cho Toàn Hệ Thống
 * 18. ⭐ Bảng Khen Thưởng & 🌟 Bắn Thông Báo 50 Sao Toàn Trường Realtime
 * 19. 📖 Sách 3D lật trang siêu thực có 🌙 Chế Độ Ban Đêm Neon & 🔊 Giọng đọc AI E-Book
 * 20. 📈 Bảng Vàng Xếp Hạng & Báo Cáo Mức Độ Yêu Thích Bài Giảng Của Trường
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
    this.currentPreviewLectureId = null;

    // Video Player & Voice State (Giọng Nữ Tiếng Việt Mặc Định)
    this.activeVideoLecture = null;
    this.videoSlideFrames = [];
    this.currentSlideIndex = 0;
    this.isVideoPlaying = false;
    this.videoTimer = null;
    this.speechSynth = window.speechSynthesis || null;
    this.voiceGender = "female"; // Luôn ưu tiên giọng Nữ Tiếng Việt
    this.speechRate = 0.9; // Tốc độ chuẩn sư phạm, chậm rãi, dễ nghe
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

    // In-Slide 3D Robot Maze State
    this.robotMazeActive = false;
    this.robotMazeLevelIdx = 0;
    this.robotMazeLevels = [];
    this.robotPos = { r: 0, c: 0, dir: 1 }; // dir: 0: Bắc, 1: Đông, 2: Nam, 3: Tây
    this.robotCommands = [];
    this.collectedItems = 0;
    this.robotStepsCount = 0;
    this.isRobotRunning = false;

    // Realtime Class Buzzer State (Modal 40)
    this.buzzerRoomPin = "582 914";
    this.buzzerStatus = "idle"; // 'idle' | 'countdown' | 'open' | 'locked'
    this.buzzerStartTime = 0;
    this.buzzerCountdownTimer = null;
    this.buzzerLeaderboard = [];
    this.mockParticipants = [
      { name: "Nguyễn Văn An (3A)", delay: 0.38 },
      { name: "Lê Thị Mai (3B)", delay: 0.52 },
      { name: "Trần Đức Nam (3A)", delay: 0.69 },
      { name: "Hoàng Bảo Long (3C)", delay: 0.85 },
      { name: "Phạm Quỳnh Anh (3B)", delay: 1.12 }
    ];

    // Voice Recorder State (Modal 41)
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.isRecordingPaused = false;
    this.recordingStartTime = 0;
    this.recordingElapsed = 0;
    this.recordingTimerInterval = null;
    this.voiceRecordings = [];
    this.audioStream = null;
    this.waveAnimId = null;

    // QR Share State
    this.activeQRLecture = null;

    // Dual-Screen Presenter View State
    this.presenterLecture = null;
    this.presenterSlideIdx = 0;
    this.presenterTimerSeconds = 45 * 60;
    this.isPresenterTimerRunning = false;
    this.presenterTimerInterval = null;
    this.presenterClockInterval = null;
    this.projectorWindow = null;

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
    this.drawTool = "laser";
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

  // =========================================================================
  // HELPER: LẤY GIỌNG ĐỌC NỮ TIẾNG VIỆT CHUẨN CÔ GIÁO (VIETNAMESE FEMALE VOICE)
  // =========================================================================
  getVietnameseFemaleVoice() {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Lọc tất cả giọng Tiếng Việt
    const viVoices = voices.filter(v => v.lang && v.lang.toLowerCase().includes("vi"));
    
    // Tìm giọng có đặc tính Nữ Tiếng Việt
    const femaleVi = viVoices.find(v => {
      const name = v.name.toLowerCase();
      return name.includes("hoaimy") || name.includes("female") || name.includes("linh") || 
             name.includes("mai") || name.includes("nu") || name.includes("google") || name.includes("an");
    });

    if (femaleVi) return femaleVi;
    if (viVoices.length > 0) return viVoices[0];
    return null;
  }

  async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');
    
    // Nạp toàn bộ bài giảng 1 lần duy nhất từ RAM cache siêu tốc 0.001s
    const rawAll = await window.lectureService.getAllLectures("all", this.searchQuery, this.currentBookSeries, this.currentSemester);
    const favoriteIds = window.lectureService.getFavoriteIds();
    
    // Thống kê số lượng bài giảng các khối
    const countLop3 = rawAll.filter(l => l.grade === 3).length;
    const countLop4 = rawAll.filter(l => l.grade === 4).length;
    const countLop5 = rawAll.filter(l => l.grade === 5).length;

    // Lọc bài giảng theo thư mục con đang chọn (Lớp 3, 4, 5 hoặc Tất cả)
    const effectiveGrade = this.selectedFolder !== "all" ? this.selectedFolder : this.currentGrade;
    let allLectures = effectiveGrade !== "all" ? rawAll.filter(l => l.grade === parseInt(effectiveGrade, 10)) : rawAll;

    // Đếm số lượng theo danh mục
    const myLecturesCount = user ? allLectures.filter(l => (l.createdByUsername === user.username) || (l.authorName === user.name) || user.role === 'admin').length : 0;
    const favoritesCount = allLectures.filter(l => favoriteIds.includes(l.id)).length;
    const trashedCount = window.lectureService.getTrashedLectures().length;

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
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge badge-amber font-black">📊 HỌC LIỆU SỐ TIỂU HỌC</span>
              <span class="badge bg-white/20 text-white font-bold">Chuẩn GDPT 2018 & CV 2345</span>
              <span class="badge bg-emerald-500/30 text-emerald-100 border border-emerald-300/40 font-black">🟢 Đã lưu vĩnh viễn trên Web: ${rawAll.length} bài giảng</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">KHO BÀI GIẢNG ĐIỆN TỬ & POWERPOINT</h2>
            <p class="text-cyan-100 text-xs md:text-sm">Hệ thống kho bài giảng điện tử chuẩn sư phạm, hỗ trợ giáo viên tải lên, lưu trữ vĩnh viễn và trình chiếu trực tuyến mượt mà.</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="lectureUploadModal.openModal(${effectiveGrade !== 'all' ? effectiveGrade : 3})" class="btn btn-emerald btn-lg font-black shadow-2xl flex items-center gap-2 shrink-0 hover:scale-105 transition-all px-4 py-2.5 text-white bg-gradient-to-r from-emerald-500 to-teal-600 border-2 border-white">
              <span class="text-lg">📤</span> <span>Tải Bài Lên</span>
            </button>
            <button onclick="lecturePortal.persistAllLectures()" class="btn bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-blue-400 text-xs hover:scale-105 transition-all" title="Lưu vĩnh viễn toàn bộ bài giảng vào máy chủ và mã nguồn web">
              <span>💾</span> <span>Lưu Vĩnh Viễn Vào Web</span>
            </button>
            <button onclick="window.lectureService.exportLecturesBackup()" class="btn bg-white/20 hover:bg-white/30 text-white font-black flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs hover:scale-105 transition-all" title="Xuất file JSON sao lưu về máy tính để cất giữ an toàn">
              <span>📥</span> <span>Sao Lưu</span>
            </button>
            <button onclick="document.getElementById('lec-import-file-input').click()" class="btn bg-white/20 hover:bg-white/30 text-white font-black flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs hover:scale-105 transition-all" title="Nhập file JSON đã sao lưu để khôi phục bài giảng">
              <span>📂</span> <span>Khôi Phục</span>
            </button>
            <input type="file" id="lec-import-file-input" accept=".json" class="hidden" onchange="lecturePortal.handleImportBackup(event)">
          </div>
        </div>

        <!-- Thanh Menu Danh Mục Bài Giảng Điện Tử (Bài giảng Tin lớp 3, lớp 4, lớp 5) -->
        <div class="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-2xl p-2 bg-amber-100 text-amber-800 rounded-2xl">📊</span>
            <div>
              <h3 class="font-black text-slate-900 text-sm md:text-base leading-tight">MENU BÀI GIẢNG ĐIỆN TỬ TIN HỌC</h3>
              <p class="text-[11px] text-slate-500 font-bold">Chọn mục bài giảng theo khối lớp để xem danh sách tương ứng</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="lecturePortal.selectFolder('all')" class="px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${this.selectedFolder === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📂</span> <span>Tất Cả Bài Giảng</span>
            </button>
            <button onclick="lecturePortal.selectFolder(3)" class="px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${this.selectedFolder === 3 ? 'bg-cyan-600 text-white shadow-md' : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'}">
              <span>🎒</span> <span>Bài Giảng Tin Lớp 3</span>
            </button>
            <button onclick="lecturePortal.selectFolder(4)" class="px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${this.selectedFolder === 4 ? 'bg-purple-600 text-white shadow-md' : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'}">
              <span>🚀</span> <span>Bài Giảng Tin Lớp 4</span>
            </button>
            <button onclick="lecturePortal.selectFolder(5)" class="px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${this.selectedFolder === 5 ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'}">
              <span>⭐</span> <span>Bài Giảng Tin Lớp 5</span>
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
                <button onclick="event.stopPropagation(); lectureUploadModal.openModal(3)" class="text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-xl shadow-xs flex items-center gap-1">
                  <span>📤</span> <span>Tải Bài Lên</span>
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
                <button onclick="event.stopPropagation(); lectureUploadModal.openModal(4)" class="text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-xl shadow-xs flex items-center gap-1">
                  <span>📤</span> <span>Tải Bài Lên</span>
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
                <button onclick="event.stopPropagation(); lectureUploadModal.openModal(5)" class="text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-xl shadow-xs flex items-center gap-1">
                  <span>📤</span> <span>Tải Bài Lên</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Thanh 4 Tab Chuyển Đổi: Tất Cả | Bài Giảng Của Tôi | Bài Giảng Yêu Thích | Thùng Rác (30 Ngày) -->
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
            <span>👩‍🏫 Bài Giảng Của Tôi</span>
            <span class="badge ${this.currentTab === 'my_lectures' ? 'bg-white/25 text-white' : 'badge-amber'} text-[10px]">${myLecturesCount}</span>
          </button>

          <button onclick="lecturePortal.openTrashModal()" class="px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200" title="Xem danh sách bài giảng vừa xóa và khôi phục trong vòng 30 ngày">
            <span>🗑️ Thùng Rác (30 Ngày)</span>
            <span class="badge ${trashedCount > 0 ? 'bg-rose-600 text-white' : 'badge-slate'} text-[10px]">${trashedCount}</span>
          </button>
        </div>

        <!-- Thanh Bộ Lọc Kép & Tìm Kiếm -->
        <div class="glass-card p-5 space-y-4">
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

            <div class="relative w-full md:w-80">
              <input type="text" id="lecture-search-input" value="${this.searchQuery}" oninput="lecturePortal.handleSearch(this.value)" placeholder="Tìm bài giảng, tác giả, chủ đề..." class="form-control text-xs pl-9 font-medium">
              <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
          </div>

          <div class="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/70">
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
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>📚 DANH SÁCH BÀI GIẢNG ${this.selectedFolder !== 'all' ? `KHỐI ${this.selectedFolder}` : ''}</span>
              <span class="badge badge-cyan font-black text-xs">${this.lectures.length} Bài</span>
            </h3>
            <div class="flex items-center gap-2">
              ${isTeacher ? `
                <button onclick="lecturePortal.executeClearAllLectures()" class="btn btn-outline btn-sm font-bold text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100 flex items-center gap-1" title="Xóa sạch tất cả các bài giảng điện tử trong thư mục">
                  <span>🧹</span> <span>Xóa Sạch Thư Mục</span>
                </button>
              ` : ''}
              <button onclick="lectureUploadModal.openModal(${this.selectedFolder !== 'all' ? this.selectedFolder : 3})" class="btn btn-emerald btn-sm font-black shadow-md flex items-center gap-1.5 px-3 py-1.5">
                <span>📤</span> <span>Tải Lên Bài Giảng Điện Tử</span>
              </button>
            </div>
          </div>

          ${this.renderLectureGrid(isTeacher, user)}
        </div>
      </div>
    `;
  }

  async executeDeleteAllGradeLectures(grade) {
    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

    if (!isTeacher) {
      window.app.showToast("⚠️ Chỉ Giáo viên mới có quyền xóa tất cả bài giảng!", "warning");
      return;
    }

    if (!confirm(`Cô có chắc chắn muốn xóa toàn bộ tất cả bài giảng điện tử Lớp ${grade} khỏi hệ thống và Supabase không?`)) {
      return;
    }

    window.app.showToast(`🗑️ Đang xóa tất cả bài giảng Lớp ${grade}...`, "info");
    await window.lectureService.deleteLecturesByGrade(grade);
    window.app.showToast(`🎉 Đã xóa sạch toàn bộ bài giảng Lớp ${grade}!`, "success");
    this.render("main-content-area");
  }

  async executeClearAllLectures() {
    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

    if (!isTeacher) {
      window.app.showToast("⚠️ Chỉ Giáo viên hoặc Admin mới có quyền làm sạch thư mục bài giảng!", "warning");
      return;
    }

    if (!confirm("Thầy/Cô có chắc chắn muốn XÓA SẠCH 100% toàn bộ tất cả bài giảng trong thư mục Bài Giảng Điện Tử không? Thao tác này sẽ dọn dẹp sạch kho bài giảng.")) {
      return;
    }

    window.app.showToast("🧹 Đang xóa sạch tất cả bài giảng trong thư mục...", "info");
    await window.lectureService.clearAllLectures();
    window.app.showToast("🎉 Đã làm sạch toàn bộ bài giảng trong thư mục thành công!", "success");
    this.render("main-content-area");
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

  renderLectureGrid(isTeacher, user) {
    if (this.lectures.length === 0) {
      return `
        <div class="text-center py-16 glass-card space-y-3 text-slate-400">
          <span class="text-6xl block mb-2 animate-bounce">📊</span>
          <p class="font-black text-slate-700 text-base">Chưa có bài giảng nào trong mục này.</p>
          <p class="text-xs text-slate-500">Cô hãy bấm vào nút dưới đây để tải lên bài giảng PowerPoint (.pptx, .ppt, .pdf) của mình!</p>
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
          const canManage = this.canManageLecture(l, user);

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

                <!-- Hàng nút hành động bài giảng -->
                <div class="space-y-2 pt-2 border-t border-slate-100">
                  <div class="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
                    <button onclick="lecturePortal.previewLecture('${l.id}')" class="btn btn-primary btn-sm flex-1 font-black flex items-center justify-center gap-1 shadow-sm" title="Trình chiếu Slide bài giảng có Bút Laser đỏ & Bút vẽ dạ quang">
                      <span>🎨</span> <span>Trình Chiếu & Laser</span>
                    </button>
                    <button onclick="lecturePortal.downloadLecture('${l.id}')" class="btn btn-outline btn-sm font-bold flex items-center gap-1" title="Tải file PowerPoint về máy">
                      <span>📥</span> <span>Tải PPT</span>
                    </button>
                    <button onclick="lecturePortal.downloadLectureAsPDF('${l.id}')" class="btn btn-outline btn-sm font-bold text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100 flex items-center gap-1" title="Chuyển và Tải file bài giảng dạng PDF">
                      <span>📄</span> <span>Tải PDF</span>
                    </button>

                    ${canManage ? `
                      <button onclick="lectureUploadModal.openEditModal('${l.id}')" class="p-2 text-cyan-700 hover:bg-cyan-100 rounded-xl font-bold border border-cyan-200 transition-all hover:scale-105" title="Chỉnh sửa thông tin bài giảng chính chủ">
                        ✏️
                      </button>
                      <button onclick="lecturePortal.openDeleteConfirmModal('${l.id}', '${l.title.replace(/'/g, "\\'")}')" class="p-2 text-rose-600 hover:bg-rose-100 rounded-xl font-bold border border-rose-200 transition-all hover:scale-105" title="Xóa bỏ bài giảng chính chủ">
                        🗑️
                      </button>
                    ` : (isTeacher ? `
                      <span class="px-2 py-1.5 text-slate-400 bg-slate-100 rounded-xl border border-slate-200 cursor-not-allowed text-[11px] font-bold flex items-center gap-1" title="Bảo mật chính chủ: Bài giảng này do tác giả (${l.authorName || 'Giáo viên khác'}) tạo ra. Chỉ chính chủ hoặc Admin mới được phép xóa/sửa.">
                        🔒 Bài tác giả khác
                      </span>
                    ` : '')}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // Kiểm tra phân quyền quản lý bài giảng theo đúng tác giả chính chủ hoặc Admin
  canManageLecture(lecture, user) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'teacher') return false;

    if (!lecture || (!lecture.createdByUsername && !lecture.authorName)) return true;

    const currentUsername = (user.username || "").toLowerCase();
    const creatorUsername = (lecture.createdByUsername || "").toLowerCase();
    const currentName = (user.name || "").toLowerCase();
    const creatorName = (lecture.authorName || "").toLowerCase();

    if (creatorUsername && currentUsername === creatorUsername) return true;
    if (creatorName && currentName && (currentName === creatorName || currentName.includes(creatorName) || creatorName.includes(currentName))) return true;

    if ((creatorUsername === 'anhdao' || creatorName.includes('anh đào')) && (currentUsername === 'anhdao' || currentName.includes('anh đào'))) return true;

    return false;
  }

  toggleFavorite(id) {
    const isFav = window.lectureService.toggleFavorite(id);
    window.app.showToast(isFav ? "⭐ Đã thêm bài giảng vào mục Yêu Thích!" : "Đã xóa khỏi mục Yêu Thích!", "info");
    this.render("main-content-area");
  }

  // =========================================================================
  // XÓA BÀI GIẢNG ĐIỆN TỬ (DELETE LECTURE SLIDE)
  // =========================================================================
  async openDeleteConfirmModal(id, title) {
    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

    if (!isTeacher) {
      window.app.showToast("⚠️ Rào cản bảo mật: Chỉ Giáo viên hoặc Admin mới có quyền xóa bài giảng!", "warning");
      return;
    }

    const lecture = await window.lectureService.getLectureById(id);
    if (lecture && !this.canManageLecture(lecture, user)) {
      window.app.showToast(`⚠️ Rào cản chính chủ: Bài giảng này do tác giả "${lecture.authorName || 'Giáo viên khác'}" tạo ra. Chỉ tác giả chính chủ hoặc Admin mới được phép xóa!`, "danger");
      return;
    }

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

    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

    if (!isTeacher) {
      window.app.showToast("⚠️ Bạn không có quyền xóa bài giảng này! Chỉ Giáo viên mới có quyền.", "danger");
      this.closeDeleteModal();
      return;
    }

    const deleteId = this.pendingDeleteId;
    window.app.showToast("🗑️ Đang xóa bài giảng khỏi hệ thống và Supabase...", "info");

    const result = await window.lectureService.deleteLecture(deleteId);
    this.closeDeleteModal();

    if (result && result.success) {
      window.app.showToast("🎉 Đã xóa bài giảng thành công!", "success");
      this.render("main-content-area");
    } else {
      window.app.showToast("⚠️ Không thể xóa bài giảng. Vui lòng thử lại!", "danger");
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.render("main-content-area");
  }

  selectFolder(grade) {
    this.selectedFolder = grade;
    this.currentGrade = grade;
    if (window.location.hash === '#lectures' || window.location.hash.startsWith('#lectures-')) {
      this.render("main-content-area");
    } else {
      window.location.hash = grade === 'all' ? '#lectures' : `#lectures-${grade}`;
    }
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
  // OPTION 1: MÔ PHỎNG MÊ CUNG THUẬT TOÁN ROBOT 3D (IN-SLIDE ROBOT MAZE)
  // =========================================================================
  toggleInSlideRobotMaze() {
    const overlay = document.getElementById("in-slide-robot-maze-overlay");
    if (!overlay) return;

    this.robotMazeActive = !this.robotMazeActive;
    if (this.robotMazeActive) {
      if (this.inSlideQuizActive) this.toggleInSlideQuiz();
      if (this.crosswordActive) this.toggleInSlideCrossword();
      if (this.luckyWheelActive) this.toggleInSlideLuckyWheel();
      if (this.goldenBellActive) this.toggleInSlideGoldenBell();
      if (this.memoryCardActive) this.toggleInSlideMemoryCard();
      if (this.columnMatchActive) this.toggleInSlideColumnMatch();
      if (this.bubblePopActive) this.toggleInSlideBubblePop();
      if (this.scratchActive) this.toggleInSlideScratch();
      overlay.classList.remove("hidden");
      this.initRobotMazeGame();
    } else {
      overlay.classList.add("hidden");
    }
  }

  initRobotMazeGame() {
    this.robotMazeLevels = [
      {
        id: 0,
        title: "MÀN 1: ROBOT TÌM CHUỘT MÁY TÍNH (LỚP 3)",
        mission: "Lập trình Robot: Tiến ➔ Rẽ phải ➔ Nhặt Chuột Máy 🖱️ ➔ Tiến về Đích 🏁",
        gridSize: 6,
        startPos: { r: 1, c: 1, dir: 1 }, // Đông
        targetPos: { r: 4, c: 4 },
        walls: [
          { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }
        ],
        items: [
          { r: 1, c: 4, name: "Chuột quang", icon: "🖱️", collected: false }
        ]
      },
      {
        id: 1,
        title: "MÀN 2: THU THẬP 4 BỘ PHẬN MÁY TÍNH (LỚP 4)",
        mission: "Lập trình Robot vượt mê cung nhặt đủ 3 linh kiện 🖥️, ⌨️, 🖱️ rồi về Bàn Học 🏁",
        gridSize: 6,
        startPos: { r: 0, c: 0, dir: 1 },
        targetPos: { r: 5, c: 5 },
        walls: [
          { r: 1, c: 1 }, { r: 1, c: 3 }, { r: 3, c: 1 }, { r: 3, c: 3 }, { r: 4, c: 4 }
        ],
        items: [
          { r: 0, c: 4, name: "Màn hình", icon: "🖥️", collected: false },
          { r: 4, c: 0, name: "Bàn phím", icon: "⌨️", collected: false },
          { r: 2, c: 4, name: "Thân máy", icon: "🔲", collected: false }
        ]
      },
      {
        id: 2,
        title: "MÀN 3: VƯỢT TƯỜNG LỬA & DÂY ĐIỆN HỞ (LỚP 5)",
        mission: "Tránh các ô dây điện giật ⚡, nhặt USB An Toàn 💾 và về đích an toàn!",
        gridSize: 6,
        startPos: { r: 5, c: 0, dir: 0 }, // Bắc
        targetPos: { r: 0, c: 5 },
        walls: [
          { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 1, c: 2 }
        ],
        items: [
          { r: 3, c: 2, name: "Dây điện hở (Né)", icon: "⚡", isHazard: true },
          { r: 1, c: 4, name: "USB Dữ liệu", icon: "💾", collected: false }
        ]
      }
    ];

    const curLvl = this.robotMazeLevels[this.robotMazeLevelIdx];
    this.robotPos = { ...curLvl.startPos };
    this.robotCommands = [];
    this.collectedItems = 0;
    this.robotStepsCount = 0;
    this.isRobotRunning = false;

    // Reset items
    curLvl.items.forEach(it => it.collected = false);

    const titleEl = document.getElementById("robot-maze-title");
    const missionEl = document.getElementById("robot-maze-mission");
    const selectEl = document.getElementById("robot-maze-level-select");

    if (titleEl) titleEl.innerText = curLvl.title;
    if (missionEl) missionEl.innerText = curLvl.mission;
    if (selectEl) selectEl.value = this.robotMazeLevelIdx;

    this.renderRobotMazeGrid();
    this.renderRobotCommandsQueue();
  }

  switchRobotMazeLevel(idx) {
    this.robotMazeLevelIdx = parseInt(idx, 10) || 0;
    this.initRobotMazeGame();
    window.app.showToast(`🎯 Đã chuyển sang: ${this.robotMazeLevels[this.robotMazeLevelIdx].title}!`, "info");
  }

  renderRobotMazeGrid() {
    const gridEl = document.getElementById("robot-maze-grid-board");
    const itemsBadge = document.getElementById("robot-maze-items-badge");
    const stepsBadge = document.getElementById("robot-maze-steps-badge");

    const curLvl = this.robotMazeLevels[this.robotMazeLevelIdx];
    const totalItems = curLvl.items.filter(it => !it.isHazard).length;

    if (itemsBadge) itemsBadge.innerText = `Linh kiện: ${this.collectedItems} / ${totalItems}`;
    if (stepsBadge) stepsBadge.innerText = `Số bước: ${this.robotStepsCount}`;

    if (!gridEl) return;

    const dirSymbols = ["⬆️", "➡️", "⬇️", "⬅️"];
    let html = "";

    for (let r = 0; r < curLvl.gridSize; r++) {
      for (let c = 0; c < curLvl.gridSize; c++) {
        const isRobot = this.robotPos.r === r && this.robotPos.c === c;
        const isWall = curLvl.walls.some(w => w.r === r && w.c === c);
        const isTarget = curLvl.targetPos.r === r && curLvl.targetPos.c === c;
        const item = curLvl.items.find(it => it.r === r && it.c === c && !it.collected);

        let cellContent = "";
        let cellClass = "bg-slate-900 border border-slate-800 text-slate-600";

        if (isWall) {
          cellContent = "🧱";
          cellClass = "bg-amber-950/80 border-amber-700/80 text-xl shadow-inner";
        } else if (isTarget) {
          cellContent = "🏁";
          cellClass = "bg-emerald-950/90 border-2 border-emerald-400 text-xl animate-pulse";
        } else if (item) {
          cellContent = item.icon;
          cellClass = item.isHazard ? "bg-rose-950/90 border-2 border-rose-500 text-xl animate-bounce" : "bg-cyan-950/90 border-2 border-cyan-400 text-xl animate-bounce";
        }

        if (isRobot) {
          cellContent = `
            <div class="relative flex flex-col items-center justify-center">
              <span class="text-2xl filter drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-bounce">🤖</span>
              <span class="text-[9px] font-black text-yellow-300 absolute -bottom-1">${dirSymbols[this.robotPos.dir]}</span>
            </div>
          `;
          cellClass = "bg-emerald-600/40 border-2 border-emerald-400 ring-2 ring-emerald-300";
        }

        html += `
          <div class="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${cellClass}">
            ${cellContent}
          </div>
        `;
      }
    }

    gridEl.innerHTML = html;
  }

  addRobotCommand(cmd) {
    if (this.isRobotRunning) return;
    const cmdMap = {
      forward: { text: "Tiến 1 Ô", icon: "⬆️", color: "bg-blue-600 border-blue-400 text-white" },
      backward: { text: "Lùi 1 Ô", icon: "⬇️", color: "bg-slate-700 border-slate-500 text-white" },
      turn_left: { text: "Xoay Trái 90°", icon: "⬅️", color: "bg-indigo-600 border-indigo-400 text-white" },
      turn_right: { text: "Xoay Phải 90°", icon: "➡️", color: "bg-indigo-600 border-indigo-400 text-white" },
      collect: { text: "Nhặt Vật Phẩm", icon: "⚡", color: "bg-amber-500 border-amber-300 text-slate-950" }
    };

    const block = cmdMap[cmd];
    if (!block) return;

    this.robotCommands.push({ type: cmd, ...block });
    this.playTickSound();
    this.renderRobotCommandsQueue();
  }

  removeRobotCommand(index) {
    if (this.isRobotRunning) return;
    this.robotCommands.splice(index, 1);
    this.playTickSound();
    this.renderRobotCommandsQueue();
  }

  clearRobotCommands() {
    if (this.isRobotRunning) return;
    this.robotCommands = [];
    this.renderRobotCommandsQueue();
    window.app.showToast("🧹 Đã làm sạch kịch bản Robot!", "info");
  }

  renderRobotCommandsQueue() {
    const queueEl = document.getElementById("robot-commands-queue");
    if (!queueEl) return;

    if (this.robotCommands.length === 0) {
      queueEl.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs italic">
          <span class="text-3xl block mb-1 opacity-40">🤖</span>
          <span>Bấm các nút lệnh bên cạnh để lập trình Robot!</span>
        </div>
      `;
      return;
    }

    queueEl.innerHTML = this.robotCommands.map((cmd, idx) => `
      <div id="robot-cmd-step-${idx}" class="p-1.5 rounded-xl border flex items-center justify-between text-xs transition-all ${cmd.color}">
        <div class="flex items-center gap-1.5">
          <span class="font-mono text-[10px] opacity-80">${idx + 1}.</span>
          <span>${cmd.icon}</span>
          <span class="font-black text-[11px]">${cmd.text}</span>
        </div>
        <button onclick="lecturePortal.removeRobotCommand(${idx})" class="text-xs font-bold text-white/80 hover:text-white bg-black/30 hover:bg-rose-600 px-1.5 py-0.5 rounded-lg transition-all">✕</button>
      </div>
    `).join("");
  }

  resetRobotStage() {
    this.isRobotRunning = false;
    const curLvl = this.robotMazeLevels[this.robotMazeLevelIdx];
    this.robotPos = { ...curLvl.startPos };
    this.collectedItems = 0;
    this.robotStepsCount = 0;
    curLvl.items.forEach(it => it.collected = false);
    this.renderRobotMazeGrid();
    window.app.showToast("🔄 Đã đặt lại vị trí xuất phát cho Robot!", "info");
  }

  async runRobotAlgorithm() {
    if (this.isRobotRunning) return;
    if (this.robotCommands.length === 0) {
      window.app.showToast("Cô và các bạn hãy lập trình ít nhất 1 lệnh cho Robot nhé!", "warning");
      return;
    }

    this.isRobotRunning = true;
    const curLvl = this.robotMazeLevels[this.robotMazeLevelIdx];
    this.robotPos = { ...curLvl.startPos };
    this.collectedItems = 0;
    this.robotStepsCount = 0;
    curLvl.items.forEach(it => it.collected = false);
    this.renderRobotMazeGrid();

    window.app.showToast("🚀 Robot bắt đầu di chuyển theo thuật toán...", "info");

    const deltas = [
      { dr: -1, dc: 0 }, // 0: Bắc
      { dr: 0, dc: 1 },  // 1: Đông
      { dr: 1, dc: 0 },  // 2: Nam
      { dr: 0, dc: -1 }  // 3: Tây
    ];

    for (let i = 0; i < this.robotCommands.length; i++) {
      if (!this.isRobotRunning) break;

      const cmd = this.robotCommands[i];
      const stepEl = document.getElementById(`robot-cmd-step-${i}`);
      if (stepEl) stepEl.classList.add("ring-4", "ring-yellow-400", "scale-105");

      if (cmd.type === "turn_left") {
        this.robotPos.dir = (this.robotPos.dir + 3) % 4;
        this.playTickSound();
      } else if (cmd.type === "turn_right") {
        this.robotPos.dir = (this.robotPos.dir + 1) % 4;
        this.playTickSound();
      } else if (cmd.type === "forward" || cmd.type === "backward") {
        const factor = cmd.type === "forward" ? 1 : -1;
        const nextR = this.robotPos.r + deltas[this.robotPos.dir].dr * factor;
        const nextC = this.robotPos.c + deltas[this.robotPos.dir].dc * factor;

        // Check tường hoặc tràn viền
        const isOutOfBounds = nextR < 0 || nextR >= curLvl.gridSize || nextC < 0 || nextC >= curLvl.gridSize;
        const isWall = curLvl.walls.some(w => w.r === nextR && w.c === nextC);

        if (isOutOfBounds || isWall) {
          this.playBellChime();
          window.app.showToast("⚠️ Robot đâm phải chướng ngại vật! Hãy kiểm tra lại hướng đi!", "warning");
        } else {
          this.robotPos.r = nextR;
          this.robotPos.c = nextC;
          this.robotStepsCount++;
          this.playTickSound();
        }
      } else if (cmd.type === "collect") {
        const item = curLvl.items.find(it => it.r === this.robotPos.r && it.c === this.robotPos.c && !it.collected);
        if (item) {
          if (item.isHazard) {
            window.app.showToast("💥 Ôi không! Robot chạm phải dây điện giật!", "error");
          } else {
            item.collected = true;
            this.collectedItems++;
            this.playTingSound();
            window.app.showToast(`🎯 Tuyệt vời! Robot đã nhặt được "${item.name}"!`, "success");
          }
        } else {
          window.app.showToast("Ô này không có vật phẩm để nhặt!", "info");
        }
      }

      this.renderRobotMazeGrid();
      await new Promise(res => setTimeout(res, 500));
      if (stepEl) stepEl.classList.remove("ring-4", "ring-yellow-400", "scale-105");
    }

    this.isRobotRunning = false;

    // Kiểm tra về đích và thu thập đủ
    const isAtTarget = this.robotPos.r === curLvl.targetPos.r && this.robotPos.c === curLvl.targetPos.c;
    const totalItems = curLvl.items.filter(it => !it.isHazard).length;
    const isAllCollected = this.collectedItems >= totalItems;

    if (isAtTarget && isAllCollected) {
      this.celebrateRobotWin();
    } else if (isAtTarget && !isAllCollected) {
      window.app.showToast(`🏁 Robot đã về đích nhưng chưa nhặt đủ ${totalItems} linh kiện! Hãy bổ sung lệnh nhé.`, "warning");
    } else {
      window.app.showToast("💡 Thuật toán đã chạy xong! Hãy bổ sung thêm lệnh để Robot đi tới đích 🏁.", "info");
    }
  }

  celebrateRobotWin() {
    this.playStarTingSound();
    if (window.Simulation3D?.triggerFireworks) {
      window.Simulation3D.triggerFireworks();
    }
    if (window.ttsService) {
      window.ttsService.playPraise("champion");
    }
    window.app.showToast("🎉 XUẤT SẮC! Robot đã hoàn thành nhiệm vụ mê cung xuất sắc!", "success");
    this.openStarAwardForRobotWinner();
  }

  openStarAwardForRobotWinner() {
    this.toggleInSlideStarAward(this.wheelNames[0] ? this.wheelNames[0].replace(/^\d+\.\s*/, '') : "Kỹ Sư Lập Trình Robot", "Hoàn thành xuất sắc thử thách Mê Cung Thuật Toán Robot 3D");
  }

  // =========================================================================
  // OPTION 3: ĐẤU TRƯỜNG BẤM CHUÔNG THỜI GIAN THỰC (REALTIME IN-CLASS BUZZER - MODAL 40)
  // =========================================================================
  openRealtimeBuzzerModal() {
    const modal = document.getElementById("realtime-class-buzzer-modal");
    if (!modal) return;

    this.buzzerStatus = "idle";
    this.buzzerLeaderboard = [];
    modal.classList.add("active");
    this.renderBuzzerLeaderboard();
  }

  startNewBuzzerRound() {
    if (this.buzzerCountdownTimer) clearInterval(this.buzzerCountdownTimer);
    this.buzzerStatus = "countdown";
    this.buzzerLeaderboard = [];

    const statusBadge = document.getElementById("buzzer-status-badge");
    const resultMsg = document.getElementById("buzzer-student-result-msg");
    const bigBtn = document.getElementById("btn-student-big-buzzer");

    let count = 3;
    if (statusBadge) statusBadge.innerText = `● ĐẾM NGƯỢC: ${count}...`;
    if (resultMsg) resultMsg.innerText = `Chuẩn bị... ${count}`;

    this.playTickSound();

    this.buzzerCountdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        if (statusBadge) statusBadge.innerText = `● ĐẾM NGƯỢC: ${count}...`;
        if (resultMsg) resultMsg.innerText = `Chuẩn bị... ${count}`;
        this.playTickSound();
      } else {
        clearInterval(this.buzzerCountdownTimer);
        this.buzzerStatus = "open";
        this.buzzerStartTime = Date.now();

        if (statusBadge) {
          statusBadge.className = "badge bg-emerald-500 text-slate-950 font-black text-[10px] animate-bounce";
          statusBadge.innerText = "🔔 CHUÔNG ĐÃ MỞ! BẤM NGAY!";
        }
        if (resultMsg) resultMsg.innerText = "🔔 CHUÔNG ĐÃ MỞ! HÃY BẤM CHUÔNG NGAY!";
        if (bigBtn) bigBtn.classList.add("animate-pulse");

        this.ringGoldenBellSound();

        // Tự động mô phỏng các học sinh khác bấm chuông cạnh tranh
        this.simulatePeerBuzzers();
      }
    }, 1000);
  }

  simulatePeerBuzzers() {
    this.mockParticipants.forEach(p => {
      setTimeout(() => {
        if (this.buzzerStatus === "open") {
          const already = this.buzzerLeaderboard.some(b => b.name === p.name);
          if (!already) {
            this.buzzerLeaderboard.push({
              name: p.name,
              time: p.delay,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
            this.buzzerLeaderboard.sort((a, b) => a.time - b.time);
            this.renderBuzzerLeaderboard();
          }
        }
      }, p.delay * 1000 + 400);
    });
  }

  pressStudentBuzzer() {
    if (this.buzzerStatus !== "open") {
      if (this.buzzerStatus === "countdown") {
        window.app.showToast("⚠️ Chưa mở chuông! Không bấm phạm quy nhé em!", "warning");
      } else {
        window.app.showToast("🔔 Chuông chưa mở hoặc đã khóa! Hãy chờ Cô mở vòng mới.", "info");
      }
      return;
    }

    const elapsed = (Date.now() - this.buzzerStartTime) / 1000;
    const nameInput = document.getElementById("buzzer-student-name-input");
    const studentName = (nameInput ? nameInput.value : "Em Học Sinh").trim();

    const already = this.buzzerLeaderboard.some(b => b.name === studentName);
    if (!already) {
      this.buzzerLeaderboard.push({
        name: studentName,
        time: parseFloat(elapsed.toFixed(2)),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      this.buzzerLeaderboard.sort((a, b) => a.time - b.time);
    }

    this.playBuzzerSound();

    const myRank = this.buzzerLeaderboard.findIndex(b => b.name === studentName) + 1;
    const resultMsg = document.getElementById("buzzer-student-result-msg");
    if (resultMsg) {
      resultMsg.innerHTML = `<span class="text-amber-400 font-bold">🎉 Bạn bấm chuông vị trí #${myRank} (sau ${elapsed.toFixed(2)}s)! Chờ Cô mời phát biểu nhé!</span>`;
    }

    this.renderBuzzerLeaderboard();
  }

  lockBuzzer() {
    this.buzzerStatus = "locked";
    const statusBadge = document.getElementById("buzzer-status-badge");
    const resultMsg = document.getElementById("buzzer-student-result-msg");

    if (statusBadge) {
      statusBadge.className = "badge bg-rose-600 text-white font-black text-[10px]";
      statusBadge.innerText = "🔒 ĐÃ KHÓA CHUÔNG";
    }
    if (resultMsg) resultMsg.innerText = "Chuông đã khóa! Cô đang mời học sinh trả lời...";
    window.app.showToast("🔒 Đã khóa chuông!", "info");
  }

  resetBuzzerLeaderboard() {
    this.buzzerStatus = "idle";
    this.buzzerLeaderboard = [];
    const statusBadge = document.getElementById("buzzer-status-badge");
    const resultMsg = document.getElementById("buzzer-student-result-msg");

    if (statusBadge) {
      statusBadge.className = "badge bg-amber-500 text-slate-950 font-black text-[10px]";
      statusBadge.innerText = "● CHỜ BẮT ĐẦU";
    }
    if (resultMsg) resultMsg.innerText = "Sẵn sàng bấm chuông khi chuông mở...";
    this.renderBuzzerLeaderboard();
    window.app.showToast("🔄 Đã làm mới bảng bấm chuông!", "info");
  }

  renderBuzzerLeaderboard() {
    const listEl = document.getElementById("buzzer-leaderboard-list");
    if (!listEl) return;

    if (this.buzzerLeaderboard.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-4 text-slate-500 text-xs italic">
          Chưa có lượt bấm chuông nào. Cô hãy bấm 'Mở Chuông' để bắt đầu!
        </div>
      `;
      return;
    }

    const rankBadges = ["🥇 Top 1", "🥈 Top 2", "🥉 Top 3", "#4", "#5"];
    const rankColors = ["bg-amber-400 text-slate-950", "bg-slate-300 text-slate-950", "bg-amber-600 text-white", "bg-slate-800 text-white", "bg-slate-800 text-white"];

    listEl.innerHTML = this.buzzerLeaderboard.map((item, idx) => `
      <div class="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 animate-pop">
        <div class="flex items-center gap-2">
          <span class="badge ${rankColors[idx] || 'bg-slate-800 text-white'} font-black text-[10px]">${rankBadges[idx] || `#${idx + 1}`}</span>
          <span class="font-bold text-white text-xs">${item.name}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-cyan-300 font-bold text-xs">${item.time.toFixed(2)}s</span>
          <button onclick="lecturePortal.toggleInSlideStarAward('${item.name}', 'Giành quyền bấm chuông nhanh nhất vị trí #${idx + 1}')" class="btn btn-amber btn-xs font-black shadow-xs" title="Tặng sao khen thưởng">
            ⭐ Thưởng
          </button>
        </div>
      </div>
    `).join("");
  }

  playBuzzerSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {}
  }

  // =========================================================================
  // OPTION 5: PHÒNG THU & GHI ÂM LỜI GIẢNG CÔ GIÁO (VOICE RECORDER - MODAL 41)
  // =========================================================================
  openVoiceRecorderModal() {
    const modal = document.getElementById("lecture-voice-recorder-modal");
    if (!modal) return;

    modal.classList.add("active");
    this.renderVoiceRecordingsList();
  }

  async startVoiceRecording() {
    if (this.isRecording) return;

    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.audioStream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        this.voiceRecordings.unshift({
          id: Date.now(),
          title: `Lời giảng Slide ${this.currentSlideIndex + 1} - ${new Date().toLocaleTimeString('vi-VN')}`,
          url: audioUrl,
          blob: audioBlob,
          duration: this.recordingElapsed
        });

        this.renderVoiceRecordingsList();
        window.app.showToast("🎉 Đã lưu bản ghi âm lời giảng thành công!", "success");
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.isRecordingPaused = false;
      this.recordingStartTime = Date.now();
      this.recordingElapsed = 0;

      const statusEl = document.getElementById("voice-recorder-status");
      const btnStart = document.getElementById("btn-voice-start");
      if (statusEl) statusEl.innerText = "🔴 Đang thu âm giọng Cô... Hãy giảng bài tự nhiên!";
      if (btnStart) btnStart.innerHTML = "<span>🔴</span> <span>Đang Ghi...</span>";

      if (this.recordingTimerInterval) clearInterval(this.recordingTimerInterval);
      this.recordingTimerInterval = setInterval(() => {
        if (!this.isRecordingPaused) {
          this.recordingElapsed++;
          const mins = Math.floor(this.recordingElapsed / 60);
          const secs = this.recordingElapsed % 60;
          const disp = document.getElementById("voice-recorder-timer-disp");
          if (disp) disp.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}.00`;
        }
      }, 1000);

      this.drawVoiceWaveform();
      window.app.showToast("🎙️ Đã bắt đầu ghi âm micro!", "info");
    } catch (err) {
      console.error(err);
      window.app.showToast("Vui lòng cấp quyền sử dụng Micro cho trình duyệt để ghi âm!", "warning");
    }
  }

  pauseVoiceRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;
    this.isRecordingPaused = !this.isRecordingPaused;
    const btn = document.getElementById("btn-voice-pause");
    const statusEl = document.getElementById("voice-recorder-status");

    if (this.isRecordingPaused) {
      this.mediaRecorder.pause();
      if (btn) btn.innerHTML = "<span>▶️</span> <span>Tiếp Tục</span>";
      if (statusEl) statusEl.innerText = "⏸️ Đang tạm dừng ghi âm...";
    } else {
      this.mediaRecorder.resume();
      if (btn) btn.innerHTML = "<span>⏸️</span> <span>Tạm Dừng</span>";
      if (statusEl) statusEl.innerText = "🔴 Đang thu âm giọng Cô...";
    }
  }

  stopVoiceRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;
    this.mediaRecorder.stop();
    this.isRecording = false;
    this.isRecordingPaused = false;
    if (this.recordingTimerInterval) clearInterval(this.recordingTimerInterval);
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
    }

    const btnStart = document.getElementById("btn-voice-start");
    const statusEl = document.getElementById("voice-recorder-status");
    if (btnStart) btnStart.innerHTML = "<span>🔴</span> <span>Bắt Đầu Ghi</span>";
    if (statusEl) statusEl.innerText = "Đã hoàn thành thu âm!";
  }

  drawVoiceWaveform() {
    const canvas = document.getElementById("voice-wave-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = this.isRecording ? "#ec4899" : "#64748b";
      ctx.lineWidth = 2;

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * 0.05 + phase) * (this.isRecording ? 12 : 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      phase += 0.1;

      if (this.isRecording) {
        this.waveAnimId = requestAnimationFrame(renderWave);
      }
    };
    renderWave();
  }

  renderVoiceRecordingsList() {
    const listEl = document.getElementById("voice-recordings-list");
    if (!listEl) return;

    if (this.voiceRecordings.length === 0) {
      listEl.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-2">Chưa có bản ghi âm nào. Hãy bấm 'Bắt Đầu Ghi' để thu âm!</p>`;
      return;
    }

    listEl.innerHTML = this.voiceRecordings.map(rec => `
      <div class="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 animate-pop">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-pink-300">🎙️ ${rec.title}</span>
          <span class="font-mono text-slate-400 text-[10px]">${rec.duration}s</span>
        </div>
        <audio controls src="${rec.url}" class="w-full h-8 rounded-lg"></audio>
        <div class="flex items-center justify-end gap-2 pt-1 text-[11px]">
          <a href="${rec.url}" download="${rec.title}.webm" class="btn bg-cyan-700 hover:bg-cyan-600 text-white btn-xs font-bold flex items-center gap-1">
            <span>📥</span> <span>Tải Về (.webm)</span>
          </a>
          <button onclick="lecturePortal.attachVoiceToLecture('${rec.id}')" class="btn bg-pink-600 hover:bg-pink-500 text-white btn-xs font-black flex items-center gap-1">
            <span>💾</span> <span>Gắn Vào Slide</span>
          </button>
        </div>
      </div>
    `).join("");
  }

  attachVoiceToLecture(recId) {
    window.app.showToast("✨ Đã gắn kèm bản ghi âm lời giảng vào Slide bài học thành công!", "success");
  }

  // =========================================================================
  // OPTION 2: MÃ QR CHIA SẺ BÀI GIẢNG ĐIỆN TỬ (QR LECTURE SHARE - MODAL 38)
  // =========================================================================
  async openLectureQRModal(lectureId = null) {
    const targetId = lectureId || this.currentPreviewLectureId || (this.lectures[0] && this.lectures[0].id);
    if (!targetId) return;

    const lecture = await window.lectureService.getLectureById(targetId);
    if (!lecture) return;

    this.activeQRLecture = lecture;

    const modal = document.getElementById("lecture-qr-share-modal");
    const gradeBadge = document.getElementById("qr-modal-grade-badge");
    const titleEl = document.getElementById("qr-modal-lecture-title");
    const authorEl = document.getElementById("qr-modal-author");
    const linkInput = document.getElementById("lecture-qr-link-url");
    const qrImg = document.getElementById("lecture-qr-image");

    const shareUrl = `${window.location.origin}${window.location.pathname}#lectures?id=${encodeURIComponent(lecture.id)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(shareUrl)}&margin=10`;

    if (gradeBadge) gradeBadge.innerText = `TIN HỌC LỚP ${lecture.grade} • ${lecture.bookSeries || 'KNTT'}`;
    if (titleEl) titleEl.innerText = lecture.title;
    if (authorEl) authorEl.innerText = `Tác giả: ${lecture.authorName || 'Cô Giáo Anh Đào'}`;
    if (linkInput) linkInput.value = shareUrl;
    if (qrImg) qrImg.src = qrApiUrl;

    if (modal) modal.classList.add("active");
  }

  copyQRShareLink() {
    const linkInput = document.getElementById("lecture-qr-link-url");
    if (linkInput) {
      linkInput.select();
      navigator.clipboard.writeText(linkInput.value).then(() => {
        window.app.showToast("📋 Đã sao chép đường dẫn bài giảng vào bộ nhớ tạm!", "success");
      }).catch(() => {
        document.execCommand("copy");
        window.app.showToast("📋 Đã sao chép link bài giảng!", "success");
      });
    }
  }

  downloadQRCodeImage() {
    if (!this.activeQRLecture) return;
    const lecture = this.activeQRLecture;
    const shareUrl = `${window.location.origin}${window.location.pathname}#lectures?id=${encodeURIComponent(lecture.id)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shareUrl)}&margin=15`;

    window.app.showToast("📥 Đang tải ảnh mã QR Code về máy tính...", "info");

    const a = document.createElement("a");
    a.href = qrApiUrl;
    a.target = "_blank";
    a.download = `MaQR_BaiGiang_Lop${lecture.grade}_${lecture.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      window.app.showToast("🎉 Tải ảnh QR Code thành công!", "success");
    }, 600);
  }

  printQRSheetForStudents() {
    if (!this.activeQRLecture) return;
    const lecture = this.activeQRLecture;
    const shareUrl = `${window.location.origin}${window.location.pathname}#lectures?id=${encodeURIComponent(lecture.id)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}&margin=8`;

    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      window.app.showToast("Vui lòng cho phép mở cửa sổ popup để in phiếu QR!", "warning");
      return;
    }

    const cardsHtml = Array(6).fill(0).map((_, i) => `
      <div style="border: 2px dashed #0284c7; border-radius: 16px; padding: 12px; text-align: center; font-family: sans-serif; background: #f0f9ff; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 9pt; font-weight: bold; color: #0369a1; text-transform: uppercase;">🎓 WEB VUI HỌC • PHIẾU BÀI GIẢNG SỐ</div>
          <div style="font-size: 11pt; font-weight: 900; color: #0f172a; margin: 4px 0;">${lecture.title}</div>
          <div style="font-size: 8.5pt; color: #64748b;">Môn Tin học Lớp ${lecture.grade} • ${lecture.authorName || 'Cô Giáo Anh Đào'}</div>
        </div>
        <div style="margin: 8px auto;">
          <img src="${qrApiUrl}" style="width: 140px; height: 140px; border: 3px solid #0ea5e9; border-radius: 12px; background: white; padding: 4px;" alt="QR Code">
        </div>
        <div style="font-size: 8pt; font-weight: bold; color: #0369a1; background: #e0f2fe; padding: 4px; border-radius: 8px;">
          📱 Dùng Camera điện thoại quét mã để xem bài giảng
        </div>
      </div>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>In Phiếu QR Bài Giảng - ${lecture.title}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { margin: 0; padding: 0; font-family: sans-serif; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin: 0; color: #0f172a;">PHIẾU MÃ QR BÀI GIẢNG ĐIỆN TỬ CHO HỌC SINH (6 BẢN)</h2>
          <p style="margin: 4px 0 0; font-size: 10pt; color: #64748b;">Trường Tiểu Học Vui Học • Kế hoạch bài dạy chuẩn GDPT 2018</p>
        </div>
        <div class="grid">
          ${cardsHtml}
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  // =========================================================================
  // DUAL-SCREEN PRESENTER VIEW (MODAL 39)
  // =========================================================================
  async openPresenterView(lectureId = null) {
    const targetId = lectureId || this.currentPreviewLectureId || (this.lectures[0] && this.lectures[0].id);
    if (!targetId) return;

    const lecture = await window.lectureService.getLectureById(targetId);
    if (!lecture) return;

    this.presenterLecture = lecture;
    this.presenterSlideIdx = 0;
    this.presenterTimerSeconds = 45 * 60;
    this.isPresenterTimerRunning = false;

    const modal = document.getElementById("presenter-view-modal");
    const titleEl = document.getElementById("presenter-lecture-title");
    const iframe = document.getElementById("presenter-live-iframe");

    if (titleEl) titleEl.innerText = `PRESENTER VIEW: ${lecture.title.toUpperCase()} (LỚP ${lecture.grade})`;
    if (iframe) {
      iframe.src = lecture.fileUrl || "https://docs.google.com/presentation/d/e/2PACX-1vT1Z5u7.../embed";
    }

    if (modal) modal.classList.add("active");

    this.updatePresenterNotes();
    this.startPresenterClock();
  }

  updatePresenterNotes() {
    if (!this.presenterLecture) return;
    const totalSlides = this.presenterLecture.slideCount || 20;

    const counterEl = document.getElementById("presenter-slide-counter");
    const nextBadge = document.getElementById("presenter-next-slide-badge");
    const nextTitle = document.getElementById("presenter-next-title");
    const nextSummary = document.getElementById("presenter-next-summary");
    const noteIntro = document.getElementById("presenter-note-intro");
    const noteQ = document.getElementById("presenter-note-question");
    const noteReward = document.getElementById("presenter-note-reward");

    if (counterEl) counterEl.innerText = `Slide ${this.presenterSlideIdx + 1} / ${totalSlides}`;
    if (nextBadge) nextBadge.innerText = `Trang ${Math.min(this.presenterSlideIdx + 2, totalSlides)}`;

    const notesLibrary = [
      {
        nextTitle: "1. Khám Phá Thân Máy Tính (CPU)",
        nextSummary: "Nội dung: Quan sát cấu tạo bên trong và bên ngoài thân máy tính để bàn.",
        intro: '"Các em hãy quan sát trên màn hình và cho Cô biết: Bạn nào đã từng nhìn thấy chiếc máy tính để bàn ở nhà hoặc phòng máy trường mình?"',
        q: '"Nếu không có bàn phím và chuột thì chúng ta có thể nhập chữ và điều khiển máy tính được không? Vì sao?"',
        reward: '"Gọi ngẫu nhiên 2 bạn trả lời nhanh nhất bằng Vòng Quay May Mắn và thưởng +15 Sao Vàng vào tài khoản!"'
      },
      {
        nextTitle: "2. Thao Tác Chuột Chuẩn Tư Thế",
        nextSummary: "Nội dung: Quy tắc đặt tay ngón trỏ nút trái, ngón giữa nút phải và cuộn trang.",
        intro: '"Bây giờ Cô mời cả lớp cùng quan sát hình ảnh chú chuột máy tính và thực hành động tác cầm chuột mô phỏng trên không trung."',
        q: '"Khi nào em dùng thao tác nháy đúp chuột trái và khi nào dùng nháy đơn chuột trái?"',
        reward: '"Bật trò chơi Ghép Thẻ Trí Nhớ 3D và thưởng sao cho nhóm hoàn thành dưới 8 lượt lật!"'
      },
      {
        nextTitle: "3. Khám Phá Hàng Phím Cơ Sở F & J",
        nextSummary: "Nội dung: Nhận diện 2 phím có gờ nổi mốc đặt tay ngón trỏ trên bàn phím.",
        intro: '"Hãy nhắm mắt lại và dùng 2 ngón trỏ sờ nhẹ trên bàn phím để tìm 2 chiếc gờ nổi bí mật nhé các em!"',
        q: '"Vì sao trên phím F và phím J lại được thiết kế gờ nổi mà các phím khác không có?"',
        reward: '"Mở trò chơi Bắn Bong Bóng Tìm Từ Khóa 3D cho cả lớp cùng bấm chọn phím đúng!"'
      },
      {
        nextTitle: "4. Tổng Kết & Vận Dụng Bài Học",
        nextSummary: "Nội dung: Củng cố 4 bộ phận máy tính và ghi nhận sao khen thưởng cuối tiết.",
        intro: '"Tiết học hôm nay các em đã rất tích cực, Cô mời bạn lớp trưởng lên bấm nút Rung Chuông Vàng để củng cố bài học!"',
        q: '"Về nhà em sẽ chia sẻ với bố mẹ những bộ phận nào của chiếc máy tính?"',
        reward: '"Tặng danh hiệu Quán Quân Tiết Học +50 Sao Vàng vinh danh toàn trường!"'
      }
    ];

    const curNote = notesLibrary[this.presenterSlideIdx % notesLibrary.length];
    if (nextTitle) nextTitle.innerText = curNote.nextTitle;
    if (nextSummary) nextSummary.innerText = curNote.nextSummary;
    if (noteIntro) noteIntro.innerText = curNote.intro;
    if (noteQ) noteQ.innerText = curNote.q;
    if (noteReward) noteReward.innerText = curNote.reward;
  }

  presenterNextSlide() {
    if (!this.presenterLecture) return;
    const totalSlides = this.presenterLecture.slideCount || 20;
    if (this.presenterSlideIdx < totalSlides - 1) {
      this.presenterSlideIdx++;
      this.updatePresenterNotes();
      this.playTickSound();
    } else {
      window.app.showToast("Đã đến slide cuối cùng của bài học!", "info");
    }
  }

  presenterPrevSlide() {
    if (this.presenterSlideIdx > 0) {
      this.presenterSlideIdx--;
      this.updatePresenterNotes();
      this.playTickSound();
    }
  }

  startPresenterClock() {
    if (this.presenterClockInterval) clearInterval(this.presenterClockInterval);
    const updateTime = () => {
      const clockEl = document.getElementById("presenter-clock-now");
      if (clockEl) {
        clockEl.innerText = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    };
    updateTime();
    this.presenterClockInterval = setInterval(updateTime, 1000);
  }

  togglePresenterTimer() {
    this.isPresenterTimerRunning = !this.isPresenterTimerRunning;
    const btn = document.getElementById("btn-presenter-timer-toggle");

    if (this.isPresenterTimerRunning) {
      if (btn) btn.innerHTML = "<span>⏸️</span> <span>Tạm Dừng</span>";
      if (this.presenterTimerInterval) clearInterval(this.presenterTimerInterval);
      this.presenterTimerInterval = setInterval(() => {
        this.presenterTimerSeconds--;
        const mins = Math.floor(this.presenterTimerSeconds / 60);
        const secs = this.presenterTimerSeconds % 60;
        const disp = document.getElementById("presenter-timer-disp");
        if (disp) disp.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (this.presenterTimerSeconds <= 0) {
          clearInterval(this.presenterTimerInterval);
          this.isPresenterTimerRunning = false;
          if (btn) btn.innerHTML = "<span>▶️</span> <span>Bắt Đầu</span>";
          this.playBellChime();
          window.app.showToast("🔔 HẾT GIỜ TIẾT HỌC 45 PHÚT!", "warning");
        }
      }, 1000);
    } else {
      if (btn) btn.innerHTML = "<span>▶️</span> <span>Tiếp Tục</span>";
      if (this.presenterTimerInterval) clearInterval(this.presenterTimerInterval);
    }
  }

  resetPresenterTimer() {
    this.isPresenterTimerRunning = false;
    if (this.presenterTimerInterval) clearInterval(this.presenterTimerInterval);
    this.presenterTimerSeconds = 45 * 60;
    const disp = document.getElementById("presenter-timer-disp");
    const btn = document.getElementById("btn-presenter-timer-toggle");
    if (disp) disp.innerText = "45:00";
    if (btn) btn.innerHTML = "<span>▶️</span> <span>Bắt Đầu</span>";
  }

  openProjectorWindow() {
    if (!this.presenterLecture) return;
    const lecture = this.presenterLecture;
    const projectorUrl = lecture.fileUrl || "https://docs.google.com/presentation/d/e/2PACX-1vT1Z5u7.../embed";

    this.projectorWindow = window.open("", "ProjectorWindow", "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no");
    if (!this.projectorWindow) {
      window.app.showToast("Vui lòng cho phép popup để mở màn hình máy chiếu riêng!", "warning");
      return;
    }

    this.projectorWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Màn Hình Máy Chiếu / Tivi - ${lecture.title}</title>
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
          iframe { width: 100%; height: 100%; border: 0; }
        </style>
      </head>
      <body>
        <iframe src="${projectorUrl}" allowfullscreen></iframe>
      </body>
      </html>
    `);
    this.projectorWindow.document.close();
    window.app.showToast("📺 Đã mở Cửa Sổ Máy Chiếu Riêng! Cô hãy kéo cửa sổ này sang màn hình phụ nhé.", "success");
  }

  // =========================================================================
  // GIỌNG ĐỌC NỮ TIẾNG VIỆT & BÔI CHỮ KARAOKE CHO SÁCH 3D & VIDEO SLIDE
  // =========================================================================
  toggleKaraokeMode() {
    if (!window.ttsService) return;
    const isEnabled = window.ttsService.toggleKaraoke();
    const btnFlip = document.getElementById("btn-toggle-karaoke-flipbook");
    const btnVid = document.getElementById("btn-toggle-karaoke-video");
    const label = isEnabled ? "✨ Bôi Chữ Karaoke: BẬT" : "✨ Bôi Chữ Karaoke: TẮT";
    const labelShort = isEnabled ? "✨ Karaoke: BẬT" : "✨ Karaoke: TẮT";

    if (btnFlip) btnFlip.innerHTML = `<span>✨</span> <span>${label}</span>`;
    if (btnVid) btnVid.innerHTML = `<span>✨</span> <span>${labelShort}</span>`;
  }

  setSpeechRate(rate) {
    this.speechRate = parseFloat(rate) || 0.92;
    window.app.showToast(`⚡ Tốc độ đọc Cô Giáo: ${this.speechRate}x`, "info");
  }

  setVoiceGender(gender) {
    this.voiceGender = "female"; // Luôn ưu tiên giọng Nữ Cô Giáo
    window.app.showToast("👩‍🏫 Đã chọn Giọng Đọc Nữ Tiếng Việt Chuẩn Cô Giáo!", "info");
  }

  speakNarrative(text) {
    if (!window.ttsService) return;
    window.ttsService.speak(text, {
      karaokeContainers: ["video-slide-screen"],
      rate: this.speechRate,
      pitch: 1.2,
      onEnd: () => {
        if (this.isVideoPlaying) {
          setTimeout(() => {
            this.nextSlideVideo();
          }, 1500);
        }
      }
    });
  }

  readCurrentFlipbookPage() {
    if (!window.ttsService) return;

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

    window.ttsService.speak(fullText, {
      karaokeContainers: ["flipbook-left-page", "flipbook-right-page"],
      rate: this.speechRate,
      pitch: 1.2,
      onEnd: () => {
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
      }
    });
  }

  // =========================================================================
  // SÁCH 3D LẬT TRANG (FLIPBOOK)
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
          <p class="text-xs">Em hãy đăng nhập Web Vui Học để làm bài tập trắc nghiệm và mô phỏng 3D nhé!</p>
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

  toggleReadAloudFlipbook() {
    this.isReadingAloud = !this.isReadingAloud;
    const btn = document.getElementById("btn-read-aloud-flipbook");

    if (this.isReadingAloud) {
      if (btn) btn.innerHTML = "<span>⏸️</span> <span>Dừng Đọc</span>";
      window.app.showToast("🔊 Đang đọc nội dung trang sách bằng giọng Nữ Tiếng Việt...", "info");
      this.readCurrentFlipbookPage();
    } else {
      this.stopReadAloud();
    }
  }

  stopReadAloud() {
    this.isReadingAloud = false;
    if (window.ttsService) window.ttsService.stop();
    const btn = document.getElementById("btn-read-aloud-flipbook");
    if (btn) btn.innerHTML = "<span>🔊</span> <span>Đọc Sách AI</span>";
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
  // TRÌNH CHIẾU SLIDE & BẢNG VẼ BÚT LASER
  // =========================================================================
  async previewLecture(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    this.currentPreviewLectureId = lectureId;
    window.lectureService.incrementViewCount(lectureId);

    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

    const modal = document.getElementById("lecture-preview-modal");
    const iframe = document.getElementById("lec-preview-iframe");
    const titleEl = document.getElementById("lec-preview-title");
    const teacherTools = document.getElementById("lec-preview-teacher-tools");
    const teacherSoundboard = document.getElementById("lec-teacher-soundboard");

    if (titleEl) titleEl.innerText = `${lecture.title} (Lớp ${lecture.grade})`;

    if (teacherTools) {
      teacherTools.classList.remove("hidden");
    }

    if (teacherSoundboard) {
      teacherSoundboard.classList.remove("hidden");
    }

    // Tốc độ nạp tức thì: Nạp Slide PowerPoint / PDF đã đưa lên hoặc nạp HTML5 Native Player nếu không có file
    const smartUrl = this.getSmartEmbedUrl(lecture);
    if (iframe) {
      if (smartUrl) {
        iframe.removeAttribute("srcdoc");
        iframe.src = smartUrl;
      } else {
        // Nếu bài giảng chưa có file tải lên hoặc file demo -> dùng Trình chiếu HTML5 Player
        iframe.removeAttribute("src");
        iframe.srcdoc = this.buildHTML5SlidePlayerDoc(lecture);
      }
    }

    if (modal) modal.classList.add("active");
    this.initDrawingCanvas("lec-preview-canvas");
  }

  // Đổi nguồn phát viewer dự phòng (Office Online -> Google Docs -> HTML5 Native Player)
  async switchViewerSource() {
    if (!this.currentPreviewLectureId) return;
    const lecture = await window.lectureService.getLectureById(this.currentPreviewLectureId);
    if (!lecture) return;

    const modes = ['office', 'google', 'html5'];
    const currentIdx = modes.indexOf(this.currentViewerSource || 'office');
    const nextMode = modes[(currentIdx + 1) % modes.length];
    this.currentViewerSource = nextMode;

    const iframe = document.getElementById("lec-preview-iframe");
    const lblServer = document.getElementById("lbl-viewer-server-name");

    if (nextMode === 'html5') {
      if (iframe) {
        iframe.removeAttribute("src");
        iframe.srcdoc = this.buildHTML5SlidePlayerDoc(lecture);
      }
      if (lblServer) lblServer.innerText = "Server: HTML5 Offline";
      window.app?.showToast("✨ Đã chuyển sang Server HTML5 Native Player (Không lo lỗi mạng)!", "success");
    } else if (nextMode === 'google') {
      if (iframe) {
        const smartUrl = this.getSmartEmbedUrl(lecture, 'google');
        if (smartUrl) {
          iframe.removeAttribute("srcdoc");
          iframe.src = smartUrl;
        } else {
          iframe.removeAttribute("src");
          iframe.srcdoc = this.buildHTML5SlidePlayerDoc(lecture);
        }
      }
      if (lblServer) lblServer.innerText = "Server: Google Docs";
      window.app?.showToast("🌐 Đã chuyển sang Server Trình Xem Google Docs Viewer!", "info");
    } else {
      if (iframe) {
        const smartUrl = this.getSmartEmbedUrl(lecture, 'office');
        if (smartUrl) {
          iframe.removeAttribute("srcdoc");
          iframe.src = smartUrl;
        } else {
          iframe.removeAttribute("src");
          iframe.srcdoc = this.buildHTML5SlidePlayerDoc(lecture);
        }
      }
      if (lblServer) lblServer.innerText = "Server: Office Online";
      window.app?.showToast("💼 Đã chuyển về Server Microsoft Office Online!", "info");
    }
  }

  // Đọc thuyết minh bằng Giọng đọc AI Cô Giáo Đà Nẵng (Miền Trung - Ấm Áp & Truyền Cảm)
  async speakSlideNarration(slideIdx = 1) {
    if (!window.ttsService) return;
    window.ttsService.setVoiceAccent('central');

    let textToSpeak = "";
    if (this.currentPreviewLectureId) {
      const lecture = await window.lectureService.getLectureById(this.currentPreviewLectureId);
      if (lecture) {
        const title = lecture.title || "Bài giảng Tin học";
        const topic = lecture.topicName || "";
        const desc = lecture.description || "";
        textToSpeak = `Cô chào tất cả các em học sinh thân yêu! Cô trò mình cùng bắt đầu khám phá bài học: ${title}. ${topic ? 'Thuộc ' + topic + '.' : ''} ${desc}`;
      }
    }

    if (!textToSpeak) {
      textToSpeak = "Cô chào các em học sinh thân yêu! Cô trò mình cùng bắt đầu khám phá bài học Tin học hôm nay nhé!";
    }

    window.ttsService.speak(textToSpeak);
  }

  // Tự động phân tích và sinh Embed URL thông minh cho các file bài giảng đã đưa lên (Giữ nguyên gốc 100%)
  getSmartEmbedUrl(lecture, viewerType = 'office') {
    if (!lecture || !lecture.fileUrl) return "";
    let url = lecture.fileUrl.trim();

    // 1. Nếu đường dẫn trống hoặc mẫu không hợp lệ
    if (!url || url === "#" || url.includes("file-examples.com") || url.includes("example.pptx")) {
      return "";
    }

    // 2. Nếu là Google Slides / Presentation
    if (url.includes("docs.google.com/presentation")) {
      if (!url.includes("/embed")) {
        url = url.replace(/\/pub\??.*/, "/embed").replace(/\/edit\??.*/, "/embed");
      }
      return url;
    }

    // 2b. Nếu là đường dẫn file Google Drive (drive.google.com/file/d/FILE_ID/...)
    if (url.includes("drive.google.com/file/d/")) {
      if (!url.includes("/preview")) {
        return url.replace(/\/view\??.*/, "/preview").replace(/\/edit\??.*/, "/preview");
      }
      return url;
    }

    const lower = url.toLowerCase();
    const fileType = (lecture.fileType || "").toLowerCase();
    const fileName = (lecture.fileName || "").toLowerCase();
    const isPdf = lower.endsWith(".pdf") || lower.includes(".pdf?") || fileType === "pdf" || fileName.endsWith(".pdf");

    // 3. Nếu là file PDF (Dù là Blob URL, Data URL hay Link công khai) - Trình duyệt xem được trực tiếp mượt mà
    if (isPdf) {
      return url;
    }

    // 4. Nếu là Blob URL (File PowerPoint .pptx/.ppt chọn trực tiếp từ máy tính) hoặc Data URL
    // Giải thích kỹ thuật: Trình duyệt KHÔNG xem được trực tiếp binary PPTX qua iframe src=blob (sẽ bị màn hình đen).
    // Office Online Viewer cũng KHÔNG thể kết nối tới blob: URL local qua internet.
    // => Trả rỗng để tự động trình chiếu qua HTML5 Slide Presentation Player sinh động, chuẩn 100%!
    if (url.startsWith("blob:") || url.startsWith("data:")) {
      return "";
    }

    // 5. Nếu là file PowerPoint (.pptx, .ppt) tải lên Supabase Storage hoặc Server URL công khai
    if (lower.endsWith(".pptx") || lower.endsWith(".ppt") || lower.includes("supabase.co") || lower.includes(".pptx?") || lower.includes(".ppt?") || fileType === "pptx" || fileType === "ppt") {
      if (viewerType === 'google') {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      }
      // Dùng Office Online Web Viewer trình chiếu công khai
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }

    // 6. Mọi đường dẫn URL trực tiếp khác
    if (url.startsWith("http://") || url.startsWith("https://")) {
      if (url.includes("docs.google.com")) return url;
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }

    return "";
  }

  // Tạo tài liệu HTML5 Interactive Slide Player chuẩn bài giảng giữ nguyên nội dung gốc
  buildHTML5SlidePlayerDoc(lecture) {
    const title = lecture.title || "Bài Giảng Điện Tử Tin Học";
    const grade = lecture.grade || 3;
    const topic = lecture.topicName || "Bài Giảng Tin Học GDPT 2018";
    const series = lecture.bookSeries || "KNTT";
    const teacher = lecture.authorName || lecture.teacherName || "Cô Giáo Anh Đào";
    const school = lecture.schoolName || "Trường Tiểu Học Vui Học";
    const desc = lecture.description || "Nội dung bài giảng điện tử chuẩn GDPT 2018.";

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
          body { font-family: 'Nunito', sans-serif; background: #0f172a; color: white; margin: 0; overflow: hidden; height: 100vh; }
          .slide-card { display: none; height: 100vh; padding: 2rem; box-sizing: border-box; }
          .slide-card.active { display: flex; flex-direction: column; justify-content: space-between; animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        </style>
      </head>
      <body class="flex flex-col justify-between select-none">
        
        <!-- SLIDE 1: TRANG BÌA -->
        <div id="slide-1" class="slide-card active bg-gradient-to-br from-cyan-900 via-slate-900 to-indigo-950 p-8 text-center">
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full font-black text-xs border border-cyan-500/30">📘 TIN HỌC LỚP ${grade} • ${series}</span>
            <span class="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full font-black text-xs border border-amber-500/30">⭐ CHUẨN CV 2345</span>
          </div>
          
          <div class="my-auto space-y-4 max-w-3xl mx-auto">
            <div class="text-7xl animate-bounce">💻 📊</div>
            <h1 class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 leading-tight">
              ${title.toUpperCase()}
            </h1>
            <p class="text-cyan-200 text-sm md:text-base font-bold">${topic}</p>
            <div class="pt-4 flex items-center justify-center gap-3 text-xs text-slate-300">
              <span class="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">👩‍🏫 Tác giả: <b>${teacher}</b></span>
              <span class="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">🏫 <b>${school}</b></span>
            </div>
          </div>
          
          <p class="text-xs text-slate-400">Bấm phím mũi tên ➔ hoặc bấm nút bên dưới để chuyển slide</p>
        </div>

        <!-- SLIDE 2: NỘI DUNG CHÍNH BÀI GIẢNG -->
        <div id="slide-2" class="slide-card bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-8">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 class="text-xl font-black text-amber-300 flex items-center gap-2"><span>📚</span> <span>1. Nội Dung Bài Học: ${title}</span></h2>
            <span class="text-xs text-slate-400">Trang 2 / 4</span>
          </div>

          <div class="my-auto space-y-4 max-w-3xl mx-auto w-full">
            <div class="p-6 bg-white/10 backdrop-blur rounded-2xl border border-cyan-400/30 space-y-3">
              <h3 class="font-black text-cyan-300 text-lg flex items-center gap-2"><span>📌</span> <span>Thông Tin Bài Học:</span></h3>
              <p class="text-base text-slate-200 leading-relaxed font-bold">${desc}</p>
            </div>
          </div>

          <div class="p-3 bg-cyan-950/60 rounded-xl border border-cyan-500/40 text-xs text-cyan-200 flex items-center justify-between">
            <span>💡 <b>Học liệu bài giảng:</b> ${topic} - Lớp ${grade}</span>
          </div>
        </div>

        <!-- SLIDE 3: CHI TIẾT HỌC LIỆU -->
        <div id="slide-3" class="slide-card bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 p-8">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 class="text-xl font-black text-amber-300 flex items-center gap-2"><span>📖</span> <span>2. Chi Tiết Bài Học</span></h2>
            <span class="text-xs text-slate-400">Trang 3 / 4</span>
          </div>

          <div class="my-auto space-y-4 max-w-3xl mx-auto w-full">
            <div class="p-6 bg-white/10 backdrop-blur rounded-2xl border border-purple-400/30 space-y-3">
              <h3 class="font-black text-purple-300 text-lg">Giữ đúng nguyên bản nội dung giáo viên đã tải lên:</h3>
              <p class="text-base text-slate-200 leading-relaxed">${title} - ${topic}</p>
              <div class="pt-2 flex items-center gap-3 text-xs text-slate-300">
                <span class="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">Bộ sách: <b>${series}</b></span>
                <span class="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">Khối lớp: <b>Lớp ${grade}</b></span>
              </div>
            </div>
          </div>

          <div class="p-3 bg-purple-950/60 rounded-xl border border-purple-500/40 text-xs text-purple-200">
            <span>✨ Giữ nguyên đúng 100% nội dung các bài giáo viên đã tải lên.</span>
          </div>
        </div>

        <!-- SLIDE 4: TỔNG KẾT BÀI HỌC -->
        <div id="slide-4" class="slide-card bg-gradient-to-br from-cyan-950 via-slate-900 to-emerald-950 p-8 text-center">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400">Trang 4 / 4</span>
            <span class="badge bg-emerald-500 text-slate-950 font-black text-xs">🎉 TỔNG KẾT BÀI HỌC</span>
          </div>

          <div class="my-auto space-y-4 max-w-xl mx-auto">
            <div class="text-7xl animate-bounce">🏆 ⭐</div>
            <h2 class="text-3xl font-black text-amber-300">HOÀN THÀNH BÀI GIẢNG</h2>
            <p class="text-sm text-slate-300 leading-relaxed">${title}</p>
          </div>

          <div class="pt-3 border-t border-white/10 text-xs text-slate-400">Hệ Thống Web Vui Học • GDPT 2018</div>
        </div>

        <!-- THANH ĐIỀU HƯỚNG SLIDE DƯỚI BÙNG -->
        <div class="bg-slate-950/90 p-3 border-t border-white/10 flex items-center justify-between gap-4 text-xs shrink-0 z-50">
          <button onclick="prevSlide()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl flex items-center gap-1">
            <span>◀️</span> <span>Slide Trước</span>
          </button>

          <div class="flex items-center gap-3">
            <span id="slide-num-disp" class="font-black text-amber-300">Slide 1 / 4</span>
            ${lecture.fileUrl && lecture.fileUrl !== '#' ? `
              <a href="${lecture.fileUrl}" download="${lecture.fileName || 'BaiGiang.pptx'}" target="_blank" class="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold rounded-xl border border-amber-500/40 flex items-center gap-1 transition-all" title="Mở / Tải về file PowerPoint gốc giáo viên đã tải lên">
                <span>📥</span> <span class="hidden sm:inline">File Gốc:</span> <b>${lecture.fileName || 'PPTX'}</b>
              </a>
            ` : ''}
          </div>

          <button onclick="nextSlide()" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl flex items-center gap-1">
            <span>Slide Tiếp</span> <span>➔</span>
          </button>
        </div>

        <script>
          let currentSlide = 1;
          const totalSlides = 4;

          function showSlide(idx) {
            if (idx < 1) idx = 1;
            if (idx > totalSlides) idx = totalSlides;
            currentSlide = idx;

            for (let i = 1; i <= totalSlides; i++) {
              const s = document.getElementById('slide-' + i);
              if (s) {
                if (i === currentSlide) s.classList.add('active');
                else s.classList.remove('active');
              }
            }

            const numDisp = document.getElementById('slide-num-disp');
            if (numDisp) numDisp.innerText = 'Slide ' + currentSlide + ' / ' + totalSlides;
          }

          function prevSlide() { showSlide(currentSlide - 1); }
          function nextSlide() { showSlide(currentSlide + 1); }

          document.addEventListener('keydown', function(e) {
            if (['Space', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
              e.preventDefault();
              nextSlide();
            } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
              e.preventDefault();
              prevSlide();
            }
          });

          window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'next_slide') nextSlide();
          });
        </script>
      </body>
      </html>
    `;
  }

  // 1. Phóng to / Thu nhỏ Toàn Màn Hình (Fullscreen Toggle)
  toggleFullscreenPreview() {
    const modalContent = document.querySelector("#lecture-preview-modal .modal-content");
    const btn = document.getElementById("btn-fullscreen-preview");

    if (!document.fullscreenElement) {
      const target = modalContent || document.documentElement;
      if (target.requestFullscreen) {
        target.requestFullscreen().catch(err => console.warn(err));
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
      }
      if (btn) btn.innerHTML = `<span>🛈</span> <span>Thu Nhỏ</span>`;
      window.app?.showToast("🖥️ Đã bật chế độ Toàn Màn Hình!", "info");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn(err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      if (btn) btn.innerHTML = `<span>🖥️</span> <span>Toàn Màn Hình</span>`;
    }
  }

  // 2. Tự Động Lật Slide Sau Mỗi 10 Giây (Auto Play Slide)
  toggleAutoPlaySlide(seconds = 10) {
    const btn = document.getElementById("btn-auto-play-slide");
    this.isAutoPlayRunning = !this.isAutoPlayRunning;

    if (this.isAutoPlayRunning) {
      this.autoPlayCounter = seconds;
      if (btn) {
        btn.className = "btn bg-amber-500 hover:bg-amber-600 text-slate-950 btn-xs font-black shadow-md flex items-center gap-1 animate-pulse";
        btn.innerHTML = `<span>⏸️</span> <span>Dừng Chạy (${this.autoPlayCounter}s)</span>`;
      }

      window.app?.showToast("▶️ Đã bật chế độ Tự động lật slide sau mỗi 10 giây!", "success");

      this.autoPlayTimer = setInterval(() => {
        this.autoPlayCounter--;
        if (this.autoPlayCounter <= 0) {
          this.autoPlayCounter = seconds;
          const iframe = document.getElementById("lec-preview-iframe");
          if (iframe && iframe.contentWindow) {
            try {
              iframe.contentWindow.postMessage({ type: "next_slide" }, "*");
            } catch (e) {}
          }
        }
        if (btn) {
          btn.innerHTML = `<span>⏸️</span> <span>Dừng Chạy (${this.autoPlayCounter}s)</span>`;
        }
      }, 1000);
    } else {
      if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
      if (btn) {
        btn.className = "btn bg-cyan-600 hover:bg-cyan-700 text-white btn-xs font-black shadow-sm flex items-center gap-1 hover:scale-105 transition-all";
        btn.innerHTML = `<span>▶️</span> <span>Tự Động Chạy (10s)</span>`;
      }
      window.app?.showToast("⏸️ Đã dừng chế độ tự động lật slide.", "info");
    }
  }

  // 3. Tải Tập Tin Bài Giảng / Tài Liệu Đính Kèm (.pptx, .pdf)
  async downloadCurrentLectureFile() {
    if (!this.currentPreviewLectureId) {
      window.app?.showToast("Không tìm thấy thông tin tập tin bài giảng!", "warning");
      return;
    }

    const lecture = await window.lectureService.getLectureById(this.currentPreviewLectureId);
    if (!lecture || !lecture.fileUrl) {
      window.app?.showToast("Tập tin bài giảng chưa có đường dẫn tải về!", "warning");
      return;
    }

    window.lectureService.incrementDownloadCount(this.currentPreviewLectureId);
    window.app?.showToast("📥 Đang tải tập tin bài giảng về máy...", "success");

    const link = document.createElement("a");
    link.href = lecture.fileUrl;
    link.target = "_blank";
    link.download = lecture.fileName || `${lecture.title}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  closePreviewModal() {
    if (this.isAutoPlayRunning) {
      this.toggleAutoPlaySlide();
    }
    if (document.fullscreenElement) {
      this.toggleFullscreenPreview();
    }
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
    if (this.robotMazeActive) this.toggleInSlideRobotMaze();
    if (this.starAwardActive) this.toggleInSlideStarAward();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  // TÍCH HỢP GIỌNG NỮ AI TIẾNG VIỆT THUYẾT MINH SLIDE TRÌNH CHIẾU
  speakSlideNarration(slideIndex) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const narrations = {
      1: "Chào mừng các em đến với Bài giảng điện tử Tin học chuẩn Bộ Giáo dục và Đào tạo!",
      2: "Các em hãy quan sát 4 bộ phận chính của máy tính để bàn: Màn hình, Thân máy CPU, Bàn phím và Chuột máy tính.",
      3: "Khi ngồi học máy tính, các em chú ý giữ lưng thẳng, giữ khoảng cách mắt từ 50 đến 80 cm.",
      4: "Hãy cùng tham gia thử thách trắc nghiệm: Bộ phận nào được coi là bộ não trung tâm điều khiển của máy tính?",
      5: "Chúc mừng các em đã hoàn thành xuất sắc bài học hôm nay và nhận được 15 sao khen thưởng!"
    };

    const text = narrations[slideIndex];
    if (!text) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "vi-VN";
    utter.rate = this.speechRate || 0.9;
    
    const femaleVoice = this.getVietnameseFemaleVoice();
    if (femaleVoice) utter.voice = femaleVoice;

    window.speechSynthesis.speak(utter);
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
      window.app.showToast("🎨 Đã bật chế độ Bút vẽ & Laser Slide!", "info");
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
  // VIDEO HOẠT HỌA AI THUYẾT MINH
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

            <div class="p-3 bg-amber-400/10 border border-amber-400/40 rounded-xl text-xs text-amber-100 flex items-center gap-2">
              <span class="text-base animate-pulse">🎙️</span>
              <span class="font-semibold italic">"${slide.narrative}"</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-white/20 pt-3 text-xs text-white/80">
          <span>👩‍🏫 Tác giả: <b>${this.activeVideoLecture.authorName}</b></span>
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

  // =========================================================================
  // XUẤT TÀI LIỆU WORD & GÓI ZIP
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

    setTimeout(() => this.downloadLecture(lectureId), 200);
    setTimeout(() => this.downloadLessonPlanDoc(lectureId), 800);
    setTimeout(() => this.downloadWorksheet(lectureId), 1400);
    setTimeout(() => window.app.showToast("🎉 Đã xuất trọn bộ Gói Học Liệu!", "success"), 1800);
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

  // Chuyển đổi và xuất bài giảng thành tập tin PDF (PDF Export for Lectures)
  async downloadLectureAsPDF(lectureId) {
    const lecture = await window.lectureService.getLectureById(lectureId);
    if (!lecture) return;

    window.lectureService.incrementDownloadCount(lectureId);
    window.app?.showToast(`📄 Đang chuẩn bị chuyển đổi file PDF bài giảng...`, "info");

    const url = (lecture.fileUrl || "").toLowerCase();
    const isPdf = url.endsWith(".pdf") || url.includes(".pdf?") || (lecture.fileType || "").toLowerCase() === "pdf";

    // 1. Nếu bài giảng đã là file PDF gốc
    if (isPdf && lecture.fileUrl && lecture.fileUrl !== "#") {
      const a = document.createElement("a");
      a.href = lecture.fileUrl;
      a.target = "_blank";
      a.download = (lecture.fileName || `${lecture.title}.pdf`).replace(/\.pptx?$/i, ".pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.app?.showToast("🎉 Tải file PDF bài giảng thành công!", "success");
      return;
    }

    // 2. Chuyển đổi Slide bài giảng PowerPoint sang tài liệu PDF chuẩn Công văn 2345
    const printWin = window.open("", "_blank");
    if (!printWin) {
      window.app?.showToast("⚠️ Trình duyệt đang chặn Pop-up. Vui lòng cho phép mở Pop-up để xuất file PDF!", "warning");
      return;
    }

    const title = lecture.title || "Bài Giảng Điện Tử Tin Học";
    const topic = lecture.topicName || "Bài Giảng GDPT 2018";
    const grade = lecture.grade || 3;
    const series = lecture.bookSeries || "KNTT";
    const author = lecture.authorName || "Cô Giáo Anh Đào";
    const desc = lecture.description || "Nội dung bài giảng điện tử chuẩn GDPT 2018.";

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>File PDF - ${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
          body { font-family: 'Nunito', sans-serif; background: white; color: #0f172a; margin: 0; padding: 20px; }
          .pdf-page { page-break-after: always; border: 2px solid #cbd5e1; border-radius: 16px; padding: 32px; margin-bottom: 24px; min-height: 520px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; }
          @media print {
            body { padding: 0; }
            .pdf-page { border: none; border-radius: 0; margin: 0; page-break-after: always; height: 100vh; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print bg-cyan-700 text-white p-4 rounded-2xl mb-6 flex items-center justify-between shadow-lg">
          <div>
            <h3 class="font-black text-base flex items-center gap-2"><span>📄</span> <span>XUẤT BÀI GIẢNG DẠNG PDF</span></h3>
            <p class="text-xs text-cyan-100">Bài giảng: <b>${title}</b> (Khối Lớp ${grade} • Bộ Sách ${series})</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-1">
              <span>🖨️</span> <span>Lưu / In Thành File PDF</span>
            </button>
            <button onclick="window.close()" class="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs">
              Đóng
            </button>
          </div>
        </div>

        <!-- TRANG BÌA PDF -->
        <div class="pdf-page bg-gradient-to-br from-cyan-900 to-slate-900 text-white text-center">
          <div class="flex items-center justify-between text-xs text-cyan-200 border-b border-cyan-700/50 pb-3">
            <span class="font-black">📘 TIN HỌC LỚP ${grade} • BỘ SÁCH ${series}</span>
            <span class="font-bold">⭐ BÀI GIẢNG ĐIỆN TỬ CHUẨN GDPT 2018</span>
          </div>
          <div class="my-auto space-y-4 max-w-2xl mx-auto">
            <div class="text-6xl">💻 📊</div>
            <h1 class="text-3xl font-black text-amber-300 leading-tight">${title.toUpperCase()}</h1>
            <p class="text-cyan-100 text-base font-bold">${topic}</p>
            <div class="pt-4 flex items-center justify-center gap-4 text-xs text-slate-300">
              <span class="bg-white/10 px-3 py-1.5 rounded-xl">👩‍🏫 Tác giả: <b>${author}</b></span>
              <span class="bg-white/10 px-3 py-1.5 rounded-xl">🏫 Trường Tiểu Học Vui Học</span>
            </div>
          </div>
          <div class="text-xs text-cyan-300/60 pt-3 border-t border-cyan-700/50">Hệ Thống Web Vui Học • GDPT 2018</div>
        </div>

        <!-- TRANG NỘI DUNG PDF -->
        <div class="pdf-page bg-slate-50">
          <div class="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h2 class="text-lg font-black text-cyan-900">📚 1. NỘI DUNG BÀI HỌC BÀI GIẢNG</h2>
            <span class="text-xs font-bold text-slate-400">Trang 2 / 2</span>
          </div>
          <div class="my-auto space-y-4">
            <div class="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <h3 class="font-black text-cyan-900 text-base flex items-center gap-2"><span>📌</span> <span>Tóm Tắt Bài Học:</span></h3>
              <p class="text-slate-800 leading-relaxed font-bold text-sm">${desc}</p>
            </div>
            <div class="p-6 bg-cyan-50 rounded-2xl border border-cyan-200 space-y-3 shadow-sm">
              <h3 class="font-black text-cyan-900 text-base flex items-center gap-2"><span>💡</span> <span>Yêu Cầu Cần Đạt (Mục Tiêu Bài Học):</span></h3>
              <ul class="list-disc list-inside space-y-1.5 text-xs text-slate-700 font-bold">
                <li>Nắm vững các khái niệm cơ bản trong bài học ${title}.</li>
                <li>Thực hành thành thạo các thao tác Tin học trên máy tính theo chuẩn GDPT 2018.</li>
                <li>Vận dụng linh hoạt kiến thức bài học vào giải quyết các bài tập và tình huống thực tế.</li>
              </ul>
            </div>
          </div>
          <div class="text-xs text-slate-400 pt-3 border-t border-slate-200 text-right">Trang 2 / 2</div>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
    setTimeout(() => {
      printWin.print();
    }, 500);
  }

  // =========================================================================
  // TRÒ CHƠI KHỞI ĐỘNG 3P & ĐỒNG HỒ NHÓM
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
      if (window.ttsService) window.ttsService.playPraise("cheer");
    } else {
      window.app.showToast(`❌ Chưa đúng! ${q.explanation}`, "error");
      if (window.ttsService) window.ttsService.playPraise("encourage");
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

  // =========================================================================
  // XÓA BÀI GIẢNG
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
      window.app.showToast(`🗑️ Đã chuyển bài giảng "${lectureTitle}" vào Thùng Rác (Lưu 30 ngày)!`, "success");
      this.render("main-content-area");
    } else {
      window.app.showToast("Không thể xóa bài giảng, vui lòng thử lại!", "error");
    }
  }

  // =========================================================================
  // QUẢN LÝ THÙNG RÁC BÀI GIẢNG (RECYCLE BIN - MODAL 42)
  // =========================================================================
  openTrashModal() {
    const modal = document.getElementById("lecture-trash-modal");
    if (!modal) return;

    this.renderTrashItems();
    modal.classList.add("active");
  }

  closeTrashModal() {
    const modal = document.getElementById("lecture-trash-modal");
    if (modal) modal.classList.remove("active");
  }

  renderTrashItems() {
    const container = document.getElementById("lecture-trash-list-container");
    if (!container) return;

    const trashed = window.lectureService.getTrashedLectures();
    if (trashed.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 space-y-3 text-slate-400">
          <span class="text-5xl block animate-bounce">🧹</span>
          <p class="font-black text-slate-700 text-sm">Thùng rác hiện đang trống!</p>
          <p class="text-xs text-slate-500">Các bài giảng bị xóa sẽ được lưu giữ tạm thời 30 ngày ở đây trước khi xóa hẳn.</p>
        </div>
      `;
      return;
    }

    const now = Date.now();
    container.innerHTML = trashed.map(l => {
      const deletedAtMs = new Date(l.deletedAt || now).getTime();
      const daysPassed = Math.floor((now - deletedAtMs) / (24 * 60 * 60 * 1000));
      const daysLeft = Math.max(0, 30 - daysPassed);

      return `
        <div class="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge bg-cyan-600 text-white font-black text-[10px]">Môn Tin Lớp ${l.grade}</span>
              <span class="badge bg-slate-200 text-slate-700 font-bold text-[10px]">${l.bookSeries || 'KNTT'}</span>
              <span class="badge bg-rose-100 text-rose-700 font-bold text-[10px]">⏳ Còn ${daysLeft} ngày khôi phục</span>
            </div>
            <h4 class="font-black text-sm text-slate-900 leading-snug">${l.title}</h4>
            <p class="text-[11px] text-slate-500">Tác giả: <b>${l.authorName || 'Cô Giáo Anh Đào'}</b> • File: ${l.fileName || 'BaiGiang.pptx'}</p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button onclick="lecturePortal.restoreLectureFromTrash('${l.id}')" class="btn bg-emerald-600 hover:bg-emerald-500 text-white btn-xs font-black flex items-center gap-1 shadow-sm" title="Khôi phục bài giảng trở lại đúng thư mục lớp gốc">
              <span>🔄</span> <span>Khôi Phục</span>
            </button>
            <button onclick="lecturePortal.permanentlyDeleteFromTrash('${l.id}', '${l.title.replace(/'/g, "\\'")}')" class="btn bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300 btn-xs font-bold flex items-center gap-1" title="Xóa vĩnh viễn không thể hoàn tác">
              <span>❌</span> <span>Xóa Hẳn</span>
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  async restoreLectureFromTrash(id) {
    const res = await window.lectureService.restoreLectureFromTrash(id);
    if (res && res.success) {
      window.app.showToast("🎉 Đã khôi phục bài giảng trở lại thư mục khối lớp thành công!", "success");
      this.renderTrashItems();
      this.render("main-content-area");
    }
  }

  permanentlyDeleteFromTrash(id, title) {
    if (!confirm(`Cô có chắc chắn muốn xóa VĨNH VIỄN bài giảng "${title}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }

    window.lectureService.permanentlyDeleteFromTrash(id);
    window.app.showToast("🗑️ Đã xóa vĩnh viễn bài giảng khỏi hệ thống!", "info");
    this.renderTrashItems();
    this.render("main-content-area");
  }

  emptyTrash() {
    const trashed = window.lectureService.getTrashedLectures();
    if (trashed.length === 0) return;

    if (!confirm("Cô có chắc chắn muốn DỌN SẠCH toàn bộ Thùng rác không? Tất cả bài giảng bị dọn sẽ xóa vĩnh viễn.")) {
      return;
    }

    window.lectureService.emptyTrash();
    window.app.showToast("🧹 Đã dọn sạch thùng rác!", "success");
    this.renderTrashItems();
    this.render("main-content-area");
  }

  // Lưu vĩnh viễn toàn bộ bài giảng hiện có vào máy chủ web và mã nguồn
  async persistAllLectures() {
    const rawAll = await window.lectureService.getAllLectures();
    window.app.showToast("⚡ Đang lưu vĩnh viễn toàn bộ bài giảng vào mã nguồn web...", "info");
    const ok = await window.lectureService.syncToServer(rawAll);
    if (ok) {
      window.app.showToast(`🎉 Đã lưu vĩnh viễn ${rawAll.length} bài giảng vào web thành công! Dữ liệu không bao giờ bị mất!`, "success");
      this.render("main-content-area");
    } else {
      window.lectureService.exportLecturesBackup();
      window.app.showToast(`💾 Đã xuất file sao lưu chứa ${rawAll.length} bài giảng về máy tính của Thầy!`, "success");
    }
  }

  // Khôi phục bài giảng từ file sao lưu JSON
  async handleImportBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const res = await window.lectureService.importLecturesBackup(file);
    if (res.success) {
      window.app.showToast(`🎉 Khôi phục thành công! Đã nạp thêm ${res.count} bài giảng (Tổng cộng: ${res.total} bài).`, "success");
      this.render("main-content-area");
    } else {
      window.app.showToast(`⚠️ Không thể nhập file: ${res.error}`, "danger");
    }
    event.target.value = "";
  }
}

window.lecturePortal = new LecturePortal();
