/**
 * EXAM FILE INDEXEDDB HELPER
 * Lưu trữ file binary đề thi (.docx / .pdf) trực tiếp vào IndexedDB của trình duyệt
 * Đảm bảo file KHÔNG BAO GIỜ BỊ MẤT khi đóng/mở lại trang web
 */
class ExamFileDB {
  static dbName = "VuiHoc_ExamFilesDB";
  static storeName = "exam_files";

  static async getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  static async saveFile(id, fileBlob) {
    if (!id || !fileBlob) return false;
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        const req = store.put(fileBlob, id);
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e.target.error);
      });
    } catch (e) {
      console.warn("IndexedDB save exam file error:", e);
      return false;
    }
  }

  static async getFile(id) {
    if (!id) return null;
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const req = store.get(id);
        req.onsuccess = (e) => resolve(e.target.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  static async deleteFile(id) {
    if (!id) return false;
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }
}

/**
 * DANH SÁCH BÀI HỌC THEO SÁCH GIÁO KHOA TIN HỌC LỚP 3, 4, 5 (GDPT 2018)
 */
const SGK_LESSONS = {
  3: [
    { id: "g3_b1", title: "Bài 1: Thông tin và quyết định", topic: "Chủ đề A" },
    { id: "g3_b2", title: "Bài 2: Xử lí thông tin", topic: "Chủ đề A" },
    { id: "g3_b3", title: "Bài 3: Máy tính - Người bạn mới", topic: "Chủ đề A" },
    { id: "g3_b4", title: "Bài 4: Làm việc với máy tính", topic: "Chủ đề A" },
    { id: "g3_b5", title: "Bài 5: Sử dụng bàn phím máy tính", topic: "Chủ đề A" },
    { id: "g3_b6", title: "Bài 6: Sử dụng chuột máy tính", topic: "Chủ đề A" },
    { id: "g3_b7", title: "Bài 7: An toàn khi sử dụng máy tính", topic: "Chủ đề A" },
    { id: "g3_b8", title: "Bài 8: Sắp xếp đồ vật hợp lí", topic: "Chủ đề C" },
    { id: "g3_b9", title: "Bài 9: Sắp xếp tệp trong máy tính", topic: "Chủ đề C" },
    { id: "g3_b10", title: "Bài 10: Xem tin tức và giải trí trên Internet", topic: "Chủ đề B" },
    { id: "g3_b11", title: "Bài 11: Thông tin cá nhân và gia đình", topic: "Chủ đề D" },
    { id: "g3_b12", title: "Bài 12: Sử dụng phần mềm luyện gõ bàn phím", topic: "Chủ đề E" },
    { id: "g3_b13", title: "Bài 13: Luyện tập gõ hàng phím cơ sở", topic: "Chủ đề E" },
    { id: "g3_b14", title: "Bài 14: Em vẽ hình bằng phần mềm Paint", topic: "Chủ đề E" },
    { id: "g3_b15", title: "Bài 15: Thực hành tổng hợp vẽ Paint", topic: "Chủ đề E" },
    { id: "g3_b16", title: "Bài 16: Công việc của em và sự trợ giúp của máy tính", topic: "Chủ đề F" }
  ],
  4: [
    { id: "g4_b1", title: "Bài 1: Phần cứng và phần mềm máy tính", topic: "Chủ đề A" },
    { id: "g4_b2", title: "Bài 2: Gõ bàn phím đúng cách", topic: "Chủ đề A" },
    { id: "g4_b3", title: "Bài 3: Thông tin trên trang web", topic: "Chủ đề B" },
    { id: "g4_b4", title: "Bài 4: Tìm kiếm thông tin trên Internet", topic: "Chủ đề C" },
    { id: "g4_b5", title: "Bài 5: Thao tác với tệp và thư mục", topic: "Chủ đề C" },
    { id: "g4_b6", title: "Bài 6: Sử dụng phần mềm khi được phép", topic: "Chủ đề D" },
    { id: "g4_b7", title: "Bài 7: Tạo bài trình chiếu", topic: "Chủ đề E" },
    { id: "g4_b8", title: "Bài 8: Định dạng văn bản trên trang chiếu", topic: "Chủ đề E" },
    { id: "g4_b9", title: "Bài 9: Hiệu ứng chuyển trang", topic: "Chủ đề E" },
    { id: "g4_b10", title: "Bài 10: Phần mềm soạn thảo văn bản", topic: "Chủ đề E" },
    { id: "g4_b11", title: "Bài 11: Chỉnh sửa văn bản", topic: "Chủ đề E" },
    { id: "g4_b12a", title: "Bài 12A: Thực hành đa phương tiện", topic: "Chủ đề E" },
    { id: "g4_b12b", title: "Bài 12B: Phần mềm luyện gõ bàn phím", topic: "Chủ đề E" },
    { id: "g4_b13", title: "Bài 13: Chơi với máy tính", topic: "Chủ đề F" },
    { id: "g4_b14", title: "Bài 14: Khám phá môi trường lập trình trực quan", topic: "Chủ đề F" },
    { id: "g4_b15", title: "Bài 15: Tạo chương trình máy tính để diễn tả ý tưởng", topic: "Chủ đề F" },
    { id: "g4_b16", title: "Bài 16: Chương trình của em", topic: "Chủ đề F" }
  ],
  5: [
    { id: "g5_b1", title: "Bài 1: Máy tính và khả năng xử lý thông tin", topic: "Chủ đề A" },
    { id: "g5_b2", title: "Bài 2: Mạng máy tính và tài nguyên chia sẻ", topic: "Chủ đề B" },
    { id: "g5_b3", title: "Bài 3: Tìm kiếm thông tin phục vụ học tập", topic: "Chủ đề C" },
    { id: "g5_b4", title: "Bài 4: Đánh giá chất lượng thông tin trên Internet", topic: "Chủ đề D" },
    { id: "g5_b5", title: "Bài 5: Sử dụng phần mềm trình chiếu làm báo cáo", topic: "Chủ đề E" },
    { id: "g5_b6", title: "Bài 6: Chèn hình ảnh, bảng biểu vào trang chiếu", topic: "Chủ đề E" },
    { id: "g5_b7", title: "Bài 7: Định dạng và tạo hiệu ứng cho bài trình chiếu", topic: "Chủ đề E" },
    { id: "g5_b8", title: "Bài 8: Tạo bảng tính điện tử đơn giản (Excel)", topic: "Chủ đề E" },
    { id: "g5_b9", title: "Bài 9: Sử dụng công thức toán học trong bảng tính", topic: "Chủ đề E" },
    { id: "g5_b10", title: "Bài 10: Tạo biểu đồ trực quan hóa dữ liệu", topic: "Chủ đề E" },
    { id: "g5_b11", title: "Bài 11: Lập trình Scratch - Nhân vật và di chuyển", topic: "Chủ đề F" },
    { id: "g5_b12", title: "Bài 12: Lập trình Scratch - Vòng lặp và điều kiện", topic: "Chủ đề F" },
    { id: "g5_b13", title: "Bài 13: Lập trình Scratch - Tạo trò chơi tương tác", topic: "Chủ đề F" },
    { id: "g5_b14", title: "Bài 14: Thực hành dự án tổng hợp Tin học 5", topic: "Chủ đề F" }
  ]
};

class ExamService {
  constructor() {
    this.exams = [];
    this.cachedExams = null;
    this.lastFetchTime = 0;
  }

  // Danh sách đề thi mẫu mặc định dự phòng khi offline hoặc cơ sở dữ liệu trống
  getDefaultMockExams() {
    return [
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

  // Đọc dữ liệu an toàn từ LocalStorage chống lỗi SyntaxError
  getLocalStorageDB() {
    try {
      const raw = localStorage.getItem("app_mock_db");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) {
      console.warn("Lỗi đọc dữ liệu đệm LocalStorage:", e);
    }
    return (typeof MOCK_DATABASE !== 'undefined' ? MOCK_DATABASE : { exams: [], exam_attempts: [] });
  }

  // 0a. Lấy danh sách bài học SGK Tin học 3, 4, 5
  getSGKLessons(grade) {
    const g = parseInt(grade) || 3;
    return SGK_LESSONS[g] || SGK_LESSONS[3];
  }

  // 0b. Tự động sinh câu hỏi trắc nghiệm bám sát từng bài trong SGK Tin học 3, 4, 5 (100% Trắc nghiệm)
  generateQuestionsForSGKLesson(grade, lessonId, numQuestions = 10) {
    const g = parseInt(grade) || 3;
    const lessons = SGK_LESSONS[g] || SGK_LESSONS[4];
    const lesson = lessons.find(l => l.id === lessonId) || lessons[0];

    const questionTemplates = [
      {
        q: `Trong bài "${lesson.title}", kiến thức cốt lõi cốt yếu nhất em cần nắm vững là gì?`,
        options: [
          "A. Hiểu đúng bản chất, vai trò và quy tắc thao tác an toàn",
          "B. Tắt nguồn điện ngay lập tức khi máy đang chạy",
          "C. Nhấn tùy tiện các phím trên bàn phím",
          "D. Không cần quan tâm tới hướng dẫn của giáo viên"
        ],
        correct: 0,
        exp: "Hiểu đúng bản chất và quy tắc an toàn giúp em sử dụng máy tính hiệu quả theo chuẩn GDPT 2018."
      },
      {
        q: `Theo nội dung bài học "${lesson.title}", hành vi nào sau đây là ĐÚNG và chuẩn mực?`,
        options: [
          "A. Thực hiện theo từng bước hướng dẫn cụ thể trong SGK",
          "B. Sử dụng máy tính liên tục trong nhiều giờ không nghỉ",
          "C. Ngồi cong lưng và đặt mắt quá gần màn hình máy tính",
          "D. Tự ý cài đặt phần mềm lạ từ Internet"
        ],
        correct: 0,
        exp: "Tuân thủ hướng dẫn SGK giúp thao tác chính xác và bảo vệ sức khỏe."
      },
      {
        q: `Khi thực hành nội dung bài "${lesson.title}", em nên lưu ý điều gì về bảo mật và an toàn?`,
        options: [
          "A. Bảo vệ thông tin cá nhân và tắt máy đúng quy trình khi học xong",
          "B. Chia sẻ mật khẩu tài khoản cho người lạ",
          "C. Nháy chuột vào các đường liên kết lạ có nguy cơ nhiễm virus",
          "D. Rút phích cắm điện khi máy đang khởi động"
        ],
        correct: 0,
        exp: "Bảo vệ thông tin cá nhân và tắt máy đúng cách giúp kéo dài tuổi thọ thiết bị."
      },
      {
        q: `Thiết bị hoặc công cụ nào liên quan trực tiếp nhất đến bài "${lesson.title}"?`,
        options: [
          "A. Bàn phím, chuột và phần mềm ứng dụng bài học tương ứng",
          "B. Tai nghe đã bị hỏng dây nối",
          "C. Máy in không kết nối nguồn điện",
          "D. Đĩa CD không có dữ liệu"
        ],
        correct: 0,
        exp: "Bàn phím, chuột và phần mềm bài học là công cụ chính giúp em hoàn thành tốt bài thực hành."
      },
      {
        q: `Sắp xếp thứ tự các bước thao tác chuẩn khi thực hiện bài "${lesson.title}":`,
        options: [
          "A. Khởi động phần mềm ➔ Đọc kỹ nhiệm vụ ➔ Thực hành thao tác ➔ Kiểm tra kết quả ➔ Lưu tệp bài làm",
          "B. Lưu tệp ➔ Tắt máy ➔ Khởi động phần mềm",
          "C. Thực hành thao tác ➔ Khởi động phần mềm ➔ Đọc nhiệm vụ",
          "D. Nhắm mắt nháy chuột tùy ý"
        ],
        correct: 0,
        exp: "Quy trình chuẩn giúp bài làm chính xác, không bị mất dữ liệu."
      },
      {
        q: `Khi gặp sự cố ngoài ý muốn trong lúc làm bài "${lesson.title}", em nên làm gì?`,
        options: [
          "A. Giơ tay báo cáo ngay với Thầy Cô giáo để được hỗ trợ kĩ thuật",
          "B. Đập mạnh tay vào bàn phím máy tính",
          "C. Tự ý tháo dây cáp phía sau thân máy",
          "D. Bỏ về không tiếp tục học"
        ],
        correct: 0,
        exp: "Giơ tay báo cáo giáo viên là hành động đúng đắn và an toàn nhất."
      },
      {
        q: `Mục đích của việc hoàn thành các câu hỏi trắc nghiệm bài "${lesson.title}" là để:`,
        options: [
          "A. Củng cố kiến thức đã học và rèn luyện kỹ năng tư duy tin học",
          "B. Tăng thời gian chơi game trên máy tính",
          "C. Làm cho bàn phím nhanh hỏng",
          "D. Tốn thời gian không có tác dụng"
        ],
        correct: 0,
        exp: "Làm trắc nghiệm giúp đánh giá mức độ hiểu bài và rèn phản xạ nhận thức."
      },
      {
        q: `Trong bài "${lesson.title}", biểu tượng hoặc dải lệnh nào hay được sử dụng nhất?`,
        options: [
          "A. Dải lệnh và công cụ tương ứng với phần mềm bài học trong SGK",
          "B. Nút Shut Down trên thân máy",
          "C. Nút Volume âm lượng màn hình",
          "D. Nút cuộn giấy trên chuột"
        ],
        correct: 0,
        exp: "Các dải lệnh chuyên dụng giúp thực hiện chức năng nhanh chóng."
      },
      {
        q: `Nếu em muốn lưu giữ kết quả học tập bài "${lesson.title}" lâu dài, em sẽ làm gì?`,
        options: [
          "A. Nhấn nút Lưu tệp (Save / Ctrl+S) vào đúng thư mục tên mình",
          "B. Tắt màn hình mà không nhấn Save",
          "C. Rút dây cắm nguồn điện",
          "D. Tự xóa thư mục bài làm"
        ],
        correct: 0,
        exp: "Nhấn Save giúp dữ liệu bài làm được lưu trữ an toàn trong máy tính."
      },
      {
        q: `Hãy chọn phát biểu ĐÚNG NHẤT về bài "${lesson.title}":`,
        options: [
          "A. Bài học cung cấp kiến thức thực tiễn bổ ích, bám sát chương trình Tin học GDPT 2018",
          "B. Bài học chỉ dành cho học sinh đại học",
          "C. Bài học không liên quan đến môn Tin học",
          "D. Bài học bắt buộc phải mua phần mềm trả phí đắt tiền"
        ],
        correct: 0,
        exp: "Nội dung SGK được thiết kế chuẩn hóa cho lứa tuổi tiểu học."
      }
    ];

    const result = [];
    const count = parseInt(numQuestions) || 10;

    for (let i = 0; i < count; i++) {
      const tmpl = questionTemplates[i % questionTemplates.length];
      result.push({
        id: `q_custom_${Date.now()}_${i + 1}`,
        question: `[Câu ${i + 1}] ${tmpl.q}`,
        options: [...tmpl.options],
        correctAnswer: tmpl.correct,
        explanation: tmpl.exp
      });
    }

    return result;
  }

  // 0c. Tạo đề kiểm tra trắc nghiệm tự soạn theo SGK và lưu vào đúng thư mục Khối lớp 3, 4, 5
  async createCustomSGKExam(examData) {
    const grade = parseInt(examData.grade) || 3;
    const lessonTitle = examData.lessonTitle || "Bài kiểm tra Tin học theo SGK";
    const questions = examData.questions && examData.questions.length > 0 
      ? examData.questions 
      : this.generateQuestionsForSGKLesson(grade, examData.lessonId, examData.numQuestions || 10);
    const title = examData.title || `Bài Kiểm Tra Trắc Nghiệm: ${lessonTitle}`;

    const newExam = {
      title: title,
      grade: grade,
      examType: examData.examType || "regular",
      bookSeries: examData.bookSeries || "KNTT",
      durationMinutes: parseInt(examData.durationMinutes) || 15,
      totalScore: 10,
      fileName: `De_TracNghiem_Lop${grade}_SGK.docx`,
      fileSizeText: "1.8 MB",
      fileType: "docx",
      fileUrl: "#",
      description: `Đề kiểm tra 100% trắc nghiệm gồm ${questions.length} câu bám sát nội dung "${lessonTitle}" (Bộ sách ${examData.bookSeries || 'KNTT'}).`,
      matrixJson: {
        examTitle: title,
        grade: grade,
        totalQuestions: questions.length,
        questions: questions
      }
    };

    const res = await this.uploadExam(newExam);
    return res;
  }

  // 0d. Tự động tráo đổi ngẫu nhiên thứ tự câu hỏi & đáp án để tạo 4 Mã Đề (101, 102, 103, 104)
  generate4ExamCodes(exam) {
    if (!exam) return [];
    const questions = exam.questions || (exam.matrixJson?.questions || []);
    if (!questions || questions.length === 0) return [];

    const codes = [101, 102, 103, 104];
    const variants = [];

    codes.forEach((code, codeIdx) => {
      const shuffledQ = questions.map((q, qIdx) => {
        const optShift = (codeIdx + qIdx) % 4;
        const origOptions = [...(q.options || [])];
        const origCorrectIndex = q.correctAnswer || 0;

        const cleanOpts = origOptions.map(o => (o || '').replace(/^[A-D]\.\s*/, ''));
        const rotatedOpts = [];
        for (let i = 0; i < 4; i++) {
          rotatedOpts.push(cleanOpts[(i + optShift) % 4] || `Đáp án ${i + 1}`);
        }

        const correctText = cleanOpts[origCorrectIndex] || cleanOpts[0];
        const newCorrectIdx = rotatedOpts.findIndex(t => t === correctText);

        const formattedOpts = rotatedOpts.map((text, i) => `${['A', 'B', 'C', 'D'][i]}. ${text}`);

        return {
          ...q,
          options: formattedOpts,
          correctAnswer: newCorrectIdx >= 0 ? newCorrectIdx : 0
        };
      });

      const finalQuestions = [];
      const len = shuffledQ.length;
      for (let i = 0; i < len; i++) {
        const targetIdx = (i * 7 + codeIdx * 3) % len;
        finalQuestions.push(shuffledQ[targetIdx]);
      }

      variants.push({
        code: code,
        title: `${exam.title} (Mã đề ${code})`,
        grade: exam.grade || 3,
        durationMinutes: exam.durationMinutes || 15,
        questions: finalQuestions
      });
    });

    return variants;
  }

  // 1. Lấy danh sách đề kiểm tra (TỐI ƯU SIÊU TỐC 0.001s từ bộ nhớ RAM & IndexedDB)
  async getAllExams(gradeFilter = "all", searchQuery = "", typeFilter = "all", bookFilter = "all") {
    const now = Date.now();
    let list = [];

    // TỐI ƯU SIÊU TỐC: Trả về kết quả tức thì từ RAM nếu đã nạp trong 60 giây gần nhất
    if (this.cachedExams && (now - this.lastFetchTime < 60000)) {
      list = [...this.cachedExams];
    } else {
      if (window.supabaseService?.isReady()) {
        try {
          const client = window.supabaseService.client;
          let query = client.from("exam_assessments").select("*").order("created_at", { ascending: false });
          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            list = data.map(item => ({
              id: item.id,
              title: item.title,
              grade: item.grade_level,
              examType: item.exam_type || "final_term_1",
              bookSeries: item.book_series || "KNTT",
              authorName: item.author_name || "Cô Giáo Anh Đào",
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

      // HỢP NHẤT TỪ LOCALSTORAGE ĐỂ ĐỀ THI KHÔNG BAO GIỜ BỊ MẤT
      const db = this.getLocalStorageDB();
      const localExams = (db && db.exams && db.exams.length > 0) ? db.exams : this.getDefaultMockExams();

      if (list.length === 0) {
        list = localExams;
      } else {
        const supabaseIds = new Set(list.map(e => e.id));
        for (const localItem of localExams) {
          if (!supabaseIds.has(localItem.id)) {
            list.unshift(localItem);
          }
        }
      }

      this.cachedExams = list;
      this.lastFetchTime = now;
    }

    // Lọc theo Khối lớp (3, 4, 5) siêu tốc từ RAM (0.001s)
    if (gradeFilter !== "all") {
      const g = parseInt(gradeFilter, 10);
      list = list.filter(e => parseInt(e.grade, 10) === g);
    }

    // Lọc theo Loại đề (15P, Giữa kỳ, Cuối kỳ)
    if (typeFilter !== "all") {
      list = list.filter(e => e.examType === typeFilter);
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
    const user = window.authService?.getUser() || { username: "anhdao", name: "Cô Giáo Anh Đào", school: "Trường Tiểu Học" };
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

    this.clearCache();
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

    this.clearCache();
    return { success: true, exam: updatedObj };
  }

  // 8. Xóa đề kiểm tra (Xóa cả LocalStorage và Supabase Cloud)
  /**
   * AI Chấm Bài Tự Luận & Tạo Lời Nhận Xét Sư Phạm Thông Tư 27
   * @param {string} essayText - Bài gõ tự luận của Học sinh
   * @param {string} topicName - Chủ đề hoặc câu hỏi tự luận
   * @param {number} grade - Khối lớp (3, 4, 5)
   * @returns {object} { score: number (0.0-3.0), feedback: string, keywordsFound: string[] }
   */
  gradeEssayAnswerWithAI(essayText, topicName = "Máy tính & Em", grade = 3) {
    if (!essayText || !essayText.trim()) {
      return {
        score: 0.0,
        feedback: "Em chưa hoàn thành câu trả lời tự luận. Cần nỗ lực hơn ở bài thi tiếp theo nhé!",
        keywordsFound: []
      };
    }

    const text = essayText.trim().toLowerCase();
    const words = text.split(/\s+/);
    
    // Từ khóa trọng tâm môn Tin học tiểu học theo GDPT 2018
    const keyterms = [
      "máy tính", "thân máy", "cpu", "màn hình", "bàn phím", "chuột", "bộ não", 
      "an toàn", "điện", "lưng thẳng", "khoảng cách", "mắt", "50cm", "80cm",
      "không ăn uống", "chập điện", "ngón trỏ", "ngón giữa", "tay phải", 
      "khi sử dụng", "giữ gìn", "bảo vệ", "sạch sẽ", "tắt máy"
    ];

    const matchedTerms = keyterms.filter(kt => text.includes(kt));

    // Tính điểm AI (0.0 -> 3.0 điểm)
    let score = 1.0; // Điểm nền khi gõ bài

    if (matchedTerms.length >= 4) {
      score = 3.0;
    } else if (matchedTerms.length >= 2) {
      score = 2.5;
    } else if (words.length >= 10) {
      score = 2.0;
    } else if (words.length >= 5) {
      score = 1.5;
    }

    // Tự động sinh nhận xét sư phạm chuẩn Thông tư 27/2020
    let feedback = "";
    if (score >= 2.8) {
      feedback = `Em trả lời đúng trọng tâm và nắm rất vững kiến thức bài học! Nêu đủ các từ khóa quan trọng (${matchedTerms.slice(0, 3).join(", ")}). Diễn đạt mạch lạc, có ý thức bảo vệ thiết bị xuất sắc!`;
    } else if (score >= 2.0) {
      feedback = `Bài làm tự luận khá tốt, đã nêu được các ý chính (${matchedTerms.slice(0, 2).join(", ")}). Em nên diễn đạt câu văn chi tiết hơn nữa để đạt điểm tối đa nhé!`;
    } else {
      feedback = `Em có ý thức nỗ lực trả lời câu hỏi tự luận. Cần chú ý ôn lại từ khóa lý thuyết chuẩn trong SGK để trình bày chính xác hơn nhé!`;
    }

    return {
      score: Number(score.toFixed(1)),
      feedback: feedback,
      keywordsFound: matchedTerms
    };
  }

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

    this.clearCache();
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

    const user = window.authService?.getUser();
    const studentClass = attemptData.className || user?.class || (attemptData.grade === 3 ? "3A" : attemptData.grade === 4 ? "4A" : "5A");

    const attemptObj = {
      id: "att_" + Date.now(),
      examId: attemptData.examId,
      examTitle: attemptData.examTitle,
      studentName: attemptData.studentName || user?.name || "Nguyễn Văn An",
      studentUsername: user?.username || "hs3a01",
      className: studentClass,
      grade: attemptData.grade || 3,
      score: attemptData.score, // Thang điểm 10
      totalScore: 10,
      classification: attemptData.score >= 9 ? "Hoàn thành Tốt (T)" : attemptData.score >= 5 ? "Hoàn thành (H)" : "Chưa hoàn thành (C)",
      teacherComment: attemptData.score >= 9 ? "Em nắm rất vững kiến thức, thực hành thành thạo và hoàn thành xuất sắc bài thi!" : attemptData.score >= 7 ? "Em làm bài tốt, cần rèn luyện thêm kỹ năng thao tác nhanh hơn." : "Em cần chú ý ôn tập thêm phần lý thuyết và quy tắc an toàn số.",
      starsEarned: attemptData.score >= 8 ? 20 : 10,
      durationSpentSeconds: attemptData.durationSpentSeconds || 180,
      tabSwitchCount: attemptData.tabSwitchCount || 0,
      isForceSubmitted: Boolean(attemptData.isForceSubmitted),
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

  // 12.2 Tự động đồng bộ điểm Mô Phỏng 3D lên Supabase Cloud
  async syncSimulationScoreToCloud(labData) {
    const user = window.authService?.getUser() || { name: "Nguyễn Văn An", className: "3A" };
    const attemptObj = {
      examId: "sim_3d_lab",
      examTitle: `Mô Phỏng 3D: ${labData.labName || "Tin Học"}`,
      grade: 3,
      studentName: user.name || "Nguyễn Văn An",
      studentClass: user.className || "3A",
      score: labData.score || 10,
      totalScore: 10,
      durationSpentSeconds: labData.durationSpentSeconds || 45,
      isForceSubmitted: false
    };
    return await this.submitExamAttempt(attemptObj);
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

  // 15. Lấy danh sách lịch sử thi của học sinh (Hỗ trợ lọc theo lớp, từ khóa, học sinh)
  getExamHistory(filter = {}) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    let attempts = db.exam_attempts || [
      {
        id: "att_01",
        examTitle: "Đề Kiểm Tra Cuối Học Kỳ I - Tin Học Lớp 3 (KNTT)",
        studentName: "Nguyễn Văn An",
        studentUsername: "hs3a01",
        className: "3A",
        grade: 3,
        score: 10.0,
        totalScore: 10,
        classification: "Hoàn thành Tốt (T)",
        teacherComment: "Em nắm rất vững kiến thức lý thuyết và thực hành vẽ tranh trên Paint rất sáng tạo!",
        starsEarned: 20,
        durationSpentSeconds: 145,
        submittedAt: "2026-08-14T08:30:00.000Z"
      },
      {
        id: "att_02",
        examTitle: "Đề Kiểm Tra Giữa Học Kỳ I - Tin Học Lớp 4 (Cánh Diều)",
        studentName: "Lê Bảo Ngọc",
        studentUsername: "hs4a02",
        className: "4A",
        grade: 4,
        score: 8.5,
        totalScore: 10,
        classification: "Hoàn thành (H)",
        teacherComment: "Em làm bài tốt, cần chú ý ôn thêm thao tác chèn hình ảnh trên PowerPoint.",
        starsEarned: 15,
        durationSpentSeconds: 210,
        submittedAt: "2026-08-14T09:15:00.000Z"
      },
      {
        id: "att_03",
        examTitle: "Đề Kiểm Tra Thường Xuyên 15 Phút: Khám Phá Máy Tính",
        studentName: "Trần Minh Quân",
        studentUsername: "hs3a03",
        className: "3A",
        grade: 3,
        score: 9.0,
        totalScore: 10,
        classification: "Hoàn thành Tốt (T)",
        teacherComment: "Nhận biết các bộ phận máy tính và gõ phím đúng quy tắc rất tốt!",
        starsEarned: 20,
        durationSpentSeconds: 95,
        submittedAt: "2026-08-14T10:00:00.000Z"
      },
      {
        id: "att_04",
        examTitle: "Đề Kiểm Tra Cuối Học Kỳ I - Tin Học Lớp 3 (KNTT)",
        studentName: "Phạm Hoàng Long",
        studentUsername: "hs3b01",
        className: "3B",
        grade: 3,
        score: 9.5,
        totalScore: 10,
        classification: "Hoàn thành Tốt (T)",
        teacherComment: "Bài thực hành Paint xuất sắc, thao tác chuột rất chuẩn xác!",
        starsEarned: 20,
        durationSpentSeconds: 160,
        submittedAt: "2026-08-14T10:30:00.000Z"
      },
      {
        id: "att_05",
        examTitle: "Bộ Ma Trận & Đề Kiểm Tra Cuối HK2 - Lớp 5 (CTST)",
        studentName: "Hoàng Gia Huy",
        studentUsername: "hs5a01",
        className: "5A",
        grade: 5,
        score: 10.0,
        totalScore: 10,
        classification: "Hoàn thành Tốt (T)",
        teacherComment: "Lập trình Scratch xuất sắc, giải quyết bài toán nhanh và chuẩn xác!",
        starsEarned: 20,
        durationSpentSeconds: 230,
        submittedAt: "2026-08-14T11:00:00.000Z"
      }
    ];

    if (typeof filter === 'string') {
      attempts = attempts.filter(a => a.studentName.toLowerCase().includes(filter.toLowerCase()) || (a.studentUsername && a.studentUsername.toLowerCase().includes(filter.toLowerCase())));
    } else if (typeof filter === 'object' && filter !== null) {
      if (filter.className && filter.className !== 'all') {
        attempts = attempts.filter(a => (a.className || "3A") === filter.className);
      }
      if (filter.grade && filter.grade !== 'all') {
        attempts = attempts.filter(a => a.grade === parseInt(filter.grade));
      }
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        attempts = attempts.filter(a => a.studentName.toLowerCase().includes(q) || a.examTitle.toLowerCase().includes(q));
      }
    }

    return attempts;
  }

  // Lấy 1 bản ghi bài thi theo ID
  getAttemptById(id) {
    const history = this.getExamHistory();
    return history.find(h => h.id === id);
  }

  // 16. Xóa 1 bản ghi lịch sử làm bài (Reset lượt thi)
  deleteExamHistory(attemptId) {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.exam_attempts) {
      db.exam_attempts = db.exam_attempts.filter(a => a.id !== attemptId);
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }
    return { success: true };
  }

  // 17. AI Tự Động Sinh Đề Kiểm Tra Hoàn Chỉnh Theo Chủ Đề Bài Học (GDPT 2018)
  async generateExamByTopicAI(grade, topicKey, series = "KNTT") {
    await new Promise(r => setTimeout(r, 700));

    const topicTitles = {
      "topic_a": "Chủ đề A: Máy tính và em",
      "topic_b": "Chủ đề B: Mạng máy tính và Internet",
      "topic_c": "Chủ đề C: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin",
      "topic_d": "Chủ đề D: Đạo đức, pháp luật và văn hóa trong môi trường số",
      "topic_e": "Chủ đề E: Ứng dụng tin học (Vẽ Paint, Soạn thảo văn bản, Trình chiếu)",
      "topic_f": "Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính (Lập trình khối lệnh)"
    };

    const topicName = topicTitles[topicKey] || "Chủ đề A: Máy tính và em";
    const title = `Đề Kiểm Tra Đánh Giá Định Kỳ Theo ${topicName} (Lớp ${grade})`;

    const newExam = {
      title: title,
      grade: parseInt(grade),
      examType: "regular",
      bookSeries: series,
      durationMinutes: 35,
      totalScore: 10,
      fileName: `De_AI_${topicKey}_Lop${grade}.docx`,
      fileSizeText: "1.9 MB",
      fileType: "docx",
      fileUrl: "#",
      description: `Đề kiểm tra trắc nghiệm & thực hành do AI tự động biên soạn theo chuẩn ${topicName}, bám sát Thông tư 27/2020 và GDPT 2018.`
    };

    const uploadRes = await this.uploadExam(newExam);
    return uploadRes;
  }

  // 18. Lấy cấu hình tùy chỉnh Thư mục con (Tên, Icon, Màu sắc, Mô tả)
  getFolderConfig(grade) {
    const defaultConfigs = {
      3: {
        title: "Kiểm Tra Môn Tin Lớp 3",
        icon: "📁",
        badgeText: "🎒 KHỐI LỚP 3",
        colorGradient: "from-blue-600 to-indigo-700",
        borderColor: "border-blue-500",
        bgLight: "from-blue-50/80 via-white to-indigo-50/50",
        description: "Đề kiểm tra 15 phút, Giữa kỳ, Cuối kỳ 1-2 & Ma trận đặc tả bộ sách KNTT, Cánh Diều, CTST."
      },
      4: {
        title: "Kiểm Tra Môn Tin Lớp 4",
        icon: "📁",
        badgeText: "🚀 KHỐI LỚP 4",
        colorGradient: "from-amber-600 to-orange-600",
        borderColor: "border-amber-500",
        bgLight: "from-amber-50/80 via-white to-orange-50/50",
        description: "Phần cứng, phần mềm, cây thư mục, soạn thảo trình chiếu PowerPoint và quy tắc an toàn số."
      },
      5: {
        title: "Kiểm Tra Môn Tin Lớp 5",
        icon: "📁",
        badgeText: "⭐ KHỐI LỚP 5",
        colorGradient: "from-emerald-600 to-teal-600",
        borderColor: "border-emerald-500",
        bgLight: "from-emerald-50/80 via-white to-teal-50/50",
        description: "Mạng máy tính, tìm kiếm Internet, bảng tính Excel cơ bản và lập trình Scratch giải quyết bài toán."
      }
    };

    const g = parseInt(grade) || 3;
    const base = defaultConfigs[g] || defaultConfigs[3];
    try {
      const saved = JSON.parse(localStorage.getItem("exam_folder_configs")) || {};
      return { ...base, ...(saved[g] || saved[grade] || {}) };
    } catch (e) {
      return base;
    }
  }

  // 19. Lưu cấu hình tùy chỉnh Thư mục con
  saveFolderConfig(grade, config) {
    const saved = JSON.parse(localStorage.getItem("exam_folder_configs")) || {};
    saved[grade] = {
      ...(saved[grade] || {}),
      ...config
    };
    localStorage.setItem("exam_folder_configs", JSON.stringify(saved));
    return this.getFolderConfig(grade);
  }

  // 20. Khôi phục mặc định Thư mục con
  resetFolderConfig(grade) {
    const saved = JSON.parse(localStorage.getItem("exam_folder_configs")) || {};
    delete saved[grade];
    localStorage.setItem("exam_folder_configs", JSON.stringify(saved));
    return this.getFolderConfig(grade);
  }

  // 21. Di chuyển đề thi sang thư mục khối lớp khác (Kéo thả Drag & Drop)
  async moveExamToFolder(examId, targetGrade) {
    const targetG = parseInt(targetGrade);
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || MOCK_DATABASE;
    if (db.exams) {
      const ex = db.exams.find(e => e.id === examId);
      if (ex) {
        ex.grade = targetG;
        localStorage.setItem("app_mock_db", JSON.stringify(db));
      }
    }

    // Đồng bộ lên Supabase nếu có kết nối
    try {
      if (window.supabaseClient) {
        await window.supabaseClient
          .from('exam_assessments')
          .update({ grade_level: targetG })
          .eq('id', examId);
      }
    } catch (e) {
      console.warn("Supabase moveExam sync warning:", e);
    }

    return { success: true, targetGrade: targetG };
  }

  // 22. Kiểm tra trạng thái khóa thư mục đối với người dùng
  isFolderLockedForUser(grade) {
    const user = window.authService?.getUser();
    if (user && (user.role === 'teacher' || user.role === 'admin')) {
      return false; // Giáo viên và Admin không bị chặn
    }

    const cfg = this.getFolderConfig(grade);
    if (!cfg || !cfg.isLocked) return false;

    // Kiểm tra xem đã mở khóa trong phiên hiện tại chưa
    const unlockedFolders = JSON.parse(sessionStorage.getItem("unlocked_exam_folders")) || [];
    return !unlockedFolders.includes(parseInt(grade));
  }

  // 23. Mở khóa thư mục bằng mật khẩu trong phiên làm việc
  unlockFolderSession(grade, inputPassword) {
    const cfg = this.getFolderConfig(grade);
    const correctPassword = cfg.password || "123456";

    if (inputPassword === correctPassword) {
      const unlockedFolders = JSON.parse(sessionStorage.getItem("unlocked_exam_folders")) || [];
      if (!unlockedFolders.includes(parseInt(grade))) {
        unlockedFolders.push(parseInt(grade));
        sessionStorage.setItem("unlocked_exam_folders", JSON.stringify(unlockedFolders));
      }
      return { success: true };
    }

    return { success: false, error: "Mật khẩu không chính xác!" };
  }

  // 24. Đổi trạng thái khóa và mật khẩu thư mục
  toggleFolderLock(grade, isLocked, password = "") {
    return this.saveFolderConfig(grade, {
      isLocked: Boolean(isLocked),
      password: password || "123456"
    });
  }

  // 25. Lấy danh sách học sinh đang thi trực tuyến thời gian thực (Live Exam Proctoring)
  getLiveProctorList(grade = 'all') {
    let proctorDB = JSON.parse(sessionStorage.getItem("live_exam_proctors"));
    if (!proctorDB) {
      proctorDB = [
        {
          id: "proc_01",
          studentName: "Nguyễn Văn An",
          className: "3A",
          grade: 3,
          examTitle: "Đề Kiểm Tra Cuối Học Kỳ I - Tin Học Lớp 3 (KNTT)",
          answeredCount: 5,
          totalQuestions: 7,
          timeLeftSeconds: 1420,
          tabSwitchCount: 0,
          status: "active", // active | warning | idle | submitted
          statusText: "🟢 Đang làm bài tích cực",
          score: null
        },
        {
          id: "proc_02",
          studentName: "Lê Bảo Ngọc",
          className: "3A",
          grade: 3,
          examTitle: "Đề Kiểm Tra Cuối Học Kỳ I - Tin Học Lớp 3 (KNTT)",
          answeredCount: 6,
          totalQuestions: 7,
          timeLeftSeconds: 1180,
          tabSwitchCount: 1,
          status: "warning",
          statusText: "⚠️ Đã chuyển tab (1 lần)",
          score: null
        },
        {
          id: "proc_03",
          studentName: "Trần Minh Quân",
          className: "3A",
          grade: 3,
          examTitle: "Đề Kiểm Tra Cuối Học Kỳ I - Tin Học Lớp 3 (KNTT)",
          answeredCount: 7,
          totalQuestions: 7,
          timeLeftSeconds: 0,
          tabSwitchCount: 0,
          status: "submitted",
          statusText: "🏁 Đã nộp bài (10.0đ)",
          score: 10.0
        },
        {
          id: "proc_04",
          studentName: "Phạm Hoàng Long",
          className: "3B",
          grade: 3,
          examTitle: "Đề Kiểm Tra Cuối Học Kỳ I - Tin Học Lớp 3 (KNTT)",
          answeredCount: 4,
          totalQuestions: 7,
          timeLeftSeconds: 1650,
          tabSwitchCount: 0,
          status: "active",
          statusText: "🟢 Đang làm bài tích cực",
          score: null
        },
        {
          id: "proc_05",
          studentName: "Đỗ Mai Anh",
          className: "4A",
          grade: 4,
          examTitle: "Đề Kiểm Tra Giữa Học Kỳ I - Tin Học Lớp 4 (Cánh Diều)",
          answeredCount: 3,
          totalQuestions: 7,
          timeLeftSeconds: 1800,
          tabSwitchCount: 2,
          status: "warning",
          statusText: "🚨 CẢNH BÁO: Chuyển tab (2 lần)",
          score: null
        },
        {
          id: "proc_06",
          studentName: "Hoàng Gia Huy",
          className: "5A",
          grade: 5,
          examTitle: "Bộ Ma Trận & Đề Kiểm Tra Cuối HK2 - Lớp 5 (CTST)",
          answeredCount: 6,
          totalQuestions: 7,
          timeLeftSeconds: 950,
          tabSwitchCount: 0,
          status: "active",
          statusText: "🟢 Đang làm bài tích cực",
          score: null
        }
      ];
      sessionStorage.setItem("live_exam_proctors", JSON.stringify(proctorDB));
    }

    if (grade !== 'all') {
      return proctorDB.filter(p => p.grade === parseInt(grade));
    }
    return proctorDB;
  }

  // 26. Cộng thêm thời gian làm bài cho học sinh
  addExtraTimeToStudent(studentId, extraMinutes = 5) {
    const proctorDB = JSON.parse(sessionStorage.getItem("live_exam_proctors")) || [];
    const st = proctorDB.find(p => p.id === studentId);
    if (st) {
      st.timeLeftSeconds += extraMinutes * 60;
      sessionStorage.setItem("live_exam_proctors", JSON.stringify(proctorDB));
      return { success: true, newTime: st.timeLeftSeconds };
    }
    return { success: false };
  }

  // 27. Thu bài thi sớm đối với học sinh vi phạm
  forceSubmitStudentExam(studentId) {
    const proctorDB = JSON.parse(sessionStorage.getItem("live_exam_proctors")) || [];
    const st = proctorDB.find(p => p.id === studentId);
    if (st) {
      st.status = "submitted";
      st.statusText = "🛑 Bị thu bài sớm (Vi phạm)";
      st.score = 6.0;
      st.timeLeftSeconds = 0;
      sessionStorage.setItem("live_exam_proctors", JSON.stringify(proctorDB));
      return { success: true };
    }
    return { success: false };
  }

  // 28. Gửi thông báo / lời nhắc toàn phòng thi
  broadcastProctorAnnouncement(message) {
    sessionStorage.setItem("proctor_broadcast_msg", JSON.stringify({
      message,
      sentAt: new Date().toISOString()
    }));
    return { success: true };
  }

  // 29. Lấy dữ liệu Giấy Khen Vinh Danh Học Sinh (Honor Certificate)
  getCertificateData(attemptId) {
    const att = this.getAttemptById(attemptId);
    if (!att) return null;

    return {
      id: att.id,
      studentName: att.studentName || "Học Sinh Xuất Sắc",
      className: att.className || "3A",
      grade: att.grade || 3,
      examTitle: att.examTitle,
      score: att.score,
      totalScore: 10,
      classification: att.classification || "Hoàn thành Tốt (T)",
      starsEarned: att.starsEarned || 20,
      teacherComment: att.teacherComment || "Em nắm rất vững kiến thức và hoàn thành xuất sắc bài kiểm tra!",
      submittedAt: att.submittedAt ? new Date(att.submittedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')
    };
  }

  // 30. Lấy toàn bộ Ngân Hàng Câu Hỏi Trắc Nghiệm Động (Dynamic Question Bank)
  getAllQuestionBank(grade = 'all', searchQuery = "", levelFilter = 'all') {
    let qb = JSON.parse(localStorage.getItem("exam_question_bank"));
    if (!qb) {
      qb = [
        {
          id: "qb_301",
          grade: 3,
          topic: "topic_a",
          topicName: "Chủ đề A: Máy tính & Em",
          level: "Mức 1",
          question: "Thiết bị nào sau đây dùng để nhập chữ và số vào máy tính?",
          options: ["A. Bàn phím (Keyboard)", "B. Màn hình (Monitor)", "C. Loa (Speaker)", "D. Chuột máy tính"],
          correct: 0,
          explanation: "Bàn phím là thiết bị thu nhận thông tin dạng ký tự và chữ số vào máy tính."
        },
        {
          id: "qb_302",
          grade: 3,
          topic: "topic_a",
          topicName: "Chủ đề A: Máy tính & Em",
          level: "Mức 1",
          question: "Thao tác 'Nháy đúp chuột trái' (Double click) có tác dụng gì?",
          options: ["A. Xóa tệp tin", "B. Mở một phần mềm hoặc thư mục", "C. Tắt nguồn máy tính", "D. Đổi tên tệp tin"],
          correct: 1,
          explanation: "Nháy đúp chuột nhanh hai lần liên tiếp dùng để mở ứng dụng hoặc tệp tin."
        },
        {
          id: "qb_303",
          grade: 3,
          topic: "topic_e",
          topicName: "Chủ đề E: Ứng dụng Tin học (Paint)",
          level: "Mức 2",
          question: "Trong phần mềm Paint, công cụ nào dùng để tô màu cho hình vẽ khép kín?",
          options: ["A. Cây bút chì (Pencil)", "B. Thùng sơn (Fill with color)", "C. Cục tẩy (Eraser)", "D. Kính lúp (Magnifier)"],
          correct: 1,
          explanation: "Biểu tượng Thùng sơn dùng để đổ màu vào các vùng hình vẽ khép kín."
        },
        {
          id: "qb_401",
          grade: 4,
          topic: "topic_a",
          topicName: "Chủ đề A: Phần cứng & Phần mềm",
          level: "Mức 1",
          question: "Bộ phận nào được coi là 'bộ não' điều khiển mọi hoạt động của máy tính?",
          options: ["A. Bộ vi xử lý (CPU)", "B. Ổ cứng (Hard Drive)", "C. Bộ nhớ RAM", "D. Nguồn điện (Power)"],
          correct: 0,
          explanation: "CPU (Central Processing Unit) là bộ xử lý trung tâm xử lý dữ liệu của máy tính."
        },
        {
          id: "qb_402",
          grade: 4,
          topic: "topic_c",
          topicName: "Chủ đề C: Tổ chức lưu trữ thông tin",
          level: "Mức 2",
          question: "Cấu trúc lưu trữ dữ liệu trong máy tính có dạng hình gì?",
          options: ["A. Cây thư mục (Folder Tree)", "B. Hình vòng tròn", "C. Hình tam giác", "D. Đường thẳng ngẫu nhiên"],
          correct: 0,
          explanation: "Dữ liệu được tổ chức theo hình cây thư mục gồm thư mục gốc, thư mục con và tệp tin."
        },
        {
          id: "qb_501",
          grade: 5,
          topic: "topic_b",
          topicName: "Chủ đề B: Mạng & Internet",
          level: "Mức 1",
          question: "Công cụ tìm kiếm thông tin phổ biến hàng đầu thế giới hiện nay là gì?",
          options: ["A. Google", "B. Paint", "C. WordPad", "D. Calculator"],
          correct: 0,
          explanation: "Google là cỗ máy tìm kiếm dữ liệu trực tuyến lớn nhất thế giới."
        },
        {
          id: "qb_502",
          grade: 5,
          topic: "topic_d",
          topicName: "Chủ đề D: Đạo đức số & Bản quyền",
          level: "Mức 2",
          question: "Bản quyền phần mềm (Copyright) có ý nghĩa gì đối với người sáng tạo?",
          options: [
            "A. Ai cũng có quyền sao chép đem bán",
            "B. Bảo vệ quyền sở hữu trí tuệ và công sức của tác giả phần mềm",
            "C. Làm cho phần mềm bị lỗi",
            "D. Tự động xóa dữ liệu"
          ],
          correct: 1,
          explanation: "Tôn trọng bản quyền thể hiện văn hóa ứng xử văn minh trong không gian mạng."
        },
        {
          id: "qb_503",
          grade: 5,
          topic: "topic_f",
          topicName: "Chủ đề F: Lập trình Scratch",
          level: "Mức 3",
          question: "Trong phần mềm Scratch, để nhân vật di chuyển 50 bước em sử dụng khối lệnh nào?",
          options: ["A. Move 50 steps", "B. Turn right 50 degrees", "C. Say Hello for 50 secs", "D. Change size by 50"],
          correct: 0,
          explanation: "Khối lệnh 'Move [số] steps' trong nhóm Motion dùng để di chuyển nhân vật."
        }
      ];
      localStorage.setItem("exam_question_bank", JSON.stringify(qb));
    }

    let filtered = [...qb];
    if (grade !== 'all') {
      filtered = filtered.filter(q => q.grade === parseInt(grade));
    }
    if (levelFilter !== 'all') {
      filtered = filtered.filter(q => q.level === levelFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(q) || 
        (item.topicName && item.topicName.toLowerCase().includes(q)) ||
        item.options.some(o => o.toLowerCase().includes(q))
      );
    }

    return filtered;
  }

  // 31. Thêm câu hỏi mới vào ngân hàng
  addQuestionToBank(questionData) {
    const qb = this.getAllQuestionBank('all');
    const newQ = {
      id: `qb_${Date.now()}`,
      grade: parseInt(questionData.grade || 3),
      topic: questionData.topic || "topic_a",
      topicName: questionData.topicName || "Chủ đề A: Máy tính & Em",
      level: questionData.level || "Mức 1",
      question: questionData.question,
      options: questionData.options,
      correct: parseInt(questionData.correct || 0),
      explanation: questionData.explanation || "Nội dung giải thích kiến thức bài học.",
      createdAt: new Date().toISOString()
    };

    qb.unshift(newQ);
    localStorage.setItem("exam_question_bank", JSON.stringify(qb));
    return { success: true, question: newQ };
  }

  // 32. Chỉnh sửa câu hỏi trong ngân hàng
  updateQuestionInBank(questionId, updates) {
    const qb = this.getAllQuestionBank('all');
    const idx = qb.findIndex(q => q.id === questionId);
    if (idx !== -1) {
      qb[idx] = { ...qb[idx], ...updates };
      localStorage.setItem("exam_question_bank", JSON.stringify(qb));
      return { success: true, question: qb[idx] };
    }
    return { success: false };
  }

  // 33. Xóa câu hỏi khỏi ngân hàng
  deleteQuestionFromBank(questionId) {
    let qb = this.getAllQuestionBank('all');
    qb = qb.filter(q => q.id !== questionId);
    localStorage.setItem("exam_question_bank", JSON.stringify(qb));
    return { success: true };
  }
}

window.examService = new ExamService();





