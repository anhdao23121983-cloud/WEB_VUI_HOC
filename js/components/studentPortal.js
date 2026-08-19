/**
 * STUDENT PORTAL COMPONENT
 * Giao diện học sinh (Lớp 3, 4, 5): Bản đồ bài học phiêu lưu, thử thách sao, bảng vàng vinh danh
 */

class StudentPortal {
  constructor() {
    this.currentGrade = 3;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = window.authService?.getUser() || { name: "Nguyễn Văn An", className: "3A", stars: 180, avatar: "👦" };
    const curriculum = CURRICULUM_DATA[this.currentGrade];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Banner Học Sinh Rực Rỡ -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/30 animate-float">
              ${user.avatar || "🎒"}
            </div>
            <div>
              <span class="badge badge-amber font-black mb-1">⭐ BẠN LÀ HIỆP SĨ CÔNG NGHỆ</span>
              <h2 class="text-2xl md:text-3xl font-extrabold text-white">CHÀO BẠN: ${user.name.toUpperCase()} (LỚP ${user.className || "3A"})</h2>
              <p class="text-cyan-100 text-xs md:text-sm">Hãy hoàn thành các bài học và trò chơi để tích lũy Ngôi sao Vàng nhé!</p>
            </div>
          </div>

          <!-- Điểm Sao & Đổi Quà -->
          <div class="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/30 flex items-center gap-4">
            <div class="text-center">
              <p class="text-xs text-cyan-100 font-bold uppercase">Ngôi Sao Vàng</p>
              <h3 class="text-3xl font-black text-amber-300 flex items-center justify-center gap-1">
                ⭐ <span id="student-live-stars">${user.stars || 180}</span>
              </h3>
            </div>
            <button onclick="studentPortal.openGameHub()" class="btn btn-amber btn-sm font-black">
              🎮 Vào Game Hub
            </button>
          </div>
        </div>

        <!-- Bộ Chọn Khối Lớp (Lớp 3, Lớp 4, Lớp 5) -->
        <div class="flex items-center justify-center gap-4 py-2">
          ${[3, 4, 5].map(g => `
            <button onclick="studentPortal.selectGrade(${g})" class="px-6 py-3 rounded-2xl font-black text-base flex items-center gap-2 transition-all shadow-md ${this.currentGrade === g ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white scale-105 ring-4 ring-cyan-200' : 'bg-white text-slate-700 hover:bg-cyan-50'}">
              <span>${g === 3 ? '🎒' : g === 4 ? '🚀' : '⭐'}</span>
              <span>TIN HỌC LỚP ${g}</span>
            </button>
          `).join("")}
        </div>

        <!-- Banner Mô Phỏng 3D Nổi Bật Dành Riêng Cho Lớp 3 -->
        ${this.currentGrade === 3 ? `
          <div class="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-cyan-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-purple-400/50 animate-pop">
            <div class="space-y-2 text-center md:text-left">
              <div class="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <span>🧪</span> MÔ PHỎNG 3D ĐỘC QUYỀN
              </div>
              <h3 class="text-xl md:text-2xl font-black text-amber-300">BÀI 7: SẮP XẾP ĐỂ DỄ TÌM (PHÒNG MÔ PHỎNG 3D)</h3>
              <p class="text-xs md:text-sm text-cyan-100 max-w-xl">
                Cùng thử tài phân loại 10 đồ vật vào kệ tủ 3 tầng, tham gia thử thách so sánh tốc độ tìm kiếm và khám phá cây thư mục máy tính cực kỳ thú vị!
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <button onclick="window.location.hash='lab3d'" class="btn btn-amber btn-lg font-black shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                <span>🚀</span> <span>Vào Mô Phỏng 3D Ngay</span>
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Bản Đồ Khám Phá Bài Học (Adventure Map) -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h3 class="text-xl font-extrabold text-slate-900">🗺️ BẢN ĐỒ KHÁM PHÁ KIẾN THỨC - LỚP ${this.currentGrade}</h3>
              <p class="text-xs text-slate-500 font-semibold">Nhấn vào từng bài học để xem nội dung và thử tài làm bài tập</p>
            </div>
            <span class="badge badge-cyan font-bold">${curriculum.topics.length} Đảo Chủ Đề</span>
          </div>

          <!-- Các Đảo Chủ Đề -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${curriculum.topics.map(topic => `
              <div class="p-5 bg-gradient-to-br from-slate-50 to-cyan-50/40 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 transition-all shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <span class="badge badge-emerald font-black">Chủ đề ${topic.code}</span>
                  <span class="text-xs text-slate-400 font-bold">${topic.lessons.length} Bài học</span>
                </div>
                <h4 class="font-extrabold text-slate-800 text-base mb-2">${topic.name}</h4>
                <p class="text-xs text-slate-600 mb-4 leading-relaxed">${topic.description}</p>

                <!-- Danh sách bài học con -->
                <div class="space-y-2">
                  ${topic.lessons.map(lesson => `
                    <div class="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between" onclick="studentPortal.openLessonDetail(${this.currentGrade}, '${lesson.id}')">
                      <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 font-black text-xs flex items-center justify-center">${lesson.number}</span>
                        <span class="font-bold text-xs text-slate-800">${lesson.title}</span>
                      </div>
                      <span class="text-amber-500 font-bold text-xs">⭐ 3</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  // Chọn Khối Lớp
  selectGrade(grade) {
    this.currentGrade = grade;
    this.render("main-content-area");
  }

  // Mở Game Hub
  openGameHub() {
    if (window.app) window.app.navigate("gamehub");
  }

  // Xem Chi Tiết Bài Học Cho Học Sinh
  openLessonDetail(grade, lessonId) {
    const curriculum = CURRICULUM_DATA[grade];
    let foundLesson = null;
    let foundTopic = null;

    curriculum.topics.forEach(t => {
      const l = t.lessons.find(item => item.id === lessonId);
      if (l) {
        foundLesson = l;
        foundTopic = t;
      }
    });

    if (!foundLesson) return;

    const modal = document.getElementById("student-lesson-modal");
    const content = document.getElementById("student-lesson-content");

    if (modal && content) {
      content.innerHTML = `
        <div class="space-y-5 text-slate-800">
          <div class="text-center pb-4 border-b border-slate-200">
            <span class="badge badge-emerald font-black mb-2">${foundTopic.name}</span>
            <h3 class="text-2xl font-black text-slate-900">BÀI ${foundLesson.number}: ${foundLesson.title.toUpperCase()}</h3>
            <p class="text-xs text-slate-500 font-semibold mt-1">Khối Lớp ${grade} - Môn Tin Học</p>
          </div>

          <div class="p-4 bg-cyan-50 rounded-2xl border border-cyan-200">
            <h4 class="font-extrabold text-cyan-900 text-sm mb-1">🎯 YÊU CẦU CẦN ĐẠT CỦA BÀI HỌC:</h4>
            <p class="text-xs text-cyan-800 font-semibold leading-relaxed">${foundLesson.description}</p>
          </div>

          <div class="space-y-2">
            <h4 class="font-extrabold text-slate-800 text-sm">💡 KIẾN THỨC TRỌNG TÂM CẦN NHỚ:</h4>
            <ul class="list-disc list-inside text-xs text-slate-700 space-y-1">
              <li><b>Năng lực cần đạt:</b> ${foundLesson.objectives?.competencies}</li>
              <li><b>Kỹ năng số:</b> ${foundLesson.objectives?.digitalCompetency}</li>
              <li><b>Phẩm chất rèn luyện:</b> ${foundLesson.objectives?.qualities}</li>
            </ul>
          </div>

          <div class="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-200">
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button onclick="studentPortal.openQuizChallenge(${grade}, '${foundLesson.id}', '${foundLesson.title}')" class="btn btn-primary btn-md font-black shadow-lg flex-1 sm:flex-none">
                📝 Làm Trắc Nghiệm (+Sao ⭐)
              </button>
              <button onclick="studentPortal.openGameForLesson('${foundLesson.id}')" class="btn btn-amber btn-md font-black shadow-lg flex-1 sm:flex-none">
                🎮 Chơi Game (+25 ⭐)
              </button>
            </div>
            <button onclick="document.getElementById('student-lesson-modal').classList.remove('active')" class="btn btn-outline btn-sm">
              Đóng Lại
            </button>
          </div>
        </div>
      `;
      modal.classList.add("active");
    }
  }

  // Mở bài tập trắc nghiệm tương tác
  openQuizChallenge(grade, lessonId, lessonTitle) {
    document.getElementById('student-lesson-modal')?.classList.remove('active');
    if (window.quizPlayModal) {
      window.quizPlayModal.startQuiz(grade, lessonId, lessonTitle);
    }
  }

  // Vào game tương ứng với bài học
  openGameForLesson(lessonId) {
    document.getElementById('student-lesson-modal')?.classList.remove('active');
    if (window.app) {
      window.app.navigate("gamehub");
      setTimeout(() => {
        if (lessonId.includes("L3_02") || lessonId.includes("L4_01")) {
          window.gameHub.launchGame("game_hardware_match");
        } else if (lessonId.includes("L3_04") || lessonId.includes("L4_02")) {
          window.gameHub.launchGame("game_bee_typing");
        } else if (lessonId.includes("L3_06") || lessonId.includes("L4_03") || lessonId.includes("L5_03")) {
          window.gameHub.launchGame("game_knight_maze");
        } else {
          window.gameHub.launchGame("game_cyber_quiz");
        }
      }, 300);
    }
  }
}

window.studentPortal = new StudentPortal();
