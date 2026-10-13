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
      name: "Cô Giáo Anh Đào",
      role: "teacher",
      school: "Trường Tiểu Học Vui Học",
      avatar: "👩‍🏫",
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
    },
    {
      id: "u_student_04",
      username: "hs3b04",
      name: "Phạm Hoàng Bách",
      role: "student",
      grade: 3,
      className: "3B",
      stars: 150,
      avatar: "🦁",
      isActive: true
    },
    {
      id: "u_student_05",
      username: "hs4a05",
      name: "Vũ Bảo Châu",
      role: "student",
      grade: 4,
      className: "4A",
      stars: 130,
      avatar: "🦄",
      isActive: true
    },
    {
      id: "u_student_06",
      username: "hs5b06",
      name: "Đỗ Tuấn Kiệt",
      role: "student",
      grade: 5,
      className: "5B",
      stars: 210,
      avatar: "🦊",
      isActive: true
    },
    {
      id: "u_student_07",
      username: "hs3a07",
      name: "Hoàng Gia Huy",
      role: "student",
      grade: 3,
      className: "3A",
      stars: 175,
      avatar: "👦",
      isActive: true
    },
    {
      id: "u_student_08",
      username: "hs3b08",
      name: "Đặng Quỳnh Anh",
      role: "student",
      grade: 3,
      className: "3B",
      stars: 195,
      avatar: "🌸",
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
      teacherName: "Cô Giáo Anh Đào",
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
      createdBy: "Cô Giáo Anh Đào"
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
      createdBy: "Cô Giáo Anh Đào"
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
      createdBy: "Cô Giáo Anh Đào"
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
      createdBy: "Cô Giáo Anh Đào"
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
      createdBy: "Cô Giáo Anh Đào"
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
      title: "⚡ Đấu Trường Tin Học",
      grade: 5,
      type: "quiz_challenge",
      icon: "⚡",
      description: "Đấu trường kiến thức Tin học & an toàn số sôi động, thử thách trắc nghiệm 10 câu hỏi siêu tốc tranh tài bảng vàng!",
      badge: "Quán Quân Đấu Trường"
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

  // 6. KHO BÀI GIẢNG ĐIỆN TỬ & POWERPOINT SLIDES (TỰ ĐỘNG NẠP BÀI GIẢNG ĐÃ LƯU VĨNH VIỄN)
  lectures: (typeof window !== "undefined" && window.SAVED_LECTURES && window.SAVED_LECTURES.length > 0) ? window.SAVED_LECTURES : [],

  // 7. KHẢO SÁT & NGÂN HÀNG ĐỀ KIỂM TRA MẪU (LỚP 3, 4, 5)
  exams: [
    {
      id: "exam_301",
      title: "Đề Kiểm Tra Đánh Giá Định Kỳ Môn Tin Học Lớp 3 (Học Kỳ I)",
      grade: 3,
      examType: "final_term_1",
      bookSeries: "KNTT",
      authorName: "Cô Giáo Anh Đào",
      createdByUsername: "anhdao",
      schoolName: "Trường Tiểu Học Vui Học",
      durationMinutes: 35,
      totalScore: 10,
      fileName: "De_Kiem_Tra_TinHoc_Lop3_HK1.docx",
      fileSizeText: "2.1 MB",
      fileType: "docx",
      fileUrl: "#",
      downloadCount: 45,
      viewCount: 180,
      thumbnailColor: "from-blue-700 to-indigo-600",
      description: "Đề kiểm tra trắc nghiệm & tự luận đánh giá kiến thức máy tính, chuột và bàn phím theo Thông tư 27/2020.",
      matrixJson: null,
      createdAt: "2026-09-01T08:00:00.000Z"
    },
    {
      id: "exam_401",
      title: "Đề Kiểm Tra Định Kỳ Môn Tin Học Lớp 4 (Giữa Học Kỳ I)",
      grade: 4,
      examType: "mid_term_1",
      bookSeries: "KNTT",
      authorName: "Cô Giáo Anh Đào",
      createdByUsername: "anhdao",
      schoolName: "Trường Tiểu Học Vui Học",
      durationMinutes: 35,
      totalScore: 10,
      fileName: "De_Kiem_Tra_TinHoc_Lop4_GHK1.docx",
      fileSizeText: "2.4 MB",
      fileType: "docx",
      fileUrl: "#",
      downloadCount: 62,
      viewCount: 230,
      thumbnailColor: "from-amber-600 to-orange-600",
      description: "Đề kiểm tra trắc nghiệm & tự luận đánh giá phần cứng, phần mềm, cây thư mục và soạn thảo trình chiếu PowerPoint.",
      matrixJson: null,
      createdAt: "2026-09-05T08:00:00.000Z"
    },
    {
      id: "exam_501",
      title: "Đề Kiểm Tra Khảo sát Định Kỳ Môn Tin Học Lớp 5 (Cuối Học Kỳ I)",
      grade: 5,
      examType: "final_term_1",
      bookSeries: "KNTT",
      authorName: "Cô Giáo Anh Đào",
      createdByUsername: "anhdao",
      schoolName: "Trường Tiểu Học Vui Học",
      durationMinutes: 35,
      totalScore: 10,
      fileName: "De_Kiem_Tra_TinHoc_Lop5_HK1.docx",
      fileSizeText: "2.8 MB",
      fileType: "docx",
      fileUrl: "#",
      downloadCount: 88,
      viewCount: 310,
      thumbnailColor: "from-emerald-700 to-teal-600",
      description: "Đề kiểm tra trắc nghiệm & lập trình Scratch, bảng tính Excel đơn giản bám sát chương trình GDPT 2018.",
      matrixJson: null,
      createdAt: "2026-09-10T08:00:00.000Z"
    }
  ],

  // 8. LỊCH SỬ THI ĐẤU ĐẤU TRƯỜNG TIN HỌC (ARENA MATCHES)
  arena_matches: [
    { id: "m_01", studentName: "Trần Đức Nam", studentClass: "5A", grade: 5, avatar: "🚀", score: 100, starsEarned: 150, durationSeconds: 18, totalCorrect: 5, totalQuestions: 5, perfectWins: 3, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: "m_02", studentName: "Nguyễn Văn An", studentClass: "3A", grade: 3, avatar: "🤖", score: 100, starsEarned: 140, durationSeconds: 22, totalCorrect: 5, totalQuestions: 5, perfectWins: 2, createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: "m_03", studentName: "Lê Thị Mai", studentClass: "4B", grade: 4, avatar: "🐱", score: 95, starsEarned: 120, durationSeconds: 25, totalCorrect: 4, totalQuestions: 5, perfectWins: 1, createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
    { id: "m_04", studentName: "Đặng Quỳnh Anh", studentClass: "3B", grade: 3, avatar: "🌸", score: 90, starsEarned: 110, durationSeconds: 24, totalCorrect: 4, totalQuestions: 5, perfectWins: 1, createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString() },
    { id: "m_05", studentName: "Phạm Hoàng Bách", studentClass: "3B", grade: 3, avatar: "🦁", score: 85, starsEarned: 95, durationSeconds: 28, totalCorrect: 4, totalQuestions: 5, perfectWins: 0, createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString() },
    { id: "m_06", studentName: "Đỗ Tuấn Kiệt", studentClass: "5B", grade: 5, avatar: "🦊", score: 85, starsEarned: 90, durationSeconds: 27, totalCorrect: 4, totalQuestions: 5, perfectWins: 0, createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString() },
    { id: "m_07", studentName: "Vũ Bảo Châu", studentClass: "4A", grade: 4, avatar: "🦄", score: 80, starsEarned: 85, durationSeconds: 30, totalCorrect: 4, totalQuestions: 5, perfectWins: 0, createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString() },
    { id: "m_08", studentName: "Hoàng Gia Huy", studentClass: "3A", grade: 3, avatar: "👦", score: 75, starsEarned: 70, durationSeconds: 35, totalCorrect: 3, totalQuestions: 5, perfectWins: 0, createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString() }
  ]
};

// Khởi tạo và bảo lưu dữ liệu trong LocalStorage
try {
  const seedLectures = (typeof window !== "undefined" && window.SAVED_LECTURES && window.SAVED_LECTURES.length > 0) ? window.SAVED_LECTURES : [];
  let existing = JSON.parse(localStorage.getItem("app_mock_db"));
  if (!existing) {
    MOCK_DATABASE.lectures = seedLectures;
    localStorage.setItem("app_mock_db", JSON.stringify(MOCK_DATABASE));
  } else {
    let updated = false;
    // Bổ sung users mới nếu thiếu
    if (!existing.users) existing.users = [];
    const existingUsernames = new Set(existing.users.map(u => u.username));
    for (const u of MOCK_DATABASE.users) {
      if (!existingUsernames.has(u.username)) {
        existing.users.push(u);
        updated = true;
      }
    }
    // Bổ sung hoặc làm mới arena_matches hôm nay
    if (!existing.arena_matches || existing.arena_matches.length === 0) {
      existing.arena_matches = MOCK_DATABASE.arena_matches;
      updated = true;
    } else {
      const todayCount = existing.arena_matches.filter(m => {
        const t = new Date(m.createdAt).getTime();
        return (Date.now() - t) <= 24 * 3600 * 1000;
      }).length;
      if (todayCount === 0) {
        existing.arena_matches.forEach((m, idx) => {
          m.createdAt = new Date(Date.now() - (idx * 20 * 60 * 1000) - (5 * 60 * 1000)).toISOString();
        });
        updated = true;
      }
    }
    // Hợp nhất bài giảng vĩnh viễn
    if (!existing.lectures || existing.lectures.length === 0) {
      existing.lectures = seedLectures;
      updated = true;
    } else if (seedLectures.length > 0) {
      const existingIds = new Set(existing.lectures.map(l => l.id));
      for (const seed of seedLectures) {
        if (!existingIds.has(seed.id)) {
          existing.lectures.push(seed);
          updated = true;
        }
      }
    }
    if (!existing.exams || existing.exams.length === 0) {
      existing.exams = MOCK_DATABASE.exams;
      updated = true;
    }
    if (updated) {
      localStorage.setItem("app_mock_db", JSON.stringify(existing));
    }
  }
} catch (e) {
  localStorage.setItem("app_mock_db", JSON.stringify(MOCK_DATABASE));
}

window.MOCK_DATABASE = MOCK_DATABASE;
