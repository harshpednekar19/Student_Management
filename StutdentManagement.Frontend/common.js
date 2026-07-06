// Spinner control
function showSpinner() {
  const spinner = document.getElementById("spinner");
  if (spinner) spinner.style.display = "block";
}

function hideSpinner() {
  const spinner = document.getElementById("spinner");
  if (spinner) spinner.style.display = "none";
}

// Toast notifications
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`; // expects CSS classes: .toast.success, .toast.error, .toast.info
  toast.innerText = message;
  container.appendChild(toast);

  // Animate toast
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 500);
  }, 3000);
}

// Logout helper
function logout(redirectPage = "login.html") {
  localStorage.removeItem("token");
  showToast("Logged out successfully", "info");
  window.location.href = redirectPage;
}

// Helper: get token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Helper: attach Authorization header
function authHeaders() {
  const token = getToken();
  return token ? { "Authorization": `Bearer ${token}` } : {};
}
