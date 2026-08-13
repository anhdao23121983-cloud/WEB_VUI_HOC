/**
 * KHO DỮ LIỆU MẪU (MOCK DATABASE & LOCAL PERSISTENCE)
 * Hỗ trợ chế độ hoạt động mượt mà không cần backend ngay lập tức
 */

const MOCK_DATABASE = {
  // 1. TÀI KHOẢN MẪU
  users: [
    {
      id: "u_teacher_01",
      email: "anhdao.teacher@vuihoc.edu.vn",
      name: "Thầy Giáo Anh Đào",
      role: "teacher",
      school: "Trường Tiểu Học Vui Học",
      avatar: "👨‍🏫"
    },
    {
      id: "u_student_01",
      studentCode: "HS3A01",
      name: "Nguyễn Văn An",
      role: "student",
      grade: 3,
      className: "3A",
      stars: 180,
      avatar: "👦"
    },
    {
      id: "u_student_02",
      studentCode: "HS4B02",
      name: "Lê Thị Mai",
      role: "student",
      grade: 4,
      className: "4B",
      stars: 240,
      avatar: "👧"
    },
    {
      id: "u_student_03",
      studentCode: "HS5A03",
      name: "Trần Đức Nam",
      role: "student",
      grade: 5,
      className: "5A",
      stars: 310,
      avatar: "🧑‍💻"
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
      
      // I. YÊU CẦU CẦN ĐẠT
      objectives: {
        competencies: {
          general: "Tự chủ và tự học: Tự giác tham gia các hoạt động nhận diện và gọi tên các thiết bị máy tính; Giao tiếp và hợp tác: Biết chia sẻ, thảo luận cùng bạn trong nhóm.",
          specific: "Nhận biết và chỉ đúng 4 bộ phận cơ bản của máy tính để bàn (Thân máy, Màn hình, Bàn phím, Chuột); Nêu được chức năng cơ bản của từng bộ phận."
        },
        qualities: "Chăm chỉ, trách nhiệm trong việc giữ gìn và bảo quản thiết bị máy tính phòng thực hành."
      },

      // II. ĐỒ DÙNG DẠY HỌC
      equipment: {
        teacher: "Máy chiếu/Tivi, bài giảng điện tử PowerPoint, máy tính để bàn mẫu, thẻ tên 4 bộ phận máy tính.",
        student: "Sách giáo khoa Tin học 3, vở ghi bài, bút chì."
      },

      // III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
      activities: [
        {
          step: 1,
          name: "1. HOẠT ĐỘNG KHỞI ĐỘNG (5 phút)",
          objective: "Tạo hứng thú, kích thích sự tò mò của học sinh về các bộ phận của máy tính.",
          content: "GV tổ chức trò chơi 'Giải đố nhanh' về người bạn máy tính thông minh.",
          organization: "GV đọc câu đố: 'Cái gì như chiếc tivi / Giúp em nhìn thấy chữ, hình lung linh?'. HS giơ tay trả lời -> GV dẫn dắt vào bài mới."
        },
        {
          step: 2,
          name: "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC (15 phút)",
          objective: "HS nhận biết 4 bộ phận cơ bản và chức năng của chúng.",
          content: "Khám phá Thân máy, Màn hình, Bàn phím và Chuột máy tính.",
          organization: "GV chia lớp thành 4 nhóm, phát phiếu học tập. HS quan sát máy tính thật và ghép thẻ tên tương ứng. Đại diện nhóm trình bày -> GV chuẩn hóa kiến thức."
        },
        {
          step: 3,
          name: "3. HOẠT ĐỘNG LUYỆN TẬP & THỰC HÀNH (10 phút)",
          objective: "Củng cố kiến thức nhận diện qua trò chơi tương tác.",
          content: "HS tham gia trò chơi tương tác 'Ghép nối phần cứng máy tính' trên hệ thống Web Vui Học.",
          organization: "HS thực hành kéo thả nối tên với hình ảnh thiết bị trên máy tính. GV quan sát và tuyên dương các em đạt 3 sao hoàn hảo."
        },
        {
          step: 4,
          name: "4. HOẠT ĐỘNG VẬN DỤNG (5 phút)",
          objective: "Vận dụng kiến thức vào thực tế bảo quản thiết bị.",
          content: "Nêu quy tắc an toàn khi sử dụng máy tính ở nhà và trường.",
          organization: "GV nêu tình huống: 'Khi đang dùng máy tính, nếu thấy dây điện hở hoặc máy có mùi khét, em sẽ làm gì?'. HS trả lời -> GV chốt thông điệp an toàn."
        }
      ],

      // IV. ĐIỀU CHỈNH SAU BÀI DẠY
      evaluation: "Học sinh hào hứng tham gia trò chơi tương tác, 100% học sinh nhận biết chính xác 4 bộ phận máy tính để bàn."
    }
  ],

  // 3. DANH MỤC TRÒ CHƠI HỌC TẬP (GAME HUB)
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
      description: "Lập trình chuỗi lệnh (Tiến, Rẽ Trái, Rẽ Phải, Nhảy) giúp Hiệp Sĩ vượt cạm bẫy đến đích!",
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
    }
  ],

  // 4. BẢNG XẾP HẠNG HỌC TẬP
  leaderboard: [
    { rank: 1, name: "Trần Đức Nam", class: "5A", stars: 310, badge: "🥇 Đại Kiện Tướng Tin Học", avatar: "🧑‍💻" },
    { rank: 2, name: "Lê Thị Mai", class: "4B", stars: 240, badge: "🥈 Thám Hiểm Gia Xuất Sắc", avatar: "👧" },
    { rank: 3, name: "Nguyễn Văn An", class: "3A", stars: 180, badge: "🥉 Tân Binh Công Nghệ", avatar: "👦" },
    { rank: 4, name: "Phạm Hoàng Bách", class: "3B", stars: 150, badge: "⭐ Ngôi Sao Chăm Chỉ", avatar: "🤖" },
    { rank: 5, name: "Vũ Bảo Châu", class: "4A", stars: 130, badge: "⭐ Thần Đồng Gõ Phím", avatar: "👩‍🎨" }
  ]
};

// Khởi tạo LocalStorage nếu chưa có
if (!localStorage.getItem("app_mock_db")) {
  localStorage.setItem("app_mock_db", JSON.stringify(MOCK_DATABASE));
}

window.MOCK_DATABASE = MOCK_DATABASE;
