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
  }

  // Xử lý khi chọn file từ máy tính
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    const filePreview = document.getElementById("exam-file-preview-info");
    const fileNameDisp = document.getElementById("exam-file-name-disp");
    const fileSizeDisp = document.getElementById("exam-file-size-disp");

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    if (fileNameDisp) fileNameDisp.innerText = file.name + " (File mới thay thế)";
    if (fileSizeDisp) fileSizeDisp.innerText = sizeMb;
    if (filePreview) filePreview.classList.remove("hidden");

    // Tự động điền tiêu đề nếu chưa có
    const titleInput = document.getElementById("exam-title-input");
    if (!this.isEditMode && titleInput && !titleInput.value) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      titleInput.value = `Đề Kiểm Tra: ${cleanName}`;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedFileDataUrl = e.target.result;
    };
    reader.readAsDataURL(file);
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

  // Lưu và tải đề thi lên hệ thống
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
    if (btnSubmit) {
      btnSubmit.innerHTML = "⏳ Đang lưu và đồng bộ Supabase...";
      btnSubmit.classList.add("pointer-events-none");
    }

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
        updatePayload.fileName = this.selectedFile.name;
        updatePayload.fileSizeText = (this.selectedFile.size / (1024 * 1024)).toFixed(1) + " MB";
        updatePayload.fileType = this.selectedFile.name.split('.').pop().toLowerCase();
        updatePayload.fileUrl = this.selectedFileDataUrl || URL.createObjectURL(this.selectedFile);
      } else if (linkUrl.trim() && linkUrl !== this.existingExam?.fileUrl) {
        updatePayload.fileUrl = linkUrl.trim();
      }

      const res = await window.examService.updateExam(this.editingExamId, updatePayload);

      if (btnSubmit) {
        btnSubmit.innerHTML = "💾 Lưu Thay Đổi";
        btnSubmit.classList.remove("pointer-events-none");
      }

      if (res.success) {
        window.app.showToast("🎉 Đã cập nhật đề kiểm tra thành công!", "success");
        this.closeModal();
        if (window.examPortal) window.examPortal.render("main-content-area");
      } else {
        window.app.showToast("Không thể cập nhật đề kiểm tra, vui lòng thử lại!", "error");
      }
      return;
    }

    // CHẾ ĐỘ TẠO MỚI (CREATE MODE)
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

    if (btnSubmit) {
      btnSubmit.innerHTML = "🚀 Tải Lên & Lưu Đề";
      btnSubmit.classList.remove("pointer-events-none");
    }

    if (res.success) {
      window.app.showToast("🎉 Đã tải lên và đồng bộ đề kiểm tra lên Supabase thành công!", "success");
      this.closeModal();
      if (window.examPortal) {
        window.examPortal.render("main-content-area");
      }
    } else {
      window.app.showToast("Không thể tải lên đề thi, vui lòng thử lại!", "error");
    }
  }
}

window.examUploadModal = new ExamUploadModal();
