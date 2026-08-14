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
