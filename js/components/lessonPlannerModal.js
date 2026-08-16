/**
 * LESSON PLANNER MODAL (TRÌNH SOẠN THẢO GIÁO ÁN CHUẨN CÔNG VĂN 2345)
 * Tích hợp AI Điền Tự Động, Tùy chỉnh 4 bước sư phạm và Lưu trữ
 */

class LessonPlannerModal {
  constructor() {
    this.currentPlanData = null;
  }

  // Khởi tạo và nạp dữ liệu vào form
  init() {
    // Không cần xử lý DOM phức tạp nếu đã có sẵn template trong HTML
  }

  // Kích hoạt Trợ lý AI tự động sinh giáo án theo tên bài
  async generateWithAI() {
    const titleInput = document.getElementById("plan-input-title");
    const gradeSelect = document.getElementById("plan-input-grade");
    const bookSelect = document.getElementById("plan-input-book");
    const durationInput = document.getElementById("plan-input-duration");
    const btnAi = document.getElementById("btn-ai-generate");

    const lessonTitle = titleInput ? titleInput.value.trim() : "";
    const grade = gradeSelect ? gradeSelect.value : 3;
    const book = bookSelect ? bookSelect.value : "Kết nối tri thức với cuộc sống";
    const duration = durationInput ? durationInput.value : "2 tiết";

    if (!lessonTitle) {
      if (window.app) window.app.showToast("Thầy vui lòng nhập Tên Bài Học trước nhé!", "warning");
      return;
    }

    if (btnAi) {
      btnAi.disabled = true;
      btnAi.innerHTML = `<span>⏳ AI Đang Soạn Giáo Án...</span>`;
    }

    if (window.app) window.app.showToast("🤖 Trợ lý AI đang phân tích và chuẩn bị kế hoạch bài dạy 2345...", "info");

    try {
      const plan = await window.aiPlannerService.generateLessonPlan({
        grade,
        book,
        lessonTitle,
        duration
      });

      this.currentPlanData = plan;
      this.populateForm(plan);

      if (window.app) window.app.showToast("✨ Đã hoàn thành soạn giáo án CV 2345 bằng AI!", "success");
    } catch (err) {
      console.error(err);
      if (window.app) window.app.showToast("Có lỗi khi tạo giáo án, vui lòng thử lại!", "error");
    } finally {
      if (btnAi) {
        btnAi.disabled = false;
        btnAi.innerHTML = `<span>✨ AI Tự Động Soạn 2345</span>`;
      }
    }
  }

  // Điền dữ liệu vào form
  populateForm(plan) {
    if (document.getElementById("plan-obj-general")) {
      document.getElementById("plan-obj-general").value = plan.objectives?.competencies?.general || "";
    }
    if (document.getElementById("plan-obj-specific")) {
      document.getElementById("plan-obj-specific").value = plan.objectives?.competencies?.specific || "";
    }
    if (document.getElementById("plan-obj-qualities")) {
      document.getElementById("plan-obj-qualities").value = plan.objectives?.qualities || "";
    }
    if (document.getElementById("plan-equip-teacher")) {
      document.getElementById("plan-equip-teacher").value = plan.equipment?.teacher || "";
    }
    if (document.getElementById("plan-equip-student")) {
      document.getElementById("plan-equip-student").value = plan.equipment?.student || "";
    }

    // Các bước hoạt động
    if (plan.activities && plan.activities.length >= 4) {
      // Khởi động
      if (document.getElementById("act1-content")) document.getElementById("act1-content").value = plan.activities[0].content || "";
      if (document.getElementById("act1-org")) document.getElementById("act1-org").value = plan.activities[0].organization || "";
      
      // Khám phá
      if (document.getElementById("act2-content")) document.getElementById("act2-content").value = plan.activities[1].content || "";
      if (document.getElementById("act2-org")) document.getElementById("act2-org").value = plan.activities[1].organization || "";

      // Luyện tập
      if (document.getElementById("act3-content")) document.getElementById("act3-content").value = plan.activities[2].content || "";
      if (document.getElementById("act3-org")) document.getElementById("act3-org").value = plan.activities[2].organization || "";

      // Vận dụng
      if (document.getElementById("act4-content")) document.getElementById("act4-content").value = plan.activities[3].content || "";
      if (document.getElementById("act4-org")) document.getElementById("act4-org").value = plan.activities[3].organization || "";
    }
  }

  // Thu thập dữ liệu từ Form để lưu
  getFormData() {
    const title = document.getElementById("plan-input-title")?.value || "KẾ HOẠCH BÀI DẠY TIN HỌC";
    const grade = parseInt(document.getElementById("plan-input-grade")?.value || "3");
    const book = document.getElementById("plan-input-book")?.value || "Kết nối tri thức với cuộc sống";
    const duration = document.getElementById("plan-input-duration")?.value || "2 tiết";
    const teacherName = document.getElementById("plan-input-teacher")?.value || "Cô Giáo Anh Đào";

    return {
      title: `KẾ HOẠCH BÀI DẠY: ${title.toUpperCase()}`,
      grade: grade,
      subject: "Tin học",
      book: book,
      duration: duration,
      teacherName: teacherName,
      schoolName: "Trường Tiểu Học Vui Học",
      objectives: {
        competencies: {
          general: document.getElementById("plan-obj-general")?.value || "",
          specific: document.getElementById("plan-obj-specific")?.value || ""
        },
        qualities: document.getElementById("plan-obj-qualities")?.value || ""
      },
      equipment: {
        teacher: document.getElementById("plan-equip-teacher")?.value || "",
        student: document.getElementById("plan-equip-student")?.value || ""
      },
      activities: [
        {
          step: 1,
          name: "1. HOẠT ĐỘNG KHỞI ĐỘNG (5-7 phút)",
          objective: "Tạo hứng thú, kết nối kiến thức thực tế với bài học.",
          content: document.getElementById("act1-content")?.value || "",
          organization: document.getElementById("act1-org")?.value || ""
        },
        {
          step: 2,
          name: "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC (15-18 phút)",
          objective: "Khám phá và tiếp thu các kiến thức trọng tâm mới.",
          content: document.getElementById("act2-content")?.value || "",
          organization: document.getElementById("act2-org")?.value || ""
        },
        {
          step: 3,
          name: "3. HOẠT ĐỘNG LUYỆN TẬP & THỰC HÀNH (10-12 phút)",
          objective: "Rèn luyện kỹ năng qua bài tập và trò chơi tương tác.",
          content: document.getElementById("act3-content")?.value || "",
          organization: document.getElementById("act3-org")?.value || ""
        },
        {
          step: 4,
          name: "4. HOẠT ĐỘNG VẬN DỤNG & MỞ RỘNG (3-5 phút)",
          objective: "Vận dụng kiến thức vào thực tế đời sống.",
          content: document.getElementById("act4-content")?.value || "",
          organization: document.getElementById("act4-org")?.value || ""
        }
      ],
      evaluation: "Học sinh hào hứng, tích cực tham gia các hoạt động và nắm vững kiến thức."
    };
  }

  // Lưu giáo án
  async savePlan() {
    const plan = this.getFormData();
    await window.supabaseService?.saveLessonPlan(plan);
    
    // Đóng Modal và tải lại danh sách
    this.closeModal();
    if (window.teacherPortal) {
      window.teacherPortal.render("main-content-area");
    }
    if (window.app) window.app.showToast("💾 Đã lưu Kế hoạch bài dạy thành công!", "success");
  }

  // Xuất trực tiếp file Word từ form hiện tại
  exportDirectWord() {
    const plan = this.getFormData();
    window.docExportService?.exportToWord(plan);
    if (window.app) window.app.showToast("📄 Đang xuất file Word Kế hoạch bài dạy!", "success");
  }

  closeModal() {
    const modal = document.getElementById("lesson-planner-modal");
    if (modal) modal.classList.remove("active");
  }
}

window.lessonPlannerModal = new LessonPlannerModal();
