/**
 * AI PLANNER SERVICE (TRỢ LÝ AI SOẠN GIÁO ÁN CV 2345)
 * Tự động phân tích tên bài học và sinh kế hoạch bài dạy chuẩn mực
 */

class AIPlannerService {
  constructor() {
    this.apiKey = localStorage.getItem("gemini_api_key") || "";
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem("gemini_api_key", this.apiKey);
  }

  // Tạo Kế hoạch bài dạy bằng AI hoặc Trợ lý Sư phạm Thông minh
  async generateLessonPlan({ grade, book, lessonTitle, lessonTopic, duration = "2 tiết" }) {
    // Nếu có API Key Gemini thật -> Gọi Gemini
    if (this.apiKey) {
      try {
        return await this.callGeminiAI({ grade, book, lessonTitle, lessonTopic, duration });
      } catch (err) {
        console.warn("Lỗi gọi Gemini AI, chuyển sang Trợ lý Sư phạm dự phòng:", err);
      }
    }

    // Chế độ Trợ lý Sư phạm Tích hợp (Offline-First Smart Engine)
    return this.generateSmartTemplate({ grade, book, lessonTitle, lessonTopic, duration });
  }

  // Trợ lý Sư phạm Chuẩn hóa Công văn 2345
  generateSmartTemplate({ grade, book, lessonTitle, lessonTopic, duration }) {
    const isLesson7 = lessonTitle.toLowerCase().includes("sắp xếp") || lessonTitle.toLowerCase().includes("bài 7");
    const isLesson8 = lessonTitle.toLowerCase().includes("thư mục") || lessonTitle.toLowerCase().includes("bài 8");

    const teacherEquipment = (isLesson7 || isLesson8)
      ? "Máy tính giáo viên, Tivi/Máy chiếu, Bài giảng điện tử đa phương tiện, Học liệu số 3D tương tác tại Web Vui Học (Phòng Mô Phỏng 3D Ảo: https://webvuihoc.edu.vn/#lab3d & Bản gốc Gemini AI: https://share.gemini.google/NLLCPUG04S6G)."
      : "Máy tính giáo viên, Tivi/Máy chiếu, Bài giảng điện tử trình chiếu đa phương tiện, Phiếu học tập, Trò chơi tương tác trên Web Vui Học.";

    const activities = [
      {
        step: 1,
        name: "1. HOẠT ĐỘNG KHỞI ĐỘNG (5 - 7 phút)",
        objective: `Kích thích hứng thú học tập và kết nối trải nghiệm thực tế với nội dung '${lessonTitle}'.`,
        content: isLesson7 
          ? "GV trình chiếu hình ảnh 2 bàn học: một bàn học bừa bộn và một bàn học ngăn nắp trên Phòng Mô Phỏng 3D. Đặt câu hỏi: 'Bàn học nào giúp em tìm sách vở nhanh hơn?'"
          : isLesson8
          ? "GV chiếu mô hình Kệ Tủ 3 Tầng ngoài đời thực và Cây Thư Mục trong ổ đĩa D: để học sinh phát hiện sự tương đồng."
          : "GV tổ chức trò chơi 'Đố vui khởi động' hoặc chiếu đoạn video ngắn liên quan đến bài học.",
        organization: "GV phổ biến luật chơi và nêu câu hỏi dẫn dắt -> Học sinh sôi nổi tương tác -> GV nhận xét, tuyên dương và giới thiệu vào bài mới."
      },
      {
        step: 2,
        name: "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI (15 - 18 phút)",
        objective: `Học sinh khám phá, nắm vững khái niệm và kỹ năng cốt lõi của '${lessonTitle}'.`,
        content: isLesson7
          ? "Khám phá nguyên tắc phân loại đồ vật: Sách vở (Học tập), Đồ chơi (Giải trí), Thiết bị số (Công nghệ). Học sinh quan sát GV thao tác mẫu trên mô hình Tủ Đồ 3 Tầng ảo."
          : isLesson8
          ? "Tìm hiểu khái niệm Thư mục (Folder) và Tệp tin (File). Quan sát cấu trúc cây thư mục phân cấp trong máy tính."
          : `Khám phá các nội dung chính trong SGK: Đọc thông tin, quan sát tranh ảnh minh họa và thảo luận nhóm.`,
        organization: "GV chia lớp thành các nhóm 4, giao nhiệm vụ tìm hiểu -> Đại diện các nhóm báo cáo kết quả -> GV chốt kiến thức trọng tâm và làm mẫu thao tác (nếu có)."
      },
      {
        step: 3,
        name: "3. HOẠT ĐỘNG LUYỆN TẬP & THỰC HÀNH (10 - 12 phút)",
        objective: "Củng cố kiến thức và rèn luyện kỹ năng thực hành thông qua bài tập và trò chơi tương tác.",
        content: isLesson7
          ? "Học sinh thực hành trực tiếp trên Phòng Mô Phỏng 3D: Kéo thả 10 đồ vật vào đúng 3 ngăn tủ, sau đó tham gia thử thách đo tốc độ tìm kiếm cuốn Sách Tin Học 3."
          : isLesson8
          ? "Học sinh thực hành tạo thư mục mới 'Toan', 'TiengViet', 'TinHoc' trên Màn hình Desktop ảo và kéo thả tệp tin vào đúng thư mục con."
          : "Học sinh làm bài tập trắc nghiệm và tham gia Game thử thách trên nền tảng Web Vui Học.",
        organization: "Học sinh thực hành cá nhân/cặp đôi trên máy tính -> GV theo dõi, hỗ trợ các học sinh còn lúng túng -> Tuyên dương các bạn đạt kết quả xuất sắc."
      },
      {
        step: 4,
        name: "4. HOẠT ĐỘNG VẬN DỤNG & MỞ RỘNG (3 - 5 phút)",
        objective: "Vận dụng kiến thức đã học vào các tình huống thực tế trong gia đình và trường học.",
        content: isLesson7
          ? "GV hướng dẫn học sinh về nhà dọn dẹp, sắp xếp lại góc học tập ngăn nắp giống như bài mô phỏng 3D đã làm trên lớp."
          : isLesson8
          ? "GV hướng dẫn học sinh tạo các thư mục lưu trữ bài tập các môn học trên máy tính cá nhân ở nhà."
          : "Liên hệ thực tế và hướng dẫn học sinh tự khám phá thêm sau giờ học.",
        organization: "GV nêu câu hỏi tình huống thực tế -> Học sinh suy nghĩ trả lời -> GV dặn dò học sinh ôn bài và chuẩn bị cho tiết học tiếp theo."
      }
    ];

    return {
      title: `KẾ HOẠCH BÀI DẠY: ${lessonTitle.toUpperCase()}`,
      grade: parseInt(grade),
      subject: "Tin học",
      book: book || "Kết nối tri thức với cuộc sống",
      duration: duration || "2 tiết",
      objectives: {
        competencies: {
          general: "1. Tự chủ và tự học: Tự giác tìm hiểu bài học, chủ động thực hiện nhiệm vụ cá nhân và trao đổi với bạn.\n2. Giao tiếp và hợp tác: Tích cực thảo luận nhóm, biết lắng nghe và tôn trọng ý kiến các bạn trong nhóm.\n3. Giải quyết vấn đề và sáng tạo: Vận dụng kiến thức bài học để giải quyết các tình huống thực tiễn.",
          specific: `1. Nhận biết và hiểu được kiến thức trọng tâm của bài '${lessonTitle}'.\n2. Nêu được ví dụ minh họa và thao tác thành thạo trên thiết bị máy tính.\n3. Hình thành năng lực ứng dụng công nghệ thông tin trong học tập và đời sống.`
        },
        qualities: "1. Chăm chỉ: Tích cực tham gia các hoạt động học tập, kiên trì luyện tập.\n2. Trách nhiệm: Giữ gìn và bảo quản thiết bị máy tính, tuân thủ nội quy phòng máy."
      },
      equipment: {
        teacher: teacherEquipment,
        student: "Sách giáo khoa Tin học lớp " + grade + ", Vở ghi, Bút viết, Máy tính thực hành tại phòng máy kết nối Internet."
      },
      activities: activities,
      evaluation: "Học sinh nắm vững mục tiêu bài học, thao tác thành thạo trên mô hình 3D và tích cực tham gia các hoạt động nhóm."
    };
  }

  // Gọi API Google Gemini khi có key
  async callGeminiAI({ grade, book, lessonTitle, lessonTopic, duration }) {
    const prompt = `Bạn là một Chuyên gia Sư phạm Tin học Tiểu học hàng đầu Việt Nam.
Hãy soạn KẾ HOẠCH BÀI DẠY (Giáo án) chuẩn 100% theo Công văn 2345/BGDĐT cho:
- Môn học: Tin học Lớp ${grade}
- Bộ sách: ${book}
- Tên bài: ${lessonTitle}
- Thời lượng: ${duration}

Yêu cầu trả về đúng định dạng JSON có cấu trúc sau:
{
  "title": "KẾ HOẠCH BÀI DẠY: ...",
  "grade": ${grade},
  "subject": "Tin học",
  "book": "${book}",
  "duration": "${duration}",
  "objectives": {
    "competencies": {
      "general": "Năng lực chung (Tự chủ, Giao tiếp, Giải quyết vấn đề)...",
      "specific": "Năng lực tin học đặc thù..."
    },
    "qualities": "Phẩm chất chủ yếu (Chăm chỉ, Trách nhiệm, Trung thực)..."
  },
  "equipment": {
    "teacher": "Thiết bị GV...",
    "student": "Thiết bị HS..."
  },
  "activities": [
    {
      "step": 1,
      "name": "1. HOẠT ĐỘNG KHỞI ĐỘNG",
      "objective": "Mục tiêu khởi động...",
      "content": "Nội dung...",
      "organization": "Tổ chức thực hiện (GV - HS)..."
    },
    {
      "step": 2,
      "name": "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI",
      "objective": "Mục tiêu...",
      "content": "Nội dung...",
      "organization": "Tổ chức thực hiện..."
    },
    {
      "step": 3,
      "name": "3. HOẠT ĐỘNG LUYỆN TẬP & THỰC HÀNH",
      "objective": "Mục tiêu...",
      "content": "Nội dung...",
      "organization": "Tổ chức thực hiện..."
    },
    {
      "step": 4,
      "name": "4. HOẠT ĐỘNG VẬN DỤNG",
      "objective": "Mục tiêu...",
      "content": "Nội dung...",
      "organization": "Tổ chức thực hiện..."
    }
  ],
  "evaluation": "Ghi chú và điều chỉnh sau bài dạy..."
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  }
}

window.aiPlannerService = new AIPlannerService();
