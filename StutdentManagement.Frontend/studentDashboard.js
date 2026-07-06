// Redirect back to login if not authenticated
if (!getToken()) {
  window.location.href = "login.html";
}

// Decode JWT if you want to use claims (optional)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const payload = parseJwt(getToken());

// Fetch student data
function loadStudentInfo() {
  showSpinner();
  fetch("http://localhost:5010/api/students/me", {
    headers: { ...authHeaders() }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch student data");
      return res.json();
    })
    .then(student => {
      document.getElementById("studentInfo").innerHTML = `
        <p><strong>Name:</strong> ${student.name}</p>
        <p><strong>Email:</strong> ${student.email}</p>
        <p><strong>Course:</strong> ${student.course}</p>
      `;

      const table = document.getElementById("subjectsTable");
      if (!student.subjects || student.subjects.length === 0) {
        table.innerHTML = "<tr><td colspan='2'>No subjects found</td></tr>";
        return;
      }

      table.innerHTML = `
        <tr><th>Subject</th><th>Marks</th></tr>
        ${student.subjects.map(sub => `
          <tr>
            <td>${sub.name}</td>
            <td>${sub.marks}</td>
          </tr>
        `).join("")}
      `;
    })
    .catch(err => showToast("Error: " + err.message, "error"))
    .finally(() => hideSpinner());
}

// Load data on page load
window.onload = loadStudentInfo;
