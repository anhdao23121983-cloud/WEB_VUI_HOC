/**
 * DỮ LIỆU KHUNG CHƯƠNG TRÌNH SGK TIN HỌC TIỂU HỌC (LỚP 3, 4, 5)
 * GDPT 2018: Kết nối tri thức, Cánh diều, Chân trời sáng tạo
 */

const CURRICULUM_DATA = {
  // LỚP 3
  3: {
    topics: [
      {
        id: "T3_A",
        code: "A",
        name: "Chủ đề A: Máy tính và em",
        description: "Làm quen với các bộ phận máy tính, thao tác chuột, bàn phím",
        lessons: [
          {
            id: "L3_01",
            number: 1,
            title: "Thông tin và quyết định",
            periods: 1,
            book: "KNTT",
            description: "Nhận biết được thông tin thu nhận qua các giác quan và đưa ra quyết định phù hợp.",
            objectives: {
              competencies: "Nêu được ví dụ về thông tin và quyết định trong đời sống hàng ngày.",
              digitalCompetency: "Nhận biết được vai trò của thông tin trong xử lý vấn đề.",
              qualities: "Chăm chỉ, có ý thức quan sát thế giới xung quanh."
            }
          },
          {
            id: "L3_02",
            number: 2,
            title: "Khám phá máy tính",
            periods: 2,
            book: "KNTT",
            description: "Nhận biết 4 thành phần cơ bản của máy tính để bàn: Màn hình, Thân máy, Bàn phím, Chuột.",
            objectives: {
              competencies: "Chỉ và gọi đúng tên 4 bộ phận cơ bản của máy tính để bàn.",
              digitalCompetency: "Hiểu được chức năng cơ bản của từng bộ phận.",
              qualities: "Trách nhiệm, giữ gìn và bảo quản thiết bị công nghệ."
            }
          },
          {
            id: "L3_03",
            number: 3,
            title: "Em tập sử dụng chuột máy tính",
            periods: 2,
            book: "KNTT",
            description: "Thao tác cầm chuột đúng cách, các thao tác: di chuyển, nháy chuột, nháy đúp, kéo thả chuột.",
            objectives: {
              competencies: "Cầm chuột đúng cách bằng tay phải, ngón trỏ đặt nút trái, ngón giữa đặt nút phải.",
              digitalCompetency: "Thực hiện thành thạo thao tác nháy đơn, nháy kép, kéo thả biểu tượng.",
              qualities: "Kiên trì rèn luyện kỹ năng thao tác chuẩn xác."
            }
          },
          {
            id: "L3_04",
            number: 4,
            title: "Bàn phím máy tính và cách gõ các hàng phím",
            periods: 3,
            book: "KNTT",
            description: "Làm quen với khu vực chính của bàn phím, hàng phím cơ sở, cách đặt 10 ngón tay.",
            objectives: {
              competencies: "Nhận biết 2 phím có gai F và J trên hàng phím cơ sở.",
              digitalCompetency: "Đặt 8 ngón tay đúng vị trí xuất phát trên hàng cơ sở.",
              qualities: "Chăm chỉ, kiên nhẫn luyện tập gõ phím đúng quy tắc."
            }
          }
        ]
      },
      {
        id: "T3_E",
        code: "E",
        name: "Chủ đề E: Ứng dụng tin học (Luyện vẽ & Soạn thảo)",
        description: "Sử dụng phần mềm đồ họa Paint và luyện gõ chữ Tiếng Việt",
        lessons: [
          {
            id: "L3_05",
            number: 5,
            title: "Em tập vẽ hình đơn giản với Paint",
            periods: 2,
            book: "KNTT",
            description: "Sử dụng công cụ bút vẽ, tẩy, hình mẫu (hình tròn, chữ nhật) và đổ màu trong Paint.",
            objectives: {
              competencies: "Khởi động và thoát khỏi phần mềm Paint, vẽ được ngôi nhà và cái cây đơn giản.",
              digitalCompetency: "Lựa chọn nét vẽ, màu sắc phù hợp để tạo bức tranh sinh động.",
              qualities: "Yêu cái đẹp, sáng tạo và tự tin chia sẻ sản phẩm hội họa."
            }
          }
        ]
      },
      {
        id: "T3_F",
        code: "F",
        name: "Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính",
        description: "Làm quen với khái niệm công việc chia nhỏ theo từng bước",
        lessons: [
          {
            id: "L3_06",
            number: 6,
            title: "Thực hiện công việc theo các bước",
            periods: 2,
            book: "KNTT",
            description: "Biết chia một công việc lớn thành các bước nhỏ liên tiếp (thuật toán ban đầu).",
            objectives: {
              competencies: "Mô tả được các bước thực hiện một công việc quen thuộc (pha sữa, đánh răng, tưới cây).",
              digitalCompetency: "Hình thành tư duy logic tuần tự từng bước.",
              qualities: "Cẩn thận, kỷ luật và làm việc khoa học."
            }
          }
        ]
      }
    ]
  },

  // LỚP 4
  4: {
    topics: [
      {
        id: "T4_A",
        code: "A",
        name: "Chủ đề A: Máy tính và em (Phần cứng & Phần mềm)",
        description: "Phân biệt phần cứng, phần mềm, thao tác thư mục tập tin",
        lessons: [
          {
            id: "L4_01",
            number: 1,
            title: "Phần cứng và phần mềm máy tính",
            periods: 1,
            book: "KNTT",
            description: "Phân biệt thiết bị phần cứng (sờ thấy được) và phần mềm (chương trình chạy trên máy).",
            objectives: {
              competencies: "Nêu được ví dụ về phần cứng (chuột, bàn phím, loa) và phần mềm (Word, Paint, trò chơi).",
              digitalCompetency: "Hiểu mối quan hệ phối hợp giữa phần cứng và phần mềm.",
              qualities: "Tôn trọng và có ý thức giữ gìn thiết bị công nghệ số."
            }
          },
          {
            id: "L4_02",
            number: 2,
            title: "Gõ chữ Tiếng Việt có dấu (Kiểu gõ Telex / Vni)",
            periods: 2,
            book: "KNTT",
            description: "Sử dụng phần mềm Unikey để gõ văn bản tiếng Việt có dấu.",
            objectives: {
              competencies: "Gõ thành thạo các dấu: sắc, huyền, hỏi, ngã, nặng theo kiểu gõ Telex.",
              digitalCompetency: "Gõ đúng các ký tự tiếng Việt đặc biệt: ă, â, đ, ê, ô, ơ, ư.",
              qualities: "Chăm chỉ, rèn luyện kỹ năng gõ văn bản chuẩn Tiếng Việt."
            }
          }
        ]
      },
      {
        id: "T4_F",
        code: "F",
        name: "Chủ đề F: Lập trình trực quan Scratch",
        description: "Làm quen môi trường lập trình Scratch, di chuyển nhân vật",
        lessons: [
          {
            id: "L4_03",
            number: 3,
            title: "Làm quen với môi trường lập trình Scratch",
            periods: 2,
            book: "KNTT",
            description: "Khám phá sân khấu, nhân vật chú mèo Scratch, khu vực khối lệnh và vùng kịch bản.",
            objectives: {
              competencies: "Kéo thả được khối lệnh 'Di chuyển 10 bước' và 'Nói Xin chào'.",
              digitalCompetency: "Tạo được hoạt cảnh chuyển động đơn giản cho nhân vật.",
              qualities: "Hứng thú sáng tạo và khám phá thế giới lập trình."
            }
          }
        ]
      }
    ]
  },

  // LỚP 5
  5: {
    topics: [
      {
        id: "T5_B",
        code: "B",
        name: "Chủ đề B: Mạng máy tính và Internet an toàn",
        description: "Tìm kiếm thông tin trên Internet và an toàn bảo mật dữ liệu số",
        lessons: [
          {
            id: "L5_01",
            number: 1,
            title: "Tìm kiếm thông tin trên Internet",
            periods: 1,
            book: "KNTT",
            description: "Sử dụng máy tìm kiếm (Google) với từ khóa chính xác để tìm tư liệu học tập.",
            objectives: {
              competencies: "Xác định được từ khóa phù hợp để tìm kiếm bài giảng, tài liệu.",
              digitalCompetency: "Chọn lọc và đánh giá độ tin cậy của thông tin trên mạng.",
              qualities: "Có ý thức trách nhiệm khi khai thác thông tin trên Internet."
            }
          },
          {
            id: "L5_02",
            number: 2,
            title: "Bảo vệ thông tin cá nhân và tài khoản trực tuyến",
            periods: 1,
            book: "KNTT",
            description: "Nhận biết tầm quan trọng của mật khẩu mạnh và không tiết lộ bí mật cá nhân trên mạng.",
            objectives: {
              competencies: "Biết cách đặt mật khẩu an toàn và cách thoát tài khoản sau khi dùng xong.",
              digitalCompetency: "Phòng tránh các đường link lạ và mã độc trên môi trường số.",
              qualities: "Cảnh giác và tuân thủ văn hóa đạo đức số."
            }
          }
        ]
      },
      {
        id: "T5_F",
        code: "F",
        name: "Chủ đề F: Lập trình điều khiển nhân vật và biến số",
        description: "Sử dụng vòng lặp, câu lệnh rẽ nhánh và tính điểm trong Scratch",
        lessons: [
          {
            id: "L5_03",
            number: 3,
            title: "Cấu trúc lặp và rẽ nhánh trong Scratch",
            periods: 2,
            book: "KNTT",
            description: "Sử dụng khối lệnh 'Lặp lại', 'Nếu... thì...' để tạo game tương tác.",
            objectives: {
              competencies: "Xây dựng được kịch bản trò chơi điều khiển nhân vật né chướng ngại vật.",
              digitalCompetency: "Hiểu tư duy điều kiện và vòng lặp trong giải thuật máy tính.",
              qualities: "Tự tin giải quyết vấn đề và tư duy sáng tạo."
            }
          }
        ]
      }
    ]
  }
};

window.CURRICULUM_DATA = CURRICULUM_DATA;
