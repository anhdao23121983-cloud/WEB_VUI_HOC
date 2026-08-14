/**
 * LECTURE SERVICE (DỊCH VỤ QUẢN LÝ BÀI GIẢNG ĐIỆN TỬ & FILE POWERPOINT)
 * Quản lý tải lên, lưu trữ, trình chiếu và đồng bộ Supabase Cloud
 */

class LectureService {
  constructor() {
    this.lectures = [];
  }

  // 1. Lấy danh sách toàn bộ bài giảng điện tử
  async getAllLectures(gradeFilter = "all", searchQuery = "") {
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
          let list = data.map(item => ({
            id: item.id,
            title: item.title,
            grade: item.grade_level,
            topicName: item.topic_name,
            lessonId: item.lesson_id,
            authorName: item.author_name || "Thầy Giáo Anh Đào",
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

          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(l => l.title.toLowerCase().includes(q) || l.topicName.toLowerCase().includes(q));
          }
          return list;
        }
      } catch (err) {
        console.warn("Lỗi tải bài giảng từ Supabase, chuyển về bộ nhớ cục bộ:", err);
      }
    }

    // 2. Dự phòng LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    let list = db.lectures || [];

    if (gradeFilter !== "all") {
      list = list.filter(l => l.grade === parseInt(gradeFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => l.title.toLowerCase().includes(q) || (l.topicName && l.topicName.toLowerCase().includes(q)));
    }

    return list;
  }

  // 2. Lấy thông tin 1 bài giảng theo ID
  async getLectureById(id) {
    const all = await this.getAllLectures();
    return all.find(l => l.id === id);
  }

  // 3. Tải lên và lưu bài giảng mới
  async uploadLecture(lectureData) {
    const user = window.authService?.getUser() || { name: "Thầy Giáo Anh Đào", school: "Trường Tiểu Học" };
    const lectureId = lectureData.id || ("lec_" + Date.now());

    // Chọn màu gradient thumbnail ngẫu nhiên đẹp mắt
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
      lessonId: lectureData.lessonId || "L" + (lectureData.grade || 3) + "_01",
      authorName: lectureData.authorName || user.name,
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
          lesson_id: lectureObj.lessonId,
          author_name: lectureObj.authorName,
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
        if (data) {
          lectureObj.id = data.id;
        }
      } catch (err) {
        console.warn("Lỗi lưu bài giảng lên Supabase:", err);
      }
    }

    return { success: true, lecture: lectureObj };
  }

  // 4. Xóa bài giảng
  async deleteLecture(id) {
    // 1. Xóa LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.lectures) {
      db.lectures = db.lectures.filter(l => l.id !== id);
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    // 2. Xóa Supabase
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        await client.from("lecture_slides").delete().eq("id", id);
      } catch (err) {
        console.warn("Lỗi xóa bài giảng trên Supabase:", err);
      }
    }

    return { success: true };
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

    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        if (type === 'view') {
          await client.rpc("increment_lecture_view", { lecture_id: id });
        }
      } catch (e) {}
    }
  }
}

window.lectureService = new LectureService();
