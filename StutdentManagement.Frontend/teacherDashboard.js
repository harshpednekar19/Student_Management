// Redirect back to login if not authenticated OR not a teacher token
(function ensureTeacherAuth() {
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

    if (isExpired || roleClaim !== "Teacher") {
      localStorage.removeItem("token");
      localStorage.removeItem("rollNumber");
      window.location.href = "login.html";
    }
  } catch (e) {
    // Malformed token — clear it and bounce to login
    console.error("Failed to parse token:", e);
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
})();

// Helper to build auth headers
function authHeaders() {
  const token = localStorage.getItem("token");
  return { "Authorization": `Bearer ${token}` };
}

// Keep the latest student list around so dynamic UI (dropdown, etc.) can use it
let currentStudents = [];

// Fetch and render all students
async function fetchStudents() {
  showSpinner();
  try {
    const res = await fetch("http://localhost:5010/api/students", {
      headers: { "Content-Type": "application/json", ...authHeaders() }
    });

    if (res.status === 401) {
      showToast("Session expired or invalid. Please log in again.", "error");
      localStorage.removeItem("token");
      localStorage.removeItem("rollNumber");
      window.location.href = "login.html";
      return;
    }

    if (!res.ok) {
      const errorText = await res.text(); // ✅ capture backend error
      throw new Error(errorText || `Request failed (${res.status})`);
    }

    const data = await res.json();
    currentStudents = data;
    renderStudents(data);
    renderSummary(data);
    renderStudentDropdown(data);
  } catch (err) {
    showToast("Error fetching students: " + err.message, "error");
    console.error("FetchStudents error:", err); // ✅ log full error
  } finally {
    hideSpinner();
  }
}

// Add student
document.getElementById("addStudentForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value.trim();
  const rollNumber = document.getElementById("rollNumber").value.trim();

  showSpinner();
  try {
    const res = await fetch("http://localhost:5010/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name, email, course, rollNumber })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    showToast("Student added successfully!", "success");
    document.getElementById("addStudentForm").reset();
    fetchStudents();
  } catch (err) {
    showToast("Error adding student: " + err.message, "error");
    console.error("AddStudent error:", err);
  } finally {
    hideSpinner();
  }
});

// Delete student
async function deleteStudent(id) {
  showSpinner();
  try {
    const res = await fetch(`http://localhost:5010/api/students/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    showToast("Student deleted successfully!", "success");
    fetchStudents();
  } catch (err) {
    showToast("Error deleting student: " + err.message, "error");
    console.error("DeleteStudent error:", err);
  } finally {
    hideSpinner();
  }
}

// --- Populate the "Student" dropdown in the Add Subjects form ---
function renderStudentDropdown(students) {
  const select = document.getElementById("subjectStudentSelect");
  const previouslySelected = select.value;

  select.innerHTML = `<option value="">-- Select a student --</option>` +
    students.map(s =>
      `<option value="${s.rollNumber}">${s.name ?? "(no name)"} — ${s.rollNumber}</option>`
    ).join("");

  // Preserve selection across re-renders (e.g. after adding subjects)
  if ([...select.options].some(o => o.value === previouslySelected)) {
    select.value = previouslySelected;
  }
}

// --- Dynamic subject+marks rows ---
function createSubjectRow() {
  const row = document.createElement("div");
  row.className = "subject-row";
  row.innerHTML = `
    <input type="text" class="subject-name-input" placeholder="Subject name" required>
    <input type="number" class="subject-marks-input" placeholder="Marks" min="0" max="100" required>
    <button type="button" class="remove-row-btn" title="Remove this subject">✕</button>
  `;
  row.querySelector(".remove-row-btn").addEventListener("click", () => {
    const rowsContainer = document.getElementById("subjectRows");
    // Always keep at least one row so the form remains usable
    if (rowsContainer.children.length > 1) {
      row.remove();
    } else {
      row.querySelector(".subject-name-input").value = "";
      row.querySelector(".subject-marks-input").value = "";
    }
  });
  return row;
}

function resetSubjectRows() {
  const rowsContainer = document.getElementById("subjectRows");
  rowsContainer.innerHTML = "";
  rowsContainer.appendChild(createSubjectRow());
}

document.getElementById("addSubjectRowBtn").addEventListener("click", () => {
  document.getElementById("subjectRows").appendChild(createSubjectRow());
});

// Start with one empty subject row
resetSubjectRows();

// --- Submit all subject+marks rows at once via the bulk endpoint ---
document.getElementById("addSubjectsForm").addEventListener("submit", async e => {
  e.preventDefault();

  const rollNumber = document.getElementById("subjectStudentSelect").value;
  if (!rollNumber) {
    showToast("Please select a student first.", "error");
    return;
  }

  const rows = [...document.querySelectorAll("#subjectRows .subject-row")];
  const subjects = rows.map(row => ({
    name: row.querySelector(".subject-name-input").value.trim(),
    marks: parseInt(row.querySelector(".subject-marks-input").value, 10)
  })).filter(s => s.name !== "" && !Number.isNaN(s.marks));

  if (subjects.length === 0) {
    showToast("Add at least one subject with marks.", "error");
    return;
  }

  showSpinner();
  try {
    const res = await fetch(`http://localhost:5010/api/students/${rollNumber}/subjects/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(subjects)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `Request failed (${res.status})`);
    }

    showToast(
      `${subjects.length} subject${subjects.length > 1 ? "s" : ""} added successfully!`,
      "success"
    );
    resetSubjectRows();
    fetchStudents();
  } catch (err) {
    showToast("Error adding subjects: " + err.message, "error");
    console.error("AddSubjects error:", err);
  } finally {
    hideSpinner();
  }
});

function renderStudents(students) {
  const tableBody = document.getElementById("studentsTableBody");
  tableBody.innerHTML = "";

  students.forEach(s => {
    const subjectsSummary =
      s.subjects && s.subjects.length > 0
        ? s.subjects.map(sub => `${sub.name}: ${sub.marks}`).join(", ")
        : "No subjects yet";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.name ?? ""}</td>
      <td>${s.email}</td>
      <td>${s.course ?? ""}</td>
      <td>${s.rollNumber}</td>
      <td>${subjectsSummary}</td>
      <td>
        <button class="delete" onclick="deleteStudent(${s.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function renderSummary(students) {
  const summaryBody = document.getElementById("summaryTableBody");
  summaryBody.innerHTML = "";

  students.forEach(s => {
    if (s.subjects && s.subjects.length > 0) {
      s.subjects.forEach(sub => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${s.name ?? ""}</td>
          <td>${s.email}</td>
          <td>${s.rollNumber}</td>
          <td>${s.course ?? ""}</td>
          <td>${sub.name}</td>
          <td>${sub.marks}</td>
        `;
        summaryBody.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.name ?? ""}</td>
        <td>${s.email}</td>
        <td>${s.rollNumber}</td>
        <td>${s.course ?? ""}</td>
        <td colspan="2"><em>No subjects yet</em></td>
      `;
      summaryBody.appendChild(row);
    }
  });
}

// Load students on page load
window.onload = fetchStudents;