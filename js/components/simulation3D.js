/**
 * SIMULATION 3D COMPONENT - PHÒNG THÍ NGHIỆM 3D TIN HỌC TIỂU HỌC
 * Bài học: Tin học Lớp 3 - Bài 7: Sắp Xếp Để Dễ Tìm (Chủ đề C - GDPT 2018)
 * Liên kết tham khảo gốc: https://share.gemini.google/NLLCPUG04S6G
 *
 * Tính năng chính:
 * 1. 🌐 Không gian 3D tương tác mô phỏng Kệ Sách / Tủ Đồ 3 Tầng & Bàn Học
 * 2. 🎮 Chế độ 1: Thí nghiệm Phân loại & Sắp xếp 10 đồ vật vào đúng ngăn tủ
 * 3. ⏱️ Chế độ 2: Thử thách Tìm kiếm Nhanh (So sánh: Bừa bộn vs Ngăn nắp)
 * 4. 💻 Chế độ 3: Chuyển đổi trực quan sang Cây Thư Mục Máy Tính (Folder Tree)
 * 5. 🔗 Nhúng liên kết và mở trực tiếp https://share.gemini.google/NLLCPUG04S6G
 */

class Simulation3D {
  constructor() {
    this.currentMode = "organize"; // 'organize' | 'search_challenge' | 'folder_tree' | 'gemini_embed'
    this.selectedItem = null;
    this.score = 0;
    this.starsEarned = 0;
    this.searchTimer = 0;
    this.searchInterval = null;
    this.targetSearchItem = null;
    this.searchScenario = "organized"; // 'messy' | 'organized'
    this.messyFoundCount = 0;

    // Danh sách 10 đồ vật 3D trong bài học
    this.items = [
      { id: "item_book_tinhoc", name: "Sách Giáo Khoa Tin Học 3", icon: "📘", category: "study", targetShelf: "shelf_study", color: "#2563eb", desc: "Sách học môn Tin học lớp 3 bộ sách Kết Nối Tri Thức" },
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

    // Trạng thái vị trí các đồ vật: 'desk' | 'shelf_study' | 'shelf_toy' | 'shelf_tech'
    this.itemLocations = {};
    this.resetItemLocations();
  }

  resetItemLocations() {
    this.items.forEach(item => {
      this.itemLocations[item.id] = "desk";
    });
    this.score = 0;
  }

  // Khởi tạo và render giao diện Thí nghiệm 3D
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6 animate-pop">
        <!-- Banner Thí Nghiệm 3D Rực Rỡ -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge badge-amber font-black">🧪 PHÒNG THÍ NGHIỆM 3D ẢO</span>
              <span class="badge bg-white/20 text-white font-bold">TIN HỌC LỚP 3 • BÀI 7: SẮP XẾP ĐỂ DỄ TÌM</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">THÍ NGHIỆM 3D: SẮP XẾP ĐỂ DỄ TÌM</h2>
            <p class="text-cyan-100 text-xs md:text-sm">Trực quan hóa quy tắc phân loại đồ vật, thử thách tìm kiếm và chuyển đổi sang cây thư mục máy tính</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <a href="https://share.gemini.google/NLLCPUG04S6G" target="_blank" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md hover:scale-105 transition-all" title="Mở trang chia sẻ Google Gemini gốc trong tab mới">
              <span>✨</span> <span>Mở Link Gốc Gemini</span>
            </a>
            <button onclick="simulation3D.switchMode('gemini_embed')" class="btn ${this.currentMode === 'gemini_embed' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/20 text-white'} text-xs py-2.5 px-3.5 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-md">
              <span>🔗</span> <span>Xem Nhúng Gemini</span>
            </button>
            <button onclick="simulation3D.openFullScreenModal()" class="btn btn-amber btn-sm font-black shadow-xl flex items-center gap-1.5 hover:scale-105 transition-all">
              <span>📺</span> <span>Toàn Màn Hình 3D</span>
            </button>
          </div>
        </div>

        <!-- Thanh 4 Tab Chuyển Đổi Chế Độ Thí Nghiệm -->
        <div class="flex items-center gap-2.5 border-b border-slate-200 pb-2 flex-wrap">
          <button onclick="simulation3D.switchMode('organize')" class="px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentMode === 'organize' ? 'bg-cyan-700 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <span>🎮 1. Thí Nghiệm Phân Loại 3D</span>
            <span class="badge ${this.currentMode === 'organize' ? 'bg-white/25 text-white' : 'badge-cyan'} text-[10px]">${this.getOrganizedCount()}/10 Đã xếp</span>
          </button>
          
          <button onclick="simulation3D.switchMode('search_challenge')" class="px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentMode === 'search_challenge' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <span>⏱️ 2. Thử Thách Tìm Kiếm Nhanh</span>
            <span class="badge ${this.currentMode === 'search_challenge' ? 'bg-white/25 text-white' : 'badge-amber'} text-[10px]">So Sánh</span>
          </button>

          <button onclick="simulation3D.switchMode('folder_tree')" class="px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentMode === 'folder_tree' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <span>💻 3. Cây Thư Mục Máy Tính 3D</span>
            <span class="badge ${this.currentMode === 'folder_tree' ? 'bg-white/25 text-white' : 'badge-emerald'} text-[10px]">Tin Học 3</span>
          </button>

          <button onclick="simulation3D.switchMode('gemini_embed')" class="px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentMode === 'gemini_embed' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <span>✨ 4. Bản Gốc Gemini AI</span>
          </button>
        </div>

        <!-- Khung Nội Dung Chính Của Thí Nghiệm -->
        <div id="sim-main-viewport" class="space-y-6">
          ${this.renderCurrentModeView()}
        </div>
      </div>
    `;
  }

  getOrganizedCount() {
    return Object.values(this.itemLocations).filter(loc => loc !== "desk").length;
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (mode === "search_challenge") {
      this.initSearchChallenge();
    }
    this.render("main-content-area");
  }

  // Render view theo mode hiện tại
  renderCurrentModeView() {
    if (this.currentMode === "organize") {
      return this.renderOrganize3DView();
    } else if (this.currentMode === "search_challenge") {
      return this.renderSearchChallengeView();
    } else if (this.currentMode === "folder_tree") {
      return this.renderFolderTree3DView();
    } else if (this.currentMode === "gemini_embed") {
      return this.renderGeminiEmbedView();
    }
  }

  // =========================================================================
  // 1. CHẾ ĐỘ 1: THÍ NGHIỆM PHÂN LOẠI & SẮP XẾP ĐỒ VẬT 3D (3D VIRTUAL LAB)
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
        <!-- Cột Trái: Tủ Sách & Kệ Đồ 3 Tầng 3D -->
        <div class="lg:col-span-2 space-y-4">
          <div class="glass-card p-5 border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 space-y-4">
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

            <!-- 3 Ngăn Tủ 3D Trực Quan -->
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

                <!-- Các món đồ trong ngăn 1 -->
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

                <!-- Các món đồ trong ngăn 2 -->
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

                <!-- Các món đồ trong ngăn 3 -->
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
                <p class="text-xs text-emerald-800">Tủ đồ của em giờ đây rất khoa học và dễ tìm. Hãy chuyển sang <b>Chế độ 2: Thử Thách Tìm Kiếm Nhanh</b> để so sánh tốc độ nhé!</p>
                <div class="pt-1 flex items-center justify-center gap-2">
                  <button onclick="simulation3D.switchMode('search_challenge')" class="btn btn-amber btn-sm font-black shadow-md">
                    ⏱️ Bắt Đầu Thử Thách Tìm Kiếm Ngay ➔
                  </button>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Cột Phải: Bàn Học Chứa Đồ Vật Cần Phân Loại -->
        <div class="space-y-4">
          <div class="glass-card p-5 border-2 border-amber-200 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 space-y-4">
            <div class="flex items-center justify-between">
              <span class="badge badge-amber font-black text-[10px]">BÀN HỌC BAN ĐẦU</span>
              <span class="font-bold text-slate-500 text-xs">Còn <b>${deskItems.length}</b> món chưa xếp</span>
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

            <!-- Nút Khôi Phục Lại Ban Đầu -->
            <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button onclick="simulation3D.autoSortAll()" class="btn btn-outline btn-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200" title="Tự động xếp nhanh toàn bộ vào đúng ngăn">
                ✨ Tự Động Sắp Xếp Nhanh
              </button>
              <button onclick="simulation3D.resetAll()" class="btn btn-outline btn-xs font-bold text-slate-600 hover:bg-slate-200">
                🔄 Làm Lại
              </button>
            </div>
          </div>

          <!-- Card Ghi Nhớ Kiến Thức Sư Phạm (GDPT 2018) -->
          <div class="glass-card p-4 border-l-4 border-amber-500 bg-amber-50/50 space-y-1.5 text-xs">
            <h5 class="font-extrabold text-amber-950 flex items-center gap-1.5">
              <span>💡</span> <span>BÀI HỌC CỐT LÕI (BÀI 7 - TIN HỌC 3):</span>
            </h5>
            <p class="text-amber-900 leading-relaxed">
              • Sắp xếp các đồ vật cùng loại (sách vở, đồ chơi, thiết bị...) vào cùng một nơi giúp không gian gọn gàng và <b>tìm kiếm nhanh chóng</b> khi cần!
            </p>
          </div>
        </div>
      </div>
    `;
  }

  selectDeskItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      this.selectedItem = item;
      window.app.showToast(`👉 Đã chọn: "${item.name}". Hãy bấm vào Ngăn Tủ thích hợp!`, "info");
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
      window.app.showToast(`✅ Chính xác! Đã xếp "${item.name}" vào đúng ngăn tủ! (+10 Điểm)`, "success");
      this.render("main-content-area");
    } else {
      window.app.showToast(`❌ Chưa chính xác! "${item.name}" không thuộc nhóm ngăn tủ này. Em hãy thử lại!`, "error");
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
    window.app.showToast("✨ Đã tự động sắp xếp toàn bộ 10 đồ vật vào đúng ngăn tủ!", "success");
    this.render("main-content-area");
  }

  resetAll() {
    this.resetItemLocations();
    this.selectedItem = null;
    window.app.showToast("🔄 Đã khôi phục trạng thái ban đầu!", "info");
    this.render("main-content-area");
  }

  // =========================================================================
  // 2. CHẾ ĐỘ 2: THỬ THÁCH TÌM KIẾM NHANH (SO SÁNH BỪA BỘN VS NGĂN NẮP)
  // =========================================================================
  initSearchChallenge() {
    this.targetSearchItem = this.items[0]; // Sách Tin học 3
    this.searchTimer = 0;
    this.searchScenario = "organized";
    this.messyFoundCount = 0;
  }

  renderSearchChallengeView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
        <div class="text-center space-y-2">
          <span class="badge badge-amber font-black text-xs">⏱️ THỰC NGHIỆM ĐO THỜI GIAN TÌM KIẾM</span>
          <h3 class="text-2xl font-black text-slate-900">THỬ THÁCH: BÀN HỌC BỪA BỘN vs TỦ ĐỒ NGĂN NẮP</h3>
          <p class="text-xs text-slate-600 max-w-xl mx-auto">
            Hãy cùng làm thí nghiệm đo xem việc sắp xếp đồ vật ngăn nắp giúp em tìm thấy đồ vật nhanh hơn gấp bao nhiêu lần!
          </p>
        </div>

        <!-- Nhiệm vụ tìm kiếm -->
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

        <!-- Bảng So Sánh Trực Quan Kết Quả Thí Nghiệm -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Trường Hợp 1: Bừa Bộn -->
          <div class="p-5 rounded-2xl border-2 ${this.searchScenario === 'messy' ? 'border-rose-500 bg-rose-50/50 shadow-lg ring-2 ring-rose-200' : 'border-slate-200 bg-slate-50'} space-y-4 transition-all">
            <div class="flex items-center justify-between">
              <span class="badge bg-rose-600 text-white font-black text-xs">TRƯỜNG HỢP 1: BỪA BỘN</span>
              <span class="text-xs font-bold text-rose-700">⏱️ Thời gian: <b>15 - 20 Giây</b></span>
            </div>

            <div class="space-y-2 text-xs text-slate-700">
              <div class="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                <p class="font-bold text-rose-900">• Tình trạng:</p>
                <p>Sách vở, đồ chơi, bóng đá, dây sạc vứt lộn xộn lẫn lộn trên bàn và dưới đất.</p>
              </div>
              <div class="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                <p class="font-bold text-rose-900">• Quá trình tìm kiếm:</p>
                <p>Phải lật từng chiếc áo, nhặt từng món đồ chơi, tìm khắp phòng mất rất nhiều công sức và bực bội.</p>
              </div>
              <div class="p-3 bg-rose-100/70 rounded-xl border border-rose-300 font-bold text-rose-900">
                ❌ Kết quả: <b>Mất 18 giây</b>, muộn giờ học và mệt mỏi!
              </div>
            </div>
          </div>

          <!-- Trường Hợp 2: Ngăn Nắp -->
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
                <p>Chỉ cần nhìn thẳng vào ngăn Tầng 1 và rút ngay cuốn Sách Tin Học 3 ra một cách chính xác tuyệt đối.</p>
              </div>
              <div class="p-3 bg-emerald-100/70 rounded-xl border border-emerald-300 font-bold text-emerald-900">
                ✅ Kết quả: <b>Chỉ 1 giây</b>, chuẩn bị bài chu đáo, đạt điểm 10!
              </div>
            </div>
          </div>
        </div>

        <!-- Kết luận sư phạm rút ra -->
        <div class="p-5 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border-2 border-amber-300 space-y-2 text-center">
          <span class="text-3xl block">🏆</span>
          <h4 class="text-base font-black text-amber-950 uppercase">KẾT LUẬN THÍ NGHIỆM BÀI 7 (GDPT 2018)</h4>
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
      window.app.showToast("😵 Trường hợp 1: Bàn học lộn xộn khiến em phải mất tới 18 giây mới tìm thấy sách!", "warning");
    } else {
      window.app.showToast("🎉 Trường hợp 2: Khi đã sắp xếp vào ngăn tủ, em tìm thấy sách ngay trong 1 giây!", "success");
    }
    this.render("main-content-area");
  }

  // =========================================================================
  // 3. CHẾ ĐỘ 3: CHUYỂN ĐỔI SANG CÂY THƯ MỤC MÁY TÍNH 3D (FOLDER TREE 3D)
  // =========================================================================
  renderFolderTree3DView() {
    return `
      <div class="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
        <div class="text-center space-y-2">
          <span class="badge badge-emerald font-black text-xs">💻 CHUYỂN ĐỔI TỪ ĐỜI THỰC SANG MÁY TÍNH</span>
          <h3 class="text-2xl font-black text-slate-900">CÂY THƯ MỤC & TỆP TIN TRONG MÁY TÍNH</h3>
          <p class="text-xs text-slate-600 max-w-xl mx-auto">
            Trong máy tính, người ta cũng tạo các <b>Thư Mục (Folder)</b> giống như các <b>Ngăn Tủ</b> để sắp xếp và lưu trữ các <b>Tệp Tin (Files)</b>!
          </p>
        </div>

        <!-- Bảng So Sánh Đối Ứng Trực Quan 1-1 -->
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

        <div class="text-center pt-2">
          <button onclick="simulation3D.switchMode('organize')" class="btn btn-primary btn-md font-black bg-cyan-700 hover:bg-cyan-800 text-white shadow-md">
            🎮 Quay Lại Thí Nghiệm Sắp Xếp 3D
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 4. CHẾ ĐỘ 4: NHÚNG BẢN GỐC GOOGLE GEMINI SHARED LINK
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

        <!-- Khung iFrame Nhúng Trực Tiếp -->
        <div class="border-2 border-purple-200 rounded-2xl overflow-hidden shadow-lg bg-white relative" style="height: 600px;">
          <iframe 
            id="gemini-shared-iframe"
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

  // Mở Popup Toàn Màn Hình Thí Nghiệm 3D
  openFullScreenModal() {
    const modal = document.getElementById("simulation-3d-modal");
    if (modal) modal.classList.add("active");
  }
}

window.simulation3D = new Simulation3D();
