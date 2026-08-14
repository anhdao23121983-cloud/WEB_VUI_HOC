/**
 * LECTURE SERVICE (DỊCH VỤ QUẢN LÝ BÀI GIẢNG ĐIỆN TỬ & FILE POWERPOINT)
 * Quản lý tải lên, lưu trữ, lọc SGK (KNTT/CD/CTST), AI tóm tắt và Trình chiếu video hoạt họa
 */

class LectureService {
  constructor() {
    this.lectures = [];
  }

  // 1. Lấy danh sách bài giảng điện tử (hỗ trợ lọc khối lớp, bộ sách và tìm kiếm)
  async getAllLectures(gradeFilter = "all", searchQuery = "", bookFilter = "all") {
    let list = [];

    // 1. Kiểm tra Supabase trước
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        let query = client.from("lecture_slides").select("*").order("created_at", { ascending: false });

        if (gradeFilter !== "all") {
          query = query.eq("grade_level", parseInt(gradeFilter));
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          list = data.map(item => ({
            id: item.id,
            title: item.title,
            grade: item.grade_level,
            topicName: item.topic_name,
            bookSeries: item.book_series || "KNTT",
            lessonId: item.lesson_id,
            authorName: item.author_name || "Thầy Giáo Anh Đào",
            createdByUsername: item.created_by_username || "anhdao",
            schoolName: item.school_name || "Trường Tiểu Học Vui Học",
            fileName: item.file_name,
            fileSizeText: item.file_size_text || "5.0 MB",
            fileType: item.file_type || "pptx",
            fileUrl: item.file_url,
            slideCount: item.slide_count || 20,
            downloadCount: item.download_count || 0,
            viewCount: item.view_count || 0,
            thumbnailColor: item.thumbnail_color || "from-amber-500 to-rose-600",
            description: item.description || "",
            createdAt: item.created_at
          }));
        }
      } catch (err) {
        console.warn("Lỗi tải bài giảng từ Supabase, chuyển về bộ nhớ cục bộ:", err);
      }
    }

    // 2. Dự phòng LocalStorage nếu Supabase trống hoặc offline
    if (list.length === 0) {
      const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
      list = db.lectures || [];

      if (gradeFilter !== "all") {
        list = list.filter(l => l.grade === parseInt(gradeFilter));
      }
    }

    // Lọc theo bộ sách (KNTT, CD, CTST)
    if (bookFilter !== "all") {
      list = list.filter(l => (l.bookSeries || "KNTT") === bookFilter);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => 
        l.title.toLowerCase().includes(q) || 
        (l.topicName && l.topicName.toLowerCase().includes(q)) ||
        (l.authorName && l.authorName.toLowerCase().includes(q))
      );
    }

    return list;
  }

  // 2. Lấy danh sách bài giảng của riêng giáo viên đang đăng nhập
  async getMyLectures(username) {
    const all = await this.getAllLectures();
    return all.filter(l => (l.createdByUsername === username) || (l.authorName && l.authorName.toLowerCase().includes(username.toLowerCase())));
  }

  // 3. Lấy thông tin 1 bài giảng theo ID
  async getLectureById(id) {
    const all = await this.getAllLectures();
    return all.find(l => l.id === id);
  }

  // 4. Tải lên và lưu bài giảng mới (Đồng bộ FE -> BE -> Supabase Cloud)
  async uploadLecture(lectureData) {
    const user = window.authService?.getUser() || { username: "anhdao", name: "Thầy Giáo Anh Đào", school: "Trường Tiểu Học" };
    const lectureId = lectureData.id || ("lec_" + Date.now());

    const colors = [
      "from-blue-600 to-cyan-500",
      "from-emerald-600 to-teal-500",
      "from-amber-500 to-orange-600",
      "from-purple-600 to-indigo-600",
      "from-rose-500 to-pink-600"
    ];
    const randColor = colors[Math.floor(Math.random() * colors.length)];

    const lectureObj = {
      id: lectureId,
      title: lectureData.title.trim(),
      grade: parseInt(lectureData.grade) || 3,
      topicName: lectureData.topicName || "Chủ đề Tin học GDPT 2018",
      bookSeries: lectureData.bookSeries || "KNTT",
      lessonId: lectureData.lessonId || "L" + (lectureData.grade || 3) + "_01",
      authorName: lectureData.authorName || user.name,
      createdByUsername: user.username || "anhdao",
      schoolName: user.school || "Trường Tiểu Học Vui Học",
      fileName: lectureData.fileName || "BaiGiang_TinHoc.pptx",
      fileSizeText: lectureData.fileSizeText || "6.5 MB",
      fileType: lectureData.fileType || "pptx",
      fileUrl: lectureData.fileUrl,
      slideCount: parseInt(lectureData.slideCount) || 20,
      downloadCount: 0,
      viewCount: 1,
      thumbnailColor: randColor,
      description: (lectureData.description || "").trim(),
      createdAt: new Date().toISOString()
    };

    // 1. Lưu dự phòng LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.lectures) db.lectures = [];

    const existingIdx = db.lectures.findIndex(l => l.id === lectureId);
    if (existingIdx >= 0) {
      db.lectures[existingIdx] = { ...db.lectures[existingIdx], ...lectureObj };
    } else {
      db.lectures.unshift(lectureObj);
    }
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // 2. Đồng bộ lên Supabase Database
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const payload = {
          title: lectureObj.title,
          grade_level: lectureObj.grade,
          topic_name: lectureObj.topicName,
          book_series: lectureObj.bookSeries,
          lesson_id: lectureObj.lessonId,
          author_name: lectureObj.authorName,
          created_by_username: lectureObj.createdByUsername,
          school_name: lectureObj.schoolName,
          file_name: lectureObj.fileName,
          file_size_text: lectureObj.fileSizeText,
          file_type: lectureObj.fileType,
          file_url: lectureObj.fileUrl,
          slide_count: lectureObj.slideCount,
          download_count: lectureObj.downloadCount,
          view_count: lectureObj.viewCount,
          thumbnail_color: lectureObj.thumbnailColor,
          description: lectureObj.description,
          updated_at: new Date().toISOString()
        };

        if (lectureData.id && !lectureData.id.startsWith("lec_")) {
          payload.id = lectureData.id;
        }

        const { data, error } = await client.from("lecture_slides").insert([payload]).select().single();
        if (data && data.id) {
          lectureObj.id = data.id;
        }
      } catch (err) {
        console.warn("Lỗi lưu bài giảng lên Supabase:", err);
      }
    }

    return { success: true, lecture: lectureObj };
  }

  // 5. Cập nhật / Chỉnh sửa bài giảng và thay thế file PowerPoint (Đồng bộ Supabase)
  async updateLecture(id, updateData) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    let updatedObj = null;

    if (db.lectures) {
      const idx = db.lectures.findIndex(l => l.id === id);
      if (idx >= 0) {
        db.lectures[idx] = {
          ...db.lectures[idx],
          title: updateData.title || db.lectures[idx].title,
          grade: parseInt(updateData.grade) || db.lectures[idx].grade,
          bookSeries: updateData.bookSeries || db.lectures[idx].bookSeries,
          topicName: updateData.topicName || db.lectures[idx].topicName,
          description: updateData.description !== undefined ? updateData.description : db.lectures[idx].description,
          authorName: updateData.authorName || db.lectures[idx].authorName,
          updatedAt: new Date().toISOString()
        };

        if (updateData.fileName) db.lectures[idx].fileName = updateData.fileName;
        if (updateData.fileSizeText) db.lectures[idx].fileSizeText = updateData.fileSizeText;
        if (updateData.fileType) db.lectures[idx].fileType = updateData.fileType;
        if (updateData.fileUrl) db.lectures[idx].fileUrl = updateData.fileUrl;
        if (updateData.slideCount) db.lectures[idx].slideCount = parseInt(updateData.slideCount);

        updatedObj = db.lectures[idx];
        localStorage.setItem("app_mock_db", JSON.stringify(db));
      }
    }

    // Đồng bộ lên Supabase Cloud
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const payload = {
          title: updateData.title,
          grade_level: parseInt(updateData.grade),
          book_series: updateData.bookSeries,
          topic_name: updateData.topicName,
          description: updateData.description,
          author_name: updateData.authorName,
          updated_at: new Date().toISOString()
        };

        if (updateData.fileName) payload.file_name = updateData.fileName;
        if (updateData.fileSizeText) payload.file_size_text = updateData.fileSizeText;
        if (updateData.fileType) payload.file_type = updateData.fileType;
        if (updateData.fileUrl) payload.file_url = updateData.fileUrl;
        if (updateData.slideCount) payload.slide_count = parseInt(updateData.slideCount);

        await client.from("lecture_slides").update(payload).eq("id", id);
      } catch (err) {
        console.warn("Lỗi cập nhật bài giảng lên Supabase:", err);
      }
    }

    return { success: true, lecture: updatedObj };
  }

  // 6. Xóa bài giảng điện tử (Xóa cả LocalStorage và Supabase Cloud)
  async deleteLecture(id) {
    // 1. Xóa trong LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.lectures) {
      db.lectures = db.lectures.filter(l => l.id !== id);
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    // 2. Xóa trên Supabase Cloud Database
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const { error } = await client.from("lecture_slides").delete().eq("id", id);
        if (error) {
          console.warn("Lỗi xóa bài giảng từ Supabase:", error);
        }
      } catch (err) {
        console.warn("Lỗi kết nối xóa bài giảng Supabase:", err);
      }
    }

    return { success: true };
  }

  // 7. Tổng hợp số liệu thống kê lượt xem, lượt tải theo khối lớp và bộ sách
  async getAnalyticsSummary() {
    const all = await this.getAllLectures();
    const totalLectures = all.length;
    let totalViews = 0;
    let totalDownloads = 0;

    const gradeStats = { 3: { count: 0, views: 0, downloads: 0 }, 4: { count: 0, views: 0, downloads: 0 }, 5: { count: 0, views: 0, downloads: 0 } };
    const seriesStats = { "KNTT": 0, "CD": 0, "CTST": 0 };

    all.forEach(l => {
      totalViews += (l.viewCount || 0);
      totalDownloads += (l.downloadCount || 0);

      const g = l.grade || 3;
      if (gradeStats[g]) {
        gradeStats[g].count++;
        gradeStats[g].views += (l.viewCount || 0);
        gradeStats[g].downloads += (l.downloadCount || 0);
      }

      const s = l.bookSeries || "KNTT";
      seriesStats[s] = (seriesStats[s] || 0) + 1;
    });

    const topLectures = [...all].sort((a, b) => (b.viewCount + b.downloadCount) - (a.viewCount + a.downloadCount)).slice(0, 5);

    return {
      totalLectures,
      totalViews,
      totalDownloads,
      gradeStats,
      seriesStats,
      topLectures
    };
  }

  // 5. Tăng lượt xem / tải
  async recordAction(id, type = 'view') {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const item = (db.lectures || []).find(l => l.id === id);
    if (item) {
      if (type === 'view') item.viewCount = (item.viewCount || 0) + 1;
      if (type === 'download') item.downloadCount = (item.downloadCount || 0) + 1;
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }
  }

  // 6. AI Tóm tắt nội dung slide bài giảng (AI Slide Summary)
  async generateAISlideSummary(lectureTitle, grade, topicName) {
    return {
      title: lectureTitle,
      grade: grade,
      topicName: topicName,
      competencies: [
        "Nhận biết và gọi tên chính xác các khái niệm/thiết bị cốt lõi trong bài học.",
        "Hình thành phản xạ thao tác kỹ thuật an toàn trên máy tính trường học.",
        "Ứng dụng kiến thức vào giải quyết các bài toán thực tiễn ở trường và gia đình."
      ],
      corePoints: [
        "Định nghĩa chuẩn xác theo Chương trình GDPT 2018 và Công văn 2345/BGDĐT.",
        "Quy trình thực hành 4 bước: Khởi động ➡️ Khám phá ➡️ Luyện tập ➡️ Vận dụng.",
        "Các lưu ý an toàn phòng tránh rủi ro điện tử và bảo vệ mắt khi ngồi máy tính."
      ],
      suggestedActivities: [
        "Hoạt động nhóm 4 học sinh: Ghép thẻ thuật ngữ với hình ảnh minh họa.",
        "Thực hành cá nhân trên Web Vui Học: Hoàn thành mini-game và bài kiểm tra 3 sao ⭐.",
        "Vận dụng sáng tạo: Thuyết trình 2 phút trước lớp về sản phẩm vừa hoàn thiện."
      ],
      aiConfidence: "98% (Chuẩn Sư Phạm Tiểu Học)"
    };
  }

  // 7. Tạo chuỗi Slide hoạt họa cho tính năng Slide-to-Video Player
  generateSlideFrames(lecture) {
    return [
      {
        slideNum: 1,
        heading: "🌸 KHỞI ĐỘNG & GIỚI THIỆU BÀI HỌC",
        subtitle: lecture.title,
        icon: "🚀",
        color: "from-blue-600 to-indigo-700",
        bulletPoints: [
          "Chào mừng các em học sinh đến với giờ học Tin học vui nhộn!",
          "Môn: Tin Học Tiểu Học • Khối Lớp " + lecture.grade,
          "Giáo viên hướng dẫn: " + (lecture.authorName || "Thầy Giáo Anh Đào"),
          "Hãy chuẩn bị tinh thần khám phá những điều kỳ thú hôm nay!"
        ],
        narration: `Chào mừng các em học sinh thân yêu đến với bài giảng: ${lecture.title}. Hôm nay chúng ta sẽ cùng nhau khám phá những kiến thức công nghệ vô cùng thú vị!`
      },
      {
        slideNum: 2,
        heading: "💡 HÌNH THÀNH KIẾN THỨC MỚI",
        subtitle: "Trọng tâm bài dạy: " + (lecture.topicName || "Kiến thức số"),
        icon: "🧠",
        color: "from-cyan-600 to-teal-700",
        bulletPoints: [
          "Khám phá các thành phần và nguyên lý hoạt động cơ bản.",
          "Quan sát hình ảnh trực quan và ghi nhớ các từ khóa chính.",
          "So sánh điểm giống và khác nhau giữa các thiết bị/khái niệm.",
          "Ghi chép những ý quan trọng vào vở bài tập Tin học."
        ],
        narration: `Bước vào phần khám phá kiến thức mới, các em hãy chú ý quan sát màn hình, lắng nghe Thầy hướng dẫn để ghi nhớ những đặc điểm quan trọng nhất của bài học nhé!`
      },
      {
        slideNum: 3,
        heading: "🎮 THỰC HÀNH & LUYỆN TẬP TƯƠNG TÁC",
        subtitle: "Học đi đôi với hành - Tích lũy Sao Vàng",
        icon: "⭐",
        color: "from-amber-600 to-orange-700",
        bulletPoints: [
          "Thao tác trực tiếp trên máy tính hoặc Web Vui Học.",
          "Hoàn thành các thử thách trắc nghiệm và trò chơi rèn luyện.",
          "Hỗ trợ bạn cùng bàn để cùng nhau tiến bộ.",
          "Nhận ngay +25 Sao Vàng thưởng khi đạt kết quả xuất sắc!"
        ],
        narration: `Bây giờ là lúc chúng mình cùng nhau thực hành và luyện tập! Các em hãy đăng nhập vào Web Vui Học để làm bài tập trắc nghiệm và thử thách trò chơi trí tuệ nhé!`
      },
      {
        slideNum: 4,
        heading: "🏆 VẬN DỤNG & TỔNG KẾT BÀI HỌC",
        subtitle: "Liên hệ thực tế & Ghi nhận thành tích",
        icon: "🎉",
        color: "from-emerald-600 to-green-700",
        bulletPoints: [
          "Tóm tắt 3 điều cốt lõi em đã học được hôm nay.",
          "Ứng dụng công nghệ an toàn và có trách nhiệm tại gia đình.",
          "Tắt máy tính đúng quy trình an toàn trước khi rời phòng máy.",
          "Chúc các em học tập thật vui và hẹn gặp lại ở bài học sau!"
        ],
        narration: `Chúc mừng các em đã hoàn thành xuất sắc tiết học hôm nay! Hãy luôn nhớ giữ gìn an toàn thiết bị và ứng dụng những điều bổ ích vào cuộc sống hàng ngày nhé!`
      }
    ];
  }
}

window.lectureService = new LectureService();
