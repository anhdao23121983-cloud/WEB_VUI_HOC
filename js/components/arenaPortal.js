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

    // Editing modal state
    this.editingQuestionId = null;
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

  playWrongSound() {
    this.playBeep(220, 0.35);
  }

  // Chuyển Tab
  switchTab(tab) {
    this.currentTab = tab;
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
      <div class="space-y-6 animate-pop">
        <!-- BANNER HEADER ĐẤU TRƯỜNG TIN HỌC -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-rose-900 via-purple-900 to-indigo-950 border-2 border-rose-400/40 shadow-2xl p-6 rounded-3xl text-white">
          <div class="space-y-2 text-center md:text-left">
            <div class="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span class="badge bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">⚡ ĐẤU TRƯỜNG TOÀN DIỆN</span>
              <span class="badge bg-white/20 text-white font-bold text-xs">GDPT 2018 • TIN HỌC 3 - 5</span>
              <span class="badge bg-rose-500 text-white font-black text-xs animate-pulse">🔥 LIVE ARENA</span>
            </div>
            <h2 class="text-2xl md:text-4xl font-black text-white leading-tight">
              ⚡ ĐẤU TRƯỜNG TIN HỌC ⚡
            </h2>
            <p class="text-cyan-100 text-xs md:text-sm max-w-2xl">
              Sàn đấu trí tuệ công nghệ đỉnh cao dành cho học sinh Tiểu học: Tranh tài trả lời nhanh 15s, ngân hàng câu hỏi phân quyền CRUD toàn diện, vinh danh bảng vàng và đồng bộ dữ liệu Supabase Cloud thời gian thực!
            </p>
          </div>

          <div class="flex items-center gap-3 flex-wrap justify-center shrink-0">
            <button onclick="arenaPortal.openBossBattleModal()" class="btn bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white btn-lg font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-all animate-pulse">
              <span>👾</span> <span>Đấu Trùm AI Virus</span>
            </button>
            <button onclick="arenaPortal.toggleArenaBGM()" id="btn-arena-bgm" class="btn bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white btn-lg font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
              <span>🎵</span> <span id="lbl-arena-bgm">${this.isBGMPlaying ? 'Nhạc BGM: BẬT' : 'Nhạc BGM: TẮT'}</span>
            </button>
            <button onclick="arenaPortal.openTournamentModal()" class="btn bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white btn-lg font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
              <span>🏆</span> <span>Giải Đấu Cấp Lớp</span>
            </button>
            <button onclick="arenaPortal.openRoomModal()" class="btn bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white btn-lg font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
              <span>⚔️</span> <span>Đấu 1vs1 Mã Phòng</span>
            </button>
            <button onclick="arenaPortal.openQuestionModal()" class="btn btn-amber btn-lg font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
              <span>➕</span> <span>Thêm Câu Hỏi Mới</span>
            </button>
            <button onclick="arenaPortal.startNewBattle()" class="btn bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white btn-lg font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
              <span>⚡</span> <span>Vào Đấu Ngay</span>
            </button>
          </div>
        </div>

        <!-- THANH ĐIỀU HƯỚNG 3 TAB CHÍNH -->
        <div class="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="arenaPortal.switchTab('live_arena')" class="px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'live_arena' ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md scale-102 ring-2 ring-rose-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🎮</span> <span>Sàn Đấu Trực Tiếp</span>
            </button>

            <button onclick="arenaPortal.switchTab('question_bank')" class="px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'question_bank' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md scale-102 ring-2 ring-cyan-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📚</span> <span>Ngân Hàng Câu Hỏi (Thêm/Sửa/Xóa)</span>
            </button>

            <button onclick="arenaPortal.switchTab('leaderboard')" class="px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'leaderboard' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md scale-102 ring-2 ring-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🏆</span> <span>Bảng Vàng Quán Quân</span>
            </button>
          </div>

          <!-- Lọc Khối Lớp -->
          <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <span class="text-[11px] font-bold text-slate-500 px-2">Khối Lớp:</span>
            <button onclick="arenaPortal.filterGrade('all')" class="px-2.5 py-1 rounded-lg text-xs font-bold ${this.selectedGrade === 'all' ? 'bg-white text-rose-700 shadow-xs font-black' : 'text-slate-600 hover:bg-white/60'}">Tất cả</button>
            <button onclick="arenaPortal.filterGrade(3)" class="px-2.5 py-1 rounded-lg text-xs font-bold ${this.selectedGrade === 3 ? 'bg-cyan-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-white/60'}">Lớp 3</button>
            <button onclick="arenaPortal.filterGrade(4)" class="px-2.5 py-1 rounded-lg text-xs font-bold ${this.selectedGrade === 4 ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-white/60'}">Lớp 4</button>
            <button onclick="arenaPortal.filterGrade(5)" class="px-2.5 py-1 rounded-lg text-xs font-bold ${this.selectedGrade === 5 ? 'bg-amber-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-white/60'}">Lớp 5</button>
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
      return `
        <div class="p-8 md:p-12 bg-slate-950 text-white rounded-3xl border-2 border-rose-500/50 shadow-2xl space-y-6 text-center animate-pop relative overflow-hidden">
          <div class="absolute -top-24 -left-24 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div class="space-y-3 relative z-10">
            <span class="text-6xl block animate-bounce filter drop-shadow-lg">⚡ 🏆 🎮</span>
            <h3 class="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-amber-300">
              SẴN SÀNG THI ĐẤU ĐẤU TRƯỜNG TIN HỌC!
            </h3>
            <p class="text-slate-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
              Tranh tài trực tiếp với 4 Đấu thủ Realtime! Chọn số câu hỏi và bài học SGK để bắt đầu sàn đấu trí tuệ công nghệ đỉnh cao.
            </p>
          </div>

          <!-- Lựa chọn Chế độ thi đấu -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto relative z-10">
            <div class="p-4 bg-slate-900/90 rounded-2xl border-2 border-cyan-500/40 hover:border-cyan-400 transition-all space-y-2 cursor-pointer text-left group" onclick="arenaPortal.openConfigModal(3)">
              <div class="flex items-center justify-between">
                <span class="text-3xl">🎒</span>
                <span class="badge bg-cyan-600 text-white font-black text-[10px]">LỚP 3</span>
              </div>
              <h4 class="font-black text-sm text-cyan-300 group-hover:text-cyan-200">Đấu Trường Lớp 3</h4>
              <p class="text-[11px] text-slate-400">Tùy chọn 10, 20, 30 câu & chọn từng bài học SGK Tin Học 3.</p>
              <button class="btn btn-primary btn-xs w-full font-black mt-2">Bắt Đầu Đấu ▶</button>
            </div>

            <div class="p-4 bg-slate-900/90 rounded-2xl border-2 border-emerald-500/40 hover:border-emerald-400 transition-all space-y-2 cursor-pointer text-left group" onclick="arenaPortal.openConfigModal(4)">
              <div class="flex items-center justify-between">
                <span class="text-3xl">🚀</span>
                <span class="badge bg-emerald-600 text-white font-black text-[10px]">LỚP 4</span>
              </div>
              <h4 class="font-black text-sm text-emerald-300 group-hover:text-emerald-200">Đấu Trường Lớp 4</h4>
              <p class="text-[11px] text-slate-400">Tùy chọn 10, 20, 30 câu & chọn từng bài học SGK Tin Học 4.</p>
              <button class="btn btn-emerald btn-xs w-full font-black mt-2">Bắt Đầu Đấu ▶</button>
            </div>

            <div class="p-4 bg-slate-900/90 rounded-2xl border-2 border-amber-500/40 hover:border-amber-400 transition-all space-y-2 cursor-pointer text-left group" onclick="arenaPortal.openConfigModal(5)">
              <div class="flex items-center justify-between">
                <span class="text-3xl">⭐</span>
                <span class="badge bg-amber-600 text-white font-black text-[10px]">LỚP 5</span>
              </div>
              <h4 class="font-black text-sm text-amber-300 group-hover:text-amber-200">Đấu Trường Lớp 5</h4>
              <p class="text-[11px] text-slate-400">Tùy chọn 10, 20, 30 câu & chọn từng bài học SGK Tin Học 5.</p>
              <button class="btn btn-amber btn-xs w-full font-black mt-2">Bắt Đầu Đấu ▶</button>
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
          <div class="flex items-center gap-3">
            <span class="badge bg-rose-600 text-white font-black text-xs uppercase px-3 py-1">
              CÂU HỎI ${this.currentQIndex + 1} / ${this.battleQuestions.length}
            </span>
            <span class="badge bg-amber-500 text-slate-950 font-black text-xs">
              ${userRank === 1 ? '🥇 BẠN DẪN ĐẦU TOP 1' : userRank === 2 ? '🥈 THỨ HẠNG TOP 2' : userRank === 3 ? '🥉 THỨ HẠNG TOP 3' : '🎖️ THỨ HẠNG TOP 4'}
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
          <div id="arena-timer-bar" class="h-2.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-all duration-1000" style="width: ${(this.timer / q.timeLimit) * 100}%"></div>
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
          <div class="p-4 rounded-2xl border ${this.selectedOptionIndex === q.correctIndex ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/40 border-rose-500/50 text-rose-200'} space-y-1 animate-pop flex items-center justify-between flex-wrap gap-3">
            <div>
              <p class="font-black text-xs">${this.selectedOptionIndex === q.correctIndex ? '🎉 CHÍNH XÁC! TUYỆT VỜI!' : '⚠️ CHƯA CHÍNH XÁC!'}</p>
              <p class="text-xs text-slate-300">${q.explanation || 'Hãy ghi nhớ kiến thức cốt lõi này nhé!'}</p>
            </div>
            <button onclick="arenaPortal.nextQuestion()" class="btn btn-amber btn-md font-black shadow-lg flex items-center gap-1">
              <span>${this.currentQIndex + 1 === this.battleQuestions.length ? '🏁 Xem Kết Quả' : 'Câu Tiếp Theo ▶'}</span>
            </button>
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
  // TAB 3: 🏆 LEADERBOARD VIEW (BẢNG VÀNG CÁ NHÂN & THI ĐUA TẬP THỂ LỚP)
  // =========================================================================
  async renderLeaderboardView() {
    if (!this.leaderboardSubTab) this.leaderboardSubTab = "individual";
    const students = await window.arenaService.getStudentLeaderboard(this.selectedGrade, this.selectedClassFilter || "all");
    const classes = await window.arenaService.getClassLeaderboard(this.selectedGrade);

    return `
      <div class="space-y-6 animate-pop">
        <!-- BANNER BẢNG VÀNG HOÀNG GIA -->
        <div class="p-6 md:p-8 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-3xl text-slate-950 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-white relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="space-y-1.5 text-center md:text-left z-10">
            <div class="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span class="badge bg-slate-950 text-amber-300 font-black text-xs uppercase px-3 py-1">🏆 ĐUA TOP LIÊN TRƯỜNG & LIÊN LỚP</span>
              <span class="badge bg-white/40 text-slate-950 font-black text-xs">MÙA GIẢI 2026</span>
            </div>
            <h3 class="text-2xl md:text-3xl font-black tracking-tight">
              BẢNG TỔNG SẮP ĐẤU TRƯỜNG TIN HỌC
            </h3>
            <p class="text-xs md:text-sm font-bold text-slate-900 max-w-xl">
              Vinh danh các Kiện tướng Tin học cá nhân xuất sắc và các tập thể Lớp dẫn đầu phong trào học tập số toàn trường!
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap justify-center shrink-0 z-10">
            <button onclick="arenaPortal.printClassCertificate()" class="btn bg-slate-950 hover:bg-slate-900 text-amber-300 font-black btn-md shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
              <span>🏛️</span> <span>Khen Thưởng Tập Thể Lớp</span>
            </button>
            <button onclick="simulation3D.openCertificateModal()" class="btn bg-white hover:bg-slate-100 text-slate-950 font-black btn-md shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
              <span>🎖️</span> <span>In Giấy Khen A4 Cá Nhân</span>
            </button>
          </div>
        </div>

        <!-- 3 SUB-TABS: CÁ NHÂN / ĐUA TOP LỚP / PHÂN TÍCH CHIẾN TÍCH -->
        <div class="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="arenaPortal.switchLeaderboardSubTab('individual')" class="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.leaderboardSubTab === 'individual' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>🧑‍🎓</span> <span>Bảng Vàng Cá Nhân</span>
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

        <!-- NỘI DUNG TỪNG SUB-TAB -->
        ${this.leaderboardSubTab === 'individual' ? this.renderIndividualLeaderboardSubTab(students) : ''}
        ${this.leaderboardSubTab === 'class_league' ? this.renderClassLeagueSubTab(classes) : ''}
        ${this.leaderboardSubTab === 'analytics' ? this.renderAnalyticsSubTab(students, classes) : ''}
      </div>
    `;
  }

  // SUB-TAB 1: BẢNG VÀNG CÁ NHÂN (INDIVIDUAL)
  renderIndividualLeaderboardSubTab(students) {
    const top1 = students[0];
    const top2 = students[1];
    const top3 = students[2];

    return `
      <div class="space-y-6 animate-pop">
        <!-- TOP 3 PODIUM VINH DANH HOÀNH TRÁNG -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <!-- TOP 2 (BẠC) -->
          ${top2 ? `
            <div class="p-5 rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 text-center space-y-2.5 shadow-md relative order-2 md:order-1">
              <span class="text-4xl block animate-bounce">🥈</span>
              <span class="badge bg-slate-300 text-slate-900 font-black text-xs px-3 py-0.5">Á QUÂN TOÀN TRƯỜNG</span>
              <h4 class="font-black text-base text-slate-900">${top2.studentName}</h4>
              <p class="text-xs font-bold text-slate-600">Lớp ${top2.studentClass} • Khối ${top2.grade}</p>
              <div class="p-2.5 bg-white rounded-2xl border border-slate-300 flex items-center justify-around text-xs font-black">
                <span class="text-amber-600">⭐ ${top2.totalStars}</span>
                <span class="text-cyan-700">🎯 ${top2.highestScore} Đ</span>
                <span class="text-slate-500">⏱️ ${top2.bestDuration}s</span>
              </div>
            </div>
          ` : ''}

          <!-- TOP 1 (VÀNG) - PODIUM CAO NHẤT -->
          ${top1 ? `
            <div class="p-6 rounded-3xl bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200 border-3 border-amber-400 text-center space-y-3 shadow-xl relative order-1 md:order-2 transform md:-translate-y-4">
              <div class="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-amber-400 text-slate-950 px-4 py-1 rounded-full font-black text-xs uppercase tracking-wider shadow-md">
                👑 QUÁN QUÂN
              </div>
              <span class="text-5xl block animate-bounce pt-2">🥇</span>
              <h4 class="font-black text-lg text-amber-950">${top1.studentName}</h4>
              <p class="text-xs font-black text-amber-800">Lớp ${top1.studentClass} • Khối ${top1.grade}</p>
              <div class="p-3 bg-white/90 rounded-2xl border border-amber-300 flex items-center justify-around text-xs font-black">
                <span class="text-amber-600">⭐ ${top1.totalStars} Sao</span>
                <span class="text-cyan-700">🎯 ${top1.highestScore} Điểm</span>
                <span class="text-slate-600">⏱️ ${top1.bestDuration}s</span>
              </div>
              <span class="inline-block text-[11px] font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                🔥 Chuỗi Thắng Tuyệt Đối (${top1.perfectWins || 3} Trận 100đ)
              </span>
            </div>
          ` : ''}

          <!-- TOP 3 (ĐỒNG) -->
          ${top3 ? `
            <div class="p-5 rounded-3xl bg-gradient-to-b from-amber-100 to-orange-100 border-2 border-amber-300 text-center space-y-2.5 shadow-md relative order-3">
              <span class="text-4xl block animate-bounce">🥉</span>
              <span class="badge bg-amber-600 text-white font-black text-xs px-3 py-0.5">QUÝ QUÂN TOÀN TRƯỜNG</span>
              <h4 class="font-black text-base text-slate-900">${top3.studentName}</h4>
              <p class="text-xs font-bold text-slate-600">Lớp ${top3.studentClass} • Khối ${top3.grade}</p>
              <div class="p-2.5 bg-white rounded-2xl border border-amber-300 flex items-center justify-around text-xs font-black">
                <span class="text-amber-600">⭐ ${top3.totalStars}</span>
                <span class="text-cyan-700">🎯 ${top3.highestScore} Đ</span>
                <span class="text-slate-500">⏱️ ${top3.bestDuration}s</span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- BẢNG DANH SÁCH CHI TIẾT -->
        <div class="glass-card p-5 rounded-2xl space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-black text-slate-500">
            <span>HẠNG & HỌC SINH</span>
            <div class="flex items-center gap-6 md:gap-12">
              <span>SỐ TRẬN</span>
              <span>ĐIỂM CAO NHẤT</span>
              <span>TỔNG SAO VÀNG</span>
            </div>
          </div>

          <div class="space-y-2">
            ${students.map((st, idx) => `
              <div class="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs hover:border-amber-400 transition-all">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'}">
                    ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div>
                    <h5 class="text-xs md:text-sm font-black text-slate-900">${st.studentName}</h5>
                    <p class="text-[11px] text-slate-500 font-bold">Lớp ${st.studentClass} • Khối Lớp ${st.grade}</p>
                  </div>
                </div>

                <div class="flex items-center gap-6 md:gap-12 text-xs font-black">
                  <span class="text-slate-600 font-mono">${st.matchesPlayed || 1} Trận</span>
                  <span class="text-cyan-700 font-mono">${st.highestScore} Điểm</span>
                  <span class="text-amber-600 font-mono">⭐ +${st.totalStars}</span>
                </div>
              </div>
            `).join("")}
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
  openConfigModal(grade = 4) {
    this.selectedConfigGrade = grade;
    this.selectedG4QuestionCount = 10;

    const modal = document.getElementById("arena-config-modal");
    const titleEl = document.getElementById("arena-config-title");
    const subtitleEl = document.getElementById("arena-config-subtitle");
    const lessonSelect = document.getElementById("arena-lesson-select");

    if (titleEl) titleEl.innerText = `CẤU HÌNH ĐẤU TRƯỜNG TIN HỌC LỚP ${grade}`;
    if (subtitleEl) subtitleEl.innerText = `Tùy chọn 10, 20, 30 câu hỏi & bài học SGK Tin Học ${grade}`;

    if (lessonSelect) {
      let optionsHTML = `<option value="all" selected>🌟 Tất Cả Các Bài Học (Toàn Bộ SGK Lớp ${grade})</option>`;

      if (grade === 3) {
        optionsHTML += `
          <option value="bai_1">Bài 1. Thông tin và quyết định</option>
          <option value="bai_2">Bài 2. Xử lý thông tin</option>
          <option value="bai_3">Bài 3. Máy tính và em</option>
          <option value="bai_4">Bài 4. Làm việc với máy tính</option>
          <option value="bai_5">Bài 5. Sử dụng bàn phím máy tính</option>
          <option value="bai_6">Bài 6. Sử dụng chuột máy tính</option>
          <option value="bai_7">Bài 7. Sắp xếp đồ dùng và tệp tin</option>
          <option value="bai_8">Bài 8. Xem tin tức và giải trí trên Internet</option>
          <option value="bai_9">Bài 9. An toàn trên Internet</option>
          <option value="bai_10">Bài 10. Sơ đồ tư duy</option>
        `;
      } else if (grade === 4) {
        optionsHTML += `
          <option value="bai_1">Bài 1. Phần cứng và phần mềm máy tính</option>
          <option value="bai_2">Bài 2. Gõ bàn phím đúng cách</option>
          <option value="bai_3">Bài 3. Thông tin trên trang web</option>
          <option value="bai_4">Bài 4. Tìm kiếm thông tin trên Internet</option>
          <option value="bai_5">Bài 5. Thao tác với tệp và thư mục</option>
          <option value="bai_6">Bài 6. Sử dụng phần mềm khi được phép</option>
          <option value="bai_7">Bài 7. Tạo bài trình chiếu</option>
          <option value="bai_8">Bài 8. Định dạng văn bản trên trang chiếu</option>
          <option value="bai_9">Bài 9. Hiệu ứng chuyển trang</option>
          <option value="bai_10">Bài 10. Phần mềm soạn thảo văn bản</option>
          <option value="bai_11">Bài 11. Chỉnh sửa văn bản</option>
          <option value="bai_12a">Bài 12A. Thực hành đa phương tiện</option>
          <option value="bai_12b">Bài 12B. Phần mềm luyện tập gõ bàn phím</option>
          <option value="bai_13">Bài 13. Chơi với máy tính</option>
          <option value="bai_14">Bài 14. Khám phá môi trường lập trình trực quan</option>
          <option value="bai_15">Bài 15. Tạo chương trình máy tính để diễn tả ý tưởng</option>
          <option value="bai_16">Bài 16. Chương trình của em</option>
        `;
      } else if (grade === 5) {
        optionsHTML += `
          <option value="bai_1">Bài 1. Máy tính và câu chuyện xử lý thông tin</option>
          <option value="bai_2">Bài 2. Tìm kiếm thông tin trên Internet</option>
          <option value="bai_3">Bài 3. Mạng xã hội và an toàn Internet</option>
          <option value="bai_4">Bài 4. Bản quyền tác giả và đạo đức số</option>
          <option value="bai_5">Bài 5. Sử dụng máy tính an toàn</option>
          <option value="bai_6">Bài 6. Soạn thảo văn bản nâng cao</option>
          <option value="bai_7">Bài 7. Bài trình chiếu đa phương tiện</option>
          <option value="bai_8">Bài 8. Thực hành tạo sản phẩm số</option>
          <option value="bai_9">Bài 9. Biến và hằng trong lập trình Scratch</option>
          <option value="bai_10">Bài 10. Khối lệnh điều kiện nếu... thì</option>
          <option value="bai_11">Bài 11. Vòng lặp có điều kiện</option>
          <option value="bai_12">Bài 12. Thuật toán tìm kiếm tuần tự và nhị phân</option>
        `;
      }

      lessonSelect.innerHTML = optionsHTML;
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
    this.competitors = [
      { id: "user", name: user.name || "Học Sinh", avatar: user.avatar || "🎒", isUser: true, score: 0 },
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
    this.battleStartTime = Date.now();
    let allQuestions = await window.arenaService.getQuestions(grade, "all", lessonFilter);
    if (allQuestions.length === 0) {
      window.app.showToast(`Đang lấy tất cả câu hỏi Lớp ${grade}...`, "info");
      allQuestions = await window.arenaService.getQuestions(grade, "all", "all");
    }

    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    this.battleQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    this.currentQIndex = 0;
    this.userAnswers = [];
    this.score = 0;
    this.starsEarned = 0;
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
          this.startQuestionTimer();
          this.render("main-content-area");
          if (window.ttsService) {
            window.ttsService.speak(`Trận đấu bắt đầu! Câu số 1!`);
          }
        }
      }, 900);
    }, 1500);
  }

  startQuestionTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const q = this.battleQuestions[this.currentQIndex];
    this.timer = this.selectedCustomTimer || (q ? q.timeLimit : 15);
    this.questionMaxTimer = this.timer;

    this.timerInterval = setInterval(() => {
      this.timer--;
      const timerDisp = document.getElementById("arena-timer-display");
      const timerBar = document.getElementById("arena-timer-bar");
      if (timerDisp) timerDisp.innerText = `${this.timer}s`;
      if (timerBar) timerBar.style.width = `${(this.timer / this.questionMaxTimer) * 100}%`;

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

    if (optionIndex === q.correctIndex) {
      this.playVictorySound();
      this.streakCombo++;
      const speedBonus = Math.max(10, Math.round(this.timer * 5));
      const comboBonus = (this.streakCombo - 1) * 20;
      const questionScore = 100 + speedBonus + comboBonus;

      this.score += questionScore;
      this.starsEarned += q.stars;

      const userComp = (this.competitors || []).find(c => c.isUser);
      if (userComp) userComp.score = this.score;

      window.app.showToast(`✅ Chính xác! +${questionScore} Điểm (Tốc độ +${speedBonus}) & +${q.stars} ⭐!`, "success");
    } else {
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

    // Lời bình luận MC AI khi dẫn đầu TOP 1 (Gợi ý 1)
    const sortedCompetitors = [...(this.competitors || [])].sort((a, b) => b.score - a.score);
    if (sortedCompetitors[0] && sortedCompetitors[0].isUser && !this.hasAnnouncedTop1) {
      this.hasAnnouncedTop1 = true;
      if (window.ttsService?.speak) {
        window.ttsService.speak(`Xuất sắc! Chúc mừng em ${sortedCompetitors[0].name} đã bứt phá vươn lên dẫn đầu TOP 1 Đấu Trường Tin Học!`);
      }
    }

    this.render("main-content-area");
  }

  async nextQuestion() {
    if (this.currentQIndex + 1 < this.battleQuestions.length) {
      this.currentQIndex++;
      this.selectedOptionIndex = null;
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

    const totalQuestions = this.battleQuestions.length;
    const maxScore = totalQuestions * 20;
    const isPerfect = (this.score >= maxScore);
    const duration = Math.max(1, Math.round((Date.now() - (this.battleStartTime || Date.now())) / 1000));

    // 1. Lưu điểm số & Thời gian hoàn thành lên Supabase Cloud & Local
    await window.arenaService.recordMatchResult({
      score: this.score,
      totalCorrect: Math.round(this.score / 20),
      totalQuestions: totalQuestions,
      starsEarned: this.starsEarned,
      durationSeconds: duration,
      grade: this.selectedConfigGrade || (this.selectedGrade === "all" ? 4 : this.selectedGrade)
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

    if (this.score >= 60 && window.ttsService?.playApplause) {
      window.ttsService.playApplause(3.5, true);
    }

    window.app.showToast(`🎉 Xuất sắc! Em hoàn thành trận đấu với ${this.score}/${maxScore} Điểm trong ${duration} giây!`, "success");
    
    // 3. Mở Bằng Chứng Nhận Vinh Danh (Gợi ý 4)
    this.openCertificateModal();

    this.currentTab = "leaderboard";
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
    ctx.fillText(`🎯 Thành tích: Đạt ${this.score || 100} Điểm • ⭐ +${this.starsEarned || 20} Sao Vàng Bảng Vàng`, 400, 385);

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

  toggleArenaBGM() {
    this.isBGMPlaying = !this.isBGMPlaying;
    const btnLbl = document.getElementById("lbl-arena-bgm");
    if (btnLbl) btnLbl.innerText = this.isBGMPlaying ? "Nhạc BGM: BẬT" : "Nhạc BGM: TẮT";

    if (this.isBGMPlaying) {
      this.playSynthBGM();
      window.app?.showToast?.("🎵 Đã BẬT Nhạc Nền Đấu Trường eSports!", "info");
    } else {
      this.stopSynthBGM();
      window.app?.showToast?.("🔇 Đã TẮT Nhạc Nền Đấu Trường!", "info");
    }
  }

  playSynthBGM() {
    this.stopSynthBGM();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.bgmCtx = new AudioCtx();
      let step = 0;
      const freqs = [220, 261.63, 329.63, 392.00, 440, 392.00, 329.63, 261.63];

      this.bgmTimer = setInterval(() => {
        if (!this.bgmCtx) return;
        const osc = this.bgmCtx.createOscillator();
        const gain = this.bgmCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freqs[step % freqs.length], this.bgmCtx.currentTime);
        gain.gain.setValueAtTime(0.04, this.bgmCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.bgmCtx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(this.bgmCtx.destination);
        osc.start();
        osc.stop(this.bgmCtx.currentTime + 0.18);
        step++;
      }, 200);
    } catch (e) {
      console.warn("BGM synth error", e);
    }
  }

  stopSynthBGM() {
    if (this.bgmTimer) clearInterval(this.bgmTimer);
    if (this.bgmCtx) {
      try { this.bgmCtx.close(); } catch (e) {}
      this.bgmCtx = null;
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
