// Redirect back to login if not authenticated OR not a student token
(function ensureStudentAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const payload = parseJwt(token);
    const roleClaim = payload.role
      || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const isExpired = payload.exp && Date.now() >= payload.exp * 1000;

    if (isExpired || roleClaim !== "Student") {
      localStorage.removeItem("token");
      localStorage.removeItem("rollNumber");
      window.location.href = "login.html";
    }
  } catch (e) {
    console.error("Failed to parse token:", e);
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
})();

// Fetch student data
function loadStudentInfo() {
  showSpinner();
  fetch("http://localhost:5010/api/students/me", {
    headers: { ...authHeaders() }
  })
    .then(res => {
      if (res.status === 401) {
        showToast("Session expired or invalid. Please log in again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("rollNumber");
        window.location.href = "login.html";
        return null;
      }
      if (!res.ok) throw new Error("Failed to fetch student data");
      return res.json();
    })
    .then(student => {
      if (!student) return; // handled 401 redirect above

      document.getElementById("studentInfo").innerHTML = `
        <p><strong>Name:</strong> ${student.name ?? ""}</p>
        <p><strong>Roll Number:</strong> ${student.rollNumber ?? ""}</p>
        <p><strong>Email:</strong> ${student.email ?? ""}</p>
        <p><strong>Course:</strong> ${student.course ?? ""}</p>
      `;

      const tableBody = document.getElementById("subjectsTableBody");
      if (!student.subjects || student.subjects.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='2'>No subjects found</td></tr>";
        return;
      }

      tableBody.innerHTML = student.subjects.map(sub => `
        <tr>
          <td>${sub.name}</td>
          <td>${sub.marks}</td>
        </tr>
      `).join("");
    })
    .catch(err => showToast("Error: " + err.message, "error"))
    .finally(() => hideSpinner());
}

// Load data on page load
window.onload = loadStudentInfo;