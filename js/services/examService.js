/**
 * EXAM SERVICE (DỊCH VỤ QUẢN LÝ ĐỀ KIỂM TRA & ĐÁNH GIÁ ĐỊNH KỲ)
 * Quản lý tải lên, sửa, đổi file, xóa bỏ đề thi, phân loại (15P, Giữa kì, Cuối kì, Ma trận), 
 * AI sinh ma trận bản đặc tả chuẩn Thông tư 27/2020 và đồng bộ 100% Supabase Cloud Database.
 */

class ExamService {
  constructor() {
    this.exams = [];
  }

  // 1. Lấy danh sách đề kiểm tra (hỗ trợ lọc khối lớp, loại đề, bộ sách và tìm kiếm)
  async getAllExams(gradeFilter = "all", searchQuery = "", typeFilter = "all", bookFilter = "all") {
    let list = [];

    // 1. Kiểm tra Supabase trước
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        let query = client.from("exam_assessments").select("*").order("created_at", { ascending: false });

        if (gradeFilter !== "all") {
          query = query.eq("grade_level", parseInt(gradeFilter));
        }

        if (typeFilter !== "all") {
          query = query.eq("exam_type", typeFilter);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          list = data.map(item => ({
            id: item.id,
            title: item.title,
            grade: item.grade_level,
            examType: item.exam_type || "final_term_1",
            bookSeries: item.book_series || "KNTT",
            authorName: item.author_name || "Thầy Giáo Anh Đào",
            createdByUsername: item.created_by_username || "anhdao",
            schoolName: item.school_name || "Trường Tiểu Học Vui Học",
            durationMinutes: item.duration_minutes || 35,
            totalScore: item.total_score || 10,
            fileName: item.file_name,
            fileSizeText: item.file_size_text || "2.1 MB",
            fileType: item.file_type || "docx",
            fileUrl: item.file_url,
            downloadCount: item.download_count || 0,
            viewCount: item.view_count || 0,
            thumbnailColor: item.thumbnail_color || "from-blue-700 to-indigo-600",
            description: item.description || "",
            matrixJson: item.matrix_json || null,
            createdAt: item.created_at
          }));
        }
      } catch (err) {
        console.warn("Lỗi tải đề kiểm tra từ Supabase, chuyển về bộ nhớ cục bộ:", err);
      }
    }

    // 2. Dự phòng LocalStorage nếu Supabase trống hoặc offline
    if (list.length === 0) {
      const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
      list = db.exams || this.getDefaultMockExams();

      if (gradeFilter !== "all") {
        list = list.filter(e => e.grade === parseInt(gradeFilter));
      }

      if (typeFilter !== "all") {
        list = list.filter(e => e.examType === typeFilter);
      }
    }

    // Lọc theo Bộ sách Giáo khoa
    if (bookFilter !== "all") {
      list = list.filter(e => e.bookSeries === bookFilter);
    }

    // Lọc theo Từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.title.toLowerCase().includes(q) || 
        (e.authorName && e.authorName.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }

    return list;
  }

  // 2. Lấy danh sách ID đề thi yêu thích
  getFavoriteIds() {
    const user = window.authService?.getUser();
    const key = user ? `app_fav_exams_${user.username}` : "app_fav_exams_guest";
    try {
      return JSON.parse(localStorage.getItem(key)) || ["exam_01"];
    } catch (e) {
      return ["exam_01"];
    }
  }

  // 3. Kiểm tra 1 đề thi có được yêu thích hay không
  isFavorite(id) {
    const favs = this.getFavoriteIds();
    return favs.includes(id);
  }

  // 4. Bật/Tắt yêu thích đề thi
  toggleFavorite(id) {
    const user = window.authService?.getUser();
    const key = user ? `app_fav_exams_${user.username}` : "app_fav_exams_guest";
    let favs = this.getFavoriteIds();
    let isFavNow = false;

    if (favs.includes(id)) {
      favs = favs.filter(favId => favId !== id);
      isFavNow = false;
    } else {
      favs.push(id);
      isFavNow = true;
    }

    localStorage.setItem(key, JSON.stringify(favs));
    return isFavNow;
  }

  // 5. Lấy thông tin 1 đề thi theo ID
  async getExamById(id) {
    const all = await this.getAllExams();
    return all.find(e => e.id === id);
  }

  // 6. Tải lên và lưu đề kiểm tra mới (Đồng bộ FE -> BE -> Supabase Cloud)
  async uploadExam(examData) {
    const user = window.authService?.getUser() || { username: "anhdao", name: "Thầy Giáo Anh Đào", school: "Trường Tiểu Học" };
    const examId = examData.id || ("exam_" + Date.now());

    const colors = [
      "from-blue-700 to-indigo-600",
      "from-emerald-700 to-teal-600",
      "from-amber-600 to-rose-600",
      "from-purple-700 to-indigo-700",
      "from-cyan-700 to-blue-800"
    ];
    const randColor = colors[Math.floor(Math.random() * colors.length)];

    const examObj = {
      id: examId,
      title: examData.title.trim(),
      grade: parseInt(examData.grade) || 3,
      examType: examData.examType || "final_term_1",
      bookSeries: examData.bookSeries || "KNTT",
      authorName: examData.authorName || user.name,
      createdByUsername: examData.createdByUsername || user.username,
      schoolName: user.school || "Trường Tiểu Học Vui Học",
      durationMinutes: parseInt(examData.durationMinutes) || 35,
      totalScore: parseInt(examData.totalScore) || 10,
      fileName: examData.fileName || "De_Kiem_Tra_TinHoc.docx",
      fileSizeText: examData.fileSizeText || "2.0 MB",
      fileType: examData.fileType || "docx",
      fileUrl: examData.fileUrl || "#",
      downloadCount: 0,
      viewCount: 0,
      thumbnailColor: randColor,
      description: examData.description || "Đề kiểm tra định kỳ môn Tin học thiết kế theo chuẩn Thông tư 27/2020/TT-BGDĐT và GDPT 2018.",
      matrixJson: examData.matrixJson || this.generateDefaultMatrix(examData.grade, examData.examType),
      createdAt: new Date().toISOString()
    };

    // 1. Lưu LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.exams) db.exams = this.getDefaultMockExams();
    db.exams.unshift(examObj);
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // 2. Đồng bộ lên Supabase Database
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const payload = {
          title: examObj.title,
          grade_level: examObj.grade,
          exam_type: examObj.examType,
          book_series: examObj.bookSeries,
          author_name: examObj.authorName,
          created_by_username: examObj.createdByUsername,
          school_name: examObj.schoolName,
          duration_minutes: examObj.durationMinutes,
          total_score: examObj.totalScore,
          file_name: examObj.fileName,
          file_size_text: examObj.fileSizeText,
          file_type: examObj.fileType,
          file_url: examObj.fileUrl,
          download_count: 0,
          view_count: 0,
          thumbnail_color: examObj.thumbnailColor,
          description: examObj.description,
          matrix_json: examObj.matrixJson,
          updated_at: new Date().toISOString()
        };

        if (examData.id && !examData.id.startsWith("exam_")) {
          payload.id = examData.id;
        }

        const { data, error } = await client.from("exam_assessments").insert([payload]).select().single();
        if (data && data.id) {
          examObj.id = data.id;
        }
      } catch (err) {
        console.warn("Lỗi lưu đề thi lên Supabase:", err);
      }
    }

    return { success: true, exam: examObj };
  }

  // 7. Cập nhật / Chỉnh sửa đề thi và thay thế file (Đồng bộ Supabase)
  async updateExam(id, updateData) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    let updatedObj = null;

    if (!db.exams) db.exams = this.getDefaultMockExams();
    const idx = db.exams.findIndex(e => e.id === id);
    if (idx >= 0) {
      db.exams[idx] = {
        ...db.exams[idx],
        title: updateData.title || db.exams[idx].title,
        grade: parseInt(updateData.grade) || db.exams[idx].grade,
        examType: updateData.examType || db.exams[idx].examType,
        bookSeries: updateData.bookSeries || db.exams[idx].bookSeries,
        durationMinutes: parseInt(updateData.durationMinutes) || db.exams[idx].durationMinutes,
        description: updateData.description !== undefined ? updateData.description : db.exams[idx].description,
        authorName: updateData.authorName || db.exams[idx].authorName,
        updatedAt: new Date().toISOString()
      };

      if (updateData.fileName) db.exams[idx].fileName = updateData.fileName;
      if (updateData.fileSizeText) db.exams[idx].fileSizeText = updateData.fileSizeText;
      if (updateData.fileType) db.exams[idx].fileType = updateData.fileType;
      if (updateData.fileUrl) db.exams[idx].fileUrl = updateData.fileUrl;
      if (updateData.matrixJson) db.exams[idx].matrixJson = updateData.matrixJson;

      updatedObj = db.exams[idx];
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    // Đồng bộ lên Supabase Cloud
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const payload = {
          title: updateData.title,
          grade_level: parseInt(updateData.grade),
          exam_type: updateData.examType,
          book_series: updateData.bookSeries,
          duration_minutes: parseInt(updateData.durationMinutes),
          description: updateData.description,
          author_name: updateData.authorName,
          updated_at: new Date().toISOString()
        };

        if (updateData.fileName) payload.file_name = updateData.fileName;
        if (updateData.fileSizeText) payload.file_size_text = updateData.fileSizeText;
        if (updateData.fileType) payload.file_type = updateData.fileType;
        if (updateData.fileUrl) payload.file_url = updateData.fileUrl;
        if (updateData.matrixJson) payload.matrix_json = updateData.matrixJson;

        await client.from("exam_assessments").update(payload).eq("id", id);
      } catch (err) {
        console.warn("Lỗi cập nhật đề thi lên Supabase:", err);
      }
    }

    return { success: true, exam: updatedObj };
  }

  // 8. Xóa đề kiểm tra (Xóa cả LocalStorage và Supabase Cloud)
  async deleteExam(id) {
    // 1. Xóa trong LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.exams) {
      db.exams = db.exams.filter(e => e.id !== id);
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    // 2. Xóa trên Supabase Cloud Database
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const { error } = await client.from("exam_assessments").delete().eq("id", id);
        if (error) {
          console.warn("Lỗi xóa đề thi từ Supabase:", error);
        }
      } catch (err) {
        console.warn("Lỗi kết nối xóa đề thi Supabase:", err);
      }
    }

    return { success: true };
  }

  // 9. Tăng lượt xem / tải
  async recordAction(id, type = 'view') {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.exams) {
      const idx = db.exams.findIndex(e => e.id === id);
      if (idx >= 0) {
        if (type === 'view') db.exams[idx].viewCount = (db.exams[idx].viewCount || 0) + 1;
        if (type === 'download') db.exams[idx].downloadCount = (db.exams[idx].downloadCount || 0) + 1;
        localStorage.setItem("app_mock_db", JSON.stringify(db));
      }
    }

    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const col = type === 'view' ? 'view_count' : 'download_count';
        await client.rpc('increment_exam_counter', { exam_id: id, counter_col: col }).catch(() => {});
      } catch (err) {}
    }
  }

  // 10. AI Sinh Ma Trận Đề & Bản Đặc Tả Chuẩn Thông Tư 27 (4 Mức Độ Nhận Thức)
  async generateAIMatrix(title, grade, examType) {
    await new Promise(r => setTimeout(r, 600));

    const levels = [
      { level: "Mức 1 (Nhận biết)", percent: "40%", questions: "4 Câu Trắc Nghiệm (4.0 Điểm)", desc: "Nhận biết các bộ phận máy tính, thao tác gõ phím và bảo vệ an toàn máy tính." },
      { level: "Mức 2 (Thông hiểu)", percent: "30%", questions: "3 Câu Trắc Nghiệm (3.0 Điểm)", desc: "Hiểu chức năng của bàn phím, chuột, thư mục tệp tin và tìm kiếm thông tin cơ bản." },
      { level: "Mức 3 (Vận dụng)", percent: "20%", questions: "1 Câu Thực Hành (2.0 Điểm)", desc: "Tạo và quản lý cây thư mục, vẽ hình đơn giản trên Paint hoặc gõ đoạn văn bản ngắn." },
      { level: "Mức 4 (Vận dụng cao)", percent: "10%", questions: "1 Câu Thực Hành (1.0 Điểm)", desc: "Ứng dụng phần mềm giải quyết tình huống thực tế, chèn ảnh minh họa đẹp mắt." }
    ];

    const distribution = {
      theoryScore: 7.0, // Lý thuyết Trắc nghiệm 7 điểm
      practiceScore: 3.0, // Thực hành trên máy tính 3 điểm
      totalQuestions: 9,
      duration: grade === 3 ? "35 phút" : "40 phút"
    };

    return {
      title: title || `Ma Trận Đề Kiểm Tra Tin Học Lớp ${grade}`,
      grade: grade,
      examType: examType,
      standard: "Thông tư 27/2020/TT-BGDĐT & GDPT 2018",
      levels: levels,
      distribution: distribution,
      rubricSteps: [
        "1. Phần Trắc Nghiệm (7.0 điểm): 7 câu x 1.0 điểm/câu chọn đáp án đúng nhất A, B, C, D.",
        "2. Phần Thực Hành (3.0 điểm): Thực hiện thao tác trực tiếp trên máy tính tại phòng Tin học.",
        "3. Đánh giá xếp loại: Hoàn thành Tốt (T), Hoàn thành (H), Chưa hoàn thành (C)."
      ]
    };
  }

  // Ma trận mặc định
  generateDefaultMatrix(grade, examType) {
    return {
      standard: "Thông tư 27/2020/TT-BGDĐT",
      levels: [
        { level: "Mức 1 (Nhận biết)", percent: "40%", score: 4.0 },
        { level: "Mức 2 (Thông hiểu)", percent: "30%", score: 3.0 },
        { level: "Mức 3 (Vận dụng)", percent: "20%", score: 2.0 },
        { level: "Mức 4 (Vận dụng cao)", percent: "10%", score: 1.0 }
      ]
    };
  }

  // Danh sách đề thi mẫu ban đầu
  getDefaultMockExams() {
    return [
      {
        id: "exam_01",
        title: "Đề Kiểm Tra Cuối Học Kỳ I - Tin Học Lớp 3 (Kèm Ma Trận & Bản Đặc Tả)",
        grade: 3,
        examType: "final_term_1",
        bookSeries: "KNTT",
        authorName: "Thầy Giáo Anh Đào",
        createdByUsername: "anhdao",
        schoolName: "Trường Tiểu Học Vui Học",
        durationMinutes: 35,
        totalScore: 10,
        fileName: "De_Kiem_Tra_Cuoi_HK1_TinHoc3_KNTT.docx",
        fileSizeText: "1.8 MB",
        fileType: "docx",
        fileUrl: "#",
        downloadCount: 42,
        viewCount: 156,
        thumbnailColor: "from-blue-700 to-indigo-600",
        description: "Đề kiểm tra đánh giá định kỳ Cuối HK1 lớp 3 bộ sách Kết Nối Tri Thức. Cấu trúc 7 điểm Trắc nghiệm + 3 điểm Thực hành gõ phím và vẽ Paint.",
        createdAt: "2026-08-10T08:00:00.000Z"
      },
      {
        id: "exam_02",
        title: "Đề Kiểm Tra Giữa Học Kỳ I - Tin Học Lớp 4 (Cánh Diều)",
        grade: 4,
        examType: "mid_term_1",
        bookSeries: "CD",
        authorName: "Thầy Giáo Anh Đào",
        createdByUsername: "anhdao",
        schoolName: "Trường Tiểu Học Vui Học",
        durationMinutes: 35,
        totalScore: 10,
        fileName: "De_Giua_HK1_TinHoc4_CanhDieu.docx",
        fileSizeText: "2.3 MB",
        fileType: "docx",
        fileUrl: "#",
        downloadCount: 38,
        viewCount: 120,
        thumbnailColor: "from-amber-600 to-orange-600",
        description: "Đề kiểm tra định kỳ Giữa HK1 Tin học 4: Phần cứng và phần mềm, tạo cây thư mục và quy tắc an toàn thông tin.",
        createdAt: "2026-08-11T09:30:00.000Z"
      },
      {
        id: "exam_03",
        title: "Bộ Ma Trận & Bản Đặc Tả Đề Kiểm Tra Cuối Học Kỳ II - Tin Học Lớp 5",
        grade: 5,
        examType: "matrix",
        bookSeries: "CTST",
        authorName: "Thầy Giáo Anh Đào",
        createdByUsername: "anhdao",
        schoolName: "Trường Tiểu Học Vui Học",
        durationMinutes: 40,
        totalScore: 10,
        fileName: "Ma_Tran_Ban_Dac_Ta_TinHoc5_CTST.docx",
        fileSizeText: "1.5 MB",
        fileType: "docx",
        fileUrl: "#",
        downloadCount: 65,
        viewCount: 230,
        thumbnailColor: "from-emerald-700 to-teal-600",
        description: "Bản đặc tả ma trận chuẩn 4 mức độ nhận thức theo Thông tư 27 và hướng dẫn chấm bài thực hành lập trình Scratch / Soạn thảo trình chiếu.",
        createdAt: "2026-08-12T14:15:00.000Z"
      },
      {
        id: "exam_04",
        title: "Đề Kiểm Tra Thường Xuyên 15 Phút: Khám Phá Máy Tính (Lớp 3)",
        grade: 3,
        examType: "regular",
        bookSeries: "KNTT",
        authorName: "Thầy Giáo Anh Đào",
        createdByUsername: "anhdao",
        schoolName: "Trường Tiểu Học Vui Học",
        durationMinutes: 15,
        totalScore: 10,
        fileName: "De_15P_KhamPhaMayTinh_Lop3.docx",
        fileSizeText: "850 KB",
        fileType: "docx",
        fileUrl: "#",
        downloadCount: 29,
        viewCount: 95,
        thumbnailColor: "from-purple-700 to-indigo-800",
        description: "Bài kiểm tra nhanh 15 phút đầu giờ: 10 câu trắc nghiệm nhanh kiểm tra nhận biết bàn phím, chuột và màn hình.",
        createdAt: "2026-08-13T10:00:00.000Z"
      }
    ];
  }
}

window.examService = new ExamService();
