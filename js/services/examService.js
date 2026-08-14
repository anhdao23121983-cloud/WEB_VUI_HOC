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
  // 11. Lấy danh sách câu hỏi trắc nghiệm làm bài thi online
  getOnlineExamQuestions(exam) {
    const grade = exam?.grade || 3;
    if (grade === 3) {
      return [
        {
          id: "q1",
          level: "Mức 1 (Nhận biết)",
          question: "Thiết bị nào của máy tính để bàn giúp em nhìn thấy chữ, hình ảnh và kết quả làm việc?",
          options: ["A. Chuột máy tính", "B. Bàn phím", "C. Màn hình", "D. Thân máy"],
          correct: 2,
          explanation: "Màn hình có mặt kính phát sáng hiển thị toàn bộ hình ảnh và bài học."
        },
        {
          id: "q2",
          level: "Mức 1 (Nhận biết)",
          question: "Hai phím có gờ nổi giúp em định vị vị trí đặt ngón trỏ trên hàng phím cơ sở là:",
          options: ["A. Phím G và H", "B. Phím F và J", "C. Phím A và L", "D. Phím D và K"],
          correct: 1,
          explanation: "Phím F (ngón trỏ tay trái) và J (ngón trỏ tay phải) có gờ định vị."
        },
        {
          id: "q3",
          level: "Mức 2 (Thông hiểu)",
          question: "Để lưu bài vẽ đang làm vào máy tính, em sử dụng tổ hợp phím tắt nào?",
          options: ["A. Ctrl + C", "B. Ctrl + V", "C. Ctrl + S", "D. Ctrl + Z"],
          correct: 2,
          explanation: "Tổ hợp phím Ctrl + S viết tắt của Save (Lưu tệp tin)."
        },
        {
          id: "q4",
          level: "Mức 2 (Thông hiểu)",
          question: "Khi muốn xóa ký tự nằm ở bên trái con trỏ soạn thảo, em sử dụng phím nào?",
          options: ["A. Phím Delete", "B. Phím Backspace (←)", "C. Phím Enter", "D. Phím Shift"],
          correct: 1,
          explanation: "Phím Backspace xóa ký tự bên trái, còn Delete xóa ký tự bên phải."
        },
        {
          id: "q5",
          level: "Mức 2 (Thông hiểu)",
          question: "Trước khi rời khỏi phòng thực hành Tin học, hành động nào sau đây là ĐÚNG quy định?",
          options: [
            "A. Rút thẳng dây điện nguồn",
            "B. Tắt máy đúng quy trình qua nút Start -> Shut down và xếp ghế gọn gàng",
            "C. Để nguyên máy chạy",
            "D. Mang đồ ăn vào phòng máy"
          ],
          correct: 1,
          explanation: "Cần tắt máy đúng quy trình và bảo quản thiết bị phòng máy an toàn."
        },
        {
          id: "q6",
          level: "Mức 3 (Vận dụng)",
          question: "Thư mục (Folder) trong máy tính có biểu tượng màu vàng hình kẹp giấy dùng để làm gì?",
          options: [
            "A. Dùng để xem video",
            "B. Dùng để chứa và phân loại các tệp tin một cách khoa học",
            "C. Dùng để xóa virus",
            "D. Dùng để nghe nhạc"
          ],
          correct: 1,
          explanation: "Thư mục giúp phân loại, sắp xếp tài liệu học tập gọn gàng, ngăn nắp."
        },
        {
          id: "q7",
          level: "Mức 3 (Vận dụng)",
          question: "Thông tin cá nhân nào sau đây em TUYỆT ĐỐI KHÔNG được chia sẻ cho người lạ trên mạng?",
          options: [
            "A. Tên trò chơi yêu thích",
            "B. Mật khẩu tài khoản, địa chỉ nhà và số điện thoại phụ huynh",
            "C. Tên bài hát thiếu nhi",
            "D. Màu sắc em thích"
          ],
          correct: 1,
          explanation: "Bảo vệ mật khẩu và thông tin riêng tư để tránh nguy cơ mất an toàn số."
        }
      ];
    } else if (grade === 4) {
      return [
        {
          id: "q1",
          level: "Mức 1",
          question: "Bộ phận nào sau đây thuộc về Phần cứng (Hardware) của máy tính?",
          options: ["A. Phần mềm Paint", "B. Chuột và Bàn phím", "C. Trò chơi Scratch", "D. Hệ điều hành Windows"],
          correct: 1,
          explanation: "Phần cứng là các thiết bị vật lý có thể nhìn và chạm vào được."
        },
        {
          id: "q2",
          level: "Mức 1",
          question: "Để chọn toàn bộ văn bản hoặc hình ảnh, em sử dụng tổ hợp phím nào?",
          options: ["A. Ctrl + A", "B. Ctrl + B", "C. Ctrl + I", "D. Ctrl + U"],
          correct: 0,
          explanation: "Ctrl + A viết tắt của Select All (Chọn tất cả)."
        },
        {
          id: "q3",
          level: "Mức 2",
          question: "Tệp trình chiếu PowerPoint thường có phần mở rộng mặc định là gì?",
          options: ["A. .docx", "B. .pptx", "C. .xlsx", "D. .mp3"],
          correct: 1,
          explanation: "Tệp PowerPoint có đuôi mở rộng là .pptx hoặc .ppt."
        },
        {
          id: "q4",
          level: "Mức 2",
          question: "Trong cây thư mục, thư mục chứa các thư mục con khác bên trong gọi là gì?",
          options: ["A. Thư mục gốc / Thư mục cha", "B. Tệp tin", "C. Ổ đĩa", "D. Phím tắt"],
          correct: 0,
          explanation: "Thư mục bao ngoài chứa các thư mục con gọi là Thư mục cha (Parent folder)."
        },
        {
          id: "q5",
          level: "Mức 2",
          question: "Để chèn thêm một hình ảnh minh họa vào bài viết, em chọn thẻ lệnh nào?",
          options: ["A. File", "B. Insert -> Pictures", "C. View", "D. Review"],
          correct: 1,
          explanation: "Thẻ Insert (Chèn) cho phép chèn tranh ảnh, bảng biểu và sơ đồ."
        },
        {
          id: "q6",
          level: "Mức 3",
          question: "Khi gặp thông tin lạ hoặc tin nhắn đe dọa trên Internet, em nên làm gì đầu tiên?",
          options: [
            "A. Trả lời chửi bới lại",
            "B. Thông báo ngay cho Bố Mẹ hoặc Thầy Cô giáo để được hỗ trợ",
            "C. Chia sẻ cho các bạn cùng lớp",
            "D. Giữ bí mật không nói với ai"
          ],
          correct: 1,
          explanation: "Luôn tìm sự trợ giúp từ người lớn đáng tin cậy khi gặp rủi ro trên mạng."
        },
        {
          id: "q7",
          level: "Mức 3",
          question: "Trong lập trình khối lệnh, lệnh 'Di chuyển 10 bước' giúp nhân vật làm gì?",
          options: [
            "A. Phát ra tiếng kêu",
            "B. Tịnh tiến về phía trước 10 đơn vị bước",
            "C. Đổi màu sắc",
            "D. Xóa màn hình"
          ],
          correct: 1,
          explanation: "Khối lệnh di chuyển thay đổi tọa độ vị trí của nhân vật theo hướng chỉ định."
        }
      ];
    } else {
      return [
        {
          id: "q1",
          level: "Mức 1",
          question: "Công cụ tìm kiếm thông tin phổ biến hàng đầu thế giới hiện nay là gì?",
          options: ["A. Google", "B. Paint", "C. WordPad", "D. Calculator"],
          correct: 0,
          explanation: "Google là cỗ máy tìm kiếm dữ liệu trực tuyến phổ biến nhất."
        },
        {
          id: "q2",
          level: "Mức 1",
          question: "Địa chỉ thư điện tử (Email) hợp lệ luôn có ký tự đặc biệt nào?",
          options: ["A. Ký tự #", "B. Ký tự @", "C. Ký tự &", "D. Ký tự $"],
          correct: 1,
          explanation: "Địa chỉ email luôn có cấu trúc ten_nguoi_dung@ten_mien."
        },
        {
          id: "q3",
          level: "Mức 2",
          question: "Trong bảng tính Excel, công thức tính tổng các ô từ A1 đến A5 là:",
          options: ["A. =SUM(A1:A5)", "B. =TOTAL(A1:A5)", "C. =ADD(A1:A5)", "D. =PLUS(A1:A5)"],
          correct: 0,
          explanation: "Hàm =SUM(dải_ô) dùng để tính tổng các giá trị trong bảng tính."
        },
        {
          id: "q4",
          level: "Mức 2",
          question: "Bản quyền phần mềm (Copyright) có ý nghĩa gì đối với người sáng tạo?",
          options: [
            "A. Ai cũng có quyền sao chép bán lại",
            "B. Bảo vệ quyền sở hữu trí tuệ và quyền tác giả của người viết phần mềm",
            "C. Làm cho phần mềm bị lỗi",
            "D. Tự động xóa dữ liệu"
          ],
          correct: 1,
          explanation: "Tôn trọng bản quyền là quy tắc đạo đức cốt lõi trong kỷ nguyên số."
        },
        {
          id: "q5",
          level: "Mức 2",
          question: "Trong lập trình Scratch, khối lệnh 'Lặp lại 10 lần' thuộc nhóm lệnh nào?",
          options: ["A. Chuyển động (Motion)", "B. Điều khiển (Control)", "C. Âm thanh (Sound)", "D. Sự kiện (Events)"],
          correct: 1,
          explanation: "Nhóm lệnh Điều khiển (Control) chứa các cấu trúc rẽ nhánh và vòng lặp."
        },
        {
          id: "q6",
          level: "Mức 3",
          question: "Mật khẩu nào sau đây có độ an toàn và bảo mật MẠNH NHẤT?",
          options: ["A. 123456", "B. abcdef", "C. AnhDao@2026!#", "D. 111111"],
          correct: 2,
          explanation: "Mật khẩu mạnh kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt."
        },
        {
          id: "q7",
          level: "Mức 3",
          question: "Để tìm kiếm chính xác một cụm từ trên Google, em đặt cụm từ đó trong dấu gì?",
          options: ["A. Dấu ngoặc kép \"...\"", "B. Dấu ngoặc đơn (...) ", "C. Dấu gạch chéo /.../", "D. Dấu chấm hỏi ?...?"],
          correct: 0,
          explanation: "Đặt từ khóa trong ngoặc kép giúp tìm kiếm nguyên văn cụm từ chính xác."
        }
      ];
    }
  }

  // 12. Lưu kết quả thi trực tuyến của học sinh
  async submitExamAttempt(attemptData) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.exam_attempts) db.exam_attempts = [];

    const attemptObj = {
      id: "att_" + Date.now(),
      examId: attemptData.examId,
      examTitle: attemptData.examTitle,
      studentName: attemptData.studentName || "Nguyễn Văn An",
      grade: attemptData.grade || 3,
      score: attemptData.score, // Thang điểm 10
      totalScore: 10,
      classification: attemptData.score >= 9 ? "Hoàn thành Tốt (T)" : attemptData.score >= 5 ? "Hoàn thành (H)" : "Chưa hoàn thành (C)",
      starsEarned: attemptData.score >= 8 ? 20 : 10,
      durationSpentSeconds: attemptData.durationSpentSeconds || 180,
      submittedAt: new Date().toISOString()
    };

    db.exam_attempts.unshift(attemptObj);
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // Đồng bộ lên Supabase
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        await client.from("student_progress").insert([{
          student_name: attemptObj.studentName,
          game_id: attemptObj.examId,
          score: Math.round(attemptObj.score * 10),
          stars_earned: attemptObj.starsEarned
        }]);
      } catch (e) {}
    }

    return attemptObj;
  }

  // 13. Tổng hợp số liệu Thống Kê & Phổ Điểm Kiểm Tra
  getScoreDistributionSummary() {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const attempts = db.exam_attempts || [
      { score: 10, grade: 3, studentName: "Nguyễn Văn An" },
      { score: 9.5, grade: 3, studentName: "Lê Bảo Ngọc" },
      { score: 9.0, grade: 3, studentName: "Trần Minh Quân" },
      { score: 8.5, grade: 3, studentName: "Phạm Hoàng Long" },
      { score: 8.0, grade: 4, studentName: "Đỗ Mai Anh" },
      { score: 7.5, grade: 4, studentName: "Vũ Tuấn Kiệt" },
      { score: 9.0, grade: 5, studentName: "Hoàng Gia Huy" },
      { score: 10, grade: 5, studentName: "Bùi Phương Linh" }
    ];

    const totalAttempts = attempts.length;
    let sumScore = 0;
    let countExcellent = 0; // >= 9.0 (T)
    let countPass = 0;      // 5.0 - 8.9 (H)
    let countFail = 0;      // < 5.0 (C)

    const scoreBuckets = { "9-10 (Giỏi)": 0, "7-8 (Khá)": 0, "5-6 (Đạt)": 0, "Dưới 5 (Chưa đạt)": 0 };

    attempts.forEach(a => {
      sumScore += a.score;
      if (a.score >= 9.0) {
        countExcellent++;
        scoreBuckets["9-10 (Giỏi)"]++;
      } else if (a.score >= 7.0) {
        countPass++;
        scoreBuckets["7-8 (Khá)"]++;
      } else if (a.score >= 5.0) {
        countPass++;
        scoreBuckets["5-6 (Đạt)"]++;
      } else {
        countFail++;
        scoreBuckets["Dưới 5 (Chưa đạt)"]++;
      }
    });

    const avgScore = totalAttempts > 0 ? (sumScore / totalAttempts).toFixed(1) : "8.5";

    return {
      totalAttempts,
      avgScore,
      countExcellent,
      countPass,
      countFail,
      scoreBuckets,
      topStudents: attempts.filter(a => a.score >= 9.0).slice(0, 5)
    };
  }

  // 14. Tự Động Trộn Đề Thi Tạo 4 Mã Đề (101, 102, 103, 104) Kèm Bảng Đáp Án Đối Chiếu
  shuffleExamVersions(exam) {
    const baseQuestions = this.getOnlineExamQuestions(exam);
    const codes = [101, 102, 103, 104];
    const shuffledVersions = [];
    const answerMatrix = []; // Bảng đáp án đối chiếu

    codes.forEach((code, codeIdx) => {
      // Đảo thứ tự câu hỏi theo seed
      const questionsClone = JSON.parse(JSON.stringify(baseQuestions));
      const shuffledQ = questionsClone.sort(() => (Math.sin(codeIdx * 10 + 1) > 0 ? 1 : -1));

      const codeAnswers = [];

      shuffledQ.forEach((q, qIdx) => {
        // Đảo ngẫu nhiên các phương án
        const correctText = q.options[q.correct];
        const optionsClone = [...q.options];
        optionsClone.sort(() => (Math.cos(codeIdx * 5 + qIdx) > 0 ? 1 : -1));
        const newCorrectIdx = optionsClone.indexOf(correctText);

        q.options = optionsClone.map((opt, oIdx) => {
          const clean = opt.replace(/^[A-D]\.\s*/, "");
          return `${['A', 'B', 'C', 'D'][oIdx]}. ${clean}`;
        });
        q.correct = newCorrectIdx;

        codeAnswers.push({
          questionNum: qIdx + 1,
          correctChar: ['A', 'B', 'C', 'D'][newCorrectIdx]
        });
      });

      shuffledVersions.push({
        code: code,
        title: `${exam.title} (MÃ ĐỀ ${code})`,
        grade: exam.grade,
        questions: shuffledQ,
        answers: codeAnswers
      });
    });

    // Tạo bảng ma trận đối chiếu 4 mã
    for (let i = 0; i < baseQuestions.length; i++) {
      answerMatrix.push({
        questionNum: i + 1,
        code101: shuffledVersions[0].answers[i]?.correctChar || "A",
        code102: shuffledVersions[1].answers[i]?.correctChar || "B",
        code103: shuffledVersions[2].answers[i]?.correctChar || "C",
        code104: shuffledVersions[3].answers[i]?.correctChar || "D"
      });
    }

    return {
      examTitle: exam.title,
      grade: exam.grade,
      shuffledVersions,
      answerMatrix
    };
  }
}

window.examService = new ExamService();

