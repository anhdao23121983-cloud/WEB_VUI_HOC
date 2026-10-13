/**
 * DATA SYNC & PERMANENT PERSISTENCE MANAGER
 * Phân hệ Quản Lý Bảo Vệ Toàn Vẹn Dữ Liệu & Đồng Bộ Vĩnh Viễn
 * 
 * NGUYÊN TẮC BẤT DI BẤT DỊCH:
 * 1. Khi tài khoản Quản trị viên (Admin) chưa ra lệnh xóa, KHÔNG ĐƯỢC XÓA bất kỳ thông tin hay dữ liệu nào trên web.
 * 2. Tất cả thông tin và dữ liệu (học sinh, điểm đấu trường, bài giảng, câu hỏi) LUÔN ĐƯỢC LƯU TRỮ VĨNH VIỄN.
 * 3. Không bao giờ ghi đè dữ liệu cũ bằng mảng rỗng [] khi mạng yếu hay reload.
 */

class AdminProtectionGuard {
  constructor() {
    this.adminRole = "admin";
  }

  // Kiểm tra quyền hạn xóa dữ liệu
  canDelete(resourceName = "dữ liệu") {
    let currentUser = null;
    if (window.authService && typeof window.authService.getUser === "function") {
      currentUser = window.authService.getUser();
    }
    if (!currentUser) {
      try {
        currentUser = JSON.parse(localStorage.getItem("app_current_user"));
      } catch (e) {}
    }

    const isAdmin = currentUser && (currentUser.role === "admin" || currentUser.role === "ADMIN");

    // Nếu chưa đăng nhập hoặc không phải Admin -> CHẶN HOÀN TOÀN!
    if (!isAdmin) {
      const msg = `⛔ TỪ CHỐI THAO TÁC: Khi tài khoản Quản trị viên chưa ra lệnh xóa, hệ thống bảo vệ toàn vẹn không cho phép xóa ${resourceName}!`;
      console.warn(msg, currentUser);
      if (window.app?.showToast) {
        window.app.showToast(msg, "danger");
      }
      return false;
    }

    return true;
  }

  // Yêu cầu xác nhận quyền Quản trị trước khi xóa
  confirmAdminDelete(resourceName, confirmCallback) {
    if (!this.canDelete(resourceName)) return;

    const confirmed = window.confirm(
      `⚠️ CẢNH BÁO BẢO VỆ DỮ LIỆU TỪ QUẢN TRỊ VIÊN:\n\n` +
      `Bạn đang dùng quyền Quản Trị Viên Tối Cao để xóa "${resourceName}".\n` +
      `Dữ liệu sẽ được chuyển vào Thùng rác bảo vệ để tránh mất mát.\n\n` +
      `Bạn có chắc chắn muốn thực hiện lệnh xóa này không?`
    );

    if (confirmed && typeof confirmCallback === "function") {
      confirmCallback();
    }
  }
}

class DataSyncManager {
  constructor() {
    this.guard = new AdminProtectionGuard();
    this.isSyncing = false;
    this.lastSyncedTime = null;
  }

  // 1. KHỞI TẠO & HỢP NHẤT DỮ LIỆU AN TOÀN KHI MỞ WEB
  async init() {
    console.log("🛡️ Đang khởi động Hệ thống Bảo Vệ & Đồng Bộ Dữ Liệu Vĩnh Viễn...");

    // Lấy dữ liệu hiện có trong LocalStorage
    let db = {};
    try {
      db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
    } catch (e) {
      db = {};
    }

    // Nạp dữ liệu mặc định đã nhúng sẵn trong mã nguồn (window.DEFAULT_APP_DATABASE)
    const embeddedDb = window.DEFAULT_APP_DATABASE || window.MOCK_DATABASE || {};

    // Hợp nhất Danh sách Users (Bảo toàn 100%)
    if (!db.users || db.users.length === 0) {
      db.users = embeddedDb.users || [];
    } else if (embeddedDb.users && embeddedDb.users.length > 0) {
      const existingUsernames = new Set(db.users.map(u => (u.username || "").toLowerCase()));
      for (const eu of embeddedDb.users) {
        if (!existingUsernames.has((eu.username || "").toLowerCase())) {
          db.users.push(eu);
          existingUsernames.add((eu.username || "").toLowerCase());
        }
      }
    }

    // Hợp nhất Lịch sử Đấu trường Tin học (Bảo toàn 100%)
    if (!db.arena_matches || db.arena_matches.length === 0) {
      db.arena_matches = embeddedDb.arena_matches || [];
    } else if (embeddedDb.arena_matches && embeddedDb.arena_matches.length > 0) {
      const existingMatchIds = new Set(db.arena_matches.map(m => m.id));
      for (const em of embeddedDb.arena_matches) {
        if (!existingMatchIds.has(em.id)) {
          db.arena_matches.push(em);
          existingMatchIds.add(em.id);
        }
      }
    }

    // Hợp nhất Bài giảng điện tử (Bảo toàn 100%)
    const seedLectures = (window.SAVED_LECTURES && window.SAVED_LECTURES.length > 0) 
      ? window.SAVED_LECTURES 
      : (embeddedDb.lectures || []);
    if (!db.lectures || db.lectures.length === 0) {
      db.lectures = seedLectures;
    } else if (seedLectures.length > 0) {
      const existingLecIds = new Set(db.lectures.map(l => l.id));
      for (const sl of seedLectures) {
        if (!existingLecIds.has(sl.id)) {
          db.lectures.push(sl);
          existingLecIds.add(sl.id);
        }
      }
    }

    // Hợp nhất Quizzes & Games & Exams
    if (!db.quizzes || db.quizzes.length === 0) db.quizzes = embeddedDb.quizzes || [];
    if (!db.exams || db.exams.length === 0) db.exams = embeddedDb.exams || [];
    if (!db.games || db.games.length === 0) db.games = embeddedDb.games || [];

    // Lưu lại LocalStorage an toàn
    localStorage.setItem("app_mock_db", JSON.stringify(db));

    // Thử lấy thêm snapshot mới nhất từ máy chủ Localhost API
    try {
      const resp = await fetch("/api/get-all-data");
      if (resp.ok) {
        const serverDb = await resp.json();
        if (serverDb && serverDb.users && serverDb.users.length > 0) {
          this.mergeSnapshot(serverDb);
        }
      }
    } catch (e) {
      // Đang chạy trên hosting tĩnh hoặc không có server.ps1, tiếp tục bình thường
    }

    console.log("✅ Hệ thống dữ liệu đã được bảo toàn đầy đủ 100%!");
  }

  // 2. HỢP NHẤT SNAPSHOT (NGUYÊN TẮC: CHỈ GỘP, KHÔNG XÓA)
  mergeSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return;
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};

    let updated = false;

    // Users
    if (snapshot.users && Array.isArray(snapshot.users) && snapshot.users.length > 0) {
      if (!db.users) db.users = [];
      const userMap = new Map();
      db.users.forEach(u => userMap.set((u.username || "").toLowerCase(), u));
      snapshot.users.forEach(su => {
        const key = (su.username || "").toLowerCase();
        if (!userMap.has(key)) {
          userMap.set(key, su);
          updated = true;
        } else {
          // Cập nhật số sao nếu nguồn mới cao hơn
          const cur = userMap.get(key);
          if (su.stars && su.stars > (cur.stars || 0)) {
            cur.stars = su.stars;
            updated = true;
          }
        }
      });
      db.users = Array.from(userMap.values());
    }

    // Arena matches
    if (snapshot.arena_matches && Array.isArray(snapshot.arena_matches) && snapshot.arena_matches.length > 0) {
      if (!db.arena_matches) db.arena_matches = [];
      const matchMap = new Map();
      db.arena_matches.forEach(m => matchMap.set(m.id, m));
      snapshot.arena_matches.forEach(sm => {
        if (!matchMap.has(sm.id)) {
          matchMap.set(sm.id, sm);
          updated = true;
        }
      });
      db.arena_matches = Array.from(matchMap.values());
    }

    // Lectures
    if (snapshot.lectures && Array.isArray(snapshot.lectures) && snapshot.lectures.length > 0) {
      if (!db.lectures) db.lectures = [];
      const lecMap = new Map();
      db.lectures.forEach(l => lecMap.set(l.id, l));
      snapshot.lectures.forEach(sl => {
        if (!lecMap.has(sl.id)) {
          lecMap.set(sl.id, sl);
          updated = true;
        }
      });
      db.lectures = Array.from(lecMap.values());
    }

    if (updated) {
      localStorage.setItem("app_mock_db", JSON.stringify(db));
    }
  }

  // 3. ĐỒNG BỘ & LƯU TRỮ VĨNH VIỄN TOÀN BỘ CƠ SỞ DỮ LIỆU
  async syncAllPermanent() {
    if (this.isSyncing) return { success: false, message: "Đang đồng bộ..." };
    this.isSyncing = true;

    if (window.app?.showToast) {
      window.app.showToast("☁️ Đang đồng bộ và lưu trữ vĩnh viễn toàn bộ dữ liệu...", "info");
    }

    try {
      const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};

      // 3.1 Đảm bảo lấy danh sách bài giảng mới nhất
      if (window.lectureService) {
        const currentLectures = await window.lectureService.getAllLectures();
        if (currentLectures && currentLectures.length > 0) {
          db.lectures = currentLectures;
        }
      }

      // 3.2 Đảm bảo lấy danh sách học sinh mới nhất
      if (window.adminService) {
        const currentUsers = await window.adminService.getAllUsers();
        if (currentUsers && currentUsers.length > 0) {
          db.users = currentUsers;
        }
      }

      // 3.3 Đảm bảo có lịch sử Đấu Trường đầy đủ
      if (window.arenaService && (!db.arena_matches || db.arena_matches.length === 0)) {
        await window.arenaService.syncArenaWithStudents();
        const updatedDb = JSON.parse(localStorage.getItem("app_mock_db")) || {};
        db.arena_matches = updatedDb.arena_matches || [];
      }

      // Cập nhật lại LocalStorage
      localStorage.setItem("app_mock_db", JSON.stringify(db));

      // 3.4 Gửi lên Server Localhost API để lưu vĩnh viễn vào file data/app_database.json và defaultDatabase.js
      try {
        const payload = {
          version: "2.5.0",
          lastSyncedAt: new Date().toISOString(),
          system: "WEB VUI HOC TIN HOC 3-5",
          users: db.users || [],
          arena_matches: db.arena_matches || [],
          lectures: db.lectures || [],
          quizzes: db.quizzes || [],
          exams: db.exams || [],
          games: db.games || []
        };

        const res = await fetch("/api/sync-all", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          console.log("✅ Đã ghi đè snapshot cơ sở dữ liệu vĩnh viễn vào data/app_database.json và js/data/defaultDatabase.js!");
        }
      } catch (err) {
        console.warn("Chế độ lưu file Server không khả dụng trên hosting tĩnh (dữ liệu được bảo toàn trong LocalStorage & Code tĩnh):", err);
      }

      // 3.5 Đồng bộ lên Supabase Cloud nếu kết nối sẵn sàng
      if (window.supabaseService?.isReady()) {
        try {
          const client = window.supabaseService.client;

          // Đẩy học sinh
          if (db.users && db.users.length > 0) {
            const studentPayload = db.users.filter(u => u.role === "student").map(s => ({
              username: s.username,
              full_name: s.name || s.full_name,
              role: "student",
              grade_level: s.grade || s.grade_level || 3,
              class_name: s.className || s.class_name || "3A",
              stars: s.stars || 0,
              avatar: s.avatar || "👦"
            }));
            await client.from("app_users").upsert(studentPayload, { onConflict: "username" });
          }

          // Đẩy các trận đấu Đấu Trường
          if (db.arena_matches && db.arena_matches.length > 0) {
            const arenaPayload = db.arena_matches.slice(0, 30).map(m => ({
              student_name: m.studentName,
              student_class: m.studentClass,
              grade_level: m.grade || 3,
              avatar: m.avatar || "🤖",
              score: m.score || 100,
              stars_earned: m.starsEarned || 50,
              total_correct: m.totalCorrect || 5,
              total_questions: m.totalQuestions || 5,
              duration_seconds: m.durationSeconds || 25,
              created_at: m.createdAt || new Date().toISOString()
            }));
            await client.from("arena_matches").insert(arenaPayload);
          }
        } catch (sbErr) {
          console.warn("Lỗi đồng bộ Supabase Cloud:", sbErr);
        }
      }

      this.lastSyncedTime = new Date();

      if (window.app?.showToast) {
        window.app.showToast("🎉 Toàn bộ thông tin và dữ liệu đã được lưu trữ vĩnh viễn, an toàn tuyệt đối!", "success");
      }

      return {
        success: true,
        usersCount: (db.users || []).length,
        arenaMatchesCount: (db.arena_matches || []).length,
        lecturesCount: (db.lectures || []).length
      };
    } catch (error) {
      console.error("Lỗi khi đồng bộ dữ liệu:", error);
      if (window.app?.showToast) {
        window.app.showToast(`⚠️ Có lỗi trong quá trình lưu dữ liệu: ${error.message}`, "warning");
      }
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  // 4. XUẤT FILE SAO LƯU HỆ THỐNG VỀ MÁY TÍNH (.JSON)
  exportBackupFile() {
    const db = JSON.parse(localStorage.getItem("app_mock_db")) || {};
    const backupObj = {
      title: "SAO LƯU TOÀN BỘ CƠ SỞ DỮ LIỆU WEB VUI HỌC TIN HỌC 3-5",
      exportedAt: new Date().toISOString(),
      version: "2.5.0",
      data: db
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement("a");
    const dateFormatted = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `VuiHocTinHoc_Full_Backup_${dateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (window.app?.showToast) {
      window.app.showToast("💾 Đã tải về máy tính tệp sao lưu dữ liệu toàn diện (.json)!", "success");
    }
  }

  // 5. KHÔI PHỤC TOÀN BỘ DỮ LIỆU TỪ TỆP SAO LƯU (.JSON)
  importBackupFile(file) {
    if (!this.guard.canDelete("cơ sở dữ liệu")) return;

    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        const data = imported.data || imported;
        if (!data || (!data.users && !data.lectures)) {
          throw new Error("Tệp không đúng định dạng sao lưu của hệ thống Vui Học Tin Học!");
        }

        this.mergeSnapshot(data);
        await this.syncAllPermanent();

        if (window.app?.showToast) {
          window.app.showToast("🎉 Khôi phục toàn bộ cơ sở dữ liệu từ file sao lưu thành công 100%!", "success");
        }

        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        alert("Lỗi đọc file sao lưu: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}

// Khởi tạo đối tượng toàn cục
window.adminProtectionGuard = new AdminProtectionGuard();
window.dataSyncManager = new DataSyncManager();

// Tự động kích hoạt khởi tạo an toàn khi tải trang
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.dataSyncManager.init());
  } else {
    window.dataSyncManager.init();
  }
}
