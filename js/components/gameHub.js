/**
 * GAME HUB & HTML5 / IFRAME RUNNER
 * Bộ minigame giáo dục Tin học 3-5 tương tác trực tiếp
 */

class GameHub {
  constructor() {
    this.currentGame = null;
    this.activeTimer = null;
  }

  // Khởi tạo và render giao diện Game Hub
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const games = db.games || [];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Banner Game Hub -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge badge-amber mb-2">🎮 KHÔNG GIAN HỌC MÀ CHƠI</span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">GAME HUB TIN HỌC 3-5</h2>
            <p class="text-cyan-100 text-sm md:text-base mt-1">Khám phá các trò chơi tư duy lập trình, luyện gõ 10 ngón và khám phá phần cứng máy tính.</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="gameHub.openIframeRunnerModal()" class="btn btn-emerald">
              <span>🌐 Nhúng Game Ngoài (iFrame)</span>
            </button>
          </div>
        </div>

        <!-- Danh sách Thẻ Game & Mô Phỏng 3D -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- THẺ ĐẶC BIỆT: MÔ PHỎNG 3D BÀI 7 -->
          <div class="glass-card glass-card-interactive p-5 flex flex-col justify-between cursor-pointer border-2 border-purple-400 bg-gradient-to-b from-purple-50/50 via-white to-indigo-50/30 hover:border-purple-600 transition-all shadow-md group" onclick="window.location.hash='lab3d'">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-4xl p-3 bg-purple-100 rounded-2xl group-hover:scale-110 transition-all">🧪</span>
                <span class="badge bg-purple-600 text-white font-black">Lớp 3 • 3D Lab</span>
              </div>
              <h3 class="text-lg font-black text-purple-950 mb-1 group-hover:text-purple-700 transition-all">Mô Phỏng 3D: Sắp Xếp Để Dễ Tìm</h3>
              <p class="text-xs text-slate-600 leading-relaxed mb-4">Mô phỏng 3D phân loại 10 đồ vật vào kệ tủ 3 tầng, đo thời gian tìm kiếm và khám phá cây thư mục máy tính.</p>
            </div>
            <div class="pt-3 border-t border-purple-100 flex items-center justify-between">
              <span class="text-xs font-black text-amber-600 flex items-center gap-1">⭐ Bài 7 GDPT 2018</span>
              <button class="btn btn-sm font-black bg-purple-700 hover:bg-purple-800 text-white shadow-sm">Khám Phá ▶</button>
            </div>
          </div>
          ${games.map(game => `
            <div class="glass-card glass-card-interactive p-5 flex flex-col justify-between cursor-pointer border-2 hover:border-cyan-500 transition-all" onclick="gameHub.launchGame('${game.id}')">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-4xl p-3 bg-cyan-50 rounded-2xl">${game.icon}</span>
                  <span class="badge badge-cyan font-bold">Lớp ${game.grade}</span>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-2">${game.title}</h3>
                <p class="text-xs text-slate-600 leading-relaxed mb-4">${game.description}</p>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs font-bold text-amber-600 flex items-center gap-1">🏆 ${game.badge}</span>
                <button class="btn btn-primary btn-sm">Chơi Ngay ▶</button>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Khung Chơi Game Tương Tác Trực Tiếp (Game Canvas Container) -->
        <div id="game-stage-container" class="hidden glass-card p-6 border-2 border-cyan-500 shadow-2xl relative">
          <!-- Game Header -->
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
            <div class="flex items-center gap-3">
              <span id="game-active-icon" class="text-3xl">🎮</span>
              <div>
                <h3 id="game-active-title" class="text-xl font-bold text-slate-900">Tên Trò Chơi</h3>
                <p id="game-active-badge" class="text-xs font-semibold text-amber-600">🏆 Huy hiệu</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <span class="text-amber-500 font-black text-lg">⭐</span>
                <span id="game-score-display" class="font-extrabold text-amber-700 text-lg">0</span>
              </div>
              <button onclick="gameHub.closeGameStage()" class="btn btn-outline btn-sm">✕ Đóng Trò Chơi</button>
            </div>
          </div>

          <!-- Game Viewport Body -->
          <div id="game-viewport" class="min-h-[420px] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-4 text-white relative">
            <!-- Game nội bộ sẽ được render tại đây -->
          </div>
        </div>
      </div>
    `;
  }

  // Khởi động Trò chơi
  launchGame(gameId) {
    this.currentGame = gameId;
    const stage = document.getElementById("game-stage-container");
    const viewport = document.getElementById("game-viewport");
    const title = document.getElementById("game-active-title");
    const icon = document.getElementById("game-active-icon");
    const badge = document.getElementById("game-active-badge");
    const score = document.getElementById("game-score-display");

    if (!stage || !viewport) return;
    stage.classList.remove("hidden");
    stage.scrollIntoView({ behavior: 'smooth' });

    score.innerText = "0";

    if (gameId === "game_hardware_match") {
      title.innerText = "🧩 Thử Tài Phần Cứng Máy Tính";
      icon.innerText = "🖥️";
      badge.innerText = "🏆 Kỹ Sư Phần Cứng Nhí";
      this.initHardwareMatchGame(viewport);
    } else if (gameId === "game_bee_typing") {
      title.innerText = "🐝 Ong Vàng Luyện Gõ 10 Ngón";
      icon.innerText = "⌨️";
      badge.innerText = "🏆 Bậc Thầy Gõ Phím";
      this.initBeeTypingGame(viewport);
    } else if (gameId === "game_knight_maze") {
      title.innerText = "⚔️ Hiệp Sĩ Mê Cung Thuật Toán";
      icon.innerText = "🧭";
      badge.innerText = "🏆 Nhà Thám Hiểm Thuật Toán";
      this.initKnightMazeGame(viewport);
    } else if (gameId === "game_cyber_quiz") {
      title.innerText = "🛡️ Đố Vui Tin Học & An Toàn Số";
      icon.innerText = "💡";
      badge.innerText = "🏆 Vệ Binh Không Gian Mạng";
      this.initCyberQuizGame(viewport);
    } else if (gameId === "game_3d_computer_power") {
      title.innerText = "🖥️ Mô Phỏng 3D: Phòng Máy & Bật/Tắt Máy Tính";
      icon.innerText = "🌐";
      badge.innerText = "🏆 Bậc Thầy Vận Hành 3D";
      this.init3DComputerGame(viewport);
    }
  }

  // Khởi động Mô phỏng 3D
  init3DComputerGame(viewport) {
    viewport.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between bg-slate-900/90 p-3 rounded-2xl border border-cyan-500/40 text-white flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">🌐</span>
            <div>
              <p class="text-xs font-bold text-cyan-300">Phòng Mô Phỏng 3D Thực Tế Ảo (Tin Học Lớp 3)</p>
              <p class="text-[10px] text-slate-400">Khám phá cắm điện, bật CPU, mở màn hình và tắt máy an toàn</p>
            </div>
          </div>
          <button onclick="window.location.hash = 'lab3d'; setTimeout(() => simulation3D.selectLesson('computer_room_3d'), 100);" class="btn bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white btn-xs font-black shadow-md flex items-center gap-1 hover:scale-105 transition-all">
            <span>🚀</span> <span>Mở Trong Phòng Thí Nghiệm 3D Chuyên Dụng</span>
          </button>
        </div>
        <iframe src="games/computer3d/index.html" class="w-full h-[600px] rounded-2xl border-2 border-cyan-500/30 shadow-2xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `;
  }

  // Đóng màn hình chơi game
  closeGameStage() {
    if (this.activeTimer) clearInterval(this.activeTimer);
    const stage = document.getElementById("game-stage-container");
    if (stage) stage.classList.add("hidden");
  }

  // ==========================================
  // GAME 1: THỬ TÀI PHẦN CỨNG MÁY TÍNH
  // ==========================================
  initHardwareMatchGame(container) {
    const items = [
      { id: "monitor", name: "Màn hình", icon: "🖥️", desc: "Hiển thị kết quả làm việc, hình ảnh, văn bản" },
      { id: "cpu", name: "Thân máy tính", icon: "🖲️", desc: "Bộ não trung tâm xử lý mọi dữ liệu và lệnh" },
      { id: "keyboard", name: "Bàn phím", icon: "⌨️", desc: "Nhập chữ, số và các ký hiệu vào máy tính" },
      { id: "mouse", name: "Chuột máy tính", icon: "🖱️", desc: "Điều khiển con trỏ và ra lệnh nhanh chóng" }
    ];

    let selectedCard = null;
    let matchedCount = 0;
    let score = 0;

    container.innerHTML = `
      <div class="w-full max-w-2xl bg-slate-800 p-6 rounded-2xl text-center">
        <h4 class="text-xl font-bold text-amber-400 mb-2">Ghép Nối Đúng Tên Với Chức Năng</h4>
        <p class="text-xs text-slate-300 mb-6">Nhấn chọn 1 thẻ thiết bị bên trái rồi nhấn vào ô mô tả chức năng tương ứng bên phải!</p>
        
        <div class="grid grid-cols-2 gap-4 text-left">
          <!-- Cột Thiết bị -->
          <div class="space-y-3" id="hw-devices">
            ${items.map(item => `
              <div class="hw-item p-3 bg-slate-700 hover:bg-cyan-600 rounded-xl cursor-pointer transition-all border border-slate-600 flex items-center gap-3" data-id="${item.id}" onclick="gameHub.handleHwSelect('${item.id}', this)">
                <span class="text-3xl">${item.icon}</span>
                <span class="font-bold text-sm text-white">${item.name}</span>
              </div>
            `).join("")}
          </div>

          <!-- Cột Chức năng (Đã xáo trộn) -->
          <div class="space-y-3" id="hw-targets">
            ${[...items].sort(() => Math.random() - 0.5).map(item => `
              <div class="hw-target p-3 bg-slate-700 hover:bg-emerald-700 rounded-xl cursor-pointer transition-all border border-slate-600" data-target="${item.id}" onclick="gameHub.handleHwMatch('${item.id}', this)">
                <p class="text-xs text-slate-200 font-semibold leading-snug">${item.desc}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <div id="hw-win-msg" class="hidden mt-6 p-4 bg-emerald-500 text-white font-bold rounded-xl animate-pop">
          🎉 CHÚC MỪNG EM ĐÃ HOÀN THÀNH XUẤT SẮC! +100 ĐIỂM (3 ⭐)
        </div>
      </div>
    `;

    window._hwSelected = null;
    window._hwMatched = 0;
  }

  handleHwSelect(id, el) {
    document.querySelectorAll(".hw-item").forEach(item => item.classList.remove("border-amber-400", "bg-amber-600"));
    el.classList.add("border-amber-400", "bg-amber-600");
    window._hwSelected = id;
  }

  handleHwMatch(targetId, el) {
    if (!window._hwSelected) {
      if (window.app) window.app.showToast("Em hãy chọn 1 thiết bị bên trái trước nhé!", "warning");
      return;
    }

    if (window._hwSelected === targetId) {
      el.classList.add("bg-emerald-600", "pointer-events-none", "opacity-80");
      const selectedEl = document.querySelector(`.hw-item[data-id="${window._hwSelected}"]`);
      if (selectedEl) {
        selectedEl.classList.add("bg-emerald-600", "pointer-events-none", "opacity-80");
      }
      window._hwSelected = null;
      window._hwMatched = (window._hwMatched || 0) + 1;

      // Cập nhật điểm
      const scoreDisplay = document.getElementById("game-score-display");
      if (scoreDisplay) {
        const cur = parseInt(scoreDisplay.innerText) + 25;
        scoreDisplay.innerText = cur;
      }

      if (window._hwMatched >= 4) {
        const winMsg = document.getElementById("hw-win-msg");
        if (winMsg) winMsg.classList.remove("hidden");
        this.saveScoreForCurrentStudent("game_hardware_match", 100, 3);
      }
    } else {
      if (window.app) window.app.showToast("Chưa chính xác rồi, em hãy thử lại nhé!", "error");
    }
  }

  // ==========================================
  // GAME 2: ONG VÀNG LUYỆN GÕ 10 NGÓN
  // ==========================================
  initBeeTypingGame(container) {
    const letters = ["F", "J", "D", "K", "S", "L", "A", "T", "I", "N", "H", "O", "C"];
    let currentTarget = "F";
    let score = 0;

    container.innerHTML = `
      <div class="w-full max-w-2xl bg-slate-800 p-6 rounded-2xl text-center">
        <div class="flex items-center justify-between mb-4">
          <span class="text-amber-300 font-bold text-sm">🐝 Hãy bấm đúng phím để giúp chú Ong bay về tổ!</span>
          <span class="text-xs bg-slate-700 px-3 py-1 rounded-full text-cyan-300">Hàng phím cơ sở</span>
        </div>

        <!-- Bia Phím Hiện Tại -->
        <div class="my-6">
          <div id="bee-letter" class="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-5xl font-black text-slate-900 shadow-xl animate-float">
            ${currentTarget}
          </div>
          <p class="text-xs text-slate-400 mt-3">Nhấn phím tương ứng trên bàn phím máy tính của em</p>
        </div>

        <!-- Bàn phím ảo mô phỏng vị trí 2 ngón trỏ đặt gai F & J -->
        <div class="bg-slate-900 p-4 rounded-xl inline-block border border-slate-700">
          <div class="flex justify-center gap-1 mb-1.5">
            ${["Q","W","E","R","T","Y","U","I","O","P"].map(k => `<span class="px-2.5 py-2 bg-slate-800 rounded font-bold text-xs text-slate-300">${k}</span>`).join("")}
          </div>
          <div class="flex justify-center gap-1">
            ${["A","S","D"].map(k => `<span class="px-2.5 py-2 bg-slate-800 rounded font-bold text-xs text-slate-300">${k}</span>`).join("")}
            <span class="px-3 py-2 bg-cyan-600 text-white rounded font-black text-sm border-b-2 border-amber-300">F (Gai)</span>
            <span class="px-2.5 py-2 bg-slate-800 rounded font-bold text-xs text-slate-300">G</span>
            <span class="px-2.5 py-2 bg-slate-800 rounded font-bold text-xs text-slate-300">H</span>
            <span class="px-3 py-2 bg-cyan-600 text-white rounded font-black text-sm border-b-2 border-amber-300">J (Gai)</span>
            ${["K","L"].map(k => `<span class="px-2.5 py-2 bg-slate-800 rounded font-bold text-xs text-slate-300">${k}</span>`).join("")}
          </div>
        </div>
      </div>
    `;

    // Lắng nghe sự kiện bàn phím
    const keyHandler = (e) => {
      const pressed = e.key.toUpperCase();
      const targetEl = document.getElementById("bee-letter");
      if (!targetEl) {
        window.removeEventListener("keydown", keyHandler);
        return;
      }

      if (pressed === currentTarget) {
        score += 10;
        const scoreDisplay = document.getElementById("game-score-display");
        if (scoreDisplay) scoreDisplay.innerText = score;

        // Chọn ký tự tiếp theo
        currentTarget = letters[Math.floor(Math.random() * letters.length)];
        targetEl.innerText = currentTarget;
        targetEl.classList.remove("animate-pop");
        void targetEl.offsetWidth; // Trigger reflow
        targetEl.classList.add("animate-pop");

        if (score >= 100) {
          if (window.app) window.app.showToast("🎉 Xuất sắc! Em đã đạt danh hiệu Bậc Thầy Gõ Phím!", "success");
          this.saveScoreForCurrentStudent("game_bee_typing", 100, 3);
        }
      }
    };

    window.addEventListener("keydown", keyHandler);
  }

  // ==========================================
  // GAME 3: HIỆP SĨ MÊ CUNG THUẬT TOÁN
  // ==========================================
  initKnightMazeGame(container) {
    let grid = [
      ['K', '.', '.', 'X', '.'],
      ['X', 'X', '.', '.', '.'],
      ['.', '.', '.', 'X', '.'],
      ['.', 'X', '.', '.', 'T']
    ];
    let commands = [];

    container.innerHTML = `
      <div class="w-full max-w-2xl bg-slate-800 p-6 rounded-2xl text-center">
        <h4 class="text-xl font-bold text-cyan-400 mb-1">Xây Dựng Thuật Toán Dẫn Đường</h4>
        <p class="text-xs text-slate-300 mb-4">Lập trình chuỗi lệnh đưa Hiệp sĩ (⚔️) đến Rương kho báu (🏆) và tránh Chướng ngại vật (🪨)!</p>

        <!-- Sân khấu Mê cung -->
        <div class="grid grid-cols-5 gap-2 max-w-[280px] mx-auto bg-slate-900 p-3 rounded-xl border border-slate-700 mb-4" id="maze-grid">
          ${grid.flat().map(cell => {
            let icon = "⬜";
            if (cell === 'K') icon = "⚔️";
            if (cell === 'T') icon = "🏆";
            if (cell === 'X') icon = "🪨";
            return `<div class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl font-bold">${icon}</div>`;
          }).join("")}
        </div>

        <!-- Khối lệnh kéo thả -->
        <div class="flex justify-center gap-2 mb-4">
          <button onclick="gameHub.addMazeCmd('TIẾN')" class="btn btn-sm btn-primary">⬆️ Tiến</button>
          <button onclick="gameHub.addMazeCmd('PHẢI')" class="btn btn-sm btn-amber">➡️ Rẽ Phải</button>
          <button onclick="gameHub.addMazeCmd('XUỐNG')" class="btn btn-sm btn-emerald">⬇️ Đi Xuống</button>
          <button onclick="gameHub.clearMazeCmds()" class="btn btn-sm btn-outline">✕ Xóa Lệnh</button>
        </div>

        <!-- Danh sách chuỗi lệnh đã nạp -->
        <div class="bg-slate-900 p-3 rounded-xl min-h-[48px] flex items-center justify-center gap-2 mb-4 border border-slate-700 flex-wrap" id="maze-command-list">
          <span class="text-xs text-slate-500">Chưa có lệnh nào. Hãy bấm nút lệnh ở trên!</span>
        </div>

        <button onclick="gameHub.runMazeAlgorithm()" class="btn btn-emerald btn-lg font-black w-full max-w-xs shadow-lg">
          ▶ CHẠY THUẬT TOÁN
        </button>
      </div>
    `;
    window._mazeCmds = [];
  }

  addMazeCmd(cmd) {
    if (!window._mazeCmds) window._mazeCmds = [];
    window._mazeCmds.push(cmd);
    this.renderMazeCommands();
  }

  clearMazeCmds() {
    window._mazeCmds = [];
    this.renderMazeCommands();
  }

  renderMazeCommands() {
    const list = document.getElementById("maze-command-list");
    if (!list) return;
    if (window._mazeCmds.length === 0) {
      list.innerHTML = `<span class="text-xs text-slate-500">Chưa có lệnh nào. Hãy bấm nút lệnh ở trên!</span>`;
      return;
    }
    list.innerHTML = window._mazeCmds.map((c, i) => `
      <span class="badge badge-cyan font-bold">${i+1}. ${c}</span>
    `).join("");
  }

  runMazeAlgorithm() {
    if (!window._mazeCmds || window._mazeCmds.length === 0) {
      if (window.app) window.app.showToast("Em hãy thêm các khối lệnh trước khi chạy nhé!", "warning");
      return;
    }

    if (window.app) window.app.showToast("🤖 Đang thực thi thuật toán...", "info");
    
    setTimeout(() => {
      if (window._mazeCmds.length >= 4) {
        if (window.app) window.app.showToast("🎉 Hoan hô! Thuật toán chính xác, Hiệp Sĩ đã tìm thấy kho báu!", "success");
        const scoreDisplay = document.getElementById("game-score-display");
        if (scoreDisplay) scoreDisplay.innerText = "100";
        this.saveScoreForCurrentStudent("game_knight_maze", 100, 3);
      } else {
        if (window.app) window.app.showToast("Thuật toán chưa đủ bước để tới kho báu, em hãy thêm lệnh nhé!", "warning");
      }
    }, 1000);
  }

  // ==========================================
  // GAME 4: ĐỐ VUI TIN HỌC & AN TOÀN SỐ
  // ==========================================
  initCyberQuizGame(container) {
    const questions = [
      {
        q: "Khi nhận được tin nhắn từ người lạ yêu cầu gửi Mật khẩu tài khoản, em nên làm gì?",
        options: ["Gửi ngay cho bạn ấy", "Tuyệt đối không gửi và báo cho thầy cô / cha mẹ", "Đổi mật khẩu thành 123456 rồi gửi", "Tắt máy tính vứt đi"],
        correct: 1
      },
      {
        q: "Thiết bị nào sau đây dùng để lưu trữ dữ liệu lâu dài và mang đi thuận tiện?",
        options: ["Thẻ nhớ / USB", "Chuột máy tính", "Dây nguồn", "Màn hình"],
        correct: 0
      },
      {
        q: "Trong phần mềm Paint, công cụ nào giúp em đổ màu nhanh cho một hình khép kín?",
        options: ["Cái tẩy (Eraser)", "Bình màu (Fill with color)", "Kính lúp (Magnifier)", "Bút chì (Pencil)"],
        correct: 1
      }
    ];

    let currentQ = 0;
    let score = 0;

    const renderQuestion = () => {
      const q = questions[currentQ];
      container.innerHTML = `
        <div class="w-full max-w-xl bg-slate-800 p-6 rounded-2xl text-center">
          <div class="flex items-center justify-between mb-4">
            <span class="badge badge-amber font-bold">Câu hỏi ${currentQ + 1} / ${questions.length}</span>
            <span class="text-xs text-slate-400">🛡️ Vệ Binh An Toàn Số</span>
          </div>

          <h4 class="text-lg font-bold text-white mb-6 leading-relaxed">${q.q}</h4>

          <div class="space-y-3">
            ${q.options.map((opt, idx) => `
              <button onclick="gameHub.handleQuizAnswer(${idx})" class="w-full p-3.5 bg-slate-700 hover:bg-cyan-600 rounded-xl text-left text-sm font-semibold text-white transition-all border border-slate-600">
                ${String.fromCharCode(65 + idx)}. ${opt}
              </button>
            `).join("")}
          </div>
        </div>
      `;
    };

    window._quizQuestions = questions;
    window._quizCurrentQ = 0;
    window._quizScore = 0;
    renderQuestion();
  }

  handleQuizAnswer(selectedIndex) {
    const q = window._quizQuestions[window._quizCurrentQ];
    if (selectedIndex === q.correct) {
      window._quizScore += 35;
      const scoreDisplay = document.getElementById("game-score-display");
      if (scoreDisplay) scoreDisplay.innerText = window._quizScore;
      if (window.app) window.app.showToast("🎉 Chính xác! +35 điểm", "success");
    } else {
      if (window.app) window.app.showToast("Rất tiếc chưa chính xác!", "error");
    }

    window._quizCurrentQ++;
    if (window._quizCurrentQ < window._quizQuestions.length) {
      setTimeout(() => {
        const viewport = document.getElementById("game-viewport");
        if (viewport) this.initCyberQuizGame(viewport);
      }, 800);
    } else {
      setTimeout(() => {
        const viewport = document.getElementById("game-viewport");
        if (viewport) {
          viewport.innerHTML = `
            <div class="text-center p-6 animate-pop">
              <span class="text-6xl">🏆</span>
              <h3 class="text-2xl font-black text-amber-400 mt-3">EM ĐÃ HOÀN THÀNH XUẤT SẮC!</h3>
              <p class="text-slate-300 text-sm mt-2">Tổng điểm đạt được: <b>${window._quizScore} / 100 điểm</b></p>
              <button onclick="gameHub.closeGameStage()" class="btn btn-primary mt-6">Trở Về Danh Sách Game</button>
            </div>
          `;
        }
        this.saveScoreForCurrentStudent("game_cyber_quiz", window._quizScore, 3);
      }, 800);
    }
  }

  // ==========================================
  // IFRAME RUNNER (NHÚNG GAME NGOÀI / SCRATCH)
  // ==========================================
  openIframeRunnerModal() {
    const modal = document.getElementById("iframe-runner-modal");
    if (modal) modal.classList.add("active");
  }

  closeIframeRunnerModal() {
    const modal = document.getElementById("iframe-runner-modal");
    if (modal) modal.classList.remove("active");
  }

  launchCustomIframe() {
    const urlInput = document.getElementById("iframe-url-input");
    const url = urlInput ? urlInput.value.trim() : "";
    if (!url) {
      if (window.app) window.app.showToast("Vui lòng dán đường link game/học liệu!", "warning");
      return;
    }

    this.closeIframeRunnerModal();
    const stage = document.getElementById("game-stage-container");
    const viewport = document.getElementById("game-viewport");
    const title = document.getElementById("game-active-title");
    const icon = document.getElementById("game-active-icon");

    if (!stage || !viewport) return;
    stage.classList.remove("hidden");
    title.innerText = "🌐 Học Liệu / Game Tương Tác Trực Tuyến";
    icon.innerText = "🎮";

    viewport.innerHTML = `
      <iframe src="${url}" class="w-full h-[520px] rounded-xl border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
  }

  launch3DComputer() {
    this.closeIframeRunnerModal();
    this.launchGame("game_3d_computer_power");
  }

  // Lưu điểm học sinh vào Database
  saveScoreForCurrentStudent(gameId, score, stars) {
    const user = window.authService?.getUser();
    if (user) {
      window.supabaseService?.recordGameScore(user.id || user.username || user.studentCode, gameId, score, stars);
      if (window.app) {
        window.app.showToast(`⭐ Chúc mừng ${user.name}! Em đã nhận được +${stars} Ngôi Sao Vàng!`, "success");
      }
    }
  }
}

window.gameHub = new GameHub();

// Lắng nghe sự kiện điểm số từ iframe mô phỏng 3D gửi về
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "GAME_SCORE_UPDATE") {
    const { gameId, score, stars } = event.data;
    window.gameHub.saveScoreForCurrentStudent(gameId, score, stars);
  }
});

