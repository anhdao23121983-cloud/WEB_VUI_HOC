/**
 * LECTURE SERVICE (DỊCH VỤ QUẢN LÝ BÀI GIẢNG ĐIỆN TỬ & FILE POWERPOINT)
 * Quản lý tải lên, lưu trữ, lọc SGK (KNTT/CD/CTST), Học Kỳ 1 & 2, AI tóm tắt và Trình chiếu video hoạt họa
 */

class LectureService {
  constructor() {
    this.lectures = [];
  }

  // 1. Lấy danh sách bài giảng điện tử (hỗ trợ lọc khối lớp, bộ sách, học kỳ và tìm kiếm)
  async getAllLectures(gradeFilter = "all", searchQuery = "", bookFilter = "all", semesterFilter = "all") {
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
            semester: item.semester || (item.topic_name && item.topic_name.includes("Chủ đề D") || item.topic_name && item.topic_name.includes("Chủ đề E") || item.topic_name && item.topic_name.includes("Chủ đề F") ? "sem2" : "sem1"),
            lessonId: item.lesson_id,
            authorName: item.author_name || "Cô Giáo Anh Đào",
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
      list = (db.lectures || []).map(item => ({
        ...item,
        semester: item.semester || (item.topicName && (item.topicName.includes("Chủ đề D") || item.topicName.includes("Chủ đề E") || item.topicName.includes("Chủ đề F")) ? "sem2" : "sem1")
      }));

      if (gradeFilter !== "all") {
        list = list.filter(l => l.grade === parseInt(gradeFilter));
      }
    }

    // Lọc theo bộ sách (KNTT, CD, CTST)
    if (bookFilter !== "all") {
      list = list.filter(l => (l.bookSeries || "KNTT") === bookFilter);
    }

    // Lọc theo Học kỳ (Học kỳ 1 vs Học kỳ 2)
    if (semesterFilter !== "all") {
      list = list.filter(l => (l.semester || "sem1") === semesterFilter);
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

  // 2. Lấy chi tiết 1 bài giảng theo ID
  async getLectureById(id) {
    const all = await this.getAllLectures();
    return all.find(l => l.id === id) || null;
  }

  // 3. Lấy danh sách ID bài giảng yêu thích
  getFavoriteIds() {
    const user = window.authService?.getUser();
    const key = user ? `app_fav_lectures_${user.username}` : "app_fav_lectures_guest";
    try {
      return JSON.parse(localStorage.getItem(key)) || ["lec_01"];
    } catch (e) {
      return ["lec_01"];
    }
  }

  // 4. Kiểm tra 1 bài giảng có được yêu thích hay không
  isFavorite(id) {
    const favs = this.getFavoriteIds();
    return favs.includes(id);
  }

  // 5. Bật/Tắt yêu thích bài giảng (Toggle Favorite)
  toggleFavorite(id) {
    const user = window.authService?.getUser();
    const key = user ? `app_fav_lectures_${user.username}` : "app_fav_lectures_guest";
    let favs = this.getFavoriteIds();

    if (favs.includes(id)) {
      favs = favs.filter(fId => fId !== id);
    } else {
      favs.push(id);
    }

    localStorage.setItem(key, JSON.stringify(favs));
    return favs.includes(id);
  }

  // 6. Tăng lượt xem / tải
  async incrementViewCount(id) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.lectures) {
      const item = db.lectures.find(l => l.id === id);
      if (item) {
        item.viewCount = (item.viewCount || 0) + 1;
        localStorage.setItem("app_mock_db", JSON.stringify(db));
      }
    }
  }

  async incrementDownloadCount(id) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.lectures) {
      const item = db.lectures.find(l => l.id === id);
      if (item) {
        item.downloadCount = (item.downloadCount || 0) + 1;
        localStorage.setItem("app_mock_db", JSON.stringify(db));
      }
    }
  }

  // 7. Tải lên và lưu bài giảng mới (Đồng bộ FE -> BE -> Supabase Cloud)
  async uploadLecture(lectureData) {
    const user = window.authService?.getUser() || { username: "anhdao", name: "Cô Giáo Anh Đào", school: "Trường Tiểu Học Vui Học" };
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
      semester: lectureData.semester || "sem1",
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

  // 8. Cập nhật / Chỉnh sửa bài giảng (Đồng bộ Supabase)
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

  // 9. Xóa bài giảng điện tử (Xóa cả LocalStorage và Supabase Cloud)
  async deleteLecture(id) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.lectures) {
      db.lectures = db.lectures.filter(l => l.id !== id);
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        await client.from("lecture_slides").delete().eq("id", id);
      } catch (err) {
        console.warn("Lỗi kết nối xóa bài giảng Supabase:", err);
      }
    }

    return { success: true };
  }

  // 10. Tự động sinh phân cảnh Video hoạt họa AI từ Slide (Auto AI Video Generator)
  generateSlideFrames(lecture) {
    const title = lecture.title || "Bài Giảng Tin Học Tiểu Học";
    const grade = lecture.grade || 3;
    const author = lecture.authorName || "Cô Giáo Anh Đào";

    return [
      {
        slideNum: 1,
        title: "🌸 KHỞI ĐỘNG & GIỚI THIỆU BÀI HỌC",
        subtitle: title,
        icon: "🚀",
        bgGradient: "bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950",
        bulletPoints: [
          `Chào mừng các em học sinh lớp ${grade} đến với giờ học Tin học kỳ thú!`,
          `Môn học: Tin Học GDPT 2018 • Bộ sách ${lecture.bookSeries || 'Kết Nối Tri Thức'}`,
          `Giáo viên hướng dẫn: ${author}`,
          "Hãy cùng chuẩn bị năng lượng để tích lũy thật nhiều Sao Vàng nhé!"
        ],
        narrative: `Chào mừng các em học sinh thân yêu đến với tiết học Tin học lớp ${grade}, bài học: ${title}. Thầy chúc các em sẽ có một giờ học thật vui vẻ và tiếp thu được nhiều kiến thức bổ ích!`
      },
      {
        slideNum: 2,
        title: "💡 KHÁM PHÁ KIẾN THỨC MỚI",
        subtitle: `Chủ đề trọng tâm: ${lecture.topicName || 'Kiến thức và Kỹ năng số'}`,
        icon: "🧠",
        bgGradient: "bg-gradient-to-br from-cyan-700 via-teal-800 to-slate-950",
        bulletPoints: [
          "Quan sát các thành phần và cấu trúc trực quan của bài học.",
          "Nắm vững các thuật ngữ cốt lõi và nguyên lý hoạt động.",
          "Phân biệt các trường hợp đúng - sai khi sử dụng thiết bị công nghệ.",
          "Ghi nhớ các quy tắc thao tác an toàn theo hướng dẫn của Thầy Cô."
        ],
        narrative: `Trong phần khám phá kiến thức hôm nay, chúng ta cùng tìm hiểu những khái niệm quan trọng nhất. Các em hãy chú ý quan sát màn hình và lắng nghe thật kỹ nhé!`
      },
      {
        slideNum: 3,
        title: "🎮 THỰC HÀNH & LUYỆN TẬP TƯƠNG TÁC",
        subtitle: "Học Đi Đôi Với Hành - Vui Cùng Thử Thách",
        icon: "⭐",
        bgGradient: "bg-gradient-to-br from-amber-600 via-orange-700 to-slate-950",
        bulletPoints: [
          "Thao tác trực tiếp trên giao diện thực nghiệm của Web Vui Học.",
          "Trả lời các câu hỏi đố vui nhanh để giành điểm 10 rực rỡ.",
          "Tương tác nhóm cùng bạn bè để giải quyết nhiệm vụ bài học.",
          "Tự tin kiểm tra kết quả và ghi danh vào Bảng Vàng Vinh Danh!"
        ],
        narrative: `Bây giờ là lúc chúng mình cùng nhau bước vào phần luyện tập thực hành! Các em hãy thao tác cẩn thận, làm bài trắc nghiệm và thử thách cùng bạn bè nhé!`
      },
      {
        slideNum: 4,
        title: "🏆 VẬN DỤNG & TỔNG KẾT BÀI DẠY",
        subtitle: "Liên Hệ Thực Tiễn & Ghi Nhớ Bài Học",
        icon: "🎉",
        bgGradient: "bg-gradient-to-br from-emerald-700 via-green-800 to-slate-950",
        bulletPoints: [
          "Tóm tắt 3 điều bổ ích em đã học và thực hành thành thạo hôm nay.",
          "Ứng dụng công nghệ đúng cách, an toàn và bổ ích tại gia đình.",
          "Luôn giữ gìn tư thế ngồi học chuẩn và bảo vệ mắt khi dùng máy tính.",
          "Hẹn gặp lại các em ở bài học tiếp theo trên Web Vui Học!"
        ],
        narrative: `Chúc mừng tất cả các em đã hoàn thành xuất sắc bài học ${title}! Thầy hy vọng các em sẽ luôn say mê khám phá công nghệ và áp dụng vào học tập hàng ngày nhé!`
      }
    ];
  }

  // 12. Tổng hợp số liệu thống kê lượt xem, lượt tải & Bảng vàng yêu thích
  async getAnalyticsSummary() {
    const all = await this.getAllLectures();
    const totalLectures = all.length;
    let totalViews = 0;
    let totalDownloads = 0;

    const gradeStats = { 3: { count: 0, views: 0, downloads: 0 }, 4: { count: 0, views: 0, downloads: 0 }, 5: { count: 0, views: 0, downloads: 0 } };
    const seriesStats = { "KNTT": 0, "CD": 0, "CTST": 0 };
    const favoriteIds = this.getFavoriteIds();

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

    const topLectures = [...all].sort((a, b) => {
      const scoreA = (a.viewCount || 0) * 2 + (a.downloadCount || 0) * 3 + (favoriteIds.includes(a.id) ? 20 : 0);
      const scoreB = (b.viewCount || 0) * 2 + (b.downloadCount || 0) * 3 + (favoriteIds.includes(b.id) ? 20 : 0);
      return scoreB - scoreA;
    }).slice(0, 5);

    return {
      totalLectures,
      totalViews,
      totalDownloads,
      totalFavorites: favoriteIds.length,
      gradeStats,
      seriesStats,
      topLectures
    };
  }

  // 13. Tạo các trang sách 3D cho E-Book Flipbook Viewer
  generateFlipbookPages(lecture) {
    const title = lecture.title || "Bài Giảng Tin Học Tiểu Học";
    const grade = lecture.grade || 3;
    const author = lecture.authorName || "Cô Giáo Anh Đào";

    return [
      {
        pageNum: 1,
        title: "BÌA SÁCH BÀI HỌC",
        badge: `TIN HỌC LỚP ${grade}`,
        icon: "📘",
        content: `
          <div class="text-center space-y-4 my-auto p-4 bg-gradient-to-b from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
            <span class="text-6xl block animate-bounce">💻</span>
            <h2 class="text-xl font-black text-blue-950 uppercase leading-snug">${title}</h2>
            <div class="inline-block px-3 py-1 bg-blue-600 text-white font-black text-xs rounded-full">
              BỘ SÁCH ${lecture.bookSeries || 'KNTT'} • CHUẨN GDPT 2018
            </div>
            <p class="text-xs text-slate-600 font-semibold pt-2">Giáo viên biên soạn: <b>${author}</b></p>
          </div>
        `
      },
      {
        pageNum: 2,
        title: "MỤC TIÊU & YÊU CẦU CẦN ĐẠT",
        badge: "CHUẨN CV 2345",
        icon: "🎯",
        content: `
          <div class="space-y-3 text-xs leading-relaxed">
            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <h4 class="font-black text-emerald-900 mb-1">1. Kiến thức cốt lõi:</h4>
              <p class="text-slate-700">Học sinh nhận biết đúng các thiết bị/khái niệm trong bài học ${title}. Nắm vững các bước thực hành an toàn.</p>
            </div>
            <div class="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <h4 class="font-black text-purple-900 mb-1">2. Năng lực tin học (NLa, NLc):</h4>
              <p class="text-slate-700">Thao tác thành thạo trên thiết bị và phần mềm học tập, tự giác rèn luyện kỹ năng số.</p>
            </div>
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <h4 class="font-black text-amber-900 mb-1">3. Phẩm chất:</h4>
              <p class="text-slate-700">Chăm chỉ, trách nhiệm trong việc bảo vệ trang thiết bị phòng máy tính trường học.</p>
            </div>
          </div>
        `
      },
      {
        pageNum: 3,
        title: "KHÁM PHÁ KIẾN THỨC",
        badge: "HÌNH THÀNH KIẾN THỨC",
        icon: "💡",
        content: `
          <div class="space-y-2.5 text-xs text-slate-700">
            <p class="font-bold text-slate-900">Em hãy quan sát hình ảnh và trả lời các câu hỏi:</p>
            <div class="p-4 bg-cyan-50 rounded-2xl border border-cyan-200 text-center space-y-2">
              <span class="text-5xl block">🖥️ 🖱️ ⌨️</span>
              <p class="font-black text-cyan-900 text-xs">Các thiết bị công nghệ quen thuộc trong học tập</p>
            </div>
            <ul class="list-disc list-inside space-y-1.5 pt-1">
              <li>Mỗi bộ phận của máy tính đều đảm nhận một nhiệm vụ riêng biệt.</li>
              <li>Thông tin được đưa vào, xử lý và hiển thị qua các thiết bị đầu ra.</li>
            </ul>
          </div>
        `
      },
      {
        pageNum: 4,
        title: "LUYỆN TẬP & THỰC HÀNH",
        badge: "HOẠT ĐỘNG THỰC TẾ",
        icon: "⚡",
        content: `
          <div class="space-y-3 text-xs">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p class="font-bold text-slate-900">Nhiệm vụ 1: Nhận diện nhanh</p>
              <p class="text-slate-600">Em hãy chỉ ra đâu là phím bấm cơ sở có gờ nổi trên bàn phím máy tính?</p>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p class="font-bold text-slate-900">Nhiệm vụ 2: Thao tác chuột</p>
              <p class="text-slate-600">Thực hiện nhấp đúp chuột để mở một thư mục bài tập trên màn hình nền.</p>
            </div>
            <div class="p-2.5 bg-amber-100 rounded-xl text-amber-900 font-bold text-center">
              ⭐ Tích lũy +20 Sao Vàng khi hoàn thành bài tập!
            </div>
          </div>
        `
      },
      {
        pageNum: 5,
        title: "VẬN DỤNG THỰC TIỄN",
        badge: "LIÊN HỆ ĐỜI SỐNG",
        icon: "🌱",
        content: `
          <div class="space-y-2.5 text-xs text-slate-700 leading-relaxed">
            <p class="font-bold text-slate-900">Ứng dụng kiến thức vào sinh hoạt gia đình:</p>
            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <p class="font-bold text-emerald-900">1. Sắp xếp đồ dùng học tập:</p>
              <p>Phân loại sách vở, đồ chơi theo từng ngăn kéo giống như cách lưu trữ tệp tin trong thư mục.</p>
            </div>
            <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
              <p class="font-bold text-blue-900">2. An toàn số:</p>
              <p>Hỏi ý kiến cha mẹ trước khi truy cập các trang web mới trên Internet.</p>
            </div>
          </div>
        `
      },
      {
        pageNum: 6,
        title: "GHI NHỚ & DẶN DÒ",
        badge: "TỔNG KẾT TIẾT HỌC",
        icon: "🏆",
        content: `
          <div class="space-y-3 text-xs">
            <div class="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 space-y-2">
              <span class="text-3xl block text-center">🎉</span>
              <h4 class="font-black text-amber-950 text-center uppercase">Em Cần Ghi Nhớ:</h4>
              <ul class="list-disc list-inside space-y-1 text-slate-800 font-semibold">
                <li>Sử dụng thiết bị đúng quy tắc an toàn.</li>
                <li>Thực hiện tư thế ngồi học thẳng lưng để bảo vệ cột sống và mắt.</li>
                <li>Ôn tập lại bài học và làm bài tập trên Web Vui Học.</li>
              </ul>
            </div>
            <p class="text-center text-slate-500 italic text-[11px] pt-1">Hẹn gặp lại các em ở bài học tiếp theo!</p>
          </div>
        `
      }
    ];
  }
}

window.lectureService = new LectureService();

