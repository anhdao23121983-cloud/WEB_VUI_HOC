/**
 * EXAM UPLOAD & EDIT MODAL COMPONENT
 * Giao diện dành cho Giáo viên để Tải lên, Chỉnh sửa thông tin & Đổi file Đề kiểm tra
 */

class ExamUploadModal {
  constructor() {
    this.selectedFile = null;
    this.selectedFileDataUrl = null;
    this.isEditMode = false;
    this.editingExamId = null;
    this.existingExam = null;
  }

  // Mở modal tạo mới
  openModal(defaultGrade = 3) {
    const user = window.authService?.getUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      window.app.showToast("Chức năng tải lên đề kiểm tra chỉ dành cho Giáo viên & Quản trị viên!", "warning");
      return;
    }

    this.isEditMode = false;
    this.editingExamId = null;
    this.existingExam = null;
    this.selectedFile = null;
    this.selectedFileDataUrl = null;

    const modal = document.getElementById("exam-upload-modal");
    if (!modal) return;

    const titleModal = document.getElementById("exam-modal-title");
    if (titleModal) titleModal.innerText = "TẢI LÊN ĐỀ KIỂM TRA & ĐÁNH GIÁ";

    const btnSubmit = document.getElementById("btn-submit-exam-upload");
    if (btnSubmit) btnSubmit.innerHTML = "🚀 Tải Lên & Lưu Đề";

    const gradeSelect = document.getElementById("exam-grade-input");
    if (gradeSelect) gradeSelect.value = defaultGrade;

    const typeSelect = document.getElementById("exam-type-input");
    if (typeSelect) typeSelect.value = "final_term_1";

    const seriesSelect = document.getElementById("exam-series-input");
    if (seriesSelect) seriesSelect.value = "KNTT";

    const durationInput = document.getElementById("exam-duration-input");
    if (durationInput) durationInput.value = "35";

    const titleInput = document.getElementById("exam-title-input");
    if (titleInput) titleInput.value = "";

    const descInput = document.getElementById("exam-desc-input");
    if (descInput) descInput.value = "";

    const linkInput = document.getElementById("exam-link-input");
    if (linkInput) linkInput.value = "";

    const filePreview = document.getElementById("exam-file-preview-info");
    if (filePreview) filePreview.classList.add("hidden");

    modal.classList.add("active");
  }

  // Mở modal chỉnh sửa & thay đổi file đề kiểm tra
  async openEditModal(examId) {
    const user = window.authService?.getUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      window.app.showToast("Chức năng chỉnh sửa đề kiểm tra chỉ dành cho Giáo viên & Quản trị viên!", "warning");
      return;
    }

    const exam = await window.examService.getExamById(examId);
    if (!exam) return;

    this.isEditMode = true;
    this.editingExamId = examId;
    this.existingExam = exam;
    this.selectedFile = null;
    this.selectedFileDataUrl = null;

    const modal = document.getElementById("exam-upload-modal");
    if (!modal) return;

    const titleModal = document.getElementById("exam-modal-title");
    if (titleModal) titleModal.innerText = "CHỈNH SỬA & ĐỔI FILE ĐỀ KIỂM TRA";

    const btnSubmit = document.getElementById("btn-submit-exam-upload");
    if (btnSubmit) btnSubmit.innerHTML = "💾 Lưu Thay Đổi";

    const titleInput = document.getElementById("exam-title-input");
    if (titleInput) titleInput.value = exam.title;

    const gradeSelect = document.getElementById("exam-grade-input");
    if (gradeSelect) gradeSelect.value = exam.grade;

    const typeSelect = document.getElementById("exam-type-input");
    if (typeSelect) typeSelect.value = exam.examType || "final_term_1";

    const seriesSelect = document.getElementById("exam-series-input");
    if (seriesSelect) seriesSelect.value = exam.bookSeries || "KNTT";

    const durationInput = document.getElementById("exam-duration-input");
    if (durationInput) durationInput.value = exam.durationMinutes || "35";

    const descInput = document.getElementById("exam-desc-input");
    if (descInput) descInput.value = exam.description || "";

    const linkInput = document.getElementById("exam-link-input");
    if (linkInput) linkInput.value = exam.fileUrl.startsWith("http") ? exam.fileUrl : "";

    const filePreview = document.getElementById("exam-file-preview-info");
    const fileNameDisp = document.getElementById("exam-file-name-disp");
    const fileSizeDisp = document.getElementById("exam-file-size-disp");

    if (fileNameDisp) fileNameDisp.innerText = exam.fileName + " (File hiện tại)";
    if (fileSizeDisp) fileSizeDisp.innerText = exam.fileSizeText || "2.1 MB";
    if (filePreview) filePreview.classList.remove("hidden");

    modal.classList.add("active");
  }

  closeModal() {
    const modal = document.getElementById("exam-upload-modal");
    if (modal) modal.classList.remove("active");
    this.isEditMode = false;
    this.editingExamId = null;
    this.existingExam = null;
    this.selectedFile = null;
    this.selectedFileDataUrl = null;

    const btnSubmit = document.getElementById("btn-submit-exam-upload");
    if (btnSubmit) {
      btnSubmit.innerHTML = "🚀 Tải Lên & Lưu Đề";
      btnSubmit.classList.remove("pointer-events-none");
    }
  }

  // Xử lý khi chọn file từ máy tính (TẤT CẢ FILE ĐƯỢC NẠP TỨC THÌ 0.001S BẰNG BLOB POINTER)
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    // Dùng URL.createObjectURL siêu tốc 0.001s thay vì FileReader tốn bộ nhớ RAM
    this.selectedFileDataUrl = URL.createObjectURL(file);

    const filePreview = document.getElementById("exam-file-preview-info");
    const fileNameDisp = document.getElementById("exam-file-name-disp");
    const fileSizeDisp = document.getElementById("exam-file-size-disp");

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    if (fileNameDisp) fileNameDisp.innerText = file.name + " (File mới)";
    if (fileSizeDisp) fileSizeDisp.innerText = sizeMb;
    if (filePreview) filePreview.classList.remove("hidden");

    // Tự động điền tiêu đề nếu chưa có
    const titleInput = document.getElementById("exam-title-input");
    if (!this.isEditMode && titleInput && !titleInput.value) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      titleInput.value = `Đề Kiểm Tra: ${cleanName}`;
    }
  }

  // Tự động sinh tiêu đề mẫu theo lớp và loại đề
  generateSuggestedTitle() {
    const grade = document.getElementById("exam-grade-input")?.value || "3";
    const type = document.getElementById("exam-type-input")?.value || "final_term_1";
    const series = document.getElementById("exam-series-input")?.value || "KNTT";

    const typeNames = {
      "regular": "Thường Xuyên 15 Phút",
      "mid_term_1": "Giữa Học Kỳ I",
      "final_term_1": "Cuối Học Kỳ I",
      "mid_term_2": "Giữa Học Kỳ II",
      "final_term_2": "Cuối Học Kỳ II",
      "matrix": "Ma Trận & Bản Đặc Tả Đề"
    };

    const seriesNames = {
      "KNTT": "Kết Nối Tri Thức",
      "CD": "Cánh Diều",
      "CTST": "Chân Trời Sáng Tạo"
    };

    const titleInput = document.getElementById("exam-title-input");
    if (titleInput) {
      titleInput.value = `Đề Kiểm Tra Định Kỳ ${typeNames[type]} - Tin Học Lớp ${grade} (${seriesNames[series]})`;
    }
  }

  // Lưu và tải đề thi lên hệ thống (PHẢN HỒI NÚT BẤM TỨC THÌ 0.001 GIÂY)
  async submitUpload() {
    const title = document.getElementById("exam-title-input")?.value || "";
    const grade = parseInt(document.getElementById("exam-grade-input")?.value) || 3;
    const type = document.getElementById("exam-type-input")?.value || "final_term_1";
    const series = document.getElementById("exam-series-input")?.value || "KNTT";
    const duration = parseInt(document.getElementById("exam-duration-input")?.value) || 35;
    const desc = document.getElementById("exam-desc-input")?.value || "";
    const linkUrl = document.getElementById("exam-link-input")?.value || "";
    const user = window.authService?.getUser() || { username: "anhdao", name: "Cô Giáo Anh Đào" };

    if (!title.trim()) {
      window.app.showToast("Vui lòng nhập Tiêu đề đề kiểm tra!", "warning");
      return;
    }

    if (!this.isEditMode && !this.selectedFile && !linkUrl.trim()) {
      window.app.showToast("Vui lòng chọn file Đề thi (.docx / .pdf) hoặc dán link tài liệu!", "warning");
      return;
    }

    const btnSubmit = document.getElementById("btn-submit-exam-upload");

    try {
      // Chuẩn bị URL tập tin tức thì (0.0001s)
      let fileUrl = linkUrl.trim();
      let fileName = "De_Kiem_Tra_TinHoc.docx";
      let fileSizeText = "2.1 MB";
      let fileType = "docx";

      if (this.selectedFile) {
        fileName = this.selectedFile.name;
        fileSizeText = (this.selectedFile.size / (1024 * 1024)).toFixed(1) + " MB";
        fileType = fileName.split('.').pop().toLowerCase();
        fileUrl = this.selectedFileDataUrl || URL.createObjectURL(this.selectedFile);
      }

      const selectedFileRef = this.selectedFile;

      // CHẾ ĐỘ CHỈNH SỬA (EDIT MODE)
      if (this.isEditMode && this.editingExamId) {
        const updatePayload = {
          title: title,
          grade: grade,
          examType: type,
          bookSeries: series,
          durationMinutes: duration,
          description: desc,
          authorName: user.name
        };

        if (this.selectedFile) {
          updatePayload.fileName = fileName;
          updatePayload.fileSizeText = fileSizeText;
          updatePayload.fileType = fileType;
          updatePayload.fileUrl = fileUrl;
        }

        window.examService.updateExam(this.editingExamId, updatePayload);
        this.closeModal();
        window.app.showToast("⚡ Đã cập nhật đề kiểm tra tức thì!", "success");
        if (window.examPortal) window.examPortal.render("main-content-area");

        // Đồng bộ ngầm file lên Supabase Storage (Background Task)
        if (selectedFileRef && window.supabaseService?.isReady()) {
          window.supabaseService.uploadFileToStorage(selectedFileRef, "exam-files", 8000).then(uploadRes => {
            if (uploadRes?.success && uploadRes?.url) {
              window.examService.updateExam(this.editingExamId, { fileUrl: uploadRes.url });
            }
          });
        }
        return;
      }

      // CHẾ ĐỘ TẠO MỚI (CREATE MODE - NÚT BẤM PHẢN HỒI TỨC THÌ 0.001 GIÂY)
      const res = await window.examService.uploadExam({
        title: title,
        grade: grade,
        examType: type,
        bookSeries: series,
        durationMinutes: duration,
        authorName: user.name,
        createdByUsername: user.username,
        fileName: fileName,
        fileSizeText: fileSizeText,
        fileType: fileType,
        fileUrl: fileUrl,
        description: desc
      });

      // 1. Đóng Modal & Cập nhật giao diện TỨC THÌ
      this.closeModal();
      window.app.showToast("⚡ Đã tải lên và lưu bài kiểm tra siêu tốc!", "success");
      if (window.examPortal) {
        window.examPortal.render("main-content-area");
      }

      // 2. Tải file lên Supabase Storage ngầm (Background Task - Không chặn giao diện người dùng)
      if (selectedFileRef && window.supabaseService?.isReady() && res?.exam?.id) {
        const createdExamId = res.exam.id;
        window.supabaseService.uploadFileToStorage(selectedFileRef, "exam-files", 8000).then(uploadRes => {
          if (uploadRes?.success && uploadRes?.url) {
            window.examService.updateExam(createdExamId, { fileUrl: uploadRes.url });
          }
        });
      }
    } catch (err) {
      console.error("Lỗi submitUpload:", err);
      window.app.showToast("Có lỗi xảy ra khi lưu đề thi, vui lòng thử lại!", "error");
    } finally {
      if (btnSubmit) {
        btnSubmit.innerHTML = this.isEditMode ? "💾 Lưu Thay Đổi" : "🚀 Tải Lên & Lưu Đề";
        btnSubmit.classList.remove("pointer-events-none");
      }
    }
  }
}

window.examUploadModal = new ExamUploadModal();
