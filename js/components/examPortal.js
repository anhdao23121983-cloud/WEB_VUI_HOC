/**
 * EXAM PORTAL COMPONENT
 * Quản lý Menu KIỂM TRA & ĐÁNH GIÁ ĐỊNH KỲ:
 * - Làm bài thi trực tuyến tự chấm điểm (Online Test Runner)
 * - Tải Bảng đáp án & Biểu điểm riêng biệt (.doc)
 * - Thống kê phổ điểm & xếp loại học sinh theo Thông tư 27
 * - Trộn đề thi tự động 4 mã đề (101, 102, 103, 104) kèm ma trận đối chiếu
 * - Xem lại Lịch sử làm bài thi & Nhật ký chấm điểm của từng học sinh
 * - Xuất Bảng Điểm Tổng Hợp Lớp (.doc / .xls) nộp BGH & vào sổ điểm
 * - AI Tự Động Sinh Đề Kiểm Tra Theo Từng Chủ Đề GDPT 2018 (Chủ đề A..F)
 * - Tải lên, Chỉnh sửa, Đổi file, Xóa bỏ đề thi (Đồng bộ 100% Supabase)
 */

class ExamPortal {
  constructor() {
    this.currentGrade = "all";
    this.currentExamType = "all";
    this.currentBookSeries = "all";
    this.currentTab = "all"; // 'all' | 'my_exams' | 'favorites'
    this.searchQuery = "";
    this.exams = [];

    // Delete state
    this.pendingDeleteId = null;
    this.pendingDeleteTitle = "";

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
    let allExams = await window.examService.getAllExams(this.currentGrade, this.searchQuery, this.currentExamType, this.currentBookSeries);
    const favoriteIds = window.examService.getFavoriteIds();
    
    // Đếm số lượng
    const myExamsCount = user ? allExams.filter(e => (e.createdByUsername === user.username) || (e.authorName === user.name) || user.role === 'admin').length : 0;
    const favoritesCount = allExams.filter(e => favoriteIds.includes(e.id)).length;

    if (this.currentTab === "my_exams" && user) {
      this.exams = allExams.filter(e => (e.createdByUsername === user.username) || (e.authorName === user.name) || user.role === 'admin');
    } else if (this.currentTab === "favorites") {
      this.exams = allExams.filter(e => favoriteIds.includes(e.id));
    } else {
      this.exams = allExams;
    }

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
            <p class="text-cyan-100 text-xs md:text-sm">Làm bài trực tuyến tự chấm, AI Tạo đề theo chủ đề, Trộn 4 mã đề, Lịch sử thi & Xuất bảng điểm</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="examPortal.openHistoryModal()" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md" title="Xem lại lịch sử làm bài và điểm số của học sinh">
              <span>📜</span> <span>Lịch Sử Thi</span>
            </button>
            <button onclick="examPortal.openAnalyticsModal()" class="btn bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2.5 px-3.5 rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-md" title="Xem phổ điểm và tỷ lệ xếp loại T-H-C">
              <span>📈</span> <span>Phổ Điểm</span>
            </button>
            ${isTeacher ? `
              <button onclick="examPortal.openAIGeneratorModal()" class="btn bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs py-2.5 px-3.5 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all" title="AI tự động sinh đề theo từng chủ đề A, B, C, D, E, F">
                <span>✨</span> <span>AI Sinh Đề</span>
              </button>
              <button onclick="examUploadModal.openModal(${this.currentGrade === 'all' ? 3 : this.currentGrade})" class="btn btn-amber btn-sm font-black shadow-xl flex items-center gap-1.5 shrink-0 hover:scale-105 transition-all">
                <span>📤</span> <span>Tải Đề Lên</span>
              </button>
            ` : `
              <div class="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 text-center text-xs text-white">
                <span class="font-bold block text-amber-300">💡 Dành Cho Học Sinh:</span>
                <span>Em có thể bấm <b>'✍️ Thi Trực Tuyến'</b> để tự luyện tập và chấm điểm!</span>
              </div>
            `}
          </div>
        </div>

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

        <!-- Thanh Bộ Lọc 3 Tầng: Khối Lớp + Loại Đề + 3 Bộ Sách Giáo Khoa -->
        <div class="glass-card p-5 space-y-4">
          <!-- Hàng 1: Lọc Khối Lớp & Tìm Kiếm -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-500 mr-1">Khối Lớp:</span>
              <button onclick="examPortal.selectGrade('all')" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 'all' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                Tất Cả Khối
              </button>
              <button onclick="examPortal.selectGrade(3)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 3 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                🎒 Lớp 3
              </button>
              <button onclick="examPortal.selectGrade(4)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 4 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                🚀 Lớp 4
              </button>
              <button onclick="examPortal.selectGrade(5)" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${this.currentGrade === 5 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                ⭐ Lớp 5
              </button>
            </div>

            <!-- Ô Tìm Kiếm -->
            <div class="relative w-full md:w-80">
              <input type="text" id="exam-search-input" value="${this.searchQuery}" oninput="examPortal.handleSearch(this.value)" placeholder="Tìm đề kiểm tra, tác giả, nội dung..." class="form-control text-xs pl-9 font-medium">
              <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
          </div>

          <!-- Hàng 2: Lọc Theo Loại Đề Kiểm Tra -->
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

          <!-- Hàng 3: Lọc Theo Bộ Sách Giáo Khoa -->
          <div class="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200/70">
            <span class="text-xs font-bold text-slate-500 mr-1">Bộ Sách Giáo Khoa:</span>
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

        <!-- Danh Sách Card Đề Kiểm Tra -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>📝 DANH SÁCH ĐỀ KIỂM TRA</span>
              <span class="badge badge-emerald font-black text-xs">${this.exams.length} Đề</span>
            </h3>
            ${isTeacher ? `
              <div class="flex items-center gap-2">
                <button onclick="examPortal.openAIGeneratorModal()" class="btn btn-outline btn-xs font-black text-purple-800 border-purple-300 hover:bg-purple-50 flex items-center gap-1">
                  <span>✨</span> <span>AI Sinh Đề</span>
                </button>
                <button onclick="examUploadModal.openModal()" class="btn btn-outline btn-xs font-black text-emerald-800 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1">
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

  // Render lưới thẻ đề kiểm tra
  renderExamGrid(isTeacher, user) {
    if (this.exams.length === 0) {
      return `
        <div class="text-center py-16 glass-card space-y-3 text-slate-400">
          <span class="text-6xl block mb-2">📝</span>
          <p class="font-black text-slate-700 text-base">Chưa có đề kiểm tra nào trong mục này.</p>
          <p class="text-xs text-slate-500">Thầy Cô hãy bấm nút <b>'Tải Lên Đề Mới'</b> hoặc <b>'AI Sinh Đề'</b> để tạo đề thi đầu tiên!</p>
          ${isTeacher ? `
            <div class="flex items-center justify-center gap-2 mt-2">
              <button onclick="examPortal.openAIGeneratorModal()" class="btn btn-primary btn-sm font-black">
                ✨ AI Sinh Đề Tự Động
              </button>
              <button onclick="examUploadModal.openModal()" class="btn btn-emerald btn-sm font-black">
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
            <div class="glass-card overflow-hidden hover:border-emerald-500 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group relative">
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
                    <p class="text-[11px] font-bold text-cyan-100 uppercase tracking-wider">Thang điểm ${e.totalScore || 10} • TT 27/2020</p>
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
    this.currentGrade = grade;
    this.render("main-content-area");
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

    const user = window.authService?.getUser() || { name: "Nguyễn Văn An" };
    const rawScore = Number(((correctCount / this.runnerQuestions.length) * 7.0 + 3.0).toFixed(1));
    const durationSpent = Math.floor((Date.now() - this.runnerStartTime) / 1000);

    const result = await window.examService.submitExamAttempt({
      examId: this.activeRunnerExam?.id,
      examTitle: this.activeRunnerExam?.title,
      studentName: user.name,
      grade: this.activeRunnerExam?.grade,
      score: rawScore,
      durationSpentSeconds: durationSpent
    });

    const qContainer = document.getElementById("exam-runner-question-body");
    const navTrack = document.getElementById("exam-runner-nav-track");
    if (navTrack) navTrack.innerHTML = "";

    if (qContainer) {
      qContainer.innerHTML = `
        <div class="text-center py-6 space-y-5 animate-pop">
          <span class="text-6xl block">🏆</span>
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
            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
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

          <div class="pt-2">
            <button onclick="examPortal.closeRunnerModal()" class="btn btn-primary font-black btn-md px-8 shadow-lg">
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
  // 5. XEM LẠI LỊCH SỬ LÀM BÀI THI & XUẤT BẢNG ĐIỂM LỚP
  // =========================================================================
  openHistoryModal(studentUsername = null) {
    const history = window.examService.getExamHistory(studentUsername);
    const modal = document.getElementById("exam-history-modal");
    const content = document.getElementById("exam-history-content");

    if (content) {
      content.innerHTML = `
        <div class="space-y-4 text-xs text-slate-800 animate-pop">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="badge badge-emerald font-black text-xs">TỔNG CỘNG: ${history.length} LƯỢT THI</span>
              <span class="text-[11px] text-slate-500">Ghi nhận tiến độ làm bài thời gian thực</span>
            </div>
            <button onclick="examPortal.exportClassGradebookDoc('3A')" class="btn btn-emerald btn-xs font-black flex items-center gap-1 shadow">
              <span>📊</span> <span>Xuất Bảng Điểm Lớp (.doc)</span>
            </button>
          </div>

          <div class="overflow-x-auto border border-slate-200 rounded-2xl">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-slate-100 text-slate-700 font-black text-[11px]">
                <tr>
                  <th class="p-3">Học Sinh</th>
                  <th class="p-3">Tên Đề Thi</th>
                  <th class="p-3 text-center">Khối</th>
                  <th class="p-3 text-center">Điểm Số</th>
                  <th class="p-3 text-center">Xếp Loại</th>
                  <th class="p-3 text-center">Thời Gian</th>
                  <th class="p-3 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium">
                ${history.map((h, idx) => `
                  <tr class="hover:bg-slate-50">
                    <td class="p-3 font-bold text-slate-900">${h.studentName}</td>
                    <td class="p-3 font-semibold text-slate-700 line-clamp-1 max-w-[220px]">${h.examTitle}</td>
                    <td class="p-3 text-center"><span class="badge badge-cyan text-[10px]">Lớp ${h.grade}</span></td>
                    <td class="p-3 text-center font-black text-emerald-700 text-sm">${h.score} / 10</td>
                    <td class="p-3 text-center"><span class="badge ${h.score >= 9 ? 'badge-amber' : 'badge-emerald'} text-[10px] font-black">${h.classification}</span></td>
                    <td class="p-3 text-center text-[10px] text-slate-400">${Math.floor((h.durationSpentSeconds || 120) / 60)}p ${((h.durationSpentSeconds || 120) % 60)}s</td>
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

  deleteAttemptRecord(attemptId) {
    if (confirm("Thầy Cô có chắc chắn muốn xóa bản ghi kết quả thi này?")) {
      window.examService.deleteExamHistory(attemptId);
      window.app.showToast("🗑️ Đã xóa bản ghi lượt thi thành công!", "info");
      this.openHistoryModal();
    }
  }

  exportClassGradebookDoc(className = "3A") {
    const history = window.examService.getExamHistory();
    if (window.docExportService?.exportGradebookExcelDoc) {
      window.docExportService.exportGradebookExcelDoc(className, 3, history);
      window.app.showToast(`📊 Đang tải xuống Bảng Điểm Tổng Hợp Lớp ${className}!`, "success");
    }
  }

  // =========================================================================
  // 6. AI TỰ ĐỘNG SINH ĐỀ KIỂM TRA THEO TỪNG CHỦ ĐỀ GDPT 2018
  // =========================================================================
  openAIGeneratorModal() {
    const modal = document.getElementById("ai-exam-generator-modal");
    if (modal) modal.classList.add("active");
  }

  async executeAIGenerateExam() {
    const grade = document.getElementById("ai-gen-grade")?.value || "3";
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
              <tbody class="divide-y divide-slate-200 font-medium text-slate-700">
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
}

window.examPortal = new ExamPortal();
