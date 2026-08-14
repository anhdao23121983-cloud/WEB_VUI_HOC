/**
 * EXAM PORTAL COMPONENT
 * Quản lý Menu KIỂM TRA & ĐÁNH GIÁ ĐỊNH KỲ:
 * - 📁 3 Thư Mục Con (Lớp 3, Lớp 4, Lớp 5)
 * - 🎨 Tùy chỉnh Tên, Icon, Màu Sắc & Mô tả
 * - 📦 Tải Trọn Bộ Tất Cả Đề Thi Trong Thư Mục Về Máy 1 Chạm (.zip)
 * - 🖐️ Kéo Thả Đề Thi Để Di Chuyển Giữa Các Thư Mục (Drag & Drop Move Exams)
 * - 🔐 Khóa Thư Mục Bằng Mật Khẩu Trước Giờ Kiểm Tra (Lock Folder with Password)
 * - 🖨️ In Hàng Loạt Toàn Bộ Đề Thi Ra Giấy 1 Lần Bấm (Batch Print Exams)
 * - 🔄 Đồng bộ 100% FE -> BE -> Supabase Cloud Database (public.exam_assessments)
 */

class ExamPortal {
  constructor() {
    this.selectedFolder = "all"; // 'all' | 3 | 4 | 5
    this.currentGrade = "all";
    this.currentExamType = "all";
    this.currentBookSeries = "all";
    this.currentTab = "all"; // 'all' | 'my_exams' | 'favorites'
    this.searchQuery = "";
    this.exams = [];

    // History filter state
    this.historyClass = "all"; // 'all' | '3A' | '3B' | '4A' | '4B' | '5A' | '5B'
    this.historySearch = "";

    // Delete state
    this.pendingDeleteId = null;
    this.pendingDeleteTitle = "";

    // Folder Customization State
    this.customizingGrade = 3;

    // Folder Lock State
    this.unlockingGrade = null;

    // Drag & Drop State
    this.draggedExamId = null;

    // Batch Print State
    this.batchPrintGrade = 3;

    // Online Test Runner State
    this.activeRunnerExam = null;
    this.runnerQuestions = [];
    this.runnerCurrentIndex = 0;
    this.runnerAnswers = {}; // { qIdx: selectedOptionIdx }
    this.runnerTimerSeconds = 2100; // 35 phút
    this.runnerTimerInterval = null;
    this.runnerStartTime = 0;

    // Shuffler State
    this.currentShuffledData = null;
    this.currentShuffledExam = null;
  }

  async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = window.authService?.getUser();
    const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');
    
    // Tải toàn bộ đề kiểm tra
    const effectiveGrade = this.selectedFolder !== "all" ? this.selectedFolder : this.currentGrade;
    let allExams = await window.examService.getAllExams(effectiveGrade, this.searchQuery, this.currentExamType, this.currentBookSeries);
    const favoriteIds = window.examService.getFavoriteIds();
    
    // Đếm số lượng theo danh mục
    const myExamsCount = user ? allExams.filter(e => (e.createdByUsername === user.username) || (e.authorName === user.name) || user.role === 'admin').length : 0;
    const favoritesCount = allExams.filter(e => favoriteIds.includes(e.id)).length;

    // Thống kê theo 3 thư mục con
    const rawAll = await window.examService.getAllExams("all");
    const countLop3 = rawAll.filter(e => e.grade === 3).length;
    const countLop4 = rawAll.filter(e => e.grade === 4).length;
    const countLop5 = rawAll.filter(e => e.grade === 5).length;

    // Lấy cấu hình tùy chỉnh của 3 thư mục
    const cfg3 = window.examService.getFolderConfig(3);
    const cfg4 = window.examService.getFolderConfig(4);
    const cfg5 = window.examService.getFolderConfig(5);

    if (this.currentTab === "my_exams" && user) {
      this.exams = allExams.filter(e => (e.createdByUsername === user.username) || (e.authorName === user.name) || user.role === 'admin');
    } else if (this.currentTab === "favorites") {
      this.exams = allExams.filter(e => favoriteIds.includes(e.id));
    } else {
      this.exams = allExams;
    }

    const currentFolderCfg = this.selectedFolder !== "all" ? window.examService.getFolderConfig(this.selectedFolder) : null;

    container.innerHTML = `
      <div class="space-y-6 animate-pop">
        <!-- Banner Ngân Hàng Đề Kiểm Tra Rực Rỡ -->
        <div class="banner-anhdao flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="badge badge-emerald font-black">📝 KHẢO SÁT & ĐÁNH GIÁ ĐỊNH KỲ</span>
              <span class="badge bg-white/20 text-white font-bold">Chuẩn Thông Tư 27/2020 & GDPT 2018</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">NGÂN HÀNG ĐỀ KIỂM TRA & ĐÁNH GIÁ</h2>
            <p class="text-cyan-100 text-xs md:text-sm">Phân chia 3 Thư Mục Lớp 3 - 4 - 5, Kéo thả chuyển thư mục, Khóa mật khẩu & In hàng loạt</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="examPortal.downloadFolderZip(examPortal.selectedFolder)" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md" title="Tải toàn bộ đề thi, đáp án và bảng điểm dạng tệp nén .zip">
              <span>📦</span> <span>Tải Trọn Bộ (.zip)</span>
            </button>
            <button onclick="examPortal.openBatchPrintModal(examPortal.selectedFolder)" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md" title="In toàn bộ đề thi và đáp án ra giấy máy in">
              <span>🖨️</span> <span>In Hàng Loạt</span>
            </button>
            <button onclick="examPortal.openHistoryModal()" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md" title="Xem lại lịch sử làm bài theo từng lớp">
              <span>📜</span> <span>Lịch Sử Thi & Lớp</span>
            </button>
            <button onclick="examPortal.openAnalyticsModal()" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md" title="Xem phổ điểm và tỷ lệ xếp loại T-H-C">
              <span>📈</span> <span>Phổ Điểm</span>
            </button>
            ${isTeacher ? `
              <button onclick="examPortal.openAIGeneratorModal()" class="btn bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs py-2.5 px-3.5 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all" title="AI tự động sinh đề theo từng chủ đề A, B, C, D, E, F">
                <span>✨</span> <span>AI Sinh Đề</span>
              </button>
              <button onclick="examUploadModal.openModal(${this.selectedFolder !== 'all' ? this.selectedFolder : 3})" class="btn btn-amber btn-sm font-black shadow-xl flex items-center gap-1.5 shrink-0 hover:scale-105 transition-all">
                <span>📤</span> <span>Tải Đề Lên</span>
              </button>
            ` : `
              <div class="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 text-center text-xs text-white">
                <span class="font-bold block text-amber-300">💡 Dành Cho Học Sinh:</span>
                <span>Em hãy chọn đúng <b>Thư mục Khối Lớp</b> để làm bài thi trực tuyến!</span>
              </div>
            `}
          </div>
        </div>

        <!-- =========================================================================
             HỆ THỐNG 3 THƯ MỤC CON (HỖ TRỢ KÉO THẢ DROP TARGET & KHÓA MẬT KHẨU)
             ========================================================================= -->
        ${this.selectedFolder === "all" ? `
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <span>📁 THƯ MỤC KIỂM TRA THEO KHỐI LỚP (GDPT 2018)</span>
                <span class="badge badge-emerald text-[11px] font-black">3 Thư Mục</span>
              </h3>
              <span class="text-xs text-slate-500">Thầy Cô có thể <b>Kéo thả đề thi</b> vào thư mục để chuyển khối lớp</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <!-- THƯ MỤC 1: LỚP 3 -->
              <div id="folder-drop-zone-3" 
                   ondragover="examPortal.handleFolderDragOver(event, 3)" 
                   ondragleave="examPortal.handleFolderDragLeave(event, 3)" 
                   ondrop="examPortal.handleFolderDrop(event, 3)"
                   class="glass-card p-5 hover:border-blue-500 transition-all duration-300 shadow-md hover:shadow-2xl group relative overflow-hidden bg-gradient-to-br ${cfg3.bgLight || 'from-blue-50/80 via-white to-indigo-50/50'} border-2 ${this.selectedFolder === 3 ? 'border-blue-600 ring-2 ring-blue-300' : (cfg3.borderColor || 'border-slate-200')}">
                <div class="flex items-start justify-between">
                  <div onclick="examPortal.enterFolder(3)" class="w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg3.colorGradient || 'from-blue-600 to-indigo-700'} text-white flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all cursor-pointer relative">
                    ${cfg3.icon || '📁'}
                    ${cfg3.isLocked ? '<span class="absolute -top-1 -right-1 text-xs bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow">🔒</span>' : ''}
                  </div>
                  
                  <div class="flex items-center gap-1.5">
                    <span class="badge bg-gradient-to-r ${cfg3.colorGradient || 'from-blue-600 to-indigo-700'} text-white font-black text-xs px-2.5 py-0.5">
                      ${cfg3.badgeText || '🎒 KHỐI LỚP 3'}
                    </span>
                    ${isTeacher ? `
                      <button onclick="event.stopPropagation(); examPortal.toggleFolderLockQuick(3)" class="p-1.5 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-110" title="${cfg3.isLocked ? 'Thư mục đang khóa. Bấm để mở khóa' : 'Thư mục đang mở. Bấm để khóa mật khẩu'}">
                        ${cfg3.isLocked ? '🔒' : '🔓'}
                      </button>
                      <button onclick="event.stopPropagation(); examPortal.openFolderCustomizeModal(3)" class="p-1.5 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-110" title="Tùy chỉnh Tên, Icon & Màu sắc thư mục này">
                        ⚙️
                      </button>
                    ` : ''}
                  </div>
                </div>

                <div onclick="examPortal.enterFolder(3)" class="mt-4 space-y-1.5 cursor-pointer">
                  <h4 class="text-base font-black text-slate-900 group-hover:text-blue-700 transition-all flex items-center gap-1.5">
                    <span>${cfg3.title}</span>
                    ${cfg3.isLocked ? '<span class="badge bg-rose-100 text-rose-800 text-[10px] font-bold">Đã Khóa</span>' : ''}
                  </h4>
                  <p class="text-xs text-slate-500 line-clamp-2">${cfg3.description}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>📦 <b>${countLop3}</b> Tệp Đề Thi</span>
                  <div class="flex items-center gap-2">
                    <button onclick="event.stopPropagation(); examPortal.downloadFolderZip(3)" class="text-indigo-600 hover:text-indigo-800 font-black flex items-center gap-1 text-[11px] bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 shadow-sm" title="Tải trọn bộ đề thi Lớp 3 dạng Zip">
                      📦 Zip
                    </button>
                    <button onclick="examPortal.enterFolder(3)" class="text-blue-600 font-black group-hover:translate-x-1 transition-all flex items-center gap-1">
                      Mở ➔
                    </button>
                  </div>
                </div>
              </div>

              <!-- THƯ MỤC 2: LỚP 4 -->
              <div id="folder-drop-zone-4" 
                   ondragover="examPortal.handleFolderDragOver(event, 4)" 
                   ondragleave="examPortal.handleFolderDragLeave(event, 4)" 
                   ondrop="examPortal.handleFolderDrop(event, 4)"
                   class="glass-card p-5 hover:border-amber-500 transition-all duration-300 shadow-md hover:shadow-2xl group relative overflow-hidden bg-gradient-to-br ${cfg4.bgLight || 'from-amber-50/80 via-white to-orange-50/50'} border-2 ${this.selectedFolder === 4 ? 'border-amber-600 ring-2 ring-amber-300' : (cfg4.borderColor || 'border-slate-200')}">
                <div class="flex items-start justify-between">
                  <div onclick="examPortal.enterFolder(4)" class="w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg4.colorGradient || 'from-amber-600 to-orange-600'} text-white flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all cursor-pointer relative">
                    ${cfg4.icon || '📁'}
                    ${cfg4.isLocked ? '<span class="absolute -top-1 -right-1 text-xs bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow">🔒</span>' : ''}
                  </div>

                  <div class="flex items-center gap-1.5">
                    <span class="badge bg-gradient-to-r ${cfg4.colorGradient || 'from-amber-600 to-orange-600'} text-white font-black text-xs px-2.5 py-0.5">
                      ${cfg4.badgeText || '🚀 KHỐI LỚP 4'}
                    </span>
                    ${isTeacher ? `
                      <button onclick="event.stopPropagation(); examPortal.toggleFolderLockQuick(4)" class="p-1.5 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-110" title="${cfg4.isLocked ? 'Thư mục đang khóa. Bấm để mở khóa' : 'Thư mục đang mở. Bấm để khóa mật khẩu'}">
                        ${cfg4.isLocked ? '🔒' : '🔓'}
                      </button>
                      <button onclick="event.stopPropagation(); examPortal.openFolderCustomizeModal(4)" class="p-1.5 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-110" title="Tùy chỉnh Tên, Icon & Màu sắc thư mục này">
                        ⚙️
                      </button>
                    ` : ''}
                  </div>
                </div>

                <div onclick="examPortal.enterFolder(4)" class="mt-4 space-y-1.5 cursor-pointer">
                  <h4 class="text-base font-black text-slate-900 group-hover:text-amber-700 transition-all flex items-center gap-1.5">
                    <span>${cfg4.title}</span>
                    ${cfg4.isLocked ? '<span class="badge bg-rose-100 text-rose-800 text-[10px] font-bold">Đã Khóa</span>' : ''}
                  </h4>
                  <p class="text-xs text-slate-500 line-clamp-2">${cfg4.description}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>📦 <b>${countLop4}</b> Tệp Đề Thi</span>
                  <div class="flex items-center gap-2">
                    <button onclick="event.stopPropagation(); examPortal.downloadFolderZip(4)" class="text-amber-700 hover:text-amber-900 font-black flex items-center gap-1 text-[11px] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shadow-sm" title="Tải trọn bộ đề thi Lớp 4 dạng Zip">
                      📦 Zip
                    </button>
                    <button onclick="examPortal.enterFolder(4)" class="text-amber-600 font-black group-hover:translate-x-1 transition-all flex items-center gap-1">
                      Mở ➔
                    </button>
                  </div>
                </div>
              </div>

              <!-- THƯ MỤC 3: LỚP 5 -->
              <div id="folder-drop-zone-5" 
                   ondragover="examPortal.handleFolderDragOver(event, 5)" 
                   ondragleave="examPortal.handleFolderDragLeave(event, 5)" 
                   ondrop="examPortal.handleFolderDrop(event, 5)"
                   class="glass-card p-5 hover:border-emerald-500 transition-all duration-300 shadow-md hover:shadow-2xl group relative overflow-hidden bg-gradient-to-br ${cfg5.bgLight || 'from-emerald-50/80 via-white to-teal-50/50'} border-2 ${this.selectedFolder === 5 ? 'border-emerald-600 ring-2 ring-emerald-300' : (cfg5.borderColor || 'border-slate-200')}">
                <div class="flex items-start justify-between">
                  <div onclick="examPortal.enterFolder(5)" class="w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg5.colorGradient || 'from-emerald-600 to-teal-600'} text-white flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all cursor-pointer relative">
                    ${cfg5.icon || '📁'}
                    ${cfg5.isLocked ? '<span class="absolute -top-1 -right-1 text-xs bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow">🔒</span>' : ''}
                  </div>

                  <div class="flex items-center gap-1.5">
                    <span class="badge bg-gradient-to-r ${cfg5.colorGradient || 'from-emerald-600 to-teal-600'} text-white font-black text-xs px-2.5 py-0.5">
                      ${cfg5.badgeText || '⭐ KHỐI LỚP 5'}
                    </span>
                    ${isTeacher ? `
                      <button onclick="event.stopPropagation(); examPortal.toggleFolderLockQuick(5)" class="p-1.5 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-110" title="${cfg5.isLocked ? 'Thư mục đang khóa. Bấm để mở khóa' : 'Thư mục đang mở. Bấm để khóa mật khẩu'}">
                        ${cfg5.isLocked ? '🔒' : '🔓'}
                      </button>
                      <button onclick="event.stopPropagation(); examPortal.openFolderCustomizeModal(5)" class="p-1.5 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-110" title="Tùy chỉnh Tên, Icon & Màu sắc thư mục này">
                        ⚙️
                      </button>
                    ` : ''}
                  </div>
                </div>

                <div onclick="examPortal.enterFolder(5)" class="mt-4 space-y-1.5 cursor-pointer">
                  <h4 class="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-all flex items-center gap-1.5">
                    <span>${cfg5.title}</span>
                    ${cfg5.isLocked ? '<span class="badge bg-rose-100 text-rose-800 text-[10px] font-bold">Đã Khóa</span>' : ''}
                  </h4>
                  <p class="text-xs text-slate-500 line-clamp-2">${cfg5.description}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>📦 <b>${countLop5}</b> Tệp Đề Thi</span>
                  <div class="flex items-center gap-2">
                    <button onclick="event.stopPropagation(); examPortal.downloadFolderZip(5)" class="text-emerald-700 hover:text-emerald-900 font-black flex items-center gap-1 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 shadow-sm" title="Tải trọn bộ đề thi Lớp 5 dạng Zip">
                      📦 Zip
                    </button>
                    <button onclick="examPortal.enterFolder(5)" class="text-emerald-600 font-black group-hover:translate-x-1 transition-all flex items-center gap-1">
                      Mở ➔
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : `
          <!-- THANH BREADCRUMB & HEADER KHI ĐANG MỞ 1 THƯ MỤC CỤ THỂ -->
          <div class="glass-card p-5 space-y-4 border-2 ${currentFolderCfg.borderColor || 'border-blue-500'} bg-gradient-to-r ${currentFolderCfg.bgLight || 'from-blue-50/50 via-white to-indigo-50/50'}">
            <!-- Breadcrumb Navigation -->
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2 text-xs font-bold">
                <button onclick="examPortal.enterFolder('all')" class="text-slate-500 hover:text-slate-900 flex items-center gap-1">
                  <span>🏠 Ngân Hàng Đề</span>
                </button>
                <span class="text-slate-400">/</span>
                <span class="text-slate-900 font-black flex items-center gap-1">
                  <span>${currentFolderCfg.icon || '📁'}</span> <span>${currentFolderCfg.title}</span>
                </span>
                <span class="badge bg-gradient-to-r ${currentFolderCfg.colorGradient || 'from-blue-600 to-indigo-700'} text-white text-[10px] font-black">
                  ${this.exams.length} Tệp Tin
                </span>
              </div>

              <div class="flex items-center gap-2 flex-wrap">
                <button onclick="examPortal.downloadFolderZip(${this.selectedFolder})" class="btn btn-outline btn-xs font-black bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 shadow-sm flex items-center gap-1" title="Tải trọn bộ đề thi lớp này dạng tệp nén .zip">
                  <span>📦</span> <span>Tải Trọn Bộ Lớp ${this.selectedFolder} (.zip)</span>
                </button>
                <button onclick="examPortal.openBatchPrintModal(${this.selectedFolder})" class="btn btn-outline btn-xs font-black bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-sm flex items-center gap-1" title="In toàn bộ đề thi của lớp này ra máy in">
                  <span>🖨️</span> <span>In Hàng Loạt</span>
                </button>
                ${isTeacher ? `
                  <button onclick="examPortal.openFolderCustomizeModal(${this.selectedFolder})" class="btn btn-outline btn-xs font-bold bg-white text-slate-700 shadow-sm flex items-center gap-1">
                    <span>⚙️</span> <span>Tùy Chỉnh Thư Mục Này</span>
                  </button>
                ` : ''}
                <button onclick="examPortal.enterFolder('all')" class="btn btn-outline btn-xs font-black bg-white shadow-sm flex items-center gap-1">
                  <span>⬅️</span> <span>Quay Lại Tất Cả Thư Mục</span>
                </button>
              </div>
            </div>

            <!-- Header Thư Mục -->
            <div class="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200/80">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${currentFolderCfg.colorGradient || 'from-blue-600 to-indigo-700'} text-white flex items-center justify-center text-2xl shadow-md">
                  ${currentFolderCfg.icon || '📁'}
                </div>
                <div>
                  <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>${currentFolderCfg.title}</span>
                    ${currentFolderCfg.isLocked ? '<span class="badge bg-rose-600 text-white text-[10px] font-bold">🔒 Khóa Mật Khẩu</span>' : ''}
                  </h3>
                  <p class="text-xs text-slate-600">${currentFolderCfg.description}</p>
                </div>
              </div>

              <!-- Quick action in folder -->
              <div class="flex items-center gap-2 flex-wrap">
                ${isTeacher ? `
                  <button onclick="examUploadModal.openModal(${this.selectedFolder})" class="btn btn-emerald btn-sm font-black shadow flex items-center gap-1">
                    <span>📤</span> <span>Tải Đề Vào Thư Mục Này</span>
                  </button>
                  <button onclick="examPortal.quickAIGenerateForFolder(${this.selectedFolder})" class="btn btn-primary btn-sm font-black bg-purple-700 hover:bg-purple-800 text-white shadow flex items-center gap-1">
                    <span>✨</span> <span>AI Sinh Đề Lớp ${this.selectedFolder}</span>
                  </button>
                ` : ''}
                <button onclick="examPortal.exportClassGradebookDoc('${this.selectedFolder}A')" class="btn btn-outline btn-sm font-black bg-white text-slate-700 flex items-center gap-1 shadow-sm">
                  <span>📊</span> <span>Bảng Điểm Lớp ${this.selectedFolder}A</span>
                </button>
              </div>
            </div>
          </div>
        `}

        <!-- Thanh 3 Tab Chuyển Đổi: Tất Cả | Đề Của Tôi | Đề Yêu Thích -->
        <div class="flex items-center gap-2.5 border-b border-slate-200 pb-2 flex-wrap">
          <button onclick="examPortal.switchTab('all')" class="px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'all' ? 'bg-cyan-700 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            <span>📂 Tất Cả Đề Kiểm Tra</span>
            <span class="badge ${this.currentTab === 'all' ? 'bg-white/25 text-white' : 'badge-slate'} text-[10px]">${allExams.length}</span>
          </button>
          
          <button onclick="examPortal.switchTab('favorites')" class="px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'favorites' ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            <span>⭐ Đề Thi Yêu Thích</span>
            <span class="badge ${this.currentTab === 'favorites' ? 'bg-white/25 text-white' : 'badge-rose'} text-[10px]">${favoritesCount}</span>
          </button>

          ${isTeacher ? `
            <button onclick="examPortal.switchTab('my_exams')" class="px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${this.currentTab === 'my_exams' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
              <span>👨‍🏫 Đề Thi Của Tôi (Quản Lý, Sửa & Xóa)</span>
              <span class="badge ${this.currentTab === 'my_exams' ? 'bg-white/25 text-white' : 'badge-amber'} text-[10px]">${myExamsCount}</span>
            </button>
          ` : ''}
        </div>

        <!-- Thanh Bộ Lọc Kỳ Đánh Giá & Bộ Sách -->
        <div class="glass-card p-5 space-y-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <!-- Chọn nhanh thư mục / khối lớp -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-500 mr-1">Thư Mục:</span>
              <button onclick="examPortal.enterFolder('all')" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.selectedFolder === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                📂 Tất Cả Khối
              </button>
              <button onclick="examPortal.enterFolder(3)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.selectedFolder === 3 ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}">
                ${cfg3.icon || '📁'} ${cfg3.title} (${countLop3})
              </button>
              <button onclick="examPortal.enterFolder(4)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.selectedFolder === 4 ? 'bg-amber-600 text-white shadow-md' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
                ${cfg4.icon || '📁'} ${cfg4.title} (${countLop4})
              </button>
              <button onclick="examPortal.enterFolder(5)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.selectedFolder === 5 ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
                ${cfg5.icon || '📁'} ${cfg5.title} (${countLop5})
              </button>
            </div>

            <!-- Ô Tìm Kiếm -->
            <div class="relative w-full md:w-72">
              <input type="text" id="exam-search-input" value="${this.searchQuery}" oninput="examPortal.handleSearch(this.value)" placeholder="Tìm đề thi, tác giả, nội dung..." class="form-control text-xs pl-9 font-medium">
              <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
          </div>

          <!-- Lọc Theo Loại Đề Kiểm Tra -->
          <div class="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200/70">
            <span class="text-xs font-bold text-slate-500 mr-1">Kỳ Đánh Giá:</span>
            <button onclick="examPortal.selectExamType('all')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'all' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Tất Cả Loại Đề
            </button>
            <button onclick="examPortal.selectExamType('regular')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'regular' ? 'bg-purple-600 text-white shadow' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'}">
              ⏱️ Thường Xuyên (15P)
            </button>
            <button onclick="examPortal.selectExamType('mid_term_1')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'mid_term_1' ? 'bg-amber-600 text-white shadow' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
              🍂 Giữa Học Kỳ I
            </button>
            <button onclick="examPortal.selectExamType('final_term_1')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'final_term_1' ? 'bg-blue-600 text-white shadow' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}">
              ❄️ Cuối Học Kỳ I
            </button>
            <button onclick="examPortal.selectExamType('mid_term_2')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'mid_term_2' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
              🌱 Giữa Học Kỳ II
            </button>
            <button onclick="examPortal.selectExamType('final_term_2')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'final_term_2' ? 'bg-rose-600 text-white shadow' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'}">
              ☀️ Cuối Học Kỳ II
            </button>
            <button onclick="examPortal.selectExamType('matrix')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentExamType === 'matrix' ? 'bg-indigo-600 text-white shadow' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'}">
              📐 Ma Trận & Bản Đặc Tả
            </button>
          </div>

          <!-- Lọc Theo Bộ Sách Giáo Khoa -->
          <div class="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200/70">
            <span class="text-xs font-bold text-slate-500 mr-1">Bộ Sách:</span>
            <button onclick="examPortal.selectBookSeries('all')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'all' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Tất Cả Bộ Sách
            </button>
            <button onclick="examPortal.selectBookSeries('KNTT')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'KNTT' ? 'bg-blue-600 text-white shadow' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}">
              📘 Kết Nối Tri Thức
            </button>
            <button onclick="examPortal.selectBookSeries('CD')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'CD' ? 'bg-amber-600 text-white shadow' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
              📙 Cánh Diều
            </button>
            <button onclick="examPortal.selectBookSeries('CTST')" class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${this.currentBookSeries === 'CTST' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
              📗 Chân Trời Sáng Tạo
            </button>
          </div>
        </div>

        <!-- Danh Sách Card Đề Kiểm Tra Trong Thư Mục -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>📝 DANH SÁCH TỆP TIN TRONG ${this.selectedFolder === 'all' ? 'TẤT CẢ THƯ MỤC' : currentFolderCfg.title.toUpperCase()}</span>
              <span class="badge badge-emerald font-black text-xs">${this.exams.length} Tệp</span>
            </h3>
            ${isTeacher ? `
              <div class="flex items-center gap-2">
                <button onclick="examPortal.openBatchPrintModal(${this.selectedFolder !== 'all' ? this.selectedFolder : 3})" class="btn btn-outline btn-xs font-bold text-slate-700 bg-white border-slate-300 flex items-center gap-1">
                  <span>🖨️</span> <span>In Hàng Loạt</span>
                </button>
                <button onclick="examPortal.openAIGeneratorModal()" class="btn btn-outline btn-xs font-black text-purple-800 border-purple-300 hover:bg-purple-50 flex items-center gap-1">
                  <span>✨</span> <span>AI Sinh Đề</span>
                </button>
                <button onclick="examUploadModal.openModal(${this.selectedFolder !== 'all' ? this.selectedFolder : 3})" class="btn btn-outline btn-xs font-black text-emerald-800 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1">
                  <span>➕</span> <span>Tải Đề Lên</span>
                </button>
              </div>
            ` : ''}
          </div>

          ${this.renderExamGrid(isTeacher, user)}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // MỞ / CHUYỂN THƯ MỤC (KIỂM TRA KHÓA MẬT KHẨU)
  // =========================================================================
  enterFolder(grade) {
    if (grade !== "all") {
      const isLocked = window.examService.isFolderLockedForUser(grade);
      if (isLocked) {
        this.openFolderLockModal(grade);
        return;
      }
    }

    this.selectedFolder = grade;
    this.currentGrade = grade;
    this.render("main-content-area");
  }

  openFolderLockModal(grade) {
    this.unlockingGrade = grade;
    const cfg = window.examService.getFolderConfig(grade);

    const modal = document.getElementById("exam-folder-lock-modal");
    const content = document.getElementById("exam-folder-lock-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-4 text-xs text-slate-800 animate-pop text-center py-2">
          <span class="text-5xl block animate-bounce">🔐</span>
          <h3 class="text-lg font-black text-slate-900">${cfg.title} ĐANG ĐƯỢC TẠM KHÓA</h3>
          <p class="text-xs text-slate-600">Thầy/Cô giáo đã tạm khóa thư mục đề thi này trước giờ kiểm tra. Em hãy nhập mã mật khẩu do Thầy/Cô cung cấp để mở đề!</p>

          <div class="max-w-xs mx-auto space-y-2">
            <input type="password" id="folder-unlock-password-input" placeholder="Nhập mật khẩu (ví dụ: 123456)..." class="form-control text-center text-sm font-black tracking-widest py-2">
            <p id="folder-unlock-error-msg" class="text-rose-600 font-bold text-[11px] hidden">Mật khẩu không chính xác, em hãy hỏi lại Thầy/Cô!</p>
          </div>

          <div class="flex items-center justify-center gap-2 pt-2">
            <button onclick="document.getElementById('exam-folder-lock-modal').classList.remove('active')" class="btn btn-outline btn-sm font-bold">
              Quay Lại
            </button>
            <button onclick="examPortal.confirmUnlockFolder()" class="btn btn-primary btn-sm font-black bg-cyan-700 hover:bg-cyan-800 text-white shadow-md">
              🔓 Mở Khóa Thư Mục
            </button>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  confirmUnlockFolder() {
    const input = document.getElementById("folder-unlock-password-input")?.value.trim();
    const errorMsg = document.getElementById("folder-unlock-error-msg");
    const grade = this.unlockingGrade;

    if (!grade) return;

    const res = window.examService.unlockFolderSession(grade, input);
    if (res.success) {
      document.getElementById("exam-folder-lock-modal")?.classList.remove("active");
      window.app.showToast(`🔓 Đã mở khóa thành công Thư mục Lớp ${grade}!`, "success");
      this.selectedFolder = grade;
      this.currentGrade = grade;
      this.render("main-content-area");
    } else {
      if (errorMsg) errorMsg.classList.remove("hidden");
    }
  }

  toggleFolderLockQuick(grade) {
    const cfg = window.examService.getFolderConfig(grade);
    const newLock = !cfg.isLocked;
    window.examService.toggleFolderLock(grade, newLock, cfg.password || "123456");
    window.app.showToast(newLock ? `🔒 Đã khóa thư mục Lớp ${grade} (Mật khẩu: ${cfg.password || '123456'})!` : `🔓 Đã mở khóa tự do cho thư mục Lớp ${grade}!`, "info");
    this.render("main-content-area");
  }

  // =========================================================================
  // KÉO THẢ ĐỀ THI ĐỂ DI CHUYỂN GIỮA CÁC THƯ MỤC (DRAG & DROP)
  // =========================================================================
  handleExamDragStart(event, examId) {
    this.draggedExamId = examId;
    event.dataTransfer.setData("text/plain", examId);
    event.dataTransfer.effectAllowed = "move";
  }

  handleFolderDragOver(event, targetGrade) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const zone = document.getElementById(`folder-drop-zone-${targetGrade}`);
    if (zone) {
      zone.classList.add("ring-4", "ring-emerald-400", "scale-105", "bg-emerald-100/70");
    }
  }

  handleFolderDragLeave(event, targetGrade) {
    const zone = document.getElementById(`folder-drop-zone-${targetGrade}`);
    if (zone) {
      zone.classList.remove("ring-4", "ring-emerald-400", "scale-105", "bg-emerald-100/70");
    }
  }

  async handleFolderDrop(event, targetGrade) {
    event.preventDefault();
    const zone = document.getElementById(`folder-drop-zone-${targetGrade}`);
    if (zone) {
      zone.classList.remove("ring-4", "ring-emerald-400", "scale-105", "bg-emerald-100/70");
    }

    const examId = event.dataTransfer.getData("text/plain") || this.draggedExamId;
    if (!examId) return;

    window.app.showToast(`🚚 Đang chuyển đề thi sang Thư mục Lớp ${targetGrade}...`, "info");
    const res = await window.examService.moveExamToFolder(examId, targetGrade);

    if (res.success) {
      window.app.showToast(`🎉 Đã di chuyển đề thi vào Thư Mục Khối Lớp ${targetGrade} thành công!`, "success");
      this.render("main-content-area");
    }
  }

  // =========================================================================
  // IN HÀNG LOẠT TOÀN BỘ ĐỀ THI RA GIẤY (BATCH PRINT MODAL)
  // =========================================================================
  openBatchPrintModal(grade = 3) {
    this.batchPrintGrade = grade !== 'all' ? grade : 3;
    const modal = document.getElementById("exam-batch-print-modal");
    const content = document.getElementById("exam-batch-print-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-4 text-xs text-slate-800 animate-pop">
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <div class="flex items-center justify-between">
              <span class="badge badge-emerald font-black text-[10px]">CHỌN KHỐI LỚP CẦN IN</span>
              <span class="font-bold text-slate-600">Định dạng: <b>Khổ giấy A4 Chuẩn</b></span>
            </div>
            <div class="flex items-center gap-2 pt-2">
              <button onclick="examPortal.selectBatchPrintGrade(3)" class="btn btn-xs ${this.batchPrintGrade === 3 ? 'btn-primary' : 'btn-outline'} font-bold">Khối Lớp 3</button>
              <button onclick="examPortal.selectBatchPrintGrade(4)" class="btn btn-xs ${this.batchPrintGrade === 4 ? 'btn-primary' : 'btn-outline'} font-bold">Khối Lớp 4</button>
              <button onclick="examPortal.selectBatchPrintGrade(5)" class="btn btn-xs ${this.batchPrintGrade === 5 ? 'btn-primary' : 'btn-outline'} font-bold">Khối Lớp 5</button>
              <button onclick="examPortal.selectBatchPrintGrade('all')" class="btn btn-xs ${this.batchPrintGrade === 'all' ? 'btn-primary' : 'btn-outline'} font-bold">Tất Cả Khối</button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="font-bold text-slate-700 block">Tùy Chọn Nội Dung Bản In:</label>
            <div class="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
              <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" id="batch-opt-exam" checked class="form-checkbox text-emerald-600 rounded">
                <span>📝 Đề Kiểm Tra Chuẩn Bộ GD&ĐT (Có khung điểm & Lời nhận xét)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" id="batch-opt-key" checked class="form-checkbox text-indigo-600 rounded">
                <span>🔑 Bảng Ma Trận Đáp Án & Hướng Dẫn Chấm Thực Hành</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" id="batch-opt-gradebook" checked class="form-checkbox text-cyan-600 rounded">
                <span>📊 Bảng Tổng Hợp Kết Quả Đánh Giá Lớp Học (Sổ điểm mẫu)</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-200">
            <span class="text-[11px] text-slate-400">Tự động chèn ngắt trang A4 giữa các đề thi</span>
            <div class="flex items-center gap-2">
              <button onclick="document.getElementById('exam-batch-print-modal').classList.remove('active')" class="btn btn-outline btn-sm font-bold">
                Hủy
              </button>
              <button onclick="examPortal.executeBatchPrint()" class="btn btn-primary btn-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow flex items-center gap-1">
                <span>🖨️</span> <span>Bắt Đầu In Ngay</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  selectBatchPrintGrade(grade) {
    this.batchPrintGrade = grade;
    this.openBatchPrintModal(grade);
  }

  executeBatchPrint() {
    const printExams = document.getElementById("batch-opt-exam")?.checked;
    const printAnswerKeys = document.getElementById("batch-opt-key")?.checked;
    const printGradebook = document.getElementById("batch-opt-gradebook")?.checked;

    document.getElementById("exam-batch-print-modal")?.classList.remove("active");

    window.docExportService.batchPrintFolderExams(this.batchPrintGrade, {
      printExams,
      printAnswerKeys,
      printGradebook
    });
  }

  // Nhanh AI Sinh đề cho khối lớp của thư mục
  quickAIGenerateForFolder(grade) {
    this.openAIGeneratorModal();
    const gradeSelect = document.getElementById("ai-gen-grade");
    if (gradeSelect) gradeSelect.value = grade;
  }

  // =========================================================================
  // TÙY CHỈNH GIAO DIỆN THƯ MỤC (CUSTOMIZE FOLDER MODAL)
  // =========================================================================
  openFolderCustomizeModal(grade) {
    this.customizingGrade = grade;
    const cfg = window.examService.getFolderConfig(grade);

    const modal = document.getElementById("exam-folder-customize-modal");
    const content = document.getElementById("exam-folder-customize-content");

    const palettes = [
      { id: "blue", name: "🔵 Xanh Đại Dương", grad: "from-blue-600 to-indigo-700", border: "border-blue-500", bgLight: "from-blue-50/80 via-white to-indigo-50/50" },
      { id: "amber", name: "🟠 Cam Hổ Phách", grad: "from-amber-600 to-orange-600", border: "border-amber-500", bgLight: "from-amber-50/80 via-white to-orange-50/50" },
      { id: "emerald", name: "🟢 Ngọc Lục Bảo", grad: "from-emerald-600 to-teal-600", border: "border-emerald-500", bgLight: "from-emerald-50/80 via-white to-teal-50/50" },
      { id: "purple", name: "🟣 Tím Hoàng Gia", grad: "from-purple-600 to-indigo-700", border: "border-purple-500", bgLight: "from-purple-50/80 via-white to-indigo-50/50" },
      { id: "rose", name: "🔴 Đỏ Hồng Ruby", grad: "from-rose-600 to-pink-600", border: "border-rose-500", bgLight: "from-rose-50/80 via-white to-pink-50/50" },
      { id: "cyan", name: "🔷 Xanh Lam Cyan", grad: "from-cyan-600 to-blue-700", border: "border-cyan-500", bgLight: "from-cyan-50/80 via-white to-blue-50/50" }
    ];

    const emojis = ["📁", "🎒", "🚀", "⭐", "💻", "🏆", "📚", "🎯", "💡", "🛡️", "🎨", "🧩", "📖", "🕹️"];

    if (content) {
      content.innerHTML = `
        <div class="space-y-4 text-xs text-slate-800 animate-pop">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span class="font-bold text-slate-600">Đang tùy chỉnh: <b>Khối Lớp ${grade}</b></span>
            <button onclick="examPortal.resetFolderToDefault(${grade})" class="btn btn-outline btn-xs font-bold text-slate-600 hover:bg-slate-200">
              🔄 Khôi Phục Mặc Định
            </button>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">1. Tên Thư Mục Hiển Thị:</label>
            <input type="text" id="cust-folder-title" value="${cfg.title}" class="form-control text-xs font-bold">
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">2. Biểu Tượng Icon (Emoji):</label>
            <div class="flex items-center gap-2 flex-wrap">
              ${emojis.map(emo => `
                <button type="button" onclick="examPortal.selectFolderEmoji('${emo}')" class="w-9 h-9 rounded-xl text-lg flex items-center justify-center border-2 transition-all hover:scale-110 ${cfg.icon === emo ? 'border-cyan-600 bg-cyan-50 shadow-md' : 'border-slate-200 bg-white'} emoji-btn" data-emoji="${emo}">
                  ${emo}
                </button>
              `).join("")}
            </div>
            <input type="hidden" id="cust-folder-icon" value="${cfg.icon || '📁'}">
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">3. Tông Màu Sắc Nhận Diện (Gradient):</label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              ${palettes.map(pal => `
                <button type="button" onclick="examPortal.selectFolderPalette('${pal.grad}', '${pal.border}', '${pal.bgLight}')" class="p-2.5 rounded-xl border-2 text-left font-bold text-[11px] transition-all flex items-center gap-2 palette-btn ${cfg.colorGradient === pal.grad ? 'border-slate-900 shadow-md scale-102' : 'border-slate-200 bg-white'}" data-grad="${pal.grad}">
                  <span class="w-5 h-5 rounded-lg bg-gradient-to-br ${pal.grad} shrink-0 shadow-inner"></span>
                  <span class="line-clamp-1">${pal.name}</span>
                </button>
              `).join("")}
            </div>
            <input type="hidden" id="cust-folder-grad" value="${cfg.colorGradient}">
            <input type="hidden" id="cust-folder-border" value="${cfg.borderColor}">
            <input type="hidden" id="cust-folder-bglight" value="${cfg.bgLight}">
          </div>

          <!-- Tùy Chọn Khóa Mật Khẩu Thư Mục -->
          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
            <label class="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
              <input type="checkbox" id="cust-folder-locked" ${cfg.isLocked ? 'checked' : ''} onchange="document.getElementById('cust-folder-pass-box').classList.toggle('hidden', !this.checked)" class="form-checkbox text-amber-600 rounded">
              <span>🔒 Khóa Thư Mục Bằng Mật Khẩu (Dành cho trước giờ kiểm tra)</span>
            </label>
            <div id="cust-folder-pass-box" class="${cfg.isLocked ? '' : 'hidden'} pt-1">
              <label class="text-[11px] font-bold text-slate-600 block mb-1">Mật khẩu mở thư mục:</label>
              <input type="text" id="cust-folder-password" value="${cfg.password || '123456'}" placeholder="Nhập mật khẩu (ví dụ: 123456)" class="form-control text-xs font-bold tracking-wider">
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">4. Mô Tả Ghi Chú Thư Mục:</label>
            <textarea id="cust-folder-desc" rows="2" class="form-control text-xs font-medium">${cfg.description}</textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button onclick="document.getElementById('exam-folder-customize-modal').classList.remove('active')" class="btn btn-outline btn-sm font-bold">
              Hủy Bỏ
            </button>
            <button onclick="examPortal.saveFolderCustomization()" class="btn btn-primary btn-sm font-black bg-cyan-700 hover:bg-cyan-800 text-white shadow-md flex items-center gap-1">
              <span>💾</span> <span>Lưu Cấu Hình Thư Mục</span>
            </button>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  selectFolderEmoji(emoji) {
    const input = document.getElementById("cust-folder-icon");
    if (input) input.value = emoji;

    document.querySelectorAll(".emoji-btn").forEach(btn => {
      if (btn.getAttribute("data-emoji") === emoji) {
        btn.classList.add("border-cyan-600", "bg-cyan-50", "shadow-md");
        btn.classList.remove("border-slate-200", "bg-white");
      } else {
        btn.classList.remove("border-cyan-600", "bg-cyan-50", "shadow-md");
        btn.classList.add("border-slate-200", "bg-white");
      }
    });
  }

  selectFolderPalette(grad, border, bgLight) {
    document.getElementById("cust-folder-grad").value = grad;
    document.getElementById("cust-folder-border").value = border;
    document.getElementById("cust-folder-bglight").value = bgLight;

    document.querySelectorAll(".palette-btn").forEach(btn => {
      if (btn.getAttribute("data-grad") === grad) {
        btn.classList.add("border-slate-900", "shadow-md", "scale-102");
        btn.classList.remove("border-slate-200");
      } else {
        btn.classList.remove("border-slate-900", "shadow-md", "scale-102");
        btn.classList.add("border-slate-200");
      }
    });
  }

  saveFolderCustomization() {
    const grade = this.customizingGrade;
    const title = document.getElementById("cust-folder-title")?.value.trim() || `Kiểm Tra Môn Tin Lớp ${grade}`;
    const icon = document.getElementById("cust-folder-icon")?.value || "📁";
    const colorGradient = document.getElementById("cust-folder-grad")?.value || "from-blue-600 to-indigo-700";
    const borderColor = document.getElementById("cust-folder-border")?.value || "border-blue-500";
    const bgLight = document.getElementById("cust-folder-bglight")?.value || "from-blue-50/80 via-white to-indigo-50/50";
    const isLocked = document.getElementById("cust-folder-locked")?.checked;
    const password = document.getElementById("cust-folder-password")?.value.trim() || "123456";
    const description = document.getElementById("cust-folder-desc")?.value.trim() || "";

    window.examService.saveFolderConfig(grade, {
      title,
      icon,
      colorGradient,
      borderColor,
      bgLight,
      isLocked,
      password,
      description
    });

    document.getElementById("exam-folder-customize-modal")?.classList.remove("active");
    window.app.showToast(`🎨 Đã lưu tùy chỉnh diện mạo cho Thư mục Lớp ${grade} thành công!`, "success");
    this.render("main-content-area");
  }

  resetFolderToDefault(grade) {
    window.examService.resetFolderConfig(grade);
    document.getElementById("exam-folder-customize-modal")?.classList.remove("active");
    window.app.showToast(`🔄 Đã khôi phục cài đặt mặc định cho Thư mục Lớp ${grade}!`, "info");
    this.render("main-content-area");
  }

  // Render lưới thẻ đề kiểm tra (Có hỗ trợ Kéo Thả draggable)
  renderExamGrid(isTeacher, user) {
    if (this.exams.length === 0) {
      return `
        <div class="text-center py-16 glass-card space-y-3 text-slate-400">
          <span class="text-6xl block mb-2">📁</span>
          <p class="font-black text-slate-700 text-base">Thư mục này hiện chưa có tệp đề kiểm tra nào.</p>
          <p class="text-xs text-slate-500">Thầy Cô hãy bấm nút <b>'Tải Đề Lên'</b> hoặc <b>kéo thả đề thi</b> vào đây!</p>
          ${isTeacher ? `
            <div class="flex items-center justify-center gap-2 mt-2">
              <button onclick="examPortal.quickAIGenerateForFolder(${this.selectedFolder !== 'all' ? this.selectedFolder : 3})" class="btn btn-primary btn-sm font-black">
                ✨ AI Sinh Đề Vào Thư Mục Này
              </button>
              <button onclick="examUploadModal.openModal(${this.selectedFolder !== 'all' ? this.selectedFolder : 3})" class="btn btn-emerald btn-sm font-black">
                📤 Tải Lên Đề Mới
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }

    const typeNames = {
      "regular": { name: "Thường Xuyên 15P", badge: "bg-purple-600" },
      "mid_term_1": { name: "Giữa Học Kỳ I", badge: "bg-amber-600" },
      "final_term_1": { name: "Cuối Học Kỳ I", badge: "bg-blue-600" },
      "mid_term_2": { name: "Giữa Học Kỳ II", badge: "bg-emerald-600" },
      "final_term_2": { name: "Cuối Học Kỳ II", badge: "bg-rose-600" },
      "matrix": { name: "Ma Trận & Bản Đặc Tả", badge: "bg-indigo-600" }
    };

    const seriesLabels = {
      "KNTT": { name: "Kết Nối Tri Thức", bg: "bg-blue-600" },
      "CD": { name: "Cánh Diều", bg: "bg-amber-600" },
      "CTST": { name: "Chân Trời Sáng Tạo", bg: "bg-emerald-600" }
    };

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.exams.map(e => {
          const tInfo = typeNames[e.examType] || typeNames["final_term_1"];
          const sInfo = seriesLabels[e.bookSeries] || seriesLabels["KNTT"];
          const canManage = user && (user.role === 'admin' || user.username === e.createdByUsername || user.name === e.authorName || isTeacher);
          const isFav = window.examService.isFavorite(e.id);

          return `
            <div draggable="true" 
                 ondragstart="examPortal.handleExamDragStart(event, '${e.id}')"
                 class="glass-card overflow-hidden hover:border-emerald-500 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group relative cursor-grab active:cursor-grabbing">
              <!-- Header Gradient Thumbnail -->
              <div class="p-5 bg-gradient-to-br ${e.thumbnailColor || 'from-blue-700 to-indigo-600'} text-white space-y-2 relative">
                <div class="flex items-center justify-between gap-1 flex-wrap">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="badge ${tInfo.badge} text-white font-black text-[10px] uppercase backdrop-blur-sm">
                      ${tInfo.name}
                    </span>
                    <span class="badge ${sInfo.bg} text-white font-black text-[10px] uppercase backdrop-blur-sm">
                      Lớp ${e.grade} • ${sInfo.name}
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      ⏱️ ${e.durationMinutes || 35}p
                    </span>
                    <!-- Nút Bookmark Yêu Thích ⭐ -->
                    <button onclick="examPortal.toggleFavorite('${e.id}')" class="p-1 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all hover:scale-110" title="${isFav ? 'Bỏ lưu đề thi yêu thích' : 'Lưu vào đề thi yêu thích'}">
                      <span class="text-sm">${isFav ? '⭐' : '🤍'}</span>
                    </button>
                  </div>
                </div>

                <div class="flex items-center gap-3 pt-2">
                  <span class="text-4xl filter drop-shadow-md group-hover:scale-110 transition-all">📝</span>
                  <div>
                    <p class="text-[11px] font-bold text-cyan-100 uppercase tracking-wider flex items-center gap-1">
                      <span>Thang điểm ${e.totalScore || 10} • TT 27</span>
                      <span class="text-[10px] bg-white/20 px-1.5 py-0.2 rounded" title="Kéo thẻ này vào thư mục khác để chuyển khối lớp">⠿ Kéo</span>
                    </p>
                    <h4 class="font-black text-base text-white leading-snug line-clamp-2">${e.title}</h4>
                  </div>
                </div>
              </div>

              <!-- Body Details -->
              <div class="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <p class="text-slate-600 line-clamp-2 leading-relaxed">
                  ${e.description || 'Đề kiểm tra đánh giá định kỳ môn Tin học, cấu trúc kết hợp trắc nghiệm lý thuyết và thực hành trên máy.'}
                </p>

                <div class="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div class="flex items-center justify-between">
                    <span>👨‍🏫 Người ra đề: <b>${e.authorName || 'Thầy Anh Đào'}</b></span>
                    <span>📦 Tệp: <b>${e.fileSizeText || '2.0 MB'}</b></span>
                  </div>
                  <div class="flex items-center justify-between text-slate-400">
                    <span>👁️ ${e.viewCount || 0} lượt xem</span>
                    <span>📥 ${e.downloadCount || 0} lượt tải</span>
                  </div>
                </div>

                <!-- Hàng nút hành động đa năng -->
                <div class="space-y-2 pt-2 border-t border-slate-100">
                  <!-- Hàng 1: Làm bài trực tuyến + Trộn đề 4 mã -->
                  <div class="grid grid-cols-2 gap-2">
                    <button onclick="examPortal.startOnlineTest('${e.id}')" class="btn btn-amber btn-sm font-black flex items-center justify-center gap-1 shadow-sm" title="Làm bài trắc nghiệm trực tuyến có đếm giờ và tự chấm điểm">
                      <span>✍️</span> <span>Thi Trực Tuyến</span>
                    </button>
                    <button onclick="examPortal.openShufflerModal('${e.id}')" class="btn btn-outline btn-sm font-black text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200 flex items-center justify-center gap-1" title="Tự động đảo câu hỏi tạo 4 mã đề 101, 102, 103, 104">
                      <span>🔀</span> <span>Trộn 4 Mã Đề</span>
                    </button>
                  </div>

                  <!-- Hàng 2: AI Ma Trận Thông Tư 27 + Tải Đáp Án Biểu Điểm Word -->
                  <div class="grid grid-cols-2 gap-2">
                    <button onclick="examPortal.openMatrixModal('${e.id}')" class="btn btn-outline btn-sm font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 flex items-center justify-center gap-1" title="Xem phân tích Ma trận đề 4 mức độ nhận thức">
                      <span>✨</span> <span>AI Ma Trận</span>
                    </button>
                    <button onclick="examPortal.downloadAnswerKeyDoc('${e.id}')" class="btn btn-outline btn-sm font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 flex items-center justify-center gap-1" title="Tải bảng đáp án và hướng dẫn chấm chi tiết">
                      <span>🔑</span> <span>Đáp Án & Barem</span>
                    </button>
                  </div>

                  <!-- Hàng 3: Tải Đề Word + Xem Trực Tuyến + Sửa + Xóa -->
                  <div class="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                    <button onclick="examPortal.downloadExamDoc('${e.id}')" class="btn btn-emerald btn-sm flex-1 font-black flex items-center justify-center gap-1 shadow-sm" title="Tải đề kiểm tra bản Word chuẩn Bộ GD&ĐT">
                      <span>📝</span> <span>Tải Đề Word</span>
                    </button>
                    <button onclick="examPortal.previewExam('${e.id}')" class="btn btn-outline btn-sm font-bold flex items-center gap-1" title="Xem đề thi online">
                      <span>👁️</span> <span>Xem</span>
                    </button>

                    ${canManage ? `
                      <button onclick="examUploadModal.openEditModal('${e.id}')" class="p-2 text-cyan-700 hover:bg-cyan-100 rounded-xl font-bold border border-cyan-200 transition-all hover:scale-105" title="Chỉnh sửa thông tin & đổi file đề thi">
                        ✏️
                      </button>
                      <button onclick="examPortal.openDeleteConfirmModal('${e.id}', '${e.title.replace(/'/g, "\\'")}')" class="p-2 text-rose-600 hover:bg-rose-100 rounded-xl font-bold border border-rose-200 transition-all hover:scale-105" title="Xóa bỏ đề thi này khỏi hệ thống & Supabase">
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

  toggleFavorite(id) {
    const isFav = window.examService.toggleFavorite(id);
    window.app.showToast(isFav ? "⭐ Đã thêm đề thi vào mục Yêu Thích!" : "Đã xóa khỏi mục Yêu Thích!", "info");
    this.render("main-content-area");
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.render("main-content-area");
  }

  selectGrade(grade) {
    this.enterFolder(grade);
  }

  selectExamType(type) {
    this.currentExamType = type;
    this.render("main-content-area");
  }

  selectBookSeries(series) {
    this.currentBookSeries = series;
    this.render("main-content-area");
  }

  handleSearch(query) {
    this.searchQuery = query;
    this.render("main-content-area");
  }

  // =========================================================================
  // ÂM THANH KÈN VINH DANH (WEB AUDIO API FANFARE) & PHÁO HOA RỰC RỠ
  // =========================================================================
  playVictoryFanfare() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const notes = [
        { freq: 523.25, time: 0, dur: 0.15 },
        { freq: 659.25, time: 0.15, dur: 0.15 },
        { freq: 783.99, time: 0.30, dur: 0.20 },
        { freq: 1046.50, time: 0.50, dur: 0.60 }
      ];

      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + n.time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.time + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + n.time);
        osc.stop(ctx.currentTime + n.time + n.dur);
      });
    } catch (e) {}
  }

  launchConfetti() {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"];
    const particles = [];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4;
        p.rotation += p.vr;
        p.alpha -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (frame < 90) {
        requestAnimationFrame(animate);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    };

    animate();
  }

  // =========================================================================
  // 1. LÀM BÀI THI TRỰC TUYẾN TỰ CHẤM ĐIỂM (ONLINE TEST RUNNER)
  // =========================================================================
  async startOnlineTest(id) {
    const exam = await window.examService.getExamById(id);
    if (!exam) return;

    this.activeRunnerExam = exam;
    this.runnerQuestions = window.examService.getOnlineExamQuestions(exam);
    this.runnerCurrentIndex = 0;
    this.runnerAnswers = {};
    this.runnerTimerSeconds = (exam.durationMinutes || 35) * 60;
    this.runnerStartTime = Date.now();

    if (this.runnerTimerInterval) clearInterval(this.runnerTimerInterval);

    const modal = document.getElementById("online-exam-runner-modal");
    const titleDisp = document.getElementById("exam-runner-title-disp");
    if (titleDisp) titleDisp.innerText = exam.title;

    if (modal) modal.classList.add("active");

    this.startRunnerCountdown();
    this.renderRunnerQuestion();
  }

  startRunnerCountdown() {
    const timerDisp = document.getElementById("exam-runner-timer-disp");
    this.runnerTimerInterval = setInterval(() => {
      this.runnerTimerSeconds--;
      const mins = Math.floor(this.runnerTimerSeconds / 60);
      const secs = this.runnerTimerSeconds % 60;
      if (timerDisp) timerDisp.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

      if (this.runnerTimerSeconds <= 0) {
        clearInterval(this.runnerTimerInterval);
        this.submitOnlineTest();
      }
    }, 1000);
  }

  renderRunnerQuestion() {
    const qContainer = document.getElementById("exam-runner-question-body");
    const navTrack = document.getElementById("exam-runner-nav-track");
    const q = this.runnerQuestions[this.runnerCurrentIndex];

    if (!q || !qContainer) return;

    if (navTrack) {
      navTrack.innerHTML = this.runnerQuestions.map((_, idx) => {
        const isAnswered = this.runnerAnswers[idx] !== undefined;
        const isCurrent = this.runnerCurrentIndex === idx;
        return `
          <button onclick="examPortal.jumpToQuestion(${idx})" class="w-8 h-8 rounded-xl font-black text-xs transition-all ${isCurrent ? 'bg-amber-500 text-slate-950 scale-110 shadow' : isAnswered ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
            ${idx + 1}
          </button>
        `;
      }).join("");
    }

    const selectedOption = this.runnerAnswers[this.runnerCurrentIndex];

    qContainer.innerHTML = `
      <div class="space-y-4 animate-pop">
        <div class="flex items-center justify-between">
          <span class="badge badge-emerald font-black text-[11px]">CÂU HỎI ${this.runnerCurrentIndex + 1} / ${this.runnerQuestions.length}</span>
          <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">${q.level} • 1.0 Điểm</span>
        </div>

        <h3 class="text-base md:text-lg font-black text-slate-900 leading-snug">${q.question}</h3>

        <div class="grid grid-cols-1 gap-2.5 pt-2">
          ${q.options.map((opt, oIdx) => {
            const isSel = selectedOption === oIdx;
            return `
              <button onclick="examPortal.selectRunnerAnswer(${oIdx})" class="p-3.5 md:p-4 rounded-2xl border-2 text-left font-bold text-xs md:text-sm transition-all flex items-center gap-3 ${isSel ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-md scale-101' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}">
                <span class="w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${isSel ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}">
                  ${['A', 'B', 'C', 'D'][oIdx]}
                </span>
                <span>${opt.replace(/^[A-D]\.\s*/, '')}</span>
              </button>
            `;
          }).join("")}
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-slate-200">
          <button onclick="examPortal.prevRunnerQuestion()" ${this.runnerCurrentIndex === 0 ? 'disabled class="btn btn-outline btn-sm opacity-40"' : 'class="btn btn-outline btn-sm"'}>
            ⬅️ Câu Trước
          </button>
          
          <div class="flex items-center gap-2">
            ${this.runnerCurrentIndex + 1 < this.runnerQuestions.length ? `
              <button onclick="examPortal.nextRunnerQuestion()" class="btn btn-primary btn-sm font-black">
                Câu Kế Tiếp ➡️
              </button>
            ` : `
              <button onclick="examPortal.confirmSubmitTest()" class="btn btn-emerald btn-sm font-black shadow-lg">
                🚀 Nộp Bài & Xem Điểm
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  selectRunnerAnswer(oIdx) {
    this.runnerAnswers[this.runnerCurrentIndex] = oIdx;
    this.renderRunnerQuestion();
  }

  jumpToQuestion(idx) {
    this.runnerCurrentIndex = idx;
    this.renderRunnerQuestion();
  }

  nextRunnerQuestion() {
    if (this.runnerCurrentIndex + 1 < this.runnerQuestions.length) {
      this.runnerCurrentIndex++;
      this.renderRunnerQuestion();
    }
  }

  prevRunnerQuestion() {
    if (this.runnerCurrentIndex > 0) {
      this.runnerCurrentIndex--;
      this.renderRunnerQuestion();
    }
  }

  confirmSubmitTest() {
    const answeredCount = Object.keys(this.runnerAnswers).length;
    if (answeredCount < this.runnerQuestions.length) {
      if (!confirm(`Em mới trả lời ${answeredCount}/${this.runnerQuestions.length} câu hỏi. Em có chắc chắn muốn nộp bài thi ngay không?`)) {
        return;
      }
    }
    this.submitOnlineTest();
  }

  async submitOnlineTest() {
    if (this.runnerTimerInterval) clearInterval(this.runnerTimerInterval);

    let correctCount = 0;
    this.runnerQuestions.forEach((q, idx) => {
      if (this.runnerAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    const user = window.authService?.getUser() || { name: "Nguyễn Văn An", class: "3A" };
    const rawScore = Number(((correctCount / this.runnerQuestions.length) * 7.0 + 3.0).toFixed(1));
    const durationSpent = Math.floor((Date.now() - this.runnerStartTime) / 1000);

    const result = await window.examService.submitExamAttempt({
      examId: this.activeRunnerExam?.id,
      examTitle: this.activeRunnerExam?.title,
      studentName: user.name,
      className: user.class || (this.activeRunnerExam?.grade === 3 ? "3A" : this.activeRunnerExam?.grade === 4 ? "4A" : "5A"),
      grade: this.activeRunnerExam?.grade,
      score: rawScore,
      durationSpentSeconds: durationSpent
    });

    if (result.score >= 9.0) {
      this.playVictoryFanfare();
      this.launchConfetti();
    }

    const qContainer = document.getElementById("exam-runner-question-body");
    const navTrack = document.getElementById("exam-runner-nav-track");
    if (navTrack) navTrack.innerHTML = "";

    if (qContainer) {
      qContainer.innerHTML = `
        <div class="text-center py-6 space-y-5 animate-pop">
          <span class="text-6xl block ${result.score >= 9 ? 'animate-bounce' : ''}">${result.score >= 9 ? '🏆' : '🎉'}</span>
          <h3 class="text-2xl font-black text-slate-900">HOÀN THÀNH BÀI KIỂM TRA TRỰC TUYẾN!</h3>
          <p class="text-xs text-slate-600">Bài thi của em đã được hệ thống tự động chấm và lưu vào sổ học bạ số!</p>

          <div class="inline-block p-5 bg-gradient-to-br from-amber-50 to-emerald-50 rounded-3xl border-2 border-amber-300 shadow-md space-y-1">
            <p class="text-xs font-bold text-slate-600">Kết Quả Điểm Số Đạt Được:</p>
            <p class="text-4xl font-black text-emerald-700">${result.score} / 10 Điểm</p>
            <p class="text-xs font-black text-indigo-800">Xếp Loại: ${result.classification}</p>
            <p class="text-xs text-amber-600 font-bold">Thưởng: +${result.starsEarned} ⭐ Sao Vàng Vui Học!</p>
          </div>

          <!-- Chi tiết câu trả lời -->
          <div class="text-left space-y-3 pt-3 border-t border-slate-200">
            <h4 class="font-extrabold text-slate-800 text-xs">📖 BẢNG GIẢI THÍCH CHI TIẾT TỪNG CÂU:</h4>
            <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
              ${this.runnerQuestions.map((q, idx) => {
                const userAns = this.runnerAnswers[idx];
                const isRight = userAns === q.correct;
                return `
                  <div class="p-3 rounded-xl border text-xs ${isRight ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'}">
                    <p class="font-bold">Câu ${idx + 1}: ${q.question}</p>
                    <p class="text-[11px] mt-1">
                      - Em chọn: <b>${userAns !== undefined ? ['A', 'B', 'C', 'D'][userAns] : 'Chưa trả lời'}</b> ${isRight ? '✅ Đúng' : `❌ Sai (Đáp án đúng: <b>${['A', 'B', 'C', 'D'][q.correct]}</b>)`}
                    </p>
                    <p class="text-[10px] text-slate-500 italic mt-0.5">💡 Giải thích: ${q.explanation}</p>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <div class="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button onclick="examPortal.openParentReportModal('${result.id}')" class="btn btn-outline btn-md font-black text-emerald-800 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1.5 shadow">
              <span>📱</span> <span>Báo Điểm Về Zalo / Phụ Huynh</span>
            </button>
            <button onclick="examPortal.closeRunnerModal()" class="btn btn-primary font-black btn-md px-6 shadow-lg">
              ✨ Hoàn Tất & Về Ngân Hàng Đề
            </button>
          </div>
        </div>
      `;
    }
  }

  closeRunnerModal() {
    if (this.runnerTimerInterval) clearInterval(this.runnerTimerInterval);
    const modal = document.getElementById("online-exam-runner-modal");
    if (modal) modal.classList.remove("active");
  }

  // =========================================================================
  // 2. XUẤT BẢNG ĐÁP ÁN & BIỂU ĐIỂM CHI TIẾT WORD
  // =========================================================================
  async downloadAnswerKeyDoc(id) {
    const exam = await window.examService.getExamById(id);
    if (!exam) return;

    if (window.docExportService && window.docExportService.exportAnswerKeyDoc) {
      window.docExportService.exportAnswerKeyDoc(exam);
      window.app.showToast(`🔑 Đang tải xuống Đáp Án & Hướng Dẫn Chấm: ${exam.title}!`, "success");
    }
  }

  // =========================================================================
  // 3. BẢNG THỐNG KÊ & PHỔ ĐIỂM KIỂM TRA (ANALYTICS MODAL)
  // =========================================================================
  openAnalyticsModal() {
    const data = window.examService.getScoreDistributionSummary();
    const modal = document.getElementById("exam-analytics-modal");
    const content = document.getElementById("exam-analytics-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-6 text-xs text-slate-800 animate-pop">
          <!-- 4 Thẻ KPI Phổ Điểm -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div class="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
              <span class="text-2xl block mb-1">📝</span>
              <p class="text-slate-500 font-bold text-[10px]">TỔNG LƯỢT THI</p>
              <p class="text-xl font-black text-blue-700">${data.totalAttempts}</p>
            </div>
            <div class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span class="text-2xl block mb-1">🎯</span>
              <p class="text-slate-500 font-bold text-[10px]">ĐIỂM TRUNG BÌNH</p>
              <p class="text-xl font-black text-emerald-700">${data.avgScore}</p>
            </div>
            <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
              <span class="text-2xl block mb-1">⭐</span>
              <p class="text-slate-500 font-bold text-[10px]">HOÀN THÀNH TỐT (T)</p>
              <p class="text-xl font-black text-amber-700">${data.countExcellent} (${Math.round((data.countExcellent / (data.totalAttempts || 1)) * 100)}%)</p>
            </div>
            <div class="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl">
              <span class="text-2xl block mb-1">🏅</span>
              <p class="text-slate-500 font-bold text-[10px]">HOÀN THÀNH (H)</p>
              <p class="text-xl font-black text-purple-700">${data.countPass}</p>
            </div>
          </div>

          <!-- Biểu Đồ Thanh Phổ Điểm -->
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 class="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <span>📊</span> <span>BIỂU ĐỒ PHỔ ĐIỂM & TỶ LỆ XẾP LOẠI THEO THÔNG TƯ 27</span>
            </h4>
            <div class="space-y-2.5">
              ${Object.entries(data.scoreBuckets).map(([label, count]) => {
                const pct = data.totalAttempts > 0 ? (count / data.totalAttempts) * 100 : 0;
                return `
                  <div>
                    <div class="flex justify-between text-[11px] font-bold text-slate-700 pb-1">
                      <span>Mức Điểm: <b>${label}</b></span>
                      <span>${count} Học sinh (${pct.toFixed(0)}%)</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div class="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2.5 rounded-full transition-all duration-1000" style="width: ${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Bảng Vinh Danh & Nút Xuất Bảng Điểm -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-200">
            <span class="text-[11px] text-slate-400">Xuất báo cáo kết quả kiểm tra cho BGH</span>
            <div class="flex items-center gap-2">
              <button onclick="examPortal.exportClassGradebookDoc('3A')" class="btn btn-emerald btn-sm font-black flex items-center gap-1 shadow-md">
                <span>📊</span> <span>Xuất Bảng Điểm Lớp 3A (.doc)</span>
              </button>
              <button onclick="document.getElementById('exam-analytics-modal').classList.remove('active')" class="btn btn-outline btn-sm font-bold">
                Đóng
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  // =========================================================================
  // 4. TRỘN ĐỀ THI TỰ ĐỘNG (AUTO EXAM SHUFFLER - 4 MÃ ĐỀ)
  // =========================================================================
  async openShufflerModal(id) {
    const exam = await window.examService.getExamById(id);
    if (!exam) return;

    window.app.showToast("🔀 Đang hoán vị câu hỏi và sinh 4 mã đề (101, 102, 103, 104)...", "info");
    const shuffledData = window.examService.shuffleExamVersions(exam);
    this.currentShuffledData = shuffledData;
    this.currentShuffledExam = exam;

    const modal = document.getElementById("exam-shuffler-modal");
    const content = document.getElementById("exam-shuffler-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-5 text-xs text-slate-800 animate-pop">
          <div class="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 flex items-start justify-between gap-3">
            <div>
              <span class="badge bg-purple-600 text-white font-black text-[10px]">AUTO EXAM SHUFFLER</span>
              <h3 class="text-base font-black text-slate-900 mt-1">${exam.title}</h3>
              <p class="text-[11px] text-purple-800 font-semibold">Đã tạo thành công 4 mã đề hoán vị: <b>101, 102, 103, 104</b> kèm bảng ma trận đáp án</p>
            </div>
            <span class="text-3xl">🔀</span>
          </div>

          <!-- Bảng Đáp Án Đối Chiếu 4 Mã Đề -->
          <div class="space-y-2">
            <h4 class="font-extrabold text-slate-900 text-xs">📋 BẢNG ĐÁP ÁN ĐỐI CHIẾU 4 MÃ ĐỀ IN ẤN:</h4>
            <div class="overflow-x-auto">
              <table class="w-full text-center border-collapse border border-slate-200 rounded-xl overflow-hidden text-xs">
                <thead class="bg-slate-100 font-black text-slate-700">
                  <tr>
                    <th class="p-2.5 border border-slate-200">Câu Hỏi</th>
                    <th class="p-2.5 border border-slate-200 text-blue-700">Mã Đề 101</th>
                    <th class="p-2.5 border border-slate-200 text-amber-700">Mã Đề 102</th>
                    <th class="p-2.5 border border-slate-200 text-emerald-700">Mã Đề 103</th>
                    <th class="p-2.5 border border-slate-200 text-rose-700">Mã Đề 104</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 font-bold">
                  ${shuffledData.answerMatrix.map(m => `
                    <tr class="hover:bg-slate-50">
                      <td class="p-2 border border-slate-200 font-bold text-slate-700">Câu ${m.questionNum}</td>
                      <td class="p-2 border border-slate-200 text-blue-700 font-black bg-blue-50/50">${m.code101}</td>
                      <td class="p-2 border border-slate-200 text-amber-700 font-black bg-amber-50/50">${m.code102}</td>
                      <td class="p-2 border border-slate-200 text-emerald-700 font-black bg-emerald-50/50">${m.code103}</td>
                      <td class="p-2 border border-slate-200 text-rose-700 font-black bg-rose-50/50">${m.code104}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Nút Tải Bộ 4 Mã Đề Word -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-200">
            <span class="text-[11px] text-slate-400">File Word bao gồm trang bảng đáp án + 4 đề thi riêng biệt</span>
            <div class="flex items-center gap-2">
              <button onclick="examPortal.downloadShuffledWordDoc()" class="btn btn-primary btn-sm font-black bg-purple-700 hover:bg-purple-800 text-white shadow-md">
                📥 Tải Trọn Bộ 4 Mã Đề Word (.doc)
              </button>
              <button onclick="document.getElementById('exam-shuffler-modal').classList.remove('active')" class="btn btn-outline btn-sm font-bold">
                Đóng
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  downloadShuffledWordDoc() {
    if (this.currentShuffledExam && this.currentShuffledData) {
      window.docExportService.exportShuffledExamsDoc(this.currentShuffledExam, this.currentShuffledData);
      window.app.showToast("📥 Đang tải xuống trọn bộ 4 mã đề thi hoán vị Word!", "success");
    }
  }

  // =========================================================================
  // 5. XEM LẠI LỊCH SỬ LÀM BÀI THEO LỚP & XUẤT BẢNG ĐIỂM
  // =========================================================================
  openHistoryModal() {
    const history = window.examService.getExamHistory({
      className: this.historyClass,
      searchQuery: this.historySearch
    });

    const modal = document.getElementById("exam-history-modal");
    const content = document.getElementById("exam-history-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-4 text-xs text-slate-800 animate-pop">
          <!-- Thanh lọc Lớp & Tìm kiếm Học sinh -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-slate-500 text-[11px]">Chọn Lớp:</span>
              ${['all', '3A', '3B', '4A', '4B', '5A', '5B'].map(cls => `
                <button onclick="examPortal.selectHistoryClass('${cls}')" class="px-2.5 py-1 rounded-xl text-xs font-black transition-all ${this.historyClass === cls ? 'bg-cyan-700 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}">
                  ${cls === 'all' ? 'Tất Cả' : `Lớp ${cls}`}
                </button>
              `).join("")}
            </div>

            <div class="flex items-center gap-2 w-full md:w-auto">
              <input type="text" value="${this.historySearch}" oninput="examPortal.handleHistorySearch(this.value)" placeholder="Tìm tên học sinh, đề thi..." class="form-control text-xs py-1.5 pl-3">
              <button onclick="examPortal.exportClassGradebookDoc(examPortal.historyClass === 'all' ? '3A' : examPortal.historyClass)" class="btn btn-emerald btn-sm font-black flex items-center gap-1 shadow shrink-0" title="Xuất bảng điểm lớp hiện tại ra file Word">
                <span>📊</span> <span>Xuất Điểm ${this.historyClass === 'all' ? 'Lớp 3A' : `Lớp ${this.historyClass}`}</span>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
            <span>Hiển thị <b>${history.length}</b> lượt làm bài kiểm tra</span>
            <span class="text-amber-600 font-black">⭐ Đánh giá định kỳ theo TT 27/2020</span>
          </div>

          <div class="overflow-x-auto border border-slate-200 rounded-2xl max-h-80 overflow-y-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-slate-100 text-slate-700 font-black text-[11px] sticky top-0">
                <tr>
                  <th class="p-3">Học Sinh</th>
                  <th class="p-3 text-center">Lớp</th>
                  <th class="p-3">Tên Đề Thi</th>
                  <th class="p-3 text-center">Điểm Số</th>
                  <th class="p-3 text-center">Xếp Loại</th>
                  <th class="p-3 text-center">Báo Điểm</th>
                  <th class="p-3 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium">
                ${history.length === 0 ? `
                  <tr>
                    <td colspan="7" class="p-8 text-center text-slate-400 font-bold">Không tìm thấy lượt làm bài nào trong lớp này.</td>
                  </tr>
                ` : history.map((h, idx) => `
                  <tr class="hover:bg-slate-50">
                    <td class="p-3 font-bold text-slate-900">${h.studentName}</td>
                    <td class="p-3 text-center"><span class="badge badge-cyan text-[10px] font-black">${h.className || '3A'}</span></td>
                    <td class="p-3 font-semibold text-slate-700 line-clamp-1 max-w-[200px]">${h.examTitle}</td>
                    <td class="p-3 text-center font-black text-emerald-700 text-sm">${h.score} / 10</td>
                    <td class="p-3 text-center"><span class="badge ${h.score >= 9 ? 'badge-amber' : 'badge-emerald'} text-[10px] font-black">${h.classification}</span></td>
                    <td class="p-3 text-center">
                      <button onclick="examPortal.openParentReportModal('${h.id}')" class="btn btn-outline btn-xs font-black text-emerald-800 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1 mx-auto" title="Gửi kết quả kiểm tra cho Phụ huynh qua Zalo">
                        <span>📱</span> <span>Báo Zalo</span>
                      </button>
                    </td>
                    <td class="p-3 text-center">
                      <button onclick="examPortal.deleteAttemptRecord('${h.id}')" class="text-rose-500 hover:text-rose-700 font-bold p-1" title="Xóa lượt thi này">
                        🗑️
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  selectHistoryClass(className) {
    this.historyClass = className;
    this.openHistoryModal();
  }

  handleHistorySearch(query) {
    this.historySearch = query;
    this.openHistoryModal();
  }

  deleteAttemptRecord(attemptId) {
    if (confirm("Thầy Cô có chắc chắn muốn xóa bản ghi kết quả thi này?")) {
      window.examService.deleteExamHistory(attemptId);
      window.app.showToast("🗑️ Đã xóa bản ghi lượt thi thành công!", "info");
      this.openHistoryModal();
    }
  }

  exportClassGradebookDoc(className = "3A") {
    const history = window.examService.getExamHistory({ className: className === 'all' ? '3A' : className });
    if (window.docExportService?.exportGradebookExcelDoc) {
      window.docExportService.exportGradebookExcelDoc(className, 3, history);
      window.app.showToast(`📊 Đang tải xuống Bảng Điểm Tổng Hợp Lớp ${className}!`, "success");
    }
  }

  // =========================================================================
  // 6. GỬI THÔNG BÁO BÁO ĐIỂM VỀ ZALO / EMAIL PHỤ HUYNH
  // =========================================================================
  openParentReportModal(attemptId) {
    const att = window.examService.getAttemptById(attemptId);
    if (!att) return;

    const messageTemplate = `🏫 TRƯỜNG TIỂU HỌC VUI HỌC - THÔNG BÁO KẾT QUẢ KIỂM TRA ĐỊNH KỲ
👨‍🎓 Kính gửi Quý Phụ huynh em: ${att.studentName} - Lớp: ${att.className || '3A'}
📝 Bài kiểm tra: ${att.examTitle}
🎯 Điểm số đạt được: ${att.score} / 10 Điểm
🏅 Xếp loại theo TT 27/2020: ${att.classification}
⭐ Phần thưởng: +${att.starsEarned || 20} Sao Vàng Vui Học
💬 Nhận xét của Thầy/Cô: ${att.teacherComment || 'Em nắm rất vững kiến thức lý thuyết và thực hành máy tính xuất sắc!'}
------------------------------------
Trân trọng cảm ơn Quý Phụ huynh đã luôn đồng hành cùng nhà trường!`;

    const modal = document.getElementById("exam-parent-report-modal");
    const content = document.getElementById("exam-parent-report-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-4 text-xs text-slate-800 animate-pop">
          <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
            <div class="flex items-center justify-between">
              <span class="badge badge-emerald font-black text-[10px]">PHIẾU BÁO ĐIỂM ĐỊNH KỲ</span>
              <span class="font-bold text-slate-600">Lớp: <b>${att.className || '3A'}</b></span>
            </div>
            <h3 class="text-base font-black text-slate-900">${att.studentName}</h3>
            <p class="text-emerald-800 font-bold">🎯 Điểm: <b>${att.score}/10</b> • ${att.classification}</p>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Mẫu Tin Nhắn Báo Điểm Tự Động (Gửi Zalo / SMS):</label>
            <textarea id="parent-report-text" rows="8" class="form-control text-xs font-mono leading-relaxed p-3">${messageTemplate}</textarea>
          </div>

          <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 flex-wrap">
            <span class="text-[11px] text-slate-400">Thầy Cô bấm sao chép và dán vào Zalo nhóm lớp</span>
            <div class="flex items-center gap-2">
              <button onclick="examPortal.copyParentReportText()" class="btn btn-outline btn-sm font-black text-cyan-800 border-cyan-300 hover:bg-cyan-50 flex items-center gap-1">
                <span>📋</span> <span>Sao Chép Tin Nhắn</span>
              </button>
              <a href="https://zalo.me" target="_blank" class="btn btn-primary btn-sm font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1">
                <span>📲</span> <span>Mở Zalo Web / App</span>
              </a>
              <button onclick="document.getElementById('exam-parent-report-modal').classList.remove('active')" class="btn btn-outline btn-sm font-bold">
                Đóng
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  copyParentReportText() {
    const textarea = document.getElementById("parent-report-text");
    if (textarea) {
      textarea.select();
      navigator.clipboard.writeText(textarea.value);
      window.app.showToast("📋 Đã sao chép nội dung báo điểm! Thầy Cô hãy dán vào Zalo Phụ huynh.", "success");
    }
  }

  // =========================================================================
  // 7. AI TỰ ĐỘNG SINH ĐỀ KIỂM TRA THEO TỪNG CHỦ ĐỀ GDPT 2018
  // =========================================================================
  openAIGeneratorModal() {
    const modal = document.getElementById("ai-exam-generator-modal");
    if (modal) modal.classList.add("active");
  }

  async executeAIGenerateExam() {
    const grade = document.getElementById("ai-gen-grade")?.value || (this.selectedFolder !== 'all' ? this.selectedFolder : "3");
    const topicKey = document.getElementById("ai-gen-topic")?.value || "topic_a";
    const series = document.getElementById("ai-gen-series")?.value || "KNTT";

    const btn = document.getElementById("btn-submit-ai-gen");
    if (btn) {
      btn.innerHTML = "⏳ AI Đang Biên Soạn Đề Chuẩn TT 27...";
      btn.classList.add("pointer-events-none");
    }

    window.app.showToast("✨ AI đang tổng hợp kiến thức và sinh đề kiểm tra mới...", "info");
    const res = await window.examService.generateExamByTopicAI(grade, topicKey, series);

    if (btn) {
      btn.innerHTML = "✨ Bắt Đầu Sinh Đề Ngay";
      btn.classList.remove("pointer-events-none");
    }

    document.getElementById("ai-exam-generator-modal")?.classList.remove("active");

    if (res.success) {
      window.app.showToast(`🎉 AI đã sinh thành công Đề kiểm tra mới và lưu vào Ngân Hàng Đề!`, "success");
      this.render("main-content-area");
    }
  }

  // =========================================================================
  // XEM MA TRẬN ĐỀ THI & BẢN ĐẶC TẢ CHUẨN THÔNG TƯ 27 (AI MATRIX MODAL)
  // =========================================================================
  async openMatrixModal(id) {
    const exam = await window.examService.getExamById(id);
    if (!exam) return;

    window.app.showToast("✨ AI đang phân tích và sinh bảng ma trận đặc tả theo Thông tư 27...", "info");
    const matrix = await window.examService.generateAIMatrix(exam.title, exam.grade, exam.examType);

    const modal = document.getElementById("exam-matrix-modal");
    const content = document.getElementById("exam-matrix-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-5 text-xs text-slate-800 animate-pop">
          <div class="p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl border border-indigo-200 flex items-start justify-between gap-3">
            <div>
              <span class="badge bg-indigo-600 text-white font-black text-[10px]">MA TRẬN ĐỀ THEO THÔNG TƯ 27/2020</span>
              <h3 class="text-base font-black text-slate-900 mt-1">${matrix.title}</h3>
              <p class="text-[11px] text-cyan-800 font-semibold">Khối Lớp ${matrix.grade} • Thời gian làm bài: ${matrix.distribution.duration}</p>
            </div>
            <span class="text-3xl">📐</span>
          </div>

          <!-- Bảng 4 Mức Độ Nhận Thức -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden text-xs">
              <thead class="bg-slate-100 text-slate-700 font-black text-[11px]">
                <tr>
                  <th class="p-3 border border-slate-200">Mức Độ Nhận Thức</th>
                  <th class="p-3 border border-slate-200">Tỷ Lệ</th>
                  <th class="p-3 border border-slate-200">Số Lượng Câu Hỏi & Điểm</th>
                  <th class="p-3 border border-slate-200">Nội Dung Yêu Cầu Cần Đạt</th>
                </tr>
              </thead>
              <tbody class="divide-y border-slate-200 font-medium text-slate-700">
                ${matrix.levels.map(lvl => `
                  <tr class="hover:bg-slate-50 transition-all">
                    <td class="p-3 font-bold border border-slate-200 text-slate-900">${lvl.level}</td>
                    <td class="p-3 font-black text-indigo-700 border border-slate-200">${lvl.percent}</td>
                    <td class="p-3 font-bold text-emerald-800 border border-slate-200">${lvl.questions}</td>
                    <td class="p-3 border border-slate-200 text-[11px]">${lvl.desc}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <!-- Phân Bố Điểm Số & Tiêu Chí Đánh Giá -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
              <h4 class="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                <span>🎯</span> <span>CẤU TRÚC ĐỀ THI</span>
              </h4>
              <p class="text-emerald-800 font-semibold">• Phần Lý Thuyết (Trắc nghiệm): <b>${matrix.distribution.theoryScore} Điểm (70%)</b></p>
              <p class="text-emerald-800 font-semibold">• Phần Thực Hành (Trên máy tính): <b>${matrix.distribution.practiceScore} Điểm (30%)</b></p>
            </div>

            <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
              <h4 class="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                <span>💡</span> <span>HƯỚNG DẪN XẾP LOẠI HỌC SINH</span>
              </h4>
              <p class="text-amber-800 font-medium">• Hoàn thành Tốt (T): Đạt từ 9.0 - 10.0 điểm</p>
              <p class="text-amber-800 font-medium">• Hoàn thành (H): Đạt từ 5.0 - 8.9 điểm</p>
              <p class="text-amber-800 font-medium">• Chưa hoàn thành (C): Dưới 5.0 điểm</p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-400">
            <span>Tiêu chuẩn: <b>GDPT 2018 & TT 27/2020</b></span>
            <div class="flex items-center gap-2">
              <button onclick="examPortal.downloadExamDoc('${exam.id}')" class="btn btn-emerald btn-sm font-black">
                📝 Tải Đề Thi & Ma Trận (.doc)
              </button>
              <button onclick="document.getElementById('exam-matrix-modal').classList.remove('active')" class="btn btn-outline btn-sm font-bold">
                Đóng
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  // =========================================================================
  // XUẤT ĐỀ THI WORD (.DOC) KÈM MA TRẬN & ĐÁP ÁN
  // =========================================================================
  async downloadExamDoc(id) {
    const exam = await window.examService.getExamById(id);
    if (!exam) return;

    await window.examService.recordAction(id, 'download');

    if (window.docExportService && window.docExportService.exportExamDoc) {
      window.docExportService.exportExamDoc(exam);
      window.app.showToast(`📝 Đang tải xuống Đề kiểm tra Word: ${exam.title}!`, "success");
    } else {
      window.app.showToast(`📥 Đang tải xuống tệp: ${exam.fileName}`, "success");
    }
  }

  // =========================================================================
  // XEM ĐỀ TRỰC TUYẾN (PREVIEW EXAM)
  // =========================================================================
  async previewExam(id) {
    const exam = await window.examService.getExamById(id);
    if (!exam) return;

    await window.examService.recordAction(id, 'view');

    const modal = document.getElementById("exam-preview-modal");
    const titleDisp = document.getElementById("exam-preview-title");
    const frame = document.getElementById("exam-preview-iframe");

    if (titleDisp) titleDisp.innerText = exam.title;

    if (frame) {
      let embedUrl = exam.fileUrl;
      if (embedUrl.startsWith("http") && !embedUrl.includes("view.officeapps.live.com") && !embedUrl.includes("drive.google.com")) {
        embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(embedUrl)}`;
      }
      frame.src = embedUrl;
    }

    if (modal) modal.classList.add("active");
  }

  closePreviewModal() {
    const modal = document.getElementById("exam-preview-modal");
    const frame = document.getElementById("exam-preview-iframe");
    if (frame) frame.src = "";
    if (modal) modal.classList.remove("active");
  }

  // =========================================================================
  // XÓA ĐỀ KIỂM TRA (DELETE EXAM WITH CONFIRMATION & SUPABASE SYNC)
  // =========================================================================
  openDeleteConfirmModal(id, title) {
    this.pendingDeleteId = id;
    this.pendingDeleteTitle = title;

    const modal = document.getElementById("exam-delete-modal");
    const nameDisp = document.getElementById("exam-delete-name-disp");

    if (nameDisp) nameDisp.innerText = title;
    if (modal) modal.classList.add("active");
  }

  closeDeleteModal() {
    this.pendingDeleteId = null;
    this.pendingDeleteTitle = "";
    const modal = document.getElementById("exam-delete-modal");
    if (modal) modal.classList.remove("active");
  }

  async executeDeleteExam() {
    if (!this.pendingDeleteId) return;

    const id = this.pendingDeleteId;
    const title = this.pendingDeleteTitle;

    const btn = document.getElementById("btn-confirm-delete-exam");
    if (btn) {
      btn.innerHTML = "⏳ Đang xóa từ Supabase...";
      btn.classList.add("pointer-events-none");
    }

    const res = await window.examService.deleteExam(id);

    if (btn) {
      btn.innerHTML = "🗑️ Xóa Vĩnh Viễn";
      btn.classList.remove("pointer-events-none");
    }

    this.closeDeleteModal();

    if (res.success) {
      window.app.showToast(`🗑️ Đã xóa đề kiểm tra "${title}" thành công khỏi hệ thống & Supabase!`, "success");
      this.render("main-content-area");
    } else {
      window.app.showToast("Không thể xóa đề kiểm tra, vui lòng thử lại!", "error");
    }
  }

  // TẢI TRỌN BỘ TẤT CẢ ĐỀ THI TRONG THƯ MỤC VỀ MÁY 1 CHẠM (.ZIP)
  downloadFolderZip(grade = "all") {
    if (window.docExportService && window.docExportService.exportFolderZip) {
      window.docExportService.exportFolderZip(grade);
    } else {
      window.app.showToast("Dịch vụ nén Zip đang khởi tạo, vui lòng thử lại sau 1 giây!", "warning");
    }
  }
}

window.examPortal = new ExamPortal();
