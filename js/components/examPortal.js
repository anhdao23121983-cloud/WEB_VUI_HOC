/**
 * EXAM PORTAL COMPONENT
 * Quản lý Menu KIỂM TRA & ĐÁNH GIÁ ĐỊNH KỲ:
 * - 📁 3 Thư Mục Con (Lớp 3, Lớp 4, Lớp 5)
 * - 🎨 Tùy chỉnh Tên, Icon, Màu Sắc & Mô tả
 * - 📦 Tải Trọn Bộ Tất Cả Đề Thi Trong Thư Mục Về Máy 1 Chạm (.zip)
 * - 🖐️ Kéo Thả Đề Thi Để Di Chuyển Giữa Các Thư Mục (Drag & Drop Move Exams)
 * - 🔐 Khóa Thư Mục Bằng Mật Khẩu Trước Giờ Kiểm Tra (Lock Folder with Password)
 * - 🖨️ In Hàng Loạt Toàn Bộ Đề Thi Ra Giấy 1 Lần Bấm (Batch Print Exams)
 * - 📡 Chế Độ Giám Thị Quan Sát Học Sinh Đang Thi Trực Tuyến (Live Exam Proctoring)
 * - 🚨 Phát Hiện & Cảnh Báo Học Sinh Chuyển Tab / Gian Lận (Anti-Cheat Detection)
 * - 🎖️ In Giấy Khen Vinh Danh Học Sinh Đạt Điểm 9-10 Trực Tiếp Ra Giấy A4 (Honor Certificate)
 * - 📚 Thư Viện Ngân Hàng Câu Hỏi Trắc Nghiệm Động (Dynamic Question Bank)
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

    // Live Proctoring State
    this.proctorGrade = "all";
    this.proctorInterval = null;

    // Question Bank State
    this.qbGrade = "all";
    this.qbLevel = "all";
    this.qbSearch = "";
    this.editingQuestionId = null;

    // Certificate State
    this.currentCertData = null;

    // Online Test Runner & Anti-Cheat State
    this.activeRunnerExam = null;
    this.runnerQuestions = [];
    this.runnerCurrentIndex = 0;
    this.runnerAnswers = {}; // { qIdx: selectedOptionIdx }
    this.runnerTimerSeconds = 2100; // 35 phút
    this.runnerTimerInterval = null;
    this.runnerStartTime = 0;
    this.tabSwitchCount = 0;
    this.isAntiCheatListening = false;
    this.boundVisibilityHandler = null;
    this.boundBlurHandler = null;

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
            <p class="text-cyan-100 text-xs md:text-sm">Giấy Khen Điểm 10 A4, Ngân Hàng Câu Hỏi Động, Giám Thị Live & Chống Gian Lận</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="examPortal.openQuestionBankModal(examPortal.selectedFolder)" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md" title="Mở thư viện ngân hàng câu hỏi trắc nghiệm">
              <span>📚</span> <span>Ngân Hàng Câu Hỏi</span>
            </button>
            ${isTeacher ? `
              <button onclick="examPortal.openLiveProctorModal(examPortal.selectedFolder)" class="btn bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 px-3.5 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-lg animate-pulse hover:scale-105 transition-all" title="Giám thị quan sát màn hình học sinh đang làm bài thi thời gian thực">
                <span>📡</span> <span>Giám Thị Live</span>
              </button>
            ` : ''}
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
                <button onclick="examPortal.openQuestionBankModal(${this.selectedFolder})" class="btn btn-outline btn-xs font-black bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 shadow-sm flex items-center gap-1">
                  <span>📚</span> <span>Ngân Hàng Câu Hỏi Lớp ${this.selectedFolder}</span>
                </button>
                <button onclick="examPortal.downloadFolderZip(${this.selectedFolder})" class="btn btn-outline btn-xs font-black bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 shadow-sm flex items-center gap-1" title="Tải trọn bộ đề thi lớp này dạng tệp nén .zip">
                  <span>📦</span> <span>Tải Trọn Bộ Lớp ${this.selectedFolder} (.zip)</span>
                </button>
                <button onclick="examPortal.openBatchPrintModal(${this.selectedFolder})" class="btn btn-outline btn-xs font-black bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-sm flex items-center gap-1" title="In toàn bộ đề thi của lớp này ra máy in">
                  <span>🖨️</span> <span>In Hàng Loạt</span>
                </button>
                ${isTeacher ? `
                  <button onclick="examPortal.openLiveProctorModal(${this.selectedFolder})" class="btn bg-rose-600 hover:bg-rose-700 text-white font-bold btn-xs flex items-center gap-1 shadow">
                    <span>📡</span> <span>Giám Thị Lớp ${this.selectedFolder}</span>
                  </button>
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
                <button onclick="examPortal.openQuestionBankModal(${this.selectedFolder !== 'all' ? this.selectedFolder : 'all'})" class="btn btn-outline btn-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 flex items-center gap-1">
                  <span>📚</span> <span>Ngân Hàng Câu Hỏi</span>
                </button>
                <button onclick="examPortal.openLiveProctorModal(${this.selectedFolder !== 'all' ? this.selectedFolder : 'all'})" class="btn btn-outline btn-xs font-bold text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100 flex items-center gap-1">
                  <span>📡</span> <span>Giám Thị Live</span>
                </button>
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
  // THƯ VIỆN NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM ĐỘNG (QUESTION BANK MODAL)
  // =========================================================================
  openQuestionBankModal(grade = "all") {
    this.qbGrade = grade;
    this.editingQuestionId = null;

    const modal = document.getElementById("exam-question-bank-modal");
    if (modal) modal.classList.add("active");

    this.renderQuestionBankContent();
  }

  renderQuestionBankContent() {
    const content = document.getElementById("exam-question-bank-content");
    if (!content) return;

    const questions = window.examService.getAllQuestionBank(this.qbGrade, this.qbSearch, this.qbLevel);

    content.innerHTML = `
      <div class="space-y-4 text-xs text-slate-800 animate-pop">
        <!-- Top Toolbar & Filter -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-slate-600 text-[11px]">Khối:</span>
            ${['all', '3', '4', '5'].map(g => `
              <button onclick="examPortal.qbGrade = '${g}'; examPortal.renderQuestionBankContent();" class="px-2.5 py-1 rounded-xl text-xs font-black transition-all ${this.qbGrade === g ? 'bg-indigo-700 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}">
                ${g === 'all' ? 'Tất Cả' : `Lớp ${g}`}
              </button>
            `).join("")}

            <span class="font-bold text-slate-600 text-[11px] ml-2">Mức Độ:</span>
            ${['all', 'Mức 1', 'Mức 2', 'Mức 3'].map(l => `
              <button onclick="examPortal.qbLevel = '${l}'; examPortal.renderQuestionBankContent();" class="px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${this.qbLevel === l ? 'bg-amber-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
                ${l === 'all' ? 'Tất Cả Mức' : l}
              </button>
            `).join("")}
          </div>

          <div class="flex items-center gap-2 w-full md:w-auto">
            <input type="text" value="${this.qbSearch}" oninput="examPortal.qbSearch = this.value; examPortal.renderQuestionBankContent();" placeholder="Tìm kiếm câu hỏi, chủ đề..." class="form-control text-xs py-1.5 pl-3 w-full md:w-60">
            <button onclick="examPortal.openAddQuestionForm()" class="btn btn-primary btn-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow shrink-0 flex items-center gap-1">
              <span>➕</span> <span>Thêm Câu Hỏi</span>
            </button>
          </div>
        </div>

        <!-- Form Thêm / Sửa Câu Hỏi (Nếu mở) -->
        <div id="qb-form-container" class="hidden p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h4 id="qb-form-title" class="text-sm font-black text-indigo-900">➕ THÊM CÂU HỎI TRẮC NGHIỆM MỚI</h4>
            <button onclick="document.getElementById('qb-form-container').classList.add('hidden')" class="text-slate-400 font-bold hover:text-slate-700">✕ Đóng</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Khối Lớp:</label>
              <select id="qb-input-grade" class="form-control text-xs font-bold">
                <option value="3">Khối Lớp 3</option>
                <option value="4">Khối Lớp 4</option>
                <option value="5">Khối Lớp 5</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Chủ Đề GDPT 2018:</label>
              <select id="qb-input-topic" class="form-control text-xs font-bold">
                <option value="topic_a">Chủ đề A: Máy tính & Em</option>
                <option value="topic_b">Chủ đề B: Mạng & Internet</option>
                <option value="topic_c">Chủ đề C: Tổ chức lưu trữ thông tin</option>
                <option value="topic_d">Chủ đề D: Đạo đức số & Pháp luật</option>
                <option value="topic_e">Chủ đề E: Ứng dụng tin học (Paint/Word/PPT)</option>
                <option value="topic_f">Chủ đề F: Lập trình Scratch & Thuật toán</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Mức Độ Nhận Thức (TT 27):</label>
              <select id="qb-input-level" class="form-control text-xs font-bold">
                <option value="Mức 1">Mức 1 (Nhận biết)</option>
                <option value="Mức 2">Mức 2 (Thông hiểu)</option>
                <option value="Mức 3">Mức 3 (Vận dụng)</option>
                <option value="Mức 4">Mức 4 (Vận dụng cao)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Nội Dung Câu Hỏi:</label>
            <textarea id="qb-input-question" rows="2" placeholder="Nhập câu hỏi trắc nghiệm..." class="form-control text-xs font-bold"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label class="font-bold text-blue-700 block mb-0.5">Đáp án A:</label>
              <input type="text" id="qb-input-opt-a" placeholder="Nội dung đáp án A" class="form-control text-xs">
            </div>
            <div>
              <label class="font-bold text-amber-700 block mb-0.5">Đáp án B:</label>
              <input type="text" id="qb-input-opt-b" placeholder="Nội dung đáp án B" class="form-control text-xs">
            </div>
            <div>
              <label class="font-bold text-emerald-700 block mb-0.5">Đáp án C:</label>
              <input type="text" id="qb-input-opt-c" placeholder="Nội dung đáp án C" class="form-control text-xs">
            </div>
            <div>
              <label class="font-bold text-rose-700 block mb-0.5">Đáp án D:</label>
              <input type="text" id="qb-input-opt-d" placeholder="Nội dung đáp án D" class="form-control text-xs">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-emerald-800 block mb-1">Đáp Án Đúng:</label>
              <select id="qb-input-correct" class="form-control text-xs font-black text-emerald-800">
                <option value="0">A (Lựa chọn 1)</option>
                <option value="1">B (Lựa chọn 2)</option>
                <option value="2">C (Lựa chọn 3)</option>
                <option value="3">D (Lựa chọn 4)</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Lời Giải Thích / Barem Điểm:</label>
              <input type="text" id="qb-input-explanation" placeholder="Giải thích vì sao đúng..." class="form-control text-xs">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-indigo-200">
            <button onclick="document.getElementById('qb-form-container').classList.add('hidden')" class="btn btn-outline btn-sm font-bold">Hủy</button>
            <button onclick="examPortal.saveQuestionToBank()" class="btn btn-primary btn-sm font-black bg-indigo-700 hover:bg-indigo-800 text-white shadow">💾 Lưu Câu Hỏi</button>
          </div>
        </div>

        <!-- Danh Sách Câu Hỏi Trong Ngân Hàng -->
        <div class="space-y-3 max-h-96 overflow-y-auto pr-1">
          <div class="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
            <span>Hiển thị <b>${questions.length}</b> câu hỏi trắc nghiệm</span>
            <span class="text-indigo-600">Chuẩn khung chương trình GDPT 2018</span>
          </div>

          ${questions.length === 0 ? `
            <div class="text-center py-10 glass-card text-slate-400 space-y-2">
              <span class="text-4xl block">📚</span>
              <p class="font-bold text-slate-600">Chưa có câu hỏi nào khớp với bộ lọc.</p>
              <button onclick="examPortal.openAddQuestionForm()" class="btn btn-primary btn-xs font-bold mt-1">➕ Thêm Câu Hỏi Đầu Tiên</button>
            </div>
          ` : questions.map((q, idx) => `
            <div class="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 hover:border-indigo-400 transition-all shadow-sm">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="badge badge-cyan text-[10px] font-black">LỚP ${q.grade}</span>
                  <span class="badge badge-slate text-[10px] font-bold">${q.topicName || q.topic}</span>
                  <span class="badge bg-amber-100 text-amber-900 text-[10px] font-black">${q.level}</span>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button onclick="examPortal.openEditQuestionForm('${q.id}')" class="p-1.5 text-cyan-700 hover:bg-cyan-50 rounded-lg font-bold border border-cyan-200" title="Chỉnh sửa câu hỏi này">
                    ✏️ Sửa
                  </button>
                  <button onclick="examPortal.deleteQuestionFromBank('${q.id}')" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-bold border border-rose-200" title="Xóa câu hỏi này">
                    🗑️ Xóa
                  </button>
                </div>
              </div>

              <h5 class="text-xs md:text-sm font-black text-slate-900">Câu ${idx + 1}: ${q.question}</h5>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5 pt-1 text-xs">
                ${q.options.map((opt, oIdx) => `
                  <div class="p-2 rounded-xl border text-[11px] font-bold ${oIdx === q.correct ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-700'}">
                    <span>${opt}</span> ${oIdx === q.correct ? '✅ (Đáp án đúng)' : ''}
                  </div>
                `).join("")}
              </div>

              <p class="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100">
                💡 <b>Giải thích:</b> ${q.explanation || 'Không có ghi chú.'}
              </p>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  openAddQuestionForm() {
    this.editingQuestionId = null;
    const form = document.getElementById("qb-form-container");
    const title = document.getElementById("qb-form-title");
    if (title) title.innerText = "➕ THÊM CÂU HỎI TRẮC NGHIỆM MỚI";

    if (form) {
      form.classList.remove("hidden");
      document.getElementById("qb-input-question").value = "";
      document.getElementById("qb-input-opt-a").value = "";
      document.getElementById("qb-input-opt-b").value = "";
      document.getElementById("qb-input-opt-c").value = "";
      document.getElementById("qb-input-opt-d").value = "";
      document.getElementById("qb-input-explanation").value = "";
    }
  }

  openEditQuestionForm(qId) {
    const qb = window.examService.getAllQuestionBank('all');
    const q = qb.find(item => item.id === qId);
    if (!q) return;

    this.editingQuestionId = qId;
    const form = document.getElementById("qb-form-container");
    const title = document.getElementById("qb-form-title");
    if (title) title.innerText = "✏️ CHỈNH SỬA CÂU HỎI TRẮC NGHIỆM";

    if (form) {
      form.classList.remove("hidden");
      document.getElementById("qb-input-grade").value = q.grade;
      document.getElementById("qb-input-topic").value = q.topic;
      document.getElementById("qb-input-level").value = q.level;
      document.getElementById("qb-input-question").value = q.question;
      document.getElementById("qb-input-opt-a").value = q.options[0]?.replace(/^A\.\s*/, '') || "";
      document.getElementById("qb-input-opt-b").value = q.options[1]?.replace(/^B\.\s*/, '') || "";
      document.getElementById("qb-input-opt-c").value = q.options[2]?.replace(/^C\.\s*/, '') || "";
      document.getElementById("qb-input-opt-d").value = q.options[3]?.replace(/^D\.\s*/, '') || "";
      document.getElementById("qb-input-correct").value = q.correct;
      document.getElementById("qb-input-explanation").value = q.explanation || "";
    }
  }

  saveQuestionToBank() {
    const grade = document.getElementById("qb-input-grade")?.value || 3;
    const topic = document.getElementById("qb-input-topic")?.value || "topic_a";
    const level = document.getElementById("qb-input-level")?.value || "Mức 1";
    const question = document.getElementById("qb-input-question")?.value.trim();
    const optA = document.getElementById("qb-input-opt-a")?.value.trim();
    const optB = document.getElementById("qb-input-opt-b")?.value.trim();
    const optC = document.getElementById("qb-input-opt-c")?.value.trim();
    const optD = document.getElementById("qb-input-opt-d")?.value.trim();
    const correct = parseInt(document.getElementById("qb-input-correct")?.value || 0);
    const explanation = document.getElementById("qb-input-explanation")?.value.trim();

    if (!question || !optA || !optB) {
      window.app.showToast("Vui lòng nhập đầy đủ câu hỏi và các lựa chọn đáp án!", "warning");
      return;
    }

    const topicSelect = document.getElementById("qb-input-topic");
    const topicName = topicSelect?.options[topicSelect.selectedIndex]?.text || "Chủ đề A: Máy tính & Em";

    const questionData = {
      grade,
      topic,
      topicName,
      level,
      question,
      options: [
        `A. ${optA}`,
        `B. ${optB}`,
        `C. ${optC || 'Lựa chọn C'}`,
        `D. ${optD || 'Lựa chọn D'}`
      ],
      correct,
      explanation
    };

    if (this.editingQuestionId) {
      window.examService.updateQuestionInBank(this.editingQuestionId, questionData);
      window.app.showToast("✏️ Đã cập nhật câu hỏi thành công!", "success");
    } else {
      window.examService.addQuestionToBank(questionData);
      window.app.showToast("🎉 Đã thêm câu hỏi mới vào Ngân Hàng Câu Hỏi!", "success");
    }

    document.getElementById("qb-form-container")?.classList.add("hidden");
    this.renderQuestionBankContent();
  }

  deleteQuestionFromBank(qId) {
    if (confirm("Thầy Cô có chắc chắn muốn xóa câu hỏi này khỏi Ngân Hàng Câu Hỏi?")) {
      window.examService.deleteQuestionFromBank(qId);
      window.app.showToast("🗑️ Đã xóa câu hỏi khỏi ngân hàng!", "info");
      this.renderQuestionBankContent();
    }
  }

  // =========================================================================
  // IN GIẤY KHEN VINH DANH HỌC SINH ĐIỂM 10 (HONOR CERTIFICATE MODAL)
  // =========================================================================
  openCertificateModal(attemptId) {
    const cert = window.examService.getCertificateData(attemptId);
    if (!cert) return;

    this.currentCertData = cert;
    const modal = document.getElementById("exam-certificate-modal");
    const content = document.getElementById("exam-certificate-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-4 text-slate-800 animate-pop">
          <!-- Khung Giấy Khen Chuẩn Hoàng Gia Khổ Ngang -->
          <div id="printable-certificate-card" class="p-8 md:p-12 bg-amber-50/50 border-8 border-double border-amber-600 rounded-3xl shadow-2xl relative overflow-hidden text-center space-y-4 font-serif">
            <!-- Background watermark -->
            <div class="absolute -right-12 -bottom-12 opacity-10 pointer-events-none text-9xl">🏆</div>
            <div class="absolute -left-12 -top-12 opacity-10 pointer-events-none text-9xl">⭐</div>

            <!-- Header Quốc Hiệu -->
            <div class="space-y-1">
              <p class="text-xs uppercase font-bold tracking-widest text-slate-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p class="text-[11px] font-bold text-slate-600 underline">Độc lập - Tự do - Hạnh phúc</p>
            </div>

            <!-- Tên Trường -->
            <div class="pt-2">
              <p class="text-xs font-extrabold uppercase tracking-wider text-cyan-900">BAN GIÁM HIỆU TRƯỜNG TIỂU HỌC VUI HỌC</p>
              <h2 class="text-2xl md:text-3xl font-black text-amber-700 uppercase tracking-widest mt-1 drop-shadow-sm font-sans">
                GIẤY KHEN DANH DỰ
              </h2>
              <p class="text-xs font-bold italic text-amber-900">Tuyên dương thành tích học tập xuất sắc</p>
            </div>

            <!-- Tên Học Sinh -->
            <div class="py-2 space-y-1">
              <p class="text-xs text-slate-600">Trao tặng cho em:</p>
              <h3 class="text-2xl md:text-3xl font-black text-slate-900 uppercase font-sans tracking-wide">
                ${cert.studentName}
              </h3>
              <p class="text-sm font-bold text-slate-700">Học sinh Lớp: <b>${cert.className}</b> • Khối Lớp ${cert.grade}</p>
            </div>

            <!-- Thành Tích & Điểm -->
            <div class="max-w-xl mx-auto p-4 bg-white/80 rounded-2xl border border-amber-300 shadow-inner space-y-1">
              <p class="text-xs font-bold text-emerald-800">
                Đã đạt kết quả xuất sắc: <span class="text-lg font-black text-rose-600">${cert.score} / 10 Điểm</span> (${cert.classification})
              </p>
              <p class="text-[11px] text-slate-600 leading-relaxed italic">
                Trong kỳ: "${cert.examTitle}"
              </p>
              <p class="text-[10px] text-amber-700 font-bold">Thưởng: +${cert.starsEarned} ⭐ Sao Vàng Vinh Danh</p>
            </div>

            <!-- Chữ Ký & Ngày Cấp -->
            <div class="flex items-center justify-between pt-6 text-xs text-slate-700 font-sans">
              <div class="text-center space-y-1">
                <p class="font-bold">GIÁO VIÊN BỘ MÔN</p>
                <div class="h-10"></div>
                <p class="font-black text-slate-900">Cô Anh Đào</p>
              </div>

              <div class="text-center space-y-1">
                <p class="italic text-[11px]">Ngày ${cert.submittedAt}</p>
                <p class="font-bold">HIỆU TRƯỞNG NHÀ TRƯỜNG</p>
                <div class="h-10 flex items-center justify-center">
                  <span class="badge bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow">ĐÃ ĐÓNG DẤU ĐỎ</span>
                </div>
                <p class="font-black text-slate-900">TS. Nguyễn Văn Giáo</p>
              </div>
            </div>
          </div>

          <!-- Nút In & Tải -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-200">
            <span class="text-[11px] text-slate-400">Tự động định dạng khổ ngang A4 sắc nét</span>
            <div class="flex items-center gap-2">
              <button onclick="document.getElementById('exam-certificate-modal').classList.remove('active')" class="btn btn-outline btn-sm font-bold">
                Đóng
              </button>
              <button onclick="examPortal.printCertificate()" class="btn btn-primary btn-sm font-black bg-amber-600 hover:bg-amber-700 text-white shadow-lg flex items-center gap-1.5">
                <span>🖨️</span> <span>In Giấy Khen Ngay</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  printCertificate() {
    const certCard = document.getElementById("printable-certificate-card");
    if (!certCard) return;

    const printWindow = window.open('', '_blank', 'width=1000,height=750');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Giấy Khen Danh Dự - ${this.currentCertData?.studentName || 'Học Sinh'}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              margin: 0;
              padding: 20px;
              background: #fff;
              color: #000;
            }
            .cert-box {
              border: 10px double #b45309;
              padding: 35px 40px;
              text-align: center;
              border-radius: 20px;
              background-color: #fffdfa;
            }
            h2 { font-family: Arial, sans-serif; font-size: 26pt; color: #b45309; margin: 10px 0 5px 0; letter-spacing: 2px; }
            h3 { font-family: Arial, sans-serif; font-size: 24pt; margin: 10px 0; }
            .score-box { border: 1px solid #d97706; background-color: #fff; padding: 12px; border-radius: 10px; margin: 15px auto; max-width: 650px; font-size: 13pt; }
            .sign-table { width: 100%; margin-top: 30px; }
            .sign-table td { width: 50%; vertical-align: top; text-align: center; font-family: Arial, sans-serif; font-size: 11pt; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <p style="font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p style="font-size: 10pt; font-style: italic; text-decoration: underline; margin-top: 0;">Độc lập - Tự do - Hạnh phúc</p>
            <br>
            <p style="font-size: 12pt; font-weight: bold; text-transform: uppercase; color: #0f766e; margin-bottom: 2px;">BAN GIÁM HIỆU TRƯỜNG TIỂU HỌC VUI HỌC</p>
            <h2>GIẤY KHEN DANH DỰ</h2>
            <p style="font-size: 11pt; font-style: italic;">Tuyên dương thành tích học tập xuất sắc</p>
            <br>
            <p style="font-size: 12pt;">Trao tặng cho em:</p>
            <h3>${this.currentCertData?.studentName}</h3>
            <p style="font-size: 13pt; font-weight: bold;">Học sinh Lớp: ${this.currentCertData?.className} • Khối Lớp ${this.currentCertData?.grade}</p>
            
            <div class="score-box">
              <p style="margin: 0; font-weight: bold; color: #047857;">
                Đã đạt kết quả xuất sắc: <span style="font-size: 16pt; color: #b91c1c;">${this.currentCertData?.score} / 10 Điểm</span> (${this.currentCertData?.classification})
              </p>
              <p style="margin: 5px 0 0 0; font-style: italic; font-size: 11pt; color: #475569;">
                Trong kỳ: "${this.currentCertData?.examTitle}"
              </p>
            </div>

            <table class="sign-table">
              <tr>
                <td>
                  <b>GIÁO VIÊN BỘ MÔN</b>
                  <br><br><br><br>
                  <b>Cô Anh Đào</b>
                </td>
                <td>
                  <i>Ngày ${this.currentCertData?.submittedAt}</i><br>
                  <b>HIỆU TRƯỞNG NHÀ TRƯỜNG</b>
                  <br><br><br><br>
                  <b>TS. Nguyễn Văn Giáo</b>
                </td>
              </tr>
            </table>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 400);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
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
  // CHẾ ĐỘ GIÁM THỊ PHÒNG THI TRỰC TUYẾN (LIVE EXAM PROCTORING DASHBOARD)
  // =========================================================================
  openLiveProctorModal(grade = "all") {
    this.proctorGrade = grade;
    const modal = document.getElementById("exam-live-proctor-modal");
    if (modal) modal.classList.add("active");

    this.renderLiveProctorContent();

    if (this.proctorInterval) clearInterval(this.proctorInterval);
    this.proctorInterval = setInterval(() => {
      this.renderLiveProctorContent();
    }, 3000);
  }

  closeLiveProctorModal() {
    if (this.proctorInterval) clearInterval(this.proctorInterval);
    const modal = document.getElementById("exam-live-proctor-modal");
    if (modal) modal.classList.remove("active");
  }

  renderLiveProctorContent() {
    const content = document.getElementById("exam-live-proctor-content");
    if (!content) return;

    const list = window.examService.getLiveProctorList(this.proctorGrade);

    content.innerHTML = `
      <div class="space-y-4 text-xs text-slate-800 animate-pop">
        <!-- Top Stats Banner -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <span class="font-bold text-slate-500 text-[10px] block">ĐANG DỰ THI</span>
            <span class="text-xl font-black text-blue-700">${list.filter(s => s.status !== 'submitted').length} Học sinh</span>
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span class="font-bold text-slate-500 text-[10px] block">ĐÃ NỘP BÀI</span>
            <span class="text-xl font-black text-emerald-700">${list.filter(s => s.status === 'submitted').length} Học sinh</span>
          </div>
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span class="font-bold text-slate-500 text-[10px] block">CẢNH BÁO CHUYỂN TAB</span>
            <span class="text-xl font-black text-amber-700">${list.filter(s => s.tabSwitchCount > 0).length} Trường hợp</span>
          </div>
          <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl">
            <span class="font-bold text-slate-500 text-[10px] block">TỰ ĐỘNG LÀM MỚI</span>
            <span class="text-xs font-black text-purple-700 flex items-center justify-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live 3s
            </span>
          </div>
        </div>

        <!-- Filter & Broadcast bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-bold text-slate-600 text-[11px]">Khối Lớp:</span>
            ${['all', '3', '4', '5'].map(g => `
              <button onclick="examPortal.proctorGrade = '${g}'; examPortal.renderLiveProctorContent();" class="px-2.5 py-1 rounded-lg text-xs font-black transition-all ${this.proctorGrade === g ? 'bg-cyan-700 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}">
                ${g === 'all' ? 'Tất Cả' : `Khối Lớp ${g}`}
              </button>
            `).join("")}
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <input type="text" id="proctor-broadcast-input" placeholder="Nhập lời nhắc gửi toàn phòng..." class="form-control text-xs py-1.5 pl-3">
            <button onclick="examPortal.sendBroadcastMsg()" class="btn btn-primary btn-xs font-black shrink-0 bg-blue-600 hover:bg-blue-700">
              🔔 Gửi Nhắc Nhở
            </button>
          </div>
        </div>

        <!-- Live Table -->
        <div class="overflow-x-auto border border-slate-200 rounded-xl max-h-72 overflow-y-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-100 text-slate-700 font-black text-[11px] sticky top-0">
              <tr>
                <th class="p-2.5">Học Sinh</th>
                <th class="p-2.5 text-center">Lớp</th>
                <th class="p-2.5">Tiến Độ Làm Bài</th>
                <th class="p-2.5 text-center">Thời Gian</th>
                <th class="p-2.5 text-center">Chuyển Tab</th>
                <th class="p-2.5">Trạng Thái Giám Thị</th>
                <th class="p-2.5 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 font-medium">
              ${list.length === 0 ? `
                <tr>
                  <td colspan="7" class="p-6 text-center text-slate-400 font-bold">Hiện không có học sinh nào đang làm bài trong khối này.</td>
                </tr>
              ` : list.map(s => {
                const mins = Math.floor(s.timeLeftSeconds / 60);
                const secs = s.timeLeftSeconds % 60;
                const timeText = s.timeLeftSeconds > 0 ? `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}` : 'Hết giờ';
                const pct = Math.round((s.answeredCount / s.totalQuestions) * 100);

                return `
                  <tr class="hover:bg-slate-50">
                    <td class="p-2.5 font-bold text-slate-900">${s.studentName}</td>
                    <td class="p-2.5 text-center"><span class="badge badge-cyan text-[10px] font-black">${s.className}</span></td>
                    <td class="p-2.5">
                      <div class="space-y-1">
                        <div class="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>${s.answeredCount}/${s.totalQuestions} Câu</span>
                          <span>${pct}%</span>
                        </div>
                        <div class="w-28 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div class="bg-emerald-500 h-1.5 rounded-full" style="width: ${pct}%"></div>
                        </div>
                      </div>
                    </td>
                    <td class="p-2.5 text-center font-mono font-bold text-indigo-700">${timeText}</td>
                    <td class="p-2.5 text-center">
                      ${s.tabSwitchCount > 0 ? `
                        <span class="badge bg-rose-100 text-rose-800 text-[10px] font-black animate-pulse">
                          ⚠️ ${s.tabSwitchCount} Lần
                        </span>
                      ` : `
                        <span class="text-slate-400 text-[11px]">0</span>
                      `}
                    </td>
                    <td class="p-2.5">
                      <span class="text-[11px] font-bold ${s.status === 'warning' ? 'text-rose-700' : s.status === 'submitted' ? 'text-emerald-700' : 'text-slate-700'}">
                        ${s.statusText}
                      </span>
                    </td>
                    <td class="p-2.5 text-center">
                      <div class="flex items-center justify-center gap-1">
                        ${s.status !== 'submitted' ? `
                          <button onclick="examPortal.addExtraTimeForStudent('${s.id}')" class="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-black text-[10px] border border-emerald-200" title="Cộng thêm 5 phút">
                            +5p
                          </button>
                          <button onclick="examPortal.forceSubmitStudent('${s.id}', '${s.studentName}')" class="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded font-black text-[10px] border border-rose-200" title="Thu bài thi ngay">
                            🛑 Thu
                          </button>
                        ` : `
                          <button onclick="examPortal.openCertificateModal('att_01')" class="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-black text-[10px] border border-amber-200" title="In Giấy Khen">
                            🎖️ Khen
                          </button>
                        `}
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  sendBroadcastMsg() {
    const input = document.getElementById("proctor-broadcast-input");
    const msg = input?.value.trim();
    if (!msg) return;

    window.examService.broadcastProctorAnnouncement(msg);
    if (input) input.value = "";
    window.app.showToast(`📢 Đã phát thông báo toàn phòng thi: "${msg}"!`, "success");
  }

  addExtraTimeForStudent(studentId) {
    window.examService.addExtraTimeToStudent(studentId, 5);
    window.app.showToast("⏱️ Đã cộng thêm +5 phút làm bài cho học sinh!", "info");
    this.renderLiveProctorContent();
  }

  forceSubmitStudent(studentId, studentName) {
    if (confirm(`Thầy Cô có chắc chắn muốn THU BÀI THI SỚM của học sinh ${studentName}?`)) {
      window.examService.forceSubmitStudentExam(studentId);
      window.app.showToast(`🛑 Đã thu bài thi sớm của ${studentName}!`, "warning");
      this.renderLiveProctorContent();
    }
  }

  // =========================================================================
  // PHÁT HIỆN & CẢNH BÁO HỌC SINH CHUYỂN TAB / GIAN LẬN (ANTI-CHEAT DETECTION)
  // =========================================================================
  playWarningBeep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  handleVisibilityChange() {
    if (document.hidden && this.activeRunnerExam) {
      this.triggerAntiCheatViolation();
    }
  }

  handleWindowBlur() {
    if (this.activeRunnerExam) {
      this.triggerAntiCheatViolation();
    }
  }

  triggerAntiCheatViolation() {
    this.tabSwitchCount++;
    this.playWarningBeep();

    const banner = document.getElementById("exam-anti-cheat-banner");
    if (banner) {
      banner.innerHTML = `
        <div class="p-3 bg-rose-600 text-white rounded-xl shadow-lg flex items-center justify-between gap-2 animate-bounce">
          <div class="flex items-center gap-2">
            <span class="text-xl">🚨</span>
            <div>
              <p class="font-black text-xs">CẢNH BÁO VI PHẠM: Em vừa rời khỏi màn hình bài thi (Lần ${this.tabSwitchCount}/3)!</p>
              <p class="text-[10px] text-rose-100">Nếu chuyển tab quá 3 lần, hệ thống sẽ tự động thu bài và báo cho Giám thị!</p>
            </div>
          </div>
          <span class="badge bg-white text-rose-700 font-black text-xs">Lần ${this.tabSwitchCount}</span>
        </div>
      `;
      banner.classList.remove("hidden");
    }

    window.app.showToast(`🚨 Cảnh báo chuyển tab (Lần ${this.tabSwitchCount}/3)!`, "error");

    if (this.tabSwitchCount >= 3) {
      alert("⚠️ Em đã vi phạm chuyển tab 3 lần. Hệ thống tự động thu bài thi và gửi báo cáo cho Thầy/Cô giám thị!");
      this.submitOnlineTest(true);
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
                    <span>👩‍🏫 Người ra đề: <b>${e.authorName || 'Cô Anh Đào'}</b></span>
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
                    <button onclick="examPortal.startOnlineTest('${e.id}')" class="btn btn-amber btn-sm font-black flex items-center justify-center gap-1 shadow-sm" title="Làm bài trắc nghiệm trực tuyến có đếm giờ, tự chấm điểm và chống gian lận">
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
  // 1. LÀM BÀI THI TRỰC TUYẾN TỰ CHẤM ĐIỂM (ONLINE TEST RUNNER + ANTI-CHEAT)
  // =========================================================================
  async startOnlineTest(id) {
    const exam = await window.examService.getExamById(id);
    if (!exam) return;

    this.activeRunnerExam = exam;
    this.runnerQuestions = window.examService.getOnlineExamQuestions(exam);
    this.runnerCurrentIndex = 0;
    this.runnerAnswers = {};
    this.essayUserAnswer = "";
    this.runnerTimerSeconds = (exam.durationMinutes || 35) * 60;
    this.runnerStartTime = Date.now();
    this.tabSwitchCount = 0;

    // Thêm câu hỏi Tự luận / Thực hành tự động nếu chưa có
    if (!this.runnerQuestions.some(q => q.type === 'essay')) {
      this.runnerQuestions.push({
        id: 'q_essay_01',
        type: 'essay',
        level: 'Mức 3 (Vận dụng)',
        question: 'Câu 5 (Tự Luận / Thực Hành - 3.0 Điểm): Em hãy nêu 2 quy tắc an toàn khi sử dụng máy tính để bàn và giải thích vì sao không được vừa ăn uống vừa sử dụng máy tính?',
        explanation: 'Quy tắc: Giữ lưng thẳng, mắt cách màn hình 50-80cm; Không ăn uống gần máy tính vì nước uống hoặc thức ăn đổ vào thân máy CPU hoặc bàn phím sẽ gây chập điện hỏng thiết bị!'
      });
    }

    if (this.runnerTimerInterval) clearInterval(this.runnerTimerInterval);

    // Kích hoạt lắng nghe Chống Gian Lận (Anti-Cheat)
    if (!this.isAntiCheatListening) {
      this.boundVisibilityHandler = this.handleVisibilityChange.bind(this);
      this.boundBlurHandler = this.handleWindowBlur.bind(this);
      document.addEventListener("visibilitychange", this.boundVisibilityHandler);
      window.addEventListener("blur", this.boundBlurHandler);
      this.isAntiCheatListening = true;
    }

    const modal = document.getElementById("online-exam-runner-modal");
    const titleDisp = document.getElementById("exam-runner-title-disp");
    if (titleDisp) titleDisp.innerText = exam.title;

    const banner = document.getElementById("exam-anti-cheat-banner");
    if (banner) banner.classList.add("hidden");

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
      navTrack.innerHTML = this.runnerQuestions.map((item, idx) => {
        const isAnswered = item.type === 'essay' ? (this.essayUserAnswer && this.essayUserAnswer.trim().length > 0) : (this.runnerAnswers[idx] !== undefined);
        const isCurrent = this.runnerCurrentIndex === idx;
        return `
          <button onclick="examPortal.jumpToQuestion(${idx})" class="w-8 h-8 rounded-xl font-black text-xs transition-all ${isCurrent ? 'bg-amber-500 text-slate-950 scale-110 shadow' : isAnswered ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
            ${idx + 1}
          </button>
        `;
      }).join("");
    }

    const selectedOption = this.runnerAnswers[this.runnerCurrentIndex];
    const isEssay = q.type === 'essay';

    qContainer.innerHTML = `
      <div class="space-y-4 animate-pop">
        <!-- Anti-cheat Banner placeholder -->
        <div id="exam-anti-cheat-banner" class="${this.tabSwitchCount > 0 ? '' : 'hidden'}">
          <div class="p-3 bg-rose-600 text-white rounded-xl shadow-lg flex items-center justify-between gap-2 animate-bounce">
            <div class="flex items-center gap-2">
              <span class="text-xl">🚨</span>
              <div>
                <p class="font-black text-xs">CẢNH BÁO VI PHẠM: Em vừa rời khỏi màn hình bài thi (Lần ${this.tabSwitchCount}/3)!</p>
                <p class="text-[10px] text-rose-100">Nếu chuyển tab quá 3 lần, hệ thống sẽ tự động thu bài và báo cho Giám thị!</p>
              </div>
            </div>
            <span class="badge bg-white text-rose-700 font-black text-xs">Lần ${this.tabSwitchCount}</span>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span class="badge ${isEssay ? 'bg-purple-600' : 'badge-emerald'} text-white font-black text-[11px]">
            ${isEssay ? '🤖 CÂU TỰ LUẬN / THỰC HÀNH (AI CHẤM)' : `CÂU HỎI ${this.runnerCurrentIndex + 1} / ${this.runnerQuestions.length}`}
          </span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">🛡️ Chống chuyển tab: Bật</span>
            <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">${q.level} • ${isEssay ? '3.0' : '1.0'} Điểm</span>
          </div>
        </div>

        <h3 class="text-base md:text-lg font-black text-slate-900 leading-snug">${q.question}</h3>

        ${isEssay ? `
          <div class="space-y-2 pt-2">
            <label class="font-bold text-indigo-900 block text-xs">✍️ Bài Làm Tự Luận Của Em (Hệ thống AI sẽ tự động phân tích & chấm điểm):</label>
            <textarea oninput="examPortal.essayUserAnswer = this.value" rows="5" placeholder="Nhập câu trả lời tự luận của em tại đây (VD: Khi học máy tính em giữ lưng thẳng, mắt cách màn hình 50-80cm, không ăn uống gần thân máy CPU để tránh chập điện...)" class="form-control text-xs font-bold p-3.5 border-2 border-indigo-300 focus:border-indigo-600 bg-indigo-50/50 rounded-2xl shadow-inner">${this.essayUserAnswer || ''}</textarea>
          </div>
        ` : `
          <div class="grid grid-cols-1 gap-2.5 pt-2">
            ${(q.options || []).map((opt, oIdx) => {
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
        `}

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
                🚀 Nộp Bài & AI Chấm Điểm
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
    const answeredCount = Object.keys(this.runnerAnswers).length + (this.essayUserAnswer && this.essayUserAnswer.trim() ? 1 : 0);
    if (answeredCount < this.runnerQuestions.length) {
      if (!confirm(`Em mới trả lời ${answeredCount}/${this.runnerQuestions.length} câu hỏi. Em có chắc chắn muốn nộp bài thi ngay không?`)) {
        return;
      }
    }
    this.submitOnlineTest();
  }

  async submitOnlineTest(isForce = false) {
    if (this.runnerTimerInterval) clearInterval(this.runnerTimerInterval);

    // Gỡ bỏ sự kiện chống gian lận khi kết thúc
    if (this.isAntiCheatListening) {
      document.removeEventListener("visibilitychange", this.boundVisibilityHandler);
      window.removeEventListener("blur", this.boundBlurHandler);
      this.isAntiCheatListening = false;
    }

    // 1. Chấm phần trắc nghiệm (Thang điểm 7.0)
    let mcCorrectCount = 0;
    const mcQuestions = this.runnerQuestions.filter(q => q.type !== 'essay');
    mcQuestions.forEach((q, idx) => {
      if (this.runnerAnswers[idx] === q.correct) {
        mcCorrectCount++;
      }
    });

    const mcScore = (mcCorrectCount / (mcQuestions.length || 1)) * 7.0;

    // 2. AI Chấm phần tự luận (Thang điểm 3.0)
    const aiEssayRes = window.examService.gradeEssayAnswerWithAI(
      this.essayUserAnswer, 
      this.activeRunnerExam?.title, 
      this.activeRunnerExam?.grade || 3
    );

    let rawScore = Number((mcScore + aiEssayRes.score).toFixed(1));
    if (isForce) {
      rawScore = Math.min(rawScore, 6.0); // Bị trừ điểm do gian lận
    }

    const user = window.authService?.getUser() || { name: "Nguyễn Văn An", class: "3A" };
    const durationSpent = Math.floor((Date.now() - this.runnerStartTime) / 1000);

    const result = await window.examService.submitExamAttempt({
      examId: this.activeRunnerExam?.id,
      examTitle: this.activeRunnerExam?.title,
      studentName: user.name,
      className: user.class || (this.activeRunnerExam?.grade === 3 ? "3A" : this.activeRunnerExam?.grade === 4 ? "4A" : "5A"),
      grade: this.activeRunnerExam?.grade,
      score: rawScore,
      durationSpentSeconds: durationSpent,
      tabSwitchCount: this.tabSwitchCount,
      isForceSubmitted: isForce
    });

    this.currentAttemptResult = result;
    this.currentAiEssayRes = aiEssayRes;

    if (result.score >= 9.0 && !isForce) {
      this.playVictoryFanfare();
      this.launchConfetti();
    }

    const qContainer = document.getElementById("exam-runner-question-body");
    const navTrack = document.getElementById("exam-runner-nav-track");
    if (navTrack) navTrack.innerHTML = "";

    if (qContainer) {
      qContainer.innerHTML = `
        <div class="text-center py-6 space-y-5 animate-pop">
          <span class="text-6xl block ${result.score >= 9 ? 'animate-bounce' : ''}">${isForce ? '⚠️' : result.score >= 9 ? '🏆' : '🎉'}</span>
          <h3 class="text-2xl font-black text-slate-900">${isForce ? 'BÀI THI ĐÃ BỊ THU SỚM DO VI PHẠM' : 'HOÀN THÀNH BÀI KIỂM TRA TRỰC TUYẾN!'}</h3>
          <p class="text-xs text-slate-600">${isForce ? 'Hệ thống đã tự động thu bài vì em vi phạm chuyển tab quá 3 lần.' : 'Bài thi của em đã được hệ thống AI tự động chấm và lưu vào sổ học bạ số!'}</p>

          <div class="inline-block p-5 bg-gradient-to-br from-amber-50 to-emerald-50 rounded-3xl border-2 border-amber-300 shadow-md space-y-1">
            <p class="text-xs font-bold text-slate-600">Kết Quả Điểm Số Đạt Được (Trắc nghiệm + AI Tự Luận):</p>
            <p id="result-score-disp" class="text-4xl font-black ${isForce ? 'text-rose-700' : 'text-emerald-700'}">${result.score} / 10 Điểm</p>
            <p id="result-class-disp" class="text-xs font-black text-indigo-800">Xếp Loại theo TT 27: ${result.classification}</p>
            <p class="text-xs text-amber-600 font-bold">Thưởng: +${result.starsEarned} ⭐ Sao Vàng Vui Học!</p>
            ${this.tabSwitchCount > 0 ? `
              <p class="text-[11px] font-bold text-rose-700 pt-1">⚠️ Số lần chuyển tab ghi nhận: ${this.tabSwitchCount} lần</p>
            ` : ''}
          </div>

          <!-- BẢNG ĐÁNH GIÁ AI CHẤM TỰ LUẬN THÔNG TƯ 27 KÈM NÚT ĐIỀU CHỈNH 1-CHẠM -->
          <div class="p-4 bg-purple-50 rounded-2xl border-2 border-purple-300 text-left space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="badge bg-purple-600 text-white font-black text-[10px] uppercase">🤖 AI CHẤM TỰ LUẬN TỰ ĐỘNG (THÔNG TƯ 27)</span>
              <div class="flex items-center gap-1">
                <span id="result-essay-score-disp" class="font-black text-purple-900 text-xs mr-2">Điểm Tự Luận: <b>${aiEssayRes.score} / 3.0 Điểm</b></span>
                <button onclick="examPortal.adjustEssayScore(0.5)" class="btn btn-outline btn-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-300" title="Cô giáo cộng 0.5 điểm">
                  ➕ 0.5p
                </button>
                <button onclick="examPortal.adjustEssayScore(-0.5)" class="btn btn-outline btn-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-300" title="Cô giáo trừ 0.5 điểm">
                  ➖ 0.5p
                </button>
              </div>
            </div>
            <p class="text-xs text-slate-700"><b>Bài làm của em:</b> <i>"${this.essayUserAnswer || '(Em chưa gõ câu trả lời tự luận)'}"</i></p>
            <div class="p-3 bg-white rounded-xl border border-purple-200 text-xs text-purple-950 font-bold space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-purple-800">💬 <b>Lời nhận xét sư phạm của AI:</b></p>
                <button onclick="examPortal.speakAIFeedback()" class="btn btn-emerald btn-xs font-black shadow flex items-center gap-1 animate-pulse" title="Phát âm thanh đọc nhận xét bằng giọng Cô giáo Đà Nẵng">
                  <span>🎙️</span> <span>Nghe Cô Giáo Đà Nẵng Đọc</span>
                </button>
              </div>
              <p class="leading-relaxed font-normal">${aiEssayRes.feedback}</p>
            </div>
          </div>

          <!-- Chi tiết câu trả lời trắc nghiệm -->
          <div class="text-left space-y-3 pt-3 border-t border-slate-200">
            <h4 class="font-extrabold text-slate-800 text-xs">📖 BẢNG GIẢI THÍCH CHI TIẾT CÂU TRẮC NGHIỆM:</h4>
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              ${mcQuestions.map((q, idx) => {
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
            ${result.score >= 9.0 ? `
              <button onclick="examPortal.openCertificateModal('${result.id}')" class="btn btn-primary font-black btn-md bg-amber-600 hover:bg-amber-700 text-white shadow-lg flex items-center gap-1.5 animate-bounce">
                <span>🎖️</span> <span>Nhận Giấy Khen Điểm 10 Danh Dự</span>
              </button>
            ` : ''}
            <button onclick="examPortal.openParentReportModal('${result.id}')" class="btn btn-outline btn-md font-black text-emerald-800 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1.5 shadow">
              <span>📱</span> <span>Báo Điểm Về Zalo</span>
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
    if (this.isAntiCheatListening) {
      document.removeEventListener("visibilitychange", this.boundVisibilityHandler);
      window.removeEventListener("blur", this.boundBlurHandler);
      this.isAntiCheatListening = false;
    }
    const modal = document.getElementById("online-exam-runner-modal");
    if (modal) modal.classList.remove("active");
  }

  // Điều chỉnh điểm tự luận 1-chạm (+0.5p, -0.5p)
  adjustEssayScore(delta) {
    if (!this.currentAttemptResult) return;
    let newScore = Math.max(0, Math.min(10, Number((this.currentAttemptResult.score + delta).toFixed(1))));
    this.currentAttemptResult.score = newScore;
    
    // Cập nhật xếp loại Thông tư 27
    if (newScore >= 9.0) {
      this.currentAttemptResult.classification = "Hoàn thành tốt (T)";
    } else if (newScore >= 7.0) {
      this.currentAttemptResult.classification = "Hoàn thành (H)";
    } else {
      this.currentAttemptResult.classification = "Cần cố gắng (C)";
    }

    const scoreDisp = document.getElementById("result-score-disp");
    const classDisp = document.getElementById("result-class-disp");
    const essayScoreDisp = document.getElementById("result-essay-score-disp");

    if (scoreDisp) scoreDisp.innerText = `${newScore} / 10 Điểm`;
    if (classDisp) classDisp.innerText = `Xếp Loại theo TT 27: ${this.currentAttemptResult.classification}`;
    if (essayScoreDisp) essayScoreDisp.innerText = `Điểm Tự Luận: ${newScore} / 10 Điểm (Đã duyệt)`;

    window.app?.showToast(`🎉 Đã cập nhật điểm số mới: ${newScore} / 10 Điểm!`, "success");
    if (newScore >= 9.0) {
      this.playVictoryFanfare();
      this.launchConfetti();
    }
  }

  // Thuyết minh nhận xét sư phạm AI bằng giọng Cô giáo Đà Nẵng (Miền Trung)
  speakAIFeedback() {
    if (!this.currentAiEssayRes || !this.currentAiEssayRes.feedback) {
      window.app?.showToast("Chưa có lời nhận xét sư phạm để đọc!", "warning");
      return;
    }

    const textToSpeak = `Thầy Cô nhận xét bài làm tự luận của em: ${this.currentAiEssayRes.feedback}`;
    if (window.ttsService) {
      window.ttsService.setVoiceAccent('central');
      window.ttsService.speak(textToSpeak, () => {
        window.app?.showToast("🎉 Đã hoàn tất thuyết minh nhận xét bằng giọng Cô Đà Nẵng!", "success");
      });
      window.app?.showToast("🎙️ Cô giáo Đà Nẵng đang thuyết minh lời nhận xét sư phạm cho em nghe...", "info");
    }
  }

  // Hiệu ứng pháo hoa ăn mừng rực rỡ (Victory Confetti)
  launchConfetti() {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];
    const container = document.body;

    for (let i = 0; i < 35; i++) {
      const conf = document.createElement('div');
      conf.className = 'fixed z-[9999] pointer-events-none rounded-full animate-ping';
      const size = Math.random() * 12 + 6;
      conf.style.width = `${size}px`;
      conf.style.height = `${size}px`;
      conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      conf.style.left = `${Math.random() * 100}vw`;
      conf.style.top = `${Math.random() * 40}vh`;
      conf.style.opacity = '0.9';
      conf.style.transition = 'all 1.5s ease-out';
      container.appendChild(conf);

      setTimeout(() => {
        conf.style.transform = `translateY(${Math.random() * 300 + 200}px) rotate(${Math.random() * 360}deg)`;
        conf.style.opacity = '0';
      }, 50);

      setTimeout(() => {
        if (conf.parentNode) conf.parentNode.removeChild(conf);
      }, 1600);
    }
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
  // 5. XEM LẠI LỊCH SỬ LÀM BÀI THEO LỚP & XUẤT BẢNG ĐIỂM & IN GIẤY KHEN
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
                  <th class="p-3 text-center">Vi Phạm</th>
                  <th class="p-3 text-center">Giấy Khen</th>
                  <th class="p-3 text-center">Báo Điểm</th>
                  <th class="p-3 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium">
                ${history.length === 0 ? `
                  <tr>
                    <td colspan="9" class="p-8 text-center text-slate-400 font-bold">Không tìm thấy lượt làm bài nào trong lớp này.</td>
                  </tr>
                ` : history.map((h, idx) => `
                  <tr class="hover:bg-slate-50">
                    <td class="p-3 font-bold text-slate-900">${h.studentName}</td>
                    <td class="p-3 text-center"><span class="badge badge-cyan text-[10px] font-black">${h.className || '3A'}</span></td>
                    <td class="p-3 font-semibold text-slate-700 line-clamp-1 max-w-[200px]">${h.examTitle}</td>
                    <td class="p-3 text-center font-black text-emerald-700 text-sm">${h.score} / 10</td>
                    <td class="p-3 text-center"><span class="badge ${h.score >= 9 ? 'badge-amber' : 'badge-emerald'} text-[10px] font-black">${h.classification}</span></td>
                    <td class="p-3 text-center">
                      ${h.tabSwitchCount > 0 ? `
                        <span class="badge bg-rose-100 text-rose-800 text-[10px] font-bold" title="Học sinh rời khỏi tab ${h.tabSwitchCount} lần">
                          ⚠️ ${h.tabSwitchCount} lần
                        </span>
                      ` : `
                        <span class="text-slate-400 text-[10px]">Không</span>
                      `}
                    </td>
                    <td class="p-3 text-center">
                      ${h.score >= 9.0 ? `
                        <button onclick="examPortal.openCertificateModal('${h.id}')" class="btn btn-outline btn-xs font-black text-amber-800 border-amber-300 hover:bg-amber-50 flex items-center gap-1 mx-auto" title="In Giấy khen điểm 10">
                          <span>🎖️</span> <span>Khen</span>
                        </button>
                      ` : `
                        <span class="text-slate-300 text-[10px]">-</span>
                      `}
                    </td>
                    <td class="p-3 text-center">
                      <button onclick="examPortal.openParentReportModal('${h.id}')" class="btn btn-outline btn-xs font-black text-emerald-800 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1 mx-auto" title="Gửi kết quả kiểm tra cho Phụ huynh qua Zalo">
                        <span>📱</span> <span>Zalo</span>
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
    const user = window.authService?.getUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      window.app?.showToast("Chỉ có Giáo viên và Quản trị viên mới được phép xóa đề kiểm tra!", "warning");
      return;
    }

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
    const user = window.authService?.getUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      window.app?.showToast("Chỉ có Giáo viên và Quản trị viên mới được phép xóa đề kiểm tra!", "warning");
      this.closeDeleteModal();
      return;
    }

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
