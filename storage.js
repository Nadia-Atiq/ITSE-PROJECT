// js/storage.js
// Centralised localStorage utility + seeded demo data for your portal.

const Storage = (function () {
  const KEYS = {
    USERS: "ise_portal_users",
    ATTENDANCE: "ise_portal_attendance",
    RESULTS: "ise_portal_results",
  };

  // ✅ Updated: 5 students with your given names
  const DEFAULT_USERS = [
    { id: "admin1", name: "Admin User", role: "admin", password: "123456" },
    { id: "t1", name: "Teacher One", role: "teacher", password: "123456" },

    { id: "s1", name: "Amna", role: "student", password: "123456" },
    { id: "s2", name: "Alina", role: "student", password: "123456" },
    { id: "s3", name: "Sara", role: "student", password: "123456" },
    { id: "s4", name: "Hamza", role: "student", password: "123456" },
    { id: "s5", name: "Muaz", role: "student", password: "123456" },
  ];

  const DEFAULT_STUDENTS = [
    { id: "s1", name: "Amna" },
    { id: "s2", name: "Alina" },
    { id: "s3", name: "Sara" },
    { id: "s4", name: "Hamza" },
    { id: "s5", name: "Muaz" },
  ];

  function _read(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse localStorage for", key, e);
      return fallback;
    }
  }

  function _write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function init() {
    if (!localStorage.getItem(KEYS.USERS)) {
      _write(KEYS.USERS, { users: DEFAULT_USERS, students: DEFAULT_STUDENTS });
    }
    if (!localStorage.getItem(KEYS.ATTENDANCE)) {
      _write(KEYS.ATTENDANCE, {
        // courseId → studentId → { sessions: number, presents: number, history: [{date,status}] }
        SE1001: {},
      });
    }
    if (!localStorage.getItem(KEYS.RESULTS)) {
      _write(KEYS.RESULTS, {
        // courseId → studentId → { sessional, mid, final, total, grade }
        SE1001: {},
      });
    }
  }

  // ---- Users & Students ----
  function getUserById(id) {
    const payload = _read(KEYS.USERS, { users: [], students: [] });
    return payload.users.find((u) => u.id === id) || null;
  }

  function getStudents() {
    const payload = _read(KEYS.USERS, { users: [], students: [] });
    return payload.students;
  }

  // ---- Attendance ----
  function getAttendanceData() {
    return _read(KEYS.ATTENDANCE, { SE1001: {} });
  }

  function saveAttendanceData(data) {
    _write(KEYS.ATTENDANCE, data);
  }

  // ---- Results ----
  function getResultData() {
    return _read(KEYS.RESULTS, { SE1001: {} });
  }

  function saveResultData(data) {
    _write(KEYS.RESULTS, data);
  }

  return {
    KEYS,
    init,
    getUserById,
    getStudents,
    getAttendanceData,
    saveAttendanceData,
    getResultData,
    saveResultData,
  };
})();

// Initialise as soon as this script is loaded.
Storage.init();
