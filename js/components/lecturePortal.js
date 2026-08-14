/**
 * LECTURE PORTAL COMPONENT
 * Trung tâm Bài Giảng Điện Tử: Tìm kiếm, Lọc theo khối lớp, Trình chiếu trực tuyến và Tải file PowerPoint
 */

class LecturePortal {
  constructor() {
    this.currentGrade = "all";
    this.searchQuery = "";
    this.lectures = [];
  }

  async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');
    this.lectures = await window.lectureService.getAllLectures(this.currentGrade, this.searchQuery);

    container.innerHTML = `
      <div class="space-y-6 animate-pop">
        <!-- Banner Kho Bài Giảng Rực Rỡ -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="badge badge-amber font-black">📊 HỌC LIỆU SỐ TIỂU HỌC</span>
              <span class="badge bg-white/20 text-white font-bold">Chuẩn GDPT 2018</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">KHO BÀI GIẢNG ĐIỆN TỬ & POWERPOINT</h2>
            <p class="text-cyan-100 text-xs md:text-sm">Thư viện bài giảng trình chiếu sinh động, tương tác và hỗ trợ trình chiếu trực tuyến cho Giáo viên & Học sinh</p>
          </div>

          ${isTeacher ? `
            <button onclick="lectureUploadModal.openModal(${this.currentGrade === 'all' ? 3 : this.currentGrade})" class="btn btn-amber btn-lg font-black shadow-xl flex items-center gap-2 shrink-0">
              <span>📤</span> <span>Tải Lên Bài Giảng Mới</span>
            </button>
          ` : `
            <div class="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 text-center text-xs text-white">
              <span class="font-bold block text-amber-300">💡 Dành Cho Học Sinh:</span>
              <span>Em có thể xem trực tuyến và tải bài về ôn tập!</span>
            </div>
          `}
        </div>

        <!-- Thanh Tìm Kiếm & Bộ Lọc Khối Lớp -->
        <div class="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- Bộ Lọc Khối Lớp -->
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="lecturePortal.selectGrade('all')" class="px-4 py-2 rounded-xl text-xs font-black transition-all ${this.currentGrade === 'all' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              Tất Cả Khối
            </button>
            <button onclick="lecturePortal.selectGrade(3)" class="px-4 py-2 rounded-xl text-xs font-black transition-all ${this.currentGrade === 3 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              🎒 Lớp 3
            </button>
            <button onclick="lecturePortal.selectGrade(4)" class="px-4 py-2 rounded-xl text-xs font-black transition-all ${this.currentGrade === 4 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              🚀 Lớp 4
            </button>
            <button onclick="lecturePortal.selectGrade(5)" class="px-4 py-2 rounded-xl text-xs font-black transition-all ${this.currentGrade === 5 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              ⭐ Lớp 5
            </button>
          </div>

          <!-- Ô Tìm Kiếm -->
          <div class="relative w-full md:w-80">
            <input type="text" id="lecture-search-input" value="${this.searchQuery}" oninput="lecturePortal.handleSearch(this.value)" placeholder="Tìm kiếm bài giảng, chủ đề..." class="form-control text-xs pl-9 font-medium">
            <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>
        </div>

        <!-- Danh Sách Card Bài Giảng Điện Tử -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900">
              📚 DANH SÁCH BÀI GIẢNG HIỆN CÓ (${this.lectures.length} BÀI)
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

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.lectures.map(l => `
          <div class="glass-card overflow-hidden hover:border-cyan-500 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group">
            <!-- Header Thumbnail Gradient -->
            <div class="p-5 bg-gradient-to-br ${l.thumbnailColor || 'from-blue-600 to-cyan-500'} text-white space-y-2 relative">
              <div class="flex items-center justify-between">
                <span class="badge bg-black/25 text-white font-black text-[10px] uppercase backdrop-blur-sm">
                  Lớp ${l.grade} • ${l.fileType.toUpperCase()}
                </span>
                <span class="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  ${l.slideCount || 20} Trang Slide
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
                ${l.description || 'Bài giảng thiết kế chuẩn trực quan, hỗ trợ giảng dạy tương tác trên lớp và tự học ở nhà.'}
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

              <!-- Action Buttons -->
              <div class="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
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
        `).join("")}
      </div>
    `;
  }

  // Chọn Khối Lớp
  selectGrade(grade) {
    this.currentGrade = grade;
    this.render("main-content-area");
  }

  // Tìm kiếm
  handleSearch(query) {
    this.searchQuery = query;
    this.render("main-content-area");
  }

  // Trình chiếu / Xem trực tuyến bài giảng
  async previewLecture(id) {
    const lecture = await window.lectureService.getLectureById(id);
    if (!lecture) return;

    await window.lectureService.recordAction(id, 'view');

    const modal = document.getElementById("lecture-preview-modal");
    const titleDisp = document.getElementById("lec-preview-title");
    const frame = document.getElementById("lec-preview-iframe");

    if (titleDisp) titleDisp.innerText = lecture.title;

    if (frame) {
      // Nếu là URL web trực tiếp (Office live viewer hoặc embed link)
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

  // Tải file PowerPoint về máy
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

  // Xóa bài giảng
  async deleteLecture(id) {
    if (!confirm("Thầy Cô có chắc chắn muốn xóa bài giảng điện tử này khỏi hệ thống không?")) return;
    await window.lectureService.deleteLecture(id);
    window.app.showToast("🗑️ Đã xóa bài giảng thành công!", "info");
    this.render("main-content-area");
  }
}

window.lecturePortal = new LecturePortal();
