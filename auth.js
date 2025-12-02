// js/auth.js
// Handles login, logout, and guarding dashboards by role.

(function () {
  const CURRENT_USER_KEY = "ise_portal_current_user";

  function setCurrentUser(user) {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  function getCurrentUser() {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse current user", e);
      return null;
    }
  }

  function clearCurrentUser() {
    sessionStorage.removeItem(CURRENT_USER_KEY);
  }

  // ---- LOGIN PAGE ----
  function initLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const errorEl = document.getElementById("loginError");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const userId = form.userId.value.trim();
      const password = form.password.value;
      const role = form.role.value;

      const user = Storage.getUserById(userId);

      if (!user || user.password !== password || user.role !== role) {
        errorEl.textContent = "Invalid credentials or role. Please try again.";
        errorEl.classList.remove("hidden");
        return;
      }

      errorEl.classList.add("hidden");
      setCurrentUser(user);

      // redirect based on role
      if (role === "admin") window.location.href = "admin.html";
      else if (role === "teacher") window.location.href = "teacher.html";
      else window.location.href = "student.html";
    });
  }

  // ---- DASHBOARD GUARD + HEADER ----
  function guardDashboard() {
    const pageRole = document.body.getAttribute("data-role");
    if (!pageRole) return; // not a dashboard page

    const user = getCurrentUser();
    if (!user || user.role !== pageRole) {
      // Hard fail: send to login
      window.location.replace("index.html");
      return;
    }

    const nameEl = document.getElementById("currentUserName");
    if (nameEl) {
      nameEl.textContent = `${user.name} (${user.role.toUpperCase()})`;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        clearCurrentUser();
        window.location.href = "index.html";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.getAttribute("data-page");

    if (page === "login") {
      initLoginPage();
    }

    guardDashboard();
  });

  // Expose for other modules (e.g. student dashboards)
  window.Auth = {
    getCurrentUser,
  };
})();
