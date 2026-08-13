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
