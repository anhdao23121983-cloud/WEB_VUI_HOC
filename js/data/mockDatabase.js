/**
 * KHO DỮ LIỆU MẪU (MOCK DATABASE & LOCAL PERSISTENCE)
 * Hỗ trợ chế độ hoạt động mượt mà không cần backend ngay lập tức
 */

const MOCK_DATABASE = {
  // 1. TÀI KHOẢN MẪU & PHÂN QUYỀN (ADMIN, TEACHER, STUDENT)
  users: [
    {
      id: "u_admin_01",
      username: "admin",
      name: "Quản Trị Viên Tối Cao",
      role: "admin",
      school: "Hệ Thống Anh Đào Classroom",
      avatar: "👑",
      stars: 9999,
      isActive: true
    },
    {
      id: "u_teacher_01",
      username: "anhdao",
      name: "Thầy Giáo Anh Đào",
      role: "teacher",
      school: "Trường Tiểu Học Vui Học",
      avatar: "👨‍🏫",
      stars: 999,
      isActive: true
    },
    {
      id: "u_student_01",
      username: "hs3a01",
      name: "Nguyễn Văn An",
      role: "student",
      grade: 3,
      className: "3A",
      stars: 180,
      avatar: "👦",
      isActive: true
    },
    {
      id: "u_student_02",
      username: "hs4b02",
      name: "Lê Thị Mai",
      role: "student",
      grade: 4,
      className: "4B",
      stars: 240,
      avatar: "👧",
      isActive: true
    },
    {
      id: "u_student_03",
      username: "hs5a03",
      name: "Trần Đức Nam",
      role: "student",
      grade: 5,
      className: "5A",
      stars: 310,
      avatar: "🧑‍💻",
      isActive: true
    }
  ],

  // 2. KẾ HOẠCH BÀI DẠY MẪU CHUẨN CÔNG VĂN 2345/BGDĐT
  lessonPlans: [
    {
      id: "plan_01",
      title: "KẾ HOẠCH BÀI DẠY: KHÁM PHÁ MÁY TÍNH (LỚP 3 - BỘ KẾT NỐI TRI THỨC)",
      grade: 3,
      lessonId: "L3_02",
      subject: "Tin học",
      duration: "2 tiết",
      teacherName: "Thầy Giáo Anh Đào",
      schoolName: "Trường Tiểu Học Vui Học",
      createdAt: "2026-08-10",
      objectives: {
        competencies: {
          general: "Tự chủ và tự học trong việc nhận diện thiết bị; Giao tiếp hợp tác nhóm.",
          specific: "Chỉ đúng và gọi tên 4 bộ phận cơ bản của máy tính để bàn (Thân máy, Màn hình, Bàn phím, Chuột)."
        },
        qualities: "Chăm chỉ, trách nhiệm bảo quản tài sản phòng tin học trường học."
      },
      equipment: {
        teacher: "Máy tính, máy chiếu, bài giảng trình chiếu, tranh ảnh bộ phận máy tính.",
        student: "SGK Tin học 3, vở bài tập."
      },
      activities: [
        {
          step: 1,
          name: "1. HOẠT ĐỘNG KHỞI ĐỘNG (5 phút)",
          content: "Trò chơi giải câu đố vui 'Tôi là ai?' về người bạn máy tính.",
          objective: "Tạo tâm thế hào hứng, kết nối kiến thức thực tế với bài học mới.",
          organization: "GV chiếu câu đố -> HS suy nghĩ trả lời nhanh -> GV tổng kết trao sao thưởng."
        },
        {
          step: 2,
          name: "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC (15 phút)",
          content: "Khám phá 4 bộ phận cơ bản của máy tính để bàn.",
          objective: "Nắm vững đặc điểm, hình dáng và chức năng cơ bản của từng bộ phận.",
          organization: "Chia 4 nhóm thảo luận, quan sát máy tính thật và gán thẻ tên phù hợp."
        },
        {
          step: 3,
          name: "3. HOẠT ĐỘNG LUYỆN TẬP (10 phút)",
          content: "Thực hành trên Web Vui Học: Trò chơi 'Thử tài phần cứng'.",
          objective: "Củng cố phản xạ nhận biết và kết nối các bộ phận máy tính.",
          organization: "Học sinh đăng nhập tài khoản trên máy tính và hoàn thành thử thách kéo thả."
        },
        {
          step: 4,
          name: "4. HOẠT ĐỘNG VẬN DỤNG (5 phút)",
          content: "Nhận biết các loại máy tính khác: Máy tính xách tay (Laptop), Máy tính bảng (Tablet).",
          objective: "Mở rộng liên hệ thực tế cuộc sống hàng ngày tại gia đình.",
          organization: "GV gợi mở câu hỏi so sánh -> HS phát biểu -> Giao bài tập về nhà."
        }
      ],
      notes: "Tiết học diễn ra sôi nổi, 100% học sinh đạt yêu cầu cần đạt."
    }
  ],

  // 3. NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM THEO BÀI HỌC (LESSON QUIZZES)
  quizzes: [
    {
      id: "quiz_01",
      lessonId: "L3_02",
      lessonTitle: "Khám phá máy tính",
      grade: 3,
      question: "Bộ phận nào của máy tính để bàn có chức năng hiển thị kết quả làm việc cho em nhìn thấy?",
      options: ["A. Thân máy", "B. Màn hình", "C. Bàn phím", "D. Chuột máy tính"],
      correctIndex: 1,
      explanation: "Màn hình là thiết bị xuất dữ liệu dạng hình ảnh để chúng ta quan sát và làm việc.",
      stars: 15,
      createdBy: "Thầy Giáo Anh Đào"
    },
    {
      id: "quiz_02",
      lessonId: "L3_02",
      lessonTitle: "Khám phá máy tính",
      grade: 3,
      question: "Bộ phận nào được coi là 'Bộ não' trung tâm điều khiển mọi hoạt động của máy tính?",
      options: ["A. Chuột", "B. Bàn phím", "C. Thân máy tính (chứa CPU)", "D. Loa"],
      correctIndex: 2,
      explanation: "Bên trong Thân máy có bộ vi xử lý CPU đóng vai trò như bộ não xử lý mọi phép tính.",
      stars: 15,
      createdBy: "Thầy Giáo Anh Đào"
    },
    {
      id: "quiz_03",
      lessonId: "L3_03",
      lessonTitle: "Em tập sử dụng chuột máy tính",
      grade: 3,
      question: "Khi cầm chuột máy tính bằng tay phải, ngón trỏ của em sẽ đặt vào nút nào?",
      options: ["A. Nút trái chuột", "B. Nút phải chuột", "C. Nút cuộn ở giữa", "D. Thân chuột"],
      correctIndex: 0,
      explanation: "Quy tắc cầm chuột chuẩn: Ngón trỏ đặt nút trái, ngón giữa đặt nút phải.",
      stars: 15,
      createdBy: "Thầy Giáo Anh Đào"
    },
    {
      id: "quiz_04",
      lessonId: "L4_01",
      lessonTitle: "Phần cứng và phần mềm máy tính",
      grade: 4,
      question: "Vật nào sau đây là ví dụ về PHẦN CỨNG của máy tính?",
      options: ["A. Phần mềm Paint tập vẽ", "B. Hệ điều hành Windows", "C. Bàn phím và Chuột", "D. Trò chơi Minecraft"],
      correctIndex: 2,
      explanation: "Phần cứng là các thiết bị vật lý mà em có thể nhìn thấy và chạm tay vào được như bàn phím, chuột, màn hình.",
      stars: 20,
      createdBy: "Thầy Giáo Anh Đào"
    },
    {
      id: "quiz_05",
      lessonId: "L5_01",
      lessonTitle: "Thu thập và tìm kiếm thông tin trên Internet",
      grade: 5,
      question: "Để tìm kiếm thông tin về bài học Lịch sử trên Internet, em nên sử dụng công cụ nào?",
      options: ["A. Phần mềm soạn thảo Word", "B. Máy tìm kiếm (Google, Bing...)", "C. Phần mềm Paint", "D. Trình nghe nhạc"],
      correctIndex: 1,
      explanation: "Máy tìm kiếm trên Internet giúp em tra cứu văn bản, hình ảnh, tài liệu học tập nhanh chóng và chính xác.",
      stars: 25,
      createdBy: "Thầy Giáo Anh Đào"
    }
  ],

  // 4. DANH MỤC GAME HỌC TẬP TƯƠNG TÁC
  games: [
    {
      id: "game_hardware_match",
      title: "🧩 Thử Tài Phần Cứng Máy Tính",
      grade: 3,
      type: "interactive_drag",
      icon: "🖥️",
      description: "Kéo thả và nối đúng tên 4 bộ phận cơ bản của máy tính để bàn để mở khóa kho báu!",
      badge: "Kỹ Sư Phần Cứng Nhí"
    },
    {
      id: "game_bee_typing",
      title: "🐝 Ong Vàng Luyện Gõ 10 Ngón",
      grade: 3,
      type: "typing_master",
      icon: "⌨️",
      description: "Luyện đặt ngón tay đúng trên hàng phím cơ sở (F, J) để giúp chú Ong Vàng thu thập mật ngọt!",
      badge: "Bậc Thầy Gõ Phím"
    },
    {
      id: "game_knight_maze",
      title: "⚔️ Hiệp Sĩ Mê Cung Thuật Toán",
      grade: 4,
      type: "logic_puzzle",
      icon: "🧭",
      description: "Lập trình chuỗi lệnh (Tiến, Rẽ Trái, Rẽ Phải) giúp Hiệp Sĩ vượt cạm bẫy đến đích!",
      badge: "Nhà Thám Hiểm Thuật Toán"
    },
    {
      id: "game_cyber_quiz",
      title: "🛡️ Đố Vui Tin Học & An Toàn Số",
      grade: 5,
      type: "quiz_challenge",
      icon: "💡",
      description: "Thử thách trắc nghiệm 10 câu hỏi siêu tốc về mạng Internet và bảo vệ mật khẩu an toàn!",
      badge: "Vệ Binh Không Gian Mạng"
    },
    {
      id: "game_3d_computer_power",
      title: "🖥️ Mô Phỏng 3D: Phòng Máy & Bật/Tắt Máy Tính",
      grade: 3,
      type: "3d_simulation",
      icon: "🌐",
      description: "Trải nghiệm mô phỏng 3D phòng máy tính thực tế ảo, cắm nguồn điện, bật CPU, bật màn hình và tắt máy an toàn!",
      badge: "Bậc Thầy Vận Hành 3D"
    }
  ],

  // 5. BẢNG XẾP HẠNG HỌC TẬP
  leaderboard: [
    { rank: 1, name: "Trần Đức Nam", class: "5A", stars: 310, badge: "🥇 Đại Kiện Tướng Tin Học", avatar: "🧑‍💻" },
    { rank: 2, name: "Lê Thị Mai", class: "4B", stars: 240, badge: "🥈 Thám Hiểm Gia Xuất Sắc", avatar: "👧" },
    { rank: 3, name: "Nguyễn Văn An", class: "3A", stars: 180, badge: "🥉 Tân Binh Công Nghệ", avatar: "👦" },
    { rank: 4, name: "Phạm Hoàng Bách", class: "3B", stars: 150, badge: "⭐ Ngôi Sao Chăm Chỉ", avatar: "🤖" },
    { rank: 5, name: "Vũ Bảo Châu", class: "4A", stars: 130, badge: "⭐ Thần Đồng Gõ Phím", avatar: "👩‍🎨" }
  ],

  // 6. KHO BÀI GIẢNG ĐIỆN TỬ & POWERPOINT SLIDES
  lectures: [
    {
      id: "lec_01",
      title: "Bài Giảng Điện Tử: Khám Phá Máy Tính Để Bàn",
      grade: 3,
      topicName: "Chủ đề A: Máy tính và em",
      lessonId: "L3_02",
      authorName: "Thầy Giáo Anh Đào",
      schoolName: "Trường Tiểu Học Vui Học",
      fileName: "BaiGiang_TinHoc3_KhamPhaMayTinh.pptx",
      fileSizeText: "6.8 MB",
      fileType: "pptx",
      fileUrl: "https://view.officeapps.live.com/op/view.aspx?src=https://file-examples.com/storage/fe59972322649b1a5905d6a/2017/08/file_example_PPTX_250kB.pptx",
      slideCount: 22,
      downloadCount: 145,
      viewCount: 520,
      thumbnailColor: "from-blue-600 to-cyan-500",
      description: "Bài giảng PowerPoint thiết kế hoạt họa sinh động 4 bộ phận máy tính: Thân máy, Màn hình, Bàn phím, Chuột."
    },
    {
      id: "lec_02",
      title: "Bài Giảng Điện Tử: Em Tập Sử Dụng Chuột Máy Tính",
      grade: 3,
      topicName: "Chủ đề A: Máy tính và em",
      lessonId: "L3_03",
      authorName: "Thầy Giáo Anh Đào",
      schoolName: "Trường Tiểu Học Vui Học",
      fileName: "BaiGiang_TinHoc3_TapSuDungChuot.pptx",
      fileSizeText: "4.5 MB",
      fileType: "pptx",
      fileUrl: "https://view.officeapps.live.com/op/view.aspx?src=https://file-examples.com/storage/fe59972322649b1a5905d6a/2017/08/file_example_PPTX_250kB.pptx",
      slideCount: 18,
      downloadCount: 98,
      viewCount: 380,
      thumbnailColor: "from-emerald-600 to-teal-500",
      description: "Hình ảnh hướng dẫn thực hành cầm chuột bằng tay phải, nháy đơn, nháy kép và kéo thả đối tượng."
    },
    {
      id: "lec_03",
      title: "Bài Giảng Điện Tử: Phần Cứng & Phần Mềm Máy Tính",
      grade: 4,
      topicName: "Chủ đề A: Máy tính và em",
      lessonId: "L4_01",
      authorName: "Thầy Giáo Anh Đào",
      schoolName: "Trường Tiểu Học Vui Học",
      fileName: "BaiGiang_TinHoc4_PhanCungPhanMem.pptx",
      fileSizeText: "8.2 MB",
      fileType: "pptx",
      fileUrl: "https://view.officeapps.live.com/op/view.aspx?src=https://file-examples.com/storage/fe59972322649b1a5905d6a/2017/08/file_example_PPTX_250kB.pptx",
      slideCount: 26,
      downloadCount: 180,
      viewCount: 640,
      thumbnailColor: "from-amber-500 to-orange-600",
      description: "Trực quan hóa sự khác biệt giữa phần cứng vật lý và các phần mềm ứng dụng trong đời sống."
    },
    {
      id: "lec_04",
      title: "Bài Giảng Điện Tử: Tìm Kiếm Thông Tin An Toàn Trên Internet",
      grade: 5,
      topicName: "Chủ đề C: Tổ chức lưu trữ và tìm kiếm",
      lessonId: "L5_01",
      authorName: "Thầy Giáo Anh Đào",
      schoolName: "Trường Tiểu Học Vui Học",
      fileName: "BaiGiang_TinHoc5_TimKiemInternet.pptx",
      fileSizeText: "5.7 MB",
      fileType: "pptx",
      fileUrl: "https://view.officeapps.live.com/op/view.aspx?src=https://file-examples.com/storage/fe59972322649b1a5905d6a/2017/08/file_example_PPTX_250kB.pptx",
      slideCount: 24,
      downloadCount: 210,
      viewCount: 890,
      thumbnailColor: "from-purple-600 to-indigo-600",
      description: "Kỹ năng tra cứu thông tin bằng từ khóa chính xác và bảo vệ an toàn thông tin cá nhân trên mạng."
    }
  ]
};

// Khởi tạo LocalStorage nếu chưa có hoặc cập nhật thêm trường mới
try {
  const existing = JSON.parse(localStorage.getItem("app_mock_db"));
  if (!existing || !existing.lectures) {
    localStorage.setItem("app_mock_db", JSON.stringify(MOCK_DATABASE));
  }
} catch (e) {
  localStorage.setItem("app_mock_db", JSON.stringify(MOCK_DATABASE));
}

window.MOCK_DATABASE = MOCK_DATABASE;
