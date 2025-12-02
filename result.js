// js/result.js
// Teacher: enter marks, auto-grade. Student/Admin: view results & KPIs.

(function () {
  const COURSE_ID = "SE1001";

  function getCourseResults() {
    const data = Storage.getResultData();
    if (!data[COURSE_ID]) data[COURSE_ID] = {};
    return data;
  }

  function saveCourseResults(allData) {
    Storage.saveResultData(allData);
  }

  function calculateGrade(total) {
    if (total >= 85) return "A";
    if (total >= 80) return "A-";
    if (total >= 75) return "B+";
    if (total >= 70) return "B";
    if (total >= 65) return "B-";
    if (total >= 60) return "C+";
    if (total >= 55) return "C";
    if (total >= 50) return "D";
    return "F";
  }

  // ---- Teacher view ----
  function initTeacherResults() {
    const tableBody = document.getElementById("resultTableBody");
    const form = document.getElementById("resultForm");
    const messageEl = document.getElementById("resultMessage");
    if (!tableBody || !form) return;

    const students = Storage.getStudents();
    const existingData = getCourseResults()[COURSE_ID] || {};

    tableBody.innerHTML = "";

    students.forEach((s) => {
      const existing = existingData[s.id] || {
        sessional: "",
        mid: "",
        final: "",
      };

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td><input type="number" min="0" max="30" name="sessional-${s.id}" value="${existing.sessional}" /></td>
        <td><input type="number" min="0" max="30" name="mid-${s.id}" value="${existing.mid}" /></td>
        <td><input type="number" min="0" max="40" name="final-${s.id}" value="${existing.final}" /></td>
      `;
      tableBody.appendChild(tr);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const allData = getCourseResults();
      const course = allData[COURSE_ID];

      students.forEach((s) => {
        const sessional = Number(form[`sessional-${s.id}`].value || 0);
        const mid = Number(form[`mid-${s.id}`].value || 0);
        const final = Number(form[`final-${s.id}`].value || 0);
        const total = sessional + mid + final;
        const grade = calculateGrade(total);

        course[s.id] = {
          sessional,
          mid,
          final,
          total,
          grade,
        };
      });

      saveCourseResults(allData);
      messageEl.textContent = "Results saved and grades calculated.";
      messageEl.classList.remove("hidden");
      setTimeout(() => messageEl.classList.add("hidden"), 3000);
    });
  }

  // ---- Student view ----
  function populateStudentResults() {
    const totalEl = document.getElementById("studentTotalMarks");
    const gradeEl = document.getElementById("studentGrade");
    const tableBody = document.getElementById("studentResultTable");

    const user = window.Auth?.getCurrentUser?.();
    if (!user || !totalEl || !gradeEl || !tableBody) return;

    const allData = Storage.getResultData();
    const rec = allData[COURSE_ID]?.[user.id];

    tableBody.innerHTML = "";

    if (!rec) {
      totalEl.textContent = "–";
      gradeEl.textContent = "–";
      return;
    }

    totalEl.textContent = `${rec.total} / 100`;
    gradeEl.textContent = rec.grade;

    const rows = [
      { label: "Sessional", max: 30, value: rec.sessional },
      { label: "Mid", max: 30, value: rec.mid },
      { label: "Final", max: 40, value: rec.final },
    ];

    rows.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.label}</td>
        <td>${r.max}</td>
        <td>${r.value}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // ---- Admin summary table ----
  function populateAdminStudentSummary() {
    const tbody = document.getElementById("adminStudentSummary");
    const metricGrade = document.getElementById("metricGrade");
    const metricStudents = document.getElementById("metricStudents");
    const metricTeachers = document.getElementById("metricTeachers");

    if (!tbody) return;

    const students = Storage.getStudents();
    const allResults = Storage.getResultData()[COURSE_ID] || {};
    const allAttendance = Storage.getAttendanceData()[COURSE_ID] || {};

    tbody.innerHTML = "";

    let gradeSum = 0;
    let gradeCount = 0;

    students.forEach((s) => {
      const res = allResults[s.id];
      const att = allAttendance[s.id];

      let attendancePercent = "–";
      if (att && att.sessions > 0) {
        attendancePercent = ((att.presents / att.sessions) * 100).toFixed(1) + "%";
      }

      let total = "–";
      let grade = "–";
      if (res) {
        total = res.total;
        grade = res.grade;
        gradeSum += res.total;
        gradeCount += 1;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${attendancePercent}</td>
        <td>${total}</td>
        <td>${grade}</td>
      `;
      tbody.appendChild(tr);
    });

    if (metricGrade && gradeCount > 0) {
      const avgTotal = gradeSum / gradeCount;
      metricGrade.textContent = `${avgTotal.toFixed(1)} / 100`;
    }

    if (metricStudents) metricStudents.textContent = students.length.toString();
    if (metricTeachers) {
      // In this simple demo we have exactly one teacher in seed data.
      metricTeachers.textContent = "1";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.getAttribute("data-page");

    if (page === "teacher-dashboard") {
      initTeacherResults();
    }

    if (page === "student-dashboard") {
      populateStudentResults();

      const user = window.Auth?.getCurrentUser?.();
      const firstNameEl = document.getElementById("studentFirstName");
      if (user && firstNameEl) {
        firstNameEl.textContent = user.name.split(" ")[0];
      }
    }

    if (page === "admin-dashboard") {
      populateAdminStudentSummary();
    }
  });
})();
