/**
 * SIMULATION 3D COMPONENT - PHÒNG THÍ NGHIỆM 3D & HỌC LIỆU SỐ TIN HỌC TIỂU HỌC 3-5
 * Tích hợp toàn diện 6 Chủ Đề Thực Nghiệm:
 * 1. 📘 Bài 7: Sắp Xếp Để Dễ Tìm (Tủ Đồ 3 Tầng & Bàn Học 3D)
 * 2. 📁 Bài 8: Khám Phá Thư Mục (Màn Hình Desktop Ảo, Tạo & Quản Lý Folder 3D)
 * 3. ⌨️ Bài 3 & 10: Bàn Phím & Chuột Máy Tính 3D (3D Hardware Simulator)
 * 4. 🤖 Robot Dọn Dẹp Phòng Học Tự Động (AI Cleaning Robot & Block Programming)
 * 5. 🛡️ An Toàn Sử Dụng Máy Tính & Thiết Bị Điện (3D Safety Lab & Tư Thế Ngồi)
 * 6. 🖥️ Lắp Ráp Máy Tính 3D (Build Your PC 3D Lab)
 * 7. 🎵 Background Music Synthesizer: Nhạc nền vui nhộn Web Audio API
 * 8. 🏆 Bảng Xếp Hạng Top 10 Speedrun Sắp Xếp Nhanh Nhất (Leaderboard)
 * 9. 🎖️ In Chứng Chỉ Huấn Luyện Viên Robot & Kỹ Sư Tin Học Nhí (PDF A4)
 * 10. 🔊 Voice Narration AI & Phòng Chiếu AR Camera Thực Tế Ảo
 */

class Simulation3D {
  constructor() {
    this.currentLesson = 7; // 7 | 8 | 10 | 'robot' | 'safety' | 'pc_builder'
    this.currentMode = "organize";
    this.selectedItem = null;
    this.score = 0;
    this.isVoiceEnabled = true;
    this.isBgmEnabled = false;
    this.bgmInterval = null;
    this.audioCtx = null;
    this.searchScenario = "organized";
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
    this.hardwareTab = "keyboard";
    this.typedText = "";

    // === DỮ LIỆU ROBOT DỌN DẸP 3D ===
    this.robotGridSize = 5;
    this.robotPos = { x: 0, y: 0 };
    this.robotCargo = null;
    this.robotBoardItems = [
      { id: "r_item_1", name: "Sách Tin Học", icon: "📘", x: 1, y: 1 },
      { id: "r_item_2", name: "Xe Đồ Chơi", icon: "🚗", x: 3, y: 0 },
      { id: "r_item_3", name: "USB Dữ Liệu", icon: "💾", x: 2, y: 3 }
    ];

    // === DỮ LIỆU AN TOÀN SỬ DỤNG MÁY TÍNH (SAFETY LAB) ===
    this.safetyQuizzes = [
      {
        id: "s1",
        title: "Tình huống 1: Tay ướt khi cắm nguồn điện",
        icon: "⚡",
        scenario: "Em vừa rửa tay xong, tay còn ướt nước và định cắm phích cắm máy tính vào ổ điện.",
        correctChoice: "no",
        explanation: "Tuyệt đối không chạm vào thiết bị điện khi tay ướt vì nước dẫn điện gây nguy hiểm điện giật!",
        solved: false
      },
      {
        id: "s2",
        title: "Tình huống 2: Ăn uống gần máy tính",
        icon: "🥤",
        scenario: "Bạn để ly nước ngọt và bánh ngọt ngay sát bàn phím máy tính khi đang học bài.",
        correctChoice: "no",
        explanation: "Không nên để đồ ăn nước uống cạnh máy tính vì nước đổ làm hỏng vi mạch bàn phím và máy tính!",
        solved: false
      },
      {
        id: "s3",
        title: "Tình huống 3: Tư thế ngồi học đúng chuẩn",
        icon: "💺",
        scenario: "Ngồi thẳng lưng, mắt cách màn hình 50 - 70cm, bàn chân chạm đất, tay vuông góc với bàn phím.",
        correctChoice: "yes",
        explanation: "Rất chính xác! Tư thế này giúp bảo vệ cột sống, không bị cận thị và mỏi mắt khi học tập!",
        solved: false
      },
      {
        id: "s4",
        title: "Tình huống 4: Tắt máy tính đúng quy trình",
        icon: "🔌",
        scenario: "Bấm nút Start ➔ Chọn Power ➔ Chọn Shut down thay vì rút thẳng dây nguồn.",
        correctChoice: "yes",
        explanation: "Chính xác! Tắt máy đúng quy trình giúp hệ điều hành lưu dữ liệu an toàn và tăng độ bền cho máy!",
        solved: false
      }
    ];

    // === DỮ LIỆU LẮP RÁP MÁY TÍNH 3D (PC BUILDER LAB) ===
    this.pcParts = [
      { id: "part_case", name: "Thân Máy Tính (Case CPU)", icon: "🔲", placed: false, desc: "Chứa bộ vi xử lý và bộ nhớ trung tâm của máy tính" },
      { id: "part_monitor", name: "Màn Hình Máy Tính (Monitor)", icon: "🖥️", placed: false, desc: "Hiển thị hình ảnh và kết quả làm việc của máy tính" },
      { id: "part_keyboard", name: "Bàn Phím Máy Tính (Keyboard)", icon: "⌨️", placed: false, desc: "Dùng để nhập chữ, số và các ký tự vào máy tính" },
      { id: "part_mouse", name: "Chuột Máy Tính (Mouse)", icon: "🖱️", placed: false, desc: "Dùng để điều khiển con trỏ và ra lệnh cho máy tính" },
      { id: "part_speaker", name: "Loa Máy Tính (Speakers)", icon: "🔊", placed: false, desc: "Phát ra âm thanh bài giảng, âm nhạc từ máy tính" }
    ];
    this.selectedPCPart = null;

    this.initLeaderboard();
  }

  resetItemLocations() {
    this.items.forEach(item => {
      this.itemLocations[item.id] = "desk";
    });
    this.score = 0;
    this.stopSpeedrun();
  }

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
  // BACKGROUND MUSIC (BGM ENGINE) & SOUND FX VIA WEB AUDIO API
  // =========================================================================
  toggleBgm() {
    this.isBgmEnabled = !this.isBgmEnabled;
    if (this.isBgmEnabled) {
      this.startBgm();
      window.app.showToast("🎵 Đã bật nhạc nền vui nhộn!", "success");
    } else {
      this.stopBgm();
      window.app.showToast("🔇 Đã tắt nhạc nền!", "info");
    }
    this.render("main-content-area");
  }

  startBgm() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.bgmInterval) clearInterval(this.bgmInterval);

    // Giai điệu thiếu nhi 8 nốt vui nhộn (C4, E4, G4, A4, G4, E4, F4, D4)
    const melody = [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 349.23, 293.66];
    let noteIdx = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.isBgmEnabled || !this.audioCtx) return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(melody[noteIdx % melody.length], this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.35);
        noteIdx++;
      } catch (e) {}
    }, 400);
  }

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  playKeySound(freq = 600) {
    try {
      const ctx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playSuccessFanfare() {
    try {
      const ctx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } catch (e) {}
  }

  // =========================================================================
  // VOICE NARRATION AI
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
    } catch (e) {}
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
  // GIAO DIỆN CHÍNH (RENDER)
  // =========================================================================
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let titleText = "BÀI 7: SẮP XẾP ĐỂ DỄ TÌM";
    if (this.currentLesson === 8) titleText = "BÀI 8: KHÁM PHÁ THƯ MỤC MÁY TÍNH";
    if (this.currentLesson === 10) titleText = "BÀI 3 & 10: BÀN PHÍM & CHUỘT MÁY TÍNH 3D";
    if (this.currentLesson === 'robot') titleText = "ROBOT DỌN DẸP PHÒNG HỌC TỰ ĐỘNG (AI SIMULATOR)";
    if (this.currentLesson === 'safety') titleText = "AN TOÀN KHI SỬ DỤNG MÁY TÍNH & THIẾT BỊ ĐIỆN";
    if (this.currentLesson === 'pc_builder') titleText = "THÍ NGHIỆM LẮP RÁP MÁY TÍNH 3D (BUILD YOUR PC)";

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
              Không gian thí nghiệm 3D tương tác toàn diện: Sắp xếp đồ vật, Cây thư mục, Phần cứng 3D, Robot tự động, An toàn số và Lắp ráp máy tính!
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="simulation3D.toggleBgm()" class="btn ${this.isBgmEnabled ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-white/20 text-white'} text-xs py-2 px-3 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-md hover:scale-105 transition-all" title="Bật hoặc tắt nhạc nền vui nhộn">
              <span>${this.isBgmEnabled ? '🎵' : '🔇'}</span> 
              <span>${this.isBgmEnabled ? 'Nhạc Nền: BẬT' : 'Nhạc Nền: TẮT'}</span>
            </button>

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

        <!-- 6 Nút Chọn Chủ Đề Bài Thí Nghiệm -->
        <div class="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-2.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-slate-500 uppercase">Chủ Đề 3D:</span>
            
            <button onclick="simulation3D.selectLesson(7)" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 7 ? 'bg-indigo-600 text-white shadow-md scale-102 ring-2 ring-indigo-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📘</span> <span>Bài 7: Sắp Xếp</span>
            </button>

            <button onclick="simulation3D.selectLesson(8)" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 8 ? 'bg-purple-600 text-white shadow-md scale-102 ring-2 ring-purple-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📁</span> <span>Bài 8: Thư Mục</span>
            </button>

            <button onclick="simulation3D.selectLesson(10)" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 10 ? 'bg-blue-600 text-white shadow-md scale-102 ring-2 ring-blue-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>⌨️</span> <span>Bàn Phím & Chuột</span>
            </button>

            <button onclick="simulation3D.selectLesson('robot')" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 'robot' ? 'bg-amber-600 text-white shadow-md scale-102 ring-2 ring-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🤖</span> <span>Robot Dọn Dẹp</span>
            </button>

            <button onclick="simulation3D.selectLesson('safety')" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 'safety' ? 'bg-rose-600 text-white shadow-md scale-102 ring-2 ring-rose-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🛡️</span> <span>An Toàn Số & Tư Thế</span>
            </button>

            <button onclick="simulation3D.selectLesson('pc_builder')" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 'pc_builder' ? 'bg-emerald-600 text-white shadow-md scale-102 ring-2 ring-emerald-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🖥️</span> <span>Lắp Ráp Máy Tính 3D</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="simulation3D.openCertificateModal()" class="btn btn-amber btn-xs font-black shadow-md flex items-center gap-1">
              <span>🎖️</span> <span>In Bằng Khen Kỹ Sư Nhí A4</span>
            </button>
          </div>
        </div>

        <!-- Khung Nội Dung Chính Của Thí Nghiệm -->
        <div id="sim-main-viewport" class="space-y-6">
          ${this.renderCurrentModeView()}
        </div>
      </div>
    `;
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
    } else if (lessonNum === 'safety') {
      this.currentMode = "safety";
      this.speak("Thí nghiệm An toàn khi sử dụng máy tính và tư thế ngồi học đúng chuẩn!");
    } else if (lessonNum === 'pc_builder') {
      this.currentMode = "pc_builder";
      this.speak("Thí nghiệm Lắp ráp máy tính 3D, hãy kéo các bộ phận vào đúng vị trí bàn học nhé!");
    }
    this.render("main-content-area");
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.render("main-content-area");
  }

  renderCurrentModeView() {
    if (this.currentMode === "organize") return this.renderOrganize3DView();
    if (this.currentMode === "search_challenge") return this.renderSearchChallengeView();
    if (this.currentMode === "folder_tree") return this.renderFolderTree3DView();
    if (this.currentMode === "folder_manager") return this.renderFolderManagerView();
    if (this.currentMode === "hardware") return this.renderHardware3DView();
    if (this.currentMode === "robot") return this.renderRobot3DView();
    if (this.currentMode === "safety") return this.renderSafety3DView();
    if (this.currentMode === "pc_builder") return this.renderPCBuilder3DView();
    if (this.currentMode === "leaderboard") return this.renderLeaderboardView();
    if (this.currentMode === "ar_camera") return this.renderARCameraView();
    if (this.currentMode === "gemini_embed") return this.renderGeminiEmbedView();
  }

  // =========================================================================
  // 5. THÍ NGHIỆM AN TOÀN SỬ DỤNG MÁY TÍNH (3D SAFETY LAB)
  // =========================================================================
  renderSafety3DView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-2xl">
        <div class="text-center space-y-2">
          <span class="badge bg-rose-600 text-white font-black text-xs">🛡️ AN TOÀN KHI HỌC TIN HỌC</span>
          <h3 class="text-2xl font-black text-slate-900">AN TOÀN ĐIỆN, THIẾT BỊ & TƯ THẾ NGỒI HỌC</h3>
          <p class="text-xs text-slate-600 max-w-xl mx-auto">
            Học sinh xử lý các tình huống thực tế để nhận biết việc <b>Nên làm (✅)</b> và <b>Không nên làm (❌)</b> khi sử dụng máy tính.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${this.safetyQuizzes.map(sq => `
            <div class="p-5 rounded-2xl border-2 ${sq.solved ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 bg-white'} space-y-3 shadow-sm transition-all">
              <div class="flex items-center justify-between">
                <span class="text-3xl p-2 bg-slate-100 rounded-xl">${sq.icon}</span>
                ${sq.solved ? `<span class="badge badge-emerald font-black text-xs">✅ Đã Xử Lý Đúng</span>` : `<span class="badge badge-amber text-xs font-bold">Chưa xử lý</span>`}
              </div>

              <div>
                <h4 class="font-black text-sm text-slate-900">${sq.title}</h4>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">${sq.scenario}</p>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button onclick="simulation3D.answerSafety('${sq.id}', 'yes')" class="btn btn-emerald btn-xs font-black flex-1">
                  👍 Nên Làm
                </button>
                <button onclick="simulation3D.answerSafety('${sq.id}', 'no')" class="btn btn-rose btn-xs font-black flex-1">
                  ✋ Không Nên Làm
                </button>
              </div>

              ${sq.solved ? `
                <p class="text-[11px] text-emerald-800 font-semibold italic bg-white p-2 rounded-lg border border-emerald-200">
                  💡 ${sq.explanation}
                </p>
              ` : ''}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  answerSafety(quizId, answer) {
    const sq = this.safetyQuizzes.find(q => q.id === quizId);
    if (!sq) return;

    if (sq.correctChoice === answer) {
      sq.solved = true;
      this.playSuccessFanfare();
      this.speak("Chính xác! " + sq.explanation);
      window.app.showToast("✅ Chính xác! " + sq.explanation, "success");
      this.render("main-content-area");
    } else {
      this.playKeySound(300);
      this.speak("Chưa đúng rồi! Em hãy suy nghĩ xem hành động này có an toàn không nhé!");
      window.app.showToast("❌ Chưa đúng! Hành vi này không an toàn khi dùng máy tính!", "error");
    }
  }

  // =========================================================================
  // 6. THÍ NGHIỆM LẮP RÁP MÁY TÍNH 3D (BUILD YOUR PC LAB)
  // =========================================================================
  renderPCBuilder3DView() {
    const unplacedParts = this.pcParts.filter(p => !p.placed);
    const placedParts = this.pcParts.filter(p => p.placed);
    const isCompleted = unplacedParts.length === 0;

    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-5xl mx-auto shadow-2xl">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge bg-emerald-600 text-white font-black text-xs">🖥️ BUILD YOUR PC 3D</span>
            <h3 class="text-2xl font-black text-slate-900 mt-1">LẮP RÁP HOÀN CHỈNH BỘ MÁY TÍNH 3D</h3>
            <p class="text-xs text-slate-500">Kéo thả 5 bộ phận cơ bản vào đúng vị trí bàn học để khởi động máy tính!</p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="simulation3D.resetPCBuilder()" class="btn btn-outline btn-xs font-bold text-slate-600">
              🔄 Lắp Lại
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Bàn Học Lắp Ráp 3D -->
          <div class="lg:col-span-2 p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 rounded-3xl border-4 border-emerald-400 text-white shadow-2xl space-y-4 relative min-h-[380px] flex flex-col justify-between">
            <div class="flex items-center justify-between border-b border-white/20 pb-2 text-xs">
              <span class="font-black text-amber-300">🪑 BÀN HỌC THỰC HÀNH LẮP MÁY</span>
              <span class="badge bg-emerald-500 text-white font-black text-[10px]">${placedParts.length} / 5 Bộ Phận</span>
            </div>

            <!-- Vị trí các linh kiện trên bàn -->
            <div class="grid grid-cols-3 gap-3 my-auto text-center">
              <!-- Vị trí 1: Loa trái -->
              <div onclick="simulation3D.placePCPart('part_speaker')" class="p-3 rounded-2xl border-2 border-dashed border-white/30 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center min-h-[90px] transition-all bg-white/5">
                ${this.pcParts.find(p => p.id === 'part_speaker')?.placed ? `
                  <span class="text-3xl animate-pop">🔊</span>
                  <span class="text-[10px] font-bold text-emerald-300 mt-1">Loa Máy Tính</span>
                ` : `
                  <span class="text-xs text-slate-400">🔊 Vị trí Loa</span>
                `}
              </div>

              <!-- Vị trí 2: Màn hình -->
              <div onclick="simulation3D.placePCPart('part_monitor')" class="p-3 rounded-2xl border-2 border-dashed border-white/30 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center min-h-[90px] transition-all bg-white/5">
                ${this.pcParts.find(p => p.id === 'part_monitor')?.placed ? `
                  <span class="text-4xl animate-pop">🖥️</span>
                  <span class="text-[10px] font-bold text-cyan-300 mt-1">Màn Hình</span>
                ` : `
                  <span class="text-xs text-slate-400">🖥️ Vị trí Màn hình</span>
                `}
              </div>

              <!-- Vị trí 3: Thân máy Case -->
              <div onclick="simulation3D.placePCPart('part_case')" class="p-3 rounded-2xl border-2 border-dashed border-white/30 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center min-h-[90px] transition-all bg-white/5">
                ${this.pcParts.find(p => p.id === 'part_case')?.placed ? `
                  <span class="text-3xl animate-pop">🔲</span>
                  <span class="text-[10px] font-bold text-amber-300 mt-1">Thân Máy CPU</span>
                ` : `
                  <span class="text-xs text-slate-400">🔲 Vị trí Thân máy</span>
                `}
              </div>

              <!-- Vị trí 4: Trống -->
              <div></div>

              <!-- Vị trí 5: Bàn phím -->
              <div onclick="simulation3D.placePCPart('part_keyboard')" class="p-3 rounded-2xl border-2 border-dashed border-white/30 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center min-h-[80px] transition-all bg-white/5">
                ${this.pcParts.find(p => p.id === 'part_keyboard')?.placed ? `
                  <span class="text-3xl animate-pop">⌨️</span>
                  <span class="text-[10px] font-bold text-blue-300 mt-1">Bàn Phím</span>
                ` : `
                  <span class="text-xs text-slate-400">⌨️ Vị trí Bàn phím</span>
                `}
              </div>

              <!-- Vị trí 6: Chuột -->
              <div onclick="simulation3D.placePCPart('part_mouse')" class="p-3 rounded-2xl border-2 border-dashed border-white/30 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center min-h-[80px] transition-all bg-white/5">
                ${this.pcParts.find(p => p.id === 'part_mouse')?.placed ? `
                  <span class="text-3xl animate-pop">🖱️</span>
                  <span class="text-[10px] font-bold text-purple-300 mt-1">Chuột</span>
                ` : `
                  <span class="text-xs text-slate-400">🖱️ Vị trí Chuột</span>
                `}
              </div>
            </div>

            ${isCompleted ? `
              <div class="p-3 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-400 rounded-2xl text-center space-y-1 animate-pop">
                <span class="text-2xl block animate-bounce">🎉 TENG TENG! MÁY TÍNH ĐÃ KHỞI ĐỘNG THÀNH CÔNG!</span>
                <p class="text-xs text-emerald-200">Chúc mừng em đã trở thành <b>Kỹ Sư Tin Học Nhí</b> xuất sắc!</p>
              </div>
            ` : ''}
          </div>

          <!-- Kho Linh Kiện Chưa Lắp -->
          <div class="space-y-4">
            <div class="glass-card p-5 border-2 border-emerald-200 bg-white space-y-3 shadow-md">
              <span class="badge badge-emerald font-black text-xs">📦 KHO LINH KIỆN MÁY TÍNH</span>
              <p class="text-xs text-slate-500">Bấm chọn một linh kiện dưới đây, rồi bấm vào ô vị trí tương ứng trên bàn:</p>

              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${unplacedParts.length === 0 ? `
                  <div class="text-center py-6 text-emerald-700 font-bold text-xs">
                    ✨ Đã lắp ráp hoàn thành toàn bộ 5 bộ phận!
                  </div>
                ` : unplacedParts.map(part => {
                  const isSelected = this.selectedPCPart?.id === part.id;
                  return `
                    <div onclick="simulation3D.selectPCPart('${part.id}')" class="p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-300' : 'border-slate-200 bg-slate-50 hover:border-slate-400'}">
                      <div class="flex items-center gap-2">
                        <span class="text-2xl">${part.icon}</span>
                        <div>
                          <h5 class="text-xs font-black text-slate-900">${part.name}</h5>
                          <p class="text-[9px] text-slate-500">${part.desc}</p>
                        </div>
                      </div>
                      ${isSelected ? `<span class="badge bg-emerald-600 text-white text-[9px] font-black animate-pulse">Chọn</span>` : ''}
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  selectPCPart(partId) {
    const part = this.pcParts.find(p => p.id === partId);
    if (part) {
      this.selectedPCPart = part;
      this.speak(`Em đã chọn: ${part.name}. Hãy bấm vào vị trí thích hợp trên bàn học!`);
      window.app.showToast(`👉 Đã chọn: "${part.name}". Bấm vào vị trí trên bàn!`, "info");
      this.render("main-content-area");
    }
  }

  placePCPart(partId) {
    if (!this.selectedPCPart) {
      window.app.showToast("Vui lòng chọn linh kiện ở kho bên phải trước!", "warning");
      return;
    }

    if (this.selectedPCPart.id === partId) {
      this.selectedPCPart.placed = true;
      this.selectedPCPart = null;
      this.playSuccessFanfare();
      this.speak("Chính xác! Đã lắp linh kiện vào đúng vị trí!");
      window.app.showToast("✅ Đã lắp linh kiện vào đúng vị trí!", "success");

      const allPlaced = this.pcParts.every(p => p.placed);
      if (allPlaced) {
        setTimeout(() => {
          this.speak("Chúc mừng em đã lắp ráp hoàn thành toàn bộ bộ máy tính 3D!");
        }, 800);
      }

      this.render("main-content-area");
    } else {
      this.playKeySound(300);
      this.speak("Chưa đúng vị trí rồi, em hãy thử lại nhé!");
      window.app.showToast("❌ Vị trí này không khớp với linh kiện đang chọn!", "error");
    }
  }

  resetPCBuilder() {
    this.pcParts.forEach(p => p.placed = false);
    this.selectedPCPart = null;
    window.app.showToast("🔄 Đã đặt lại trò chơi lắp ráp máy tính!", "info");
    this.render("main-content-area");
  }

  // =========================================================================
  // 7. IN CHỨNG CHỈ HUẤN LUYỆN VIÊN ROBOT & KỸ SƯ NHÍ A4
  // =========================================================================
  openCertificateModal() {
    const modal = document.getElementById("simulation-certificate-modal");
    const user = window.authService?.getUser() || { name: "Nguyễn Văn An", className: "3A" };
    const content = document.getElementById("simulation-certificate-content");

    if (content) {
      content.innerHTML = `
        <div id="sim-certificate-print-area" class="p-8 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 border-8 border-double border-amber-600 rounded-3xl shadow-2xl space-y-6 text-center text-slate-800 relative overflow-hidden">
          <div class="border-b-2 border-amber-500 pb-4 space-y-1">
            <p class="text-xs font-black uppercase text-amber-900 tracking-widest">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p class="text-[11px] font-bold text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
            <p class="text-xs font-extrabold text-cyan-800 pt-1">TRƯỜNG TIỂU HỌC VUI HỌC • CLB TIN HỌC SÁNG TẠO</p>
          </div>

          <div class="space-y-2">
            <span class="text-6xl block animate-bounce">🎖️ 🤖 🖥️</span>
            <h2 class="text-2xl md:text-3xl font-black text-amber-800 uppercase tracking-wide">GIẤY CHỨNG NHẬN VINH DANH</h2>
            <h3 class="text-lg font-black text-indigo-900 uppercase">HUẤN LUYỆN VIÊN ROBOT & KỸ SƯ TIN HỌC NHÍ</h3>
          </div>

          <div class="space-y-2 text-sm">
            <p class="text-slate-600">Trân trọng tuyên dương em:</p>
            <h4 class="text-2xl font-black text-amber-700 underline uppercase">${user.name || "Nguyễn Văn An"}</h4>
            <p class="text-xs text-slate-600 font-bold">Học sinh Lớp: <b>${user.className || "3A"}</b></p>
            <p class="text-xs text-slate-700 max-w-xl mx-auto leading-relaxed pt-2">
              Đã hoàn thành xuất sắc toàn bộ các bài <b>Thí Nghiệm 3D Sắp Xếp Dữ Liệu, Lập Trình Robot AI và Lắp Ráp Máy Tính</b> đạt thành tích Tuyệt Đối <b>100/100 Điểm</b>!
            </p>
          </div>

          <div class="pt-6 border-t border-amber-300 flex items-center justify-between text-xs px-8">
            <div class="text-left">
              <p class="text-slate-500">Ngày cấp: <b>${new Date().toLocaleDateString('vi-VN')}</b></p>
              <p class="font-bold text-slate-700">GIÁO VIÊN BỘ MÔN</p>
              <p class="text-cyan-800 font-black mt-6">Thầy Anh Đào</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-slate-700">HIỆU TRƯỞNG</p>
              <div class="w-16 h-16 rounded-full border-2 border-rose-600 text-rose-600 font-black text-[9px] flex items-center justify-center mx-auto my-1 rotate-[-12deg] shadow-sm">
                ĐÃ DUYỆT ★
              </div>
              <p class="text-slate-900 font-black">Ban Giám Hiệu</p>
            </div>
          </div>
        </div>

        <div class="pt-4 flex items-center justify-end gap-3 no-print">
          <button onclick="simulation3D.printCertificate()" class="btn btn-emerald btn-md font-black shadow-lg flex items-center gap-2">
            <span>🖨️</span> <span>In Giấy Khen Khổ Ngang A4</span>
          </button>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  printCertificate() {
    window.print();
  }

  // =========================================================================
  // CÁC HÀM CŨ TỪ BÀI 7, BÀI 8, BÀN PHÍM, CHUỘT, ROBOT
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

            <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div class="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-700" style="width: ${progressPct}%"></div>
            </div>

            <div class="space-y-4 pt-2">
              <div onclick="simulation3D.placeSelectedItem('shelf_study')" class="p-4 rounded-2xl border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50/50 space-y-2.5 cursor-pointer hover:border-blue-600 transition-all shadow-sm group">
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

              <div onclick="simulation3D.placeSelectedItem('shelf_toy')" class="p-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50/50 space-y-2.5 cursor-pointer hover:border-amber-600 transition-all shadow-sm group">
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

              <div onclick="simulation3D.placeSelectedItem('shelf_tech')" class="p-4 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50/50 space-y-2.5 cursor-pointer hover:border-emerald-600 transition-all shadow-sm group">
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
              </div>
            ` : ''}
          </div>
        </div>

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
                    ${isSelected ? `<span class="badge bg-cyan-700 text-white text-[10px] font-black shrink-0 animate-pulse">Đang Chọn</span>` : `<span class="text-xs text-slate-400 font-bold shrink-0">Chọn ➔</span>`}
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
      this.playSuccessFanfare();
      this.speak(`Chính xác! Đã xếp ${item.name} vào đúng ngăn!`);
      window.app.showToast(`✅ Chính xác! Đã xếp "${item.name}" vào đúng ngăn! (+10 Điểm)`, "success");

      if (this.getOrganizedCount() === 10) {
        this.stopSpeedrun();
        this.saveNewRecord(this.speedrunElapsedTime);
      }
      this.render("main-content-area");
    } else {
      this.playKeySound(300);
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

  renderLeaderboardView() {
    const records = this.getLeaderboard();
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-2xl">
        <div class="text-center space-y-2">
          <span class="badge badge-amber font-black text-xs">🏆 BẢNG VÀNG KỶ LỤC TỐC ĐỘ</span>
          <h3 class="text-2xl md:text-3xl font-black text-slate-900">TOP 10 HỌC SINH SẮP XẾP NHANH NHẤT</h3>
          <p class="text-xs text-slate-600 max-w-xl mx-auto">
            Vinh danh các Hiệp sĩ Công nghệ hoàn thành bài thí nghiệm với thời gian ngắn nhất!
          </p>
        </div>
        <div class="space-y-2.5">
          ${records.map((r, i) => `
            <div class="p-3.5 rounded-2xl border-2 bg-white flex items-center justify-between gap-4 shadow-sm">
              <div class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-2xl bg-slate-100 text-slate-800 font-black text-base flex items-center justify-center">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : r.rank}</span>
                <div>
                  <h4 class="font-black text-slate-900 text-sm">${r.name} <span class="badge badge-cyan text-[10px]">Lớp ${r.className}</span></h4>
                  <p class="text-[10px] text-slate-400">${r.badge} • ${r.date}</p>
                </div>
              </div>
              <span class="font-mono text-base font-black text-indigo-700">${r.time}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  setHardwareTab(tab) {
    this.hardwareTab = tab;
    this.render("main-content-area");
  }

  renderHardware3DView() {
    if (this.hardwareTab === "keyboard") return this.renderKeyboard3D();
    return this.renderMouse3D();
  }

  renderKeyboard3D() {
    const homeRowKeys = [
      { key: "A", finger: "Ngón út trái" }, { key: "S", finger: "Ngón áp út trái" }, { key: "D", finger: "Ngón giữa trái" },
      { key: "F", finger: "Ngón trỏ trái (Gờ nổi)", bump: true }, { key: "G", finger: "Ngón trỏ trái" }, { key: "H", finger: "Ngón trỏ phải" },
      { key: "J", finger: "Ngón trỏ phải (Gờ nổi)", bump: true }, { key: "K", finger: "Ngón giữa phải" }, { key: "L", finger: "Ngón áp út phải" }, { key: ";", finger: "Ngón út phải" }
    ];

    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-5xl mx-auto shadow-2xl">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge badge-cyan font-black text-xs">⌨️ PHẦN CỨNG MÁY TÍNH 3D</span>
            <h3 class="text-2xl font-black text-slate-900 mt-1">BÀN PHÍM 3D & QUY TẮC ĐẶT 10 NGÓN TAY</h3>
            <p class="text-xs text-slate-500">Bấm phím để nghe âm thanh phím cơ và quan sát vị trí đặt ngón tay trên hàng phím cơ sở!</p>
          </div>
          <button onclick="simulation3D.clearTypedText()" class="btn btn-outline btn-xs font-bold text-slate-600">🗑️ Xóa Chữ</button>
        </div>

        <div class="p-4 bg-slate-950 rounded-2xl border-2 border-cyan-400 font-mono text-emerald-400 text-lg shadow-inner min-h-[60px] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">Ký tự:</span>
            <span>${this.typedText || "_"}</span>
          </div>
          <span class="text-xs text-slate-500 animate-pulse">● READY</span>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="badge bg-indigo-600 text-white font-black text-xs">HÀNG PHÍM CƠ SỞ (QUAN TRỌNG NHẤT)</span>
            <span class="text-xs text-slate-500 font-bold">Hai phím mốc F & J có gờ nổi</span>
          </div>
          <div class="grid grid-cols-5 sm:grid-cols-10 gap-2">
            ${homeRowKeys.map(k => `
              <button onclick="simulation3D.pressKey('${k.key}', '${k.finger}')" class="p-4 rounded-2xl border-b-4 border-slate-700 bg-gradient-to-b from-slate-100 to-slate-200 hover:from-cyan-100 hover:to-cyan-200 active:border-b-0 active:translate-y-1 transition-all shadow-md text-center ${k.bump ? 'ring-2 ring-amber-400 bg-amber-50' : ''}">
                <span class="text-xl md:text-2xl font-black text-slate-900 block">${k.key}</span>
                ${k.bump ? `<span class="text-[9px] font-bold text-amber-700 bg-amber-200 px-1 rounded block mt-1">Gờ nổi</span>` : ''}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button onclick="simulation3D.pressSpecialKey('SPACE', 'Phím Cách (Spacebar): Tạo khoảng trắng giữa các từ!')" class="p-3 bg-indigo-50 border-2 border-indigo-300 rounded-2xl text-left shadow-sm">
            <span class="badge bg-indigo-600 text-white text-[10px] font-black">SPACEBAR</span>
            <h5 class="text-xs font-black text-indigo-950 mt-1">Phím Cách</h5>
          </button>
          <button onclick="simulation3D.pressSpecialKey('ENTER', 'Phím Enter: Xuống dòng mới!')" class="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-left shadow-sm">
            <span class="badge bg-emerald-600 text-white text-[10px] font-black">ENTER</span>
            <h5 class="text-xs font-black text-emerald-950 mt-1">Phím Xuống Dòng</h5>
          </button>
          <button onclick="simulation3D.pressSpecialKey('BACKSPACE', 'Phím Backspace: Xóa ký tự bên trái!')" class="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl text-left shadow-sm">
            <span class="badge bg-rose-600 text-white text-[10px] font-black">BACKSPACE</span>
            <h5 class="text-xs font-black text-rose-950 mt-1">Phím Xóa Lùi</h5>
          </button>
          <button onclick="simulation3D.pressSpecialKey('CAPS_LOCK', 'Phím Caps Lock: Khóa chữ in hoa!')" class="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left shadow-sm">
            <span class="badge bg-amber-600 text-white text-[10px] font-black">CAPS LOCK</span>
            <h5 class="text-xs font-black text-amber-950 mt-1">Phím Viết Hoa</h5>
          </button>
        </div>
      </div>
    `;
  }

  pressKey(key, finger) {
    this.playKeySound(700);
    this.typedText += key;
    this.speak(`Phím ${key}, ${finger}.`);
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
            Học sinh thực hành 5 thao tác điều khiển chuột theo chuẩn SGK Tin học 3.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div onclick="simulation3D.doMouseAction('move')" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-cyan-500 cursor-pointer shadow-sm space-y-2">
            <span class="text-3xl">🎯</span>
            <h4 class="font-black text-sm text-slate-900">1. Di chuyển chuột (Move)</h4>
            <p class="text-xs text-slate-500">Giữ chuột trên mặt phẳng và di chuyển theo hướng mong muốn.</p>
          </div>
          <div onclick="simulation3D.doMouseAction('leftClick')" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-500 cursor-pointer shadow-sm space-y-2">
            <span class="text-3xl">👆</span>
            <h4 class="font-black text-sm text-slate-900">2. Nhấp chuột trái (Click)</h4>
            <p class="text-xs text-slate-500">Dùng ngón trỏ nhấn nhanh nút chuột trái một lần rồi thả tay.</p>
          </div>
          <div onclick="simulation3D.doMouseAction('doubleClick')" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-purple-500 cursor-pointer shadow-sm space-y-2">
            <span class="text-3xl">✌️</span>
            <h4 class="font-black text-sm text-slate-900">3. Nhấp đúp chuột (Double Click)</h4>
            <p class="text-xs text-slate-500">Nhấn nhanh nút chuột trái hai lần liên tiếp để mở tệp tin.</p>
          </div>
          <div onclick="simulation3D.doMouseAction('rightClick')" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-amber-500 cursor-pointer shadow-sm space-y-2">
            <span class="text-3xl">👉</span>
            <h4 class="font-black text-sm text-slate-900">4. Nhấp chuột phải (Right Click)</h4>
            <p class="text-xs text-slate-500">Dùng ngón giữa nhấn nút chuột phải để mở menu tùy chọn.</p>
          </div>
          <div onclick="simulation3D.doMouseAction('dragDrop')" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-emerald-500 cursor-pointer shadow-sm space-y-2">
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
      this.speak("Thao tác: Di chuyển chuột trên mặt bàn.");
      window.app.showToast("🎯 Thao tác: Di chuyển con trỏ chuột!", "info");
    } else if (actionType === "leftClick") {
      this.speak("Thao tác: Nhấp chuột trái để chọn đối tượng.");
      window.app.showToast("👆 Thao tác: Nhấp chuột trái!", "success");
    } else if (actionType === "doubleClick") {
      this.speak("Thao tác: Nhấp đúp chuột trái hai lần để mở tệp tin.");
      window.app.showToast("✌️ Thao tác: Nhấp đúp chuột!", "success");
    } else if (actionType === "rightClick") {
      this.speak("Thao tác: Nhấp chuột phải để mở bảng chọn menu.");
      window.app.showToast("👉 Thao tác: Nhấp chuột phải!", "success");
    } else if (actionType === "dragDrop") {
      this.speak("Thao tác: Nhấn giữ chuột trái và kéo thả đối tượng.");
      window.app.showToast("✋ Thao tác: Kéo thả chuột!", "success");
    }
  }

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
            ${isRobotHere ? `<span class="text-3xl animate-bounce">🤖</span>` : itemHere ? `<div class="text-center"><span class="text-2xl block">${itemHere.icon}</span><span class="text-[8px] font-bold text-slate-600 block">${itemHere.name}</span></div>` : isShelfTarget ? `<div class="text-center"><span class="text-2xl block">🏢</span><span class="text-[8px] font-bold text-emerald-800 block">TỦ ĐỒ</span></div>` : ''}
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
            <p class="text-xs text-slate-500">Điều khiển Robot thu gom đồ vật về Tủ Đồ 🏢 ở góc dưới bên phải!</p>
          </div>
          <button onclick="simulation3D.resetRobotGame()" class="btn btn-outline btn-xs font-bold text-slate-600">🔄 Đặt Lại</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-100 rounded-3xl border-2 border-slate-300 shadow-inner">
            <div class="grid grid-cols-5 gap-2">${gridHtml}</div>
            <div class="mt-4 flex items-center gap-3 text-xs">
              <span class="badge bg-amber-500 text-slate-950 font-black">🤖 Robot: (${this.robotPos.x}, ${this.robotPos.y})</span>
              <span class="badge bg-indigo-600 text-white font-black">Kho: ${this.robotCargo ? this.robotCargo.name : 'Trống'}</span>
              <span class="badge bg-emerald-600 text-white font-black">Còn ${this.robotBoardItems.length} món</span>
            </div>
          </div>

          <div class="space-y-4">
            <div class="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-3 shadow-sm">
              <h4 class="font-black text-xs text-slate-900 uppercase">🎮 ĐIỀU KHIỂN ROBOT DI CHUYỂN:</h4>
              <div class="flex flex-col items-center gap-2">
                <button onclick="simulation3D.moveRobot(0, -1)" class="w-12 h-12 rounded-2xl bg-cyan-700 text-white font-black text-xl shadow-md">⬆️</button>
                <div class="flex items-center gap-3">
                  <button onclick="simulation3D.moveRobot(-1, 0)" class="w-12 h-12 rounded-2xl bg-cyan-700 text-white font-black text-xl shadow-md">⬅️</button>
                  <button onclick="simulation3D.moveRobot(1, 0)" class="w-12 h-12 rounded-2xl bg-cyan-700 text-white font-black text-xl shadow-md">➡️</button>
                </div>
                <button onclick="simulation3D.moveRobot(0, 1)" class="w-12 h-12 rounded-2xl bg-cyan-700 text-white font-black text-xl shadow-md">⬇️</button>
              </div>
              <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button onclick="simulation3D.robotPickUp()" class="btn btn-amber btn-xs font-black shadow-md flex items-center justify-center gap-1"><span>🧲</span> <span>Hút Đồ</span></button>
                <button onclick="simulation3D.robotDropAtShelf()" class="btn btn-emerald btn-xs font-black shadow-md flex items-center justify-center gap-1"><span>📥</span> <span>Bỏ Tủ</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  moveRobot(dx, dy) {
    this.robotPos.x = Math.max(0, Math.min(this.robotGridSize - 1, this.robotPos.x + dx));
    this.robotPos.y = Math.max(0, Math.min(this.robotGridSize - 1, this.robotPos.y + dy));
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
      this.playSuccessFanfare();
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
      this.playSuccessFanfare();
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
      { id: "r_item_1", name: "Sách Tin Học", icon: "📘", x: 1, y: 1 },
      { id: "r_item_2", name: "Xe Đồ Chơi", icon: "🚗", x: 3, y: 0 },
      { id: "r_item_3", name: "USB Dữ Liệu", icon: "💾", x: 2, y: 3 }
    ];
    window.app.showToast("🔄 Đã đặt lại trò chơi Robot dọn dẹp!", "info");
    this.render("main-content-area");
  }

  // =========================================================================
  // MÀN HÌNH DESKTOP ẢO (BÀI 8) & GEMINI EMBED
  // =========================================================================
  renderFolderManagerView() {
    return `
      <div class="space-y-6">
        <div class="glass-card p-6 border-2 border-purple-300 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-2xl space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-white/20">
            <span class="text-xs font-bold text-slate-300 ml-2">💽 File Explorer - This PC ➔ Ổ Đĩa D: \\ HocTap</span>
            <button onclick="simulation3D.addNewFolder()" class="btn btn-emerald btn-xs font-black shadow-md">➕ Tạo Thư Mục</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${this.lesson8Folders.map(folder => `
              <div onclick="simulation3D.placeFileIntoFolder('${folder.id}')" class="p-4 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-cyan-400 transition-all cursor-pointer space-y-3 group">
                <div class="flex items-center justify-between">
                  <span class="text-3xl">${folder.icon}</span>
                  <span class="badge bg-cyan-600 text-white text-[10px] font-black">${folder.files.length} Tệp</span>
                </div>
                <h4 class="font-black text-sm text-amber-300">${folder.name}</h4>
                <div class="space-y-1 pt-1 border-t border-white/10">
                  ${folder.files.map(f => `<div class="text-[10px] text-slate-200 truncate">📄 ${f}</div>`).join("")}
                </div>
              </div>
            `).join("")}
          </div>

          <div class="p-4 bg-white/10 rounded-2xl border border-white/20 space-y-3">
            <div class="flex items-center justify-between">
              <span class="badge badge-amber font-black text-xs">📄 CÁC TỆP TIN CẦN PHÂN LOẠI VÀO THƯ MỤC</span>
              <span class="text-xs text-slate-300">Còn <b>${this.lesson8UnsortedFiles.length}</b> tệp</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              ${this.lesson8UnsortedFiles.map(file => {
                const isSelected = this.selectedFile?.id === file.id;
                return `
                  <div onclick="simulation3D.selectUnsortedFile('${file.id}')" class="p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected ? 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-300' : 'border-white/20 bg-white/5'}">
                    <span class="text-xl">${file.icon}</span>
                    <p class="text-xs font-bold text-white truncate max-w-[130px]">${file.name}</p>
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
    const folderName = prompt("Nhập tên thư mục mới (ví dụ: AmNhac, MyThuat):");
    if (!folderName || !folderName.trim()) return;
    this.lesson8Folders.push({ id: "folder_" + Date.now(), name: folderName.trim(), icon: "📁", color: "cyan", files: [] });
    this.speak(`Đã tạo thư mục ${folderName}!`);
    window.app.showToast(`📁 Đã tạo thư mục: "${folderName}"!`, "success");
    this.render("main-content-area");
  }

  selectUnsortedFile(fileId) {
    const file = this.lesson8UnsortedFiles.find(f => f.id === fileId);
    if (file) {
      this.selectedFile = file;
      this.speak(`Em đã chọn tệp: ${file.name}. Hãy bấm vào Thư mục thích hợp!`);
      window.app.showToast(`👉 Đã chọn tệp: "${file.name}". Bấm vào Thư mục!`, "info");
      this.render("main-content-area");
    }
  }

  placeFileIntoFolder(folderId) {
    if (!this.selectedFile) return;
    const folder = this.lesson8Folders.find(f => f.id === folderId);
    const file = this.selectedFile;
    if (folder) {
      folder.files.push(file.name);
      this.lesson8UnsortedFiles = this.lesson8UnsortedFiles.filter(f => f.id !== file.id);
      this.selectedFile = null;
      this.playSuccessFanfare();
      this.speak(`Đã di chuyển tệp vào thư mục ${folder.name}!`);
      window.app.showToast(`✅ Đã di chuyển tệp vào thư mục "${folder.name}"!`, "success");
      this.render("main-content-area");
    }
  }

  renderGeminiEmbedView() {
    return `
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
          <h3 class="text-base font-black text-slate-900">Bản Gốc Google Gemini Shared</h3>
          <a href="https://share.gemini.google/NLLCPUG04S6G" target="_blank" class="btn btn-primary btn-sm font-black bg-purple-700 text-white">↗️ Mở Tab Mới</a>
        </div>
        <iframe src="https://share.gemini.google/NLLCPUG04S6G" class="w-full h-[600px] rounded-2xl border-2 border-purple-200" allowfullscreen></iframe>
      </div>
    `;
  }

  openFullScreenModal() {
    const modal = document.getElementById("simulation-3d-modal");
    if (modal) modal.classList.add("active");
  }
}

window.simulation3D = new Simulation3D();
