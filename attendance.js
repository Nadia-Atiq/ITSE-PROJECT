// js/attendance.js
// Teacher: mark attendance      Student/Admin: read attendance & compute KPIs.

(function () {
  const COURSE_ID = "SE1001";

  function getCourseAttendance() {
    const data = Storage.getAttendanceData();
    if (!data[COURSE_ID]) data[COURSE_ID] = {};
    return data;
  }

  function saveCourseAttendance(allData) {
    Storage.saveAttendanceData(allData);
  }

  // ---- Teacher view ----
  function initTeacherAttendance() {
    const tableBody = document.getElementById("attendanceTableBody");
    const form = document.getElementById("attendanceForm");
    const messageEl = document.getElementById("attendanceMessage");

    if (!tableBody || !form) return;

    const students = Storage.getStudents();
    tableBody.innerHTML = "";

    students.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>
          <select name="status-${s.id}">
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const dateInput = document.getElementById("attendanceDate");
      const dateValue = dateInput.value;
      if (!dateValue) {
        alert("Please select a date first.");
        return;
      }

      const allData = getCourseAttendance();
      const course = allData[COURSE_ID];

      students.forEach((s) => {
        const status = form[`status-${s.id}`].value;
        if (!course[s.id]) {
          course[s.id] = {
            sessions: 0,
            presents: 0,
            history: [],
          };
        }
        const record = course[s.id];
        record.sessions += 1;
        if (status === "present") record.presents += 1;
        record.history.push({ date: dateValue, status });
      });

      saveCourseAttendance(allData);
      messageEl.textContent = "Attendance saved successfully for this session.";
      messageEl.classList.remove("hidden");
      setTimeout(() => messageEl.classList.add("hidden"), 3000);

      // simple metric for overview
      const todaySessions = document.getElementById("teacherTodaySessions");
      if (todaySessions) {
        const existing = Number(todaySessions.dataset.count || "0") + 1;
        todaySessions.dataset.count = existing;
        todaySessions.textContent = existing.toString();
      }
    });

    const studentCountEl = document.getElementById("teacherStudentCount");
    if (studentCountEl) {
      studentCountEl.textContent = students.length.toString();
    }
  }

  // ---- Student view ----
  function populateStudentAttendance() {
    const tableBody = document.getElementById("studentAttendanceTable");
    const percentEl = document.getElementById("studentAttendancePercent");
    const detailEl = document.getElementById("studentAttendanceDetail");
    const user = window.Auth?.getCurrentUser?.();
    if (!user || !tableBody || !percentEl || !detailEl) return;

    const allData = Storage.getAttendanceData();
    const record = allData[COURSE_ID]?.[user.id];

    tableBody.innerHTML = "";

    if (!record || record.sessions === 0) {
      percentEl.textContent = "0%";
      detailEl.textContent = "No attendance has been recorded yet.";
      return;
    }

    const percentage = ((record.presents / record.sessions) * 100).toFixed(1);
    percentEl.textContent = `${percentage}%`;
    detailEl.textContent = `${record.presents} out of ${record.sessions} sessions marked Present.`;

    record.history.forEach((h) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${h.date}</td>
        <td>${h.status === "present" ? "Present ✅" : "Absent ❌"}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // ---- Admin overview ----
  function populateAdminAttendanceMetric() {
    const metricEl = document.getElementById("metricAttendance");
    if (!metricEl) return;
    const allData = Storage.getAttendanceData();
    const course = allData[COURSE_ID] || {};
    const students = Object.values(course);
    if (students.length === 0) {
      metricEl.textContent = "–";
      return;
    }

    let sumPercent = 0;
    students.forEach((rec) => {
      if (rec.sessions > 0) {
        sumPercent += (rec.presents / rec.sessions) * 100;
      }
    });

    const avg = (sumPercent / students.length).toFixed(1);
    metricEl.textContent = `${avg}%`;
  }

  // Dispatch based on page
  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.getAttribute("data-page");

    if (page === "teacher-dashboard") {
      initTeacherAttendance();
    }

    if (page === "student-dashboard") {
      populateStudentAttendance();
    }

    if (page === "admin-dashboard") {
      populateAdminAttendanceMetric();
    }
  });

  // Expose helper for Results module to reuse history if needed
  window.AttendanceModule = {
    COURSE_ID,
  };
})();
