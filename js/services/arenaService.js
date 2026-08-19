/**
 * ARENA SERVICE - DỊCH VỤ QUẢN LÝ ĐẤU TRƯỜNG TIN HỌC (CRUD & SUPABASE SYNC)
 * Quản lý Ngân hàng câu hỏi, Thêm, Sửa, Xóa, Đồng bộ Supabase và Bảng xếp hạng Đấu Trường
 */

class ArenaService {
  constructor() {
    this.initialQuestions = [
      // === KHỐI LỚP 3 ===
      {
        id: "arena_q_01",
        grade: 3,
        topic: "Phần cứng máy tính",
        question: "Bộ phận nào của máy tính để bàn được coi là 'bộ não' điều khiển mọi hoạt động?",
        options: ["A. Màn hình máy tính", "B. Thân máy (CPU)", "C. Bàn phím", "D. Chuột máy tính"],
        correctIndex: 1,
        explanation: "Thân máy tính chứa bộ vi xử lý CPU, đóng vai trò như bộ não điều khiển và xử lý thông tin.",
        difficulty: "easy",
        timeLimit: 15,
        stars: 20
      },
      {
        id: "arena_q_02",
        grade: 3,
        topic: "Sắp xếp dữ liệu",
        question: "Theo bài 7 Tin học 3, vì sao chúng ta nên sắp xếp đồ vật và tệp tin ngăn nắp?",
        options: [
          "A. Để đồ vật trông đẹp mắt hơn",
          "B. Để giúp tìm kiếm nhanh chóng và dễ dàng",
          "C. Để máy tính chạy nhanh hơn",
          "D. Để không bị thầy cô nhắc nhở"
        ],
        correctIndex: 1,
        explanation: "Sắp xếp dữ liệu và đồ dùng học tập ngăn nắp, khoa học giúp chúng ta tìm kiếm nhanh chóng và tiết kiệm thời gian.",
        difficulty: "easy",
        timeLimit: 15,
        stars: 20
      },
      {
        id: "arena_q_03",
        grade: 3,
        topic: "Kỹ năng gõ phím",
        question: "Hai phím nào trên bàn phím có gờ nhô lên để đặt hai ngón trỏ định vị?",
        options: ["A. Phím A và L", "B. Phím F và J", "C. Phím G và H", "D. Phím Space và Enter"],
        correctIndex: 1,
        explanation: "Phím F và J trên hàng phím cơ sở có gờ nổi giúp đặt 2 ngón tay trỏ đúng vị trí khi gõ 10 ngón.",
        difficulty: "medium",
        timeLimit: 15,
        stars: 25
      },
      {
        id: "arena_q_04",
        grade: 3,
        topic: "An toàn phòng máy",
        question: "Hành động nào sau đây là KHÔNG NÊN LÀM trong phòng thực hành Tin học?",
        options: [
          "A. Ngồi thẳng lưng, mắt cách màn hình 50-70cm",
          "B. Mang nước uống và đồ ăn vào phòng máy",
          "C. Tắt máy đúng quy trình sau khi học xong",
          "D. Nghe theo hướng dẫn của thầy cô giáo"
        ],
        correctIndex: 1,
        explanation: "Tuyệt đối không mang nước và thức ăn vào phòng máy tính vì nước có thể làm chập cháy thiết bị điện tử.",
        difficulty: "easy",
        timeLimit: 15,
        stars: 20
      },
      // === KHỐI LỚP 4 ===
      {
        id: "arena_q_05",
        grade: 4,
        topic: "Thư mục & Tệp",
        question: "Trong máy tính, thư mục (Folder) dùng để làm gì?",
        options: [
          "A. Dùng để xem video và nghe nhạc",
          "B. Dùng để chứa các tệp tin và các thư mục con",
          "C. Dùng để kết nối Internet",
          "D. Dùng để gõ văn bản"
        ],
        correctIndex: 1,
        explanation: "Thư mục giống như các ngăn tủ, dùng để chứa và phân loại các tệp tin (File) và thư mục con một cách có hệ thống.",
        difficulty: "medium",
        timeLimit: 15,
        stars: 25
      },
      {
        id: "arena_q_06",
        grade: 4,
        topic: "Phần cứng & Phần mềm",
        question: "Thiết bị nào sau đây thuộc nhóm 'Thiết bị vào' (Input Device)?",
        options: ["A. Bàn phím và Chuột", "B. Màn hình", "C. Máy in", "D. Loa nghe nhạc"],
        correctIndex: 0,
        explanation: "Bàn phím và Chuột là các thiết bị vào giúp người dùng đưa lệnh và dữ liệu vào máy tính.",
        difficulty: "medium",
        timeLimit: 15,
        stars: 25
      },
      {
        id: "arena_q_07",
        grade: 4,
        topic: "Lập trình Scratch",
        question: "Trong Scratch, khối lệnh nào giúp nhân vật lặp lại một hành động liên tục không dừng?",
        options: ["A. lặp lại 10 lần", "B. liên tục (forever)", "C. nếu... thì", "D. đợi 1 giây"],
        correctIndex: 1,
        explanation: "Khối lệnh 'liên tục' (forever) trong nhóm Điều khiển sẽ lặp lại các lệnh bên trong vô tận cho đến khi bấm nút dừng đỏ.",
        difficulty: "hard",
        timeLimit: 20,
        stars: 30
      },
      // === KHỐI LỚP 5 ===
      {
        id: "arena_q_08",
        grade: 5,
        topic: "Mạng Internet & An toàn số",
        question: "Mật khẩu nào sau đây được coi là mật khẩu AN TOÀN và BẢO MẬT NHẤT?",
        options: [
          "A. 123456",
          "B. tinhoc2026",
          "C. AnhDao@TinHoc#2026",
          "D. ten_cua_em"
        ],
        correctIndex: 2,
        explanation: "Mật khẩu an toàn cần có ít nhất 8 ký tự, kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt (@, #, $...).",
        difficulty: "medium",
        timeLimit: 15,
        stars: 25
      },
      {
        id: "arena_q_09",
        grade: 5,
        topic: "Bản quyền & Đạo đức số",
        question: "Khi lấy hình ảnh trên Internet để làm bài thuyết trình, em nên làm gì để tôn trọng bản quyền?",
        options: [
          "A. Tự nhận là hình do mình tự vẽ",
          "B. Ghi rõ nguồn trích dẫn của tác giả hoặc website",
          "C. Đổi màu ảnh để không ai nhận ra",
          "D. Không cần quan tâm vì trên mạng là dùng tự do"
        ],
        correctIndex: 1,
        explanation: "Tôn trọng bản quyền tác giả bằng cách ghi rõ nguồn trích dẫn là quy tắc đạo đức số quan trọng khi học Tin học.",
        difficulty: "medium",
        timeLimit: 15,
        stars: 25
      },
      {
        id: "arena_q_10",
        grade: 5,
        topic: "Thuật toán tìm kiếm",
        question: "Khi tìm kiếm thông tin trên Google, sử dụng dấu ngoặc kép \"...\" có tác dụng gì?",
        options: [
          "A. Làm chữ to hơn",
          "B. Tìm kiếm chính xác cụm từ nằm trong dấu ngoặc kép",
          "C. Dịch tự động sang tiếng Anh",
          "D. Xóa lịch sử tìm kiếm"
        ],
        correctIndex: 1,
        explanation: "Đặt từ khóa trong dấu ngoặc kép giúp công cụ tìm kiếm lọc chính xác cụm từ theo đúng thứ tự các từ.",
        difficulty: "hard",
        timeLimit: 20,
        stars: 30
      }
    ];

    this.initDatabase();
  }

  // Khởi tạo dữ liệu Local ban đầu nếu chưa có
  initDatabase() {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
    if (!db.arena_questions || db.arena_questions.length === 0) {
      db.arena_questions = this.initialQuestions;
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }
  }

  // 1. LẤY DANH SÁCH CÂU HỎI ĐẤU TRƯỜNG (SUPABASE + LOCAL FALLBACK)
  async getQuestions(gradeFilter = "all", topicFilter = "all") {
    // 1. Thử lấy từ Supabase Cloud
    if (window.supabaseService?.isReady()) {
      try {
        let query = window.supabaseService.client
          .from("arena_questions")
          .select("*")
          .order("created_at", { ascending: false });

        if (gradeFilter !== "all") {
          query = query.eq("grade_level", parseInt(gradeFilter));
        }
        if (topicFilter !== "all") {
          query = query.eq("topic", topicFilter);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped = data.map(item => ({
            id: item.id,
            grade: item.grade_level,
            topic: item.topic,
            question: item.question,
            options: item.options || [],
            correctIndex: item.correct_index,
            explanation: item.explanation || "",
            difficulty: item.difficulty || "medium",
            timeLimit: item.time_limit_seconds || 15,
            stars: item.stars_reward || 20,
            createdBy: item.created_by || "Cô Giáo Anh Đào"
          }));

          // Đồng bộ lưu vào LocalStorage để cache offline
          const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
          db.arena_questions = mapped;
          localStorage.setItem("app_mock_db", JSON.stringify(db));

          return mapped;
        }
      } catch (err) {
        console.warn("Đọc arena_questions từ Supabase có cảnh báo, chuyển sang Local:", err);
      }
    }

    // 2. Dự phòng Local Storage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
    let list = db.arena_questions || this.initialQuestions;

    if (gradeFilter !== "all") {
      list = list.filter(q => q.grade === parseInt(gradeFilter));
    }
    if (topicFilter !== "all") {
      list = list.filter(q => q.topic === topicFilter);
    }
    return list;
  }

  // 2. THÊM MỚI CÂU HỎI ĐẤU TRƯỜNG (CREATE & SYNC TO SUPABASE)
  async createQuestion(questionData) {
    const newId = "arena_q_" + Date.now();
    const user = window.authService?.getUser() || { name: "Cô Giáo Anh Đào" };

    const formatted = {
      id: newId,
      grade: parseInt(questionData.grade) || 3,
      topic: questionData.topic || "Kiến thức chung",
      question: questionData.question.trim(),
      options: questionData.options,
      correctIndex: parseInt(questionData.correctIndex) || 0,
      explanation: (questionData.explanation || "").trim(),
      difficulty: questionData.difficulty || "medium",
      timeLimit: parseInt(questionData.timeLimit) || 15,
      stars: parseInt(questionData.stars) || 20,
      createdBy: user.name || "Cô Giáo Anh Đào",
      createdAt: new Date().toISOString()
    };

    // 1. Lưu LocalStorage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
    if (!db.arena_questions) db.arena_questions = [];
    db.arena_questions.unshift(formatted);
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // 2. Đồng bộ lên Supabase Cloud & Lấy về UUID thực
    if (window.supabaseService?.isReady()) {
      try {
        const { data, error } = await window.supabaseService.client
          .from("arena_questions")
          .insert([{
            grade_level: formatted.grade,
            topic: formatted.topic,
            question: formatted.question,
            options: formatted.options,
            correct_index: formatted.correctIndex,
            explanation: formatted.explanation,
            difficulty: formatted.difficulty,
            time_limit_seconds: formatted.timeLimit,
            stars_reward: formatted.stars,
            created_by: formatted.createdBy,
            created_at: formatted.createdAt
          }])
          .select();

        if (!error && data && data[0]) {
          formatted.id = data[0].id;
          db.arena_questions[0].id = data[0].id;
          localStorage.setItem("app_mock_db", JSON.stringify(db));
          console.log("✅ Đã tạo câu hỏi Đấu Trường thành công trên Supabase Cloud với UUID:", data[0].id);
        }
      } catch (err) {
        console.warn("Lỗi tạo arena_questions lên Supabase (đã lưu an toàn Local):", err);
      }
    }

    return { success: true, question: formatted };
  }

  // 3. SỬA CÂU HỎI ĐẤU TRƯỜNG (UPDATE & SYNC TO SUPABASE)
  async updateQuestion(id, questionData) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
    if (!db.arena_questions) db.arena_questions = [];

    const index = db.arena_questions.findIndex(q => q.id === id);
    if (index >= 0) {
      db.arena_questions[index] = {
        ...db.arena_questions[index],
        grade: parseInt(questionData.grade) || db.arena_questions[index].grade,
        topic: questionData.topic || db.arena_questions[index].topic,
        question: questionData.question.trim(),
        options: questionData.options,
        correctIndex: parseInt(questionData.correctIndex),
        explanation: (questionData.explanation || "").trim(),
        difficulty: questionData.difficulty || "medium",
        timeLimit: parseInt(questionData.timeLimit) || 15,
        stars: parseInt(questionData.stars) || 20,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    // Đồng bộ lên Supabase Cloud
    if (window.supabaseService?.isReady()) {
      try {
        if (id.includes("-")) {
          // UUID của Supabase
          await window.supabaseService.client
            .from("arena_questions")
            .update({
              grade_level: parseInt(questionData.grade),
              topic: questionData.topic,
              question: questionData.question.trim(),
              options: questionData.options,
              correct_index: parseInt(questionData.correctIndex),
              explanation: (questionData.explanation || "").trim(),
              difficulty: questionData.difficulty,
              time_limit_seconds: parseInt(questionData.timeLimit),
              stars_reward: parseInt(questionData.stars),
              updated_at: new Date().toISOString()
            })
            .eq("id", id);
          console.log("✅ Đã cập nhật câu hỏi Đấu Trường trên Supabase Cloud!");
        } else {
          // Nếu câu hỏi ban đầu là ID local, chèn mới lên Supabase
          await this.createQuestion(questionData);
        }
      } catch (err) {
        console.warn("Lỗi cập nhật arena_questions trên Supabase:", err);
      }
    }

    return { success: true };
  }

  // 4. XÓA CÂU HỎI ĐẤU TRƯỜNG (DELETE & SYNC TO SUPABASE)
  async deleteQuestion(id) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
    if (db.arena_questions) {
      db.arena_questions = db.arena_questions.filter(q => q.id !== id);
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }

    // Đồng bộ xóa trên Supabase
    if (window.supabaseService?.isReady() && id.includes("-")) {
      try {
        await window.supabaseService.client.from("arena_questions").delete().eq("id", id);
        console.log("✅ Đã xóa câu hỏi Đấu Trường trên Supabase Cloud!");
      } catch (err) {
        console.warn("Lỗi xóa arena_questions trên Supabase:", err);
      }
    }

    return { success: true };
  }

  // 5. LƯU KẾT QUẢ TRẬN THI ĐẤU (RECORD MATCH & SYNC LEADERBOARD)
  async recordMatchResult(matchData) {
    const user = window.authService?.getUser() || { name: "Nguyễn Văn An", className: "3A" };
    const {
      score = 100,
      totalCorrect = 5,
      totalQuestions = 5,
      starsEarned = 50,
      durationSeconds = 25,
      mode = "blitz_battle",
      grade = 3
    } = matchData;

    const matchObj = {
      id: "match_" + Date.now(),
      studentName: user.name || "Nguyễn Văn An",
      studentClass: user.className || "3A",
      grade: parseInt(grade) || 3,
      score,
      totalCorrect,
      totalQuestions,
      starsEarned,
      durationSeconds,
      mode,
      createdAt: new Date().toISOString()
    };

    // 1. Lưu Local Storage
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
    if (!db.arena_matches) db.arena_matches = [];
    db.arena_matches.unshift(matchObj);
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // Thưởng sao cho học sinh
    if (starsEarned > 0 && window.supabaseService?.awardStarsDirectly) {
      await window.supabaseService.awardStarsDirectly(
        matchObj.studentName,
        starsEarned,
        `Chiến thắng Đấu Trường Tin Học (${totalCorrect}/${totalQuestions} câu đúng)`
      );
    }

    // 2. Đồng bộ lên Supabase Cloud
    if (window.supabaseService?.isReady()) {
      try {
        await window.supabaseService.client.from("arena_matches").insert([{
          student_name: matchObj.studentName,
          student_class: matchObj.studentClass,
          grade_level: matchObj.grade,
          score: matchObj.score,
          stars_earned: matchObj.starsEarned,
          total_correct: matchObj.totalCorrect,
          total_questions: matchObj.totalQuestions,
          duration_seconds: matchObj.durationSeconds,
          created_at: matchObj.createdAt
        }]);

        await window.supabaseService.client.from("student_progress").insert([{
          student_name: matchObj.studentName,
          game_id: "game_arena_battle",
          score: Math.round(matchObj.score),
          stars_earned: matchObj.starsEarned,
          completed_at: new Date().toISOString()
        }]);
      } catch (err) {
        console.warn("Lỗi lưu arena_matches lên Supabase:", err);
      }
    }

    return { success: true, match: matchObj };
  }

  // 6. LẤY BẢNG XẾP HẠNG HỌC SINH TOÀN DIỆN (CÁ NHÂN)
  async getStudentLeaderboard(gradeFilter = "all", classFilter = "all") {
    let matches = [];
    if (window.supabaseService?.isReady()) {
      try {
        let query = window.supabaseService.client
          .from("arena_matches")
          .select("*")
          .order("created_at", { ascending: false });
        if (gradeFilter !== "all") query = query.eq("grade_level", parseInt(gradeFilter));
        if (classFilter !== "all") query = query.eq("student_class", classFilter);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          matches = data.map(d => ({
            id: d.id,
            studentName: d.student_name,
            studentClass: d.student_class || "3A",
            grade: d.grade_level,
            score: Number(d.score),
            starsEarned: d.stars_earned,
            totalCorrect: d.total_correct,
            totalQuestions: d.total_questions,
            durationSeconds: d.duration_seconds,
            createdAt: d.created_at
          }));
        }
      } catch (e) {}
    }

    if (matches.length === 0) {
      const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
      matches = db.arena_matches || [
        { studentName: "Trần Đức Nam", studentClass: "5A", grade: 5, score: 100, starsEarned: 150, durationSeconds: 18, totalCorrect: 5, totalQuestions: 5 },
        { studentName: "Nguyễn Văn An", studentClass: "3A", grade: 3, score: 100, starsEarned: 140, durationSeconds: 22, totalCorrect: 5, totalQuestions: 5 },
        { studentName: "Lê Thị Mai", studentClass: "4B", grade: 4, score: 95, starsEarned: 120, durationSeconds: 25, totalCorrect: 4, totalQuestions: 5 },
        { studentName: "Phạm Hoàng Bách", studentClass: "3B", grade: 3, score: 85, starsEarned: 95, durationSeconds: 28, totalCorrect: 4, totalQuestions: 5 },
        { studentName: "Vũ Bảo Châu", studentClass: "4A", grade: 4, score: 80, starsEarned: 85, durationSeconds: 30, totalCorrect: 4, totalQuestions: 5 },
        { studentName: "Đỗ Tuấn Kiệt", studentClass: "5B", grade: 5, score: 80, starsEarned: 80, durationSeconds: 32, totalCorrect: 3, totalQuestions: 5 },
        { studentName: "Hoàng Gia Huy", studentClass: "3A", grade: 3, score: 75, starsEarned: 70, durationSeconds: 35, totalCorrect: 3, totalQuestions: 5 }
      ];

      if (gradeFilter !== "all") matches = matches.filter(m => m.grade === parseInt(gradeFilter));
      if (classFilter !== "all") matches = matches.filter(m => m.studentClass === classFilter);
    }

    // Nhóm theo tên học sinh để tính tổng tích lũy
    const studentMap = {};
    matches.forEach(m => {
      if (!studentMap[m.studentName]) {
        studentMap[m.studentName] = {
          studentName: m.studentName,
          studentClass: m.studentClass,
          grade: m.grade,
          matchesPlayed: 0,
          totalScore: 0,
          highestScore: 0,
          totalStars: 0,
          bestDuration: 999,
          perfectWins: 0
        };
      }
      const st = studentMap[m.studentName];
      st.matchesPlayed += 1;
      st.totalScore += m.score;
      if (m.score > st.highestScore) st.highestScore = m.score;
      st.totalStars += (m.starsEarned || 0);
      if (m.durationSeconds < st.bestDuration) st.bestDuration = m.durationSeconds;
      if (m.score >= 100) st.perfectWins += 1;
    });

    const list = Object.values(studentMap);
    list.sort((a, b) => (b.totalStars - a.totalStars) || (b.highestScore - a.highestScore) || (a.bestDuration - b.bestDuration));
    return list;
  }

  // 7. LẤY BẢNG XẾP HẠNG THI ĐUA TẬP THỂ LỚP (INTER-CLASS LEAGUE)
  async getClassLeaderboard(gradeFilter = "all") {
    const students = await this.getStudentLeaderboard(gradeFilter, "all");
    const classMap = {
      "5A": { className: "5A", grade: 5, teacher: "Cô Giáo Anh Đào", totalStars: 410, matches: 16, topStudent: "Trần Đức Nam", winRate: 98 },
      "4B": { className: "4B", grade: 4, teacher: "Cô Đặng Thị Lan", totalStars: 360, matches: 14, topStudent: "Lê Thị Mai", winRate: 95 },
      "3A": { className: "3A", grade: 3, teacher: "Cô Nguyễn Thu Trang", totalStars: 320, matches: 12, topStudent: "Nguyễn Văn An", winRate: 92 },
      "4A": { className: "4A", grade: 4, teacher: "Cô Phạm Thanh Mai", totalStars: 290, matches: 11, topStudent: "Vũ Bảo Châu", winRate: 88 },
      "5B": { className: "5B", grade: 5, teacher: "Thầy Hoàng Trọng Nghĩa", totalStars: 280, matches: 10, topStudent: "Đỗ Tuấn Kiệt", winRate: 84 },
      "3B": { className: "3B", grade: 3, teacher: "Thầy Lê Văn Hùng", totalStars: 245, matches: 10, topStudent: "Phạm Hoàng Bách", winRate: 85 }
    };

    // Tích lũy thêm điểm thực từ các trận đấu
    students.forEach(st => {
      const cls = st.studentClass || "3A";
      if (!classMap[cls]) {
        classMap[cls] = { className: cls, grade: st.grade || 3, teacher: "Giáo viên chủ nhiệm", totalStars: 0, matches: 0, topStudent: st.studentName, winRate: 80 };
      }
      classMap[cls].totalStars += st.totalStars;
      classMap[cls].matches += st.matchesPlayed;
    });

    let classList = Object.values(classMap);
    if (gradeFilter !== "all") {
      classList = classList.filter(c => c.grade === parseInt(gradeFilter));
    }
    classList.sort((a, b) => b.totalStars - a.totalStars);
    return classList;
  }

  // 8. KHÔI PHỤC NGÂN HÀNG CÂU HỎI MẪU CHUẨN GDPT 2018
  resetDefaultQuestions() {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
    db.arena_questions = this.initialQuestions;
    localStorage.setItem("app_mock_db", JSON.stringify(db));
    return this.initialQuestions;
  }
}

window.arenaService = new ArenaService();
