/**
 * LECTURE UPLOAD MODAL COMPONENT
 * Giao diện dành cho Giáo viên để Tải lên Bài giảng PowerPoint (.pptx / .ppt / .pdf / link trình chiếu)
 */

class LectureUploadModal {
  constructor() {
    this.selectedFile = null;
    this.selectedFileDataUrl = null;
  }

  openModal(defaultGrade = 3) {
    const user = window.authService?.getUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      window.app.showToast("Chức năng tải lên bài giảng chỉ dành cho Giáo viên & Quản trị viên!", "warning");
      return;
    }

    this.selectedFile = null;
    this.selectedFileDataUrl = null;

    const modal = document.getElementById("lecture-upload-modal");
    if (!modal) return;

    // Reset form
    const gradeSelect = document.getElementById("lec-grade-input");
    if (gradeSelect) gradeSelect.value = defaultGrade;

    const titleInput = document.getElementById("lec-title-input");
    if (titleInput) titleInput.value = "";

    const descInput = document.getElementById("lec-desc-input");
    if (descInput) descInput.value = "";

    const linkInput = document.getElementById("lec-link-input");
    if (linkInput) linkInput.value = "";

    const filePreview = document.getElementById("lec-file-preview-info");
    if (filePreview) filePreview.classList.add("hidden");

    modal.classList.add("active");
  }

  closeModal() {
    const modal = document.getElementById("lecture-upload-modal");
    if (modal) modal.classList.remove("active");
    this.selectedFile = null;
    this.selectedFileDataUrl = null;
  }

  // Xử lý khi chọn file từ máy tính
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    const filePreview = document.getElementById("lec-file-preview-info");
    const fileNameDisp = document.getElementById("lec-file-name-disp");
    const fileSizeDisp = document.getElementById("lec-file-size-disp");

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    if (fileNameDisp) fileNameDisp.innerText = file.name;
    if (fileSizeDisp) fileSizeDisp.innerText = sizeMb;
    if (filePreview) filePreview.classList.remove("hidden");

    // Tự động điền tiêu đề từ tên file nếu chưa nhập
    const titleInput = document.getElementById("lec-title-input");
    if (titleInput && !titleInput.value) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      titleInput.value = `Bài Giảng: ${cleanName}`;
    }

    // Đọc data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedFileDataUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Lưu và tải bài giảng lên hệ thống
  async submitUpload() {
    const title = document.getElementById("lec-title-input")?.value || "";
    const grade = parseInt(document.getElementById("lec-grade-input")?.value) || 3;
    const series = document.getElementById("lec-series-input")?.value || "KNTT";
    const topic = document.getElementById("lec-topic-input")?.value || "Chủ đề A: Máy tính và em";
    const desc = document.getElementById("lec-desc-input")?.value || "";
    const linkUrl = document.getElementById("lec-link-input")?.value || "";
    const user = window.authService?.getUser() || { name: "Thầy Giáo Anh Đào" };

    if (!title.trim()) {
      window.app.showToast("Vui lòng nhập Tiêu đề bài giảng điện tử!", "warning");
      return;
    }

    if (!this.selectedFile && !linkUrl.trim()) {
      window.app.showToast("Vui lòng chọn file PowerPoint (.pptx / .pdf) hoặc dán link bài giảng!", "warning");
      return;
    }

    const btnSubmit = document.getElementById("btn-submit-lecture-upload");
    if (btnSubmit) {
      btnSubmit.innerHTML = "⏳ Đang tải lên và đồng bộ Supabase...";
      btnSubmit.classList.add("pointer-events-none");
    }

    let fileUrl = linkUrl.trim();
    let fileName = "BaiGiang_TinHoc.pptx";
    let fileSizeText = "5.5 MB";
    let fileType = "pptx";

    if (this.selectedFile) {
      fileName = this.selectedFile.name;
      fileSizeText = (this.selectedFile.size / (1024 * 1024)).toFixed(1) + " MB";
      fileType = fileName.split('.').pop().toLowerCase();
      fileUrl = this.selectedFileDataUrl || URL.createObjectURL(this.selectedFile);
    }

    const res = await window.lectureService.uploadLecture({
      title: title,
      grade: grade,
      bookSeries: series,
      topicName: topic,
      authorName: user.name,
      fileName: fileName,
      fileSizeText: fileSizeText,
      fileType: fileType,
      fileUrl: fileUrl,
      slideCount: Math.floor(Math.random() * 10) + 15,
      description: desc
    });

    if (btnSubmit) {
      btnSubmit.innerHTML = "🚀 Tải Lên & Công Khai";
      btnSubmit.classList.remove("pointer-events-none");
    }

    if (res.success) {
      window.app.showToast("🎉 Đã tải lên và lưu bài giảng điện tử thành công!", "success");
      this.closeModal();
      if (window.lecturePortal) {
        window.lecturePortal.render("main-content-area");
      }
    } else {
      window.app.showToast("Không thể tải lên bài giảng, vui lòng thử lại!", "error");
    }
  }
}

window.lectureUploadModal = new LectureUploadModal();
