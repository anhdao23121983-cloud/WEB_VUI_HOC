/**
 * QUIZ PLAY MODAL COMPONENT
 * Giao diện làm bài tập trắc nghiệm tương tác cho Học sinh với âm thanh, hiệu ứng và sao thưởng
 */

class QuizPlayModal {
  constructor() {
    this.lessonId = null;
    this.lessonTitle = "";
    this.grade = 3;
    this.quizzes = [];
    this.currentIndex = 0;
    this.score = 0;
    this.totalStarsEarned = 0;
    this.answered = false;
  }

  // Khởi động bài kiểm tra trắc nghiệm
  async startQuiz(grade, lessonId, lessonTitle) {
    this.grade = grade;
    this.lessonId = lessonId;
    this.lessonTitle = lessonTitle;
    this.currentIndex = 0;
    this.score = 0;
    this.totalStarsEarned = 0;
    this.answered = false;

    this.quizzes = await window.quizService.getQuizzesByLesson(lessonId);

    // Nếu bài học chưa có câu hỏi, lấy mẫu gợi ý AI
    if (this.quizzes.length === 0) {
      const fallback = await window.quizService.generateAIQuizSuggestions(lessonTitle, grade, "");
      this.quizzes = fallback;
    }

    const modal = document.getElementById("quiz-play-modal");
    if (!modal) return;

    modal.classList.add("active");
    this.renderCurrentQuestion();
  }

  closeModal() {
    const modal = document.getElementById("quiz-play-modal");
    if (modal) modal.classList.remove("active");
  }

  // Render câu hỏi hiện tại
  renderCurrentQuestion() {
    const container = document.getElementById("quiz-play-content");
    if (!container) return;

    if (this.currentIndex >= this.quizzes.length) {
      this.renderCompletionScreen();
      return;
    }

    const q = this.quizzes[this.currentIndex];
    this.answered = false;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header Thanh Tiến Độ -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span class="badge badge-emerald font-black text-xs">LỚP ${this.grade} • TIN HỌC</span>
            <h3 class="text-base md:text-lg font-black text-slate-900 mt-1">${this.lessonTitle}</h3>
          </div>
          <div class="text-right">
            <span class="badge badge-amber font-black text-xs">⭐ Câu ${this.currentIndex + 1}/${this.quizzes.length}</span>
            <p class="text-[11px] text-slate-500 font-bold mt-0.5">Thưởng: +${q.stars || 15} ⭐</p>
          </div>
        </div>

        <!-- Thanh Bar Tiến Độ -->
        <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div class="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500" style="width: ${((this.currentIndex + 1) / this.quizzes.length) * 100}%"></div>
        </div>

        <!-- Thẻ Nội Dung Câu Hỏi -->
        <div class="p-5 bg-gradient-to-br from-cyan-50 to-emerald-50/50 rounded-2xl border-2 border-cyan-200 space-y-2">
          <span class="text-xs font-black text-cyan-800 uppercase tracking-wider">CÂU HỎI THỬ THÁCH:</span>
          <p class="text-base md:text-lg font-black text-slate-900 leading-relaxed">${q.question}</p>
        </div>

        <!-- 4 Lựa Chọn Trả Lời -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="quiz-options-list">
          ${q.options.map((opt, idx) => `
            <button onclick="quizPlayModal.selectAnswer(${idx})" id="quiz-opt-btn-${idx}" class="p-4 bg-white hover:bg-cyan-50 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 text-left font-bold text-xs md:text-sm text-slate-800 transition-all shadow-sm flex items-center justify-between">
              <span>${opt}</span>
              <span id="quiz-opt-icon-${idx}" class="text-base opacity-0">✅</span>
            </button>
          `).join("")}
        </div>

        <!-- Hộp Thông Báo Giải Thích Kết Quả -->
        <div id="quiz-explanation-box" class="hidden p-4 rounded-2xl text-xs space-y-1 animate-pop"></div>

        <!-- Nút Hành Động -->
        <div class="flex justify-between items-center pt-2 border-t border-slate-200">
          <button onclick="quizPlayModal.closeModal()" class="btn btn-outline btn-sm">Thoát Bài Tập</button>
          <button id="btn-next-quiz" onclick="quizPlayModal.nextQuestion()" class="hidden btn btn-primary btn-sm font-black shadow-lg">
            Câu Tiếp Theo ▶
          </button>
        </div>
      </div>
    `;
  }

  // Xử lý khi học sinh chọn đáp án
  async selectAnswer(selectedIndex) {
    if (this.answered) return;
    this.answered = true;

    const q = this.quizzes[this.currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;
    const expBox = document.getElementById("quiz-explanation-box");
    const nextBtn = document.getElementById("btn-next-quiz");

    // Highlight đáp án
    for (let i = 0; i < q.options.length; i++) {
      const btn = document.getElementById(`quiz-opt-btn-${i}`);
      const icon = document.getElementById(`quiz-opt-icon-${i}`);
      if (btn) {
        btn.classList.add("pointer-events-none");
        if (i === q.correctIndex) {
          btn.className = "p-4 bg-emerald-50 border-2 border-emerald-500 text-emerald-900 rounded-2xl text-left font-bold text-xs md:text-sm shadow-md flex items-center justify-between";
          if (icon) { icon.innerText = "✅"; icon.classList.remove("opacity-0"); }
        } else if (i === selectedIndex) {
          btn.className = "p-4 bg-rose-50 border-2 border-rose-500 text-rose-900 rounded-2xl text-left font-bold text-xs md:text-sm shadow-md flex items-center justify-between";
          if (icon) { icon.innerText = "❌"; icon.classList.remove("opacity-0"); }
        } else {
          btn.classList.add("opacity-50");
        }
      }
    }

    if (isCorrect) {
      this.score++;
      const earned = q.stars || 15;
      this.totalStarsEarned += earned;

      if (expBox) {
        expBox.className = "p-4 bg-emerald-100/70 border-2 border-emerald-400 text-emerald-900 rounded-2xl text-xs space-y-1 animate-pop";
        expBox.innerHTML = `
          <p class="font-black text-sm text-emerald-800 flex items-center gap-1.5">
            <span>🎉</span> <span>CHÍNH XÁC! BẠN NHẬN ĐƯỢC +${earned} SAO VÀNG!</span>
          </p>
          ${q.explanation ? `<p class="text-slate-700 font-medium pt-1">💡 <b>Giải thích:</b> ${q.explanation}</p>` : ''}
        `;
        expBox.classList.remove("hidden");
      }

      if (window.ttsService) {
        window.ttsService.playPraise("smart");
      }
    } else {
      if (expBox) {
        expBox.className = "p-4 bg-amber-100/70 border-2 border-amber-400 text-amber-900 rounded-2xl text-xs space-y-1 animate-pop";
        expBox.innerHTML = `
          <p class="font-black text-sm text-rose-700 flex items-center gap-1.5">
            <span>⚠️</span> <span>CHƯA ĐÚNG RỒI! ĐỪNG BUỒN NHÉ!</span>
          </p>
          ${q.explanation ? `<p class="text-slate-700 font-medium pt-1">💡 <b>Gợi ý sư phạm:</b> ${q.explanation}</p>` : ''}
        `;
        expBox.classList.remove("hidden");
      }

      if (window.ttsService) {
        window.ttsService.playPraise("encourage");
      }
    }

    if (nextBtn) {
      nextBtn.classList.remove("hidden");
      nextBtn.innerText = this.currentIndex + 1 < this.quizzes.length ? "Câu Tiếp Theo ▶" : "Xem Tổng Kết Điểm 🏆";
    }
  }

  // Chuyển sang câu hỏi tiếp theo
  nextQuestion() {
    this.currentIndex++;
    this.renderCurrentQuestion();
  }

  // Render màn hình tổng kết
  async renderCompletionScreen() {
    const container = document.getElementById("quiz-play-content");
    if (!container) return;

    const user = window.authService?.getUser();
    const percent = Math.round((this.score / this.quizzes.length) * 100);

    // Đồng bộ sao thưởng lên Supabase
    if (user && this.totalStarsEarned > 0) {
      await window.supabaseService?.recordGameScore(user.id || user.username, `quiz_${this.lessonId}`, percent, this.totalStarsEarned);
      if (window.authService) {
        user.stars = (user.stars || 0) + this.totalStarsEarned;
        localStorage.setItem("app_current_user", JSON.stringify(user));
        window.authService.notifyListeners();
      }
    }

    if (percent >= 80 && window.ttsService?.playApplause) {
      window.ttsService.playApplause(3.0, true);
    }

    container.innerHTML = `
      <div class="text-center py-6 space-y-5 animate-pop">
        <span class="text-6xl block animate-bounce">${percent >= 80 ? "🏆" : percent >= 50 ? "⭐" : "💪"}</span>
        <div>
          <h3 class="text-2xl font-black text-slate-900">
            ${percent >= 80 ? "XUẤT SẮC! BẠN LÀ HIỆP SĨ TIN HỌC!" : percent >= 50 ? "HOÀN THÀNH TỐT THỬ THÁCH!" : "CỐ GẮNG HƠN Ở LẦN SAU NHÉ!"}
          </h3>
          <p class="text-xs text-slate-500 font-semibold mt-1">Bài học: ${this.lessonTitle}</p>
        </div>

        <div class="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div class="p-3 bg-cyan-50 rounded-2xl border border-cyan-200">
            <span class="text-2xl font-black text-cyan-700 block">${this.score}/${this.quizzes.length}</span>
            <span class="text-[11px] font-bold text-slate-500">Số Câu Đúng (${percent}%)</span>
          </div>
          <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <span class="text-2xl font-black text-amber-600 block">+${this.totalStarsEarned} ⭐</span>
            <span class="text-[11px] font-bold text-slate-500">Sao Vàng Nhận Được</span>
          </div>
        </div>

        <div class="flex justify-center gap-3 pt-3">
          <button onclick="quizPlayModal.startQuiz(${this.grade}, '${this.lessonId}', '${this.lessonTitle}')" class="btn btn-outline btn-sm font-bold">
            🔄 Làm Lại
          </button>
          <button onclick="quizPlayModal.closeModal()" class="btn btn-primary btn-sm font-black px-6 shadow-md">
            Hoàn Thành & Đóng
          </button>
        </div>
      </div>
    `;
  }
}

window.quizPlayModal = new QuizPlayModal();
