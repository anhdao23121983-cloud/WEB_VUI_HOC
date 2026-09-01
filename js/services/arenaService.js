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
      // === KHỐI LỚP 4 - THEO CHUẨN 16 BÀI HỌC SGK KẾT NỐI TRI THỨC VỚI CUỘC SỐNG ===
      {
        id: "g4_q_01", grade: 4, lessonId: "bai_1", topic: "Bài 1. Phần cứng và phần mềm máy tính",
        question: "Theo bài 1 SGK Tin học 4, thiết bị nào sau đây được gọi là phần cứng của máy tính?",
        options: ["A. Phần mềm Scratch", "B. Bàn phím, chuột, thân máy, màn hình", "C. Phần mềm PowerPoint", "D. Trò chơi trực tuyến"],
        correctIndex: 1, explanation: "Phần cứng là những thiết bị vật lý của máy tính mà ta có thể nhìn thấy và sờ chạm được.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_02", grade: 4, lessonId: "bai_1", topic: "Bài 1. Phần cứng và phần mềm máy tính",
        question: "Khẳng định nào sau đây là ĐÚNG về mối quan hệ giữa phần cứng và phần mềm?",
        options: ["A. Phần cứng có thể tự chạy mà không cần phần mềm", "B. Phần mềm được lưu trữ trong phần cứng và điều khiển phần cứng hoạt động", "C. Máy tính không cần phần cứng vẫn gõ được văn bản", "D. Phần mềm là thiết bị bằng kim loại"],
        correctIndex: 1, explanation: "Phần mềm được lưu trữ trong phần cứng và cung cấp câu lệnh để điều khiển phần cứng hoạt động.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_03", grade: 4, lessonId: "bai_2", topic: "Bài 2. Gõ bàn phím đúng cách",
        question: "Khi gõ các phím ở hàng phím số (1, 2, 3... 0), các ngón tay xuất phát từ hàng phím nào vươn lên?",
        options: ["A. Hàng phím trên", "B. Hàng phím cơ sở (ASDF - JKL;)", "C. Hàng phím dưới", "D. Hàng phím cách"],
        correctIndex: 1, explanation: "Khi gõ phím số, các ngón tay từ hàng phím cơ sở vươn lên gõ phím số rồi thu về vị trí xuất phát.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_04", grade: 4, lessonId: "bai_2", topic: "Bài 2. Gõ bàn phím đúng cách",
        question: "Lợi ích lớn nhất của việc gõ bàn phím 10 ngón đúng cách là gì?",
        options: ["A. Gõ nhanh hơn, chính xác hơn và bảo vệ sức khỏe mắt, cổ", "B. Làm bàn phím đẹp hơn", "C. Không cần cắm nguồn máy tính", "D. Tự động lưu tệp văn bản"],
        correctIndex: 0, explanation: "Gõ đúng cách giúp tiết kiệm thời gian, tăng tốc độ và bảo vệ cột sống, mắt, cổ.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_05", grade: 4, lessonId: "bai_3", topic: "Bài 3. Thông tin trên trang web",
        question: "Các dạng thông tin chính thường xuất hiện trên một trang web bao gồm những gì?",
        options: ["A. Chỉ có văn bản", "B. Văn bản, hình ảnh, âm thanh, video và siêu liên kết (Hyperlink)", "C. Chỉ có phần cứng", "D. Chỉ có trò chơi"],
        correctIndex: 1, explanation: "Trang web kết hợp đa phương tiện: văn bản, hình ảnh, âm thanh, video và các đường siêu liên kết.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_06", grade: 4, lessonId: "bai_3", topic: "Bài 3. Thông tin trên trang web",
        question: "Khi con trỏ chuột di chuyển vào vị trí có chứa 'Siêu liên kết', hình dạng con trỏ chuột thường đổi thành gì?",
        options: ["A. Hình mũi tên to", "B. Hình bàn tay chỉ ngón trỏ 👆", "C. Hình chiếc đồng hồ sand-glass", "D. Hình dán ngôi sao"],
        correctIndex: 1, explanation: "Khi rà chuột qua siêu liên kết, con trỏ chuột biến thành hình bàn tay trỏ ngón chỉ dẫn nhấp chuột.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_07", grade: 4, lessonId: "bai_4", topic: "Bài 4. Tìm kiếm thông tin trên Internet",
        question: "Để tìm kiếm thông tin về 'Hồ Gươm', từ hoặc cụm từ nhập vào ô tìm kiếm được gọi là gì?",
        options: ["A. Địa chỉ email", "B. Từ khóa (Keyword)", "C. Tên thư mục", "D. Tên ổ đĩa"],
        correctIndex: 1, explanation: "Từ khóa (Keyword) là từ hoặc cụm từ thể hiện nội dung thông tin chúng ta muốn tìm kiếm.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_08", grade: 4, lessonId: "bai_4", topic: "Bài 4. Tìm kiếm thông tin trên Internet",
        question: "Sắp xếp thứ tự các bước tìm kiếm thông tin trên máy tìm kiếm Google:",
        options: ["A. Gõ từ khóa -> Nhấn Enter -> Chọn siêu liên kết phù hợp", "B. Chọn siêu liên kết -> Gõ từ khóa -> Tắt máy", "C. Nhấn Enter -> Mở Paint -> Gõ từ khóa", "D. Tắt mạng -> Gõ từ khóa -> Nhấn Enter"],
        correctIndex: 0, explanation: "Các bước chuẩn: Mở máy tìm kiếm -> Gõ từ khóa -> Nhấn Enter -> Nhấp vào siêu liên kết kết quả.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_09", grade: 4, lessonId: "bai_5", topic: "Bài 5. Thao tác với tệp và thư mục",
        question: "Muốn sao chép (Copy) một tệp tin sang thư mục mới mà vẫn giữ tệp cũ, em dùng kết hợp lệnh nào?",
        options: ["A. Delete và Paste", "B. Copy và Paste", "C. Move to và Delete", "D. Rename và Cut"],
        correctIndex: 1, explanation: "Lệnh Copy tạo bản sao tệp ở thư mục mới trong khi tệp ở thư mục gốc vẫn tồn tại.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_10", grade: 4, lessonId: "bai_5", topic: "Bài 5. Thao tác với tệp và thư mục",
        question: "Hành động nào sau đây có thể gây hại cho hệ điều hành máy tính khi thao tác tệp?",
        options: ["A. Đổi tên tệp văn bản bài tập của em", "B. Tự ý xóa hoặc di chuyển các tệp hệ thống trong ổ đĩa C:\\", "C. Tạo thư mục mới mang tên em", "D. Xem ảnh trong thư mục cá nhân"],
        correctIndex: 1, explanation: "Tuyệt đối không xóa hoặc di chuyển các tệp hệ thống trong ổ C vì sẽ gây lỗi chương trình máy tính.", difficulty: "hard", timeLimit: 15, stars: 30
      },
      {
        id: "g4_q_11", grade: 4, lessonId: "bai_6", topic: "Bài 6. Sử dụng phần mềm khi được phép",
        question: "Phần mềm được tác giả cho phép người dùng tải về và sử dụng không phải trả tiền gọi là gì?",
        options: ["A. Phần mềm thương mại", "B. Phần mềm miễn phí (Free software)", "C. Phần mềm độc hại", "D. Phần mềm bị lỗi"],
        correctIndex: 1, explanation: "Phần mềm miễn phí được phép tải và dùng hợp pháp mà không cần trả chi phí mua bản quyền.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_12", grade: 4, lessonId: "bai_6", topic: "Bài 6. Sử dụng phần mềm khi được phép",
        question: "Tại sao chúng ta KHÔNG NÊN sử dụng phần mềm bẻ khóa (Crack) trái phép?",
        options: ["A. Vì vi phạm pháp luật và nguy cơ bị lây nhiễm virus, mất an toàn dữ liệu", "B. Vì làm máy tính đẹp hơn", "C. Vì tăng tốc độ mạng", "D. Vì giúp giáo viên vui hơn"],
        correctIndex: 0, explanation: "Dùng phần mềm bẻ khóa vi phạm bản quyền và tiềm ẩn nguy cơ cao bị mã độc, virus tấn công.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_13", grade: 4, lessonId: "bai_7", topic: "Bài 7. Tạo bài trình chiếu",
        question: "Phần mềm nào sau đây thường được dùng phổ biến để tạo các bài trình chiếu (Presentation)?",
        options: ["A. MS Word", "B. MS PowerPoint", "C. MS Excel", "D. Scratch"],
        correctIndex: 1, explanation: "PowerPoint là phần mềm trình chiếu chuyên dụng giúp tạo các trang chiếu sinh động.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_14", grade: 4, lessonId: "bai_7", topic: "Bài 7. Tạo bài trình chiếu",
        question: "Để lưu bài trình chiếu vào thư mục cá nhân, em chọn lệnh nào trong bảng chọn File?",
        options: ["A. Exit", "B. Save (hoặc Save As)", "C. New", "D. Open"],
        correctIndex: 1, explanation: "Lệnh Save/Save As dùng để lưu tệp trình chiếu (.pptx) vào ổ đĩa hoặc thư mục mong muốn.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_15", grade: 4, lessonId: "bai_8", topic: "Bài 8. Định dạng văn bản trên trang chiếu",
        question: "Nút lệnh nào trên dải lệnh Home dùng để bật định dạng chữ ĐẬM cho văn bản?",
        options: ["A. Nút B (Bold)", "B. Nút I (Italic)", "C. Nút U (Underline)", "D. Nút Bullets"],
        correctIndex: 0, explanation: "Nút B (Bold) làm chữ in đậm, Nút I làm chữ nghiêng, Nút U gạch chân.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_16", grade: 4, lessonId: "bai_8", topic: "Bài 8. Định dạng văn bản trên trang chiếu",
        question: "Để tạo danh sách gạch đầu dòng tự động cho các dòng địa danh trên trang chiếu, em dùng công cụ nào?",
        options: ["A. Nút Font Color", "B. Nút Bullets (gạch đầu dòng)", "C. Nút Save", "D. Nút Shapes"],
        correctIndex: 1, explanation: "Công cụ Bullets trong nhóm Paragraph giúp tạo các ký hiệu gạch đầu dòng rõ ràng, trực quan.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_17", grade: 4, lessonId: "bai_9", topic: "Bài 9. Hiệu ứng chuyển trang",
        question: "Để tạo hiệu ứng xuất hiện sinh động khi chuyển từ trang chiếu này sang trang chiếu khác, em chọn dải lệnh nào?",
        options: ["A. Home", "B. Transitions", "C. Review", "D. View"],
        correctIndex: 1, explanation: "Dải lệnh Transitions chứa các mẫu hiệu ứng chuyển giữa các trang chiếu (Push, Fade, Wipe, Flip...).", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_18", grade: 4, lessonId: "bai_9", topic: "Bài 9. Hiệu ứng chuyển trang",
        question: "Phím tắt nào trên bàn phím dùng để bắt đầu trình chiếu toàn màn hình bài thuyết trình?",
        options: ["A. Phím Esc", "B. Phím F5", "C. Phím Enter", "D. Phím Space"],
        correctIndex: 1, explanation: "Nhấn phím F5 để bắt đầu trình chiếu bài PowerPoint từ trang đầu tiên toàn màn hình.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_19", grade: 4, lessonId: "bai_10", topic: "Bài 10. Phần mềm soạn thảo văn bản",
        question: "Vạch đứng nhấp nháy trên màn hình soạn thảo Word chỉ vị trí xuất hiện của ký tự tiếp theo gọi là gì?",
        options: ["A. Con trỏ soạn thảo", "B. Chuột máy tính", "C. Thanh cuộn", "D. Dải lệnh"],
        correctIndex: 0, explanation: "Con trỏ soạn thảo là vạch đứng nhấp nháy xác định vị trí ký tự sẽ được gõ vào.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_20", grade: 4, lessonId: "bai_10", topic: "Bài 10. Phần mềm soạn thảo văn bản",
        question: "Để gõ chữ tiếng Việt có dấu theo kiểu Telex, phần mềm hỗ trợ nào cần được khởi động sẵn?",
        options: ["A. UniKey (hoặc EVKey)", "B. Windows Media Player", "C. Paint", "D. Calculator"],
        correctIndex: 0, explanation: "UniKey hoặc EVKey là các phần mềm gõ tiếng Việt phổ biến hỗ trợ kiểu gõ Telex và VNI.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_21", grade: 4, lessonId: "bai_11", topic: "Bài 11. Chỉnh sửa văn bản",
        question: "Phím Backspace và phím Delete dùng để xóa ký tự ở vị trí nào so với con trỏ soạn thảo?",
        options: ["A. Backspace xóa bên trái, Delete xóa bên phải", "B. Backspace xóa bên phải, Delete xóa bên trái", "C. Cả hai cùng xóa bên trái", "D. Cả hai cùng xóa toàn bộ bài"],
        correctIndex: 0, explanation: "Phím Backspace xóa ký tự phía bên trái con trỏ, phím Delete xóa ký tự phía bên phải con trỏ.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_22", grade: 4, lessonId: "bai_11", topic: "Bài 11. Chỉnh sửa văn bản",
        question: "Muốn đưa một bức ảnh minh họa vào tệp văn bản Word, em chọn lệnh nào trên dải lệnh Insert?",
        options: ["A. Table", "B. Picture", "C. Symbol", "D. Header"],
        correctIndex: 1, explanation: "Lệnh Picture trên dải lệnh Insert cho phép chèn ảnh từ máy tính vào tệp văn bản.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_23", grade: 4, lessonId: "bai_12a", topic: "Bài 12A. Thực hành đa phương tiện",
        question: "Sản phẩm đa phương tiện là sản phẩm kết hợp những yếu tố nào?",
        options: ["A. Chỉ có âm thanh", "B. Văn bản, hình ảnh, âm thanh, tệp phim/video", "C. Chỉ có bảng biểu", "D. Chỉ có phím bấm"],
        correctIndex: 1, explanation: "Đa phương tiện (Multimedia) kết hợp đồng thời văn bản, hình ảnh, âm thanh và video sinh động.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_24", grade: 4, lessonId: "bai_12a", topic: "Bài 12A. Thực hành đa phương tiện",
        question: "Phần mềm nào có sẵn trên Windows dùng để xem video truyền thống về ngày Tết hay sự tích dân gian?",
        options: ["A. Windows Media Player (hoặc Movies & TV)", "B. Notepad", "C. WordPad", "D. Command Prompt"],
        correctIndex: 0, explanation: "Windows Media Player là phần mềm nghe nhạc, xem video mặc định trên hệ điều hành Windows.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_25", grade: 4, lessonId: "bai_12b", topic: "Bài 12B. Phần mềm luyện tập gõ bàn phím",
        question: "Trong phần mềm Kiran's Typing Tutor, mục bài học 'Capitals' giúp em luyện tập gõ ký tự gì?",
        options: ["A. Gõ các chữ số 1-9", "B. Gõ các chữ in hoa (Capital letters)", "C. Gõ dấu câu", "D. Gõ từ tiếng Anh"],
        correctIndex: 1, explanation: "Mục Capitals luyện kỹ năng nhấn kết hợp phím Shift để gõ các chữ cái in hoa chuẩn xác.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_26", grade: 4, lessonId: "bai_13", topic: "Bài 13. Chơi với máy tính",
        question: "Chương trình máy tính được tạo ra bằng cách nào?",
        options: ["A. Viết các lệnh được sắp xếp theo một thứ tự xác định bằng ngôn ngữ lập trình", "B. Chụp ảnh bàn phím", "C. Dùng kéo cắt màn hình", "D. Cắm dây nguồn máy tính"],
        correctIndex: 0, explanation: "Chương trình máy tính gồm dãy các câu lệnh được viết bằng ngôn ngữ lập trình sắp xếp theo thứ tự rõ ràng.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_27", grade: 4, lessonId: "bai_14", topic: "Bài 14. Khám phá môi trường lập trình trực quan",
        question: "Trong phần mềm lập trình trực quan Scratch, khối lệnh 'đi chuyển 10 bước' thuộc nhóm lệnh màu xanh lam nào?",
        options: ["A. Chuyển động (Motion)", "B. Sự kiện (Events)", "C. Điều khiển (Control)", "D. Âm thanh (Sound)"],
        correctIndex: 0, explanation: "Nhóm lệnh Chuyển động (Motion) màu xanh lam chứa các khối lệnh điều khiển nhân vật di chuyển, xoay góc.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_28", grade: 4, lessonId: "bai_14", topic: "Bài 14. Khám phá môi trường lập trình trực quan",
        question: "Để chương trình Scratch bắt đầu chạy khi học sinh bấm vào Cờ Xanh 🟢, ta cần dùng khối lệnh nào thuộc nhóm 'Sự kiện'?",
        options: ["A. Khi bấm vào cờ xanh 🟢", "B. Khi bấm vào phím trắng", "C. Đợi 1 giây", "D. Phát âm thanh"],
        correctIndex: 0, explanation: "Khối lệnh 'Khi bấm vào cờ xanh' đóng vai trò là ngòi nổ bắt đầu chạy toàn bộ khối lệnh phía dưới.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_29", grade: 4, lessonId: "bai_15", topic: "Bài 15. Tạo chương trình máy tính để diễn tả ý tưởng",
        question: "Muốn thay đổi Phông nền sân khấu (Backdrop) trong Scratch thành khu vườn hoặc bể cá, em làm thế nào?",
        options: ["A. Nháy chuột vào nút 'Chọn một Phông nền' ở góc dưới bên phải", "B. Nhấn phím Delete", "C. Đổi màu bàn phím", "D. Tắt ứng dụng Scratch"],
        correctIndex: 0, explanation: "Nút chọn phông nền giúp mở thư viện phông nền phong phú (Forest, Garden, Undersea...) cho sân khấu.", difficulty: "easy", timeLimit: 15, stars: 20
      },
      {
        id: "g4_q_30", grade: 4, lessonId: "bai_15", topic: "Bài 15. Tạo chương trình máy tính để diễn tả ý tưởng",
        question: "Khối lệnh 'bật lại nếu chạm cạnh' có tác dụng gì khi nhân vật di chuyển trên sân khấu?",
        options: ["A. Giúp nhân vật không bị chạy biến mất ra ngoài mép sân khấu", "B. Làm nhân vật biến hình", "C. Đổi màu phông nền", "D. Phát tiếng nhạc"],
        correctIndex: 0, explanation: "Khối lệnh này tự động đảo hướng khi nhân vật chạm bờ mép sân khấu, giữ nhân vật luôn trong tầm nhìn.", difficulty: "medium", timeLimit: 15, stars: 25
      },
      {
        id: "g4_q_31", grade: 4, lessonId: "bai_16", topic: "Bài 16. Chương trình của em",
        question: "Để nhân vật Chú chó đuổi theo Chú bướm trong bài 16, khối lệnh nào giúp Chú chó hướng về phía Chú bướm?",
        options: ["A. lướt 1 giây tới vị trí ngẫu nhiên", "B. đi tới [Butterfly 2]", "C. đặt kiểu xoay trái-phải", "D. phát âm thanh dog1"],
        correctIndex: 1, explanation: "Khối lệnh 'đi tới [Tên Nhân Vật]' giúp lập trình nhân vật này theo đuổi hoặc di chuyển tới vị trí nhân vật khác.", difficulty: "hard", timeLimit: 20, stars: 30
      },
      {
        id: "g4_q_32", grade: 4, lessonId: "bai_16", topic: "Bài 16. Chương trình của em",
        question: "Trong bài thực hành vẽ hình bọ cánh cứng, để bọ cánh cứng vừa di chuyển vừa vẽ đường nét trên sân khấu, nhóm lệnh mở rộng nào cần được bật?",
        options: ["A. Bút vẽ (Pen)", "B. Âm nhạc", "C. Cảm biến Video", "D. Text to Speech"],
        correctIndex: 0, explanation: "Nhóm lệnh mở rộng Bút vẽ (Pen) cung cấp các lệnh Xóa tất cả, Đặt bút (Pen down), Nhấc bút, Chọn màu nét vẽ.", difficulty: "hard", timeLimit: 20, stars: 30
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
  async getQuestions(gradeFilter = "all", topicFilter = "all", lessonFilter = "all") {
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
          let mapped = data.map(item => ({
            id: item.id,
            grade: item.grade_level,
            lessonId: item.lesson_id || "",
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

          if (lessonFilter !== "all") {
            mapped = mapped.filter(q => q.lessonId === lessonFilter || (q.topic && q.topic.toLowerCase().includes(lessonFilter.replace("_", " "))));
          }

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
    if (lessonFilter !== "all") {
      list = list.filter(q => q.lessonId === lessonFilter || (q.topic && q.topic.toLowerCase().includes(lessonFilter.replace("bai_", "bài "))));
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
