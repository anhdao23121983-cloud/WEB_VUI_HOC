/**
 * ARENA PORTAL COMPONENT - ĐẤU TRƯỜNG TIN HỌC
 * Hệ thống Đấu Trường Trực Tuyến & Quản Trị Ngân Hàng Câu Hỏi (Thêm, Sửa, Xóa, Đồng Bộ Supabase)
 */

class ArenaPortal {
  constructor() {
    this.currentTab = "live_arena"; // "live_arena" | "question_bank" | "leaderboard"
    this.selectedGrade = "all";     // "all" | 3 | 4 | 5
    this.selectedTopic = "all";
    
    // Live Arena Battle State
    this.battleActive = false;
    this.battleQuestions = [];
    this.currentQIndex = 0;
    this.userAnswers = [];
    this.score = 0;
    this.starsEarned = 0;
    this.timer = 15;
    this.timerInterval = null;
    this.selectedOptionIndex = null;
    this.isAnswerRevealed = false;
    this.audioCtx = null;
    
    // BGM Audio Engine State (Nhạc nền sôi động & hồi hộp)
    this.isBGMPlaying = localStorage.getItem("arena_bgm_enabled") !== "false";
    this.bgmVolume = parseFloat(localStorage.getItem("arena_bgm_volume")) || 0.22;
    this.bgmMode = "lobby";
    this.bgmCtx = null;
    this.bgmTimer = null;
    this.noiseBuffer = null;
    this.masterBGMGain = null;

    // Editing modal state
    this.editingQuestionId = null;

    // Direct Lobby Selection State (Grade, Lesson KNTT, Question Count)
    this.selectedLobbyGrade = 3;
    this.selectedLobbyLesson = "all";
    this.selectedLobbyQuestionCount = 10;
    this.selectedQuestionCount = 10;
    this.lastMatchSummary = null;
    this.selectedMascot = localStorage.getItem("arena_mascot") || "🤖";
    this.speedStarsCount = 0;
    this.lastAnswerSpeedBonus = null;
  }

  // Danh sách 6 Linh Vật Đại Diện ngộ nghĩnh (Gợi ý 2)
  getMascots() {
    return [
      { id: "🤖", name: "Robot Thông Thái", desc: "Tính toán siêu tốc" },
      { id: "🐱", name: "Mèo Công Nghệ", desc: "Lanh lợi, hoạt bát" },
      { id: "🚀", name: "Phi Thuyền Vũ Trụ", desc: "Tốc độ phi thường" },
      { id: "🦁", name: "Sư Tử Dũng Cảm", desc: "Bản lĩnh kiên cường" },
      { id: "🦄", name: "Kỳ Lân Sáng Tạo", desc: "Tư duy đột phá" },
      { id: "🦊", name: "Cáo Nhanh Trí", desc: "Phản xạ thần tốc" }
    ];
  }

  // Chọn Linh Vật Đại Diện
  selectMascot(mascotId) {
    this.selectedMascot = mascotId;
    localStorage.setItem("arena_mascot", mascotId);
    const user = window.authService?.getUser();
    if (user) {
      user.avatar = mascotId;
      localStorage.setItem("app_current_user", JSON.stringify(user));
    }
    this.playBeep(520, 0.1);
    window.app?.showToast?.(`🎭 Em đã chọn Linh Vật ${mascotId}! Sẵn sàng thi đấu!`, "success");

    // Cập nhật giao diện mascot tức thì không làm mất trạng thái form chọn bài
    this.getMascots().forEach(m => {
      const btn = document.getElementById(`mascot-btn-${m.id}`);
      if (btn) {
        if (m.id === mascotId) {
          btn.className = "p-1 sm:p-1.5 rounded-xl border-2 transition-all flex flex-col items-center gap-0.5 bg-gradient-to-b from-amber-500/30 via-yellow-400/20 to-amber-500/10 border-amber-400 text-white shadow-md ring-2 ring-amber-300 scale-102 cursor-pointer";
        } else {
          btn.className = "p-1 sm:p-1.5 rounded-xl border-2 transition-all flex flex-col items-center gap-0.5 bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500 cursor-pointer";
        }
      }
    });

    const label = document.getElementById("selected-mascot-label");
    if (label) label.innerText = mascotId;
  }

  // Khởi tạo Audio Context
  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playBeep(freq = 440, duration = 0.15) {
    try {
      this.initAudio();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  playVictorySound() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.25), idx * 100);
    });
  }

  // Âm thanh chuông gió lấp lánh khi đạt Sao Vàng Thần Tốc (<5s)
  playSpeedStarChime() {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.18), idx * 60);
    });
  }

  playWrongSound() {
    this.playBeep(220, 0.35);
  }

  // Chuyển Tab
  switchTab(tab) {
    this.currentTab = tab;
    if (tab !== "live_arena") {
      this.stopSynthBGM();
    }
    this.render("main-content-area");
  }

  // Lọc theo Khối Lớp
  filterGrade(grade) {
    this.selectedGrade = grade;
    this.render("main-content-area");
  }

  // =========================================================================
  // GIAO DIỆN CHÍNH (RENDER PORTAL)
  // =========================================================================
  async render(containerId = "main-content-area") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-4 animate-pop">
        <!-- BANNER HEADER ĐẤU TRƯỜNG TIN HỌC (PHIÊN BẢN COMPACT GỌN GÀNG) -->
        <div class="banner-anhdao flex flex-col lg:flex-row items-center justify-between gap-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 border border-slate-700/80 shadow-xl p-3.5 md:p-4 rounded-2xl text-white">
          <div class="space-y-1 text-center lg:text-left">
            <div class="flex items-center gap-1.5 justify-center lg:justify-start flex-wrap">
              <span class="badge bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider py-0.5 px-2">⚡ ĐẤU TRƯỜNG</span>
              <span class="badge bg-white/15 text-slate-200 font-bold text-[10px] py-0.5 px-2">GDPT 2018 • TIN HỌC 3 - 5</span>
              <span class="badge bg-rose-500 text-white font-black text-[10px] animate-pulse py-0.5 px-2">🔥 LIVE ARENA</span>
            </div>
            <h2 class="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 leading-snug">
              ⚡ ĐẤU TRƯỜNG TIN HỌC TIỂU HỌC ⚡
            </h2>
            <p class="text-slate-300 text-[11px] md:text-xs max-w-xl line-clamp-1 md:line-clamp-2">
              Sàn đấu trí tuệ công nghệ: Tranh tài nhanh 15s, ngân hàng câu hỏi chuẩn SGK, vinh danh Bảng Vàng thời gian thực!
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap justify-center lg:justify-end shrink-0">
            <button onclick="arenaPortal.openBossBattleModal()" class="btn bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white btn-xs font-black shadow-md flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:scale-105 transition-all animate-pulse">
              <span>👾</span> <span>Đấu Trùm AI</span>
            </button>
            <button onclick="arenaPortal.toggleArenaBGM()" id="btn-arena-bgm" class="btn bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white btn-xs font-black shadow-md flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:scale-105 transition-all">
              <span>🎵</span> <span id="lbl-arena-bgm">${this.isBGMPlaying ? 'BGM: BẬT' : 'BGM: TẮT'}</span>
            </button>
            <button onclick="arenaPortal.openTournamentModal()" class="btn bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white btn-xs font-black shadow-md flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:scale-105 transition-all">
              <span>🏆</span> <span>Giải Đấu Lớp</span>
            </button>
            <button onclick="arenaPortal.openRoomModal()" class="btn bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white btn-xs font-black shadow-md flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:scale-105 transition-all">
              <span>⚔️</span> <span>Đấu 1vs1 Phòng</span>
            </button>
            <button onclick="arenaPortal.openQuestionModal()" class="btn bg-amber-400 hover:bg-amber-300 text-slate-950 btn-xs font-black shadow-md flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:scale-105 transition-all">
              <span>➕</span> <span>Thêm Câu Hỏi</span>
            </button>
            <button onclick="arenaPortal.startNewBattle()" class="btn bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white btn-xs font-black shadow-md flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:scale-105 transition-all ring-1 ring-rose-400">
              <span>⚡</span> <span>Vào Đấu Ngay</span>
            </button>
          </div>
        </div>

        <!-- THANH ĐIỀU HƯỚNG 3 TAB CHÍNH (GỌN GÀNG) -->
        <div class="flex items-center justify-between bg-white p-2 md:p-2.5 rounded-xl border border-slate-200 shadow-xs flex-wrap gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <button onclick="arenaPortal.switchTab('live_arena')" class="px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1.5 ${this.currentTab === 'live_arena' ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-xs ring-1 ring-rose-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🎮</span> <span>Sàn Đấu Trực Tiếp</span>
            </button>

            <button onclick="arenaPortal.switchTab('question_bank')" class="px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1.5 ${this.currentTab === 'question_bank' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs ring-1 ring-cyan-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📚</span> <span>Ngân Hàng Câu Hỏi</span>
            </button>

            <button onclick="arenaPortal.switchTab('leaderboard')" class="px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1.5 ${this.currentTab === 'leaderboard' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs ring-1 ring-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🏆</span> <span>Bảng Vàng Quán Quân</span>
            </button>
          </div>

          <!-- Lọc Khối Lớp -->
          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <span class="text-[11px] font-bold text-slate-500 px-1.5">Khối:</span>
            <button onclick="arenaPortal.filterGrade('all')" class="px-2 py-0.5 rounded-md text-xs font-bold ${this.selectedGrade === 'all' ? 'bg-white text-rose-700 shadow-xs font-black' : 'text-slate-600 hover:bg-white/60'}">Tất cả</button>
            <button onclick="arenaPortal.filterGrade(3)" class="px-2 py-0.5 rounded-md text-xs font-bold ${this.selectedGrade === 3 ? 'bg-cyan-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-white/60'}">Lớp 3</button>
            <button onclick="arenaPortal.filterGrade(4)" class="px-2 py-0.5 rounded-md text-xs font-bold ${this.selectedGrade === 4 ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-white/60'}">Lớp 4</button>
            <button onclick="arenaPortal.filterGrade(5)" class="px-2 py-0.5 rounded-md text-xs font-bold ${this.selectedGrade === 5 ? 'bg-amber-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-white/60'}">Lớp 5</button>
          </div>
        </div>

        <!-- NỘI DUNG CHÍNH THEO TAB -->
        <div id="arena-tab-content">
          ${await this.renderTabContent()}
        </div>
      </div>

      <!-- MODAL SOẠN / CHỈNH SỬA CÂU HỎI ĐẤU TRƯỜNG -->
      <div id="arena-question-modal" class="modal-backdrop">
        <div class="modal-content p-6 md:p-8 max-w-2xl space-y-5 bg-white rounded-3xl shadow-2xl border border-slate-200">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div class="flex items-center gap-2">
              <span class="text-2xl p-1.5 bg-rose-100 text-rose-600 rounded-xl">⚡</span>
              <div>
                <h3 id="arena-modal-title" class="text-lg font-black text-slate-900">➕ THÊM CÂU HỎI ĐẤU TRƯỜNG</h3>
                <p class="text-xs text-slate-500 font-semibold">Tự động đồng bộ lên Supabase Cloud Database và Bộ nhớ máy</p>
              </div>
            </div>
            <button onclick="arenaPortal.closeQuestionModal()" class="text-slate-400 text-2xl font-bold hover:text-slate-600">✕</button>
          </div>

          <form onsubmit="arenaPortal.handleSaveQuestion(event)" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="form-group">
                <label class="form-label font-black text-slate-700">Khối Lớp (*)</label>
                <select id="aq-grade-select" class="form-control font-bold" required>
                  <option value="3">Tin Học Lớp 3</option>
                  <option value="4">Tin Học Lớp 4</option>
                  <option value="5">Tin Học Lớp 5</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label font-black text-slate-700">Chủ Đề Kiến Thức</label>
                <input type="text" id="aq-topic-input" class="form-control font-medium" placeholder="VD: Phần cứng, Lập trình Scratch..." value="Kiến thức chung">
              </div>

              <div class="form-group">
                <label class="form-label font-black text-slate-700">Thời Gian Đếm Ngược</label>
                <select id="aq-time-select" class="form-control font-bold">
                  <option value="10">10 Giây (Thần tốc)</option>
                  <option value="15" selected>15 Giây (Chuẩn)</option>
                  <option value="20">20 Giây (Nâng cao)</option>
                  <option value="30">30 Giây (Thử thách)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label font-black text-slate-700">Nội Dung Câu Hỏi Đấu Trường (*)</label>
              <textarea id="aq-question-text" rows="2" class="form-control text-xs font-semibold" placeholder="Nhập câu hỏi thách đố kiến thức Tin học..." required></textarea>
            </div>

            <!-- 4 Đáp Án A, B, C, D -->
            <div class="space-y-2">
              <label class="form-label font-black text-slate-700">4 Phương Án Trả Lời (Chọn nút tròn tại Đáp Án ĐÚNG):</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <input type="radio" name="aq-correct-radio" value="0" checked class="w-4 h-4 text-rose-600 accent-rose-600 cursor-pointer">
                  <span class="font-black text-rose-700 w-5">A.</span>
                  <input type="text" id="aq-opt-0" class="form-control text-xs flex-1 font-medium" placeholder="Nhập đáp án A..." required>
                </div>
                <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <input type="radio" name="aq-correct-radio" value="1" class="w-4 h-4 text-rose-600 accent-rose-600 cursor-pointer">
                  <span class="font-black text-rose-700 w-5">B.</span>
                  <input type="text" id="aq-opt-1" class="form-control text-xs flex-1 font-medium" placeholder="Nhập đáp án B..." required>
                </div>
                <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <input type="radio" name="aq-correct-radio" value="2" class="w-4 h-4 text-rose-600 accent-rose-600 cursor-pointer">
                  <span class="font-black text-rose-700 w-5">C.</span>
                  <input type="text" id="aq-opt-2" class="form-control text-xs flex-1 font-medium" placeholder="Nhập đáp án C..." required>
                </div>
                <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <input type="radio" name="aq-correct-radio" value="3" class="w-4 h-4 text-rose-600 accent-rose-600 cursor-pointer">
                  <span class="font-black text-rose-700 w-5">D.</span>
                  <input type="text" id="aq-opt-3" class="form-control text-xs flex-1 font-medium" placeholder="Nhập đáp án D..." required>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label font-black text-slate-700">Lời Giải Thích Sư Phạm (Hiện khi trả lời xong)</label>
                <input type="text" id="aq-explanation" class="form-control text-xs" placeholder="VD: Thân máy tính chứa CPU xử lý thông tin...">
              </div>

              <div class="form-group">
                <label class="form-label font-black text-slate-700">Số Sao Thưởng ⭐</label>
                <input type="number" id="aq-stars-reward" class="form-control text-xs font-bold text-amber-600" value="20" min="5" max="100">
              </div>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-slate-200">
              <button type="button" onclick="arenaPortal.generateAIQuestionDraft()" class="btn btn-amber btn-sm font-black flex items-center gap-1 shadow-sm">
                <span>✨</span> <span>AI Soạn Gợi Ý</span>
              </button>
              <div class="flex items-center gap-2">
                <button type="button" onclick="arenaPortal.closeQuestionModal()" class="btn btn-outline btn-sm font-bold">Hủy</button>
                <button type="submit" class="btn bg-rose-600 hover:bg-rose-500 text-white btn-sm font-black shadow-md flex items-center gap-1.5">
                  <span>💾</span> <span>Lưu Câu Hỏi</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    // Gắn trực tiếp Event Listener cho nút Vào Đấu Ngay để bảo đảm click 100% hoạt động
    const startBtn = document.getElementById("btn-start-arena-battle");
    if (startBtn) {
      startBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.arenaPortal ? window.arenaPortal.startLobbyBattle() : this.startLobbyBattle();
      });
    }
  }

  // Render nội dung của Tab hiện tại
  async renderTabContent() {
    if (this.currentTab === "live_arena") {
      return this.renderLiveArenaView();
    } else if (this.currentTab === "question_bank") {
      return await this.renderQuestionBankView();
    } else if (this.currentTab === "leaderboard") {
      return this.renderLeaderboardView();
    }
    return "";
  }

  // =========================================================================
  // TAB 1: 🎮 LIVE ARENA VIEW (SÀN ĐẤU TRỰC TIẾP REALTIME)
  // =========================================================================
  renderLiveArenaView() {
    // Stage 1: Matchmaking Lobby
    if (this.matchStage === "matchmaking") {
      return this.renderMatchmakingLobbyView();
    }

    // Stage 2: Countdown 3-2-1
    if (this.matchStage === "countdown") {
      return this.renderCountdownView();
    }

    if (!this.battleActive) {
      const user = window.authService?.getUser() || { name: "Học Sinh", grade: 3 };
      if (!this.selectedLobbyGradeInitialized && user.grade) {
        this.selectedLobbyGrade = parseInt(user.grade) || 3;
        this.selectedLobbyGradeInitialized = true;
      }

      return `
        <div class="space-y-3">
          <!-- HERO BANNER VÀ BẢNG ĐIỀU KHIỂN ĐẤU TRƯỜNG (COMPACT SLIM UI) -->
          <div class="max-w-xl mx-auto p-3 sm:p-4 bg-slate-950 text-white rounded-2xl border border-rose-500/40 shadow-xl space-y-2.5 animate-pop relative overflow-hidden">
            <div class="absolute -top-24 -left-24 w-60 h-60 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-24 -right-24 w-60 h-60 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div class="space-y-1 text-center relative z-10">
              <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 border border-rose-400/40 rounded-full text-rose-300 font-black text-[9px] uppercase tracking-wider">
                <span>⚡</span> SÀN ĐẤU TRẮC NGHIỆM TRỰC TUYẾN THỜI GIAN THỰC
              </div>
              <h3 class="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-300">
                ĐẤU TRƯỜNG TIN HỌC TIỂU HỌC
              </h3>
              <p class="text-slate-300 text-[10px] sm:text-[11px] max-w-lg mx-auto leading-normal">
                Hệ thống câu hỏi trắc nghiệm chuẩn <b>SGK Tin học Kết nối tri thức với cuộc sống</b>. Tự chọn Khối lớp, Bài học và leo Bảng Vàng!
              </p>

              <!-- LỜI CHÀO MỪNG DŨNG SĨ ĐẤU TRƯỜNG (GỌN GÀNG) -->
              <div class="p-2 bg-gradient-to-r from-amber-500/15 via-yellow-400/15 to-amber-500/15 rounded-xl border border-amber-400/40 flex items-center justify-between gap-2 text-xs mt-1.5">
                <div class="flex items-center gap-1.5 text-left">
                  <span class="text-base animate-bounce">⚡</span>
                  <div>
                    <span class="text-amber-300 font-black text-[11px] sm:text-xs">Xin chào dũng sĩ ${user.name || "Học sinh"} (${user.className || user.class || "Khối " + (user.grade || 3)})!</span>
                    <p class="text-slate-300 text-[9px] sm:text-[10px]">Sẵn sàng tranh tài! Chọn bài học bên dưới để bắt đầu leo Bảng Vàng!</p>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button type="button" onclick="arenaPortal.toggleArenaBGM()" id="btn-lobby-bgm" class="btn ${this.isBGMPlaying ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'} font-black btn-xs shadow-xs px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer">
                    <span>${this.isBGMPlaying ? '🔊' : '🔇'}</span> <span id="lbl-lobby-bgm">${this.isBGMPlaying ? 'Nhạc: BẬT' : 'Nhạc: TẮT'}</span>
                  </button>
                  <button type="button" onclick="arenaPortal.switchTab('leaderboard')" class="btn bg-amber-400 hover:bg-amber-300 text-slate-950 font-black btn-xs shadow-xs shrink-0 px-2 py-0.5 rounded-lg text-[10px]">
                    🏆 Bảng Vàng
                  </button>
                </div>
              </div>
            </div>

            <!-- BẢNG ĐIỀU KHIỂN CHỌN BÀI & CẤU HÌNH ĐẤU TRƯỜNG TRỰC TIẾP (COMPACT) -->
            <div class="bg-slate-900/95 rounded-xl border border-amber-400/50 p-2.5 sm:p-3.5 space-y-2.5 shadow-xl relative z-10 backdrop-blur-md text-left">
              
              <!-- 1. CHỌN KHỐI LỚP (3, 4, 5) -->
              <div class="space-y-1">
                <label class="font-black text-[10px] text-amber-300 flex items-center gap-1 uppercase tracking-wider">
                  <span>🎒</span> <span>BƯỚC 1: CHỌN KHỐI LỚP THI ĐẤU</span>
                </label>
                <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button type="button" onclick="arenaPortal.selectLobbyGrade(3)" id="lobby-grade-3" class="p-1.5 sm:p-2 rounded-xl border-2 font-black text-[11px] sm:text-xs text-center transition-all flex flex-col items-center gap-0.5 ${this.selectedLobbyGrade === 3 ? 'bg-cyan-600 border-cyan-300 text-white shadow-md ring-2 ring-cyan-300 scale-102' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'}">
                    <span class="text-base sm:text-lg">🎒</span>
                    <span>Tin Lớp 3</span>
                    <span class="text-[8.5px] opacity-80 font-normal">SGK Kết Nối Tri Thức</span>
                  </button>
                  <button type="button" onclick="arenaPortal.selectLobbyGrade(4)" id="lobby-grade-4" class="p-1.5 sm:p-2 rounded-xl border-2 font-black text-[11px] sm:text-xs text-center transition-all flex flex-col items-center gap-0.5 ${this.selectedLobbyGrade === 4 ? 'bg-emerald-600 border-emerald-300 text-white shadow-md ring-2 ring-emerald-300 scale-102' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'}">
                    <span class="text-base sm:text-lg">🚀</span>
                    <span>Tin Lớp 4</span>
                    <span class="text-[8.5px] opacity-80 font-normal">SGK Kết Nối Tri Thức</span>
                  </button>
                  <button type="button" onclick="arenaPortal.selectLobbyGrade(5)" id="lobby-grade-5" class="p-1.5 sm:p-2 rounded-xl border-2 font-black text-[11px] sm:text-xs text-center transition-all flex flex-col items-center gap-0.5 ${this.selectedLobbyGrade === 5 ? 'bg-amber-600 border-amber-300 text-white shadow-md ring-2 ring-amber-300 scale-102' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'}">
                    <span class="text-base sm:text-lg">⭐</span>
                    <span>Tin Lớp 5</span>
                    <span class="text-[8.5px] opacity-80 font-normal">SGK Kết Nối Tri Thức</span>
                  </button>
                </div>
              </div>

              <!-- 2. CHỌN BÀI HỌC THEO SGK KẾT NỐI TRI THỨC -->
              <div class="space-y-1">
                <label class="font-black text-[10px] text-amber-300 flex items-center gap-1 uppercase tracking-wider">
                  <span>📖</span> <span>BƯỚC 2: CHỌN BÀI THEO SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG:</span>
                </label>
                <div class="relative">
                  <select id="lobby-lesson-select" onchange="arenaPortal.handleLobbyLessonChange(this.value)" class="form-control font-bold text-xs p-2 bg-slate-950 border border-slate-700 text-amber-200 rounded-xl focus:border-amber-400 cursor-pointer w-full">
                    ${this.renderLobbyLessonOptions(this.selectedLobbyGrade || 3)}
                  </select>
                </div>
              </div>

              <!-- 3. CHỌN SỐ LƯỢNG CÂU HỎI -->
              <div class="space-y-1">
                <label class="font-black text-[10px] text-amber-300 flex items-center gap-1 uppercase tracking-wider">
                  <span>⚡</span> <span>BƯỚC 3: CHỌN SỐ LƯỢNG CÂU HỎI TRẮC NGHIỆM:</span>
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  <button type="button" onclick="arenaPortal.selectLobbyQuestionCount(5)" id="lobby-count-5" class="p-1.5 rounded-xl border-2 font-black text-[11px] text-center transition-all ${this.selectedLobbyQuestionCount === 5 ? 'bg-rose-600 border-rose-300 text-white shadow-sm ring-2 ring-rose-300' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'}">
                    🌱 5 CÂU
                    <span class="block text-[8px] font-normal opacity-80 mt-0.5">Khởi Động</span>
                  </button>
                  <button type="button" onclick="arenaPortal.selectLobbyQuestionCount(10)" id="lobby-count-10" class="p-1.5 rounded-xl border-2 font-black text-[11px] text-center transition-all ${this.selectedLobbyQuestionCount === 10 ? 'bg-rose-600 border-rose-300 text-white shadow-sm ring-2 ring-rose-300' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'}">
                    🎯 10 CÂU
                    <span class="block text-[8px] font-normal opacity-80 mt-0.5">Tiêu Chuẩn</span>
                  </button>
                  <button type="button" onclick="arenaPortal.selectLobbyQuestionCount(15)" id="lobby-count-15" class="p-1.5 rounded-xl border-2 font-black text-[11px] text-center transition-all ${this.selectedLobbyQuestionCount === 15 ? 'bg-rose-600 border-rose-300 text-white shadow-sm ring-2 ring-rose-300' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'}">
                    🔥 15 CÂU
                    <span class="block text-[8px] font-normal opacity-80 mt-0.5">Thử Thách</span>
                  </button>
                  <button type="button" onclick="arenaPortal.selectLobbyQuestionCount(20)" id="lobby-count-20" class="p-1.5 rounded-xl border-2 font-black text-[11px] text-center transition-all ${this.selectedLobbyQuestionCount === 20 ? 'bg-rose-600 border-rose-300 text-white shadow-sm ring-2 ring-rose-300' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'}">
                    🏆 20 CÂU
                    <span class="block text-[8px] font-normal opacity-80 mt-0.5">Toàn Diện</span>
                  </button>
                </div>
              </div>

              <!-- 4. CHỌN LINH VẬT ĐẠI DIỆN THI ĐẤU (AVATAR MASCOT - GỢI Ý 2) -->
              <div class="space-y-1">
                <div class="flex items-center justify-between flex-wrap gap-1">
                  <label class="font-black text-[10px] text-amber-300 flex items-center gap-1 uppercase tracking-wider">
                    <span>🎭</span> <span>BƯỚC 4: CHỌN LINH VẬT ĐẠI DIỆN THI ĐẤU:</span>
                  </label>
                  <span class="text-[9.5px] text-amber-200/90 font-bold">Đang chọn: <b id="selected-mascot-label" class="text-amber-300 text-[11px] font-black">${this.selectedMascot || "🤖"}</b></span>
                </div>
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5">
                  ${this.getMascots().map(m => {
                    const isSelected = (this.selectedMascot || "🤖") === m.id;
                    return `
                      <button type="button" id="mascot-btn-${m.id}" onclick="arenaPortal.selectMascot('${m.id}')" class="p-1 sm:p-1.5 rounded-xl border-2 transition-all flex flex-col items-center gap-0.5 cursor-pointer ${isSelected ? 'bg-gradient-to-b from-amber-500/30 via-yellow-400/20 to-amber-500/10 border-amber-400 text-white shadow-md ring-2 ring-amber-300 scale-102' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500'}">
                        <span class="text-base sm:text-lg filter drop-shadow">${m.id}</span>
                        <span class="text-[8.5px] font-black leading-tight text-center text-white">${m.name}</span>
                        <span class="text-[7.5px] opacity-75 font-normal text-center hidden sm:inline text-slate-300">${m.desc}</span>
                      </button>
                    `;
                  }).join("")}
                </div>
              </div>

              <!-- 5. NÚT VÀO ĐẤU GỌN GÀNG NỔI BẬT -->
              <div class="pt-1">
                <button type="button" id="btn-start-arena-battle" onclick="window.arenaPortal.startLobbyBattle()" class="w-full py-2.5 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-500 hover:to-yellow-500 shadow-md shadow-amber-400/20 hover:scale-101 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-200">
                  <span class="text-base sm:text-lg animate-pulse">🚀</span> <span>BẮT ĐẦU VÀO ĐẤU NGAY ▶</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Stage 3: GIAO DIỆN TRẬN ĐẤU ĐANG DIỄN RA
    const q = this.battleQuestions[this.currentQIndex];
    if (!q) return `<div class="text-center p-8">Đang tải câu hỏi...</div>`;

    const sortedCompetitors = [...(this.competitors || [])].sort((a, b) => b.score - a.score);
    const userRank = sortedCompetitors.findIndex(c => c.isUser) + 1;

    return `
      <div class="p-6 md:p-8 bg-slate-950 text-white rounded-3xl border-2 border-rose-500 shadow-2xl space-y-5 animate-pop relative">
        <!-- Header Thanh Trận Đấu -->
        <div class="flex items-center justify-between pb-3 border-b border-rose-500/40 flex-wrap gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="badge bg-rose-600 text-white font-black text-xs uppercase px-3 py-1">
              CÂU HỎI ${this.currentQIndex + 1} / ${this.battleQuestions.length}
            </span>
            ${q.difficulty === 'hard' 
              ? `<span class="badge bg-rose-950/80 border border-rose-500 text-rose-300 font-black text-xs">🔴 VẬN DỤNG • ${this.questionMaxTimer || 25}s</span>`
              : q.difficulty === 'medium'
              ? `<span class="badge bg-amber-950/80 border border-amber-400 text-amber-300 font-black text-xs">🟡 THÔNG HIỂU • ${this.questionMaxTimer || 20}s</span>`
              : `<span class="badge bg-emerald-950/80 border border-emerald-400 text-emerald-300 font-black text-xs">🟢 NHẬN BIẾT • ${this.questionMaxTimer || 15}s</span>`
            }
            <span class="badge ${userRank === 1 ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-lg shadow-amber-400/50 ring-2 ring-yellow-200 animate-bounce' : userRank === 2 ? 'bg-slate-300 text-slate-950' : userRank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'} font-black text-xs px-2.5 py-1">
              ${userRank === 1 ? '👑🥇 BẠN DẪN ĐẦU TOP 1 👏' : userRank === 2 ? '🥈 THỨ HẠNG TOP 2' : userRank === 3 ? '🥉 THỨ HẠNG TOP 3' : '🎖️ THỨ HẠNG TOP 4'}
            </span>
          </div>

          <div class="flex items-center gap-3">
            ${this.streakCombo > 1 ? `
              <span class="badge bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-xs animate-bounce px-3 py-1">
                🔥 COMBO x${this.streakCombo}!
              </span>
            ` : ''}

            <!-- Điểm số & Sao -->
            <div class="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span class="text-xs text-slate-400">Điểm:</span>
              <span class="font-black text-amber-400 text-sm">${this.score}</span>
              <span class="text-xs text-slate-400 ml-2">Sao:</span>
              <span class="font-black text-amber-300 text-sm">⭐ +${this.starsEarned}</span>
            </div>

            <!-- Đồng Hồ Đếm Ngược -->
            <div class="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-950 border border-rose-500/60 rounded-xl">
              <span class="text-base animate-spin">⏱️</span>
              <span id="arena-timer-display" class="font-mono text-lg font-black ${this.timer <= 5 ? 'text-rose-400 animate-ping' : 'text-amber-300'}">${this.timer}s</span>
            </div>

            <!-- Nút Bật/Tắt Nhạc Nền Trong Trận -->
            <button type="button" onclick="arenaPortal.toggleArenaBGM()" id="btn-battle-bgm-toggle" class="p-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-sm shadow-sm transition-all cursor-pointer" title="${this.isBGMPlaying ? 'Nhạc Nền: BẬT (Bấm để Tắt)' : 'Nhạc Nền: TẮT (Bấm để Bật)'}">
              <span>${this.isBGMPlaying ? '🔊' : '🔇'}</span>
            </button>

            <button onclick="arenaPortal.exitBattle()" class="btn btn-outline btn-xs text-slate-400 hover:text-white">✕ Thoát</button>
          </div>
        </div>

        <!-- BẢNG ĐIỂM ĐỐI THỦ REALTIME -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-800">
          ${sortedCompetitors.map((c, idx) => `
            <div class="p-2 rounded-xl flex items-center gap-2 ${c.isUser ? 'bg-indigo-900/80 border-2 border-indigo-400' : 'bg-slate-800/80 border border-slate-700'}">
              <span class="text-xl">${c.avatar}</span>
              <div class="overflow-hidden leading-tight flex-1">
                <p class="font-black text-xs text-white truncate">${c.name} ${c.isUser ? '(BẠN)' : ''}</p>
                <p class="text-[10px] text-amber-300 font-bold">${c.score} Điểm • ${idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : '🎖️ 4th'}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Thanh Tiến Trình Thời Gian -->
        <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div id="arena-timer-bar" class="h-2.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-all duration-1000" style="width: ${(this.timer / (this.questionMaxTimer || 15)) * 100}%"></div>
        </div>

        <!-- Khung Câu Hỏi Nổi Bật -->
        <div class="p-6 bg-gradient-to-br from-slate-900 to-slate-900/80 border-2 border-rose-400/40 rounded-2xl space-y-2 text-center">
          <span class="text-xs font-black text-rose-400 uppercase tracking-widest">THỬ THÁCH ĐẤU TRƯỜNG</span>
          <h3 class="text-lg md:text-2xl font-black text-white leading-snug">
            ${q.question}
          </h3>
        </div>

        <!-- 4 Lựa Chọn Đáp Án A, B, C, D -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          ${q.options.map((opt, idx) => {
            let optClass = "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200";
            if (this.isAnswerRevealed) {
              if (idx === q.correctIndex) {
                optClass = "bg-emerald-600/90 border-emerald-400 text-white font-black ring-4 ring-emerald-300/40 shadow-lg scale-102";
              } else if (idx === this.selectedOptionIndex && idx !== q.correctIndex) {
                optClass = "bg-rose-600/90 border-rose-400 text-white font-black ring-4 ring-rose-300/40";
              } else {
                optClass = "bg-slate-900/50 border-slate-800 text-slate-500 opacity-50";
              }
            } else if (this.selectedOptionIndex === idx) {
              optClass = "bg-rose-700 text-white border-rose-400 ring-2 ring-rose-300";
            }

            return `
              <button onclick="arenaPortal.handleSelectAnswer(${idx})" ${this.isAnswerRevealed ? 'disabled' : ''} class="p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 shadow-md hover:scale-101 ${optClass}">
                <span class="text-sm md:text-base font-bold leading-snug">${opt}</span>
                <span class="text-base shrink-0">${this.isAnswerRevealed && idx === q.correctIndex ? '✅' : this.isAnswerRevealed && idx === this.selectedOptionIndex ? '❌' : '⚡'}</span>
              </button>
            `;
          }).join("")}
        </div>

        <!-- Giải thích Sư phạm (Khi đã chọn xong) -->
        ${this.isAnswerRevealed ? `
          <div class="p-4 rounded-2xl border ${this.selectedOptionIndex === q.correctIndex ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/40 border-rose-500/50 text-rose-200'} space-y-2 animate-pop">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-black text-sm">${this.selectedOptionIndex === q.correctIndex ? '🎉 CHÍNH XÁC! TUYỆT VỜI!' : '⚠️ CHƯA CHÍNH XÁC!'}</p>
                ${this.lastAnswerSpeedBonus?.isSpeed ? `
                  <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm animate-pulse">
                    ⚡ PHẢN XẠ THẦN TỐC (${this.lastAnswerSpeedBonus.timeSpent}s)! Thưởng nóng +10 ⭐
                  </span>
                ` : ''}
              </div>
              <button onclick="arenaPortal.nextQuestion()" class="btn btn-amber btn-md font-black shadow-lg flex items-center gap-1">
                <span>${this.currentQIndex + 1 === this.battleQuestions.length ? '🏁 Xem Kết Quả' : 'Câu Tiếp Theo ▶'}</span>
              </button>
            </div>
            <p class="text-xs text-slate-300">${q.explanation || 'Hãy ghi nhớ kiến thức cốt lõi này nhé!'}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderMatchmakingLobbyView() {
    return `
      <div class="p-8 md:p-12 bg-slate-950 text-white rounded-3xl border-2 border-cyan-500/50 shadow-2xl space-y-8 text-center animate-pop relative overflow-hidden">
        <div class="space-y-3">
          <span class="text-5xl block animate-spin">🔍</span>
          <h3 class="text-2xl font-black text-cyan-300">ĐANG ĐỒNG BỘ GHÉP TRẬN ĐẤU TRƯỜNG REALTIME...</h3>
          <p class="text-slate-400 text-xs font-semibold">Hệ thống đang kết nối 4 đấu thủ từ các lớp 3A, 4B, 5C...</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          ${(this.competitors || []).map(c => `
            <div class="p-4 bg-slate-900 rounded-2xl border-2 ${c.isUser ? 'border-cyan-400 bg-cyan-950/40' : 'border-slate-800'} space-y-2 animate-pulse">
              <span class="text-4xl block">${c.avatar}</span>
              <p class="font-black text-xs text-white truncate">${c.name}</p>
              <span class="badge bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">🟢 ĐÃ SẴN SÀNG</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderCountdownView() {
    return `
      <div class="p-12 bg-slate-950 text-white rounded-3xl border-2 border-amber-500 shadow-2xl text-center animate-pop space-y-6 flex flex-col items-center justify-center min-h-[350px]">
        <span class="badge bg-rose-600 text-white font-black text-xs uppercase px-4 py-1.5 animate-pulse">⚡ TRẬN ĐẤU SẮP BẮT ĐẦU</span>
        <h2 class="text-8xl font-black text-amber-400 animate-bounce font-mono filter drop-shadow-2xl">
          ${this.countdownNum || 3}
        </h2>
        <p class="text-slate-300 font-bold text-sm">Sẵn sàng phản xạ gõ bàn phím và trả lời câu hỏi!</p>
      </div>
    `;
  }

  // =========================================================================
  // TAB 2: 📚 QUESTION BANK CRUD (NGÂN HÀNG CÂU HỎI)
  // =========================================================================
  async renderQuestionBankView() {
    const questions = await window.arenaService.getQuestions(this.selectedGrade, this.selectedTopic);

    return `
      <div class="space-y-4">
        <!-- Toolbar Quản Lý -->
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <h3 class="text-base font-black text-slate-800 flex items-center gap-2">
              <span>📚</span> <span>NGÂN HÀNG CÂU HỎI ĐẤU TRƯỜNG</span>
            </h3>
            <span class="badge badge-cyan font-bold">${questions.length} Câu Hỏi</span>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="arenaPortal.resetDefaultQuestions()" class="btn btn-outline btn-xs font-bold text-slate-600 hover:bg-slate-100" title="Khôi phục lại toàn bộ câu hỏi mẫu chuẩn GDPT 2018">
              <span>🔄</span> <span>Nạp Lại Chuẩn Bộ GD</span>
            </button>
            <button onclick="arenaPortal.openQuestionModal()" class="btn bg-rose-600 hover:bg-rose-500 text-white btn-sm font-black shadow-md flex items-center gap-1.5">
              <span>➕</span> <span>Thêm Câu Hỏi Mới</span>
            </button>
          </div>
        </div>

        <!-- Danh sách Câu Hỏi CRUD -->
        <div class="grid grid-cols-1 gap-3.5">
          ${questions.map((q, idx) => `
            <div class="glass-card p-4 md:p-5 rounded-2xl border border-slate-200 hover:border-rose-300 transition-all shadow-sm space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="badge ${q.grade === 3 ? 'badge-cyan' : q.grade === 4 ? 'badge-emerald' : 'badge-amber'} font-black text-[10px]">
                      LỚP ${q.grade}
                    </span>
                    <span class="badge bg-slate-100 text-slate-700 font-bold text-[10px]">
                      🏷️ ${q.topic}
                    </span>
                    <span class="badge bg-rose-50 text-rose-700 font-bold text-[10px]">
                      ⏱️ ${q.timeLimit}s
                    </span>
                    <span class="badge bg-amber-50 text-amber-700 font-bold text-[10px]">
                      ⭐ +${q.stars} Sao
                    </span>
                  </div>
                  <h4 class="text-sm font-black text-slate-900 leading-snug pt-1">
                    ${idx + 1}. ${q.question}
                  </h4>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button onclick="arenaPortal.editQuestion('${q.id}')" class="btn btn-outline btn-xs font-bold text-cyan-700 border-cyan-300 hover:bg-cyan-50" title="Chỉnh sửa câu hỏi">
                    <span>✏️</span> <span>Sửa</span>
                  </button>
                  <button onclick="arenaPortal.deleteQuestion('${q.id}')" class="btn btn-outline btn-xs font-bold text-rose-600 border-rose-300 hover:bg-rose-50" title="Xóa câu hỏi">
                    <span>🗑️</span> <span>Xóa</span>
                  </button>
                </div>
              </div>

              <!-- 4 Đáp Án Hiển Thị -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                ${q.options.map((opt, oIdx) => `
                  <div class="p-2 rounded-xl border flex items-center justify-between gap-2 ${oIdx === q.correctIndex ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-black' : 'bg-slate-50 border-slate-200 text-slate-600'}">
                    <span>${opt}</span>
                    ${oIdx === q.correctIndex ? '<span class="text-xs text-emerald-600 font-black">✓ ĐÚNG</span>' : ''}
                  </div>
                `).join("")}
              </div>

              ${q.explanation ? `
                <div class="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                  💡 <b>Giải thích:</b> ${q.explanation}
                </div>
              ` : ''}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // =========================================================================
  // TAB 3: 🏆 LEADERBOARD VIEW (BẢNG VÀNG CÁ NHÂN & THI ĐUA TẬP THỂ LỚP)
  // =========================================================================
  async renderLeaderboardView() {
    if (!this.leaderboardSubTab) this.leaderboardSubTab = "individual";
    this.leaderboardGradeFilter = this.leaderboardGradeFilter || "all";
    this.leaderboardTimeFilter = this.leaderboardTimeFilter || "all";
    this.leaderboardClassFilter = this.leaderboardClassFilter || "all";

    const students = await window.arenaService.getStudentLeaderboard(
      this.leaderboardGradeFilter,
      this.leaderboardClassFilter,
      this.leaderboardTimeFilter
    );
    const classes = await window.arenaService.getClassLeaderboard(this.leaderboardGradeFilter);

    return `
      <div class="space-y-6 animate-pop">
        <!-- BANNER BẢNG VÀNG HOÀNG GIA -->
        <div class="p-6 md:p-8 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-3xl text-slate-950 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-white relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="space-y-1.5 text-center md:text-left z-10">
            <div class="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span class="badge bg-slate-950 text-amber-300 font-black text-xs uppercase px-3 py-1">🏆 ĐUA TOP TOÀN TRƯỜNG</span>
              <span class="badge bg-white/40 text-slate-950 font-black text-xs">MÙA GIẢI 2026</span>
            </div>
            <h3 class="text-2xl md:text-3xl font-black tracking-tight">
              BẢNG TỔNG SẮP ĐẤU TRƯỜNG TIN HỌC
            </h3>
            <p class="text-xs md:text-sm font-bold text-slate-900 max-w-xl">
              Xếp hạng học sinh theo số điểm từ cao đến thấp! Vinh danh các Kiện tướng Tin học xuất sắc dẫn đầu toàn trường!
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap justify-center shrink-0 z-10">
            <!-- NÚT XUẤT EXCEL CHO GIÁO VIÊN -->
            <button onclick="arenaPortal.exportLeaderboardToExcel()" class="btn bg-emerald-600 hover:bg-emerald-500 text-white font-black btn-md shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
              <span>📥</span> <span>Xuất Bảng Điểm Excel (.xlsx)</span>
            </button>
            <button onclick="arenaPortal.printClassCertificate()" class="btn bg-slate-950 hover:bg-slate-900 text-amber-300 font-black btn-md shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
              <span>🏛️</span> <span>Khen Thưởng Tập Thể Lớp</span>
            </button>
            <button onclick="simulation3D.openCertificateModal()" class="btn bg-white hover:bg-slate-100 text-slate-950 font-black btn-md shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
              <span>🎖️</span> <span>In Giấy Khen A4</span>
            </button>
          </div>
        </div>

        ${this.lastMatchSummary ? `
          <!-- KHUNG VINH DANH TRẬN ĐẤU VỪA HOÀN THÀNH -->
          <div class="p-5 md:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-white/60 animate-pop">
            <div class="flex items-center gap-4 text-center md:text-left">
              <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-4xl shadow-inner shrink-0 animate-bounce">
                ${this.lastMatchSummary.avatar || '🤖'}
              </div>
              <div class="space-y-1">
                <span class="badge bg-white/20 text-white font-black text-[10px] uppercase tracking-wider">KẾT QUẢ TRẬN ĐẤU VỪA HOÀN THÀNH</span>
                <h3 class="text-lg md:text-xl font-black">Chúc mừng em ${this.lastMatchSummary.studentName} đã xuất sắc hoàn thành!</h3>
                <p class="text-cyan-100 text-xs md:text-sm font-semibold flex items-center flex-wrap gap-2">
                  <span>Điểm số: <b class="text-amber-300 font-mono text-base">${this.lastMatchSummary.score} Điểm</b></span>
                  <span>• Đúng: <b class="text-white">${this.lastMatchSummary.totalCorrect}/${this.lastMatchSummary.totalQuestions} câu</b></span>
                  <span>• Thời gian: <b class="text-white">${this.lastMatchSummary.durationSeconds}s</b></span>
                  <span>• Thưởng: <b class="text-amber-300">⭐ +${this.lastMatchSummary.starsEarned} Sao</b></span>
                  ${this.lastMatchSummary.speedStarsCount > 0 ? `
                    <span class="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow inline-flex items-center gap-1 animate-bounce">
                      ⚡ ${this.lastMatchSummary.speedStarsCount} pha Thần Tốc (+${this.lastMatchSummary.speedStarsCount * 10}⭐)
                    </span>
                  ` : ''}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0 flex-wrap justify-center">
              <button onclick="arenaPortal.openCertificateModal()" class="btn bg-white hover:bg-slate-100 text-slate-900 font-black btn-sm shadow-md">
                🎖️ Xem Giấy Khen
              </button>
              <button onclick="arenaPortal.switchTab('live_arena')" class="btn bg-amber-400 hover:bg-amber-500 text-slate-950 font-black btn-sm shadow-md">
                🎮 Đấu Trận Mới ▶
              </button>
            </div>
          </div>
        ` : ''}

        <!-- 3 SUB-TABS: CÁ NHÂN / ĐUA TOP LỚP / PHÂN TÍCH CHIẾN TÍCH -->
        <div class="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="arenaPortal.switchLeaderboardSubTab('individual')" class="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.leaderboardSubTab === 'individual' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🧑‍🎓</span> <span>Bảng Xếp Hạng Cá Nhân (Theo Điểm Số)</span>
            </button>
            <button onclick="arenaPortal.switchLeaderboardSubTab('class_league')" class="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.leaderboardSubTab === 'class_league' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🏫</span> <span>Đua Top Tập Thể Lớp (Inter-Class League)</span>
            </button>
            <button onclick="arenaPortal.switchLeaderboardSubTab('analytics')" class="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.leaderboardSubTab === 'analytics' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📊</span> <span>Thống Kê Chiến Tích & Kỹ Năng</span>
            </button>
          </div>

          <span class="text-xs font-bold text-slate-500 pr-2">Cập nhật thời gian thực</span>
        </div>

        <!-- BỘ LỌC BẢNG XẾP HẠNG THEO KHỐI LỚP VÀ THỜI GIAN (GỢI Ý 3) -->
        <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
          <!-- 1. Lọc Khối Lớp -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-black text-slate-700 flex items-center gap-1">
              <span>🎯</span> <span>Khối Lớp:</span>
            </span>
            <button onclick="arenaPortal.setLeaderboardGradeFilter('all')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.leaderboardGradeFilter === 'all' ? 'bg-slate-900 text-white font-black shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              Tất Cả Khối
            </button>
            <button onclick="arenaPortal.setLeaderboardGradeFilter(3)" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.leaderboardGradeFilter == 3 ? 'bg-cyan-600 text-white font-black shadow-sm' : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'}">
              Khối 3
            </button>
            <button onclick="arenaPortal.setLeaderboardGradeFilter(4)" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.leaderboardGradeFilter == 4 ? 'bg-emerald-600 text-white font-black shadow-sm' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
              Khối 4
            </button>
            <button onclick="arenaPortal.setLeaderboardGradeFilter(5)" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.leaderboardGradeFilter == 5 ? 'bg-amber-600 text-white font-black shadow-sm' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
              Khối 5
            </button>
          </div>

          <!-- 2. Lọc Khung Thời Gian -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-black text-slate-700 flex items-center gap-1">
              <span>⏱️</span> <span>Thời Gian:</span>
            </span>
            <button onclick="arenaPortal.setLeaderboardTimeFilter('all')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.leaderboardTimeFilter === 'all' ? 'bg-indigo-600 text-white font-black shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              Toàn Thời Gian
            </button>
            <button onclick="arenaPortal.setLeaderboardTimeFilter('today')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.leaderboardTimeFilter === 'today' ? 'bg-indigo-600 text-white font-black shadow-sm' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}">
              Hôm Nay
            </button>
            <button onclick="arenaPortal.setLeaderboardTimeFilter('week')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.leaderboardTimeFilter === 'week' ? 'bg-indigo-600 text-white font-black shadow-sm' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}">
              Tuần Này
            </button>
            <button onclick="arenaPortal.setLeaderboardTimeFilter('month')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.leaderboardTimeFilter === 'month' ? 'bg-indigo-600 text-white font-black shadow-sm' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}">
              Tháng Này
            </button>
          </div>
        </div>

        <!-- NỘI DUNG TỪNG SUB-TAB -->
        ${this.leaderboardSubTab === 'individual' ? this.renderIndividualLeaderboardSubTab(students) : ''}
        ${this.leaderboardSubTab === 'class_league' ? this.renderClassLeagueSubTab(classes) : ''}
        ${this.leaderboardSubTab === 'analytics' ? this.renderAnalyticsSubTab(students, classes) : ''}
      </div>
    `;
  }

  // SUB-TAB 1: BẢNG VÀNG CÁ NHÂN (INDIVIDUAL - PODIUM VƯƠNG MIỆN HOÀNG GIA GỢI Ý 1)
  renderIndividualLeaderboardSubTab(students) {
    const top1 = students[0];
    const top2 = students[1];
    const top3 = students[2];
    const currentUser = window.authService?.getUser();

    return `
      <div class="space-y-6 animate-pop">
        <!-- TOP 3 PODIUM VINH DANH HOÀNG GIA (GỢI Ý 1) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <!-- TOP 2 (BẠC - Á QUÂN) -->
          ${top2 ? `
            <div class="p-5 rounded-3xl bg-gradient-to-b from-slate-100 via-white to-slate-200 border-2 border-slate-300 text-center space-y-2.5 shadow-lg relative order-2 md:order-1 ring-2 ring-slate-200">
              <!-- Khung Avatar Bạc Á Quân -->
              <div class="relative inline-block mx-auto pt-1">
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce filter drop-shadow">🥈</div>
                <div class="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-slate-300 via-white to-slate-400 ring-4 ring-slate-300 shadow-lg shadow-slate-400/40 flex items-center justify-center relative">
                  <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-slate-200">
                    ${top2.avatar || "🥈"}
                  </div>
                  <span class="absolute -bottom-2 -right-1 bg-slate-300 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow">
                    🥈 TOP 2
                  </span>
                </div>
              </div>

              <div class="space-y-0.5">
                <span class="badge bg-slate-300 text-slate-900 font-black text-xs px-3 py-0.5">Á QUÂN TOÀN TRƯỜNG</span>
                <h4 class="font-black text-base text-slate-900 pt-0.5">${top2.studentName}</h4>
                <p class="text-xs font-bold text-slate-600">Lớp ${top2.studentClass} • Khối ${top2.grade}</p>
              </div>

              <div class="p-2.5 bg-white rounded-2xl border border-slate-300 flex items-center justify-around text-xs font-black shadow-xs">
                <span class="text-cyan-700">🎯 ${top2.highestScore} Đ</span>
                <span class="text-amber-600">⭐ ${top2.totalStars}</span>
                <span class="text-slate-500">⏱️ ${top2.bestDuration < 999 ? top2.bestDuration + 's' : '-'}</span>
              </div>
            </div>
          ` : ''}

          <!-- TOP 1 (VÀNG - VƯƠNG MIỆN HOÀNG GIA - PODIUM CAO NHẤT) -->
          ${top1 ? `
            <div class="p-6 rounded-3xl bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200 border-4 border-amber-400 text-center space-y-3 shadow-2xl relative order-1 md:order-2 transform md:-translate-y-5 ring-4 ring-amber-300/40">
              <!-- Vương miện và Khung Avatar Hoàng Gia -->
              <div class="relative inline-block mx-auto pt-2">
                <div class="absolute -top-7 left-1/2 -translate-x-1/2 text-4xl animate-bounce filter drop-shadow">👑</div>
                <div class="w-20 h-20 rounded-full p-1.5 bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-400 ring-4 ring-amber-400/90 shadow-2xl shadow-amber-500/50 flex items-center justify-center relative">
                  <div class="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-4xl font-black text-amber-300">
                    ${top1.avatar || (currentUser && top1.studentName === currentUser.name ? (this.selectedMascot || "🤖") : "🤖")}
                  </div>
                  <span class="absolute -bottom-2 -right-1 bg-amber-400 text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-full border-2 border-white shadow-md">
                    🥇 TOP 1
                  </span>
                </div>
              </div>

              <div class="space-y-1">
                <span class="inline-block bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-4 py-1 rounded-full font-black text-xs uppercase tracking-wider shadow-md">
                  👑 QUÁN QUÂN HOÀNG GIA
                </span>
                <h4 class="font-black text-xl text-amber-950 pt-1">${top1.studentName}</h4>
                <p class="text-xs font-black text-amber-800">Lớp ${top1.studentClass} • Khối Lớp ${top1.grade}</p>
              </div>

              <div class="p-3 bg-white/95 rounded-2xl border border-amber-300 flex items-center justify-around text-xs font-black shadow-sm">
                <span class="text-cyan-700">🎯 ${top1.highestScore} Điểm</span>
                <span class="text-amber-600">⭐ ${top1.totalStars} Sao</span>
                <span class="text-slate-600">⏱️ ${top1.bestDuration < 999 ? top1.bestDuration + 's' : '-'}</span>
              </div>
              <span class="inline-block text-[11px] font-black text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300">
                🔥 Chuỗi Thắng Tuyệt Đối (${top1.perfectWins || 1} Trận 100đ)
              </span>
            </div>
          ` : ''}

          <!-- TOP 3 (ĐỒNG - QUÝ QUÂN) -->
          ${top3 ? `
            <div class="p-5 rounded-3xl bg-gradient-to-b from-amber-100 via-white to-orange-100 border-2 border-amber-300 text-center space-y-2.5 shadow-lg relative order-3 ring-2 ring-amber-200">
              <!-- Khung Avatar Đồng Quý Quân -->
              <div class="relative inline-block mx-auto pt-1">
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce filter drop-shadow">🥉</div>
                <div class="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-amber-600 via-orange-300 to-amber-700 ring-4 ring-amber-600/80 shadow-lg shadow-amber-600/40 flex items-center justify-center relative">
                  <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-amber-200">
                    ${top3.avatar || "🥉"}
                  </div>
                  <span class="absolute -bottom-2 -right-1 bg-amber-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow">
                    🥉 TOP 3
                  </span>
                </div>
              </div>

              <div class="space-y-0.5">
                <span class="badge bg-amber-600 text-white font-black text-xs px-3 py-0.5">QUÝ QUÂN TOÀN TRƯỜNG</span>
                <h4 class="font-black text-base text-slate-900 pt-0.5">${top3.studentName}</h4>
                <p class="text-xs font-bold text-slate-600">Lớp ${top3.studentClass} • Khối ${top3.grade}</p>
              </div>

              <div class="p-2.5 bg-white rounded-2xl border border-amber-300 flex items-center justify-around text-xs font-black shadow-xs">
                <span class="text-cyan-700">🎯 ${top3.highestScore} Đ</span>
                <span class="text-amber-600">⭐ ${top3.totalStars}</span>
                <span class="text-slate-500">⏱️ ${top3.bestDuration < 999 ? top3.bestDuration + 's' : '-'}</span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- BẢNG DANH SÁCH CHI TIẾT KÈM HUY HIỆU & NỔI BẬT HỌC SINH -->
        <div class="glass-card p-5 rounded-2xl space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-black text-slate-500">
            <span>HẠNG & HỌC SINH</span>
            <div class="flex items-center gap-6 md:gap-10">
              <span class="hidden sm:inline">SỐ TRẬN</span>
              <span>ĐIỂM CAO NHẤT</span>
              <span>TỔNG SAO VÀNG</span>
              <span class="hidden md:inline">THỜI GIAN NHANH NHẤT</span>
            </div>
          </div>

          <div class="space-y-2">
            ${students.length === 0 ? `
              <div class="text-center py-8 text-slate-400 font-bold">
                Chưa có dữ liệu thi đấu trong khung thời gian này. Hãy tham gia trận đấu đầu tiên!
              </div>
            ` : students.map((st, idx) => {
              const isCurrentUser = currentUser && (st.studentName === currentUser.name || st.studentName === currentUser.username);
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const isTop3 = idx === 2;

              let rowBg = 'bg-white border border-slate-200';
              if (isCurrentUser) {
                rowBg = 'bg-amber-50/90 border-2 border-amber-400 ring-2 ring-amber-300/40 shadow-md';
              } else if (isTop1) {
                rowBg = 'bg-gradient-to-r from-amber-100/80 via-yellow-50 to-white border-2 border-amber-400 shadow-sm';
              } else if (isTop2) {
                rowBg = 'bg-gradient-to-r from-slate-100/70 via-white to-white border border-slate-300 shadow-xs';
              } else if (isTop3) {
                rowBg = 'bg-gradient-to-r from-amber-50/50 via-orange-50/20 to-white border border-amber-300 shadow-xs';
              }

              return `
              <div class="p-3.5 rounded-2xl ${rowBg} flex items-center justify-between gap-3 hover:border-amber-400 transition-all">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <span class="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${isTop1 ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md' : isTop2 ? 'bg-slate-300 text-slate-950' : isTop3 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'}">
                      ${isTop1 ? '👑' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${idx + 1}`}
                    </span>
                  </div>
                  <div class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shrink-0 border border-slate-200 shadow-xs ring-1 ring-slate-100">
                    ${st.avatar || (isCurrentUser ? (this.selectedMascot || '🤖') : '🧑‍🎓')}
                  </div>
                  <div>
                    <h5 class="text-xs md:text-sm font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                      ${st.studentName}
                      ${isTop1 ? '<span class="badge bg-amber-400 text-slate-950 font-black text-[10px]">👑 Quán Quân</span>' : ''}
                      ${isTop2 ? '<span class="badge bg-slate-300 text-slate-900 font-black text-[10px]">🥈 Á Quân</span>' : ''}
                      ${isTop3 ? '<span class="badge bg-amber-600 text-white font-black text-[10px]">🥉 Quý Quân</span>' : ''}
                      ${isCurrentUser ? '<span class="badge bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">BẠN</span>' : ''}
                    </h5>
                    <p class="text-[11px] text-slate-500 font-bold">Lớp ${st.studentClass} • Khối Lớp ${st.grade}</p>
                  </div>
                </div>

                <div class="flex items-center gap-5 md:gap-10 text-xs font-black">
                  <span class="text-slate-600 font-mono hidden sm:inline">${st.matchesPlayed || 1} Trận</span>
                  <span class="text-cyan-700 font-mono text-sm md:text-base">${st.highestScore} Điểm</span>
                  <span class="text-amber-600 font-mono">⭐ +${st.totalStars}</span>
                  <span class="text-slate-500 font-mono hidden md:inline text-[11px]">⏱️ ${st.bestDuration < 999 ? st.bestDuration + 's' : '-'}</span>
                </div>
              </div>
            `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  // SUB-TAB 2: ĐUA TOP TẬP THỂ LỚP (INTER-CLASS LEAGUE)
  renderClassLeagueSubTab(classes) {
    return `
      <div class="space-y-4 animate-pop">
        <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏆</span>
            <div>
              <h4 class="font-black text-xs md:text-sm text-indigo-950">GIẢI ĐẤU LIÊN LỚP (INTER-CLASS CHAMPIONSHIP)</h4>
              <p class="text-[11px] text-indigo-700">Điểm số và Sao Vàng của từng học sinh khi tham gia Đấu Trường được tự động cộng dồn cho tập thể Lớp!</p>
            </div>
          </div>
          <span class="badge bg-indigo-600 text-white font-black text-xs">${classes.length} Lớp Tranh Tài</span>
        </div>

        <div class="grid grid-cols-1 gap-3.5">
          ${classes.map((c, idx) => `
            <div class="glass-card p-5 rounded-2xl border-2 ${idx === 0 ? 'border-amber-400 bg-gradient-to-r from-amber-50/60 to-white' : idx === 1 ? 'border-slate-300' : 'border-slate-200'} shadow-sm space-y-3">
              <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'}">
                    ${idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="text-base font-black text-slate-900">LỚP ${c.className}</h4>
                      <span class="badge ${c.grade === 3 ? 'badge-cyan' : c.grade === 4 ? 'badge-emerald' : 'badge-amber'} font-black text-[10px]">Khối ${c.grade}</span>
                      ${idx === 0 ? '<span class="badge bg-rose-600 text-white font-black text-[10px] animate-pulse">🔥 LỚP VÔ ĐỊCH TUẦN</span>' : ''}
                    </div>
                    <p class="text-xs text-slate-500 font-semibold">GVCN: <b>${c.teacher}</b> • Gương mặt tiêu biểu: <span class="text-cyan-700 font-bold">${c.topStudent}</span></p>
                  </div>
                </div>

                <div class="flex items-center gap-4 text-xs font-black">
                  <div class="text-right">
                    <span class="text-amber-600 text-sm font-mono block">⭐ ${c.totalStars} Sao</span>
                    <span class="text-slate-400 text-[10px]">${c.matches} lượt thi đấu</span>
                  </div>
                  <div class="text-right">
                    <span class="text-emerald-600 text-sm font-mono block">${c.winRate}%</span>
                    <span class="text-slate-400 text-[10px]">Tỷ lệ chiến thắng</span>
                  </div>
                </div>
              </div>

              <!-- Thanh tiến độ thi đua -->
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="h-2.5 rounded-full ${idx === 0 ? 'bg-gradient-to-r from-amber-400 to-rose-500' : 'bg-indigo-600'}" style="width: ${Math.min(100, (c.totalStars / (classes[0]?.totalStars || 1)) * 100)}%"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // SUB-TAB 3: THỐNG KÊ CHIẾN TÍCH (ANALYTICS)
  renderAnalyticsSubTab(students, classes) {
    const totalMatches = students.reduce((acc, s) => acc + (s.matchesPlayed || 1), 0);
    const totalStars = students.reduce((acc, s) => acc + (s.totalStars || 0), 0);

    return `
      <div class="space-y-6 animate-pop">
        <!-- 4 THẺ CHỈ SỐ TOÀN DIỆN -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span class="text-2xl">🎮</span>
            <p class="text-xs font-bold text-slate-500 uppercase">Tổng Lượt Trận Đấu</p>
            <h4 class="text-2xl font-black text-rose-600 font-mono">${totalMatches} Trận</h4>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span class="text-2xl">⭐</span>
            <p class="text-xs font-bold text-slate-500 uppercase">Tổng Sao Vàng Trao Thưởng</p>
            <h4 class="text-2xl font-black text-amber-500 font-mono">${totalStars} ⭐</h4>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span class="text-2xl">🎯</span>
            <p class="text-xs font-bold text-slate-500 uppercase">Tỷ Lệ Trả Lời Đúng</p>
            <h4 class="text-2xl font-black text-emerald-600 font-mono">92.4%</h4>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span class="text-2xl">🏆</span>
            <p class="text-xs font-bold text-slate-500 uppercase">Lớp Dẫn Đầu Tuần</p>
            <h4 class="text-2xl font-black text-indigo-700 font-mono">Lớp ${classes[0]?.className || '5A'}</h4>
          </div>
        </div>

        <!-- BẢNG PHÂN TÍCH THEO CHỦ ĐỀ -->
        <div class="glass-card p-6 rounded-2xl space-y-4">
          <h4 class="text-sm font-black text-slate-900 flex items-center gap-2">
            <span>📈</span> <span>MỨC ĐỘ NẮM VỮNG KIẾN THỨC THEO CHỦ ĐỀ TIN HỌC</span>
          </h4>

          <div class="space-y-3 text-xs font-bold text-slate-700">
            <div>
              <div class="flex justify-between pb-1">
                <span>🖥️ Phần cứng máy tính & Bàn phím chuột (Lớp 3)</span>
                <span class="text-emerald-600 font-mono">96% Xuất Sắc</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 96%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between pb-1">
                <span>📁 Quản lý thư mục & Sắp xếp dữ liệu (Lớp 3 - 4)</span>
                <span class="text-cyan-600 font-mono">91% Tốt</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-cyan-500 h-2 rounded-full" style="width: 91%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between pb-1">
                <span>🤖 Lập trình thuật toán Scratch & Mê cung (Lớp 4 - 5)</span>
                <span class="text-indigo-600 font-mono">87% Khá</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-2 rounded-full" style="width: 87%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between pb-1">
                <span>🛡️ An toàn thông tin mạng & Bản quyền số (Lớp 5)</span>
                <span class="text-amber-600 font-mono">94% Xuất Sắc</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-2 rounded-full" style="width: 94%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Chuyển đổi Sub-tab Bảng Vàng
  switchLeaderboardSubTab(tab) {
    this.leaderboardSubTab = tab;
    this.render("main-content-area");
  }

  // In Bằng Khen Tập Thể Lớp
  printClassCertificate() {
    window.app.showToast("🏛️ Đang chuẩn bị Giấy Khen Tập Thể Lớp Xuất Sắc khổ A4...", "info");
    if (window.simulation3D?.openCertificateModal) {
      window.simulation3D.openCertificateModal();
    }
  }

  // =========================================================================
  // LOGIC TRẬN ĐẤU & CẤU HÌNH ĐẤU TRƯỜNG CẢ 3 KHỐI LỚP (3, 4, 5)
  // =========================================================================
  getLessonsByGrade(grade) {
    const g = parseInt(grade) || 3;
    if (g === 3) {
      return [
        { id: "all", title: "🌟 Tất Cả Các Bài Học (Toàn Bộ SGK Tin Học 3 - KNTT)" },
        { id: "bai_1", title: "Bài 1. Thông tin và quyết định" },
        { id: "bai_2", title: "Bài 2. Xử lý thông tin" },
        { id: "bai_3", title: "Bài 3. Máy tính và em" },
        { id: "bai_4", title: "Bài 4. Làm việc với máy tính" },
        { id: "bai_5", title: "Bài 5. Sử dụng bàn phím máy tính" },
        { id: "bai_6", title: "Bài 6. Sử dụng chuột máy tính" },
        { id: "bai_7", title: "Bài 7. Sắp xếp để dễ tìm" },
        { id: "bai_8", title: "Bài 8. Sơ đồ hình cây. Cây thư mục" },
        { id: "bai_9", title: "Bài 9. An toàn với máy tính" },
        { id: "bai_10", title: "Bài 10. Thực hành tạo sản phẩm" },
        { id: "bai_11", title: "Bài 11. Em tập vẽ hình với Paint" },
        { id: "bai_12", title: "Bài 12. Em tập gõ bàn phím 10 ngón" },
        { id: "bai_13", title: "Bài 13. Thuật toán: Làm việc theo các bước" },
        { id: "bai_14", title: "Bài 14. Chia việc lớn thành việc nhỏ" }
      ];
    } else if (g === 4) {
      return [
        { id: "all", title: "🌟 Tất Cả Các Bài Học (Toàn Bộ SGK Tin Học 4 - KNTT)" },
        { id: "bai_1", title: "Bài 1. Phần cứng và phần mềm máy tính" },
        { id: "bai_2", title: "Bài 2. Gõ bàn phím đúng cách" },
        { id: "bai_3", title: "Bài 3. Thông tin trên trang web" },
        { id: "bai_4", title: "Bài 4. Tìm kiếm thông tin trên Internet" },
        { id: "bai_5", title: "Bài 5. Thao tác với tệp và thư mục" },
        { id: "bai_6", title: "Bài 6. Sử dụng phần mềm khi được phép" },
        { id: "bai_7", title: "Bài 7. Tạo bài trình chiếu" },
        { id: "bai_8", title: "Bài 8. Định dạng văn bản trên trang chiếu" },
        { id: "bai_9", title: "Bài 9. Hiệu ứng chuyển trang" },
        { id: "bai_10", title: "Bài 10. Phần mềm soạn thảo văn bản" },
        { id: "bai_11", title: "Bài 11. Chỉnh sửa văn bản" },
        { id: "bai_12a", title: "Bài 12A. Thực hành đa phương tiện" },
        { id: "bai_12b", title: "Bài 12B. Phần mềm luyện tập gõ bàn phím" },
        { id: "bai_13", title: "Bài 13. Chơi với máy tính" },
        { id: "bai_14", title: "Bài 14. Khám phá môi trường lập trình trực quan" },
        { id: "bai_15", title: "Bài 15. Tạo chương trình máy tính để diễn tả ý tưởng" },
        { id: "bai_16", title: "Bài 16. Chương trình của em" }
      ];
    } else {
      return [
        { id: "all", title: "🌟 Tất Cả Các Bài Học (Toàn Bộ SGK Tin Học 5 - KNTT)" },
        { id: "bai_1", title: "Bài 1. Máy tính và câu chuyện xử lý thông tin" },
        { id: "bai_2", title: "Bài 2. Khám phá thế giới thông tin số" },
        { id: "bai_3", title: "Bài 3. Tìm kiếm thông tin chính xác trên Internet" },
        { id: "bai_4", title: "Bài 4. Cây thư mục và lưu trữ dữ liệu" },
        { id: "bai_5", title: "Bài 5. Bản quyền nội dung và đạo đức số" },
        { id: "bai_6", title: "Bài 6. Sử dụng máy tính và bảo mật thông tin an toàn" },
        { id: "bai_7", title: "Bài 7. Soạn thảo văn bản nâng cao" },
        { id: "bai_8", title: "Bài 8. Thiết kế bài trình chiếu đa phương tiện" },
        { id: "bai_9", title: "Bài 9. Biến số trong lập trình Scratch" },
        { id: "bai_10", title: "Bài 10. Cấu trúc rẽ nhánh nếu... thì trong Scratch" },
        { id: "bai_11", title: "Bài 11. Cấu trúc lặp trong Scratch" },
        { id: "bai_12", title: "Bài 12. Dự án học tập: Tạo trò chơi Scratch" }
      ];
    }
  }

  renderLobbyLessonOptions(grade) {
    const list = this.getLessonsByGrade(grade);
    return list.map(l => {
      let count = 0;
      if (window.arenaService?.getQuestionCountForLesson) {
        count = window.arenaService.getQuestionCountForLesson(grade, l.id);
      }
      const badge = l.id === "all"
        ? ` • [Toàn bộ ${count} câu hỏi]`
        : (count > 0 ? ` • [${count} câu hỏi]` : ` • [Mở rộng cùng khối]`);
      return `<option value="${l.id}" ${l.id === this.selectedLobbyLesson ? 'selected' : ''}>${l.title}${badge}</option>`;
    }).join('');
  }

  selectLobbyGrade(grade) {
    this.selectedLobbyGrade = parseInt(grade) || 3;
    this.selectedLobbyGradeInitialized = true;
    
    [3, 4, 5].forEach(g => {
      const btn = document.getElementById(`lobby-grade-${g}`);
      if (btn) {
        if (g === this.selectedLobbyGrade) {
          const colorClass = g === 3 ? 'bg-cyan-600 border-cyan-300 ring-cyan-300' : (g === 4 ? 'bg-emerald-600 border-emerald-300 ring-emerald-300' : 'bg-amber-600 border-amber-300 ring-amber-300');
          btn.className = `p-1.5 sm:p-2 rounded-xl border-2 font-black text-[11px] sm:text-xs text-center transition-all flex flex-col items-center gap-0.5 ${colorClass} text-white shadow-md ring-2 scale-102 cursor-pointer`;
        } else {
          btn.className = `p-1.5 sm:p-2 rounded-xl border-2 font-black text-[11px] sm:text-xs text-center transition-all flex flex-col items-center gap-0.5 bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer`;
        }
      }
    });

    const select = document.getElementById("lobby-lesson-select");
    if (select) {
      select.innerHTML = this.renderLobbyLessonOptions(this.selectedLobbyGrade);
      this.selectedLobbyLesson = select.value || "all";
    }
    this.playBeep(440, 0.08);
  }

  handleLobbyLessonChange(val) {
    this.selectedLobbyLesson = val;
    this.playBeep(400, 0.06);
  }

  selectLobbyQuestionCount(count) {
    this.selectedLobbyQuestionCount = parseInt(count) || 10;
    this.selectedQuestionCount = this.selectedLobbyQuestionCount;
    [5, 10, 15, 20].forEach(c => {
      const btn = document.getElementById(`lobby-count-${c}`);
      if (btn) {
        if (c === this.selectedLobbyQuestionCount) {
          btn.className = "p-1.5 rounded-xl border-2 font-black text-[11px] text-center transition-all bg-rose-600 border-rose-300 text-white shadow-sm ring-2 ring-rose-300 cursor-pointer scale-102";
        } else {
          btn.className = "p-1.5 rounded-xl border-2 font-black text-[11px] text-center transition-all bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer";
        }
      }
    });
    this.playBeep(480, 0.08);
  }

  async startLobbyBattle() {
    console.log("🚀 [ArenaPortal] startLobbyBattle kích hoạt!");
    const btn = document.getElementById("btn-start-arena-battle");
    if (btn) {
      btn.innerHTML = `<span class="text-2xl animate-spin">⏳</span> <span>ĐANG KẾT NỐI ĐẤU TRƯỜNG...</span>`;
      btn.disabled = true;
    }

    try {
      let user = window.authService?.getUser();
      if (!user) {
        user = {
          name: "Học Sinh Khách",
          className: `${this.selectedLobbyGrade || 3}A`,
          grade: this.selectedLobbyGrade || 3,
          avatar: this.selectedMascot || "🤖",
          isGuest: true
        };
        window.app?.showToast?.("🎮 Em đang tham gia Đấu Trường với tư cách Học Sinh! (Đăng nhập để lưu điểm Bảng Vàng nhé)", "info");
      }

      const grade = parseInt(this.selectedLobbyGrade) || 3;
      const select = document.getElementById("lobby-lesson-select");
      const lesson = (select && select.value) ? select.value : (this.selectedLobbyLesson || "all");
      const count = parseInt(this.selectedLobbyQuestionCount) || 10;

      this.playBeep(660, 0.15);
      this.currentTab = "live_arena";
      if (this.isBGMPlaying) {
        this.startArenaBGM("battle");
      }
      await this.startBattleWithMode("blitz", grade, count, lesson);
    } catch (err) {
      console.error("❌ Lỗi khi khởi động trận đấu:", err);
      window.app?.showToast?.("⚠️ Lỗi khởi động đấu trường: " + (err.message || err), "error");
      if (btn) {
        btn.innerHTML = `<span class="text-2xl animate-pulse">🚀</span> <span>BẮT ĐẦU VÀO ĐẤU NGAY ▶</span>`;
        btn.disabled = false;
      }
    }
  }

  selectQuestionCount(count) {
    this.selectedQuestionCount = count;
    this.selectedG4QuestionCount = count;
    [5, 10, 15, 20].forEach(c => {
      const btn = document.getElementById(`btn-count-${c}`);
      if (btn) {
        if (c === count) {
          btn.className = "p-2.5 rounded-2xl border-2 font-black text-xs text-center transition-all bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm";
        } else {
          btn.className = "p-2.5 rounded-2xl border-2 font-black text-xs text-center transition-all bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
        }
      }
    });
  }

  openConfigModal(grade = 4) {
    this.selectedConfigGrade = grade;
    this.selectedG4QuestionCount = this.selectedQuestionCount || 10;

    const modal = document.getElementById("arena-config-modal");
    const titleEl = document.getElementById("arena-config-title");
    const subtitleEl = document.getElementById("arena-config-subtitle");
    const lessonSelect = document.getElementById("arena-lesson-select");

    if (titleEl) titleEl.innerText = `CẤU HÌNH ĐẤU TRƯỜNG TIN HỌC LỚP ${grade}`;
    if (subtitleEl) subtitleEl.innerText = `Tùy chọn số lượng câu hỏi & bài học SGK Kết nối tri thức Lớp ${grade}`;

    if (lessonSelect) {
      const lessons = this.getLessonsByGrade(grade);
      lessonSelect.innerHTML = lessons.map(l => `<option value="${l.id}">${l.title}</option>`).join('');
    }

    if (modal) modal.classList.add("active");
  }

  closeConfigModal() {
    const modal = document.getElementById("arena-config-modal");
    if (modal) modal.classList.remove("active");
  }

  selectTimerSpeed(seconds) {
    this.selectedCustomTimer = seconds;
    [10, 15, 20, 30].forEach(s => {
      const btn = document.getElementById(`btn-timer-${s}`);
      if (btn) {
        if (s === seconds) {
          btn.className = "p-2.5 rounded-xl border-2 font-black text-xs text-center transition-all bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm";
        } else {
          btn.className = "p-2.5 rounded-xl border-2 font-black text-xs text-center transition-all bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
        }
      }
    });
  }

  // =========================================================================
  // LOGIC THÁCH ĐẤU 1VS1 THEO MÃ PHÒNG 6 CHỮ SỐ (SUPABASE REALTIME)
  // =========================================================================
  openRoomModal() {
    const modal = document.getElementById("arena-room-modal");
    if (modal) modal.classList.add("active");
  }

  createPrivateRoom() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.currentRoomCode = code;

    const box = document.getElementById("arena-created-room-box");
    const codeEl = document.getElementById("arena-created-room-code");
    if (box) box.classList.remove("hidden");
    if (codeEl) codeEl.innerText = code;

    window.app.showToast(`👑 Đã tạo Mã Phòng 1vs1: ${code}! Đang chờ đối thủ...`, "success");

    if (window.supabaseClient) {
      this.roomChannel = window.supabaseClient.channel(`arena_room_${code}`);
      this.roomChannel
        .on('broadcast', { event: 'player_joined' }, payload => {
          window.app.showToast(`⚔️ Đã kết nối Đối thủ 1vs1: ${payload.name}! Bắt đầu trận đấu!`, "success");
          document.getElementById('arena-room-modal')?.classList.remove('active');
          this.startBattleWithMode("blitz", 4, 10, "all");
        })
        .subscribe();
    }
  }

  joinPrivateRoom() {
    const input = document.getElementById("arena-room-code-input");
    const code = input ? input.value.trim() : "";

    if (!code || code.length !== 6) {
      window.app.showToast("⚠️ Vui lòng nhập mã phòng 6 chữ số hợp lệ!", "warning");
      return;
    }

    const user = window.authService?.getUser() || { name: "Học Sinh" };

    if (window.supabaseClient) {
      const channel = window.supabaseClient.channel(`arena_room_${code}`);
      channel.subscribe(status => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'player_joined',
            payload: { name: user.name }
          });
          window.app.showToast(`🚀 Đã tham gia phòng 1vs1 [${code}]! Bắt đầu thi đấu!`, "success");
          document.getElementById('arena-room-modal')?.classList.remove('active');
          this.startBattleWithMode("blitz", 4, 10, "all");
        }
      });
    } else {
      document.getElementById('arena-room-modal')?.classList.remove('active');
      this.startBattleWithMode("blitz", 4, 10, "all");
    }
  }

  initMatchCompetitors(grade = 4) {
    const user = window.authService?.getUser() || { name: "Học Sinh", className: "3A" };
    this.streakCombo = 0;
    this.hasAnnouncedTop1 = false;
    this.previousUserRank = 4;
    this.competitors = [
      { id: "user", name: user.name || "Học Sinh", avatar: this.selectedMascot || user.avatar || "🤖", isUser: true, score: 0 },
      { id: "bot_1", name: "🤖 Robot AI Vui Học", avatar: "🤖", isUser: false, score: 0, accuracy: 0.85 },
      { id: "bot_2", name: "👧 Bảo Ngọc (Lớp 4B)", avatar: "👧", isUser: false, score: 0, accuracy: 0.75 },
      { id: "bot_3", name: "👦 Hoàng Nam (Lớp 4C)", avatar: "👦", isUser: false, score: 0, accuracy: 0.70 }
    ];
  }

  playBeep(freq = 440, duration = 0.1) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Beep sound error", e);
    }
  }

  // Âm thanh đếm ngược tích tắc 5 giây cuối dồn dập (Gợi ý 2)
  playTickingCountdown(secondsLeft) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Tần số tăng dần từ 600Hz đến 950Hz tạo cảm giác hồi hộp
      const freq = 600 + (6 - secondsLeft) * 75;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.warn("Countdown tick sound error", e);
    }
  }

  // Cập nhật bộ lọc Khối Lớp của Bảng Xếp Hạng (Gợi ý 3)
  setLeaderboardGradeFilter(grade) {
    this.leaderboardGradeFilter = grade;
    this.render("main-content-area");
  }

  // Cập nhật bộ lọc Khung Thời Gian (Hôm nay, Tuần này, Tháng này) (Gợi ý 3)
  setLeaderboardTimeFilter(timeRange) {
    this.leaderboardTimeFilter = timeRange;
    this.render("main-content-area");
  }

  // Cập nhật bộ lọc Lớp học (Gợi ý 3)
  setLeaderboardClassFilter(cls) {
    this.leaderboardClassFilter = cls;
    this.render("main-content-area");
  }

  // Tải Bảng Điểm & Bảng Xếp Hạng ra file Excel chuẩn .xlsx (Gợi ý 4)
  async exportLeaderboardToExcel() {
    try {
      const grade = this.leaderboardGradeFilter || "all";
      const timeRange = this.leaderboardTimeFilter || "all";
      const classFilter = this.leaderboardClassFilter || "all";
      const students = await window.arenaService.getStudentLeaderboard(grade, classFilter, timeRange);

      if (!students || students.length === 0) {
        window.app.showToast("⚠️ Không có dữ liệu học sinh để xuất bảng điểm!", "warning");
        return;
      }

      const gradeLabel = grade === "all" ? "Toan_Truong" : `Khoi_${grade}`;
      const timeLabel = timeRange === "today" ? "Hom_Nay" : timeRange === "week" ? "Tuan_Nay" : timeRange === "month" ? "Thang_Nay" : "Toan_Thoi_Gian";
      const fileName = `Bang_Diem_Dau_Truong_Tin_Hoc_${gradeLabel}_${timeLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const excelData = students.map((st, idx) => {
        let title = "Kiện Tướng Tin Học";
        if (idx === 0) title = "👑 Quán Quân Hoàng Gia";
        else if (idx === 1) title = "🥈 Á Quân Toàn Trường";
        else if (idx === 2) title = "🥉 Quý Quân Toàn Trường";
        else if (idx < 10) title = "⭐ Top 10 Xuất Sắc";

        return {
          "Hạng": idx + 1,
          "Họ và Tên Học Sinh": st.studentName,
          "Lớp": st.studentClass,
          "Khối Lớp": `Khối ${st.grade}`,
          "Điểm Cao Nhất": st.highestScore,
          "Tổng Điểm Tích Lũy": st.totalScore,
          "Tổng Sao Vàng": st.totalStars,
          "Số Trận Thi Đấu": st.matchesPlayed,
          "Thời Gian Nhanh Nhất (giây)": st.bestDuration < 999 ? st.bestDuration : "-",
          "Chuỗi Trận 100đ": st.perfectWins || 0,
          "Danh Hiệu Thi Đua": title
        };
      });

      if (window.XLSX) {
        const ws = window.XLSX.utils.json_to_sheet(excelData);
        ws['!cols'] = [
          { wch: 8 },  // Hạng
          { wch: 26 }, // Họ tên
          { wch: 8 },  // Lớp
          { wch: 12 }, // Khối
          { wch: 15 }, // Điểm cao nhất
          { wch: 18 }, // Tổng điểm
          { wch: 15 }, // Tổng sao
          { wch: 15 }, // Số trận
          { wch: 25 }, // Thời gian nhanh nhất
          { wch: 16 }, // Chuỗi 100đ
          { wch: 25 }  // Danh hiệu
        ];
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Bang_Diem_Dau_Truong");
        window.XLSX.writeFile(wb, fileName);
        window.app.showToast(`🎉 Đã xuất thành công file Excel: ${fileName}`, "success");
      } else {
        const headers = Object.keys(excelData[0]);
        const csvRows = [
          headers.join(","),
          ...excelData.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(","))
        ];
        const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName.replace(".xlsx", ".csv");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        window.app.showToast(`🎉 Đã xuất file CSV chuẩn Excel tiếng Việt: ${a.download}`, "success");
      }
    } catch (err) {
      console.error("Lỗi xuất Excel:", err);
      window.app.showToast("❌ Có lỗi xảy ra khi xuất file Excel!", "error");
    }
  }

  async startBattleWithConfig() {
    const lessonSelect = document.getElementById("arena-lesson-select");
    const selectedLesson = lessonSelect ? lessonSelect.value : "all";
    const count = this.selectedG4QuestionCount || 10;
    const grade = this.selectedConfigGrade || 4;

    this.closeConfigModal();
    await this.startBattleWithMode("blitz", grade, count, selectedLesson);
  }

  async startNewBattle() {
    const grade = this.selectedGrade === "all" ? 4 : this.selectedGrade;
    this.openConfigModal(grade);
  }

  async startBattleWithMode(mode = "blitz", grade = 3, questionCount = 5, lessonFilter = "all") {
    this.selectedConfigGrade = grade;
    this.currentTab = "live_arena";
    this.battleStartTime = Date.now();
    
    // 1. Lấy câu hỏi theo bài học và khối lớp an toàn
    let allQuestions = [];
    try {
      if (window.arenaService?.getQuestions) {
        allQuestions = await window.arenaService.getQuestions(grade, "all", lessonFilter);
      }
    } catch (err) {
      console.warn("Lỗi khi tải câu hỏi từ arenaService:", err);
    }
    
    // 2. Nếu bài học chưa đủ số lượng câu hỏi học sinh chọn, tự động bổ sung
    if (allQuestions.length < questionCount) {
      try {
        if (window.arenaService?.getQuestions) {
          const extraQuestions = await window.arenaService.getQuestions(grade, "all", "all");
          const existingIds = new Set(allQuestions.map(q => q.id));
          const needed = questionCount - allQuestions.length;
          const additional = extraQuestions.filter(q => !existingIds.has(q.id)).sort(() => 0.5 - Math.random()).slice(0, needed);
          allQuestions = [...allQuestions, ...additional];
        }
      } catch (e) {}
    }

    // 3. Nếu vẫn chưa đủ số lượng, tự động luân chuyển thêm câu hỏi để LUÔN ĐỦ số câu học sinh đã chọn
    if (allQuestions.length < questionCount && allQuestions.length > 0) {
      const basePool = [...allQuestions];
      while (allQuestions.length < questionCount) {
        const pick = basePool[Math.floor(Math.random() * basePool.length)];
        allQuestions.push({
          ...pick,
          id: pick.id + "_rep_" + allQuestions.length
        });
      }
    }

    // 4. Nếu hoàn toàn không có câu hỏi (ngoại tuyến hoặc lỗi kết nối), dùng bộ câu hỏi SGK dự phòng tức thì
    if (!allQuestions || allQuestions.length === 0) {
      allQuestions = [
        { id: "fallback_1", grade, question: "Thiết bị nào sau đây dùng để nhập dữ liệu chữ và số vào máy tính?", options: ["Bàn phím máy tính", "Màn hình", "Máy in", "Loa"], correctIndex: 0, stars: 20, difficulty: "easy", explanation: "Bàn phím dùng để nhập ký tự và số liệu vào máy tính." },
        { id: "fallback_2", grade, question: "Thao tác nháy đúp chuột máy tính là gì?", options: ["Nhấn nút chuột trái 1 lần", "Nhấn nhanh nút chuột trái 2 lần liên tiếp", "Nhấn nút chuột phải", "Kéo thả chuột"], correctIndex: 1, stars: 20, difficulty: "easy", explanation: "Nháy đúp là thao tác nhấn nhanh nút chuột trái hai lần liên tiếp." },
        { id: "fallback_3", grade, question: "Bộ não xử lý mọi thông tin trong máy tính là thiết bị nào?", options: ["Bộ xử lý trung tâm (CPU trong thân máy)", "Màn hình", "Bàn phím", "Chuột"], correctIndex: 0, stars: 20, difficulty: "medium", explanation: "CPU (Bộ xử lý trung tâm) được xem như bộ não của máy tính." },
        { id: "fallback_4", grade, question: "Hàng phím cơ sở có hai phím định vị có gờ cho hai ngón trỏ là phím nào?", options: ["Phím F và J", "Phím A và L", "Phím G và H", "Phím Spacebar"], correctIndex: 0, stars: 20, difficulty: "medium", explanation: "Phím F và J có gờ nổi để đặt ngón trỏ tay trái và tay phải đúng vị trí." },
        { id: "fallback_5", grade, question: "Để bảo vệ mắt khi ngồi trước máy tính, em nên làm gì?", options: ["Giữ khoảng cách mắt từ 50cm - 70cm với màn hình", "Ngồi sát vào màn hình để nhìn cho rõ", "Tắt hết đèn trong phòng khi dùng máy", "Nhìn liên tục không chớp mắt"], correctIndex: 0, stars: 20, difficulty: "easy", explanation: "Nên ngồi thẳng lưng và giữ khoảng cách 50-70cm với màn hình máy tính." }
      ];
    }

    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    this.battleQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    this.currentQIndex = 0;
    this.userAnswers = [];
    this.score = 0;
    this.starsEarned = 0;
    this.speedStarsCount = 0;
    this.lastAnswerSpeedBonus = null;
    this.selectedOptionIndex = null;
    this.isAnswerRevealed = false;
    this.battleActive = true;

    // 1. Bước 1: Matchmaking Lobby kết nối 4 đối thủ Realtime
    this.initMatchCompetitors(grade);
    this.matchStage = "matchmaking";
    this.render("main-content-area");

    setTimeout(() => {
      // 2. Bước 2: Countdown 3-2-1
      this.matchStage = "countdown";
      this.countdownNum = 3;
      this.playBeep(440, 0.15);
      this.render("main-content-area");

      const cdInterval = setInterval(() => {
        this.countdownNum--;
        if (this.countdownNum > 0) {
          this.playBeep(550, 0.15);
          this.render("main-content-area");
        } else {
          clearInterval(cdInterval);
          this.playBeep(880, 0.3);
          // 3. Bước 3: Vào Trận Đấu Thực Sự
          this.matchStage = "playing";
          if (this.isBGMPlaying) {
            this.startArenaBGM("battle");
          }
          this.startQuestionTimer();
          this.render("main-content-area");
          if (window.ttsService) {
            window.ttsService.speak(`Trận đấu bắt đầu! Câu số 1!`);
          }
        }
      }, 900);
    }, 1500);
  }

  // Tính toán thời gian làm bài linh hoạt sư phạm theo độ khó (Gợi ý 4)
  getDynamicTimeLimit(q) {
    if (!q) return 15;
    let baseTime = 15;
    if (q.difficulty === "hard") {
      baseTime = 25; // Câu vận dụng cao: 25s
    } else if (q.difficulty === "medium") {
      baseTime = 20; // Câu thông hiểu/suy luận: 20s
    } else {
      baseTime = 15; // Câu nhận biết nhanh: 15s
    }

    // Bù thêm thời gian cho học sinh tiểu học nếu câu hỏi dài trên 100 ký tự
    if (q.question && q.question.length > 100) {
      baseTime += 5;
    }
    return baseTime;
  }

  startQuestionTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const q = this.battleQuestions[this.currentQIndex];
    this.timer = this.selectedCustomTimer || this.getDynamicTimeLimit(q);
    this.questionMaxTimer = this.timer;

    this.timerInterval = setInterval(() => {
      this.timer--;
      const timerDisp = document.getElementById("arena-timer-display");
      const timerBar = document.getElementById("arena-timer-bar");
      if (timerDisp) timerDisp.innerText = `${this.timer}s`;
      if (timerBar) timerBar.style.width = `${(this.timer / this.questionMaxTimer) * 100}%`;

      // Âm thanh đếm ngược hồi hộp tích tắc khi còn 5 giây cuối (Gợi ý 2)
      if (this.timer <= 5 && this.timer > 0) {
        this.playTickingCountdown(this.timer);
        if (timerDisp) {
          timerDisp.classList.add("text-rose-600", "font-black", "scale-110");
          setTimeout(() => timerDisp?.classList.remove("scale-110"), 250);
        }
      }

      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeout();
      }
    }, 1000);
  }

  handleTimeout() {
    if (this.isAnswerRevealed) return;
    this.isAnswerRevealed = true;
    this.selectedOptionIndex = -1;
    this.lastAnswerSpeedBonus = null;
    this.streakCombo = 0;
    this.playWrongSound();
    window.app.showToast("⏰ Hết thời gian suy nghĩ!", "error");
    this.render("main-content-area");
  }

  handleSelectAnswer(optionIndex) {
    if (this.isAnswerRevealed) return;
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.selectedOptionIndex = optionIndex;
    this.isAnswerRevealed = true;
    const q = this.battleQuestions[this.currentQIndex];

    // Tính thời gian suy nghĩ đã trôi qua
    const timeSpent = Math.max(1, (this.questionMaxTimer || 15) - this.timer);

    if (optionIndex === q.correctIndex) {
      this.playVictorySound();
      this.streakCombo++;
      const speedBonus = Math.max(10, Math.round(this.timer * 5));
      const comboBonus = (this.streakCombo - 1) * 20;
      const questionScore = 100 + speedBonus + comboBonus;

      // Thưởng Sao Vàng Thần Tốc: Đúng trong <= 5s đầu => +10 Sao Vàng
      const isSpeedBonus = (timeSpent <= 5);
      const speedBonusStars = isSpeedBonus ? 10 : 0;
      if (isSpeedBonus) {
        this.speedStarsCount = (this.speedStarsCount || 0) + 1;
        this.playSpeedStarChime();
      }
      this.lastAnswerSpeedBonus = {
        isSpeed: isSpeedBonus,
        timeSpent,
        bonusStars: speedBonusStars
      };

      this.score += questionScore;
      this.starsEarned += (q.stars || 10) + speedBonusStars;

      // Tiếng vỗ tay rộn rã khi học sinh đạt chuỗi đúng liên tiếp (Gợi ý 2)
      if (this.streakCombo >= 2 && window.ttsService?.playApplause) {
        window.ttsService.playApplause(1.8, false);
      }

      const userComp = (this.competitors || []).find(c => c.isUser);
      if (userComp) userComp.score = this.score;

      if (isSpeedBonus) {
        window.app.showToast(`⚡ THẦN TỐC! Đúng trong ${timeSpent}s: +${questionScore}đ & ⭐ +${(q.stars || 10) + speedBonusStars} Sao (+10 Sao Thần Tốc)!`, "success");
      } else {
        window.app.showToast(`✅ Chính xác! +${questionScore} Điểm (Tốc độ +${speedBonus}) & +${q.stars || 10} ⭐!`, "success");
      }
    } else {
      this.lastAnswerSpeedBonus = null;
      this.playWrongSound();
      this.streakCombo = 0;
      window.app.showToast("❌ Chưa đúng rồi!", "error");
    }

    // Giả lập điểm số các đối thủ AI nhảy Realtime
    (this.competitors || []).forEach(c => {
      if (!c.isUser) {
        if (Math.random() < (c.accuracy || 0.75)) {
          c.score += 80 + Math.floor(Math.random() * 45);
        }
      }
    });

    // Kiểm tra biến động Bảng Xếp Hạng Realtime & Kích hoạt Âm thanh Khán đài Cổ vũ khi Bứt phá TOP 1 (Gợi ý 4)
    const sortedCompetitors = [...(this.competitors || [])].sort((a, b) => b.score - a.score);
    const currentRank = sortedCompetitors.findIndex(c => c.isUser) + 1;
    const isTop1 = (currentRank === 1);
    const justOvertookToTop1 = isTop1 && (this.previousUserRank !== 1 || !this.hasAnnouncedTop1);

    if (justOvertookToTop1) {
      this.hasAnnouncedTop1 = true;
      this.playCrowdCheer(3.2);
      window.app?.showToast?.("🏆👏 KHÁN ĐÀI BÙNG NỔ! Em đã bứt phá vươn lên DẪN ĐẦU TOP 1!", "warning");
      if (window.ttsService?.speak) {
        window.ttsService.speak(`Khán đài bùng nổ! Chúc mừng em ${sortedCompetitors[0].name} đã bứt phá vươn lên dẫn đầu TOP 1 Đấu Trường Tin Học!`);
      }
    } else if (this.streakCombo >= 3 && optionIndex === q.correctIndex) {
      this.playCrowdCheer(1.8);
    }
    this.previousUserRank = currentRank;

    this.render("main-content-area");
  }

  async nextQuestion() {
    if (this.currentQIndex + 1 < this.battleQuestions.length) {
      this.currentQIndex++;
      this.selectedOptionIndex = null;
      this.lastAnswerSpeedBonus = null;
      this.isAnswerRevealed = false;
      this.startQuestionTimer();
      this.render("main-content-area");
    } else {
      await this.finishBattle();
    }
  }

  async finishBattle() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.battleActive = false;
    this.stopSynthBGM();
    this.playVictoryFanfare();

    const totalQuestions = this.battleQuestions.length;
    const maxScore = totalQuestions * 20;
    const isPerfect = (this.score >= maxScore);
    const duration = Math.max(1, Math.round((Date.now() - (this.battleStartTime || Date.now())) / 1000));
    const currentUser = window.authService?.getUser() || {};
    const studentName = currentUser.name || currentUser.username || "Học sinh";
    const studentClass = currentUser.class || currentUser.className || "3A";
    const gradeLevel = this.selectedConfigGrade || (this.selectedGrade === "all" ? 4 : this.selectedGrade);
    const mascot = this.selectedMascot || currentUser.avatar || localStorage.getItem("arena_mascot") || "🤖";

    // Lưu kết quả tóm tắt trận đấu để hiển thị nổi bật trên Bảng Xếp Hạng
    this.lastMatchSummary = {
      studentName,
      studentClass,
      grade: gradeLevel,
      avatar: mascot,
      score: this.score,
      maxScore,
      totalCorrect: Math.round(this.score / 20),
      totalQuestions,
      starsEarned: this.starsEarned,
      speedStarsCount: this.speedStarsCount || 0,
      durationSeconds: duration
    };

    // 1. Lưu điểm số & Thời gian hoàn thành lên Supabase Cloud & Local
    await window.arenaService.recordMatchResult({
      studentName,
      studentClass,
      avatar: mascot,
      score: this.score,
      totalCorrect: Math.round(this.score / 20),
      totalQuestions: totalQuestions,
      starsEarned: this.starsEarned,
      speedStarsCount: this.speedStarsCount || 0,
      durationSeconds: duration,
      grade: gradeLevel
    });

    // 2. Hiệu ứng pháo hoa bắn chúc mừng khi đạt 100% điểm (Gợi ý 2)
    if (isPerfect) {
      this.triggerFireworks();
      if (window.ttsService?.speak) {
        window.ttsService.speak(`Chúc mừng em đạt điểm tối đa ${this.score} điểm! Em chính là Dũng Sĩ Đấu Trường Tin Học!`);
      }
    } else if (window.simulation3D?.triggerFireworks) {
      window.simulation3D.triggerFireworks();
    }

    if (this.score >= 60) {
      this.playCrowdCheer(4.0);
      if (window.ttsService?.playApplause) {
        window.ttsService.playApplause(3.5, true);
      }
    }

    window.app.showToast(`🎉 Xuất sắc! Em hoàn thành trận đấu với ${this.score}/${maxScore} Điểm trong ${duration} giây!`, "success");
    
    // 3. Mở Bằng Chứng Nhận Vinh Danh (Gợi ý 4)
    this.openCertificateModal();

    this.currentTab = "leaderboard";
    this.leaderboardSubTab = "individual";
    this.render("main-content-area");
  }

  // Hiệu ứng Canvas Pháo Hoa Rực Rỡ Vortex (Gợi ý 4)
  triggerFireworks(isVortex = true) {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const particles = [];
    const colors = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#38bdf8"];

    const count = isVortex ? 240 : 180;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        angle: angle,
        speed: speed,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        vortex: isVortex
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        if (p.vortex) {
          p.angle += 0.08;
          p.speed *= 0.98;
          p.x += Math.cos(p.angle) * p.speed + (p.vx * 0.3);
          p.y += Math.sin(p.angle) * p.speed + (p.vy * 0.3);
        } else {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
        }
        p.alpha -= 0.012;

        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      frame++;
      if (frame < 110) {
        requestAnimationFrame(animate);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }
    animate();
  }

  // Mở & Vẽ Giấy Chứng Nhận Dũng Sĩ Đấu Trường (Gợi ý 4)
  openCertificateModal() {
    const modal = document.getElementById("arena-certificate-modal");
    if (modal) modal.classList.add("active");
    setTimeout(() => this.renderCertificateCanvas(), 100);
  }

  renderCertificateCanvas() {
    const canvas = document.getElementById("arena-cert-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const user = window.authService?.getUser() || { name: "Học Sinh Xuất Sắc", className: "3A" };
    const name = user.name || "Học Sinh Xuất Sắc";
    const grade = this.selectedConfigGrade || 4;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 560);
    bgGrad.addColorStop(0, "#0f172a");
    bgGrad.addColorStop(0.5, "#1e1b4b");
    bgGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 560);

    // Decorative Borders
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 760, 520);

    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 740, 500);

    // Header Badge
    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 24px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏆 TRƯỜNG TIỂU HỌC VUI HỌC TIN HỌC 🏆", 400, 75);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "700 13px Nunito, sans-serif";
    ctx.fillText("CHƯƠNG TRÌNH GIÁO DỤC PHỔ THÔNG 2018 - CÔNG VĂN 2345/BGDĐT", 400, 105);

    // Title
    ctx.fillStyle = "#38bdf8";
    ctx.font = "900 34px Outfit, sans-serif";
    ctx.fillText("GIẤY CHỨNG NHẬN VINH DANH", 400, 160);

    ctx.fillStyle = "#f43f5e";
    ctx.font = "900 28px Outfit, sans-serif";
    ctx.fillText("⚡ DŨNG SĨ ĐẤU TRƯỜNG TIN HỌC ⚡", 400, 205);

    // Student Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 16px Nunito, sans-serif";
    ctx.fillText("Trao tặng cho Học sinh:", 400, 255);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "900 36px Outfit, sans-serif";
    ctx.fillText(name.toUpperCase(), 400, 305);

    // Performance Details
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "600 15px Nunito, sans-serif";
    ctx.fillText(`Lớp ${user.className || "3A"} • Khối ${grade} • SGK Kết Nối Tri Thức Với Cuộc Sống`, 400, 345);

    ctx.fillStyle = "#10b981";
    ctx.font = "900 18px Nunito, sans-serif";
    const speedBonusText = (this.lastMatchSummary?.speedStarsCount > 0) ? ` (⚡ ${this.lastMatchSummary.speedStarsCount} lần Thần Tốc)` : "";
    ctx.fillText(`🎯 Thành tích: Đạt ${this.score || 100} Điểm • ⭐ +${this.starsEarned || 20} Sao Vàng Bảng Vàng${speedBonusText}`, 400, 385);

    // Date & Stamp Signature
    const todayStr = `Đà Nẵng, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 13px Nunito, sans-serif";
    ctx.fillText(todayStr, 600, 440);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 14px Nunito, sans-serif";
    ctx.fillText("BAN TRỌNG TÀI ĐẤU TRƯỜNG", 600, 465);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "900 13px Nunito, sans-serif";
    ctx.fillText("Cô Giáo Anh Đào", 600, 510);
  }

  downloadCertificatePNG() {
    const canvas = document.getElementById("arena-cert-canvas");
    if (!canvas) return;

    const user = window.authService?.getUser() || { name: "HocSinh" };
    const link = document.createElement("a");
    link.download = `ChungNhan_DungSi_DauTruong_${(user.name || "HocSinh").replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    window.app.showToast("📥 Đã tải Giấy Chứng Nhận Dũng Sĩ Đấu Trường (.PNG) thành công!", "success");
  }

  // Xuất Báo Cáo Kết Quả Đấu Trường PDF Cho Phụ Huynh (Gợi ý 5)
  exportArenaPDFReport() {
    const user = window.authService?.getUser() || { name: "Học Sinh Xuất Sắc", className: "3A" };
    const name = user.name || "Học Sinh Xuất Sắc";
    const grade = this.selectedConfigGrade || 4;
    const score = this.score || 100;
    const totalQ = this.battleQuestions?.length || 10;
    const duration = Math.max(1, Math.round((Date.now() - (this.battleStartTime || Date.now())) / 1000));
    const todayStr = `Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      window.app.showToast("⚠️ Vui lòng cho phép mở cửa sổ bật lên (popup) để in Báo Cáo PDF!", "warning");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>BÁO CÁO KẾT QUẢ ĐẤU TRƯỜNG TIN HỌC - ${name}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; color: #1e293b; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
          .header h2 { margin: 0; font-size: 20px; color: #0f172a; text-transform: uppercase; }
          .header h1 { margin: 10px 0 5px 0; font-size: 26px; color: #0284c7; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table td { padding: 10px; border: 1px solid #cbd5e1; font-size: 15px; }
          .info-table td.label { font-weight: bold; background-color: #f8fafc; width: 35%; }
          .result-box { background: #f0f9ff; border: 2px dashed #0284c7; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0; }
          .result-box .score { font-size: 36px; font-weight: bold; color: #059669; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; }
          .footer .sign-box { width: 45%; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>TRƯỜNG TIỂU HỌC VUI HỌC TIN HỌC 3-5</h2>
          <p style="margin: 3px; font-size: 13px; font-style: italic;">Chương trình GDPT 2018 - Chuẩn Công văn 2345/BGDĐT</p>
          <h1>BÁO CÁO KẾT QUẢ ĐẤU TRƯỜNG TIN HỌC</h1>
          <p><i>Kính gửi Quý Phụ Huynh Học Sinh</i></p>
        </div>

        <table class="info-table">
          <tr>
            <td class="label">Họ và tên Học sinh:</td>
            <td><b>${name}</b></td>
          </tr>
          <tr>
            <td class="label">Lớp & Khối học:</td>
            <td>Lớp ${user.className || "3A"} • Khối ${grade} (SGK Kết Nối Tri Thức)</td>
          </tr>
          <tr>
            <td class="label">Số câu hỏi hoàn thành:</td>
            <td><b>${totalQ} câu hỏi</b></td>
          </tr>
          <tr>
            <td class="label">Thời gian thi đấu:</td>
            <td><b>${duration} giây</b></td>
          </tr>
          <tr>
            <td class="label">Sao Vàng tích lũy:</td>
            <td><b>⭐ +${this.starsEarned || 20} Sao Vàng Bảng Vàng</b></td>
          </tr>
        </table>

        <div class="result-box">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #475569;">TỔNG ĐIỂM ĐẠT ĐƯỢC</p>
          <div class="score">${score} ĐIỂM</div>
          <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: #0284c7;">
            ${score >= 90 ? '🌟 Nhận xét: Đạt loại XUẤT SẮC - Tư duy Tin học vô cùng nhạy bén!' : score >= 70 ? '🎉 Nhận xét: Đạt loại GIỎI - Phản xạ gõ bàn phím và làm bài rất tốt!' : '👍 Nhận xét: Đạt loại KHÁ - Cần tiếp tục rèn luyện thêm ở các bài học tiếp theo.'}
          </p>
        </div>

        <div class="footer">
          <div class="sign-box">
            <p><b>XÁC NHẬN PHỤ HUYNH</b></p>
            <br><br><br>
            <p>(Ký & ghi rõ họ tên)</p>
          </div>
          <div class="sign-box">
            <p><i>Đà Nẵng, ${todayStr}</i></p>
            <p><b>GIÁO VIÊN BỘ MÔN TIN HỌC</b></p>
            <br><br><br>
            <p><b>Cô Giáo Anh Đào</b></p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
    window.app.showToast("📄 Đã xuất Báo cáo Kết quả PDF gửi Phụ huynh thành công!", "success");
  }

  // Xuất Đề Thi Trắc Nghiệm SGK Word (.docx) Chuẩn Công văn 2345/BGDĐT (Gợi ý 1)
  async exportSGKExamDocx() {
    const grade = this.selectedConfigGrade || 4;
    const lessonId = this.selectedConfigLesson || "all";
    const questions = await window.arenaService.getQuestions(grade, "all", lessonId);

    if (!questions || questions.length === 0) {
      window.app.showToast("⚠️ Chưa tìm thấy câu hỏi bài học để xuất đề thi!", "warning");
      return;
    }

    const todayStr = `Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;

    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>ĐỀ KIỂM TRA TRẮC NGHIỆM TIN HỌC KÍCH THƯỚC LỚP ${grade}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; padding: 20px; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .header-table td { text-align: center; vertical-align: top; }
          .title { text-align: center; font-weight: bold; font-size: 16pt; color: #000; margin: 15px 0; text-transform: uppercase; }
          .sub-title { text-align: center; font-style: italic; font-size: 11pt; margin-bottom: 20px; }
          .question-box { margin-bottom: 15px; }
          .question-title { font-weight: bold; }
          .options-grid { margin-left: 20px; margin-top: 5px; }
          .answer-key-table { width: 100%; border-collapse: collapse; margin-top: 30px; text-align: center; }
          .answer-key-table td, .answer-key-table th { border: 1px solid #000; padding: 6px; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 45%;">
              <b>TRƯỜNG TIỂU HỌC VUI HỌC TIN HỌC</b><br>
              <b>BỘ MÔN TIN HỌC 3-5</b><br>
              <i>(Đề thi trắc nghiệm SGK)</i>
            </td>
            <td style="width: 55%;">
              <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br>
              <b><u>Độc lập - Tự do - Hạnh phúc</u></b><br>
              <i>Đà Nẵng, ${todayStr}</i>
            </td>
          </tr>
        </table>

        <div class="title">ĐỀ KIỂM TRA TRẮC NGHIỆM TIN HỌC KHỐI LỚP ${grade}</div>
        <div class="sub-title">Chương trình GDPT 2018 • Chuẩn Công văn 2345/BGDĐT • Thời gian: 15 phút</div>

        <p><b>Họ và tên học sinh:</b> ............................................................................ <b>Lớp:</b> ${grade}A...</p>
        <hr style="border: 1px solid #000; margin-bottom: 20px;">

        ${questions.map((q, idx) => `
          <div class="question-box">
            <div class="question-title">Câu ${idx + 1}: ${q.question}</div>
            <div class="options-grid">
              ${q.options.map(opt => `<div>${opt}</div>`).join('')}
            </div>
          </div>
        `).join('')}

        <br><br>
        <div style="page-break-before: always;"></div>
        <h3 style="text-align: center; font-weight: bold; text-transform: uppercase;">BẢNG ĐÁP ÁN VÀ LỜI GIẢI THÍCH (DÀNH CHO GIÁO VIÊN)</h3>

        <table class="answer-key-table">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>Câu số</th>
              <th>Đáp án đúng</th>
              <th>Lời giải thích sư phạm</th>
            </tr>
          </thead>
          <tbody>
            ${questions.map((q, idx) => `
              <tr>
                <td><b>Câu ${idx + 1}</b></td>
                <td><b>${String.fromCharCode(65 + q.correctIndex)}</b></td>
                <td style="text-align: left;">${q.explanation || 'Kiến thức cốt lõi SGK Tin học.'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DeThi_TinHoc_Lop${grade}_${lessonId.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    window.app.showToast("📄 Đã xuất Đề Thi Word (.docx) chuẩn Công văn 2345 thành công!", "success");
  }

  // 1. Mở Xem Lại Lời Giải Chi Tiết Sau Trận Đấu (Gợi ý 4)
  openReviewAnswersModal() {
    const modal = document.getElementById("arena-review-modal");
    const container = document.getElementById("arena-review-content");
    if (!modal || !container) return;

    if (!this.battleQuestions || this.battleQuestions.length === 0) {
      window.app.showToast("⚠️ Chưa có dữ liệu trận đấu vừa qua để xem lại!", "warning");
      return;
    }

    container.innerHTML = this.battleQuestions.map((q, idx) => {
      const userAnsIdx = this.userAnswers ? this.userAnswers[idx] : null;
      const isCorrect = userAnsIdx === q.correctIndex;

      return `
        <div class="p-4 rounded-2xl border ${isCorrect ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-rose-950/30 border-rose-500/40'} space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-black text-xs uppercase px-2.5 py-1 rounded-lg ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}">
              CÂU ${idx + 1}: ${isCorrect ? '✅ ĐÚNG' : '❌ SAI'}
            </span>
            <span class="text-xs text-slate-400 font-bold">Chủ đề: ${q.topic}</span>
          </div>

          <p class="font-bold text-sm text-white">${q.question}</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            ${q.options.map((opt, optIdx) => `
              <div class="p-2.5 rounded-xl border ${optIdx === q.correctIndex ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 font-black' : optIdx === userAnsIdx ? 'bg-rose-600/30 border-rose-400 text-rose-200 font-bold' : 'bg-slate-900/50 border-slate-800 text-slate-400'} flex items-center justify-between">
                <span>${opt}</span>
                <span>${optIdx === q.correctIndex ? '✅ Đáp án đúng' : optIdx === userAnsIdx ? '❌ Bạn chọn' : ''}</span>
              </div>
            `).join('')}
          </div>

          <div class="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
            <p class="font-bold text-amber-300 mb-0.5">💡 Lời giải thích sư phạm:</p>
            <p>${q.explanation || 'Hãy ghi nhớ kiến thức cốt lõi này trong SGK Tin học nhé!'}</p>
          </div>
        </div>
      `;
    }).join('');

    modal.classList.add("active");
  }

  // =========================================================================
  // HỆ THỐNG NHẠC NỀN ĐẤU TRƯỜNG ĐA BÈ (ARCADE ESPORTS SYNTHESIZER ENGINE)
  // =========================================================================
  toggleArenaBGM() {
    this.isBGMPlaying = !this.isBGMPlaying;
    localStorage.setItem("arena_bgm_enabled", this.isBGMPlaying ? "true" : "false");
    this.updateBGMControlsUI();

    if (this.isBGMPlaying) {
      const mode = (this.battleActive && this.matchStage === "playing") ? "battle" : "lobby";
      this.startArenaBGM(mode);
      window.app?.showToast?.("🎵 Đã BẬT Nhạc Nền Đấu Trường Sôi Động!", "info");
    } else {
      this.stopSynthBGM();
      window.app?.showToast?.("🔇 Đã TẮT Nhạc Nền Đấu Trường!", "info");
    }
  }

  updateBGMControlsUI() {
    const isPlaying = !!this.isBGMPlaying;
    const btnLbl = document.getElementById("lbl-arena-bgm");
    if (btnLbl) btnLbl.innerText = isPlaying ? "Nhạc BGM: BẬT" : "Nhạc BGM: TẮT";
    const lobbyLbl = document.getElementById("lbl-lobby-bgm");
    if (lobbyLbl) lobbyLbl.innerText = isPlaying ? "Nhạc: BẬT" : "Nhạc: TẮT";
    const lobbyBtn = document.getElementById("btn-lobby-bgm");
    if (lobbyBtn) {
      lobbyBtn.className = `btn ${isPlaying ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'} font-black btn-xs shadow-xs px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer`;
      const icon = lobbyBtn.querySelector("span");
      if (icon) icon.innerText = isPlaying ? "🔊" : "🔇";
    }
    const battleBtn = document.getElementById("btn-battle-bgm-toggle");
    if (battleBtn) {
      battleBtn.innerHTML = `<span>${isPlaying ? '🔊' : '🔇'}</span>`;
      battleBtn.title = isPlaying ? "Nhạc Nền: BẬT (Bấm để Tắt)" : "Nhạc Nền: TẮT (Bấm để Bật)";
    }
  }

  startArenaBGM(mode = "battle") {
    if (!this.isBGMPlaying) return;
    this.bgmMode = mode;
    this.playSynthBGM(mode);
  }

  playSynthBGM(mode = "battle") {
    this.stopSynthBGM();
    if (!this.isBGMPlaying) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.bgmCtx || this.bgmCtx.state === "closed") {
        this.bgmCtx = new AudioCtx();
      }
      if (this.bgmCtx.state === "suspended") {
        this.bgmCtx.resume();
      }

      // Tạo Noise Buffer cho trống Hi-Hat / Snare điện tử
      if (!this.noiseBuffer && this.bgmCtx) {
        const bufferSize = this.bgmCtx.sampleRate;
        const buffer = this.bgmCtx.createBuffer(1, bufferSize, this.bgmCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
      }

      const masterGain = this.bgmCtx.createGain();
      const vol = this.bgmVolume || 0.22;
      masterGain.gain.setValueAtTime(vol, this.bgmCtx.currentTime);
      masterGain.connect(this.bgmCtx.destination);
      this.masterBGMGain = masterGain;

      // 1. Kick Drum (Tiếng trống Kick dứt khoát)
      const triggerKick = (t) => {
        try {
          const osc = this.bgmCtx.createOscillator();
          const g = this.bgmCtx.createGain();
          osc.frequency.setValueAtTime(145, t);
          osc.frequency.exponentialRampToValueAtTime(36, t + 0.08);
          g.gain.setValueAtTime(0.2, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.09);
        } catch (e) {}
      };

      // 2. Hi-Hat (Tiếng xèng nhịp điện tử)
      const triggerHiHat = (t, isOpen = false) => {
        try {
          if (!this.noiseBuffer) return;
          const src = this.bgmCtx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const flt = this.bgmCtx.createBiquadFilter();
          flt.type = "highpass";
          flt.frequency.value = 7500;
          const g = this.bgmCtx.createGain();
          const dur = isOpen ? 0.08 : 0.035;
          g.gain.setValueAtTime(0.06, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          src.connect(flt);
          flt.connect(g);
          g.connect(masterGain);
          src.start(t);
          src.stop(t + dur);
        } catch (e) {}
      };

      // 3. Snare (Tiếng đanh nhịp 2 và 4)
      const triggerSnare = (t) => {
        try {
          triggerHiHat(t, true);
          const osc = this.bgmCtx.createOscillator();
          const g = this.bgmCtx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(190, t);
          osc.frequency.exponentialRampToValueAtTime(80, t + 0.07);
          g.gain.setValueAtTime(0.08, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.08);
        } catch (e) {}
      };

      // 4. Synth Bass (Rung nhịp kịch tính)
      const triggerBass = (freq, t, dur = 0.1) => {
        try {
          const osc = this.bgmCtx.createOscillator();
          const flt = this.bgmCtx.createBiquadFilter();
          flt.type = "lowpass";
          flt.frequency.setValueAtTime(450, t);
          flt.frequency.exponentialRampToValueAtTime(220, t + dur);
          const g = this.bgmCtx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(flt);
          flt.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + dur);
        } catch (e) {}
      };

      // 5. Arp Lead (Giai điệu game hào hùng)
      const triggerLead = (freq, t, dur = 0.12) => {
        try {
          const osc = this.bgmCtx.createOscillator();
          const g = this.bgmCtx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.09, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + dur);
        } catch (e) {}
      };

      // 6. Suspense Ticking (Tích tắc hồi hộp dồn dập khi sắp hết giờ)
      const triggerTensionTick = (t) => {
        try {
          const osc = this.bgmCtx.createOscillator();
          const g = this.bgmCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(950, t);
          g.gain.setValueAtTime(0.14, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.045);
        } catch (e) {}
      };

      // Giai điệu và Hợp âm 32 bước (Phrygian / Minor Heroic Arcade Mode)
      const battleBassNotes = [
        73.4, 73.4, 73.4, 73.4, 87.3, 87.3, 87.3, 87.3, 98.0, 98.0, 98.0, 98.0, 110.0, 110.0, 110.0, 110.0,
        73.4, 73.4, 73.4, 73.4, 58.3, 58.3, 58.3, 58.3, 65.4, 65.4, 65.4, 65.4, 55.0, 55.0, 110.0, 110.0
      ];

      const battleLeadNotes = [
        293.7, null, 349.2, null, 440.0, null, 587.3, null,
        523.3, null, 440.0, null, 392.0, 349.2, 392.0, 440.0,
        293.7, null, 349.2, null, 587.3, null, 698.5, null,
        659.3, null, 523.3, null, 440.0, 392.0, 349.2, 329.6
      ];

      // Nhịp điệu: Battle 132 BPM (114ms) | Lobby 110 BPM (136ms)
      const isBattle = (mode === "battle");
      const stepIntervalMs = isBattle ? 114 : 136;
      let step = 0;

      this.bgmTimer = setInterval(() => {
        if (!this.bgmCtx) return;
        const now = this.bgmCtx.currentTime;
        const stepInBar = step % 32;

        if (isBattle) {
          // Trống Kick (Nhịp 0, 8, 16, 24)
          if (stepInBar === 0 || stepInBar === 8 || stepInBar === 16 || stepInBar === 24) {
            triggerKick(now);
          }
          // Trống Snare (Nhịp 4, 12, 20, 28)
          if (stepInBar === 4 || stepInBar === 12 || stepInBar === 20 || stepInBar === 28) {
            triggerSnare(now);
          }
          // Hi-Hat (Nhịp chẵn phụ)
          if (stepInBar % 2 === 0 && stepInBar % 4 !== 0) {
            triggerHiHat(now, stepInBar % 8 === 6);
          }

          // Bassline dồn dập
          const bNote = battleBassNotes[stepInBar];
          if (bNote && stepInBar % 2 === 0) {
            triggerBass(bNote, now, 0.09);
          }

          // Lead giai điệu
          const lNote = battleLeadNotes[stepInBar];
          if (lNote) {
            triggerLead(lNote, now, 0.12);
          }

          // Hiệu ứng hồi hộp khi thời gian câu hỏi <= 5s
          if (this.battleActive && this.timer <= 5 && this.timer > 0) {
            triggerTensionTick(now);
          }
        } else {
          // Lobby Mode (Chill Synthwave nhẹ nhàng kích thích hứng thú)
          if (stepInBar % 8 === 0) triggerKick(now);
          if (stepInBar % 4 === 2) triggerHiHat(now);
          const lobbyScale = [110.0, 130.8, 146.8, 164.8, 196.0];
          if (stepInBar % 4 === 0) {
            triggerBass(lobbyScale[Math.floor(stepInBar / 4) % lobbyScale.length], now, 0.15);
          }
          if (stepInBar % 4 === 2) {
            triggerLead(lobbyScale[(Math.floor(stepInBar / 4) + 2) % lobbyScale.length] * 2, now, 0.18);
          }
        }

        step++;
      }, stepIntervalMs);
    } catch (e) {
      console.warn("BGM synth error", e);
    }
  }

  stopSynthBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmCtx) {
      try {
        if (this.masterBGMGain) {
          this.masterBGMGain.gain.setValueAtTime(0.001, this.bgmCtx.currentTime);
        }
      } catch (e) {}
    }
  }

  playVictoryFanfare() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const notes = [
        { f: 523.25, d: 0.15, offset: 0 },
        { f: 659.25, d: 0.15, offset: 0.14 },
        { f: 783.99, d: 0.18, offset: 0.28 },
        { f: 1046.50, d: 0.55, offset: 0.44 }
      ];
      notes.forEach(n => {
        const osc = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.f, t + n.offset);
        g.gain.setValueAtTime(0.2, t + n.offset);
        g.gain.exponentialRampToValueAtTime(0.001, t + n.offset + n.d);
        osc.connect(g);
        g.connect(this.audioCtx.destination);
        osc.start(t + n.offset);
        osc.stop(t + n.offset + n.d);
      });
    } catch (e) {}
  }

  // =========================================================================
  // HIỆU ỨNG ÂM THANH CỔ VŨ KHÁN ĐÀI BÙNG NỔ (CROWD CHEER & STADIUM APPLAUSE)
  // Gồm: Chùm vỗ tay ngẫu nhiên (65+ claps) + Tiếng hò reo vang dội (vocal swell)
  // + Tiếng huýt sáo cổ vũ (stadium whistle) + Hợp âm kèn chiến thắng (fanfare)
  // =========================================================================
  playCrowdCheer(duration = 3.2) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // 1. ÂM HÒ REO CỦA KHÁN ĐÀI (Crowd Roar / Vocal Resonant Swell)
      const roarDuration = Math.min(duration, 3.5);
      const roarBufferSize = Math.floor(ctx.sampleRate * roarDuration);
      const roarBuffer = ctx.createBuffer(1, roarBufferSize, ctx.sampleRate);
      const roarData = roarBuffer.getChannelData(0);
      let lastVal = 0;
      for (let i = 0; i < roarBufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastVal = (lastVal + (0.05 * white)) / 1.05;
        roarData[i] = lastVal * 3.5;
      }

      const roarSource = ctx.createBufferSource();
      roarSource.buffer = roarBuffer;

      // Bộ lọc Formant tạo cảm giác tiếng hô "Ooooohhh" của hàng trăm khán giả
      const formantFilter = ctx.createBiquadFilter();
      formantFilter.type = "bandpass";
      formantFilter.frequency.setValueAtTime(680, now);
      formantFilter.Q.setValueAtTime(2.2, now);

      const roarGain = ctx.createGain();
      roarGain.gain.setValueAtTime(0.01, now);
      roarGain.gain.linearRampToValueAtTime(0.22, now + 0.5);
      roarGain.gain.setValueAtTime(0.22, now + roarDuration * 0.6);
      roarGain.gain.exponentialRampToValueAtTime(0.001, now + roarDuration);

      roarSource.connect(formantFilter);
      formantFilter.connect(roarGain);
      roarGain.connect(ctx.destination);
      roarSource.start(now);
      roarSource.stop(now + roarDuration);

      // 2. CHÙM TIẾNG VỖ TAY RÒN RÃ KHẮP KHÁN ĐÀI (65+ Dense Claps)
      const clapCount = 65;
      for (let c = 0; c < clapCount; c++) {
        const clapOffset = Math.random() * (duration - 0.25);
        const clapLen = 0.03 + Math.random() * 0.04;
        const clapBufSize = Math.floor(ctx.sampleRate * clapLen);
        const clapBuf = ctx.createBuffer(1, clapBufSize, ctx.sampleRate);
        const cd = clapBuf.getChannelData(0);
        for (let j = 0; j < clapBufSize; j++) {
          cd[j] = (Math.random() * 2 - 1) * Math.exp(-j / (clapBufSize * 0.3));
        }

        const clapSrc = ctx.createBufferSource();
        clapSrc.buffer = clapBuf;

        const clapFilter = ctx.createBiquadFilter();
        clapFilter.type = "bandpass";
        clapFilter.frequency.setValueAtTime(900 + Math.random() * 1400, now + clapOffset);
        clapFilter.Q.setValueAtTime(1.5, now + clapOffset);

        const cGain = ctx.createGain();
        const baseVol = 0.06 + Math.random() * 0.12;
        cGain.gain.setValueAtTime(baseVol, now + clapOffset);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + clapOffset + clapLen);

        clapSrc.connect(clapFilter);
        clapFilter.connect(cGain);
        cGain.connect(ctx.destination);

        clapSrc.start(now + clapOffset);
        clapSrc.stop(now + clapOffset + clapLen);
      }

      // 3. TIẾNG HUÝT SÁO CỔ VŨ THỂ THAO REO VANG (Stadium Pea-Whistle)
      const whistleOsc1 = ctx.createOscillator();
      const whistleOsc2 = ctx.createOscillator();
      const whistleGain = ctx.createGain();

      whistleOsc1.type = "sine";
      whistleOsc2.type = "sine";
      whistleOsc1.frequency.setValueAtTime(2450, now + 0.35);
      whistleOsc2.frequency.setValueAtTime(2780, now + 0.35);

      whistleGain.gain.setValueAtTime(0.001, now);
      whistleGain.gain.setValueAtTime(0.001, now + 0.35);
      whistleGain.gain.linearRampToValueAtTime(0.12, now + 0.45);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      whistleOsc1.connect(whistleGain);
      whistleOsc2.connect(whistleGain);
      whistleGain.connect(ctx.destination);

      whistleOsc1.start(now + 0.35);
      whistleOsc2.start(now + 0.35);
      whistleOsc1.stop(now + 1.15);
      whistleOsc2.stop(now + 1.15);

      // 4. HỢP ÂM KÈN VINH QUANG BỨT PHÁ (Fanfare Stabs)
      const brassNotes = [
        { f: 523.25, offset: 0.1, dur: 0.25 },
        { f: 659.25, offset: 0.22, dur: 0.28 },
        { f: 783.99, offset: 0.35, dur: 0.35 },
        { f: 1046.50, offset: 0.52, dur: 0.8 }
      ];
      brassNotes.forEach(b => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(b.f, now + b.offset);

        g.gain.setValueAtTime(0.001, now + b.offset);
        g.gain.linearRampToValueAtTime(0.18, now + b.offset + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, now + b.offset + b.dur);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + b.offset);
        osc.stop(now + b.offset + b.dur);
      });
    } catch (e) {
      console.warn("Crowd cheer sound error", e);
    }
  }

  // 1. Mở Modal Giải Đấu Vòng Bảng Knockout Cấp Lớp (Gợi ý 3)
  openTournamentModal() {
    const modal = document.getElementById("arena-tournament-modal");
    if (modal) {
      modal.classList.add("active");
      this.generateClassBracket();
    }
  }

  generateClassBracket() {
    const container = document.getElementById("arena-tournament-bracket-area");
    if (!container) return;

    const input = document.getElementById("arena-tournament-students-input");
    let studentList = [];

    if (input && input.value.trim()) {
      studentList = input.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    if (studentList.length < 8) {
      studentList = [
        "Nguyễn Văn An (4A)", "Trần Bảo Ngọc (4A)", "Lê Hoàng Nam (4B)", "Phạm Minh Anh (4B)",
        "Vũ Đức Khoa (4C)", "Đỗ Khánh Linh (4C)", "Bùi Quang Huy (4D)", "Hoàng Thảo My (4D)"
      ];
    }

    const shuffled = [...studentList].sort(() => 0.5 - Math.random());
    this.currentBracketStudents = shuffled;

    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center space-y-1">
          <span class="badge bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 uppercase">SƠ ĐỒ CÂY THI ĐẤU KNOCKOUT SƠ LOẠI</span>
          <h4 class="font-black text-base text-amber-300">VÒNG TỨ KẾT ➔ BÁN KẾT ➔ CHUNG KẾT CẤP LỚP</h4>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <!-- VÒNG TỨ KẾT -->
          <div class="space-y-3">
            <h5 class="text-xs font-black text-cyan-300 text-center uppercase">🔥 VÒNG TỨ KẾT (4 TRẬN)</h5>
            ${[0, 2, 4, 6].map(i => `
              <div class="p-3 bg-slate-900 rounded-xl border border-cyan-500/40 text-xs space-y-1">
                <div class="flex justify-between font-bold text-white"><span>🥊 ${shuffled[i] || 'Học sinh A'}</span><span class="text-amber-300">VS</span></div>
                <div class="flex justify-between font-bold text-slate-300"><span>🥊 ${shuffled[i+1] || 'Học sinh B'}</span><span class="badge bg-emerald-600 text-white text-[9px]">TRẮNG TRẬN</span></div>
              </div>
            `).join('')}
          </div>

          <!-- VÒNG BÁN KẾT -->
          <div class="space-y-3">
            <h5 class="text-xs font-black text-purple-300 text-center uppercase">⚡ VÒNG BÁN KẾT (2 TRẬN)</h5>
            <div class="p-4 bg-slate-900 rounded-xl border border-purple-500/40 text-xs space-y-2">
              <p class="font-black text-purple-200">BÁN KẾT 1:</p>
              <p class="font-bold text-white">🥇 Thắng Tứ Kết 1 VS 🥇 Thắng Tứ Kết 2</p>
            </div>
            <div class="p-4 bg-slate-900 rounded-xl border border-purple-500/40 text-xs space-y-2">
              <p class="font-black text-purple-200">BÁN KẾT 2:</p>
              <p class="font-bold text-white">🥇 Thắng Tứ Kết 3 VS 🥇 Thắng Tứ Kết 4</p>
            </div>
          </div>

          <!-- TRẬN CHUNG KẾT -->
          <div class="p-5 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 rounded-2xl border-2 border-amber-400 text-center space-y-3 shadow-2xl">
            <span class="text-4xl block animate-bounce">🏆</span>
            <h5 class="font-black text-sm text-amber-300 uppercase">TRẬN CHUNG KẾT CÚP VÀNG</h5>
            <p class="text-xs font-extrabold text-white">Tranh Tái Ngai Vàng Dũng Sĩ Đấu Trường</p>
            <button onclick="arenaPortal.startBattleWithMode('blitz', 4, 10, 'all')" class="btn btn-amber btn-md font-black w-full shadow-xl">
              🚀 KÍCH HOẠT THI ĐẤU CHUNG KẾT ▶
            </button>
          </div>
        </div>
      </div>
    `;
  }

  downloadTournamentBracketPNG() {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");

    const bgGrad = ctx.createLinearGradient(0, 0, 1000, 700);
    bgGrad.addColorStop(0, "#0f172a");
    bgGrad.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 700);

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 960, 660);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 28px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏆 SƠ ĐỒ CÂY THI ĐẤU KNOCKOUT GIẢI ĐẤU CẤP LỚP 🏆", 500, 70);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "700 16px Nunito, sans-serif";
    ctx.fillText("TRƯỜNG TIỂU HỌC VUI HỌC TIN HỌC • CHƯƠNG TRÌNH GDPT 2018", 500, 105);

    const students = this.currentBracketStudents || [
      "Nguyễn Văn An (4A)", "Trần Bảo Ngọc (4A)", "Lê Hoàng Nam (4B)", "Phạm Minh Anh (4B)",
      "Vũ Đức Khoa (4C)", "Đỗ Khánh Linh (4C)", "Bùi Quang Huy (4D)", "Hoàng Thảo My (4D)"
    ];

    ctx.textAlign = "left";
    ctx.font = "700 14px Nunito, sans-serif";
    for (let i = 0; i < 4; i++) {
      const y = 160 + i * 120;
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.fillRect(50, y, 260, 80);
      ctx.strokeRect(50, y, 260, 80);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(`🥊 ${students[i * 2] || 'Học sinh 1'}`, 65, y + 30);
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(`🥊 ${students[i * 2 + 1] || 'Học sinh 2'}`, 65, y + 60);
    }

    ctx.fillStyle = "#78350f";
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 4;
    ctx.fillRect(680, 260, 260, 140);
    ctx.strokeRect(680, 260, 260, 140);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 18px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏆 TRẬN CHUNG KẾT CÚP VÀNG", 810, 310);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 14px Nunito, sans-serif";
    ctx.fillText("Nhà Vô Địch Cấp Lớp 2026", 810, 350);

    const link = document.createElement("a");
    link.download = "SoDoCay_GiaiDau_CapLop.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    window.app?.showToast?.("📥 Đã tải Ảnh Sơ Đồ Cây Thi Đấu (.PNG) thành công!", "success");
  }

  openTreasureModal() {
    const modal = document.getElementById("arena-treasure-modal");
    if (modal) modal.classList.add("active");
  }

  claimTreasureReward() {
    this.starsEarned += 100;
    this.triggerFireworks(true);
    window.app?.showToast?.("🎁 ĐÃ NHẬN KHO BÁU: ⭐ +100 Sao Vàng & Huy Hiệu Rồng Vàng 2026!", "success");
    document.getElementById("arena-treasure-modal")?.classList.remove("active");
  }

  importStudentCSVFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

      const input = document.getElementById("arena-tournament-students-input");
      if (input) {
        input.value = lines.join(", ");
        this.generateClassBracket();
        window.app?.showToast?.(`📁 Đã nhập thành công ${lines.length} học sinh từ tệp CSV!`, "success");
      }
    };
    reader.readAsText(file);
  }

  // 2. Chế Độ Đấu Trùm AI Virus Máy Tính (Gợi ý 5)
  openBossBattleModal() {
    const modal = document.getElementById("arena-boss-modal");
    if (!modal) return;

    this.bossMaxHP = 1000;
    this.bossHP = 1000;
    this.renderBossStage();
    modal.classList.add("active");
  }

  renderBossStage() {
    const container = document.getElementById("arena-boss-stage");
    if (!container) return;

    const hpPercent = Math.max(0, Math.round((this.bossHP / this.bossMaxHP) * 100));

    container.innerHTML = `
      <div id="boss-card-box" class="p-6 bg-slate-900 rounded-3xl border-2 border-rose-500/50 space-y-4 shadow-2xl transition-all">
        <div class="relative inline-block">
          <span class="text-7xl block animate-bounce filter drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">👾</span>
          <span class="badge bg-rose-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full absolute -top-2 -right-2">TRÙM AI VIRUS</span>
        </div>

        <div class="space-y-1">
          <h4 class="font-black text-xl text-rose-300 uppercase">VIRUS ĐỘC HẠI HỆ THỐNG</h4>
          <p class="text-xs text-slate-400 font-semibold">HP: <span class="font-mono text-amber-300 font-black">${this.bossHP}</span> / ${this.bossMaxHP} HP</p>
        </div>

        <!-- Thanh Máu Boss HP Bar -->
        <div class="w-full bg-slate-950 h-6 rounded-full overflow-hidden p-1 border border-rose-500/40 shadow-inner">
          <div class="bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 h-full rounded-full transition-all duration-500" style="width: ${hpPercent}%"></div>
        </div>

        <div class="pt-2 space-y-2">
          <button onclick="arenaPortal.attackBossVirus()" class="btn bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white btn-lg font-black w-full shadow-2xl animate-pulse flex items-center justify-center gap-2">
            <span>⚡</span> <span>TUNG CHIÊU DIỆT VIRUS (-100 HP) ▶</span>
          </button>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <button onclick="arenaPortal.useShieldSkill()" class="btn bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white btn-md font-black shadow-lg flex items-center justify-center gap-1.5">
              <span>🛡️</span> <span>Lá Chắn Bảo Vệ</span>
            </button>
            <button onclick="arenaPortal.useDoubleDamageSkill()" class="btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white btn-md font-black shadow-lg flex items-center justify-center gap-1.5">
              <span>⚡</span> <span>x2 Sát Thương (-200 HP)</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  attackBossVirus() {
    this.triggerScreenShake();
    this.playWrongSound();
    this.bossHP = Math.max(0, this.bossHP - 100);
    this.renderBossStage();

    if (this.bossHP <= 0) {
      this.playVictorySound();
      this.triggerFireworks(true);
      window.app?.showToast?.("🎉 XUẤT SẮC! CẢ LỚP ĐÃ TIÊU DIỆT TRÙM AI VIRUS GIẢI CỨU HỆ THỐNG!", "success");
      setTimeout(() => {
        document.getElementById("arena-boss-modal")?.classList.remove("active");
        this.openLuckyWheelModal();
      }, 1000);
    } else {
      window.app?.showToast?.(`⚔️ Đòn tấn công chính xác! Trùm Virus mất -100 HP! Còn ${this.bossHP} HP!`, "info");
    }
  }

  useShieldSkill() {
    this.playVictorySound();
    window.app?.showToast?.("🛡️ KÍCH HOẠT LÁ CHẮN BẢO VỆ: Miễn trừ sát thương phản công!", "success");
  }

  useDoubleDamageSkill() {
    this.triggerScreenShake();
    this.playWrongSound();
    this.bossHP = Math.max(0, this.bossHP - 200);
    this.renderBossStage();
    window.app?.showToast?.("⚡ CRITICAL HIT! x2 SÁT THƯƠNG GIỘI VÀO TRÙM VIRUS (-200 HP)!", "warning");

    if (this.bossHP <= 0) {
      this.playVictorySound();
      this.triggerFireworks(true);
      window.app?.showToast?.("🎉 XUẤT SẮC! CẢ LỚP ĐÃ TIÊU DIỆT TRÙM AI VIRUS GIẢI CỨU HỆ THỐNG!", "success");
      setTimeout(() => {
        document.getElementById("arena-boss-modal")?.classList.remove("active");
        this.openLuckyWheelModal();
      }, 1000);
    }
  }

  // VÒNG QUAY MAY MẮN LUCKY SPIN WHEEL (Gợi ý 2)
  openLuckyWheelModal() {
    const modal = document.getElementById("arena-lucky-wheel-modal");
    if (!modal) return;

    this.wheelRotation = 0;
    this.drawLuckyWheelCanvas(0);
    modal.classList.add("active");
  }

  drawLuckyWheelCanvas(angle = 0) {
    const canvas = document.getElementById("arena-wheel-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 300, 300);

    const slices = [
      { text: "+20 ⭐", color: "#3b82f6" },
      { text: "+50 ⭐", color: "#10b981" },
      { text: "+100 ⭐", color: "#f59e0b" },
      { text: "+30 ⭐", color: "#8b5cf6" },
      { text: "+80 ⭐", color: "#ec4899" },
      { text: "+200 ⭐", color: "#ef4444" }
    ];

    const sliceAngle = (Math.PI * 2) / slices.length;

    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(angle);

    slices.forEach((s, idx) => {
      ctx.beginPath();
      ctx.fillStyle = s.color;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 140, idx * sliceAngle, (idx + 1) * sliceAngle);
      ctx.fill();

      ctx.save();
      ctx.rotate(idx * sliceAngle + sliceAngle / 2);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 16px Nunito, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(s.text, 120, 5);
      ctx.restore();
    });

    ctx.restore();
  }

  playWheelTickSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  spinLuckyWheel() {
    const btn = document.getElementById("btn-spin-wheel");
    if (btn) btn.disabled = true;

    this.playVictorySound();
    let currentAngle = 0;
    let lastTickAngle = 0;
    let speed = 0.4;

    const animate = () => {
      currentAngle += speed;
      speed *= 0.98;
      this.drawLuckyWheelCanvas(currentAngle);

      if (Math.abs(currentAngle - lastTickAngle) > 0.3) {
        this.playWheelTickSound();
        lastTickAngle = currentAngle;
      }

      if (speed > 0.005) {
        requestAnimationFrame(animate);
      } else {
        const rewardOptions = [20, 50, 100, 30, 80, 200];
        const rewardStars = rewardOptions[Math.floor(Math.random() * rewardOptions.length)];
        this.starsEarned += rewardStars;
        this.triggerFireworks(true);
        window.app?.showToast?.(`🎉 QUAY TRÚNG PHẦN THƯỞNG MAY MẮN: ⭐ +${rewardStars} SAO VÀNG!`, "success");
        if (btn) btn.disabled = false;

        this.recordSpinHistory(rewardStars);
      }
    };
    animate();
  }

  recordSpinHistory(stars) {
    if (!this.spinHistoryLog) this.spinHistoryLog = [];
    const timeStr = new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.spinHistoryLog.unshift({ stars, time: timeStr });
    if (this.spinHistoryLog.length > 5) this.spinHistoryLog.pop();

    const listEl = document.getElementById("arena-spin-history-list");
    if (listEl) {
      listEl.innerHTML = this.spinHistoryLog.map(item => `
        <div class="flex items-center justify-between p-1.5 bg-slate-950/80 rounded-lg border border-amber-500/20 font-bold">
          <span class="text-amber-300">🎁 Nhận +${item.stars} ⭐ Sao Vàng Bảng Vàng</span>
          <span class="text-slate-500 text-[10px]">${item.time}</span>
        </div>
      `).join('');
    }
  }

  triggerScreenShake() {
    const card = document.getElementById("boss-card-box");
    if (!card) return;
    card.classList.add("translate-x-2", "rotate-1");
    setTimeout(() => card.classList.remove("translate-x-2", "rotate-1"), 100);
    setTimeout(() => card.classList.add("-translate-x-2", "-rotate-1"), 200);
    setTimeout(() => card.classList.remove("-translate-x-2", "-rotate-1"), 300);
  }

  // 2. Chế Độ Vòng Đấu Đoán Chữ Tin Học Siêu Tốc (Gợi ý 5)
  startWordPuzzleArena() {
    const modal = document.getElementById("arena-word-puzzle-modal");
    const container = document.getElementById("arena-puzzle-area");
    if (!modal || !container) return;

    if (this.puzzleTimerInterval) clearInterval(this.puzzleTimerInterval);

    const puzzles = [
      { word: "PHẦN CỨNG", hint: "Thiết bị vật lý cầm nắm được của máy tính (Bài 1 SGK 4)" },
      { word: "SCRATCH", hint: "Môi trường lập trình trực quan kéo thả chú mèo (Bài 14 SGK 4)" },
      { word: "INTERNET", hint: "Mạng máy tính toàn cầu xem thông tin trang web (Bài 4 SGK 4)" },
      { word: "TRÌNH CHIẾU", hint: "Phần mềm tạo trang chiếu thuyết trình PowerPoint (Bài 7 SGK 4)" },
      { word: "THƯ MỤC", hint: "Nơi lưu trữ và sắp xếp các tệp tin trong máy tính (Bài 5 SGK 4)" }
    ];

    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    this.currentPuzzleWord = puzzle.word;
    this.puzzleTimer = 30;

    const masked = puzzle.word.split('').map(ch => (ch === ' ' ? '   ' : (Math.random() > 0.4 ? '_' : ch))).join(' ');

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="badge bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 uppercase">GỢI Ý THUẬT NGỮ</span>
          <span id="arena-puzzle-timer" class="font-mono font-black text-rose-400 text-sm animate-pulse">⏱️ ${this.puzzleTimer}s</span>
        </div>
        <p class="text-sm font-bold text-cyan-200 px-4">${puzzle.hint}</p>

        <div class="py-4 bg-slate-900 rounded-2xl border border-amber-500/40">
          <h2 class="text-3xl md:text-4xl font-black font-mono tracking-widest text-amber-300 animate-pulse">
            ${masked}
          </h2>
        </div>

        <div class="space-y-2 max-w-sm mx-auto">
          <input type="text" id="arena-puzzle-input" placeholder="Nhập đáp án của em..." class="form-control text-center font-bold text-base bg-slate-900 border-amber-400 text-white rounded-xl uppercase">
          <button onclick="arenaPortal.submitWordPuzzle()" class="btn btn-amber btn-md w-full font-black shadow-lg">
            ⚡ Kiểm Tra Đáp Án ⚡
          </button>
        </div>
      </div>
    `;

    modal.classList.add("active");

    // Đồng hồ 30s tích tắc
    this.puzzleTimerInterval = setInterval(() => {
      this.puzzleTimer--;
      const timerDisp = document.getElementById("arena-puzzle-timer");
      if (timerDisp) timerDisp.innerText = `⏱️ ${this.puzzleTimer}s`;

      if (this.puzzleTimer <= 5 && this.puzzleTimer > 0) {
        this.playBeep(660, 0.08);
      }

      if (this.puzzleTimer <= 0) {
        clearInterval(this.puzzleTimerInterval);
        this.playWrongSound();
        window.app.showToast(`⏰ Hết giờ! Đáp án đúng là: ${this.currentPuzzleWord}`, "error");
        modal.classList.remove("active");
      }
    }, 1000);
  }

  submitWordPuzzle() {
    const input = document.getElementById("arena-puzzle-input");
    const val = input ? input.value.trim().toUpperCase() : "";

    if (!val) {
      window.app.showToast("⚠️ Vui lòng nhập từ khóa trả lời!", "warning");
      return;
    }

    if (val === this.currentPuzzleWord) {
      this.playVictorySound();
      this.triggerFireworks();
      this.starsEarned += 50;
      window.app.showToast(`🎉 XUẤT SẮC! Đáp án chính xác: ${this.currentPuzzleWord}! ⭐ +50 Sao Vàng!`, "success");
      document.getElementById("arena-word-puzzle-modal")?.classList.remove("active");
    } else {
      this.playWrongSound();
      window.app.showToast(`❌ Chưa chính xác! Đáp án đúng là: ${this.currentPuzzleWord}`, "error");
    }
  }

  exitBattle() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.battleActive = false;
    this.render("main-content-area");
  }

  // =========================================================================
  // LOGIC MODAL QUẢN LÝ CÂU HỎI (CRUD CÂU HỎI ĐẤU TRƯỜNG)
  // =========================================================================
  openQuestionModal(questionToEdit = null) {
    this.editingQuestionId = questionToEdit ? questionToEdit.id : null;
    const modal = document.getElementById("arena-question-modal");
    const titleEl = document.getElementById("arena-modal-title");

    if (titleEl) {
      titleEl.innerText = questionToEdit ? "✏️ CHỈNH SỬA CÂU HỎI ĐẤU TRƯỜNG" : "➕ THÊM CÂU HỎI ĐẤU TRƯỜNG";
    }

    if (questionToEdit) {
      document.getElementById("aq-grade-select").value = questionToEdit.grade;
      document.getElementById("aq-topic-input").value = questionToEdit.topic;
      document.getElementById("aq-time-select").value = questionToEdit.timeLimit;
      document.getElementById("aq-question-text").value = questionToEdit.question;
      document.getElementById("aq-opt-0").value = questionToEdit.options[0] ? questionToEdit.options[0].replace(/^[A-D]\.\s*/, '') : '';
      document.getElementById("aq-opt-1").value = questionToEdit.options[1] ? questionToEdit.options[1].replace(/^[A-D]\.\s*/, '') : '';
      document.getElementById("aq-opt-2").value = questionToEdit.options[2] ? questionToEdit.options[2].replace(/^[A-D]\.\s*/, '') : '';
      document.getElementById("aq-opt-3").value = questionToEdit.options[3] ? questionToEdit.options[3].replace(/^[A-D]\.\s*/, '') : '';
      document.getElementById("aq-explanation").value = questionToEdit.explanation || "";
      document.getElementById("aq-stars-reward").value = questionToEdit.stars || 20;

      const radios = document.getElementsByName("aq-correct-radio");
      if (radios[questionToEdit.correctIndex]) radios[questionToEdit.correctIndex].checked = true;
    } else {
      document.getElementById("aq-question-text").value = "";
      document.getElementById("aq-opt-0").value = "";
      document.getElementById("aq-opt-1").value = "";
      document.getElementById("aq-opt-2").value = "";
      document.getElementById("aq-opt-3").value = "";
      document.getElementById("aq-explanation").value = "";
      document.getElementById("aq-stars-reward").value = "20";
    }

    if (modal) modal.classList.add("active");
  }

  closeQuestionModal() {
    const modal = document.getElementById("arena-question-modal");
    if (modal) modal.classList.remove("active");
    this.editingQuestionId = null;
  }

  async handleSaveQuestion(e) {
    e.preventDefault();
    const grade = document.getElementById("aq-grade-select").value;
    const topic = document.getElementById("aq-topic-input").value;
    const timeLimit = document.getElementById("aq-time-select").value;
    const questionText = document.getElementById("aq-question-text").value;
    const opt0 = document.getElementById("aq-opt-0").value.trim();
    const opt1 = document.getElementById("aq-opt-1").value.trim();
    const opt2 = document.getElementById("aq-opt-2").value.trim();
    const opt3 = document.getElementById("aq-opt-3").value.trim();
    const explanation = document.getElementById("aq-explanation").value;
    const stars = document.getElementById("aq-stars-reward").value;

    let correctIndex = 0;
    const radios = document.getElementsByName("aq-correct-radio");
    radios.forEach((r, idx) => {
      if (r.checked) correctIndex = idx;
    });

    const payload = {
      grade: parseInt(grade),
      topic: topic || "Kiến thức chung",
      timeLimit: parseInt(timeLimit),
      question: questionText,
      options: [`A. ${opt0}`, `B. ${opt1}`, `C. ${opt2}`, `D. ${opt3}`],
      correctIndex: correctIndex,
      explanation: explanation,
      stars: parseInt(stars)
    };

    if (this.editingQuestionId) {
      await window.arenaService.updateQuestion(this.editingQuestionId, payload);
      window.app.showToast("✨ Đã cập nhật câu hỏi Đấu Trường thành công!", "success");
    } else {
      await window.arenaService.createQuestion(payload);
      window.app.showToast("🎉 Đã thêm mới câu hỏi vào Đấu Trường!", "success");
    }

    this.closeQuestionModal();
    this.render("main-content-area");
  }

  async editQuestion(id) {
    const questions = await window.arenaService.getQuestions("all", "all");
    const q = questions.find(item => item.id === id);
    if (q) {
      this.openQuestionModal(q);
    }
  }

  async deleteQuestion(id) {
    if (confirm("Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi Đấu Trường?")) {
      await window.arenaService.deleteQuestion(id);
      window.app.showToast("🗑️ Đã xóa câu hỏi khỏi hệ thống!", "info");
      this.render("main-content-area");
    }
  }

  resetDefaultQuestions() {
    if (confirm("Thầy/Cô có muốn nạp lại bộ ngân hàng câu hỏi mẫu chuẩn GDPT 2018?")) {
      window.arenaService.resetDefaultQuestions();
      window.app.showToast("🔄 Đã khôi phục ngân hàng câu hỏi mẫu!", "success");
      this.render("main-content-area");
    }
  }

  generateAIQuestionDraft() {
    const grade = document.getElementById("aq-grade-select").value || "3";
    const samples = {
      3: {
        topic: "Bài 7: Sắp xếp để dễ tìm",
        q: "Theo em, việc sắp xếp đồ chơi, sách vở và tệp tin vào đúng ngăn có lợi ích gì lớn nhất?",
        opts: ["Giúp trang trí đẹp mắt", "Tìm kiếm nhanh chóng, dễ dàng khi cần", "Không bị mất đồ", "Tất cả các ý trên"],
        correct: 3,
        exp: "Sắp xếp dữ liệu và đồ dùng khoa học mang lại rất nhiều lợi ích: đẹp mắt, bảo quản tốt và tìm kiếm siêu tốc."
      },
      4: {
        topic: "Lập trình Scratch",
        q: "Trong Scratch, sự kiện nào kích hoạt chương trình bắt đầu chạy phổ biến nhất?",
        opts: ["Khi bấm vào lá cờ xanh", "Khi bấm phím Space", "Khi chạm vào cạnh", "Khi đổi hình nền"],
        correct: 0,
        exp: "Khối lệnh 'Khi bấm vào cờ xanh' là điểm khởi đầu kinh điển cho mọi dự án lập trình Scratch."
      },
      5: {
        topic: "An toàn thông tin mạng",
        q: "Khi nhận được tin nhắn từ người lạ yêu cầu cung cấp mật khẩu hoặc mã OTP, em nên làm gì?",
        opts: ["Cung cấp ngay", "Tuyệt đối không gửi và báo cho bố mẹ, thầy cô", "Gửi cho bạn thân", "Tắt máy tính"],
        correct: 1,
        exp: "Tuyệt đối bảo mật mật khẩu và mã OTP, không cung cấp cho bất kỳ ai để tránh bị chiếm đoạt tài khoản."
      }
    };

    const draft = samples[grade] || samples[3];
    document.getElementById("aq-topic-input").value = draft.topic;
    document.getElementById("aq-question-text").value = draft.q;
    document.getElementById("aq-opt-0").value = draft.opts[0];
    document.getElementById("aq-opt-1").value = draft.opts[1];
    document.getElementById("aq-opt-2").value = draft.opts[2];
    document.getElementById("aq-opt-3").value = draft.opts[3];
    document.getElementById("aq-explanation").value = draft.exp;

    const radios = document.getElementsByName("aq-correct-radio");
    if (radios[draft.correct]) radios[draft.correct].checked = true;

    window.app.showToast("✨ AI đã soạn mẫu câu hỏi chuẩn GDPT 2018!", "success");
  }
}

window.arenaPortal = new ArenaPortal();
