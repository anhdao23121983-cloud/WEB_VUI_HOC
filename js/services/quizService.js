/**
 * QUIZ SERVICE (DỊCH VỤ QUẢN LÝ NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM BÀI HỌC)
 * Hỗ trợ Giáo viên soạn câu hỏi thủ công, AI tạo tự động và Học sinh làm bài tập
 */

class QuizService {
  constructor() {
    this.quizzes = [];
  }

  // 1. Lấy danh sách câu hỏi của một bài học cụ thể
  async getQuizzesByLesson(lessonId) {
    // 1. Kiểm tra Supabase trước
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const { data, error } = await client
          .from("lesson_quizzes")
          .select("*")
          .eq("lesson_id", lessonId)
          .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(item => ({
            id: item.id,
            lessonId: item.lesson_id,
            lessonTitle: item.lesson_title,
            grade: item.grade_level,
            question: item.question,
            options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options,
            correctIndex: item.correct_index,
            explanation: item.explanation || "",
            stars: item.stars || 15,
            createdBy: item.created_by || "Thầy Giáo Anh Đào",
            createdAt: item.created_at
          }));
        }
      } catch (err) {
        console.warn("Lỗi tải câu hỏi từ Supabase, sử dụng bộ nhớ cục bộ:", err);
      }
    }

    // 2. Dự phòng LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    const localQuizzes = db.quizzes || [];
    return localQuizzes.filter(q => q.lessonId === lessonId);
  }

  // 2. Lấy toàn bộ câu hỏi trong hệ thống
  async getAllQuizzes() {
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const { data, error } = await client
          .from("lesson_quizzes")
          .select("*")
          .order("grade_level", { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(item => ({
            id: item.id,
            lessonId: item.lesson_id,
            lessonTitle: item.lesson_title,
            grade: item.grade_level,
            question: item.question,
            options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options,
            correctIndex: item.correct_index,
            explanation: item.explanation || "",
            stars: item.stars || 15,
            createdBy: item.created_by || "Thầy Giáo Anh Đào",
            createdAt: item.created_at
          }));
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách toàn bộ câu hỏi từ Supabase:", err);
      }
    }

    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    return db.quizzes || [];
  }

  // 3. Lưu hoặc cập nhật câu hỏi
  async saveQuiz(quizData) {
    const user = window.authService?.getUser() || { name: "Thầy Giáo Anh Đào" };
    const quizId = quizData.id || ("quiz_" + Date.now());

    const quizObj = {
      id: quizId,
      lessonId: quizData.lessonId,
      lessonTitle: quizData.lessonTitle,
      grade: parseInt(quizData.grade) || 3,
      question: quizData.question.trim(),
      options: quizData.options,
      correctIndex: parseInt(quizData.correctIndex) || 0,
      explanation: (quizData.explanation || "").trim(),
      stars: parseInt(quizData.stars) || 15,
      createdBy: quizData.createdBy || user.name,
      updatedAt: new Date().toISOString()
    };

    // 1. Lưu dự phòng LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (!db.quizzes) db.quizzes = [];

    const existingIdx = db.quizzes.findIndex(q => q.id === quizId);
    if (existingIdx >= 0) {
      db.quizzes[existingIdx] = { ...db.quizzes[existingIdx], ...quizObj };
    } else {
      quizObj.createdAt = new Date().toISOString();
      db.quizzes.push(quizObj);
    }
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // 2. Đồng bộ Supabase
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        const payload = {
          lesson_id: quizObj.lessonId,
          lesson_title: quizObj.lessonTitle,
          grade_level: quizObj.grade,
          question: quizObj.question,
          options: quizObj.options,
          correct_index: quizObj.correctIndex,
          explanation: quizObj.explanation,
          stars: quizObj.stars,
          created_by: quizObj.createdBy,
          updated_at: new Date().toISOString()
        };

        if (quizData.id && !quizData.id.startsWith("quiz_")) {
          payload.id = quizData.id;
        }

        await client.from("lesson_quizzes").upsert([payload]);
      } catch (err) {
        console.warn("Lỗi lưu câu hỏi lên Supabase:", err);
      }
    }

    return { success: true, quiz: quizObj };
  }

  // 4. Xóa câu hỏi
  async deleteQuiz(quizId) {
    // 1. Xóa LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.quizzes) {
      db.quizzes = db.quizzes.filter(q => q.id !== quizId);
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    // 2. Xóa Supabase
    if (window.supabaseService?.isReady()) {
      try {
        const client = window.supabaseService.client;
        await client.from("lesson_quizzes").delete().eq("id", quizId);
      } catch (err) {
        console.warn("Lỗi xóa câu hỏi trên Supabase:", err);
      }
    }

    return { success: true };
  }

  // 5. AI Gợi ý tự động 3 câu hỏi trắc nghiệm chuẩn GDPT 2018
  async generateAIQuizSuggestions(lessonTitle, grade, topicName) {
    // Template câu hỏi thông minh theo từng chủ đề và khối lớp
    const templates = {
      3: [
        {
          question: `Khi thực hành nội dung '${lessonTitle}', thao tác nào sau đây là an toàn và đúng kỹ thuật nhất?`,
          options: [
            "A. Ngồi thẳng lưng, giữ khoảng cách mắt hợp lý với màn hình và thao tác nhẹ nhàng",
            "B. Vừa ăn bánh kẹo vừa bấm phím thật mạnh",
            "C. Cầm dây điện kéo mạnh khi muốn tắt máy tính",
            "D. Để nước uống ngay cạnh bàn phím máy tính"
          ],
          correctIndex: 0,
          explanation: "Tư thế ngồi chuẩn và thao tác nhẹ nhàng giúp bảo vệ sức khỏe và độ bền của thiết bị máy tính.",
          stars: 15
        },
        {
          question: `Trong bài học '${lessonTitle}', kiến thức quan trọng nhất em cần ghi nhớ là gì?`,
          options: [
            "A. Chỉ chơi game không cần nghe Thầy Cô giảng bài",
            "B. Nhận biết đúng tên gọi, chức năng của thiết bị và thực hiện đúng quy trình hướng dẫn",
            "C. Tự ý tháo các dây cắm phía sau thùng máy tính",
            "D. Tắt máy tính bằng cách rút phích cắm điện đột ngột"
          ],
          correctIndex: 1,
          explanation: "Nắm vững lý thuyết và thực hành theo đúng quy trình của giáo viên là chìa khóa đạt điểm cao.",
          stars: 15
        },
        {
          question: `Em hãy chọn phát biểu ĐÚNG khi nói về '${lessonTitle}':`,
          options: [
            "A. Máy tính chỉ dùng để xem phim hoạt hình",
            "B. Thông tin sau khi xử lý sẽ được xuất ra màn hình hoặc loa để em nhận biết",
            "C. Chuột máy tính chỉ có một nút duy nhất",
            "D. Không cần lưu bài khi thực hành xong"
          ],
          correctIndex: 1,
          explanation: "Màn hình và loa là các thiết bị xuất giúp hiển thị kết quả xử lý của máy tính.",
          stars: 20
        }
      ],
      4: [
        {
          question: `Theo chương trình Tin học lớp 4, khi tìm hiểu về '${lessonTitle}', khái niệm nào sau đây là chính xác?`,
          options: [
            "A. Phần cứng là phần mềm cài đặt trong máy",
            "B. Tập hợp các câu lệnh được sắp xếp theo trình tự hợp lý để giải quyết một bài toán gọi là Thuật toán",
            "C. Bàn phím máy tính là thiết bị xuất dữ liệu",
            "D. Thư mục không thể chứa các tệp tin con"
          ],
          correctIndex: 1,
          explanation: "Thuật toán là một dãy các chỉ dẫn từng bước rõ ràng để hoàn thành một nhiệm vụ.",
          stars: 20
        },
        {
          question: `Hành động nào sau đây thể hiện văn hóa ứng xử văn minh khi học bài '${lessonTitle}'?`,
          options: [
            "A. Tôn trọng bản quyền tác giả và bảo vệ thông tin cá nhân của bạn bè",
            "B. Sao chép bài làm của bạn rồi tự nhận là của mình",
            "C. Chia sẻ mật khẩu của mình cho người lạ trên mạng",
            "D. Bình luận thiếu lịch sự trên các diễn đàn trực tuyến"
          ],
          correctIndex: 0,
          explanation: "Đạo đức và an toàn không gian mạng là phẩm chất quan trọng hàng đầu của công dân số.",
          stars: 20
        },
        {
          question: `Trong bài '${lessonTitle}', để lưu giữ kết quả học tập gọn gàng, em nên làm gì?`,
          options: [
            "A. Lưu tất cả bài tập ra ngoài màn hình chính Desktop lộn xộn",
            "B. Tạo cây thư mục theo từng môn học và tên bài để quản lý khoa học",
            "C. Xóa luôn tệp ngay sau khi làm xong",
            "D. Đổi tên tệp thành các ký tự vô nghĩa"
          ],
          correctIndex: 1,
          explanation: "Tổ chức cây thư mục hợp lý giúp tìm kiếm và quản lý tài liệu nhanh chóng, tiện lợi.",
          stars: 25
        }
      ],
      5: [
        {
          question: `Đối với bài học '${lessonTitle}' (Tin học lớp 5), kỹ năng số nào là trọng tâm?`,
          options: [
            "A. Đánh giá độ tin cậy của thông tin tìm kiếm được trên Internet trước khi sử dụng",
            "B. Tin tưởng 100% mọi thông tin xuất hiện trên mạng xã hội",
            "C. Tải và cài đặt các phần mềm không rõ nguồn gốc",
            "D. Gửi thông tin cá nhân của gia đình cho các trang web lạ"
          ],
          correctIndex: 0,
          explanation: "Cần kiểm tra nguồn gốc tác giả và tính xác thực của thông tin trên mạng Internet.",
          stars: 25
        },
        {
          question: `Khi ứng dụng kiến thức bài '${lessonTitle}' vào thực tế, phương án nào tối ưu nhất?`,
          options: [
            "A. Sử dụng phần mềm trình chiếu PowerPoint để tạo bài thuyết trình sinh động, mạch lạc",
            "B. Chỉ chép chữ thật nhiều vào một trang trình chiếu",
            "C. Chọn màu nền và màu chữ trùng nhau khiến người xem khó đọc",
            "D. Không cần chuẩn bị nội dung trước khi thuyết trình"
          ],
          correctIndex: 0,
          explanation: "Bài trình chiếu tốt cần có bố cục khoa học, hình ảnh minh họa rõ nét và màu sắc hài hòa.",
          stars: 25
        },
        {
          question: `Để bảo mật tài khoản cá nhân khi thực hành bài '${lessonTitle}', mật khẩu nào sau đây là mạnh nhất?`,
          options: [
            "A. 123456",
            "B. abcxyz",
            "C. TinHoc5@2026!Pro",
            "D. ngaythangnamsinh"
          ],
          correctIndex: 2,
          explanation: "Mật khẩu mạnh cần kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt, độ dài trên 8 ký tự.",
          stars: 30
        }
      ]
    };

    const list = templates[grade] || templates[3];
    return list;
  }
}

window.quizService = new QuizService();
