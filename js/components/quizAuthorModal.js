/**
 * QUIZ AUTHOR MODAL COMPONENT
 * Giao diện dành cho Giáo viên để Soạn, Chỉnh sửa, Xóa và Dùng AI tạo câu hỏi trắc nghiệm
 */

class QuizAuthorModal {
  constructor() {
    this.currentLesson = null;
    this.currentQuizzes = [];
    this.editingQuizId = null;
  }

  // Mở modal soạn câu hỏi cho 1 bài học
  async openModal(grade, lessonId, lessonTitle, topicName = "") {
    this.currentLesson = { grade, lessonId, lessonTitle, topicName };
    this.editingQuizId = null;

    const modal = document.getElementById("quiz-author-modal");
    if (!modal) return;

    modal.classList.add("active");
    await this.refreshQuizList();
    this.renderForm();
  }

  closeModal() {
    const modal = document.getElementById("quiz-author-modal");
    if (modal) modal.classList.remove("active");
    this.currentLesson = null;
    this.editingQuizId = null;
  }

  // Tải lại danh sách câu hỏi của bài học
  async refreshQuizList() {
    if (!this.currentLesson) return;
    this.currentQuizzes = await window.quizService.getQuizzesByLesson(this.currentLesson.lessonId);
    this.renderQuizList();
  }

  // Render form nhập câu hỏi
  renderForm(quizToEdit = null) {
    const formContainer = document.getElementById("quiz-form-container");
    if (!formContainer) return;

    const q = quizToEdit || {
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
      stars: 15
    };

    formContainer.innerHTML = `
      <div class="space-y-4 text-xs">
        <div class="flex items-center justify-between">
          <h4 class="font-extrabold text-slate-800 text-sm">
            ${quizToEdit ? "✏️ CHỈNH SỬA CÂU HỎI" : "➕ THÊM CÂU HỎI MỚI"}
          </h4>
          <button onclick="quizAuthorModal.generateAIQuestions()" class="btn btn-amber btn-sm font-black flex items-center gap-1 shadow-md">
            <span>✨ AI Soạn Tự Động 3 Câu Hỏi</span>
          </button>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Nội Dung Câu Hỏi (*)</label>
          <textarea id="qa-question-input" rows="2" class="form-control text-xs font-semibold" placeholder="Nhập câu hỏi kiểm tra kiến thức bài học...">${q.question}</textarea>
        </div>

        <div class="space-y-2">
          <label class="form-label font-bold">4 Phương Án Trả Lời (Đánh dấu vào nút tròn của đáp án ĐÚNG):</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            ${[0, 1, 2, 3].map(idx => {
              const label = ['A', 'B', 'C', 'D'][idx];
              const optVal = q.options[idx] ? q.options[idx].replace(/^[A-D]\.\s*/, '') : '';
              return `
                <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <input type="radio" name="qa-correct-radio" value="${idx}" ${q.correctIndex === idx ? "checked" : ""} class="w-4 h-4 text-cyan-600 accent-cyan-600 cursor-pointer">
                  <span class="font-black text-slate-700 w-5">${label}.</span>
                  <input type="text" id="qa-option-${idx}" value="${optVal}" class="form-control text-xs flex-1 font-medium" placeholder="Nhập đáp án ${label}...">
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="md:col-span-2 form-group">
            <label class="form-label font-bold">Lời Giải Thích / Hướng Dẫn Sư Phạm (Hiện khi học sinh trả lời)</label>
            <input type="text" id="qa-explanation-input" value="${q.explanation}" class="form-control text-xs" placeholder="Giải thích vì sao đáp án này đúng...">
          </div>
          <div class="form-group">
            <label class="form-label font-bold">Số Sao Thưởng (⭐)</label>
            <select id="qa-stars-input" class="form-control text-xs font-bold">
              <option value="10" ${q.stars === 10 ? "selected" : ""}>⭐ 10 Sao (Dễ)</option>
              <option value="15" ${q.stars === 15 ? "selected" : ""}>⭐ 15 Sao (Chuẩn)</option>
              <option value="20" ${q.stars === 20 ? "selected" : ""}>⭐ 20 Sao (Khá)</option>
              <option value="25" ${q.stars === 25 ? "selected" : ""}>⭐ 25 Sao (Thử Thách)</option>
              <option value="30" ${q.stars === 30 ? "selected" : ""}>⭐ 30 Sao (Xuất Sắc)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-200">
          ${quizToEdit ? `<button onclick="quizAuthorModal.cancelEdit()" class="btn btn-outline btn-sm">Hủy Chỉnh Sửa</button>` : ''}
          <button onclick="quizAuthorModal.saveCurrentQuestion()" class="btn btn-primary btn-sm font-black px-5 shadow-md">
            💾 ${quizToEdit ? "Cập Nhật Câu Hỏi" : "Lưu Vào Bài Học"}
          </button>
        </div>
      </div>
    `;
  }

  // Render danh sách câu hỏi hiện có
  renderQuizList() {
    const listContainer = document.getElementById("quiz-list-container");
    const countBadge = document.getElementById("quiz-count-badge");
    if (!listContainer) return;

    if (countBadge) {
      countBadge.innerText = `${this.currentQuizzes.length} Câu Hỏi`;
    }

    if (this.currentQuizzes.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-6 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <span class="text-3xl block mb-1">📝</span>
          <p class="font-bold text-xs">Chưa có câu hỏi nào cho bài học này.</p>
          <p class="text-[11px] text-slate-500 mt-0.5">Thầy Cô hãy nhập câu hỏi ở form bên dưới hoặc bấm nút <b>'AI Soạn Tự Động'</b> nhé!</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = `
      <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
        ${this.currentQuizzes.map((q, idx) => `
          <div class="p-3 bg-white rounded-xl border border-slate-200 hover:border-cyan-400 transition-all shadow-sm space-y-2 text-xs">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
                <div>
                  <p class="font-black text-slate-900 text-xs">${q.question}</p>
                  <p class="text-[10px] text-emerald-700 font-bold mt-0.5">✅ Đáp án đúng: ${q.options[q.correctIndex] || ''} | ⭐ +${q.stars} sao</p>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button onclick="quizAuthorModal.editQuiz('${q.id}')" class="p-1.5 hover:bg-slate-100 rounded-lg text-cyan-700 font-bold" title="Chỉnh sửa">✏️</button>
                <button onclick="quizAuthorModal.deleteQuiz('${q.id}')" class="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 font-bold" title="Xóa câu hỏi">🗑️</button>
              </div>
            </div>
            ${q.explanation ? `<p class="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">💡 Giải thích: ${q.explanation}</p>` : ''}
          </div>
        `).join("")}
      </div>
    `;
  }

  // Lưu câu hỏi hiện tại
  async saveCurrentQuestion() {
    const questionText = document.getElementById("qa-question-input")?.value || "";
    if (!questionText.trim()) {
      window.app.showToast("Vui lòng nhập nội dung câu hỏi!", "warning");
      return;
    }

    const options = [
      "A. " + (document.getElementById("qa-option-0")?.value || "").trim(),
      "B. " + (document.getElementById("qa-option-1")?.value || "").trim(),
      "C. " + (document.getElementById("qa-option-2")?.value || "").trim(),
      "D. " + (document.getElementById("qa-option-3")?.value || "").trim()
    ];

    if (options.some(opt => opt.length <= 3)) {
      window.app.showToast("Vui lòng nhập đầy đủ 4 phương án A, B, C, D!", "warning");
      return;
    }

    const radios = document.getElementsByName("qa-correct-radio");
    let correctIdx = 0;
    for (let r of radios) {
      if (r.checked) correctIdx = parseInt(r.value);
    }

    const explanation = document.getElementById("qa-explanation-input")?.value || "";
    const stars = parseInt(document.getElementById("qa-stars-input")?.value) || 15;

    const quizData = {
      id: this.editingQuizId,
      lessonId: this.currentLesson.lessonId,
      lessonTitle: this.currentLesson.lessonTitle,
      grade: this.currentLesson.grade,
      question: questionText,
      options: options,
      correctIndex: correctIdx,
      explanation: explanation,
      stars: stars
    };

    await window.quizService.saveQuiz(quizData);
    window.app.showToast("💾 Đã lưu câu hỏi trắc nghiệm thành công!", "success");

    this.editingQuizId = null;
    await this.refreshQuizList();
    this.renderForm();
  }

  // Chỉnh sửa câu hỏi
  editQuiz(quizId) {
    const quiz = this.currentQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    this.editingQuizId = quizId;
    this.renderForm(quiz);
  }

  cancelEdit() {
    this.editingQuizId = null;
    this.renderForm();
  }

  // Xóa câu hỏi
  async deleteQuiz(quizId) {
    if (!confirm("Thầy Cô có chắc chắn muốn xóa câu hỏi này khỏi bài học không?")) return;
    await window.quizService.deleteQuiz(quizId);
    window.app.showToast("🗑️ Đã xóa câu hỏi!", "info");
    await this.refreshQuizList();
  }

  // AI Tự động sinh 3 câu hỏi
  async generateAIQuestions() {
    if (!this.currentLesson) return;
    window.app.showToast("✨ AI đang phân tích bài học và sinh 3 câu hỏi chuẩn GDPT 2018...", "info");

    const aiSuggestions = await window.quizService.generateAIQuizSuggestions(
      this.currentLesson.lessonTitle,
      this.currentLesson.grade,
      this.currentLesson.topicName
    );

    for (let item of aiSuggestions) {
      await window.quizService.saveQuiz({
        lessonId: this.currentLesson.lessonId,
        lessonTitle: this.currentLesson.lessonTitle,
        grade: this.currentLesson.grade,
        question: item.question,
        options: item.options,
        correctIndex: item.correctIndex,
        explanation: item.explanation,
        stars: item.stars
      });
    }

    await this.refreshQuizList();
    window.app.showToast("🎉 AI đã tạo thành công 3 câu hỏi trắc nghiệm chất lượng cao!", "success");
  }
}

window.quizAuthorModal = new QuizAuthorModal();
