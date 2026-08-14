/**
 * DOC EXPORT SERVICE (DỊCH VỤ XUẤT GIÁO ÁN FILE WORD .DOC / IN ẤN)
 * Định dạng chuẩn thể thức văn bản hành chính sư phạm theo Công văn 2345
 */

class DocExportService {
  // Xuất file Word (.doc) tương thích 100% với MS Word và Google Docs
  exportToWord(plan) {
    const filename = `${this.slugify(plan.title || "Giao_An_Tin_Hoc")}.doc`;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${plan.title}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 13pt;
            line-height: 1.4;
            color: #000;
            margin: 20mm 20mm 20mm 25mm;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .header-table td {
            vertical-align: top;
            font-size: 12pt;
          }
          .title {
            text-align: center;
            font-size: 15pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 15px 0 5px 0;
          }
          .subtitle {
            text-align: center;
            font-size: 13pt;
            font-style: italic;
            margin-bottom: 20px;
          }
          h2 {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 15px;
            margin-bottom: 5px;
          }
          h3 {
            font-size: 13pt;
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 5px;
          }
          p, li {
            font-size: 13pt;
            text-align: justify;
            margin: 4px 0;
          }
          .activity-box {
            border: 1px solid #333;
            padding: 10px;
            margin: 10px 0;
            background-color: #f9f9f9;
          }
          .table-activity {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .table-activity th, .table-activity td {
            border: 1px solid #000;
            padding: 8px;
            font-size: 12pt;
            vertical-align: top;
          }
          .table-activity th {
            background-color: #f2f2f2;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 50%; text-align: center;">
              <b>PHÒNG GIÁO DỤC VÀ ĐÀO TẠO</b><br>
              <b>${plan.schoolName || "TRƯỜNG TIỂU HỌC"}</b><br>
              <i>Hệ thống: ANH ĐÀO • CLASSROOM</i><br>
              --------------------
            </td>
            <td style="width: 50%; text-align: center;">
              <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br>
              <b>Độc lập - Tự do - Hạnh phúc</b><br>
              --------------------
            </td>
          </tr>
        </table>

        <div class="title">${plan.title}</div>
        <div class="subtitle">Môn: ${plan.subject || "Tin học"} - Lớp ${plan.grade} | Thời lượng: ${plan.duration || "2 tiết"} | Giáo viên: ${plan.teacherName || "Thầy Anh Đào"}</div>

        <h2>I. YÊU CẦU CẦN ĐẠT</h2>
        <h3>1. Năng lực</h3>
        <p><b>a) Năng lực chung:</b></p>
        <p>${(plan.objectives?.competencies?.general || "").replace(/\n/g, "<br>")}</p>
        <p><b>b) Năng lực tin học đặc thù:</b></p>
        <p>${(plan.objectives?.competencies?.specific || "").replace(/\n/g, "<br>")}</p>

        <h3>2. Phẩm chất chủ yếu</h3>
        <p>${(plan.objectives?.qualities || "").replace(/\n/g, "<br>")}</p>

        <h2>II. ĐỒ DÙNG DẠY HỌC</h2>
        <p><b>1. Giáo viên:</b> ${plan.equipment?.teacher || "Máy tính, máy chiếu, bài giảng điện tử."}</p>
        <p><b>2. Học sinh:</b> ${plan.equipment?.student || "SGK, vở ghi bài, máy tính thực hành."}</p>

        <h2>III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU</h2>
        ${(plan.activities || []).map(act => `
          <div style="margin-top: 15px;">
            <b>${act.name}</b>
            <p><b>a) Mục tiêu:</b> ${act.objective}</p>
            <p><b>b) Nội dung:</b> ${act.content}</p>
            <p><b>c) Sản phẩm:</b> Học sinh hoàn thành nhiệm vụ theo yêu cầu của giáo viên.</p>
            <p><b>d) Tổ chức thực hiện:</b></p>
            <p style="margin-left: 20px;">${act.organization}</p>
          </div>
        `).join("")}

        <h2>IV. ĐIỀU CHỈNH SAU BÀI DẠY</h2>
        <p>${plan.evaluation || "..................................................................................................................................................."}</p>

        <br><br>
        <table class="header-table" style="margin-top: 30px;">
          <tr>
            <td style="width: 50%; text-align: center;">
              <b>DUYỆT CỦA TỔ CHUYÊN MÔN</b><br><br><br><br>
              .....................................................
            </td>
            <td style="width: 50%; text-align: center;">
              <i>Ngày ...... tháng ...... năm 2026</i><br>
              <b>GIÁO VIÊN SOẠN BÀI</b><br><br><br><br>
              <b>${plan.teacherName || "Thầy Giáo Anh Đào"}</b>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Xuất Phiếu Bài Tập Học Sinh (.doc) đi kèm bài giảng điện tử để in ấn
  exportWorksheetDoc(lecture) {
    const filename = `Phieu_Bai_Tap_${this.slugify(lecture.title || "Tin_Hoc")}.doc`;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Phiếu Bài Tập - ${lecture.title}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.35;
            color: #000;
            margin: 15mm 15mm 15mm 20mm;
          }
          .header-box {
            width: 100%;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 12px;
          }
          .title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 8px 0 3px 0;
            color: #002060;
          }
          .subtitle {
            text-align: center;
            font-size: 11pt;
            font-style: italic;
            margin-bottom: 10px;
          }
          .info-table {
            width: 100%;
            border: 1px dashed #555;
            padding: 6px;
            margin-bottom: 12px;
            font-size: 11pt;
          }
          h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 4px;
            color: #c00000;
          }
          .question-item {
            margin-bottom: 8px;
            font-size: 11pt;
          }
          .options-grid {
            margin-left: 15px;
            font-size: 11pt;
          }
          .eval-box {
            margin-top: 15px;
            border: 1px solid #000;
            padding: 8px;
            font-size: 10.5pt;
          }
        </style>
      </head>
      <body>
        <table class="header-box" style="width: 100%;">
          <tr>
            <td style="width: 45%; text-align: center; font-size: 10.5pt;">
              <b>TRƯỜNG TIỂU HỌC VUI HỌC</b><br>
              <b>TỔ TIN HỌC TIỂU HỌC</b>
            </td>
            <td style="width: 55%; text-align: center; font-size: 10.5pt;">
              <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br>
              <b>Độc lập - Tự do - Hạnh phúc</b>
            </td>
          </tr>
        </table>

        <div class="title">PHIẾU HỌC TẬP & BÀI TẬP THỰC HÀNH</div>
        <div class="subtitle">Kèm bài giảng: <b>${lecture.title}</b> • Môn: Tin Học Lớp ${lecture.grade}</div>

        <table class="info-table">
          <tr>
            <td style="width: 50%;">Họ và tên học sinh: ....................................................</td>
            <td style="width: 25%;">Lớp: .........</td>
            <td style="width: 25%;">Điểm: ............</td>
          </tr>
        </table>

        <h3>PHẦN I: TRẮC NGHIỆM CỦNG CỐ KIẾN THỨC (Khoanh tròn vào chữ cái A, B, C hoặc D)</h3>
        
        <div class="question-item">
          <b>Câu 1:</b> Nội dung trọng tâm nào sau đây đúng nhất với bài học hôm nay?
          <div class="options-grid">
            A. Quan sát các thiết bị và thực hiện đúng thao tác an toàn.<br>
            B. Tự ý chạm tay vào dây điện và ổ cắm trong phòng máy.<br>
            C. Tắt máy tính đột ngột bằng cách rút phích cắm nguồn.<br>
            D. Để nước ngọt và đồ ăn gần bàn phím máy tính.
          </div>
        </div>

        <div class="question-item">
          <b>Câu 2:</b> Để hoàn thành tốt bài thực hành, em cần thực hiện theo các bước nào?
          <div class="options-grid">
            A. Khởi động ➡️ Khám phá ➡️ Luyện tập ➡️ Vận dụng sáng tạo.<br>
            B. Không cần đọc hướng dẫn mà tự làm theo ý thích.<br>
            C. Chỉ ngồi quan sát bạn làm mà không thao tác.<br>
            D. Chơi game ngoài khi chưa được sự đồng ý của Thầy Cô.
          </div>
        </div>

        <div class="question-item">
          <b>Câu 3:</b> Phẩm chất nào được rèn luyện nhiều nhất trong giờ học Tin học tiểu học?
          <div class="options-grid">
            A. Ý thức giữ gìn tài sản chung và bảo vệ an toàn thông tin cá nhân.<br>
            B. Tranh giành máy tính với các bạn trong lớp.<br>
            C. Không nghe lời hướng dẫn của giáo viên bộ môn.<br>
            D. Sử dụng máy tính liên tục không nghỉ ngơi.
          </div>
        </div>

        <h3>PHẦN II: THỰC HÀNH & VẬN DỤNG TRÊN MÁY TÍNH</h3>
        <p style="font-size: 11pt; margin-top: 2px;">
          <b>Nhiệm vụ:</b> Em hãy đăng nhập vào <b>Web Vui Học (Anh Đào Classroom)</b>, hoàn thành thử thách bài tập và ghi lại số lượng Sao Vàng ⭐ em đã đạt được vào ô dưới đây:<br>
          - Số Sao Vàng em đạt được: ............. ⭐<br>
          - Cảm nghĩ của em sau tiết học: ........................................................................................................
        </p>

        <table class="eval-box" style="width: 100%;">
          <tr>
            <td style="width: 60%;">
              <b>NHẬN XÉT CỦA THẦY CÔ GIÁO:</b><br>
              [ &nbsp; ] Hoàn thành Xuất sắc &nbsp;&nbsp;&nbsp; [ &nbsp; ] Hoàn thành Tốt &nbsp;&nbsp;&nbsp; [ &nbsp; ] Cần cố gắng hơn<br>
              <i>Lời phê: ................................................................................................</i>
            </td>
            <td style="width: 40%; text-align: center; vertical-align: bottom;">
              <b>CHỮ KÝ GIÁO VIÊN</b><br><br><br>
              <b>${lecture.authorName || "Thầy Giáo Anh Đào"}</b>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 3. Xuất file Đề Kiểm Tra Word (.doc) chuẩn Thông tư 27 kèm Ma Trận & Thang Điểm
  exportExamDoc(exam) {
    const filename = `${this.slugify(exam.title || "De_Kiem_Tra_Tin_Hoc")}.doc`;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${exam.title}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 13pt;
            line-height: 1.35;
            color: #000;
            margin: 15mm 15mm 15mm 20mm;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .header-table td {
            vertical-align: top;
            font-size: 11pt;
          }
          .student-box {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            margin: 10px 0 15px 0;
          }
          .student-box td {
            border: 1px solid #000;
            padding: 6px 10px;
            font-size: 11pt;
          }
          .title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 10px 0 3px 0;
          }
          .subtitle {
            text-align: center;
            font-size: 11pt;
            font-style: italic;
            margin-bottom: 12px;
          }
          h3 {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 12px;
            margin-bottom: 4px;
          }
          .question-item {
            margin-bottom: 10px;
            font-size: 11pt;
          }
          .option-grid {
            margin-left: 20px;
            font-size: 11pt;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center;">
              <b>TRƯỜNG TIỂU HỌC VUI HỌC</b><br>
              <b>TỔ CHUYÊN MÔN TIN HỌC</b><br>
              <hr style="width: 50%; margin: 2px auto; border: 0.5px solid #000;">
            </td>
            <td style="width: 55%; text-align: center;">
              <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br>
              <b>Độc lập - Tự do - Hạnh phúc</b><br>
              <hr style="width: 60%; margin: 2px auto; border: 0.5px solid #000;">
            </td>
          </tr>
        </table>

        <div class="title">${exam.title}</div>
        <div class="subtitle">Môn: Tin học - Khối Lớp ${exam.grade} • Thời gian làm bài: ${exam.durationMinutes || 35} phút (Không kể thời gian phát đề)</div>

        <table class="student-box">
          <tr>
            <td style="width: 65%;">
              <b>Họ và tên học sinh:</b> ............................................................................<br>
              <b>Lớp:</b> ................... &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Ngày kiểm tra:</b> ...... / ...... / 202...
            </td>
            <td style="width: 35%; text-align: center;">
              <b>ĐIỂM SỐ</b><br><br>
              <b style="font-size: 16pt;">........ / 10</b>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <b>Lời nhận xét của Thầy/Cô giáo:</b><br>
              ...................................................................................................................................................................................
            </td>
          </tr>
        </table>

        <h3>PHẦN I: TRẮC NGHIỆM KHÁCH QUAN (7.0 ĐIỂM)</h3>
        <p style="font-size: 11pt; font-style: italic; margin-top: 0;">Em hãy khoanh tròn vào chữ cái đặt trước câu trả lời đúng nhất (Mỗi câu đúng được 1.0 điểm):</p>

        <div class="question-item">
          <b>Câu 1 (Mức 1):</b> Thiết bị nào của máy tính giúp em nhìn thấy kết quả làm việc, hình ảnh và video bài học?<br>
          <div class="option-grid">
            A. Chuột máy tính &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            B. Bàn phím &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            C. Màn hình &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            D. Thân máy
          </div>
        </div>

        <div class="question-item">
          <b>Câu 2 (Mức 1):</b> Hai phím nào sau đây có gờ nổi giúp em định vị vị trí đặt ngón trỏ trên hàng phím cơ sở?<br>
          <div class="option-grid">
            A. Phím G và H &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            B. Phím F và J &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            C. Phím A và L &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            D. Phím D và K
          </div>
        </div>

        <div class="question-item">
          <b>Câu 3 (Mức 2):</b> Để lưu lại bài vẽ hoặc văn bản đang làm vào máy tính, em nhấn tổ hợp phím nào?<br>
          <div class="option-grid">
            A. Ctrl + C &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            B. Ctrl + V &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            C. Ctrl + S &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            D. Ctrl + Z
          </div>
        </div>

        <div class="question-item">
          <b>Câu 4 (Mức 2):</b> Khi muốn xóa ký tự nằm ở bên trái con trỏ soạn thảo, em sử dụng phím nào?<br>
          <div class="option-grid">
            A. Phím Delete &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            B. Phím Backspace &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            C. Phím Enter &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            D. Phím Shift
          </div>
        </div>

        <div class="question-item">
          <b>Câu 5 (Mức 2):</b> Trước khi rời khỏi phòng thực hành Tin học, hành động nào sau đây là ĐÚNG quy định?<br>
          <div class="option-grid">
            A. Rút thẳng dây điện nguồn &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            B. Tắt máy đúng quy trình qua nút Start -> Shut down và xếp ghế gọn gàng<br>
            C. Để nguyên máy hoạt động &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            D. Mang đồ ăn vào phòng máy
          </div>
        </div>

        <div class="question-item">
          <b>Câu 6 (Mức 3):</b> Thư mục (Folder) trong máy tính có biểu tượng màu gì đặc trưng và dùng để làm gì?<br>
          <div class="option-grid">
            A. Màu xanh lá cây, dùng để vẽ tranh &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            B. Màu vàng hình kẹp giấy, dùng để chứa và phân loại các tệp tin<br>
            C. Màu đỏ, dùng để xóa dữ liệu &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            D. Màu tím, dùng để nghe nhạc
          </div>
        </div>

        <div class="question-item">
          <b>Câu 7 (Mức 3):</b> Thông tin cá nhân nào sau đây em TUYỆT ĐỐI KHÔNG được chia sẻ cho người lạ trên Internet?<br>
          <div class="option-grid">
            A. Tên trò chơi yêu thích &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            B. Mật khẩu tài khoản, địa chỉ nhà và số điện thoại phụ huynh<br>
            C. Tên bài hát thiếu nhi &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            D. Màu sắc em thích
          </div>
        </div>

        <h3>PHẦN II: THỰC HÀNH TRÊN MÁY TÍNH (3.0 ĐIỂM)</h3>
        <p style="font-size: 11pt; margin-top: 2px;">
          <b>Câu 8 (Mức 3 - 2.0 điểm):</b> Em hãy mở phần mềm Paint (hoặc Word), tạo một thư mục mang tên em tại ổ đĩa D: và vẽ/soạn thảo một bức tranh ngôi trường mơ ước.<br>
          <b>Câu 9 (Mức 4 - 1.0 điểm):</b> Chèn biểu tượng hoặc trang trí màu sắc hài hòa, lưu tệp với tên <i>"BaiKiemTra_HoVaTen.png"</i> vào thư mục vừa tạo.
        </p>

        <p style="text-align: center; font-style: italic; margin-top: 20px; font-size: 11pt;">
          --- HẾT (Cán bộ coi thi không giải thích gì thêm) ---
        </p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 4. Xuất Bảng Đáp Án & Hướng Dẫn Chấm Riêng Biệt (.doc)
  exportAnswerKeyDoc(exam) {
    const filename = `Dap_An_${this.slugify(exam.title || "De_Kiem_Tra_Tin_Hoc")}.doc`;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Đáp Án: ${exam.title}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 13pt;
            line-height: 1.35;
            color: #000;
            margin: 15mm 15mm 15mm 20mm;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .header-table td {
            vertical-align: top;
            font-size: 11pt;
          }
          .title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 10px 0 3px 0;
          }
          .subtitle {
            text-align: center;
            font-size: 11pt;
            font-style: italic;
            margin-bottom: 15px;
          }
          table.ans-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 15px 0;
          }
          table.ans-table th, table.ans-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            font-size: 11pt;
            text-align: center;
          }
          table.ans-table th {
            background-color: #f2f2f2;
          }
          h3 {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 14px;
            margin-bottom: 4px;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center;">
              <b>TRƯỜNG TIỂU HỌC VUI HỌC</b><br>
              <b>TỔ CHUYÊN MÔN TIN HỌC</b>
            </td>
            <td style="width: 55%; text-align: center;">
              <b>HƯỚNG DẪN CHẤM & BIỂU ĐIỂM CHI TIẾT</b><br>
              <i>(Chuẩn Thông Tư 27/2020 & GDPT 2018)</i>
            </td>
          </tr>
        </table>

        <div class="title">ĐÁP ÁN & BIỂU ĐIỂM: ${exam.title}</div>
        <div class="subtitle">Khối Lớp: ${exam.grade} • Thang điểm: 10.0 • Người ra đề: ${exam.authorName || 'Thầy Anh Đào'}</div>

        <h3>PHẦN I: ĐÁP ÁN TRẮC NGHIỆM (7.0 ĐIỂM)</h3>
        <p style="font-size: 11pt; font-style: italic;">Mỗi câu trả lời đúng học sinh được <b>1.0 điểm</b>:</p>

        <table class="ans-table">
          <tr>
            <th>Câu Hỏi</th>
            <th>Câu 1</th>
            <th>Câu 2</th>
            <th>Câu 3</th>
            <th>Câu 4</th>
            <th>Câu 5</th>
            <th>Câu 6</th>
            <th>Câu 7</th>
          </tr>
          <tr>
            <td><b>Mức Độ</b></td>
            <td>Mức 1</td>
            <td>Mức 1</td>
            <td>Mức 2</td>
            <td>Mức 2</td>
            <td>Mức 2</td>
            <td>Mức 3</td>
            <td>Mức 3</td>
          </tr>
          <tr style="background-color: #e6f7ff;">
            <td><b>Đáp Án Đúng</b></td>
            <td><b>C</b></td>
            <td><b>B</b></td>
            <td><b>C</b></td>
            <td><b>B</b></td>
            <td><b>B</b></td>
            <td><b>B</b></td>
            <td><b>B</b></td>
          </tr>
          <tr>
            <td><b>Điểm</b></td>
            <td>1.0đ</td>
            <td>1.0đ</td>
            <td>1.0đ</td>
            <td>1.0đ</td>
            <td>1.0đ</td>
            <td>1.0đ</td>
            <td>1.0đ</td>
          </tr>
        </table>

        <h3>PHẦN II: HƯỚNG DẪN CHẤM THỰC HÀNH MÁY TÍNH (3.0 ĐIỂM)</h3>
        <table class="ans-table" style="text-align: left;">
          <tr>
            <th style="width: 15%; text-align: center;">Câu</th>
            <th style="width: 70%;">Tiêu Chí Đánh Giá Thao Tác & Yêu Cầu Cần Đạt</th>
            <th style="width: 15%; text-align: center;">Điểm</th>
          </tr>
          <tr>
            <td style="text-align: center;"><b>Câu 8<br>(Mức 3)</b></td>
            <td>
              - Tạo đúng thư mục mang tên học sinh tại ổ đĩa D: (0.5đ)<br>
              - Mở phần mềm Paint/Word và hoàn thành thao tác vẽ/soạn thảo đúng chủ đề (1.0đ)<br>
              - Bố cục hài hòa, không thao tác sai lệch (0.5đ)
            </td>
            <td style="text-align: center;"><b>2.0 Điểm</b></td>
          </tr>
          <tr>
            <td style="text-align: center;"><b>Câu 9<br>(Mức 4)</b></td>
            <td>
              - Chèn biểu tượng/hình khối trang trí sáng tạo (0.5đ)<br>
              - Lưu tệp đúng tên quy định <i>"BaiKiemTra_HoVaTen.png"</i> vào đúng thư mục đã tạo (0.5đ)
            </td>
            <td style="text-align: center;"><b>1.0 Điểm</b></td>
          </tr>
        </table>

        <h3>QUY ĐỊNH XẾP LOẠI HỌC SINH THEO THÔNG TƯ 27/2020:</h3>
        <p style="font-size: 11pt;">
          • <b>Hoàn thành Tốt (T):</b> Tổng điểm đạt từ 9.0 đến 10.0 điểm.<br>
          • <b>Hoàn thành (H):</b> Tổng điểm đạt từ 5.0 đến 8.9 điểm.<br>
          • <b>Chưa hoàn thành (C):</b> Tổng điểm dưới 5.0 điểm (Cần giáo viên kèm cặp bồi dưỡng thêm).
        </p>

        <table style="width: 100%; margin-top: 30px;">
          <tr>
            <td style="width: 50%; text-align: center;">
              <b>TỔ TRƯỞNG CHUYÊN MÔN</b><br><br><br><br>
              <i>(Ký và ghi rõ họ tên)</i>
            </td>
            <td style="width: 50%; text-align: center;">
              <b>GIÁO VIÊN RA ĐỀ</b><br><br><br><br>
              <b>${exam.authorName || 'Thầy Giáo Anh Đào'}</b>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 5. Xuất Bộ 4 Mã Đề Thi Đã Trộn (101, 102, 103, 104) + Bảng Đáp Án Đối Chiếu (.doc)
  exportShuffledExamsDoc(exam, shuffledData) {
    const filename = `Bo_4_Ma_De_Tron_${this.slugify(exam.title || "De_Thi")}.doc`;

    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Bộ 4 Mã Đề: ${exam.title}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 13pt;
            line-height: 1.35;
            color: #000;
            margin: 15mm 15mm 15mm 20mm;
          }
          .page-break { page-break-after: always; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          .header-table td { vertical-align: top; font-size: 11pt; }
          .title { text-align: center; font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 10px 0 3px 0; }
          .subtitle { text-align: center; font-size: 11pt; font-style: italic; margin-bottom: 12px; }
          .student-box { width: 100%; border: 1px solid #000; border-collapse: collapse; margin: 10px 0 15px 0; }
          .student-box td { border: 1px solid #000; padding: 6px 10px; font-size: 11pt; }
          .q-item { margin-bottom: 10px; font-size: 11pt; }
          .opt-grid { margin-left: 20px; font-size: 11pt; }
          table.matrix-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          table.matrix-table th, table.matrix-table td { border: 1px solid #000; padding: 6px 8px; font-size: 11pt; text-align: center; }
          table.matrix-table th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="title">BẢNG ĐÁP ÁN ĐỐI CHIẾU 4 MÃ ĐỀ THI</div>
        <div class="subtitle">Đề thi: ${exam.title} • Lớp ${exam.grade}</div>

        <table class="matrix-table">
          <tr>
            <th>Câu Hỏi</th>
            <th>Mã Đề 101</th>
            <th>Mã Đề 102</th>
            <th>Mã Đề 103</th>
            <th>Mã Đề 104</th>
          </tr>
          ${shuffledData.answerMatrix.map(m => `
            <tr>
              <td><b>Câu ${m.questionNum}</b></td>
              <td style="font-weight: bold; color: #1e40af;">${m.code101}</td>
              <td style="font-weight: bold; color: #b45309;">${m.code102}</td>
              <td style="font-weight: bold; color: #047857;">${m.code103}</td>
              <td style="font-weight: bold; color: #be123c;">${m.code104}</td>
            </tr>
          `).join("")}
        </table>

        <div class="page-break"></div>
    `;

    // Nối 4 mã đề
    shuffledData.shuffledVersions.forEach((ver, vIdx) => {
      htmlContent += `
        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center;">
              <b>TRƯỜNG TIỂU HỌC VUI HỌC</b><br>
              <b>TỔ TIN HỌC</b>
            </td>
            <td style="width: 55%; text-align: center;">
              <b>ĐỀ KIỂM TRA ĐỊNH KỲ TIN HỌC ${exam.grade}</b><br>
              <b style="font-size: 13pt; color: #b91c1c;">MÃ ĐỀ: ${ver.code}</b>
            </td>
          </tr>
        </table>

        <table class="student-box">
          <tr>
            <td>Họ và tên: .............................................................. Lớp: .............</td>
            <td style="width: 30%; text-align: center;">Điểm: ......... / 10</td>
          </tr>
        </table>

        <p style="font-weight: bold; text-transform: uppercase; font-size: 11pt;">PHẦN TRẮC NGHIỆM (7.0 ĐIỂM):</p>
        ${ver.questions.map((q, qIdx) => `
          <div class="q-item">
            <b>Câu ${qIdx + 1}:</b> ${q.question}<br>
            <div class="opt-grid">${q.options.join(" &nbsp;&nbsp;&nbsp;&nbsp; ")}</div>
          </div>
        `).join("")}

        <p style="font-weight: bold; text-transform: uppercase; font-size: 11pt; margin-top: 15px;">PHẦN THỰC HÀNH MÁY TÍNH (3.0 ĐIỂM):</p>
        <p style="font-size: 11pt;">Em hãy thực hiện thao tác vẽ tranh trên Paint hoặc lập trình theo yêu cầu của Thầy/Cô.</p>
        
        ${vIdx < shuffledData.shuffledVersions.length - 1 ? '<div class="page-break"></div>' : ''}
      `;
    });

    htmlContent += `</body></html>`;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  slugify(text) {
    return text.toString().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}

window.docExportService = new DocExportService();


