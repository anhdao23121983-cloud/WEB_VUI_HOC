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
  // TAB 1: 🎮 LIVE ARENA VIEW (SÀN ĐẤU TRỰC TIẾP)
  // =========================================================================
  renderLiveArenaView() {
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
              Trải nghiệm 5 câu hỏi đấu trí siêu tốc 15s. Mỗi câu trả lời đúng sẽ mang về điểm số kỷ lục và Sao Vàng tích lũy trên Bảng Vàng toàn trường!
            </p>
          </div>

          <!-- Lựa chọn Chế độ thi đấu -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto relative z-10">
            <div class="p-4 bg-slate-900/90 rounded-2xl border-2 border-cyan-500/40 hover:border-cyan-400 transition-all space-y-2 cursor-pointer text-left group" onclick="arenaPortal.startBattleWithMode('blitz', 3)">
              <div class="flex items-center justify-between">
                <span class="text-3xl">🎒</span>
                <span class="badge bg-cyan-600 text-white font-black text-[10px]">LỚP 3</span>
              </div>
              <h4 class="font-black text-sm text-cyan-300 group-hover:text-cyan-200">Đấu Trường Lớp 3</h4>
              <p class="text-[11px] text-slate-400">Phần cứng, Bàn phím chuột, Bài 7 Sắp xếp dữ liệu và An toàn phòng máy.</p>
              <button class="btn btn-primary btn-xs w-full font-black mt-2">Bắt Đầu Đấu ▶</button>
            </div>

            <div class="p-4 bg-slate-900/90 rounded-2xl border-2 border-emerald-500/40 hover:border-emerald-400 transition-all space-y-2 cursor-pointer text-left group" onclick="arenaPortal.startBattleWithMode('blitz', 4)">
              <div class="flex items-center justify-between">
                <span class="text-3xl">🚀</span>
                <span class="badge bg-emerald-600 text-white font-black text-[10px]">LỚP 4</span>
              </div>
              <h4 class="font-black text-sm text-emerald-300 group-hover:text-emerald-200">Đấu Trường Lớp 4</h4>
              <p class="text-[11px] text-slate-400">Thư mục và tệp, Thiết bị vào/ra, Lập trình Scratch và Soạn thảo văn bản.</p>
              <button class="btn btn-emerald btn-xs w-full font-black mt-2">Bắt Đầu Đấu ▶</button>
            </div>

            <div class="p-4 bg-slate-900/90 rounded-2xl border-2 border-amber-500/40 hover:border-amber-400 transition-all space-y-2 cursor-pointer text-left group" onclick="arenaPortal.startBattleWithMode('blitz', 5)">
              <div class="flex items-center justify-between">
                <span class="text-3xl">⭐</span>
                <span class="badge bg-amber-600 text-white font-black text-[10px]">LỚP 5</span>
              </div>
              <h4 class="font-black text-sm text-amber-300 group-hover:text-amber-200">Đấu Trường Lớp 5</h4>
              <p class="text-[11px] text-slate-400">Mạng Internet, Bản quyền số, Bảo mật mật khẩu và Thuật toán tìm kiếm.</p>
              <button class="btn btn-amber btn-xs w-full font-black mt-2">Bắt Đầu Đấu ▶</button>
            </div>
          </div>
        </div>
      `;
    }

    // GIAO DIỆN TRẬN ĐẤU ĐANG DIỄN RA
    const q = this.battleQuestions[this.currentQIndex];
    if (!q) return `<div class="text-center p-8">Đang tải câu hỏi...</div>`;

    return `
      <div class="p-6 md:p-8 bg-slate-950 text-white rounded-3xl border-2 border-rose-500 shadow-2xl space-y-5 animate-pop relative">
        <!-- Header Thanh Trận Đấu -->
        <div class="flex items-center justify-between pb-3 border-b border-rose-500/40 flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <span class="badge bg-rose-600 text-white font-black text-xs uppercase px-3 py-1">
              CÂU HỎI ${this.currentQIndex + 1} / ${this.battleQuestions.length}
            </span>
            <span class="badge bg-slate-800 text-amber-300 font-bold text-xs">
              Chủ đề: ${q.topic}
            </span>
          </div>

          <div class="flex items-center gap-3">
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
  // LOGIC TRẬN ĐẤU (LIVE BATTLE LOGIC)
  // =========================================================================
  async startNewBattle() {
    await this.startBattleWithMode("blitz", this.selectedGrade === "all" ? 3 : this.selectedGrade);
  }

  async startBattleWithMode(mode = "blitz", grade = 3) {
    const allQuestions = await window.arenaService.getQuestions(grade, "all");
    if (allQuestions.length === 0) {
      window.app.showToast("Chưa có câu hỏi cho khối lớp này. Đang nạp câu hỏi mẫu...", "warning");
      window.arenaService.resetDefaultQuestions();
    }

    // Trộn ngẫu nhiên 5 câu hỏi
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    this.battleQuestions = shuffled.slice(0, 5);
    this.currentQIndex = 0;
    this.userAnswers = [];
    this.score = 0;
    this.starsEarned = 0;
    this.selectedOptionIndex = null;
    this.isAnswerRevealed = false;
    this.battleActive = true;

    this.startQuestionTimer();
    this.render("main-content-area");
    if (window.ttsService) {
      window.ttsService.speak(`Chào mừng em đến với Đấu Trường Tin Học Lớp ${grade}! Bắt đầu câu hỏi số 1!`);
    }
  }

  startQuestionTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const q = this.battleQuestions[this.currentQIndex];
    this.timer = q ? q.timeLimit : 15;

    this.timerInterval = setInterval(() => {
      this.timer--;
      const timerDisp = document.getElementById("arena-timer-display");
      const timerBar = document.getElementById("arena-timer-bar");
      if (timerDisp) timerDisp.innerText = `${this.timer}s`;
      if (timerBar && q) timerBar.style.width = `${(this.timer / q.timeLimit) * 100}%`;

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
      this.score += 20;
      this.starsEarned += q.stars;
      window.app.showToast(`✅ Chính xác! +20 Điểm & +${q.stars} ⭐!`, "success");
    } else {
      this.playWrongSound();
      window.app.showToast("❌ Chưa đúng rồi!", "error");
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

    // Lưu điểm số lên Supabase Cloud & Local
    await window.arenaService.recordMatchResult({
      score: this.score,
      totalCorrect: Math.round(this.score / 20),
      totalQuestions: this.battleQuestions.length,
      starsEarned: this.starsEarned,
      durationSeconds: 25,
      grade: this.selectedGrade === "all" ? 3 : this.selectedGrade
    });

    if (window.simulation3D?.triggerFireworks) {
      window.simulation3D.triggerFireworks();
    }

    if (this.score >= 80 && window.ttsService?.playApplause) {
      window.ttsService.playApplause(3.5, true);
    }

    window.app.showToast(`🎉 Xuất sắc! Em hoàn thành Đấu Trường với ${this.score}/100 Điểm!`, "success");
    this.currentTab = "leaderboard";
    this.render("main-content-area");
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
