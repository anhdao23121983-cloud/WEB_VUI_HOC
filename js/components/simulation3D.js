/**
 * SIMULATION 3D COMPONENT - PHÒNG THÍ NGHIỆM 3D & HỌC LIỆU SỐ TIN HỌC TIỂU HỌC 3-5
 * Tích hợp toàn diện:
 * 1. 📘 Bài 7: Sắp Xếp Để Dễ Tìm (Tủ Đồ 3 Tầng & Bàn Học 3D)
 * 2. 📁 Bài 8: Làm Quen Với Thư Mục (Màn Hình Desktop Ảo, Tạo & Quản Lý Folder 3D)
 * 3. ⌨️ Bài 3 & 10: Khám Phá Bàn Phím & Chuột Máy Tính (3D Hardware Simulator)
 * 4. 🤖 Robot Dọn Dẹp Phòng Học Tự Động (AI Cleaning Robot & Block Programming)
 * 5. 🏆 Bảng Xếp Hạng Top 10 Speedrun Sắp Xếp Nhanh Nhất (Leaderboard)
 * 6. 🔊 Voice Narration AI: Thuyết minh giọng đọc Tiếng Việt tự động
 * 7. ⏱️ Thử Thách Đo Tốc Độ Tìm Kiếm (Bừa Bộn vs Ngăn Nắp)
 * 8. 📷 Phòng Chiếu AR Camera Thực Tế Ảo & Chụp Ảnh Lưu Niệm
 * 9. 🔗 Tích hợp liên kết gốc Google Gemini: https://share.gemini.google/NLLCPUG04S6G
 */

class Simulation3D {
  constructor() {
    this.currentLesson = 7; // 7 (Sắp xếp) | 8 (Thư mục) | 10 (Bàn phím & Chuột) | 'robot' (Robot dọn dẹp)
    this.currentMode = "organize"; // 'organize' | 'search_challenge' | 'folder_tree' | 'hardware' | 'robot' | 'leaderboard' | 'ar_camera' | 'gemini_embed'
    this.selectedItem = null;
    this.score = 0;
    this.isVoiceEnabled = true;
    this.searchScenario = "organized"; // 'messy' | 'organized'
    this.arStream = null;

    // Timer Speedrun
    this.speedrunStartTime = null;
    this.speedrunElapsedTime = 0;
    this.speedrunInterval = null;
    this.isSpeedrunActive = false;

    // === DỮ LIỆU BÀI 7: SẮP XẾP ĐỂ DỄ TÌM ===
    this.items = [
      { id: "item_book_tinhoc", name: "Sách Giáo Khoa Tin Học 3", icon: "📘", category: "study", targetShelf: "shelf_study", color: "#2563eb", desc: "Sách học môn Tin học lớp 3 Kết Nối Tri Thức" },
      { id: "item_notebook", name: "Vở Ghi Bài Học Tập", icon: "📓", category: "study", targetShelf: "shelf_study", color: "#3b82f6", desc: "Vở ô ly ghi chép bài giảng trên lớp" },
      { id: "item_pencil_box", name: "Hộp Bút Màu & Thước Kẻ", icon: "✏️", category: "study", targetShelf: "shelf_study", color: "#0284c7", desc: "Hộp đựng bút chì, thước kẻ và gôm tẩy" },
      { id: "item_toy_car", name: "Xe Ô Tô Đồ Chơi 3D", icon: "🚗", category: "toy", targetShelf: "shelf_toy", color: "#ea580c", desc: "Mô hình xe đua đồ chơi màu đỏ cam" },
      { id: "item_teddy_bear", name: "Gấu Bông Dễ Thương", icon: "🧸", category: "toy", targetShelf: "shelf_toy", color: "#d97706", desc: "Chú gấu bông đồ chơi mềm mại" },
      { id: "item_rubik", name: "Khối Rubik 3D 6 Mặt", icon: "🎲", category: "toy", targetShelf: "shelf_toy", color: "#eab308", desc: "Đồ chơi rèn luyện tư duy không gian" },
      { id: "item_soccer_ball", name: "Quả Bóng Đá Mini", icon: "⚽", category: "toy", targetShelf: "shelf_toy", color: "#16a34a", desc: "Bóng đá thể thao rèn luyện sức khỏe" },
      { id: "item_usb", name: "Ổ Đĩa USB Flash Drive", icon: "💾", category: "tech", targetShelf: "shelf_tech", color: "#7c3aed", desc: "Thiết bị lưu trữ tệp tin và bài tập số" },
      { id: "item_mouse", name: "Chuột Máy Tính 3D", icon: "🖱️", category: "tech", targetShelf: "shelf_tech", color: "#9333ea", desc: "Thiết bị điều khiển trỏ chuột máy tính" },
      { id: "item_headphone", name: "Tai Nghe Học Ngoại Ngữ", icon: "🎧", category: "tech", targetShelf: "shelf_tech", color: "#6366f1", desc: "Thiết bị nghe âm thanh bài giảng số" }
    ];
    this.itemLocations = {};
    this.resetItemLocations();

    // === DỮ LIỆU BÀI 8: LÀM QUEN VỚI THƯ MỤC ===
    this.lesson8Folders = [
      { id: "folder_toan", name: "Toan", icon: "📐", color: "blue", files: ["BaiTapToan_Tuan1.docx", "HinhHoc3D.png"] },
      { id: "folder_tiengviet", name: "TiengViet", icon: "📖", color: "amber", files: ["BaiTapDoc_Tap1.docx"] },
      { id: "folder_tinhoc", name: "TinHoc", icon: "💻", color: "emerald", files: ["VeTranhPaint.png", "SoanThaoWord.docx"] },
      { id: "folder_hinhanh", name: "HinhAnh", icon: "🖼️", color: "purple", files: ["AnhLop3A.jpg", "TruongEm.png"] }
    ];
    this.lesson8UnsortedFiles = [
      { id: "file_1", name: "PhieuOnTapToan.docx", icon: "📄", targetFolder: "folder_toan", type: "word", desc: "Phiếu ôn tập môn Toán" },
      { id: "file_2", name: "BaiHat_Lop3.mp3", icon: "🎵", targetFolder: "folder_tiengviet", type: "audio", desc: "Bài hát thiếu nhi Tiếng Việt" },
      { id: "file_3", name: "RobotDoChoi.png", icon: "🖼️", targetFolder: "folder_hinhanh", type: "image", desc: "Ảnh chụp mô hình Robot" },
      { id: "file_4", name: "BaiThucHanhTinHoc.docx", icon: "💻", targetFolder: "folder_tinhoc", type: "word", desc: "Bài thực hành gõ 10 ngón" }
    ];
    this.selectedFile = null;

    // === DỮ LIỆU BÀI 10: BÀN PHÍM & CHUỘT 3D ===
    this.hardwareTab = "keyboard"; // 'keyboard' | 'mouse'
    this.typedText = "";
    this.mouseActionStatus = { move: false, leftClick: false, doubleClick: false, rightClick: false, dragDrop: false };

    // === DỮ LIỆU ROBOT DỌN DẸP 3D ===
    this.robotGridSize = 5;
    this.robotPos = { x: 0, y: 0 };
    this.robotDirection = "right"; // 'up' | 'down' | 'left' | 'right'
    this.robotCargo = null;
    this.robotBoardItems = [
      { id: "r_item_1", name: "Sách Tin Học", icon: "📘", x: 1, y: 1, target: "Tủ Sách" },
      { id: "r_item_2", name: "Xe Đồ Chơi", icon: "🚗", x: 3, y: 0, target: "Tủ Đồ Chơi" },
      { id: "r_item_3", name: "USB Dữ Liệu", icon: "💾", x: 2, y: 3, target: "Tủ Thiết Bị" }
    ];
    this.robotProgram = [];
    this.isRobotRunning = false;

    // Nạp Bảng Xếp Hạng từ LocalStorage
    this.initLeaderboard();
  }

  resetItemLocations() {
    this.items.forEach(item => {
      this.itemLocations[item.id] = "desk";
    });
    this.score = 0;
    this.stopSpeedrun();
  }

  // Khởi tạo bảng xếp hạng mặc định
  initLeaderboard() {
    const saved = localStorage.getItem("exam_3d_speedrun_leaderboard");
    if (!saved) {
      const defaultRecords = [
        { rank: 1, name: "Nguyễn Văn An", className: "3A", time: "12.4s", date: "Hôm nay", badge: "🥇 Vô Địch Tốc Độ" },
        { rank: 2, name: "Trần Thị Mai", className: "3B", time: "14.8s", date: "Hôm nay", badge: "🥈 Á Quân Sắp Xếp" },
        { rank: 3, name: "Lê Hoàng Long", className: "3A", time: "16.2s", date: "Hôm qua", badge: "🥉 Hạng Ba Kỷ Lục" },
        { rank: 4, name: "Phạm Minh Đức", className: "4A", time: "17.5s", date: "Hôm qua", badge: "⭐ Tinh Anh" },
        { rank: 5, name: "Vũ Bảo Ngọc", className: "5B", time: "19.1s", date: "2 ngày trước", badge: "⭐ Xuất Sắc" }
      ];
      localStorage.setItem("exam_3d_speedrun_leaderboard", JSON.stringify(defaultRecords));
    }
  }

  getLeaderboard() {
    return JSON.parse(localStorage.getItem("exam_3d_speedrun_leaderboard")) || [];
  }

  saveNewRecord(timeSec) {
    const records = this.getLeaderboard();
    const user = window.authService?.getUser() || { name: "Nguyễn Văn An", className: "3A" };
    const newEntry = {
      rank: 0,
      name: user.name || "Học Sinh Xuất Sắc",
      className: user.className || "3A",
      time: `${timeSec.toFixed(1)}s`,
      date: "Vừa xong",
      badge: timeSec < 15 ? "🥇 Siêu Cấp Kỷ Lục" : "⭐ Xuất Sắc"
    };

    records.push(newEntry);
    records.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
    const top10 = records.slice(0, 10).map((r, i) => ({ ...r, rank: i + 1 }));
    localStorage.setItem("exam_3d_speedrun_leaderboard", JSON.stringify(top10));
  }

  // =========================================================================
  // SPEEDRUN TIMER
  // =========================================================================
  startSpeedrun() {
    if (this.isSpeedrunActive) return;
    this.isSpeedrunActive = true;
    this.speedrunStartTime = Date.now();
    this.speedrunInterval = setInterval(() => {
      if (this.speedrunStartTime) {
        this.speedrunElapsedTime = (Date.now() - this.speedrunStartTime) / 1000;
        const timerEl = document.getElementById("sim-speedrun-timer");
        if (timerEl) timerEl.innerText = `${this.speedrunElapsedTime.toFixed(1)}s`;
      }
    }, 100);
  }

  stopSpeedrun() {
    if (this.speedrunInterval) {
      clearInterval(this.speedrunInterval);
      this.speedrunInterval = null;
    }
    this.isSpeedrunActive = false;
  }

  // =========================================================================
  // SOUND EFFECTS & VOICE NARRATION AI
  // =========================================================================
  toggleVoice() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    if (this.isVoiceEnabled) {
      this.speak("Đã bật thuyết minh giọng nói Tiếng Việt!");
      window.app.showToast("🔊 Đã bật giọng nói thuyết minh AI!", "success");
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      window.app.showToast("🔇 Đã tắt giọng nói thuyết minh!", "info");
    }
    this.render("main-content-area");
  }

  speak(text) {
    if (!this.isVoiceEnabled) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Lỗi phát giọng nói:", e);
    }
  }

  playKeySound(freq = 600) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  // =========================================================================
  // GIAO DIỆN CHÍNH (RENDER)
  // =========================================================================
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let titleText = "BÀI 7: SẮP XẾP ĐỂ DỄ TÌM";
    if (this.currentLesson === 8) titleText = "BÀI 8: LÀM QUEN VỚI THƯ MỤC";
    if (this.currentLesson === 10) titleText = "BÀI 3 & 10: BÀN PHÍM & CHUỘT MÁY TÍNH 3D";
    if (this.currentLesson === 'robot') titleText = "ROBOT DỌN DẸP PHÒNG HỌC TỰ ĐỘNG (AI SIMULATOR)";

    container.innerHTML = `
      <div class="space-y-6 animate-pop">
        <!-- Banner Thí Nghiệm Đa Năng -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge badge-amber font-black">🧪 PHÒNG THÍ NGHIỆM 3D & AR ẢO</span>
              <span class="badge bg-white/20 text-white font-bold">GDPT 2018 • HỌC LIỆU SỐ TOÀN DIỆN</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">${titleText}</h2>
            <p class="text-cyan-100 text-xs md:text-sm max-w-2xl">
              Hệ sinh thái thí nghiệm 3D tương tác giúp các em nắm vững kỹ năng phân loại, quản lý dữ liệu, thao tác phần cứng và tư duy lập trình robot!
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="simulation3D.toggleVoice()" class="btn ${this.isVoiceEnabled ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/20 text-white'} text-xs py-2 px-3 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-md hover:scale-105 transition-all">
              <span>${this.isVoiceEnabled ? '🔊' : '🔇'}</span> 
              <span>${this.isVoiceEnabled ? 'Thuyết Minh: BẬT' : 'Thuyết Minh: TẮT'}</span>
            </button>

            <button onclick="simulation3D.switchMode('leaderboard')" class="btn ${this.currentMode === 'leaderboard' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/20 text-white'} text-xs py-2 px-3 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-md hover:scale-105 transition-all">
              <span>🏆</span> <span>Top 10 Kỷ Lục</span>
            </button>

            <button onclick="simulation3D.openFullScreenModal()" class="btn btn-amber btn-sm font-black shadow-xl flex items-center gap-1.5 hover:scale-105 transition-all">
              <span>📺</span> <span>Toàn Màn Hình</span>
            </button>
          </div>
        </div>

        <!-- 4 Nút Chọn Chủ Đề Bài Thí Nghiệm -->
        <div class="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-slate-500 uppercase">Chọn Bài Thí Nghiệm:</span>
            
            <button onclick="simulation3D.selectLesson(7)" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 7 ? 'bg-indigo-600 text-white shadow-md scale-102 ring-2 ring-indigo-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📘</span> <span>Bài 7: Sắp Xếp Để Dễ Tìm</span>
            </button>

            <button onclick="simulation3D.selectLesson(8)" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 8 ? 'bg-purple-600 text-white shadow-md scale-102 ring-2 ring-purple-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📁</span> <span>Bài 8: Khám Phá Thư Mục</span>
            </button>

            <button onclick="simulation3D.selectLesson(10)" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 10 ? 'bg-blue-600 text-white shadow-md scale-102 ring-2 ring-blue-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>⌨️</span> <span>Bài 3 & 10: Bàn Phím & Chuột 3D</span>
            </button>

            <button onclick="simulation3D.selectLesson('robot')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 'robot' ? 'bg-amber-600 text-white shadow-md scale-102 ring-2 ring-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🤖</span> <span>Robot Dọn Dẹp Tự Động</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="simulation3D.openLessonPlanModal()" class="btn btn-outline btn-xs font-black text-emerald-700 bg-emerald-50 border-emerald-300 flex items-center gap-1">
              <span>📑</span> <span>Giáo Án CV 2345</span>
            </button>
          </div>
        </div>

        <!-- Thanh Tab Chuyển Đổi Chế Độ Phụ -->
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
          ${this.renderSubTabs()}
        </div>

        <!-- Khung Nội Dung Chính Của Thí Nghiệm -->
        <div id="sim-main-viewport" class="space-y-6">
          ${this.renderCurrentModeView()}
        </div>
      </div>
    `;
  }

  renderSubTabs() {
    if (this.currentLesson === 7) {
      return `
        <button onclick="simulation3D.switchMode('organize')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'organize' ? 'bg-cyan-700 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
          <span>🎮 1. Thí Nghiệm Phân Loại 3D</span>
          <span class="badge ${this.currentMode === 'organize' ? 'bg-white/25 text-white' : 'badge-cyan'} text-[10px]">${this.getOrganizedCount()}/10</span>
        </button>
        <button onclick="simulation3D.switchMode('search_challenge')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'search_challenge' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
          <span>⏱️ 2. Thử Thách Tìm Kiếm Nhanh</span>
        </button>
        <button onclick="simulation3D.switchMode('folder_tree')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'folder_tree' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
          <span>💻 3. Cây Thư Mục Máy Tính</span>
        </button>
        <button onclick="simulation3D.switchMode('ar_camera')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'ar_camera' ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
          <span>📷 Phòng Chiếu AR Camera</span>
        </button>
      `;
    } else if (this.currentLesson === 8) {
      return `
        <button onclick="simulation3D.switchMode('folder_manager')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'folder_manager' ? 'bg-purple-700 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
          <span>🖥️ 1. Màn Hình Desktop Ảo</span>
        </button>
        <button onclick="simulation3D.switchMode('folder_tree')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'folder_tree' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
          <span>🌳 2. Cây Phân Cấp Thư Mục</span>
        </button>
      `;
    } else if (this.currentLesson === 10) {
      return `
        <button onclick="simulation3D.setHardwareTab('keyboard')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.hardwareTab === 'keyboard' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
          <span>⌨️ Bàn Phím 3D & 10 Ngón</span>
        </button>
        <button onclick="simulation3D.setHardwareTab('mouse')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.hardwareTab === 'mouse' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
          <span>🖱️ 5 Thao Tác Chuột 3D</span>
        </button>
      `;
    } else if (this.currentLesson === 'robot') {
      return `
        <button onclick="simulation3D.switchMode('robot')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 bg-amber-600 text-white shadow-md">
          <span>🤖 Bàn Cờ Dọn Dẹp 3D & Lập Trình Khối Lệnh</span>
        </button>
      `;
    }
  }

  selectLesson(lessonNum) {
    this.currentLesson = lessonNum;
    if (lessonNum === 7) {
      this.currentMode = "organize";
      this.speak("Chào mừng các em đến với Bài 7: Sắp xếp để dễ tìm!");
    } else if (lessonNum === 8) {
      this.currentMode = "folder_manager";
      this.speak("Chào mừng các em đến với Bài 8: Khám phá thư mục máy tính!");
    } else if (lessonNum === 10) {
      this.currentMode = "hardware";
      this.hardwareTab = "keyboard";
      this.speak("Khám phá Bàn phím và Chuột máy tính 3D tương tác!");
    } else if (lessonNum === 'robot') {
      this.currentMode = "robot";
      this.speak("Chào mừng các em đến với Thí nghiệm Robot dọn dẹp phòng học tự động!");
    }
    this.render("main-content-area");
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (mode === "leaderboard") {
      this.speak("Bảng xếp hạng Top 10 học sinh sắp xếp nhanh nhất!");
    }
    this.render("main-content-area");
  }

  renderCurrentModeView() {
    if (this.currentMode === "organize") return this.renderOrganize3DView();
    if (this.currentMode === "search_challenge") return this.renderSearchChallengeView();
    if (this.currentMode === "folder_tree") return this.renderFolderTree3DView();
    if (this.currentMode === "folder_manager") return this.renderFolderManagerView();
    if (this.currentMode === "hardware") return this.renderHardware3DView();
    if (this.currentMode === "robot") return this.renderRobot3DView();
    if (this.currentMode === "leaderboard") return this.renderLeaderboardView();
    if (this.currentMode === "ar_camera") return this.renderARCameraView();
    if (this.currentMode === "gemini_embed") return this.renderGeminiEmbedView();
  }

  // =========================================================================
  // 1. BÀI 7: PHÂN LOẠI & SẮP XẾP ĐỒ VẬT 3D + SPEEDRUN TIMER
  // =========================================================================
  renderOrganize3DView() {
    const studyItems = this.items.filter(i => this.itemLocations[i.id] === "shelf_study");
    const toyItems = this.items.filter(i => this.itemLocations[i.id] === "shelf_toy");
    const techItems = this.items.filter(i => this.itemLocations[i.id] === "shelf_tech");
    const deskItems = this.items.filter(i => this.itemLocations[i.id] === "desk");

    const totalOrganized = 10 - deskItems.length;
    const progressPct = (totalOrganized / 10) * 100;

    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Cột Trái: Kệ Tủ 3 Tầng -->
        <div class="lg:col-span-2 space-y-4">
          <div class="glass-card p-5 border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 space-y-4 shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <span class="badge badge-cyan font-black text-[10px]">TỦ ĐỒ 3 TẦNG THÔNG MINH</span>
                <h3 class="text-base font-black text-slate-900 mt-0.5">🏢 KỆ TỦ PHÂN LOẠI GIA ĐÌNH & HỌC TẬP</h3>
              </div>
              <div class="text-right">
                <div class="flex items-center gap-2 justify-end">
                  <span class="text-xs font-bold text-rose-600 animate-pulse">⏱️ Speedrun:</span>
                  <span id="sim-speedrun-timer" class="font-mono font-black text-sm bg-rose-100 text-rose-800 px-2 py-0.5 rounded-lg">
                    ${this.speedrunElapsedTime.toFixed(1)}s
                  </span>
                </div>
                <p class="text-xs font-black text-indigo-700 mt-0.5">${totalOrganized} / 10 Món (${progressPct.toFixed(0)}%)</p>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div class="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-700" style="width: ${progressPct}%"></div>
            </div>

            <!-- 3 Ngăn Tủ Trực Quan -->
            <div class="space-y-4 pt-2">
              <!-- TẦNG 1 -->
              <div onclick="simulation3D.placeSelectedItem('shelf_study')" class="p-4 rounded-2xl border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50/50 space-y-2.5 cursor-pointer hover:border-blue-600 transition-all shadow-sm hover:shadow-md group">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl p-1.5 bg-blue-600 text-white rounded-xl shadow-md">📚</span>
                    <div>
                      <h4 class="font-black text-slate-900 text-xs md:text-sm group-hover:text-blue-700">TẦNG 1: NGĂN SÁCH VỞ & HỌC TẬP</h4>
                      <p class="text-[11px] text-slate-500 font-semibold">Chứa: Sách giáo khoa, vở ghi, hộp bút màu, thước kẻ...</p>
                    </div>
                  </div>
                  <span class="badge bg-blue-600 text-white text-[10px] font-black">${studyItems.length} Món</span>
                </div>
                <div class="min-h-[50px] p-2 bg-white/80 rounded-xl border border-blue-200 flex items-center gap-2 flex-wrap">
                  ${studyItems.length === 0 ? `<span class="text-[11px] text-slate-400 italic px-2">Ngăn này đang trống. Hãy chọn sách vở xếp vào đây!</span>` : studyItems.map(item => `
                    <div class="px-2.5 py-1.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 font-black text-xs flex items-center gap-1.5 shadow-sm animate-pop">
                      <span>${item.icon}</span> <span>${item.name}</span>
                      <button onclick="event.stopPropagation(); simulation3D.returnToDesk('${item.id}')" class="text-blue-400 hover:text-rose-600 font-bold ml-1">✕</button>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- TẦNG 2 -->
              <div onclick="simulation3D.placeSelectedItem('shelf_toy')" class="p-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50/50 space-y-2.5 cursor-pointer hover:border-amber-600 transition-all shadow-sm hover:shadow-md group">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl p-1.5 bg-amber-600 text-white rounded-xl shadow-md">🧸</span>
                    <div>
                      <h4 class="font-black text-slate-900 text-xs md:text-sm group-hover:text-amber-700">TẦNG 2: NGĂN ĐỒ CHƠI & THỂ THAO</h4>
                      <p class="text-[11px] text-slate-500 font-semibold">Chứa: Ô tô đồ chơi, gấu bông, khối Rubik, bóng đá...</p>
                    </div>
                  </div>
                  <span class="badge bg-amber-600 text-white text-[10px] font-black">${toyItems.length} Món</span>
                </div>
                <div class="min-h-[50px] p-2 bg-white/80 rounded-xl border border-amber-200 flex items-center gap-2 flex-wrap">
                  ${toyItems.length === 0 ? `<span class="text-[11px] text-slate-400 italic px-2">Ngăn này đang trống. Hãy chọn đồ chơi xếp vào đây!</span>` : toyItems.map(item => `
                    <div class="px-2.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs flex items-center gap-1.5 shadow-sm animate-pop">
                      <span>${item.icon}</span> <span>${item.name}</span>
                      <button onclick="event.stopPropagation(); simulation3D.returnToDesk('${item.id}')" class="text-amber-400 hover:text-rose-600 font-bold ml-1">✕</button>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- TẦNG 3 -->
              <div onclick="simulation3D.placeSelectedItem('shelf_tech')" class="p-4 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50/50 space-y-2.5 cursor-pointer hover:border-emerald-600 transition-all shadow-sm hover:shadow-md group">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl p-1.5 bg-emerald-600 text-white rounded-xl shadow-md">💾</span>
                    <div>
                      <h4 class="font-black text-slate-900 text-xs md:text-sm group-hover:text-emerald-700">TẦNG 3: NGĂN THIẾT BỊ SỐ & TIN HỌC</h4>
                      <p class="text-[11px] text-slate-500 font-semibold">Chứa: Thẻ nhớ USB, chuột máy tính, tai nghe học tập...</p>
                    </div>
                  </div>
                  <span class="badge bg-emerald-600 text-white text-[10px] font-black">${techItems.length} Món</span>
                </div>
                <div class="min-h-[50px] p-2 bg-white/80 rounded-xl border border-emerald-200 flex items-center gap-2 flex-wrap">
                  ${techItems.length === 0 ? `<span class="text-[11px] text-slate-400 italic px-2">Ngăn này đang trống. Hãy chọn thiết bị số xếp vào đây!</span>` : techItems.map(item => `
                    <div class="px-2.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-xs flex items-center gap-1.5 shadow-sm animate-pop">
                      <span>${item.icon}</span> <span>${item.name}</span>
                      <button onclick="event.stopPropagation(); simulation3D.returnToDesk('${item.id}')" class="text-emerald-400 hover:text-rose-600 font-bold ml-1">✕</button>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>

            ${totalOrganized === 10 ? `
              <div class="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border-2 border-emerald-400 rounded-2xl text-center space-y-3 animate-pop">
                <span class="text-5xl block animate-bounce">🏆</span>
                <h4 class="text-lg font-black text-emerald-900">KỶ LỤC HOÀN THÀNH: ${this.speedrunElapsedTime.toFixed(1)} GIÂY!</h4>
                <p class="text-xs text-emerald-800">Chúc mừng em đã ghi tên vào <b>Bảng Vàng Top 10 Speedrun</b> của trường!</p>
                <div class="pt-1 flex items-center justify-center gap-2 flex-wrap">
                  <button onclick="simulation3D.switchMode('leaderboard')" class="btn btn-amber btn-sm font-black shadow-md">
                    🏆 Xem Bảng Xếp Hạng Top 10
                  </button>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Cột Phải: Bàn Học -->
        <div class="space-y-4">
          <div class="glass-card p-5 border-2 border-amber-200 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 space-y-4 shadow-md">
            <div class="flex items-center justify-between">
              <span class="badge badge-amber font-black text-[10px]">BÀN HỌC BAN ĐẦU</span>
              <span class="font-bold text-slate-500 text-xs">Còn <b>${deskItems.length}</b> món</span>
            </div>

            <div>
              <h3 class="text-base font-black text-slate-900">🪑 ĐỒ VẬT TRÊN BÀN HỌC</h3>
              <p class="text-xs text-slate-500">Bấm chọn đồ vật, rồi bấm vào Ngăn Tủ thích hợp:</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 max-h-96 overflow-y-auto pr-1">
              ${deskItems.length === 0 ? `
                <div class="text-center py-8 glass-card border-dashed text-slate-400 space-y-1">
                  <span class="text-3xl block">✨</span>
                  <p class="font-bold text-emerald-700 text-xs">Bàn học đã hoàn toàn gọn gàng sạch sẽ!</p>
                </div>
              ` : deskItems.map(item => {
                const isSelected = this.selectedItem?.id === item.id;
                return `
                  <div onclick="simulation3D.selectDeskItem('${item.id}')" class="p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected ? 'border-cyan-600 bg-cyan-50 shadow-md ring-2 ring-cyan-300' : 'border-slate-200 bg-white hover:border-slate-400 shadow-sm'}">
                    <div class="flex items-center gap-2.5">
                      <span class="text-2xl p-1 bg-slate-100 rounded-xl">${item.icon}</span>
                      <div>
                        <h5 class="text-xs font-black text-slate-900 leading-tight">${item.name}</h5>
                        <p class="text-[10px] text-slate-500 line-clamp-1">${item.desc}</p>
                      </div>
                    </div>
                    ${isSelected ? `
                      <span class="badge bg-cyan-700 text-white text-[10px] font-black shrink-0 animate-pulse">Đang Chọn</span>
                    ` : `<span class="text-xs text-slate-400 font-bold shrink-0">Chọn ➔</span>`}
                  </div>
                `;
              }).join("")}
            </div>

            <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button onclick="simulation3D.autoSortAll()" class="btn btn-outline btn-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200">
                ✨ Tự Động Xếp Nhanh
              </button>
              <button onclick="simulation3D.resetAll()" class="btn btn-outline btn-xs font-bold text-slate-600 hover:bg-slate-200">
                🔄 Làm Lại
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  selectDeskItem(itemId) {
    this.startSpeedrun();
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      this.selectedItem = item;
      this.speak(`Em đã chọn: ${item.name}. Hãy xếp vào ngăn tủ thích hợp!`);
      window.app.showToast(`👉 Đã chọn: "${item.name}". Bấm vào Ngăn Tủ thích hợp!`, "info");
      this.render("main-content-area");
    }
  }

  placeSelectedItem(shelfId) {
    if (!this.selectedItem) {
      window.app.showToast("Vui lòng bấm chọn một món đồ trên bàn học trước!", "warning");
      return;
    }

    const item = this.selectedItem;
    if (item.targetShelf === shelfId) {
      this.itemLocations[item.id] = shelfId;
      this.selectedItem = null;
      this.score += 10;
      this.speak(`Chính xác! Đã xếp ${item.name} vào đúng ngăn!`);
      window.app.showToast(`✅ Chính xác! Đã xếp "${item.name}" vào đúng ngăn! (+10 Điểm)`, "success");

      if (this.getOrganizedCount() === 10) {
        this.stopSpeedrun();
        this.saveNewRecord(this.speedrunElapsedTime);
        setTimeout(() => {
          this.speak(`Tuyệt vời! Em đã hoàn thành sắp xếp trong ${this.speedrunElapsedTime.toFixed(1)} giây!`);
        }, 600);
      }

      this.render("main-content-area");
    } else {
      this.speak(`Chưa đúng rồi! ${item.name} không thuộc nhóm ngăn tủ này. Em hãy thử lại nhé!`);
      window.app.showToast(`❌ Chưa chính xác! "${item.name}" không thuộc nhóm ngăn tủ này.`, "error");
    }
  }

  returnToDesk(itemId) {
    this.itemLocations[itemId] = "desk";
    window.app.showToast("Đã chuyển đồ vật trở lại bàn học!", "info");
    this.render("main-content-area");
  }

  autoSortAll() {
    this.items.forEach(item => {
      this.itemLocations[item.id] = item.targetShelf;
    });
    this.selectedItem = null;
    this.score = 100;
    this.stopSpeedrun();
    this.speak("Đã tự động sắp xếp toàn bộ 10 đồ vật vào đúng ngăn tủ!");
    window.app.showToast("✨ Đã tự động sắp xếp toàn bộ 10 đồ vật!", "success");
    this.render("main-content-area");
  }

  resetAll() {
    this.resetItemLocations();
    this.selectedItem = null;
    this.speedrunElapsedTime = 0;
    this.speak("Đã khôi phục trạng thái ban đầu!");
    window.app.showToast("🔄 Đã khôi phục trạng thái ban đầu!", "info");
    this.render("main-content-area");
  }

  // =========================================================================
  // 2. BẢNG XẾP HẠNG TOP 10 SPEEDRUN
  // =========================================================================
  renderLeaderboardView() {
    const records = this.getLeaderboard();

    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-2xl">
        <div class="text-center space-y-2">
          <span class="badge badge-amber font-black text-xs">🏆 BẢNG VÀNG KỶ LỤC TỐC ĐỘ</span>
          <h3 class="text-2xl md:text-3xl font-black text-slate-900">TOP 10 HỌC SINH SẮP XẾP NHANH NHẤT</h3>
          <p class="text-xs text-slate-600 max-w-xl mx-auto">
            Vinh danh các Hiệp sĩ Công nghệ hoàn thành bài thí nghiệm phân loại và sắp xếp đồ vật với thời gian ngắn nhất!
          </p>
        </div>

        <!-- Danh sách Top 10 -->
        <div class="space-y-2.5">
          ${records.map((r, i) => {
            let bgClass = "bg-white border-slate-200";
            let rankBadge = `<span class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center">${r.rank}</span>`;

            if (i === 0) {
              bgClass = "bg-gradient-to-r from-amber-500/15 via-yellow-50 to-white border-amber-400 ring-2 ring-amber-300";
              rankBadge = `<span class="w-9 h-9 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-md">🥇</span>`;
            } else if (i === 1) {
              bgClass = "bg-gradient-to-r from-slate-200/40 to-white border-slate-300";
              rankBadge = `<span class="w-9 h-9 rounded-2xl bg-slate-400 text-white font-black text-lg flex items-center justify-center shadow-md">🥈</span>`;
            } else if (i === 2) {
              bgClass = "bg-gradient-to-r from-amber-700/10 to-white border-amber-600/30";
              rankBadge = `<span class="w-9 h-9 rounded-2xl bg-amber-700 text-white font-black text-lg flex items-center justify-center shadow-md">🥉</span>`;
            }

            return `
              <div class="p-3.5 rounded-2xl border-2 ${bgClass} flex items-center justify-between gap-4 transition-all hover:scale-101 shadow-sm">
                <div class="flex items-center gap-3">
                  ${rankBadge}
                  <div>
                    <h4 class="font-black text-slate-900 text-sm flex items-center gap-2">
                      <span>${r.name}</span>
                      <span class="badge badge-cyan text-[10px]">Lớp ${r.className}</span>
                    </h4>
                    <p class="text-[10px] text-slate-400 font-semibold">${r.badge} • ${r.date}</p>
                  </div>
                </div>

                <div class="text-right">
                  <span class="font-mono text-base font-black text-indigo-700">${r.time}</span>
                  <p class="text-[9px] text-emerald-600 font-bold">100 Điểm ⭐</p>
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <div class="text-center pt-2 flex items-center justify-center gap-3">
          <button onclick="simulation3D.selectLesson(7)" class="btn btn-primary btn-md font-black bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg">
            🎮 Bắt Đầu Thử Thách Để Phá Kỷ Lục
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 3. BÀI 3 & 10: KHÁM PHÁ BÀN PHÍM & CHUỘT 3D (HARDWARE SIMULATOR)
  // =========================================================================
  setHardwareTab(tab) {
    this.hardwareTab = tab;
    if (tab === "keyboard") {
      this.speak("Khám phá bàn phím máy tính và quy tắc gõ 10 ngón!");
    } else {
      this.speak("Thực hành 5 thao tác chuột máy tính!");
    }
    this.render("main-content-area");
  }

  renderHardware3DView() {
    if (this.hardwareTab === "keyboard") {
      return this.renderKeyboard3D();
    } else {
      return this.renderMouse3D();
    }
  }

  renderKeyboard3D() {
    const homeRowKeys = [
      { key: "A", finger: "Ngón út trái" },
      { key: "S", finger: "Ngón áp út trái" },
      { key: "D", finger: "Ngón giữa trái" },
      { key: "F", finger: "Ngón trỏ trái (Gờ nổi)", bump: true },
      { key: "G", finger: "Ngón trỏ trái" },
      { key: "H", finger: "Ngón trỏ phải" },
      { key: "J", finger: "Ngón trỏ phải (Gờ nổi)", bump: true },
      { key: "K", finger: "Ngón giữa phải" },
      { key: "L", finger: "Ngón áp út phải" },
      { key: ";", finger: "Ngón út phải" }
    ];

    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-5xl mx-auto shadow-2xl">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge badge-cyan font-black text-xs">⌨️ PHẦN CỨNG MÁY TÍNH 3D</span>
            <h3 class="text-2xl font-black text-slate-900 mt-1">BÀN PHÍM 3D & QUY TẮC ĐẶT 10 NGÓN TAY</h3>
            <p class="text-xs text-slate-500">Bấm phím trên màn hình để nghe âm thanh phím cơ và quan sát vị trí đặt ngón tay trên hàng phím cơ sở!</p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="simulation3D.clearTypedText()" class="btn btn-outline btn-xs font-bold text-slate-600">
              🗑️ Xóa Chữ
            </button>
          </div>
        </div>

        <!-- Màn hình LED hiển thị chữ vừa gõ -->
        <div class="p-4 bg-slate-950 rounded-2xl border-2 border-cyan-400 font-mono text-emerald-400 text-lg md:text-xl shadow-inner min-h-[60px] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">Ký tự:</span>
            <span>${this.typedText || "_"}</span>
          </div>
          <span class="text-xs text-slate-500 animate-pulse">● READY</span>
        </div>

        <!-- HÀNG PHÍM CƠ SỞ (HOME ROW) NỔI BẬT -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="badge bg-indigo-600 text-white font-black text-xs">HÀNG PHÍM CƠ SỞ (QUAN TRỌNG NHẤT)</span>
            <span class="text-xs text-slate-500 font-bold">Hai phím mốc F & J có gờ nổi</span>
          </div>

          <div class="grid grid-cols-5 sm:grid-cols-10 gap-2">
            ${homeRowKeys.map(k => `
              <button onclick="simulation3D.pressKey('${k.key}', '${k.finger}')" class="p-4 rounded-2xl border-b-4 border-slate-700 bg-gradient-to-b from-slate-100 to-slate-200 hover:from-cyan-100 hover:to-cyan-200 active:border-b-0 active:translate-y-1 transition-all shadow-md text-center group ${k.bump ? 'ring-2 ring-amber-400 bg-amber-50' : ''}">
                <span class="text-xl md:text-2xl font-black text-slate-900 block group-hover:text-cyan-700">${k.key}</span>
                ${k.bump ? `<span class="text-[9px] font-bold text-amber-700 bg-amber-200 px-1 rounded block mt-1">Gờ nổi</span>` : ''}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- CÁC PHÍM CHỨC NĂNG ĐẶC BIỆT -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button onclick="simulation3D.pressSpecialKey('SPACE', 'Phím Cách (Spacebar): Tạo khoảng trắng giữa các từ, do 2 ngón tay cái phụ trách!')" class="p-3 bg-indigo-50 border-2 border-indigo-300 rounded-2xl text-left hover:border-indigo-500 transition-all shadow-sm">
            <span class="badge bg-indigo-600 text-white text-[10px] font-black">SPACEBAR</span>
            <h5 class="text-xs font-black text-indigo-950 mt-1">Phím Cách</h5>
            <p class="text-[10px] text-slate-500">Tạo dấu cách giữa 2 từ</p>
          </button>

          <button onclick="simulation3D.pressSpecialKey('ENTER', 'Phím Enter: Dùng để xuống dòng mới hoặc thực hiện câu lệnh!')" class="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm">
            <span class="badge bg-emerald-600 text-white text-[10px] font-black">ENTER</span>
            <h5 class="text-xs font-black text-emerald-950 mt-1">Phím Xuống Dòng</h5>
            <p class="text-[10px] text-slate-500">Bắt đầu đoạn văn mới</p>
          </button>

          <button onclick="simulation3D.pressSpecialKey('BACKSPACE', 'Phím Backspace: Dùng để xóa ký tự ở phía bên trái con trỏ soạn thảo!')" class="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl text-left hover:border-rose-500 transition-all shadow-sm">
            <span class="badge bg-rose-600 text-white text-[10px] font-black">BACKSPACE</span>
            <h5 class="text-xs font-black text-rose-950 mt-1">Phím Xóa Lùi</h5>
            <p class="text-[10px] text-slate-500">Xóa ký tự liền trước</p>
          </button>

          <button onclick="simulation3D.pressSpecialKey('CAPS_LOCK', 'Phím Caps Lock: Bật hoặc tắt chế độ viết hoa toàn bộ ký tự!')" class="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left hover:border-amber-500 transition-all shadow-sm">
            <span class="badge bg-amber-600 text-white text-[10px] font-black">CAPS LOCK</span>
            <h5 class="text-xs font-black text-amber-950 mt-1">Phím Viết Hoa</h5>
            <p class="text-[10px] text-slate-500">Khóa chữ in hoa</p>
          </button>
        </div>
      </div>
    `;
  }

  pressKey(key, finger) {
    this.playKeySound(700);
    this.typedText += key;
    this.speak(`Phím ${key}, do ${finger} gõ.`);
    window.app.showToast(`⌨️ Gõ phím [${key}] - Vị trí: ${finger}`, "info");
    this.render("main-content-area");
  }

  pressSpecialKey(keyName, desc) {
    this.playKeySound(500);
    if (keyName === "SPACE") this.typedText += " ";
    if (keyName === "BACKSPACE") this.typedText = this.typedText.slice(0, -1);
    if (keyName === "ENTER") this.typedText += "\n";
    this.speak(desc);
    window.app.showToast(`⌨️ ${desc}`, "success");
    this.render("main-content-area");
  }

  clearTypedText() {
    this.typedText = "";
    this.render("main-content-area");
  }

  renderMouse3D() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-2xl">
        <div class="text-center space-y-2">
          <span class="badge badge-indigo font-black text-xs">🖱️ PHẦN CỨNG MÁY TÍNH 3D</span>
          <h3 class="text-2xl font-black text-slate-900">CHUỘT MÁY TÍNH 3D & 5 THAO TÁC CƠ BẢN</h3>
          <p class="text-xs text-slate-600 max-w-xl mx-auto">
            Học sinh thực hành 5 thao tác điều khiển chuột theo đúng chuẩn chương trình SGK Tin học 3.
          </p>
        </div>

        <!-- 5 THẺ THAO TÁC CHUỘT -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div onclick="simulation3D.doMouseAction('move')" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-cyan-500 cursor-pointer transition-all shadow-sm space-y-2">
            <span class="text-3xl">🎯</span>
            <h4 class="font-black text-sm text-slate-900">1. Di chuyển chuột (Move)</h4>
            <p class="text-xs text-slate-500">Giữ chuột trên mặt phẳng và di chuyển theo hướng mong muốn.</p>
          </div>

          <div onclick="simulation3D.doMouseAction('leftClick')" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-500 cursor-pointer transition-all shadow-sm space-y-2">
            <span class="text-3xl">👆</span>
            <h4 class="font-black text-sm text-slate-900">2. Nhấp chuột trái (Click)</h4>
            <p class="text-xs text-slate-500">Dùng ngón trỏ nhấn nhanh nút chuột trái một lần rồi thả tay.</p>
          </div>

          <div onclick="simulation3D.doMouseAction('doubleClick')" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-purple-500 cursor-pointer transition-all shadow-sm space-y-2">
            <span class="text-3xl">✌️</span>
            <h4 class="font-black text-sm text-slate-900">3. Nhấp đúp chuột (Double Click)</h4>
            <p class="text-xs text-slate-500">Nhấn nhanh nút chuột trái hai lần liên tiếp để mở tệp tin.</p>
          </div>

          <div onclick="simulation3D.doMouseAction('rightClick')" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-amber-500 cursor-pointer transition-all shadow-sm space-y-2">
            <span class="text-3xl">👉</span>
            <h4 class="font-black text-sm text-slate-900">4. Nhấp chuột phải (Right Click)</h4>
            <p class="text-xs text-slate-500">Dùng ngón giữa nhấn nút chuột phải để mở menu tùy chọn.</p>
          </div>

          <div onclick="simulation3D.doMouseAction('dragDrop')" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-emerald-500 cursor-pointer transition-all shadow-sm space-y-2">
            <span class="text-3xl">✋</span>
            <h4 class="font-black text-sm text-slate-900">5. Kéo thả chuột (Drag & Drop)</h4>
            <p class="text-xs text-slate-500">Nhấn giữ nút trái, di chuyển đồ vật đến vị trí mới rồi thả tay.</p>
          </div>
        </div>
      </div>
    `;
  }

  doMouseAction(actionType) {
    this.playKeySound(800);
    if (actionType === "move") {
      this.speak("Thao tác 1: Di chuyển chuột trên mặt bàn.");
      window.app.showToast("🎯 Thao tác: Di chuyển con trỏ chuột!", "info");
    } else if (actionType === "leftClick") {
      this.speak("Thao tác 2: Nhấp chuột trái để chọn đối tượng.");
      window.app.showToast("👆 Thao tác: Nhấp chuột trái!", "success");
    } else if (actionType === "doubleClick") {
      this.speak("Thao tác 3: Nhấp đúp chuột trái hai lần để mở tệp tin.");
      window.app.showToast("✌️ Thao tác: Nhấp đúp chuột!", "success");
    } else if (actionType === "rightClick") {
      this.speak("Thao tác 4: Nhấp chuột phải để mở bảng chọn menu.");
      window.app.showToast("👉 Thao tác: Nhấp chuột phải!", "success");
    } else if (actionType === "dragDrop") {
      this.speak("Thao tác 5: Nhấn giữ chuột trái và kéo thả đối tượng.");
      window.app.showToast("✋ Thao tác: Kéo thả chuột!", "success");
    }
  }

  // =========================================================================
  // 4. ROBOT DỌN DẸP PHÒNG HỌC TỰ ĐỘNG (AI CLEANING ROBOT SIMULATOR)
  // =========================================================================
  renderRobot3DView() {
    const size = this.robotGridSize;
    let gridHtml = "";

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isRobotHere = this.robotPos.x === c && this.robotPos.y === r;
        const itemHere = this.robotBoardItems.find(it => it.x === c && it.y === r);
        const isShelfTarget = (c === size - 1 && r === size - 1);

        gridHtml += `
          <div class="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center relative transition-all ${isRobotHere ? 'border-amber-500 bg-amber-100 shadow-md ring-2 ring-amber-300' : isShelfTarget ? 'border-emerald-500 bg-emerald-50' : itemHere ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}">
            ${isRobotHere ? `
              <span class="text-3xl animate-bounce">🤖</span>
            ` : itemHere ? `
              <div class="text-center">
                <span class="text-2xl block">${itemHere.icon}</span>
                <span class="text-[8px] font-bold text-slate-600 block">${itemHere.name}</span>
              </div>
            ` : isShelfTarget ? `
              <div class="text-center">
                <span class="text-2xl block">🏢</span>
                <span class="text-[8px] font-bold text-emerald-800 block">TỦ ĐỒ</span>
              </div>
            ` : ''}
          </div>
        `;
      }
    }

    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-5xl mx-auto shadow-2xl">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge bg-amber-600 text-white font-black text-xs">🤖 AI ROBOT SIMULATOR</span>
            <h3 class="text-2xl font-black text-slate-900 mt-1">ROBOT DỌN DẸP PHÒNG HỌC TỰ ĐỘNG</h3>
            <p class="text-xs text-slate-500">Điều khiển hoặc lập trình chuỗi lệnh cho chú Robot thu gom đồ vật về đúng Tủ Đồ 🏢!</p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="simulation3D.resetRobotGame()" class="btn btn-outline btn-xs font-bold text-slate-600">
              🔄 Đặt Lại
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Bàn Cờ 5x5 -->
          <div class="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-100 rounded-3xl border-2 border-slate-300 shadow-inner">
            <div class="grid grid-cols-5 gap-2">
              ${gridHtml}
            </div>

            <div class="mt-4 flex items-center gap-3 text-xs">
              <span class="badge bg-amber-500 text-slate-950 font-black">🤖 Robot: (${this.robotPos.x}, ${this.robotPos.y})</span>
              <span class="badge bg-indigo-600 text-white font-black">Kho chứa: ${this.robotCargo ? this.robotCargo.name : 'Đang Trống'}</span>
              <span class="badge bg-emerald-600 text-white font-black">Còn ${this.robotBoardItems.length} món</span>
            </div>
          </div>

          <!-- Bộ Phím Điều Khiển Robot (D-Pad & Actions) -->
          <div class="space-y-4">
            <div class="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-3 shadow-sm">
              <h4 class="font-black text-xs text-slate-900 uppercase">🎮 ĐIỀU KHIỂN ROBOT DI CHUYỂN:</h4>
              
              <div class="flex flex-col items-center gap-2">
                <button onclick="simulation3D.moveRobot(0, -1)" class="w-12 h-12 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xl shadow-md active:scale-95">⬆️</button>
                <div class="flex items-center gap-3">
                  <button onclick="simulation3D.moveRobot(-1, 0)" class="w-12 h-12 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xl shadow-md active:scale-95">⬅️</button>
                  <button onclick="simulation3D.moveRobot(1, 0)" class="w-12 h-12 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xl shadow-md active:scale-95">➡️</button>
                </div>
                <button onclick="simulation3D.moveRobot(0, 1)" class="w-12 h-12 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xl shadow-md active:scale-95">⬇️</button>
              </div>

              <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button onclick="simulation3D.robotPickUp()" class="btn btn-amber btn-xs font-black shadow-md flex items-center justify-center gap-1">
                  <span>🧲</span> <span>Hút Đồ Vật</span>
                </button>
                <button onclick="simulation3D.robotDropAtShelf()" class="btn btn-emerald btn-xs font-black shadow-md flex items-center justify-center gap-1">
                  <span>📥</span> <span>Bỏ Vào Tủ</span>
                </button>
              </div>
            </div>

            <!-- Gợi ý nhiệm vụ -->
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p class="font-bold">🎯 Nhiệm vụ của em:</p>
              <p>1. Điều khiển robot đến ô có đồ vật ➔ Bấm <b>Hút Đồ Vật 🧲</b></p>
              <p>2. Di chuyển robot đến ô Tủ Đồ (Góc dưới bên phải) ➔ Bấm <b>Bỏ Vào Tủ 📥</b></p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  moveRobot(dx, dy) {
    const newX = Math.max(0, Math.min(this.robotGridSize - 1, this.robotPos.x + dx));
    const newY = Math.max(0, Math.min(this.robotGridSize - 1, this.robotPos.y + dy));
    this.robotPos.x = newX;
    this.robotPos.y = newY;
    this.playKeySound(650);
    this.render("main-content-area");
  }

  robotPickUp() {
    const itemIdx = this.robotBoardItems.findIndex(it => it.x === this.robotPos.x && it.y === this.robotPos.y);
    if (itemIdx >= 0) {
      if (this.robotCargo) {
        window.app.showToast("Kho của Robot đã chứa đồ vật rồi! Hãy mang về tủ trước!", "warning");
        return;
      }
      this.robotCargo = this.robotBoardItems[itemIdx];
      this.robotBoardItems.splice(itemIdx, 1);
      this.speak(`Robot đã hút ${this.robotCargo.name}! Hãy mang về tủ đồ nhé!`);
      window.app.showToast(`🧲 Robot đã hút "${this.robotCargo.name}"!`, "success");
      this.render("main-content-area");
    } else {
      window.app.showToast("Không có đồ vật nào ở ô này!", "info");
    }
  }

  robotDropAtShelf() {
    const isShelf = (this.robotPos.x === this.robotGridSize - 1 && this.robotPos.y === this.robotGridSize - 1);
    if (isShelf) {
      if (!this.robotCargo) {
        window.app.showToast("Robot chưa chứa đồ vật nào!", "warning");
        return;
      }
      const item = this.robotCargo;
      this.robotCargo = null;
      this.speak(`Đã cất ${item.name} vào đúng tủ đồ!`);
      window.app.showToast(`📥 Đã cất "${item.name}" vào Tủ Đồ!`, "success");

      if (this.robotBoardItems.length === 0) {
        setTimeout(() => {
          this.speak("Chúc mừng em! Chú Robot đã dọn dẹp sạch sẽ toàn bộ phòng học!");
        }, 800);
      }

      this.render("main-content-area");
    } else {
      window.app.showToast("Robot cần đến ô Tủ Đồ ở góc dưới bên phải để cất đồ!", "warning");
    }
  }

  resetRobotGame() {
    this.robotPos = { x: 0, y: 0 };
    this.robotCargo = null;
    this.robotBoardItems = [
      { id: "r_item_1", name: "Sách Tin Học", icon: "📘", x: 1, y: 1, target: "Tủ Sách" },
      { id: "r_item_2", name: "Xe Đồ Chơi", icon: "🚗", x: 3, y: 0, target: "Tủ Đồ Chơi" },
      { id: "r_item_3", name: "USB Dữ Liệu", icon: "💾", x: 2, y: 3, target: "Tủ Thiết Bị" }
    ];
    window.app.showToast("🔄 Đã đặt lại trò chơi Robot dọn dẹp!", "info");
    this.render("main-content-area");
  }

  // =========================================================================
  // 5. CÁC HÀM HỖ TRỢ BÀI 8, SEARCH CHALLENGE, AR CAMERA & GEMINI EMBED
  // =========================================================================
  renderSearchChallengeView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-lg">
        <div class="text-center space-y-2">
          <span class="badge badge-amber font-black text-xs">⏱️ THỰC NGHIỆM ĐO THỜI GIAN TÌM KIẾM</span>
          <h3 class="text-2xl font-black text-slate-900">THỬ THÁCH: BÀN HỌC BỪA BỘN vs TỦ ĐỒ NGĂN NẮP</h3>
          <p class="text-xs text-slate-600 max-w-xl mx-auto">
            Cùng làm thí nghiệm đo xem việc sắp xếp ngăn nắp giúp em tìm thấy đồ vật nhanh hơn gấp bao nhiêu lần!
          </p>
        </div>

        <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-4xl p-2 bg-blue-600 text-white rounded-2xl shadow-md">🎯</span>
            <div>
              <span class="badge bg-blue-600 text-white font-black text-[10px]">MỤC TIÊU CẦN TÌM</span>
              <h4 class="text-base font-black text-slate-900 mt-0.5">Sách Giáo Khoa Tin Học Lớp 3 📘</h4>
              <p class="text-xs text-slate-500 font-semibold">Em cần lấy sách ngay để bắt đầu tiết học Tin học!</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="simulation3D.testScenario('messy')" class="btn btn-outline btn-sm font-black text-rose-700 border-rose-300 bg-rose-50 hover:bg-rose-100 flex items-center gap-1">
              <span>😵</span> <span>Trường Hợp 1: Bừa Bộn</span>
            </button>
            <button onclick="simulation3D.testScenario('organized')" class="btn btn-primary btn-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-md">
              <span>✨</span> <span>Trường Hợp 2: Ngăn Nắp</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-5 rounded-2xl border-2 ${this.searchScenario === 'messy' ? 'border-rose-500 bg-rose-50/50 shadow-lg ring-2 ring-rose-200' : 'border-slate-200 bg-slate-50'} space-y-4 transition-all">
            <div class="flex items-center justify-between">
              <span class="badge bg-rose-600 text-white font-black text-xs">TRƯỜNG HỢP 1: BỪA BỘN</span>
              <span class="text-xs font-bold text-rose-700">⏱️ Thời gian: <b>18 Giây</b></span>
            </div>
            <div class="space-y-2 text-xs text-slate-700">
              <div class="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                <p class="font-bold text-rose-900">• Quá trình tìm kiếm:</p>
                <p>Phải lật từng chiếc áo, nhặt từng món đồ chơi, tìm khắp phòng mất rất nhiều công sức.</p>
              </div>
              <div class="p-3 bg-rose-100/70 rounded-xl border border-rose-300 font-bold text-rose-900">
                ❌ Kết quả: <b>Mất 18 giây</b>, muộn giờ học và mệt mỏi!
              </div>
            </div>
          </div>

          <div class="p-5 rounded-2xl border-2 ${this.searchScenario === 'organized' ? 'border-emerald-500 bg-emerald-50/50 shadow-lg ring-2 ring-emerald-200' : 'border-slate-200 bg-slate-50'} space-y-4 transition-all">
            <div class="flex items-center justify-between">
              <span class="badge bg-emerald-600 text-white font-black text-xs">TRƯỜNG HỢP 2: ĐÃ SẮP XẾP</span>
              <span class="text-xs font-bold text-emerald-700">⏱️ Thời gian: <b>1 Giây (Tức thì)</b></span>
            </div>
            <div class="space-y-2 text-xs text-slate-700">
              <div class="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                <p class="font-bold text-emerald-900">• Quá trình tìm kiếm:</p>
                <p>Chỉ cần nhìn thẳng vào ngăn Tầng 1 và rút ngay cuốn Sách Tin Học 3 ra một cách chính xác.</p>
              </div>
              <div class="p-3 bg-emerald-100/70 rounded-xl border border-emerald-300 font-bold text-emerald-900">
                ✅ Kết quả: <b>Chỉ 1 giây</b>, chuẩn bị bài chu đáo, đạt điểm 10!
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  testScenario(scenario) {
    this.searchScenario = scenario;
    if (scenario === "messy") {
      this.speak("Trường hợp 1: Bàn học bừa bộn khiến em phải mất tới 18 giây mới tìm thấy sách!");
      window.app.showToast("😵 Trường hợp 1: Bàn học lộn xộn khiến em mất 18 giây!", "warning");
    } else {
      this.speak("Trường hợp 2: Khi đã sắp xếp vào ngăn tủ, em tìm thấy sách ngay trong 1 giây!");
      window.app.showToast("🎉 Trường hợp 2: Khi đã sắp xếp, em tìm thấy sách ngay trong 1 giây!", "success");
    }
    this.render("main-content-area");
  }

  renderFolderManagerView() {
    return `
      <div class="space-y-6">
        <div class="glass-card p-6 border-2 border-purple-300 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-2xl space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-white/20">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span class="text-xs font-bold text-slate-300 ml-2">💽 File Explorer - This PC ➔ Ổ Đĩa D: \\ HocTap</span>
            </div>
            <button onclick="simulation3D.addNewFolder()" class="btn btn-emerald btn-xs font-black shadow-md flex items-center gap-1">
              <span>➕</span> <span>Tạo Thư Mục Mới</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${this.lesson8Folders.map(folder => `
              <div onclick="simulation3D.placeFileIntoFolder('${folder.id}')" class="p-4 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-cyan-400 transition-all cursor-pointer space-y-3 group">
                <div class="flex items-center justify-between">
                  <span class="text-3xl group-hover:scale-110 transition-all">${folder.icon}</span>
                  <span class="badge bg-cyan-600 text-white text-[10px] font-black">${folder.files.length} Tệp</span>
                </div>
                <div>
                  <h4 class="font-black text-sm text-amber-300 group-hover:text-cyan-200">${folder.name}</h4>
                  <p class="text-[10px] text-slate-300">Thư mục con</p>
                </div>
                <div class="space-y-1 pt-1 border-t border-white/10">
                  ${folder.files.map(f => `
                    <div class="text-[10px] text-slate-200 flex items-center gap-1 truncate">
                      <span>📄</span> <span>${f}</span>
                    </div>
                  `).join("")}
                </div>
                <div class="pt-2 flex items-center justify-between text-[10px]">
                  <button onclick="event.stopPropagation(); simulation3D.renameFolder('${folder.id}')" class="text-cyan-300 hover:underline">✏️ Đổi tên</button>
                  <button onclick="event.stopPropagation(); simulation3D.deleteFolder('${folder.id}')" class="text-rose-400 hover:underline">🗑️ Xóa</button>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="p-4 bg-white/10 rounded-2xl border border-white/20 space-y-3">
            <div class="flex items-center justify-between">
              <span class="badge badge-amber font-black text-xs">📄 CÁC TỆP TIN CẦN PHÂN LOẠI VÀO THƯ MỤC</span>
              <span class="text-xs text-slate-300">Còn <b>${this.lesson8UnsortedFiles.length}</b> tệp tin</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              ${this.lesson8UnsortedFiles.map(file => {
                const isSelected = this.selectedFile?.id === file.id;
                return `
                  <div onclick="simulation3D.selectUnsortedFile('${file.id}')" class="p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected ? 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-300' : 'border-white/20 bg-white/5 hover:bg-white/15'}">
                    <div class="flex items-center gap-2">
                      <span class="text-xl">${file.icon}</span>
                      <div>
                        <p class="text-xs font-bold text-white truncate max-w-[130px]">${file.name}</p>
                        <p class="text-[9px] text-slate-400">${file.desc}</p>
                      </div>
                    </div>
                    ${isSelected ? `<span class="badge bg-amber-400 text-slate-950 text-[9px] font-black animate-pulse">Chọn</span>` : ''}
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  addNewFolder() {
    const folderName = prompt("Nhập tên thư mục mới cần tạo (ví dụ: AmNhac, MyThuat, AnhVan):");
    if (!folderName || !folderName.trim()) return;
    this.lesson8Folders.push({ id: "folder_" + Date.now(), name: folderName.trim(), icon: "📁", color: "cyan", files: [] });
    this.speak(`Đã tạo thư mục mới có tên là ${folderName}!`);
    window.app.showToast(`📁 Đã tạo thư mục: "${folderName}"!`, "success");
    this.render("main-content-area");
  }

  renameFolder(folderId) {
    const folder = this.lesson8Folders.find(f => f.id === folderId);
    if (!folder) return;
    const newName = prompt(`Nhập tên mới cho thư mục "${folder.name}":`, folder.name);
    if (!newName || !newName.trim()) return;
    folder.name = newName.trim();
    this.speak(`Đã đổi tên thư mục thành ${folder.name}!`);
    window.app.showToast(`✏️ Đã đổi tên thư mục thành: "${folder.name}"!`, "success");
    this.render("main-content-area");
  }

  deleteFolder(folderId) {
    if (this.lesson8Folders.length <= 1) {
      window.app.showToast("Cần giữ lại ít nhất 1 thư mục mẫu!", "warning");
      return;
    }
    this.lesson8Folders = this.lesson8Folders.filter(f => f.id !== folderId);
    this.speak("Đã xóa thư mục!");
    window.app.showToast("🗑️ Đã xóa thư mục!", "info");
    this.render("main-content-area");
  }

  selectUnsortedFile(fileId) {
    const file = this.lesson8UnsortedFiles.find(f => f.id === fileId);
    if (file) {
      this.selectedFile = file;
      this.speak(`Em đã chọn tệp: ${file.name}. Hãy bấm vào Thư mục thích hợp ở trên!`);
      window.app.showToast(`👉 Đã chọn tệp: "${file.name}". Bấm vào Thư mục thích hợp!`, "info");
      this.render("main-content-area");
    }
  }

  placeFileIntoFolder(folderId) {
    if (!this.selectedFile) {
      window.app.showToast("Vui lòng bấm chọn một tệp tin ở dưới trước!", "warning");
      return;
    }
    const folder = this.lesson8Folders.find(f => f.id === folderId);
    const file = this.selectedFile;
    if (folder) {
      folder.files.push(file.name);
      this.lesson8UnsortedFiles = this.lesson8UnsortedFiles.filter(f => f.id !== file.id);
      this.selectedFile = null;
      this.speak(`Chính xác! Đã di chuyển tệp ${file.name} vào thư mục ${folder.name}!`);
      window.app.showToast(`✅ Đã di chuyển tệp "${file.name}" vào thư mục "${folder.name}"!`, "success");
      this.render("main-content-area");
    }
  }

  renderFolderTree3DView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-lg">
        <div class="text-center space-y-2">
          <span class="badge badge-emerald font-black text-xs">💻 CHUYỂN ĐỔI TỪ ĐỜI THỰC SANG MÁY TÍNH</span>
          <h3 class="text-2xl font-black text-slate-900">CÂY THƯ MỤC & TỆP TIN TRONG MÁY TÍNH</h3>
          <p class="text-xs text-slate-600 max-w-xl mx-auto">
            Trong máy tính, các <b>Thư Mục (Folder)</b> giống như các <b>Ngăn Tủ</b> để sắp xếp và lưu trữ các <b>Tệp Tin (Files)</b>!
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-5 rounded-2xl border-2 border-blue-300 bg-blue-50/50 space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl p-1.5 bg-blue-600 text-white rounded-xl">🏠</span>
              <h4 class="font-black text-slate-900 text-sm">NGOÀI ĐỜI THỰC: TỦ ĐỒ 3 TẦNG</h4>
            </div>
            <div class="space-y-2.5 text-xs">
              <div class="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between">
                <span class="font-bold">🏢 Tủ đồ gia đình</span>
                <span class="badge badge-cyan font-black text-[10px]">Tủ chứa đồ</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between ml-4">
                <span>📚 Ngăn 1: Sách Vở Học Tập</span>
                <span class="text-slate-500 font-semibold">Chứa SGK, Vở</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between ml-4">
                <span>🧸 Ngăn 2: Đồ Chơi Thể Thao</span>
                <span class="text-slate-500 font-semibold">Chứa Xe, Bóng</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between ml-4">
                <span>💾 Ngăn 3: Thiết Bị Số</span>
                <span class="text-slate-500 font-semibold">Chứa USB, Chuột</span>
              </div>
            </div>
          </div>

          <div class="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl p-1.5 bg-emerald-600 text-white rounded-xl">💻</span>
              <h4 class="font-black text-slate-900 text-sm">TRONG MÁY TÍNH: CÂY THƯ MỤC (D:\)</h4>
            </div>
            <div class="space-y-2.5 text-xs font-mono">
              <div class="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between font-bold text-slate-900">
                <span>💽 Ổ Đĩa D: (Data)</span>
                <span class="badge badge-emerald font-black text-[10px]">Ổ đĩa gốc</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between ml-4 text-blue-800 font-bold">
                <span>📁 D:\\HocTap\\TinHoc3\\</span>
                <span class="text-[10px] bg-blue-100 px-2 py-0.5 rounded text-blue-900">Thư mục con</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between ml-4 text-amber-800 font-bold">
                <span>📁 D:\\GiaiTri\\TroChoi\\</span>
                <span class="text-[10px] bg-amber-100 px-2 py-0.5 rounded text-amber-900">Thư mục con</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between ml-4 text-emerald-800 font-bold">
                <span>📁 D:\\LuuTru\\TaiLieu\\</span>
                <span class="text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">Thư mục con</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderARCameraView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-xl">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge bg-rose-600 text-white font-black text-xs">📷 WEB AR VIRTUAL CLASSROOM</span>
            <h3 class="text-2xl font-black text-slate-900 mt-1">PHÒNG CHIẾU THỰC TẾ ẢO AR</h3>
            <p class="text-xs text-slate-500">Chiếu Kệ Tủ 3D ảo lơ lửng ngay trong không gian phòng học thực tế của em qua Camera!</p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="simulation3D.captureARSnapshot()" class="btn btn-rose btn-md font-black shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
              <span>📸</span> <span>Chụp Ảnh Lưu Niệm</span>
            </button>
            <button onclick="simulation3D.stopARCamera()" class="btn btn-outline btn-sm font-bold text-slate-600">
              ✕ Tắt Camera
            </button>
          </div>
        </div>

        <div class="relative w-full h-[450px] bg-slate-950 rounded-3xl overflow-hidden border-4 border-rose-400 shadow-2xl flex items-center justify-center">
          <video id="ar-video-stream" autoplay playsinline muted class="w-full h-full object-cover"></video>

          <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
            <div class="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white font-black text-xs flex items-center gap-2 border border-white/20">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>AR MODE ACTIVE • TIN HỌC LỚP 3</span>
            </div>

            <div class="w-full max-w-md bg-white/25 backdrop-blur-xl p-4 rounded-3xl border-2 border-white/50 text-white shadow-2xl space-y-2 animate-float">
              <div class="flex items-center justify-between border-b border-white/30 pb-1.5">
                <span class="font-black text-xs text-amber-300">🏢 TỦ ĐỒ THÔNG MINH 3D</span>
                <span class="badge bg-emerald-500 text-white text-[9px] font-black">100% Gọn Gàng</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center text-xs">
                <div class="bg-blue-600/60 p-2 rounded-xl border border-white/30">
                  <span class="text-xl block">📚</span>
                  <span class="text-[10px] font-bold">Tầng 1: Sách</span>
                </div>
                <div class="bg-amber-600/60 p-2 rounded-xl border border-white/30">
                  <span class="text-xl block">🧸</span>
                  <span class="text-[10px] font-bold">Tầng 2: Đồ Chơi</span>
                </div>
                <div class="bg-emerald-600/60 p-2 rounded-xl border border-white/30">
                  <span class="text-xl block">💾</span>
                  <span class="text-[10px] font-bold">Tầng 3: Thiết Bị</span>
                </div>
              </div>
            </div>

            <div class="text-center text-white/80 text-[11px] font-bold bg-black/40 px-3 py-1 rounded-full">
              ✨ Hãy tạo dáng cùng tủ đồ 3D và bấm nút Chụp Ảnh để lưu niệm!
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async startARCamera() {
    const video = document.getElementById("ar-video-stream");
    if (!video) return;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.arStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = this.arStream;
      }
    } catch (e) {
      console.warn("Không thể mở camera:", e);
    }
  }

  stopARCamera() {
    if (this.arStream) {
      this.arStream.getTracks().forEach(track => track.stop());
      this.arStream = null;
    }
    this.switchMode("organize");
  }

  captureARSnapshot() {
    this.speak("Tách! Chúc mừng em đã có bức ảnh lưu niệm tuyệt đẹp!");
    window.app.showToast("📸 Đã chụp ảnh lưu niệm thành công!", "success");
  }

  renderGeminiEmbedView() {
    return `
      <div class="glass-card p-6 space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 bg-purple-600 text-white rounded-2xl shadow-md">✨</span>
            <div>
              <span class="badge bg-purple-600 text-white font-black text-[10px]">GOOGLE GEMINI SHARE</span>
              <h3 class="text-base font-black text-slate-900 mt-0.5">Thí Nghiệm 3D: Tin Học Lớp 3 - Bài 7: Sắp Xếp Để Dễ Tìm</h3>
              <p class="text-xs text-purple-800 font-semibold">Nguồn liên kết: https://share.gemini.google/NLLCPUG04S6G</p>
            </div>
          </div>
          <a href="https://share.gemini.google/NLLCPUG04S6G" target="_blank" class="btn btn-primary btn-sm font-black bg-purple-700 text-white shadow-md">
            <span>↗️</span> <span>Mở Tab Mới</span>
          </a>
        </div>
        <div class="border-2 border-purple-200 rounded-2xl overflow-hidden shadow-lg bg-white relative" style="height: 600px;">
          <iframe src="https://share.gemini.google/NLLCPUG04S6G" class="w-full h-full border-0" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    `;
  }

  openFullScreenModal() {
    const modal = document.getElementById("simulation-3d-modal");
    if (modal) modal.classList.add("active");
  }

  openLessonPlanModal() {
    window.location.hash = "teacher";
    window.app.showToast("👩‍🏫 Đã chuyển sang Portal Giáo Viên để soạn Kế hoạch bài dạy CV 2345!", "info");
  }
}

window.simulation3D = new Simulation3D();
