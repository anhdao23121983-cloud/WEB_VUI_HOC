/**
 * SIMULATION 3D COMPONENT - PHÒNG THÍ NGHIỆM 3D TIN HỌC TIỂU HỌC 3-5
 * Tích hợp:
 * 1. 📘 Bài 7: Sắp Xếp Để Dễ Tìm (Tủ Đồ 3 Tầng & Bàn Học 3D)
 * 2. 📁 Bài 8: Làm Quen Với Thư Mục (Màn Hình Máy Tính Ảo, Tạo & Quản Lý Folder 3D)
 * 3. 🔊 Voice Narration AI: Thuyết minh giọng đọc Tiếng Việt tự động
 * 4. ⏱️ Thử Thách Đo Tốc Độ Tìm Kiếm (So Sánh Bừa Bộn vs Ngăn Nắp)
 * 5. 📷 Phòng Chiếu AR Thực Tế Ảo: Camera trực tiếp & Chụp ảnh lưu niệm
 * 6. 🔗 Tích hợp liên kết gốc Google Gemini: https://share.gemini.google/NLLCPUG04S6G
 */

class Simulation3D {
  constructor() {
    this.currentLesson = 7; // 7 (Sắp xếp để dễ tìm) | 8 (Làm quen với thư mục)
    this.currentMode = "organize"; // 'organize' | 'search_challenge' | 'folder_tree' | 'ar_camera' | 'gemini_embed'
    this.selectedItem = null;
    this.score = 0;
    this.isVoiceEnabled = true;
    this.searchScenario = "organized"; // 'messy' | 'organized'
    this.arStream = null;
    this.capturedPhoto = null;

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
  }

  resetItemLocations() {
    this.items.forEach(item => {
      this.itemLocations[item.id] = "desk";
    });
    this.score = 0;
  }

  // =========================================================================
  // VOICE NARRATION AI (THUYẾT MINH GIỌNG ĐỌC TIẾNG VIỆT)
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
      window.speechSynthesis.cancel(); // Dừng câu cũ
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.rate = 0.95; // Tốc độ vừa phải cho học sinh tiểu học
      utterance.pitch = 1.05; // Giọng truyền cảm ấm áp
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Không thể phát giọng nói:", e);
    }
  }

  // =========================================================================
  // GIAO DIỆN CHÍNH (RENDER)
  // =========================================================================
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6 animate-pop">
        <!-- Banner Thí Nghiệm 3D Đa Năng -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge badge-amber font-black">🧪 PHÒNG THÍ NGHIỆM 3D & AR ẢO</span>
              <span class="badge bg-white/20 text-white font-bold">TIN HỌC TIỂU HỌC 3-5 • CHỦ ĐỀ C (GDPT 2018)</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">
              ${this.currentLesson === 7 ? "BÀI 7: SẮP XẾP ĐỂ DỄ TÌM" : "BÀI 8: LÀM QUEN VỚI THƯ MỤC"}
            </h2>
            <p class="text-cyan-100 text-xs md:text-sm max-w-2xl">
              ${this.currentLesson === 7 
                ? "Thực hành phân loại 10 đồ vật vào kệ tủ 3 tầng, so sánh thời gian tìm kiếm và chuyển đổi sang cây thư mục máy tính."
                : "Mô phỏng màn hình máy tính Desktop tương tác: tạo thư mục, đổi tên, kéo thả tệp tin và khám phá cây thư mục số."}
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <!-- Nút Bật/Tắt Thuyết Minh AI -->
            <button onclick="simulation3D.toggleVoice()" class="btn ${this.isVoiceEnabled ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/20 text-white'} text-xs py-2 px-3 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-md hover:scale-105 transition-all" title="Bật hoặc tắt giọng nói thuyết minh Tiếng Việt">
              <span>${this.isVoiceEnabled ? '🔊' : '🔇'}</span> 
              <span>${this.isVoiceEnabled ? 'Giọng Nói: BẬT' : 'Giọng Nói: TẮT'}</span>
            </button>

            <a href="https://share.gemini.google/NLLCPUG04S6G" target="_blank" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2 px-3 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md hover:scale-105 transition-all" title="Mở trang chia sẻ Google Gemini gốc trong tab mới">
              <span>✨</span> <span>Link Gốc Gemini</span>
            </a>

            <button onclick="simulation3D.openFullScreenModal()" class="btn btn-amber btn-sm font-black shadow-xl flex items-center gap-1.5 hover:scale-105 transition-all">
              <span>📺</span> <span>Toàn Màn Hình</span>
            </button>
          </div>
        </div>

        <!-- Bộ Chọn Bài Học (Bài 7 ↔ Bài 8) -->
        <div class="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-500 uppercase">Chọn Bài Thí Nghiệm:</span>
            <button onclick="simulation3D.selectLesson(7)" class="px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 7 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📘</span> <span>Bài 7: Sắp Xếp Để Dễ Tìm</span>
            </button>
            <button onclick="simulation3D.selectLesson(8)" class="px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentLesson === 8 ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              <span>📁</span> <span>Bài 8: Làm Quen Với Thư Mục</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="simulation3D.openLessonPlanModal()" class="btn btn-outline btn-xs font-black text-emerald-700 bg-emerald-50 border-emerald-300 flex items-center gap-1" title="Xem giáo án chuẩn CV 2345 đã tích hợp Thí nghiệm 3D">
              <span>📑</span> <span>Xem Kế Hoạch Bài Dạy CV 2345</span>
            </button>
          </div>
        </div>

        <!-- Thanh Tab Chuyển Đổi Chế Độ Thí Nghiệm -->
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
          ${this.currentLesson === 7 ? `
            <button onclick="simulation3D.switchMode('organize')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'organize' ? 'bg-cyan-700 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
              <span>🎮 1. Thí Nghiệm Phân Loại 3D</span>
              <span class="badge ${this.currentMode === 'organize' ? 'bg-white/25 text-white' : 'badge-cyan'} text-[10px]">${this.getOrganizedCount()}/10</span>
            </button>
            
            <button onclick="simulation3D.switchMode('search_challenge')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'search_challenge' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
              <span>⏱️ 2. Thử Thách Tìm Kiếm Nhanh</span>
            </button>

            <button onclick="simulation3D.switchMode('folder_tree')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'folder_tree' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
              <span>💻 3. Cây Thư Mục Máy Tính</span>
            </button>
          ` : `
            <button onclick="simulation3D.switchMode('folder_manager')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'folder_manager' ? 'bg-purple-700 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
              <span>🖥️ 1. Màn Hình Desktop Ảo</span>
            </button>
            <button onclick="simulation3D.switchMode('folder_tree')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'folder_tree' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
              <span>🌳 2. Cây Phân Cấp Thư Mục</span>
            </button>
          `}

          <button onclick="simulation3D.switchMode('ar_camera')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'ar_camera' ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <span>📷 Phòng Chiếu AR Camera</span>
            <span class="badge bg-rose-100 text-rose-800 text-[10px]">Thực Tế Ảo</span>
          </button>

          <button onclick="simulation3D.switchMode('gemini_embed')" class="px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${this.currentMode === 'gemini_embed' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <span>✨ Bản Gốc Gemini AI</span>
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
      this.speak("Chào mừng các em đến với Bài 7: Sắp xếp để dễ tìm!");
    } else {
      this.currentMode = "folder_manager";
      this.speak("Chào mừng các em đến với Bài 8: Làm quen với thư mục!");
    }
    this.render("main-content-area");
  }

  getOrganizedCount() {
    return Object.values(this.itemLocations).filter(loc => loc !== "desk").length;
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (mode === "search_challenge") {
      this.searchScenario = "organized";
      this.speak("Hãy cùng thử thách đo xem sắp xếp ngăn nắp giúp em tìm kiếm nhanh hơn thế nào nhé!");
    } else if (mode === "ar_camera") {
      this.speak("Đang mở phòng chiếu thực tế ảo AR!");
      setTimeout(() => this.startARCamera(), 300);
    } else if (mode === "folder_manager") {
      this.speak("Em hãy thực hành tạo thư mục và kéo thả tệp tin vào đúng vị trí!");
    }
    this.render("main-content-area");
  }

  renderCurrentModeView() {
    if (this.currentMode === "organize") return this.renderOrganize3DView();
    if (this.currentMode === "search_challenge") return this.renderSearchChallengeView();
    if (this.currentMode === "folder_tree") return this.renderFolderTree3DView();
    if (this.currentMode === "folder_manager") return this.renderFolderManagerView();
    if (this.currentMode === "ar_camera") return this.renderARCameraView();
    if (this.currentMode === "gemini_embed") return this.renderGeminiEmbedView();
  }

  // =========================================================================
  // 1. CHẾ ĐỘ 1 (BÀI 7): PHÂN LOẠI & SẮP XẾP ĐỒ VẬT 3D
  // =========================================================================
  renderOrganize3DView() {
    const studyItems = this.items.filter(i => this.itemLocations[i.id] === "shelf_study");
    const toyItems = this.items.filter(i => this.itemLocations[i.id] === "shelf_toy");
    const techItems = this.items.filter(i => this.itemLocations[i.id] === "shelf_tech");
    const deskItems = this.items.filter(i => this.itemLocations[i.id] === "desk");

    const totalOrganized = 10 - deskItems.length;
    const progressPct = (totalOrganized / 10) * 100;

    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Cột Trái: Tủ Sách & Kệ Đồ 3 Tầng -->
        <div class="lg:col-span-2 space-y-4">
          <div class="glass-card p-5 border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 space-y-4 shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <span class="badge badge-cyan font-black text-[10px]">TỦ ĐỒ 3 TẦNG THÔNG MINH</span>
                <h3 class="text-base font-black text-slate-900 mt-0.5">🏢 KỆ TỦ PHÂN LOẠI GIA ĐÌNH & HỌC TẬP</h3>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold text-slate-500">Tiến độ sắp xếp:</span>
                <p class="text-sm font-black text-indigo-700">${totalOrganized} / 10 Món (${progressPct.toFixed(0)}%)</p>
              </div>
            </div>

            <!-- Thanh Progress Bar -->
            <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div class="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-700" style="width: ${progressPct}%"></div>
            </div>

            <!-- 3 Ngăn Tủ Trực Quan -->
            <div class="space-y-4 pt-2">
              <!-- TẦNG 1: NGĂN SÁCH VỞ & HỌC TẬP -->
              <div onclick="simulation3D.placeSelectedItem('shelf_study')" class="p-4 rounded-2xl border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50/50 space-y-2.5 cursor-pointer hover:border-blue-600 transition-all shadow-sm hover:shadow-md group relative">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl p-1.5 bg-blue-600 text-white rounded-xl shadow-md">📚</span>
                    <div>
                      <h4 class="font-black text-slate-900 text-xs md:text-sm group-hover:text-blue-700 transition-all">TẦNG 1: NGĂN SÁCH VỞ & ĐỒ DÙNG HỌC TẬP</h4>
                      <p class="text-[11px] text-slate-500 font-semibold">Chứa: Sách giáo khoa, vở ghi, hộp bút màu, thước kẻ...</p>
                    </div>
                  </div>
                  <span class="badge bg-blue-600 text-white text-[10px] font-black">${studyItems.length} Món</span>
                </div>

                <div class="min-h-[50px] p-2 bg-white/80 rounded-xl border border-blue-200 flex items-center gap-2 flex-wrap">
                  ${studyItems.length === 0 ? `
                    <span class="text-[11px] text-slate-400 italic px-2">Ngăn này đang trống. Hãy chọn sách vở từ bàn học xếp vào đây!</span>
                  ` : studyItems.map(item => `
                    <div class="px-2.5 py-1.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 font-black text-xs flex items-center gap-1.5 shadow-sm animate-pop">
                      <span>${item.icon}</span>
                      <span>${item.name}</span>
                      <button onclick="event.stopPropagation(); simulation3D.returnToDesk('${item.id}')" class="text-blue-400 hover:text-rose-600 font-bold ml-1" title="Lấy ra để lại bàn">✕</button>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- TẦNG 2: NGĂN ĐỒ CHƠI & THỂ THAO -->
              <div onclick="simulation3D.placeSelectedItem('shelf_toy')" class="p-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50/50 space-y-2.5 cursor-pointer hover:border-amber-600 transition-all shadow-sm hover:shadow-md group relative">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl p-1.5 bg-amber-600 text-white rounded-xl shadow-md">🧸</span>
                    <div>
                      <h4 class="font-black text-slate-900 text-xs md:text-sm group-hover:text-amber-700 transition-all">TẦNG 2: NGĂN ĐỒ CHƠI & DỤNG CỤ THỂ THAO</h4>
                      <p class="text-[11px] text-slate-500 font-semibold">Chứa: Ô tô đồ chơi, gấu bông, khối Rubik, bóng đá...</p>
                    </div>
                  </div>
                  <span class="badge bg-amber-600 text-white text-[10px] font-black">${toyItems.length} Món</span>
                </div>

                <div class="min-h-[50px] p-2 bg-white/80 rounded-xl border border-amber-200 flex items-center gap-2 flex-wrap">
                  ${toyItems.length === 0 ? `
                    <span class="text-[11px] text-slate-400 italic px-2">Ngăn này đang trống. Hãy chọn đồ chơi từ bàn học xếp vào đây!</span>
                  ` : toyItems.map(item => `
                    <div class="px-2.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs flex items-center gap-1.5 shadow-sm animate-pop">
                      <span>${item.icon}</span>
                      <span>${item.name}</span>
                      <button onclick="event.stopPropagation(); simulation3D.returnToDesk('${item.id}')" class="text-amber-400 hover:text-rose-600 font-bold ml-1" title="Lấy ra để lại bàn">✕</button>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- TẦNG 3: NGĂN THIẾT BỊ SỐ & TIN HỌC -->
              <div onclick="simulation3D.placeSelectedItem('shelf_tech')" class="p-4 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50/50 space-y-2.5 cursor-pointer hover:border-emerald-600 transition-all shadow-sm hover:shadow-md group relative">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl p-1.5 bg-emerald-600 text-white rounded-xl shadow-md">💾</span>
                    <div>
                      <h4 class="font-black text-slate-900 text-xs md:text-sm group-hover:text-emerald-700 transition-all">TẦNG 3: NGĂN THIẾT BỊ SỐ & PHỤ KIỆN MÁY TÍNH</h4>
                      <p class="text-[11px] text-slate-500 font-semibold">Chứa: Thẻ nhớ USB, chuột máy tính, tai nghe học tập...</p>
                    </div>
                  </div>
                  <span class="badge bg-emerald-600 text-white text-[10px] font-black">${techItems.length} Món</span>
                </div>

                <div class="min-h-[50px] p-2 bg-white/80 rounded-xl border border-emerald-200 flex items-center gap-2 flex-wrap">
                  ${techItems.length === 0 ? `
                    <span class="text-[11px] text-slate-400 italic px-2">Ngăn này đang trống. Hãy chọn thiết bị số từ bàn học xếp vào đây!</span>
                  ` : techItems.map(item => `
                    <div class="px-2.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-xs flex items-center gap-1.5 shadow-sm animate-pop">
                      <span>${item.icon}</span>
                      <span>${item.name}</span>
                      <button onclick="event.stopPropagation(); simulation3D.returnToDesk('${item.id}')" class="text-emerald-400 hover:text-rose-600 font-bold ml-1" title="Lấy ra để lại bàn">✕</button>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>

            ${totalOrganized === 10 ? `
              <div class="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl text-center space-y-2 animate-pop">
                <span class="text-4xl block animate-bounce">🎉</span>
                <h4 class="text-base font-black text-emerald-900">XUẤT SẮC! EM ĐÃ SẮP XẾP TOÀN BỘ 10 ĐỒ VẬT NGĂN NẮP!</h4>
                <p class="text-xs text-emerald-800">Tủ đồ của em giờ đây rất khoa học. Hãy chuyển sang <b>Thử Thách Tìm Kiếm</b> hoặc bật <b>Phòng Chiếu AR Camera</b> để chụp ảnh kỷ niệm nhé!</p>
                <div class="pt-1 flex items-center justify-center gap-2 flex-wrap">
                  <button onclick="simulation3D.switchMode('search_challenge')" class="btn btn-amber btn-sm font-black shadow-md">
                    ⏱️ Thử Thách Tìm Kiếm ➔
                  </button>
                  <button onclick="simulation3D.switchMode('ar_camera')" class="btn btn-rose btn-sm font-black shadow-md">
                    📷 Bật AR Chụp Ảnh Kỷ Niệm 📸
                  </button>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Cột Phải: Bàn Học Chứa Đồ Vật Cần Phân Loại -->
        <div class="space-y-4">
          <div class="glass-card p-5 border-2 border-amber-200 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 space-y-4 shadow-md">
            <div class="flex items-center justify-between">
              <span class="badge badge-amber font-black text-[10px]">BÀN HỌC BAN ĐẦU</span>
              <span class="font-bold text-slate-500 text-xs">Còn <b>${deskItems.length}</b> món</span>
            </div>

            <div>
              <h3 class="text-base font-black text-slate-900">🪑 ĐỒ VẬT TRÊN BÀN HỌC</h3>
              <p class="text-xs text-slate-500">Bấm chọn một món đồ dưới đây, rồi bấm vào <b>Ngăn Tủ Thích Hợp</b> ở bên trái:</p>
            </div>

            <!-- Lưới các món đồ trên bàn -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 max-h-96 overflow-y-auto pr-1">
              ${deskItems.length === 0 ? `
                <div class="text-center py-8 glass-card border-dashed text-slate-400 space-y-1">
                  <span class="text-3xl block">✨</span>
                  <p class="font-bold text-emerald-700 text-xs">Bàn học đã hoàn toàn gọn gàng sạch sẽ!</p>
                </div>
              ` : deskItems.map(item => {
                const isSelected = this.selectedItem?.id === item.id;
                return `
                  <div onclick="simulation3D.selectDeskItem('${item.id}')" class="p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected ? 'border-cyan-600 bg-cyan-50 shadow-md scale-102 ring-2 ring-cyan-300' : 'border-slate-200 bg-white hover:border-slate-400 shadow-sm'}">
                    <div class="flex items-center gap-2.5">
                      <span class="text-2xl p-1 bg-slate-100 rounded-xl">${item.icon}</span>
                      <div>
                        <h5 class="text-xs font-black text-slate-900 leading-tight">${item.name}</h5>
                        <p class="text-[10px] text-slate-500 line-clamp-1">${item.desc}</p>
                      </div>
                    </div>
                    ${isSelected ? `
                      <span class="badge bg-cyan-700 text-white text-[10px] font-black shrink-0 animate-pulse">Đang Chọn</span>
                    ` : `
                      <span class="text-xs text-slate-400 font-bold shrink-0">Chọn ➔</span>
                    `}
                  </div>
                `;
              }).join("")}
            </div>

            <!-- Nút Thao Tác Nhanh -->
            <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button onclick="simulation3D.autoSortAll()" class="btn btn-outline btn-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200">
                ✨ Tự Động Xếp Nhanh
              </button>
              <button onclick="simulation3D.resetAll()" class="btn btn-outline btn-xs font-bold text-slate-600 hover:bg-slate-200">
                🔄 Làm Lại
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  selectDeskItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      this.selectedItem = item;
      this.speak(`Em đã chọn: ${item.name}. Hãy xếp vào ngăn tủ thích hợp!`);
      window.app.showToast(`👉 Đã chọn: "${item.name}". Bấm vào Ngăn Tủ thích hợp!`, "info");
      this.render("main-content-area");
    }
  }

  placeSelectedItem(shelfId) {
    if (!this.selectedItem) {
      window.app.showToast("Vui lòng bấm chọn một món đồ trên bàn học trước!", "warning");
      return;
    }

    const item = this.selectedItem;
    if (item.targetShelf === shelfId) {
      this.itemLocations[item.id] = shelfId;
      this.selectedItem = null;
      this.score += 10;
      this.speak(`Chính xác! Đã xếp ${item.name} vào đúng ngăn!`);
      window.app.showToast(`✅ Chính xác! Đã xếp "${item.name}" vào đúng ngăn! (+10 Điểm)`, "success");

      if (this.getOrganizedCount() === 10) {
        setTimeout(() => {
          this.speak("Tuyệt vời! Em đã hoàn thành xuất sắc bài thí nghiệm sắp xếp 10 đồ vật!");
        }, 800);
      }

      this.render("main-content-area");
    } else {
      this.speak(`Chưa đúng rồi! ${item.name} không thuộc nhóm ngăn tủ này. Em hãy thử lại nhé!`);
      window.app.showToast(`❌ Chưa chính xác! "${item.name}" không thuộc nhóm ngăn tủ này.`, "error");
    }
  }

  returnToDesk(itemId) {
    this.itemLocations[itemId] = "desk";
    window.app.showToast("Đã chuyển đồ vật trở lại bàn học!", "info");
    this.render("main-content-area");
  }

  autoSortAll() {
    this.items.forEach(item => {
      this.itemLocations[item.id] = item.targetShelf;
    });
    this.selectedItem = null;
    this.score = 100;
    this.speak("Đã tự động sắp xếp toàn bộ 10 đồ vật vào đúng ngăn tủ!");
    window.app.showToast("✨ Đã tự động sắp xếp toàn bộ 10 đồ vật!", "success");
    this.render("main-content-area");
  }

  resetAll() {
    this.resetItemLocations();
    this.selectedItem = null;
    this.speak("Đã khôi phục trạng thái ban đầu!");
    window.app.showToast("🔄 Đã khôi phục trạng thái ban đầu!", "info");
    this.render("main-content-area");
  }

  // =========================================================================
  // 2. CHẾ ĐỘ 2 (BÀI 7): THỬ THÁCH TÌM KIẾM NHANH (SO SÁNH BỪA BỘN VS NGĂN NẮP)
  // =========================================================================
  renderSearchChallengeView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-lg">
        <div class="text-center space-y-2">
          <span class="badge badge-amber font-black text-xs">⏱️ THỰC NGHIỆM ĐO THỜI GIAN TÌM KIẾM</span>
          <h3 class="text-2xl font-black text-slate-900">THỬ THÁCH: BÀN HỌC BỪA BỘN vs TỦ ĐỒ NGĂN NẮP</h3>
          <p class="text-xs text-slate-600 max-w-xl mx-auto">
            Cùng làm thí nghiệm đo xem việc sắp xếp ngăn nắp giúp em tìm thấy đồ vật nhanh hơn gấp bao nhiêu lần!
          </p>
        </div>

        <!-- Mục tiêu tìm kiếm -->
        <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-4xl p-2 bg-blue-600 text-white rounded-2xl shadow-md">🎯</span>
            <div>
              <span class="badge bg-blue-600 text-white font-black text-[10px]">MỤC TIÊU CẦN TÌM</span>
              <h4 class="text-base font-black text-slate-900 mt-0.5">Sách Giáo Khoa Tin Học Lớp 3 📘</h4>
              <p class="text-xs text-slate-500 font-semibold">Em cần lấy sách ngay để bắt đầu tiết học Tin học!</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="simulation3D.testScenario('messy')" class="btn btn-outline btn-sm font-black text-rose-700 border-rose-300 bg-rose-50 hover:bg-rose-100 flex items-center gap-1">
              <span>😵</span> <span>Thử Trường Hợp 1: Bừa Bộn</span>
            </button>
            <button onclick="simulation3D.testScenario('organized')" class="btn btn-primary btn-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-md">
              <span>✨</span> <span>Thử Trường Hợp 2: Ngăn Nắp</span>
            </button>
          </div>
        </div>

        <!-- Bảng So Sánh -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-5 rounded-2xl border-2 ${this.searchScenario === 'messy' ? 'border-rose-500 bg-rose-50/50 shadow-lg ring-2 ring-rose-200' : 'border-slate-200 bg-slate-50'} space-y-4 transition-all">
            <div class="flex items-center justify-between">
              <span class="badge bg-rose-600 text-white font-black text-xs">TRƯỜNG HỢP 1: BỪA BỘN</span>
              <span class="text-xs font-bold text-rose-700">⏱️ Thời gian: <b>18 Giây</b></span>
            </div>

            <div class="space-y-2 text-xs text-slate-700">
              <div class="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                <p class="font-bold text-rose-900">• Tình trạng:</p>
                <p>Sách vở, đồ chơi, bóng đá, dây sạc vứt lộn xộn lẫn lộn trên bàn và dưới đất.</p>
              </div>
              <div class="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                <p class="font-bold text-rose-900">• Quá trình tìm kiếm:</p>
                <p>Phải lật từng chiếc áo, nhặt từng món đồ chơi, tìm khắp phòng mất rất nhiều công sức.</p>
              </div>
              <div class="p-3 bg-rose-100/70 rounded-xl border border-rose-300 font-bold text-rose-900">
                ❌ Kết quả: <b>Mất 18 giây</b>, muộn giờ học và mệt mỏi!
              </div>
            </div>
          </div>

          <div class="p-5 rounded-2xl border-2 ${this.searchScenario === 'organized' ? 'border-emerald-500 bg-emerald-50/50 shadow-lg ring-2 ring-emerald-200' : 'border-slate-200 bg-slate-50'} space-y-4 transition-all">
            <div class="flex items-center justify-between">
              <span class="badge bg-emerald-600 text-white font-black text-xs">TRƯỜNG HỢP 2: ĐÃ SẮP XẾP</span>
              <span class="text-xs font-bold text-emerald-700">⏱️ Thời gian: <b>1 Giây (Tức thì)</b></span>
            </div>

            <div class="space-y-2 text-xs text-slate-700">
              <div class="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                <p class="font-bold text-emerald-900">• Tình trạng:</p>
                <p>Đã xếp toàn bộ sách vở vào đúng <b>Tầng 1: Ngăn Sách Vở</b> trên giá sách.</p>
              </div>
              <div class="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                <p class="font-bold text-emerald-900">• Quá trình tìm kiếm:</p>
                <p>Chỉ cần nhìn thẳng vào ngăn Tầng 1 và rút ngay cuốn Sách Tin Học 3 ra một cách chính xác.</p>
              </div>
              <div class="p-3 bg-emerald-100/70 rounded-xl border border-emerald-300 font-bold text-emerald-900">
                ✅ Kết quả: <b>Chỉ 1 giây</b>, chuẩn bị bài chu đáo, đạt điểm 10!
              </div>
            </div>
          </div>
        </div>

        <div class="p-5 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border-2 border-amber-300 space-y-2 text-center">
          <span class="text-3xl block">🏆</span>
          <h4 class="text-base font-black text-amber-950 uppercase">KẾT LUẬN SƯ PHẠM BÀI 7 (GDPT 2018)</h4>
          <p class="text-xs md:text-sm text-amber-900 font-bold max-w-2xl mx-auto leading-relaxed">
            "Sắp xếp đồ vật hợp lý và ngăn nắp giúp chúng ta <b>tìm kiếm đồ vật một cách nhanh chóng, dễ dàng và tiết kiệm thời gian</b>!"
          </p>
        </div>
      </div>
    `;
  }

  testScenario(scenario) {
    this.searchScenario = scenario;
    if (scenario === "messy") {
      this.speak("Trường hợp 1: Bàn học bừa bộn khiến em phải mất tới 18 giây mới tìm thấy sách!");
      window.app.showToast("😵 Trường hợp 1: Bàn học lộn xộn khiến em mất 18 giây!", "warning");
    } else {
      this.speak("Trường hợp 2: Khi đã sắp xếp vào ngăn tủ, em tìm thấy sách ngay trong 1 giây!");
      window.app.showToast("🎉 Trường hợp 2: Khi đã sắp xếp, em tìm thấy sách ngay trong 1 giây!", "success");
    }
    this.render("main-content-area");
  }

  // =========================================================================
  // 3. CHẾ ĐỘ (BÀI 8): MÀN HÌNH MÁY TÍNH DESKTOP & QUẢN LÝ THƯ MỤC ẢO
  // =========================================================================
  renderFolderManagerView() {
    return `
      <div class="space-y-6">
        <!-- Khung Màn Hình Desktop Ảo (Virtual Desktop Simulator) -->
        <div class="glass-card p-6 border-2 border-purple-300 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-2xl space-y-5">
          <!-- Thanh Tiêu Đề Cửa Sổ Windows Explorer -->
          <div class="flex items-center justify-between pb-3 border-b border-white/20">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span class="text-xs font-bold text-slate-300 ml-2">💽 File Explorer - This PC ➔ Ổ Đĩa D: \\ HocTap</span>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="simulation3D.addNewFolder()" class="btn btn-emerald btn-xs font-black shadow-md flex items-center gap-1">
                <span>➕</span> <span>Tạo Thư Mục Mới</span>
              </button>
            </div>
          </div>

          <!-- Danh sách các Thư mục (Folders) trên Ổ đĩa D: -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-cyan-300 font-bold">
              <span>📁 CÁC THƯ MỤC TRONG Ổ ĐĨA D:\\HocTap:</span>
              <span>Bấm vào thư mục để phân loại tệp tin</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              ${this.lesson8Folders.map(folder => `
                <div onclick="simulation3D.placeFileIntoFolder('${folder.id}')" class="p-4 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-cyan-400 transition-all cursor-pointer space-y-3 group">
                  <div class="flex items-center justify-between">
                    <span class="text-3xl group-hover:scale-110 transition-all">${folder.icon}</span>
                    <span class="badge bg-cyan-600 text-white text-[10px] font-black">${folder.files.length} Tệp</span>
                  </div>

                  <div>
                    <h4 class="font-black text-sm text-amber-300 group-hover:text-cyan-200 transition-all">${folder.name}</h4>
                    <p class="text-[10px] text-slate-300">Thư mục con</p>
                  </div>

                  <!-- Danh sách file trong folder -->
                  <div class="space-y-1 pt-1 border-t border-white/10">
                    ${folder.files.map(f => `
                      <div class="text-[10px] text-slate-200 flex items-center gap-1 truncate">
                        <span>📄</span> <span>${f}</span>
                      </div>
                    `).join("")}
                  </div>

                  <div class="pt-2 flex items-center justify-between text-[10px]">
                    <button onclick="event.stopPropagation(); simulation3D.renameFolder('${folder.id}')" class="text-cyan-300 hover:underline">✏️ Đổi tên</button>
                    <button onclick="event.stopPropagation(); simulation3D.deleteFolder('${folder.id}')" class="text-rose-400 hover:underline">🗑️ Xóa</button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Danh sách tệp tin chưa được phân loại -->
          <div class="p-4 bg-white/10 rounded-2xl border border-white/20 space-y-3">
            <div class="flex items-center justify-between">
              <span class="badge badge-amber font-black text-xs">📄 CÁC TỆP TIN CẦN PHÂN LOẠI VÀO THƯ MỤC</span>
              <span class="text-xs text-slate-300">Còn <b>${this.lesson8UnsortedFiles.length}</b> tệp tin</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              ${this.lesson8UnsortedFiles.length === 0 ? `
                <div class="col-span-full text-center py-4 text-emerald-300 font-bold text-xs">
                  🎉 Xuất sắc! Toàn bộ tệp tin đã được xếp gọn gàng vào các thư mục!
                </div>
              ` : this.lesson8UnsortedFiles.map(file => {
                const isSelected = this.selectedFile?.id === file.id;
                return `
                  <div onclick="simulation3D.selectUnsortedFile('${file.id}')" class="p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected ? 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-300' : 'border-white/20 bg-white/5 hover:bg-white/15'}">
                    <div class="flex items-center gap-2">
                      <span class="text-xl">${file.icon}</span>
                      <div>
                        <p class="text-xs font-bold text-white truncate max-w-[130px]">${file.name}</p>
                        <p class="text-[9px] text-slate-400">${file.desc}</p>
                      </div>
                    </div>
                    ${isSelected ? `
                      <span class="badge bg-amber-400 text-slate-950 text-[9px] font-black animate-pulse">Chọn</span>
                    ` : ''}
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  addNewFolder() {
    const folderName = prompt("Nhập tên thư mục mới cần tạo (ví dụ: AmNhac, MyThuat, AnhVan):");
    if (!folderName || !folderName.trim()) return;

    const newFolder = {
      id: "folder_" + Date.now(),
      name: folderName.trim(),
      icon: "📁",
      color: "cyan",
      files: []
    };

    this.lesson8Folders.push(newFolder);
    this.speak(`Đã tạo thư mục mới có tên là ${folderName}!`);
    window.app.showToast(`📁 Đã tạo thư mục mới: "${folderName}"!`, "success");
    this.render("main-content-area");
  }

  renameFolder(folderId) {
    const folder = this.lesson8Folders.find(f => f.id === folderId);
    if (!folder) return;

    const newName = prompt(`Nhập tên mới cho thư mục "${folder.name}":`, folder.name);
    if (!newName || !newName.trim()) return;

    folder.name = newName.trim();
    this.speak(`Đã đổi tên thư mục thành ${folder.name}!`);
    window.app.showToast(`✏️ Đã đổi tên thư mục thành: "${folder.name}"!`, "success");
    this.render("main-content-area");
  }

  deleteFolder(folderId) {
    if (this.lesson8Folders.length <= 1) {
      window.app.showToast("Cần giữ lại ít nhất 1 thư mục mẫu!", "warning");
      return;
    }
    this.lesson8Folders = this.lesson8Folders.filter(f => f.id !== folderId);
    this.speak("Đã xóa thư mục!");
    window.app.showToast("🗑️ Đã xóa thư mục!", "info");
    this.render("main-content-area");
  }

  selectUnsortedFile(fileId) {
    const file = this.lesson8UnsortedFiles.find(f => f.id === fileId);
    if (file) {
      this.selectedFile = file;
      this.speak(`Em đã chọn tệp: ${file.name}. Hãy bấm vào Thư mục thích hợp ở trên!`);
      window.app.showToast(`👉 Đã chọn tệp: "${file.name}". Bấm vào Thư mục thích hợp!`, "info");
      this.render("main-content-area");
    }
  }

  placeFileIntoFolder(folderId) {
    if (!this.selectedFile) {
      window.app.showToast("Vui lòng bấm chọn một tệp tin ở dưới trước!", "warning");
      return;
    }

    const folder = this.lesson8Folders.find(f => f.id === folderId);
    const file = this.selectedFile;

    if (folder) {
      folder.files.push(file.name);
      this.lesson8UnsortedFiles = this.lesson8UnsortedFiles.filter(f => f.id !== file.id);
      this.selectedFile = null;
      this.speak(`Chính xác! Đã di chuyển tệp ${file.name} vào thư mục ${folder.name}!`);
      window.app.showToast(`✅ Đã di chuyển tệp "${file.name}" vào thư mục "${folder.name}"!`, "success");
      this.render("main-content-area");
    }
  }

  // =========================================================================
  // 4. CHẾ ĐỘ: CÂY THƯ MỤC MÁY TÍNH 3D (FOLDER TREE)
  // =========================================================================
  renderFolderTree3DView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-lg">
        <div class="text-center space-y-2">
          <span class="badge badge-emerald font-black text-xs">💻 CHUYỂN ĐỔI TỪ ĐỜI THỰC SANG MÁY TÍNH</span>
          <h3 class="text-2xl font-black text-slate-900">CÂY THƯ MỤC & TỆP TIN TRONG MÁY TÍNH</h3>
          <p class="text-xs text-slate-600 max-w-xl mx-auto">
            Trong máy tính, các <b>Thư Mục (Folder)</b> giống như các <b>Ngăn Tủ</b> để sắp xếp và lưu trữ các <b>Tệp Tin (Files)</b>!
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Cột 1: Ngoài Đời Thực -->
          <div class="p-5 rounded-2xl border-2 border-blue-300 bg-blue-50/50 space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl p-1.5 bg-blue-600 text-white rounded-xl">🏠</span>
              <h4 class="font-black text-slate-900 text-sm">NGOÀI ĐỜI THỰC: TỦ ĐỒ 3 TẦNG</h4>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between">
                <span class="font-bold">🏢 Tủ đồ gia đình</span>
                <span class="badge badge-cyan font-black text-[10px]">Tủ chứa đồ</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between ml-4">
                <span>📚 Ngăn 1: Sách Vở Học Tập</span>
                <span class="text-slate-500 font-semibold">Chứa SGK, Vở</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between ml-4">
                <span>🧸 Ngăn 2: Đồ Chơi Thể Thao</span>
                <span class="text-slate-500 font-semibold">Chứa Xe, Bóng</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between ml-4">
                <span>💾 Ngăn 3: Thiết Bị Số</span>
                <span class="text-slate-500 font-semibold">Chứa USB, Chuột</span>
              </div>
            </div>
          </div>

          <!-- Cột 2: Trong Máy Tính -->
          <div class="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl p-1.5 bg-emerald-600 text-white rounded-xl">💻</span>
              <h4 class="font-black text-slate-900 text-sm">TRONG MÁY TÍNH: CÂY THƯ MỤC (D:\)</h4>
            </div>

            <div class="space-y-2.5 text-xs font-mono">
              <div class="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between font-bold text-slate-900">
                <span>💽 Ổ Đĩa D: (Data)</span>
                <span class="badge badge-emerald font-black text-[10px]">Ổ đĩa gốc</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between ml-4 text-blue-800 font-bold">
                <span>📁 D:\\HocTap\\TinHoc3\\</span>
                <span class="text-[10px] bg-blue-100 px-2 py-0.5 rounded text-blue-900">Thư mục con</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between ml-4 text-amber-800 font-bold">
                <span>📁 D:\\GiaiTri\\TroChoi\\</span>
                <span class="text-[10px] bg-amber-100 px-2 py-0.5 rounded text-amber-900">Thư mục con</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between ml-4 text-emerald-800 font-bold">
                <span>📁 D:\\LuuTru\\TaiLieu\\</span>
                <span class="text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">Thư mục con</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 5. CHẾ ĐỘ: PHÒNG CHIẾU AR THỰC TẾ ẢO (WEB AR CAMERA & CAPTURE)
  // =========================================================================
  renderARCameraView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-xl">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="badge bg-rose-600 text-white font-black text-xs">📷 WEB AR VIRTUAL CLASSROOM</span>
            <h3 class="text-2xl font-black text-slate-900 mt-1">PHÒNG CHIẾU THỰC TẾ ẢO AR</h3>
            <p class="text-xs text-slate-500">Chiếu Kệ Tủ 3D ảo lơ lửng ngay trong không gian phòng học thực tế của em qua Camera!</p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="simulation3D.captureARSnapshot()" class="btn btn-rose btn-md font-black shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
              <span>📸</span> <span>Chụp Ảnh Lưu Niệm</span>
            </button>
            <button onclick="simulation3D.stopARCamera()" class="btn btn-outline btn-sm font-bold text-slate-600">
              ✕ Tắt Camera
            </button>
          </div>
        </div>

        <!-- Khung Camera AR Viewport -->
        <div class="relative w-full h-[450px] bg-slate-950 rounded-3xl overflow-hidden border-4 border-rose-400 shadow-2xl flex items-center justify-center">
          <video id="ar-video-stream" autoplay playsinline muted class="w-full h-full object-cover"></video>

          <!-- Lớp phủ 3D Kệ Tủ & Đồ Vật Ảo -->
          <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
            <!-- Header AR Badge -->
            <div class="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white font-black text-xs flex items-center gap-2 border border-white/20">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>AR MODE ACTIVE • TIN HỌC LỚP 3</span>
            </div>

            <!-- Mô hình Kệ Tủ 3D lơ lửng -->
            <div class="w-full max-w-md bg-white/25 backdrop-blur-xl p-4 rounded-3xl border-2 border-white/50 text-white shadow-2xl space-y-2 animate-float">
              <div class="flex items-center justify-between border-b border-white/30 pb-1.5">
                <span class="font-black text-xs text-amber-300">🏢 TỦ ĐỒ THÔNG MINH 3D</span>
                <span class="badge bg-emerald-500 text-white text-[9px] font-black">100% Gọn Gàng</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center text-xs">
                <div class="bg-blue-600/60 p-2 rounded-xl border border-white/30">
                  <span class="text-xl block">📚</span>
                  <span class="text-[10px] font-bold">Tầng 1: Sách</span>
                </div>
                <div class="bg-amber-600/60 p-2 rounded-xl border border-white/30">
                  <span class="text-xl block">🧸</span>
                  <span class="text-[10px] font-bold">Tầng 2: Đồ Chơi</span>
                </div>
                <div class="bg-emerald-600/60 p-2 rounded-xl border border-white/30">
                  <span class="text-xl block">💾</span>
                  <span class="text-[10px] font-bold">Tầng 3: Thiết Bị</span>
                </div>
              </div>
            </div>

            <!-- Khung ngắm chụp ảnh -->
            <div class="text-center text-white/80 text-[11px] font-bold bg-black/40 px-3 py-1 rounded-full">
              ✨ Hãy tạo dáng cùng tủ đồ 3D và bấm nút Chụp Ảnh để lưu niệm!
            </div>
          </div>
        </div>

        <!-- Ảnh vừa chụp lưu niệm -->
        <div id="ar-snapshot-result" class="hidden p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🎉</span>
            <div>
              <h5 class="font-black text-emerald-900 text-sm">ĐÃ CHỤP ẢNH LƯU NIỆM THÀNH CÔNG!</h5>
              <p class="text-xs text-emerald-700">Ảnh đã được lưu lại để Thầy Cô tuyên dương trước lớp.</p>
            </div>
          </div>
          <button onclick="simulation3D.downloadSnapshot()" class="btn btn-emerald btn-sm font-black shadow-md">
            📥 Tải Ảnh Về Máy (.png)
          </button>
        </div>
      </div>
    `;
  }

  async startARCamera() {
    const video = document.getElementById("ar-video-stream");
    if (!video) return;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.arStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        video.srcObject = this.arStream;
      } else {
        window.app.showToast("Trình duyệt không hỗ trợ Camera Web AR!", "warning");
      }
    } catch (e) {
      console.warn("Không thể mở camera:", e);
      window.app.showToast("Vui lòng cấp quyền mở Camera để trải nghiệm AR!", "info");
    }
  }

  stopARCamera() {
    if (this.arStream) {
      this.arStream.getTracks().forEach(track => track.stop());
      this.arStream = null;
    }
    this.switchMode("organize");
  }

  captureARSnapshot() {
    this.speak("Tách! Chúc mừng em đã có bức ảnh lưu niệm tuyệt đẹp!");
    window.app.showToast("📸 Đã chụp ảnh lưu niệm thành công!", "success");
    const resultBox = document.getElementById("ar-snapshot-result");
    if (resultBox) resultBox.classList.remove("hidden");
  }

  downloadSnapshot() {
    window.app.showToast("📥 Đang tải ảnh kỷ niệm về máy...", "success");
  }

  // =========================================================================
  // 6. CHẾ ĐỘ: NHÚNG BẢN GỐC GEMINI AI
  // =========================================================================
  renderGeminiEmbedView() {
    return `
      <div class="glass-card p-6 space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 bg-purple-600 text-white rounded-2xl shadow-md">✨</span>
            <div>
              <span class="badge bg-purple-600 text-white font-black text-[10px]">GOOGLE GEMINI SHARE</span>
              <h3 class="text-base font-black text-slate-900 mt-0.5">Thí Nghiệm 3D: Tin Học Lớp 3 - Bài 7: Sắp Xếp Để Dễ Tìm</h3>
              <p class="text-xs text-purple-800 font-semibold">Nguồn liên kết: https://share.gemini.google/NLLCPUG04S6G</p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <a href="https://share.gemini.google/NLLCPUG04S6G" target="_blank" class="btn btn-primary btn-sm font-black bg-purple-700 hover:bg-purple-800 text-white shadow-md flex items-center gap-1.5">
              <span>↗️</span> <span>Mở Tab Mới Toàn Màn Hình</span>
            </a>
          </div>
        </div>

        <div class="border-2 border-purple-200 rounded-2xl overflow-hidden shadow-lg bg-white relative" style="height: 600px;">
          <iframe 
            src="https://share.gemini.google/NLLCPUG04S6G" 
            class="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy">
          </iframe>
        </div>
      </div>
    `;
  }

  openFullScreenModal() {
    const modal = document.getElementById("simulation-3d-modal");
    if (modal) modal.classList.add("active");
  }

  openLessonPlanModal() {
    window.location.hash = "teacher";
    window.app.showToast("👩‍🏫 Đã chuyển sang Portal Giáo Viên để soạn hoặc xem Kế hoạch bài dạy CV 2345!", "info");
  }
}

window.simulation3D = new Simulation3D();
