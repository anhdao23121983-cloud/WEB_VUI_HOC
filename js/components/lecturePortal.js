/**
 * LECTURE PORTAL COMPONENT
 * Trung tâm Bài Giảng Điện Tử: Lọc SGK (KNTT/CD/CTST), AI Tóm tắt và Trình chiếu Video hoạt họa có thuyết minh giọng đọc
 */

class LecturePortal {
  constructor() {
    this.currentGrade = "all";
    this.currentBookSeries = "all";
    this.searchQuery = "";
    this.lectures = [];

    // Video Player State
    this.activeVideoLecture = null;
    this.videoSlideFrames = [];
    this.currentSlideIndex = 0;
    this.isVideoPlaying = false;
    this.videoTimer = null;
    this.speechSynth = window.speechSynthesis || null;
  }

  async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');
    this.lectures = await window.lectureService.getAllLectures(this.currentGrade, this.searchQuery, this.currentBookSeries);

    container.innerHTML = `
      <div class="space-y-6 animate-pop">
        <!-- Banner Kho Bài Giảng Rực Rỡ -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="badge badge-amber font-black">📊 HỌC LIỆU SỐ TIỂU HỌC</span>
              <span class="badge bg-white/20 text-white font-bold">Chuẩn GDPT 2018 & CV 2345</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">KHO BÀI GIẢNG ĐIỆN TỬ & POWERPOINT</h2>
            <p class="text-cyan-100 text-xs md:text-sm">Trình chiếu slide trực tuyến, tóm tắt bài giảng bằng AI và xem Video hoạt họa thuyết minh giọng đọc</p>
          </div>

          ${isTeacher ? `
            <button onclick="lectureUploadModal.openModal(${this.currentGrade === 'all' ? 3 : this.currentGrade})" class="btn btn-amber btn-lg font-black shadow-xl flex items-center gap-2 shrink-0">
              <span>📤</span> <span>Tải Lên Bài Giảng Mới</span>
            </button>
          ` : `
            <div class="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 text-center text-xs text-white">
              <span class="font-bold block text-amber-300">💡 Dành Cho Học Sinh:</span>
              <span>Em có thể bấm 🎬 Xem Video hoạt họa hoặc 📥 Tải file về ôn tập!</span>
            </div>
          `}
        </div>

        <!-- Thanh Bộ Lọc Kép: Khối Lớp + 3 Bộ Sách Giáo Khoa + Ô Tìm Kiếm -->
        <div class="glass-card p-5 space-y-4">
          <!-- Hàng 1: Lọc Khối Lớp & Tìm Kiếm -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-500 mr-1">Khối Lớp:</span>
              <button onclick="lecturePortal.selectGrade('all')" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 'all' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                Tất Cả Khối
              </button>
              <button onclick="lecturePortal.selectGrade(3)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 3 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                🎒 Lớp 3
              </button>
              <button onclick="lecturePortal.selectGrade(4)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 4 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                🚀 Lớp 4
              </button>
              <button onclick="lecturePortal.selectGrade(5)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 5 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                ⭐ Lớp 5
              </button>
            </div>

            <!-- Ô Tìm Kiếm -->
            <div class="relative w-full md:w-80">
              <input type="text" id="lecture-search-input" value="${this.searchQuery}" oninput="lecturePortal.handleSearch(this.value)" placeholder="Tìm bài giảng, tác giả, chủ đề..." class="form-control text-xs pl-9 font-medium">
              <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
          </div>

          <!-- Hàng 2: Lọc Theo 3 Bộ Sách Giáo Khoa -->
          <div class="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200/70">
            <span class="text-xs font-bold text-slate-500 mr-1">Bộ Sách Giáo Khoa:</span>
            <button onclick="lecturePortal.selectBookSeries('all')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'all' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Tất Cả Bộ Sách
            </button>
            <button onclick="lecturePortal.selectBookSeries('KNTT')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'KNTT' ? 'bg-blue-600 text-white shadow' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}">
              📘 Kết Nối Tri Thức
            </button>
            <button onclick="lecturePortal.selectBookSeries('CD')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'CD' ? 'bg-amber-600 text-white shadow' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
              📙 Cánh Diều
            </button>
            <button onclick="lecturePortal.selectBookSeries('CTST')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'CTST' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
              📗 Chân Trời Sáng Tạo
            </button>
          </div>
        </div>

        <!-- Danh Sách Card Bài Giảng Điện Tử -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900">
              📚 DANH SÁCH BÀI GIẢNG (${this.lectures.length} BÀI)
            </h3>
          </div>

          ${this.renderLectureGrid(isTeacher)}
        </div>
      </div>
    `;
  }

  // Render lưới thẻ bài giảng
  renderLectureGrid(isTeacher) {
    if (this.lectures.length === 0) {
      return `
        <div class="text-center py-16 glass-card space-y-3 text-slate-400">
          <span class="text-6xl block mb-2">📊</span>
          <p class="font-black text-slate-700 text-base">Chưa tìm thấy bài giảng điện tử phù hợp.</p>
          <p class="text-xs text-slate-500">Thầy Cô hãy bấm nút <b>'Tải Lên Bài Giảng Mới'</b> để chia sẻ bài giảng PowerPoint đầu tiên!</p>
          ${isTeacher ? `
            <button onclick="lectureUploadModal.openModal()" class="btn btn-primary btn-sm font-black mt-2">
              📤 Tải Lên Ngay
            </button>
          ` : ''}
        </div>
      `;
    }

    const seriesLabels = {
      "KNTT": { name: "Kết Nối Tri Thức", bg: "bg-blue-600" },
      "CD": { name: "Cánh Diều", bg: "bg-amber-600" },
      "CTST": { name: "Chân Trời Sáng Tạo", bg: "bg-emerald-600" }
    };

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.lectures.map(l => {
          const sInfo = seriesLabels[l.bookSeries] || seriesLabels["KNTT"];
          return `
            <div class="glass-card overflow-hidden hover:border-cyan-500 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group">
              <!-- Header Thumbnail Gradient -->
              <div class="p-5 bg-gradient-to-br ${l.thumbnailColor || 'from-blue-600 to-cyan-500'} text-white space-y-2 relative">
                <div class="flex items-center justify-between gap-1 flex-wrap">
                  <span class="badge ${sInfo.bg} text-white font-black text-[10px] uppercase backdrop-blur-sm">
                    ${sInfo.name} • Lớp ${l.grade}
                  </span>
                  <span class="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    ${l.slideCount || 20} Slide
                  </span>
                </div>

                <div class="flex items-center gap-3 pt-2">
                  <span class="text-4xl filter drop-shadow-md group-hover:scale-110 transition-all">📊</span>
                  <div>
                    <p class="text-[11px] font-bold text-cyan-100 uppercase tracking-wider">${l.topicName || 'Chủ đề Tin học'}</p>
                    <h4 class="font-black text-base text-white leading-snug line-clamp-2">${l.title}</h4>
                  </div>
                </div>
              </div>

              <!-- Body Details -->
              <div class="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <p class="text-slate-600 line-clamp-2 leading-relaxed">
                  ${l.description || 'Bài giảng thiết kế trực quan theo chuẩn GDPT 2018, hỗ trợ trình chiếu và thuyết minh hoạt họa.'}
                </p>

                <div class="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div class="flex items-center justify-between">
                    <span>👨‍🏫 Tác giả: <b>${l.authorName || 'Thầy Anh Đào'}</b></span>
                    <span>📦 Dung lượng: <b>${l.fileSizeText || '5.2 MB'}</b></span>
                  </div>
                  <div class="flex items-center justify-between text-slate-400">
                    <span>👁️ ${l.viewCount || 0} lượt xem</span>
                    <span>📥 ${l.downloadCount || 0} lượt tải</span>
                  </div>
                </div>

                <!-- Hàng nút hành động đa năng: Video hoạt họa + AI tóm tắt + Trình chiếu + Tải về -->
                <div class="space-y-2 pt-2 border-t border-slate-100">
                  <div class="grid grid-cols-2 gap-2">
                    <button onclick="lecturePortal.openSlideVideoPlayer('${l.id}')" class="btn btn-amber btn-sm font-black flex items-center justify-center gap-1 shadow-sm" title="Xem Video bài giảng hoạt họa có thuyết minh giọng đọc">
                      <span>🎬</span> <span>Video Hoạt Họa</span>
                    </button>
                    <button onclick="lecturePortal.openAISummary('${l.id}')" class="btn btn-outline btn-sm font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 flex items-center justify-center gap-1">
                      <span>✨</span> <span>AI Tóm Tắt</span>
                    </button>
                  </div>

                  <div class="flex items-center justify-between gap-2">
                    <button onclick="lecturePortal.previewLecture('${l.id}')" class="btn btn-primary btn-sm flex-1 font-black flex items-center justify-center gap-1 shadow-sm">
                      <span>👁️</span> <span>Trình Chiếu</span>
                    </button>
                    <button onclick="lecturePortal.downloadLecture('${l.id}')" class="btn btn-outline btn-sm font-bold flex items-center gap-1" title="Tải file PowerPoint về máy">
                      <span>📥</span> <span>Tải Về</span>
                    </button>
                    ${isTeacher ? `
                      <button onclick="lecturePortal.deleteLecture('${l.id}')" class="p-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold border border-rose-200" title="Xóa bài giảng">
                        🗑️
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // Chọn Khối Lớp
  selectGrade(grade) {
    this.currentGrade = grade;
    this.render("main-content-area");
  }

  // Chọn Bộ Sách Giáo Khoa
  selectBookSeries(series) {
    this.currentBookSeries = series;
    this.render("main-content-area");
  }

  // Tìm kiếm
  handleSearch(query) {
    this.searchQuery = query;
    this.render("main-content-area");
  }

  // =========================================================================
  // 1. TÍNH NĂNG AI TÓM TẮT BÀI GIẢNG (AI SLIDE SUMMARY)
  // =========================================================================
  async openAISummary(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    window.app.showToast("✨ AI đang phân tích và trích xuất nội dung cốt lõi...", "info");
    const summary = await window.lectureService.generateAISlideSummary(lecture.title, lecture.grade, lecture.topicName);

    const modal = document.getElementById("lecture-ai-summary-modal");
    const content = document.getElementById("lec-ai-summary-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-4 text-xs text-slate-800 animate-pop">
          <div class="p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl border border-indigo-200 flex items-start justify-between gap-3">
            <div>
              <span class="badge bg-indigo-600 text-white font-black text-[10px]">AI PEDAGOGICAL SUMMARY</span>
              <h3 class="text-base font-black text-slate-900 mt-1">${summary.title}</h3>
              <p class="text-[11px] text-cyan-800 font-semibold">Khối Lớp ${summary.grade} • ${summary.topicName || 'Chủ đề Tin học GDPT 2018'}</p>
            </div>
            <span class="text-3xl">✨</span>
          </div>

          <!-- Yêu Cầu Cần Đạt -->
          <div class="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
            <h4 class="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
              <span>🎯</span> <span>YÊU CẦU CẦN ĐẠT CỐT LÕI (MỤC TIÊU BÀI DẠY)</span>
            </h4>
            <ul class="list-disc list-inside text-emerald-800 space-y-1 font-medium pl-1">
              ${summary.competencies.map(c => `<li>${c}</li>`).join("")}
            </ul>
          </div>

          <!-- Kiến Thức Trọng Tâm -->
          <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
            <h4 class="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
              <span>💡</span> <span>KIẾN THỨC TRỌNG TÂM CẦN GHI NHỚ</span>
            </h4>
            <ul class="list-disc list-inside text-amber-800 space-y-1 font-medium pl-1">
              ${summary.corePoints.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>

          <!-- Hoạt Động Thực Hành Đề Xuất -->
          <div class="p-3.5 bg-cyan-50 rounded-xl border border-cyan-200 space-y-1.5">
            <h4 class="font-extrabold text-cyan-900 text-xs flex items-center gap-1.5">
              <span>🚀</span> <span>GỢI Ý HOẠT ĐỘNG DẠY HỌC & THỰC HÀNH TƯƠNG TÁC</span>
            </h4>
            <ul class="list-disc list-inside text-cyan-800 space-y-1 font-medium pl-1">
              ${summary.suggestedActivities.map(a => `<li>${a}</li>`).join("")}
            </ul>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-400">
            <span>Độ tin cậy: <b>${summary.aiConfidence}</b></span>
            <button onclick="document.getElementById('lecture-ai-summary-modal').classList.remove('active')" class="btn btn-primary btn-sm font-black">
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  // =========================================================================
  // 2. TÍNH NĂNG SLIDE-TO-VIDEO: XEM VIDEO HOẠT HỌA & THUYẾT MINH GIỌNG ĐỌC AI
  // =========================================================================
  async openSlideVideoPlayer(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    this.activeVideoLecture = lecture;
    this.videoSlideFrames = window.lectureService.generateSlideFrames(lecture);
    this.currentSlideIndex = 0;
    this.isVideoPlaying = false;
    if (this.videoTimer) clearInterval(this.videoTimer);

    const modal = document.getElementById("slide-video-player-modal");
    if (modal) modal.classList.add("active");

    this.renderVideoSlide();
  }

  closeSlideVideoPlayer() {
    this.pauseVideo();
    if (this.speechSynth) this.speechSynth.cancel();
    const modal = document.getElementById("slide-video-player-modal");
    if (modal) modal.classList.remove("active");
  }

  renderVideoSlide() {
    const frame = this.videoSlideFrames[this.currentSlideIndex];
    if (!frame) return;

    const screenContainer = document.getElementById("video-slide-screen");
    const progressText = document.getElementById("video-slide-progress-text");
    const progressBar = document.getElementById("video-slide-progress-bar");

    if (progressText) progressText.innerText = `Trang ${this.currentSlideIndex + 1}/${this.videoSlideFrames.length}`;
    if (progressBar) progressBar.style.width = `${((this.currentSlideIndex + 1) / this.videoSlideFrames.length) * 100}%`;

    if (screenContainer) {
      screenContainer.className = `w-full h-full bg-gradient-to-br ${frame.color} text-white p-6 md:p-10 flex flex-col justify-between rounded-2xl shadow-2xl transition-all duration-700 relative overflow-hidden`;
      screenContainer.innerHTML = `
        <!-- Floating Decor -->
        <div class="absolute -right-10 -bottom-10 text-9xl opacity-10 select-none pointer-events-none">${frame.icon}</div>

        <!-- Top Title -->
        <div class="space-y-1 relative z-10">
          <div class="flex items-center gap-2">
            <span class="text-3xl">${frame.icon}</span>
            <span class="text-xs font-black tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">${frame.heading}</span>
          </div>
          <h2 class="text-xl md:text-2xl font-black text-white pt-1">${frame.subtitle}</h2>
        </div>

        <!-- Center Bullet Points -->
        <div class="bg-black/25 backdrop-blur-md p-5 rounded-2xl border border-white/20 space-y-2.5 my-auto relative z-10">
          ${frame.bulletPoints.map(bp => `
            <div class="flex items-start gap-2.5 text-xs md:text-sm font-bold text-white/95">
              <span class="text-amber-300 mt-0.5">⭐</span>
              <span>${bp}</span>
            </div>
          `).join("")}
        </div>

        <!-- Bottom Narration Script -->
        <div class="p-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 text-[11px] text-cyan-100 flex items-center gap-2 relative z-10">
          <span class="text-base animate-pulse">🎙️</span>
          <span><b>Lời Thầy Cô thuyết minh:</b> "${frame.narration}"</span>
        </div>
      `;
    }

    // Đọc thuyết minh bằng Web Speech API
    this.speakNarration(frame.narration);
  }

  // Phát giọng đọc thuyết minh tiếng Việt
  speakNarration(text) {
    if (!this.speechSynth) return;
    this.speechSynth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 0.95; // Tốc độ đọc chuẩn sư phạm
    utterance.pitch = 1.0;

    // Lấy giọng đọc tiếng Việt nếu trình duyệt hỗ trợ
    const voices = this.speechSynth.getVoices();
    const viVoice = voices.find(v => v.lang.includes("vi") || v.lang.includes("VN"));
    if (viVoice) utterance.voice = viVoice;

    this.speechSynth.speak(utterance);
  }

  // Bật/Tắt tự động chạy slide video
  togglePlayVideo() {
    this.isVideoPlaying = !this.isVideoPlaying;
    const btn = document.getElementById("btn-toggle-video-play");

    if (this.isVideoPlaying) {
      if (btn) btn.innerHTML = "<span>⏸️</span> <span>Tạm Dừng</span>";
      this.startVideoAutoAdvance();
    } else {
      if (btn) btn.innerHTML = "<span>▶️</span> <span>Phát Video</span>";
      this.pauseVideo();
    }
  }

  startVideoAutoAdvance() {
    if (this.videoTimer) clearInterval(this.videoTimer);
    this.videoTimer = setInterval(() => {
      if (this.currentSlideIndex + 1 < this.videoSlideFrames.length) {
        this.currentSlideIndex++;
        this.renderVideoSlide();
      } else {
        this.pauseVideo();
        const btn = document.getElementById("btn-toggle-video-play");
        if (btn) btn.innerHTML = "<span>🔄</span> <span>Phát Lại Từ Đầu</span>";
        window.app.showToast("🎉 Đã hoàn thành xem Video bài giảng hoạt họa!", "success");
      }
    }, 9000); // 9 giây mỗi slide
  }

  pauseVideo() {
    this.isVideoPlaying = false;
    if (this.videoTimer) clearInterval(this.videoTimer);
  }

  nextSlideVideo() {
    if (this.currentSlideIndex + 1 < this.videoSlideFrames.length) {
      this.currentSlideIndex++;
      this.renderVideoSlide();
    }
  }

  prevSlideVideo() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.renderVideoSlide();
    }
  }

  // =========================================================================
  // 3. TRÌNH CHIẾU ONLINE & TẢI VỀ
  // =========================================================================
  async previewLecture(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    await window.lectureService.recordAction(id, 'view');

    const modal = document.getElementById("lecture-preview-modal");
    const titleDisp = document.getElementById("lec-preview-title");
    const frame = document.getElementById("lec-preview-iframe");

    if (titleDisp) titleDisp.innerText = lecture.title;

    if (frame) {
      let embedUrl = lecture.fileUrl;
      if (embedUrl.startsWith("http") && !embedUrl.includes("view.officeapps.live.com") && !embedUrl.includes("drive.google.com") && !embedUrl.includes("canva.com")) {
        embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(embedUrl)}`;
      }
      frame.src = embedUrl;
    }

    if (modal) modal.classList.add("active");
  }

  closePreviewModal() {
    const modal = document.getElementById("lecture-preview-modal");
    const frame = document.getElementById("lec-preview-iframe");
    if (frame) frame.src = "";
    if (modal) modal.classList.remove("active");
  }

  async downloadLecture(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    await window.lectureService.recordAction(id, 'download');

    if (lecture.fileUrl.startsWith("data:") || lecture.fileUrl.startsWith("blob:")) {
      const a = document.createElement("a");
      a.href = lecture.fileUrl;
      a.download = lecture.fileName || "BaiGiang_TinHoc.pptx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(lecture.fileUrl, "_blank");
    }

    window.app.showToast(`📥 Đang tải xuống bài giảng: ${lecture.fileName}`, "success");
    this.render("main-content-area");
  }

  async deleteLecture(id) {
    if (!confirm("Thầy Cô có chắc chắn muốn xóa bài giảng điện tử này khỏi hệ thống không?")) return;
    await window.lectureService.deleteLecture(id);
    window.app.showToast("🗑️ Đã xóa bài giảng thành công!", "info");
    this.render("main-content-area");
  }
}

window.lecturePortal = new LecturePortal();
