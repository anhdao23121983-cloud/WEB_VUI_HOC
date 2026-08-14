/**
 * SIMULATION 3D COMPONENT - PHÒNG THÍ NGHIỆM 3D & HỌC LIỆU SỐ TIN HỌC TIỂU HỌC 3-5
 * Tích hợp toàn diện 7 Chủ Đề Thực Nghiệm & Tính Năng Đột Phá:
 * 1. 📘 Bài 7: Sắp Xếp Để Dễ Tìm (Tủ Đồ 3 Tầng & Bàn Học 3D)
 * 2. 📁 Bài 8: Khám Phá Thư Mục (Màn Hình Desktop Ảo, Tạo & Quản Lý Folder 3D)
 * 3. ⌨️ Bài 3 & 10: Bàn Phím & Chuột Máy Tính 3D (3D Hardware Simulator)
 * 4. 🌐 Mạng Internet & Trình Duyệt Web 3D (Internet & Cloud Simulator)
 * 5. 🤖 Robot Dọn Dẹp & Vẽ Tranh 3D (AI Cleaning Robot & 3D Turtle Drawing Bot)
 * 6. 🛡️ An Toàn Số, Tư Thế Ngồi & Đố Vui Blitz 10s (3D Safety Lab)
 * 7. 🖥️ Lắp Ráp Máy Tính 3D (Build Your PC 3D Lab)
 * 8. 🌙 CHẾ ĐỘ BAN ĐÊM NEON PHÁT SÁNG (Dark Neon Room Mode & Cyberpunk Lab)
 * 9. 🎆 HIỆU ỨNG PHÁO HOA 3D & CONFETTI CHÚC MỪNG ĐIỂM 10 (Particle Engine)
 * 10. ☁️ Tự Động Đồng Bộ Điểm Thí Nghiệm Lên Supabase Cloud Database
 * 11. 🎵 Background Music Synthesizer: Nhạc nền vui nhộn Web Audio API
 * 12. 🏆 Bảng Xếp Hạng Top 10 Speedrun Sắp Xếp Nhanh Nhất (Leaderboard)
 * 13. 🎖️ In Chứng Chỉ Huấn Luyện Viên Robot & Kỹ Sư Tin Học Nhí (PDF A4)
 * 14. 🔊 Voice Narration AI & Phòng Chiếu AR Camera Thực Tế Ảo
 */

class Simulation3D {
  constructor() {
    this.currentLesson = 7; // 7 | 8 | 10 | 'internet' | 'robot' | 'safety' | 'pc_builder'
    this.currentMode = "organize";
    this.selectedItem = null;
    this.score = 0;
    this.isVoiceEnabled = true;
    this.isBgmEnabled = false;
    this.isDarkMode = localStorage.getItem("sim_3d_dark_mode") === "true";
    this.bgmInterval = null;
    this.audioCtx = null;
    this.searchScenario = "organized";
    this.arStream = null;

    // Fireworks Particle Engine
    this.fireworksCanvas = null;
    this.fireworksCtx = null;
    this.particles = [];
    this.isFireworksRunning = false;

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

    // === DỮ LIỆU MẠNG INTERNET & TRÌNH DUYỆT WEB 3D ===
    this.webBrowserUrl = "https://webvuihoc.edu.vn";
    this.webPageContent = "Trang Chủ Web Vui Học - Hệ thống học liệu số chuẩn GDPT 2018";

    // === DỮ LIỆU ROBOT DỌN DẸP & VẼ TRANH 3D ===
    this.robotSubTab = "clean";
    this.robotGridSize = 5;
    this.robotPos = { x: 0, y: 0 };
    this.robotCargo = null;
    this.robotBoardItems = [
      { id: "r_item_1", name: "Sách Tin Học", icon: "📘", x: 1, y: 1 },
      { id: "r_item_2", name: "Xe Đồ Chơi", icon: "🚗", x: 3, y: 0 },
      { id: "r_item_3", name: "USB Dữ Liệu", icon: "💾", x: 2, y: 3 }
    ];
    this.drawnShape = null;

    // === DỮ LIỆU AN TOÀN SỬ DỤNG MÁY TÍNH & ĐỐ VUI 10S BLITZ ===
    this.safetySubTab = "scenarios";
    this.blitzCurrentIndex = 0;
    this.blitzTimer = 10;
    this.blitzInterval = null;
    this.blitzScore = 0;
    this.blitzQuestions = [
      { q: "Có được dùng tay ướt để cắm phích điện máy tính không?", ans: "no", exp: "Nước dẫn điện rất mạnh, chạm vào phích cắm khi tay ướt gây điện giật!" },
      { q: "Nên ngồi thẳng lưng, mắt cách màn hình từ 50cm đến 70cm đúng không?", ans: "yes", exp: "Đúng! Giúp phòng chống cận thị và giữ cột sống luôn thẳng!" },
      { q: "Có nên vừa uống trà sữa vừa để ly nước ngay cạnh bàn phím không?", ans: "no", exp: "Không nên! Nước tràn vào làm chập cháy và hư hỏng bàn phím!" },
      { q: "Có được tự ý chia sẻ mật khẩu của mình cho người lạ trên mạng không?", ans: "no", exp: "Tuyệt đối không! Mật khẩu cần được bảo mật để tránh mất tài khoản!" },
      { q: "Trang web có biểu tượng ổ khóa xanh 'https://' là trang an toàn?", ans: "yes", exp: "Đúng! Giao thức HTTPS giúp mã hóa và bảo vệ dữ liệu truyền tải!" }
    ];

    // === DỮ LIỆU LẮP RÁP MÁY TÍNH 3D ===
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

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem("sim_3d_dark_mode", this.isDarkMode);
    this.playKeySound(750);
    if (this.isDarkMode) {
      this.speak("Đã chuyển sang chế độ Phòng học Ban Đêm Neon!");
      window.app.showToast("🌙 Đã bật chế độ Ban Đêm Neon tương lai!", "info");
    } else {
      this.speak("Đã chuyển về chế độ Phòng học Ban Ngày!");
      window.app.showToast("☀️ Đã chuyển về chế độ Ban Ngày sáng sủa!", "info");
    }
    this.render("main-content-area");
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

    if (window.examService?.syncSimulationScoreToCloud) {
      window.examService.syncSimulationScoreToCloud({
        labName: "Sắp Xếp Để Dễ Tìm 3D",
        score: 10,
        durationSpentSeconds: Math.round(timeSec)
      });
      window.app.showToast("☁️ Đã đồng bộ điểm 10.0 và kỷ lục lên Supabase Cloud!", "success");
    }
  }

  // =========================================================================
  // 🎆 FIREWORKS & CONFETTI PARTICLE ENGINE
  // =========================================================================
  triggerFireworks() {
    let canvas = document.getElementById("sim-fireworks-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "sim-fireworks-canvas";
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "99999";
      document.body.appendChild(canvas);
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    const colors = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#eab308"];
    this.particles = [];

    const burstPoints = [
      { x: canvas.width * 0.3, y: canvas.height * 0.35 },
      { x: canvas.width * 0.5, y: canvas.height * 0.25 },
      { x: canvas.width * 0.7, y: canvas.height * 0.35 }
    ];

    burstPoints.forEach(bp => {
      for (let i = 0; i < 45; i++) {
        const angle = (Math.PI * 2 * i) / 45;
        const speed = Math.random() * 6 + 2;
        this.particles.push({
          x: bp.x,
          y: bp.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 2,
          size: Math.random() * 5 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.015 + 0.012,
          gravity: 0.12
        });
      }
    });

    if (!this.isFireworksRunning) {
      this.isFireworksRunning = true;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (this.particles.length > 0) {
          requestAnimationFrame(animate);
        } else {
          this.isFireworksRunning = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      requestAnimationFrame(animate);
    }
  }

  // =========================================================================
  // BACKGROUND MUSIC & SOUND FX
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

    const melody = [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 349.23, 293.66];
    let noteIdx = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.isBgmEnabled || !this.audioCtx) return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(melody[noteIdx % melody.length], this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.035, this.audioCtx.currentTime);
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
    this.triggerFireworks();
    try {
      const ctx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.1);
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
    if (this.currentLesson === 'internet') titleText = "MẠNG INTERNET & TRÌNH DUYỆT WEB 3D";
    if (this.currentLesson === 'robot') titleText = "ROBOT DỌN DẸP & VẼ TRANH HÌNH HỌC 3D";
    if (this.currentLesson === 'safety') titleText = "AN TOÀN KHI SỬ DỤNG MÁY TÍNH & ĐỐ VUI BLITZ 10S";
    if (this.currentLesson === 'pc_builder') titleText = "THÍ NGHIỆM LẮP RÁP MÁY TÍNH 3D (BUILD YOUR PC)";

    const darkClass = this.isDarkMode ? "bg-slate-950 text-slate-100 p-4 md:p-6 rounded-3xl border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)]" : "";

    container.innerHTML = `
      <div class="space-y-6 animate-pop ${darkClass}">
        <!-- Banner Thí Nghiệm Đa Năng -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge badge-amber font-black">🧪 PHÒNG THÍ NGHIỆM 3D & AR ẢO</span>
              <span class="badge bg-white/20 text-white font-bold">GDPT 2018 • HỌC LIỆU SỐ TOÀN DIỆN</span>
              ${this.isDarkMode ? `<span class="badge bg-cyan-500 text-slate-950 font-black animate-pulse">🌙 NEON CYBER LAB</span>` : ''}
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">${titleText}</h2>
            <p class="text-cyan-100 text-xs md:text-sm max-w-2xl">
              Hệ sinh thái học liệu số và thí nghiệm 3D tương tác toàn diện: Sắp xếp dữ liệu, Phần cứng 3D, Mạng Internet, Robot vẽ tranh và Lắp ráp máy tính!
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="simulation3D.toggleDarkMode()" class="btn ${this.isDarkMode ? 'bg-cyan-400 text-slate-950 font-black ring-2 ring-cyan-300' : 'bg-slate-800 text-white'} text-xs py-2 px-3 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-md hover:scale-105 transition-all" title="Chuyển đổi giao diện Ban Đêm Neon / Ban Ngày">
              <span>${this.isDarkMode ? '🌙' : '☀️'}</span> 
              <span>${this.isDarkMode ? 'Đêm Neon' : 'Ban Ngày'}</span>
            </button>

            <button onclick="simulation3D.triggerFireworks()" class="btn bg-rose-500 hover:bg-rose-600 text-white text-xs py-2 px-3 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-md hover:scale-105 transition-all" title="Bắn pháo hoa rực rỡ chúc mừng">
              <span>🎆</span> <span>Pháo Hoa 3D</span>
            </button>

            <button onclick="simulation3D.toggleBgm()" class="btn ${this.isBgmEnabled ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-white/20 text-white'} text-xs py-2 px-3 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-md hover:scale-105 transition-all">
              <span>${this.isBgmEnabled ? '🎵' : '🔇'}</span> 
              <span>${this.isBgmEnabled ? 'Nhạc: BẬT' : 'Nhạc: TẮT'}</span>
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

        <!-- 7 Nút Chọn Chủ Đề Bài Thí Nghiệm -->
        <div class="flex items-center justify-between ${this.isDarkMode ? 'bg-slate-900/90 border-cyan-500/30' : 'bg-white border-slate-200'} p-3.5 rounded-2xl border shadow-sm flex-wrap gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <button onclick="simulation3D.selectLesson(7)" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${this.currentLesson === 7 ? 'bg-indigo-600 text-white shadow-md scale-102 ring-2 ring-indigo-300' : this.isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📘</span> <span>Bài 7: Sắp Xếp</span>
            </button>

            <button onclick="simulation3D.selectLesson(8)" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${this.currentLesson === 8 ? 'bg-purple-600 text-white shadow-md scale-102 ring-2 ring-purple-300' : this.isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📁</span> <span>Bài 8: Thư Mục</span>
            </button>

            <button onclick="simulation3D.selectLesson(10)" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${this.currentLesson === 10 ? 'bg-blue-600 text-white shadow-md scale-102 ring-2 ring-blue-300' : this.isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>⌨️</span> <span>Phím & Chuột</span>
            </button>

            <button onclick="simulation3D.selectLesson('internet')" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${this.currentLesson === 'internet' ? 'bg-cyan-600 text-white shadow-md scale-102 ring-2 ring-cyan-300' : this.isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🌐</span> <span>Mạng Internet & Web</span>
            </button>

            <button onclick="simulation3D.selectLesson('robot')" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${this.currentLesson === 'robot' ? 'bg-amber-600 text-white shadow-md scale-102 ring-2 ring-amber-300' : this.isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🤖</span> <span>Robot & Vẽ Tranh</span>
            </button>

            <button onclick="simulation3D.selectLesson('safety')" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${this.currentLesson === 'safety' ? 'bg-rose-600 text-white shadow-md scale-102 ring-2 ring-rose-300' : this.isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🛡️</span> <span>An Toàn & Blitz 10s</span>
            </button>

            <button onclick="simulation3D.selectLesson('pc_builder')" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${this.currentLesson === 'pc_builder' ? 'bg-emerald-600 text-white shadow-md scale-102 ring-2 ring-emerald-300' : this.isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🖥️</span> <span>Lắp Ráp PC 3D</span>
            </button>
          </div>

          <button onclick="simulation3D.openCertificateModal()" class="btn btn-amber btn-xs font-black shadow-md flex items-center gap-1">
            <span>🎖️</span> <span>In Bằng Khen A4</span>
          </button>
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
      this.speak("Bài 7: Sắp xếp để dễ tìm!");
    } else if (lessonNum === 8) {
      this.currentMode = "folder_manager";
      this.speak("Bài 8: Khám phá thư mục máy tính!");
    } else if (lessonNum === 10) {
      this.currentMode = "hardware";
      this.hardwareTab = "keyboard";
      this.speak("Khám phá Bàn phím và Chuột máy tính 3D!");
    } else if (lessonNum === 'internet') {
      this.currentMode = "internet";
      this.speak("Khám phá Mạng Internet và Trình duyệt Web 3D!");
    } else if (lessonNum === 'robot') {
      this.currentMode = "robot";
      this.robotSubTab = "clean";
      this.speak("Thí nghiệm Robot dọn dẹp và vẽ tranh hình học 3D!");
    } else if (lessonNum === 'safety') {
      this.currentMode = "safety";
      this.safetySubTab = "scenarios";
      this.speak("Thí nghiệm An toàn khi sử dụng máy tính và đố vui chớp nhoáng 10 giây!");
    } else if (lessonNum === 'pc_builder') {
      this.currentMode = "pc_builder";
      this.speak("Thí nghiệm Lắp ráp máy tính 3D!");
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
    if (this.currentMode === "internet") return this.renderInternet3DView();
    if (this.currentMode === "robot") return this.renderRobot3DView();
    if (this.currentMode === "safety") return this.renderSafety3DView();
    if (this.currentMode === "pc_builder") return this.renderPCBuilder3DView();
    if (this.currentMode === "leaderboard") return this.renderLeaderboardView();
    if (this.currentMode === "ar_camera") return this.renderARCameraView();
    if (this.currentMode === "gemini_embed") return this.renderGeminiEmbedView();
  }

  // =========================================================================
  // 1. MẠNG INTERNET & TRÌNH DUYỆT WEB 3D
  // =========================================================================
  renderInternet3DView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-5xl mx-auto shadow-2xl ${this.isDarkMode ? 'bg-slate-900/90 border-cyan-500/40 text-white' : ''}">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge bg-cyan-600 text-white font-black text-xs">🌐 INTERNET & CLOUD 3D</span>
            <h3 class="text-2xl font-black ${this.isDarkMode ? 'text-cyan-300' : 'text-slate-900'} mt-1">MẠNG TOÀN CẦU & TRÌNH DUYỆT WEB</h3>
            <p class="text-xs ${this.isDarkMode ? 'text-slate-300' : 'text-slate-500'}">Mô phỏng dòng chảy dữ liệu từ Máy tính ➔ Wi-Fi Router ➔ Đám mây Internet ➔ Trình duyệt Web!</p>
          </div>

          <button onclick="simulation3D.testInternetPacketFlow()" class="btn btn-primary btn-sm font-black bg-cyan-700 text-white shadow-md flex items-center gap-1.5">
            <span>🚀</span> <span>Mô Phỏng Gửi Dữ Liệu 3D</span>
          </button>
        </div>

        <div class="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border-4 border-cyan-400 text-white shadow-2xl space-y-4">
          <div class="text-xs font-bold text-cyan-300 flex items-center justify-between border-b border-white/20 pb-2">
            <span>🌍 SƠ ĐỒ TRUYỀN TẢI DỮ LIỆU TOÀN CẦU</span>
            <span class="badge bg-cyan-500 text-slate-950 font-black animate-pulse">● CÁP QUANG HOẠT ĐỘNG</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center pt-2">
            <div class="p-4 bg-white/10 rounded-2xl border border-white/20 space-y-1">
              <span class="text-3xl block">💻</span>
              <h5 class="text-xs font-black text-amber-300">1. Máy Tính Học Sinh</h5>
              <p class="text-[10px] text-slate-300">Gửi yêu cầu trang web</p>
            </div>
            <div class="p-4 bg-white/10 rounded-2xl border border-white/20 space-y-1">
              <span class="text-3xl block">📡</span>
              <h5 class="text-xs font-black text-cyan-300">2. Bộ Định Tuyến Wi-Fi</h5>
              <p class="text-[10px] text-slate-300">Phát sóng tín hiệu số</p>
            </div>
            <div class="p-4 bg-white/10 rounded-2xl border border-white/20 space-y-1">
              <span class="text-3xl block animate-spin">🌐</span>
              <h5 class="text-xs font-black text-emerald-300">3. Đám Mây Internet</h5>
              <p class="text-[10px] text-slate-300">Kết nối hàng triệu máy chủ</p>
            </div>
            <div class="p-4 bg-white/10 rounded-2xl border border-white/20 space-y-1">
              <span class="text-3xl block">🏢</span>
              <h5 class="text-xs font-black text-purple-300">4. Máy Chủ Google / Web</h5>
              <p class="text-[10px] text-slate-300">Trả về nội dung bài học</p>
            </div>
          </div>
        </div>

        <div class="p-5 ${this.isDarkMode ? 'bg-slate-800 border-cyan-500/30 text-white' : 'bg-white border-slate-300'} rounded-3xl border-2 shadow-md space-y-4">
          <div class="flex items-center gap-2 border-b ${this.isDarkMode ? 'border-slate-700' : 'border-slate-200'} pb-3">
            <span class="text-emerald-600 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
              <span>🔒</span> <span>HTTPS An Toàn</span>
            </span>
            <input id="sim-web-url-input" type="text" value="${this.webBrowserUrl}" class="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold ${this.isDarkMode ? 'text-white bg-slate-900' : 'text-slate-800 bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-cyan-400">
            <button onclick="simulation3D.navigateWebBrowser()" class="btn btn-primary btn-xs font-black bg-cyan-700 text-white">🔍 Truy Cập</button>
          </div>

          <div class="p-6 ${this.isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-2xl border min-h-[140px] flex flex-col items-center justify-center text-center space-y-2">
            <span class="text-4xl block animate-float">🎓</span>
            <h4 class="font-black ${this.isDarkMode ? 'text-amber-300' : 'text-slate-900'} text-sm" id="sim-web-content-title">${this.webPageContent}</h4>
            <p class="text-xs ${this.isDarkMode ? 'text-slate-400' : 'text-slate-500'} max-w-md">Trang web bảo mật chuẩn quốc tế, cung cấp học liệu Tin học 3, 4, 5 tương tác trực tuyến.</p>
          </div>
        </div>
      </div>
    `;
  }

  testInternetPacketFlow() {
    this.playSuccessFanfare();
    this.speak("Dữ liệu đang được gửi qua bộ định tuyến Wi-Fi, truyền qua cáp quang Internet tới máy chủ đám mây và trả kết quả về màn hình!");
    window.app.showToast("🚀 Đang truyền gói tin dữ liệu qua Mạng Internet toàn cầu...", "success");
  }

  navigateWebBrowser() {
    const input = document.getElementById("sim-web-url-input");
    if (!input) return;
    const url = input.value.trim();
    this.webBrowserUrl = url;
    this.playKeySound(750);
    this.speak(`Đang truy cập vào trang web: ${url}`);
    window.app.showToast(`🔍 Đang tải trang web: "${url}"...`, "info");
  }

  // =========================================================================
  // 2. ROBOT DỌN DẸP & VẼ TRANH HÌNH HỌC 3D
  // =========================================================================
  setRobotSubTab(tab) {
    this.robotSubTab = tab;
    if (tab === "clean") {
      this.speak("Chế độ Robot dọn dẹp phòng học tự động!");
    } else {
      this.speak("Chế độ Robot lập trình vẽ tranh hình học 3D!");
    }
    this.render("main-content-area");
  }

  renderRobot3DView() {
    return `
      <div class="space-y-4">
        <div class="flex items-center gap-2 border-b ${this.isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-2">
          <button onclick="simulation3D.setRobotSubTab('clean')" class="px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.robotSubTab === 'clean' ? 'bg-amber-600 text-white shadow-md' : this.isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100 border'}">
            <span>🤖 1. Robot Dọn Dẹp Phòng Học</span>
          </button>
          <button onclick="simulation3D.setRobotSubTab('draw')" class="px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.robotSubTab === 'draw' ? 'bg-purple-600 text-white shadow-md' : this.isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100 border'}">
            <span>🎨 2. Robot Vẽ Tranh Hình Học 3D (Logo/Scratch)</span>
          </button>
        </div>

        ${this.robotSubTab === 'clean' ? this.renderRobotCleanView() : this.renderRobotDrawView()}
      </div>
    `;
  }

  renderRobotCleanView() {
    const size = this.robotGridSize;
    let gridHtml = "";

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isRobotHere = this.robotPos.x === c && this.robotPos.y === r;
        const itemHere = this.robotBoardItems.find(it => it.x === c && it.y === r);
        const isShelfTarget = (c === size - 1 && r === size - 1);

        gridHtml += `
          <div class="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center relative transition-all ${isRobotHere ? 'border-amber-500 bg-amber-100 shadow-md ring-2 ring-amber-300' : isShelfTarget ? 'border-emerald-500 bg-emerald-50' : itemHere ? 'border-blue-300 bg-blue-50' : this.isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}">
            ${isRobotHere ? `<span class="text-3xl animate-bounce">🤖</span>` : itemHere ? `<div class="text-center"><span class="text-2xl block">${itemHere.icon}</span><span class="text-[8px] font-bold ${this.isDarkMode ? 'text-slate-200' : 'text-slate-600'} block">${itemHere.name}</span></div>` : isShelfTarget ? `<div class="text-center"><span class="text-2xl block">🏢</span><span class="text-[8px] font-bold text-emerald-800 block">TỦ ĐỒ</span></div>` : ''}
          </div>
        `;
      }
    }

    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-5xl mx-auto shadow-2xl ${this.isDarkMode ? 'bg-slate-900/90 border-cyan-500/40 text-white' : ''}">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge bg-amber-600 text-white font-black text-xs">🤖 AI ROBOT SIMULATOR</span>
            <h3 class="text-2xl font-black ${this.isDarkMode ? 'text-amber-400' : 'text-slate-900'} mt-1">ROBOT DỌN DẸP PHÒNG HỌC TỰ ĐỘNG</h3>
            <p class="text-xs ${this.isDarkMode ? 'text-slate-300' : 'text-slate-500'}">Điều khiển Robot thu gom đồ vật về Tủ Đồ 🏢 ở góc dưới bên phải!</p>
          </div>
          <button onclick="simulation3D.resetRobotGame()" class="btn btn-outline btn-xs font-bold ${this.isDarkMode ? 'text-white border-slate-600' : 'text-slate-600'}">🔄 Đặt Lại</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 flex flex-col items-center justify-center p-6 ${this.isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-300'} rounded-3xl border-2 shadow-inner">
            <div class="grid grid-cols-5 gap-2">${gridHtml}</div>
            <div class="mt-4 flex items-center gap-3 text-xs">
              <span class="badge bg-amber-500 text-slate-950 font-black">🤖 Robot: (${this.robotPos.x}, ${this.robotPos.y})</span>
              <span class="badge bg-indigo-600 text-white font-black">Kho: ${this.robotCargo ? this.robotCargo.name : 'Trống'}</span>
              <span class="badge bg-emerald-600 text-white font-black">Còn ${this.robotBoardItems.length} món</span>
            </div>
          </div>

          <div class="space-y-4">
            <div class="p-4 ${this.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} rounded-2xl border-2 space-y-3 shadow-sm">
              <h4 class="font-black text-xs uppercase">🎮 ĐIỀU KHIỂN ROBOT DI CHUYỂN:</h4>
              <div class="flex flex-col items-center gap-2">
                <button onclick="simulation3D.moveRobot(0, -1)" class="w-12 h-12 rounded-2xl bg-cyan-700 text-white font-black text-xl shadow-md">⬆️</button>
                <div class="flex items-center gap-3">
                  <button onclick="simulation3D.moveRobot(-1, 0)" class="w-12 h-12 rounded-2xl bg-cyan-700 text-white font-black text-xl shadow-md">⬅️</button>
                  <button onclick="simulation3D.moveRobot(1, 0)" class="w-12 h-12 rounded-2xl bg-cyan-700 text-white font-black text-xl shadow-md">➡️</button>
                </div>
                <button onclick="simulation3D.moveRobot(0, 1)" class="w-12 h-12 rounded-2xl bg-cyan-700 text-white font-black text-xl shadow-md">⬇️</button>
              </div>
              <div class="pt-2 border-t ${this.isDarkMode ? 'border-slate-700' : 'border-slate-100'} grid grid-cols-2 gap-2">
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

  renderRobotDrawView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-5xl mx-auto shadow-2xl ${this.isDarkMode ? 'bg-slate-900/90 border-purple-500/40 text-white' : ''}">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge bg-purple-600 text-white font-black text-xs">🎨 3D TURTLE ROBOT DRAWING</span>
            <h3 class="text-2xl font-black ${this.isDarkMode ? 'text-purple-300' : 'text-slate-900'} mt-1">LẬP TRÌNH ROBOT VẼ TRANH HÌNH HỌC</h3>
            <p class="text-xs ${this.isDarkMode ? 'text-slate-300' : 'text-slate-500'}">Chọn khối lệnh lập trình để chú Robot tự động hạ bút vẽ các hình học neon phát sáng trên mặt sàn 3D!</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 p-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 rounded-3xl border-4 border-purple-400 text-white shadow-2xl min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden">
            <div class="absolute top-3 left-3 text-[11px] font-bold text-purple-300">
              🖌️ SÀN VẼ NEON 3D • ROBOT PEN DOWN
            </div>

            ${this.drawnShape ? `
              <div class="text-center space-y-2 animate-pop">
                <div class="text-7xl filter drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-pulse">
                  ${this.drawnShape.icon}
                </div>
                <h4 class="text-base font-black text-amber-300 uppercase mt-2">${this.drawnShape.name}</h4>
                <p class="text-xs text-purple-200 font-mono">${this.drawnShape.code}</p>
              </div>
            ` : `
              <div class="text-center space-y-2 text-slate-400">
                <span class="text-5xl block animate-bounce">🤖 ✍️</span>
                <p class="text-xs">Hãy chọn một hình học ở bên phải để Robot bắt đầu vẽ nhé!</p>
              </div>
            `}
          </div>

          <div class="space-y-3">
            <span class="badge badge-purple font-black text-xs">🧩 CHỌN MẪU KHỐI LỆNH:</span>

            <button onclick="simulation3D.runDrawShape('square')" class="w-full p-3 ${this.isDarkMode ? 'bg-slate-800 border-blue-500/40 text-white' : 'bg-white border-blue-300'} border-2 rounded-2xl text-left hover:border-blue-500 transition-all shadow-sm flex items-center justify-between">
              <div>
                <h5 class="text-xs font-black">🔲 1. Vẽ Hình Vuông</h5>
                <p class="text-[10px] text-slate-400">Lặp lại 4 lần [Tiến ➔ Rẽ phải 90°]</p>
              </div>
              <span class="badge bg-blue-600 text-white text-[10px]">Chạy ▶</span>
            </button>

            <button onclick="simulation3D.runDrawShape('triangle')" class="w-full p-3 ${this.isDarkMode ? 'bg-slate-800 border-emerald-500/40 text-white' : 'bg-white border-emerald-300'} border-2 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm flex items-center justify-between">
              <div>
                <h5 class="text-xs font-black">🔺 2. Vẽ Hình Tam Giác Đều</h5>
                <p class="text-[10px] text-slate-400">Lặp lại 3 lần [Tiến ➔ Rẽ phải 120°]</p>
              </div>
              <span class="badge bg-emerald-600 text-white text-[10px]">Chạy ▶</span>
            </button>

            <button onclick="simulation3D.runDrawShape('star')" class="w-full p-3 ${this.isDarkMode ? 'bg-slate-800 border-amber-500/40 text-white' : 'bg-white border-amber-300'} border-2 rounded-2xl text-left hover:border-amber-500 transition-all shadow-sm flex items-center justify-between">
              <div>
                <h5 class="text-xs font-black">⭐ 3. Vẽ Ngôi Sao 5 Cánh</h5>
                <p class="text-[10px] text-slate-400">Lặp lại 5 lần [Tiến ➔ Rẽ phải 144°]</p>
              </div>
              <span class="badge bg-amber-600 text-white text-[10px]">Chạy ▶</span>
            </button>

            <button onclick="simulation3D.runDrawShape('flower')" class="w-full p-3 ${this.isDarkMode ? 'bg-slate-800 border-purple-500/40 text-white' : 'bg-white border-purple-300'} border-2 rounded-2xl text-left hover:border-purple-500 transition-all shadow-sm flex items-center justify-between">
              <div>
                <h5 class="text-xs font-black">🌸 4. Bông Hoa Xoay Tròn</h5>
                <p class="text-[10px] text-slate-400">Lặp lại 12 lần [Vẽ cánh hoa ➔ Xoay 30°]</p>
              </div>
              <span class="badge bg-purple-600 text-white text-[10px]">Chạy ▶</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  runDrawShape(shape) {
    this.playSuccessFanfare();
    if (shape === "square") {
      this.drawnShape = { name: "Hình Vuông Hoàn Chỉnh", icon: "🔲", code: "REPEAT 4 [ FORWARD 100, RIGHT 90 ]" };
      this.speak("Robot đang vẽ Hình Vuông với 4 góc vuông 90 độ!");
    } else if (shape === "triangle") {
      this.drawnShape = { name: "Hình Tam Giác Đều", icon: "🔺", code: "REPEAT 3 [ FORWARD 120, RIGHT 120 ]" };
      this.speak("Robot đang vẽ Hình Tam Giác Đều với 3 góc 120 độ!");
    } else if (shape === "star") {
      this.drawnShape = { name: "Ngôi Sao 5 Cánh Rực Rỡ", icon: "⭐", code: "REPEAT 5 [ FORWARD 150, RIGHT 144 ]" };
      this.speak("Robot đang vẽ Ngôi Sao 5 cánh phát sáng!");
    } else if (shape === "flower") {
      this.drawnShape = { name: "Bông Hoa 12 Cánh", icon: "🌸", code: "REPEAT 12 [ DRAW_PETAL, RIGHT 30 ]" };
      this.speak("Robot đang vẽ Bông Hoa 12 cánh xoay tròn tuyệt đẹp!");
    }
    window.app.showToast(`🎨 Robot đã hoàn thành bản vẽ: ${this.drawnShape.name}!`, "success");
    this.render("main-content-area");
  }

  // =========================================================================
  // 3. AN TOÀN SỬ DỤNG MÁY TÍNH & ĐỐ VUI BLITZ 10S
  // =========================================================================
  setSafetySubTab(tab) {
    this.safetySubTab = tab;
    if (tab === "blitz") {
      this.startBlitzQuiz();
    } else {
      if (this.blitzInterval) clearInterval(this.blitzInterval);
    }
    this.render("main-content-area");
  }

  startBlitzQuiz() {
    this.blitzCurrentIndex = 0;
    this.blitzTimer = 10;
    this.blitzScore = 0;
    this.speak("Bắt đầu thử thách đố vui an toàn chớp nhoáng 10 giây!");
    this.runBlitzTimer();
  }

  runBlitzTimer() {
    if (this.blitzInterval) clearInterval(this.blitzInterval);
    this.blitzTimer = 10;
    this.blitzInterval = setInterval(() => {
      this.blitzTimer--;
      const timerEl = document.getElementById("sim-blitz-timer-val");
      const barEl = document.getElementById("sim-blitz-bar");
      if (timerEl) timerEl.innerText = `${this.blitzTimer}s`;
      if (barEl) barEl.style.width = `${(this.blitzTimer / 10) * 100}%`;

      if (this.blitzTimer <= 0) {
        clearInterval(this.blitzInterval);
        this.playKeySound(300);
        this.speak("Hết giờ rồi! Hãy chuyển sang câu tiếp theo nhé!");
        window.app.showToast("⏱️ Hết 10 giây!", "warning");
        this.nextBlitzQuestion();
      }
    }, 1000);
  }

  answerBlitz(ans) {
    if (this.blitzInterval) clearInterval(this.blitzInterval);
    const q = this.blitzQuestions[this.blitzCurrentIndex];

    if (q.ans === ans) {
      this.blitzScore += 20;
      this.playSuccessFanfare();
      this.speak("Chính xác! " + q.exp);
      window.app.showToast("✅ Chính xác! (+20 Điểm)", "success");
    } else {
      this.playKeySound(300);
      this.speak("Chưa đúng! " + q.exp);
      window.app.showToast("❌ Chưa chính xác!", "error");
    }

    setTimeout(() => this.nextBlitzQuestion(), 1500);
  }

  nextBlitzQuestion() {
    this.blitzCurrentIndex++;
    if (this.blitzCurrentIndex < this.blitzQuestions.length) {
      this.runBlitzTimer();
      this.render("main-content-area");
    } else {
      if (this.blitzInterval) clearInterval(this.blitzInterval);
      this.playSuccessFanfare();
      this.speak(`Chúc mừng em đã hoàn thành thử thách đố vui an toàn với ${this.blitzScore} điểm!`);
      this.render("main-content-area");
    }
  }

  renderSafety3DView() {
    return `
      <div class="space-y-4">
        <div class="flex items-center gap-2 border-b ${this.isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-2">
          <button onclick="simulation3D.setSafetySubTab('scenarios')" class="px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.safetySubTab === 'scenarios' ? 'bg-rose-600 text-white shadow-md' : this.isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100 border'}">
            <span>🛡️ 1. Tình Huống Thực Tế & Tư Thế</span>
          </button>
          <button onclick="simulation3D.setSafetySubTab('blitz')" class="px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.safetySubTab === 'blitz' ? 'bg-amber-600 text-white shadow-md' : this.isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100 border'}">
            <span>⚡ 2. Đố Vui Chớp Nhoáng 10s (Blitz)</span>
          </button>
        </div>

        ${this.safetySubTab === 'scenarios' ? this.renderSafetyScenarios() : this.renderSafetyBlitz()}
      </div>
    `;
  }

  renderSafetyScenarios() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-2xl ${this.isDarkMode ? 'bg-slate-900/90 border-rose-500/40 text-white' : ''}">
        <div class="text-center space-y-2">
          <span class="badge bg-rose-600 text-white font-black text-xs">🛡️ AN TOÀN KHI HỌC TIN HỌC</span>
          <h3 class="text-2xl font-black ${this.isDarkMode ? 'text-rose-400' : 'text-slate-900'}">AN TOÀN ĐIỆN, THIẾT BỊ & TƯ THẾ NGỒI HỌC</h3>
          <p class="text-xs ${this.isDarkMode ? 'text-slate-300' : 'text-slate-600'} max-w-xl mx-auto">
            Học sinh xử lý các tình huống thực tế để nhận biết việc <b>Nên làm (✅)</b> và <b>Không nên làm (❌)</b> khi sử dụng máy tính.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-5 rounded-2xl border-2 ${this.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} space-y-3 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-3xl p-2 bg-slate-100 rounded-xl text-slate-900">⚡</span>
              <span class="badge badge-amber text-xs font-bold">Điện</span>
            </div>
            <div>
              <h4 class="font-black text-sm">Tình huống 1: Tay ướt khi cắm nguồn điện</h4>
              <p class="text-xs ${this.isDarkMode ? 'text-slate-300' : 'text-slate-600'} mt-1">Em vừa rửa tay xong, tay còn ướt và định cắm phích cắm máy tính vào ổ điện.</p>
            </div>
            <div class="pt-2 flex items-center gap-2">
              <button onclick="simulation3D.speak('Chưa đúng rồi! Nước dẫn điện gây nguy hiểm điện giật!'); window.app.showToast('❌ Không được cắm điện khi tay ướt!', 'error')" class="btn btn-emerald btn-xs font-black flex-1">👍 Nên Làm</button>
              <button onclick="simulation3D.playSuccessFanfare(); simulation3D.speak('Chính xác! Tuyệt đối không chạm vào ổ điện khi tay ướt!'); window.app.showToast('✅ Chính xác! Không được cắm điện khi tay ướt!', 'success')" class="btn btn-rose btn-xs font-black flex-1">✋ Không Nên</button>
            </div>
          </div>

          <div class="p-5 rounded-2xl border-2 ${this.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} space-y-3 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-3xl p-2 bg-slate-100 rounded-xl text-slate-900">💺</span>
              <span class="badge badge-cyan text-xs font-bold">Tư Thế</span>
            </div>
            <div>
              <h4 class="font-black text-sm">Tình huống 2: Tư thế ngồi học đúng chuẩn</h4>
              <p class="text-xs ${this.isDarkMode ? 'text-slate-300' : 'text-slate-600'} mt-1">Ngồi thẳng lưng, mắt cách màn hình 50-70cm, bàn chân chạm đất, tay vuông góc.</p>
            </div>
            <div class="pt-2 flex items-center gap-2">
              <button onclick="simulation3D.playSuccessFanfare(); simulation3D.speak('Chính xác! Tư thế này giúp bảo vệ cột sống và mắt!'); window.app.showToast('✅ Chính xác! Ngồi thẳng lưng là rất tốt!', 'success')" class="btn btn-emerald btn-xs font-black flex-1">👍 Nên Làm</button>
              <button onclick="simulation3D.speak('Chưa đúng rồi! Đây là tư thế ngồi chuẩn!'); window.app.showToast('❌ Đây là tư thế đúng cần thực hiện!', 'error')" class="btn btn-rose btn-xs font-black flex-1">✋ Không Nên</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSafetyBlitz() {
    const isFinished = this.blitzCurrentIndex >= this.blitzQuestions.length;
    if (isFinished) {
      return `
        <div class="glass-card p-8 text-center space-y-4 max-w-xl mx-auto shadow-2xl animate-pop ${this.isDarkMode ? 'bg-slate-900 border-amber-500/40 text-white' : ''}">
          <span class="text-6xl block animate-bounce">🏆 ⚡</span>
          <h3 class="text-2xl font-black">HOÀN THÀNH ĐỐ VUI AN TOÀN 10S!</h3>
          <p class="text-base font-black text-amber-500">Tổng điểm đạt được: <b>${this.blitzScore} / 100 Điểm</b></p>
          <p class="text-xs ${this.isDarkMode ? 'text-slate-300' : 'text-slate-600'}">Em đã đạt danh hiệu <b>SIÊU PHẢN XẠ AN TOÀN SỐ</b> xuất sắc!</p>
          <button onclick="simulation3D.startBlitzQuiz()" class="btn btn-primary btn-md font-black bg-amber-600 text-white shadow-md">🔄 Chơi Lại Thử Thách</button>
        </div>
      `;
    }

    const q = this.blitzQuestions[this.blitzCurrentIndex];
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-xl mx-auto shadow-2xl ${this.isDarkMode ? 'bg-slate-900 border-amber-500/40 text-white' : ''}">
        <div class="flex items-center justify-between">
          <span class="badge bg-amber-600 text-white font-black text-xs">CÂU ${this.blitzCurrentIndex + 1} / ${this.blitzQuestions.length}</span>
          <div class="flex items-center gap-1 font-mono font-black text-rose-500 text-lg">
            <span>⏱️</span> <span id="sim-blitz-timer-val">${this.blitzTimer}s</span>
          </div>
        </div>

        <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div id="sim-blitz-bar" class="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-3 rounded-full transition-all duration-1000" style="width: ${(this.blitzTimer / 10) * 100}%"></div>
        </div>

        <div class="p-6 ${this.isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'} rounded-2xl border-2 text-center space-y-2">
          <span class="text-4xl block">❓</span>
          <h4 class="text-base font-black leading-relaxed">${q.q}</h4>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-2">
          <button onclick="simulation3D.answerBlitz('yes')" class="p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-lg active:scale-95 transition-all">👍 ĐÚNG / NÊN LÀM</button>
          <button onclick="simulation3D.answerBlitz('no')" class="p-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-base rounded-2xl shadow-lg active:scale-95 transition-all">✋ SAI / KHÔNG NÊN</button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 4. LẮP RÁP MÁY TÍNH 3D (PC BUILDER)
  // =========================================================================
  renderPCBuilder3DView() {
    const unplacedParts = this.pcParts.filter(p => !p.placed);
    const placedParts = this.pcParts.filter(p => p.placed);
    const isCompleted = unplacedParts.length === 0;

    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-5xl mx-auto shadow-2xl ${this.isDarkMode ? 'bg-slate-900/90 border-emerald-500/40 text-white' : ''}">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge bg-emerald-600 text-white font-black text-xs">🖥️ BUILD YOUR PC 3D</span>
            <h3 class="text-2xl font-black ${this.isDarkMode ? 'text-emerald-400' : 'text-slate-900'} mt-1">LẮP RÁP HOÀN CHỈNH BỘ MÁY TÍNH 3D</h3>
            <p class="text-xs ${this.isDarkMode ? 'text-slate-300' : 'text-slate-500'}">Kéo thả 5 bộ phận cơ bản vào đúng vị trí bàn học để khởi động máy tính!</p>
          </div>
          <button onclick="simulation3D.resetPCBuilder()" class="btn btn-outline btn-xs font-bold ${this.isDarkMode ? 'text-white border-slate-600' : 'text-slate-600'}">🔄 Lắp Lại</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 rounded-3xl border-4 border-emerald-400 text-white shadow-2xl space-y-4 min-h-[380px] flex flex-col justify-between">
            <div class="flex items-center justify-between border-b border-white/20 pb-2 text-xs">
              <span class="font-black text-amber-300">🪑 BÀN HỌC THỰC HÀNH LẮP MÁY</span>
              <span class="badge bg-emerald-500 text-white font-black text-[10px]">${placedParts.length} / 5 Bộ Phận</span>
            </div>

            <div class="grid grid-cols-3 gap-3 my-auto text-center">
              <div onclick="simulation3D.placePCPart('part_speaker')" class="p-3 rounded-2xl border-2 border-dashed border-white/30 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center min-h-[90px] bg-white/5">
                ${this.pcParts.find(p => p.id === 'part_speaker')?.placed ? `<span class="text-3xl animate-pop">🔊</span><span class="text-[10px] font-bold text-emerald-300 mt-1">Loa</span>` : `<span class="text-xs text-slate-400">🔊 Vị trí Loa</span>`}
              </div>
              <div onclick="simulation3D.placePCPart('part_monitor')" class="p-3 rounded-2xl border-2 border-dashed border-white/30 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center min-h-[90px] bg-white/5">
                ${this.pcParts.find(p => p.id === 'part_monitor')?.placed ? `<span class="text-4xl animate-pop">🖥️</span><span class="text-[10px] font-bold text-cyan-300 mt-1">Màn Hình</span>` : `<span class="text-xs text-slate-400">🖥️ Màn hình</span>`}
              </div>
              <div onclick="simulation3D.placePCPart('part_case')" class="p-3 rounded-2xl border-2 border-dashed border-white/30 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center min-h-[90px] bg-white/5">
                ${this.pcParts.find(p => p.id === 'part_case')?.placed ? `<span class="text-3xl animate-pop">🔲</span><span class="text-[10px] font-bold text-amber-300 mt-1">Thân Máy</span>` : `<span class="text-xs text-slate-400">🔲 Thân máy</span>`}
              </div>
              <div></div>
              <div onclick="simulation3D.placePCPart('part_keyboard')" class="p-3 rounded-2xl border-2 border-dashed border-white/30 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center min-h-[80px] bg-white/5">
                ${this.pcParts.find(p => p.id === 'part_keyboard')?.placed ? `<span class="text-3xl animate-pop">⌨️</span><span class="text-[10px] font-bold text-blue-300 mt-1">Bàn Phím</span>` : `<span class="text-xs text-slate-400">⌨️ Bàn phím</span>`}
              </div>
              <div onclick="simulation3D.placePCPart('part_mouse')" class="p-3 rounded-2xl border-2 border-dashed border-white/30 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center min-h-[80px] bg-white/5">
                ${this.pcParts.find(p => p.id === 'part_mouse')?.placed ? `<span class="text-3xl animate-pop">🖱️</span><span class="text-[10px] font-bold text-purple-300 mt-1">Chuột</span>` : `<span class="text-xs text-slate-400">🖱️ Chuột</span>`}
              </div>
            </div>

            ${isCompleted ? `
              <div class="p-3 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-400 rounded-2xl text-center space-y-1 animate-pop">
                <span class="text-2xl block animate-bounce">🎉 TENG TENG! MÁY TÍNH ĐÃ KHỞI ĐỘNG THÀNH CÔNG!</span>
                <p class="text-xs text-emerald-200">Chúc mừng em đã trở thành <b>Kỹ Sư Tin Học Nhí</b> xuất sắc!</p>
              </div>
            ` : ''}
          </div>

          <div class="space-y-4">
            <div class="glass-card p-5 border-2 ${this.isDarkMode ? 'bg-slate-800 border-emerald-500/30 text-white' : 'bg-white border-emerald-200'} space-y-3 shadow-md">
              <span class="badge badge-emerald font-black text-xs">📦 KHO LINH KIỆN MÁY TÍNH</span>
              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${unplacedParts.length === 0 ? `<div class="text-center py-6 text-emerald-400 font-bold text-xs">✨ Đã lắp ráp hoàn thành toàn bộ 5 bộ phận!</div>` : unplacedParts.map(part => {
                  const isSelected = this.selectedPCPart?.id === part.id;
                  return `
                    <div onclick="simulation3D.selectPCPart('${part.id}')" class="p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected ? 'border-emerald-600 bg-emerald-500/20 ring-2 ring-emerald-300' : this.isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}">
                      <div class="flex items-center gap-2">
                        <span class="text-2xl">${part.icon}</span>
                        <div>
                          <h5 class="text-xs font-black">${part.name}</h5>
                          <p class="text-[9px] ${this.isDarkMode ? 'text-slate-400' : 'text-slate-500'}">${part.desc}</p>
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
    if (!this.selectedPCPart) return;
    if (this.selectedPCPart.id === partId) {
      this.selectedPCPart.placed = true;
      this.selectedPCPart = null;
      this.playSuccessFanfare();
      this.speak("Chính xác! Đã lắp linh kiện vào đúng vị trí!");
      window.app.showToast("✅ Đã lắp linh kiện vào đúng vị trí!", "success");

      const allPlaced = this.pcParts.every(p => p.placed);
      if (allPlaced) {
        if (window.examService?.syncSimulationScoreToCloud) {
          window.examService.syncSimulationScoreToCloud({ labName: "Lắp Ráp Máy Tính 3D", score: 10, durationSpentSeconds: 60 });
        }
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
  // CHỨNG CHỈ IN A4 & CÁC HÀM CŨ
  // =========================================================================
  openCertificateModal() {
    this.triggerFireworks();
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
              Đã hoàn thành xuất sắc toàn bộ các bài <b>Thí Nghiệm 3D Sắp Xếp Dữ Liệu, Lập Trình Robot AI, Mạng Internet và Lắp Ráp Máy Tính</b> đạt thành tích Tuyệt Đối <b>100/100 Điểm</b>!
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

  renderOrganize3DView() {
    const studyItems = this.items.filter(i => this.itemLocations[i.id] === "shelf_study");
    const toyItems = this.items.filter(i => this.itemLocations[i.id] === "shelf_toy");
    const techItems = this.items.filter(i => this.itemLocations[i.id] === "shelf_tech");
    const deskItems = this.items.filter(i => this.itemLocations[i.id] === "desk");

    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div class="glass-card p-5 border-2 ${this.isDarkMode ? 'bg-slate-900/90 border-indigo-500/40 text-white' : 'border-indigo-200 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50'} space-y-4 shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <span class="badge badge-cyan font-black text-[10px]">TỦ ĐỒ 3 TẦNG THÔNG MINH</span>
                <h3 class="text-base font-black ${this.isDarkMode ? 'text-cyan-300' : 'text-slate-900'} mt-0.5">🏢 KỆ TỦ PHÂN LOẠI GIA ĐÌNH & HỌC TẬP</h3>
              </div>
              <div class="text-right">
                <span id="sim-speedrun-timer" class="font-mono font-black text-sm bg-rose-100 text-rose-800 px-2 py-0.5 rounded-lg">${this.speedrunElapsedTime.toFixed(1)}s</span>
              </div>
            </div>

            <div class="space-y-4 pt-2">
              <div onclick="simulation3D.placeSelectedItem('shelf_study')" class="p-4 rounded-2xl border-2 border-blue-400 ${this.isDarkMode ? 'bg-blue-950/40' : 'bg-gradient-to-r from-blue-50 to-indigo-50/50'} space-y-2.5 cursor-pointer hover:border-blue-600 transition-all shadow-sm">
                <div class="flex items-center justify-between">
                  <span class="font-black text-xs ${this.isDarkMode ? 'text-blue-300' : 'text-blue-900'}">📚 TẦNG 1: SÁCH VỞ & HỌC TẬP</span>
                  <span class="badge bg-blue-600 text-white text-[10px]">${studyItems.length} Món</span>
                </div>
                <div class="min-h-[50px] p-2 ${this.isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-blue-200'} rounded-xl border flex items-center gap-2 flex-wrap">
                  ${studyItems.map(item => `<div class="px-2.5 py-1.5 rounded-xl bg-blue-100 text-blue-900 font-black text-xs shadow-sm">${item.icon} ${item.name}</div>`).join("")}
                </div>
              </div>

              <div onclick="simulation3D.placeSelectedItem('shelf_toy')" class="p-4 rounded-2xl border-2 border-amber-400 ${this.isDarkMode ? 'bg-amber-950/40' : 'bg-gradient-to-r from-amber-50 to-orange-50/50'} space-y-2.5 cursor-pointer hover:border-amber-600 transition-all shadow-sm">
                <div class="flex items-center justify-between">
                  <span class="font-black text-xs ${this.isDarkMode ? 'text-amber-300' : 'text-amber-900'}">🧸 TẦNG 2: ĐỒ CHƠI & THỂ THAO</span>
                  <span class="badge bg-amber-600 text-white text-[10px]">${toyItems.length} Món</span>
                </div>
                <div class="min-h-[50px] p-2 ${this.isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-amber-200'} rounded-xl border flex items-center gap-2 flex-wrap">
                  ${toyItems.map(item => `<div class="px-2.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-black text-xs shadow-sm">${item.icon} ${item.name}</div>`).join("")}
                </div>
              </div>

              <div onclick="simulation3D.placeSelectedItem('shelf_tech')" class="p-4 rounded-2xl border-2 border-emerald-400 ${this.isDarkMode ? 'bg-emerald-950/40' : 'bg-gradient-to-r from-emerald-50 to-teal-50/50'} space-y-2.5 cursor-pointer hover:border-emerald-600 transition-all shadow-sm">
                <div class="flex items-center justify-between">
                  <span class="font-black text-xs ${this.isDarkMode ? 'text-emerald-300' : 'text-emerald-900'}">💾 TẦNG 3: THIẾT BỊ SỐ & TIN HỌC</span>
                  <span class="badge bg-emerald-600 text-white text-[10px]">${techItems.length} Món</span>
                </div>
                <div class="min-h-[50px] p-2 ${this.isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-emerald-200'} rounded-xl border flex items-center gap-2 flex-wrap">
                  ${techItems.map(item => `<div class="px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-950 font-black text-xs shadow-sm">${item.icon} ${item.name}</div>`).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="glass-card p-5 border-2 ${this.isDarkMode ? 'bg-slate-900/90 border-amber-500/40 text-white' : 'border-amber-200 bg-white'} space-y-3 shadow-md">
            <span class="badge badge-amber font-black text-[10px]">BÀN HỌC BAN ĐẦU (Còn ${deskItems.length} món)</span>
            <div class="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-1">
              ${deskItems.map(item => {
                const isSelected = this.selectedItem?.id === item.id;
                return `
                  <div onclick="simulation3D.selectDeskItem('${item.id}')" class="p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected ? 'border-cyan-600 bg-cyan-500/20 ring-2 ring-cyan-300' : this.isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}">
                    <span class="text-xl">${item.icon}</span>
                    <span class="text-xs font-black flex-1">${item.name}</span>
                  </div>
                `;
              }).join("")}
            </div>
            <button onclick="simulation3D.autoSortAll()" class="btn btn-outline btn-xs w-full font-bold text-indigo-400 bg-indigo-950/50 border-indigo-500">✨ Tự Động Xếp Nhanh</button>
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
      window.app.showToast(`👉 Đã chọn: "${item.name}". Bấm vào Ngăn Tủ!`, "info");
      this.render("main-content-area");
    }
  }

  placeSelectedItem(shelfId) {
    if (!this.selectedItem) return;
    const item = this.selectedItem;
    if (item.targetShelf === shelfId) {
      this.itemLocations[item.id] = shelfId;
      this.selectedItem = null;
      this.playSuccessFanfare();
      this.speak(`Chính xác! Đã xếp ${item.name} vào đúng ngăn!`);
      window.app.showToast(`✅ Chính xác! Đã xếp "${item.name}"!`, "success");

      if (this.getOrganizedCount() === 10) {
        this.stopSpeedrun();
        this.saveNewRecord(this.speedrunElapsedTime);
      }
      this.render("main-content-area");
    } else {
      this.playKeySound(300);
      this.speak(`Chưa đúng rồi! Em hãy thử lại nhé!`);
      window.app.showToast(`❌ Chưa chính xác! "${item.name}" không thuộc ngăn này.`, "error");
    }
  }

  getOrganizedCount() {
    return Object.values(this.itemLocations).filter(loc => loc !== "desk").length;
  }

  autoSortAll() {
    this.items.forEach(item => {
      this.itemLocations[item.id] = item.targetShelf;
    });
    this.selectedItem = null;
    this.stopSpeedrun();
    this.playSuccessFanfare();
    this.speak("Đã tự động sắp xếp toàn bộ 10 đồ vật!");
    this.render("main-content-area");
  }

  renderFolderManagerView() {
    return `
      <div class="glass-card p-6 border-2 border-purple-300 bg-slate-900 text-white rounded-3xl shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-white/20 pb-2">
          <span class="text-xs font-bold text-slate-300">💽 File Explorer - Ổ Đĩa D: \\ HocTap</span>
          <button onclick="simulation3D.addNewFolder()" class="btn btn-emerald btn-xs font-black">➕ Tạo Thư Mục</button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${this.lesson8Folders.map(folder => `
            <div class="p-3 bg-white/10 rounded-2xl border border-white/20 space-y-2">
              <span class="text-3xl">${folder.icon}</span>
              <h5 class="text-xs font-black text-amber-300">${folder.name}</h5>
              <div class="text-[10px] text-slate-300">${folder.files.map(f => `<div>📄 ${f}</div>`).join("")}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  addNewFolder() {
    const folderName = prompt("Nhập tên thư mục mới:");
    if (!folderName) return;
    this.lesson8Folders.push({ id: "f_" + Date.now(), name: folderName.trim(), icon: "📁", files: [] });
    this.render("main-content-area");
  }

  renderLeaderboardView() {
    const records = this.getLeaderboard();
    return `
      <div class="glass-card p-6 md:p-8 space-y-4 max-w-3xl mx-auto shadow-2xl ${this.isDarkMode ? 'bg-slate-900 border-cyan-500/40 text-white' : ''}">
        <h3 class="text-xl font-black ${this.isDarkMode ? 'text-amber-400' : 'text-slate-900'} text-center">🏆 TOP 10 KỶ LỤC TỐC ĐỘ</h3>
        <div class="space-y-2">
          ${records.map((r, i) => `
            <div class="p-3 rounded-xl border ${this.isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white'} flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-black text-sm">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : r.rank}</span>
                <span class="font-bold text-xs">${r.name} (${r.className})</span>
              </div>
              <span class="font-mono text-xs font-black text-cyan-400">${r.time}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  openFullScreenModal() {
    const modal = document.getElementById("simulation-3d-modal");
    if (modal) modal.classList.add("active");
  }
}

window.simulation3D = new Simulation3D();
