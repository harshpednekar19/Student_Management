// Redirect back to login if not authenticated
if (!getToken()) {
  window.location.href = "login.html";
}

// Fetch and render all students
function fetchStudents() {
  showSpinner();
  fetch("http://localhost:5010/api/students", {
    headers: { ...authHeaders() }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    })
    .then(data => {
      renderStudents(data); // ✅ call once, not inside forEach
    })
    .catch(err => showToast("Error fetching students: " + err.message, "error"))
    .finally(() => hideSpinner());
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
  } finally {
    hideSpinner();
  }
});

// Delete student
function deleteStudent(id) {
  showSpinner();
  fetch(`http://localhost:5010/api/students/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to delete student");
      showToast("Student deleted successfully!", "success");
      fetchStudents();
    })
    .catch(err => showToast("Error deleting student: " + err.message, "error"))
    .finally(() => hideSpinner());
}

// Add subject for a student by roll number
async function addSubject(e, rollNumber) {
  e.preventDefault();
  const subjectName = document.getElementById(`subject-${rollNumber}`).value.trim();
  const marks = parseInt(document.getElementById(`marks-${rollNumber}`).value);

  showSpinner();
  try {
    const res = await fetch(`http://localhost:5010/api/students/${rollNumber}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name: subjectName, marks })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    showToast("Subject added successfully!", "success");
    fetchStudents();
  } catch (err) {
    showToast("Error adding subject: " + err.message, "error");
  } finally {
    hideSpinner();
  }
}

function renderStudents(students) {
  const tableBody = document.getElementById("studentsTableBody");
  tableBody.innerHTML = "";

  students.forEach(s => {
    const subjectsHtml = s.subjects && s.subjects.length > 0
      ? s.subjects.map(sub => `${sub.name}: ${sub.marks}`).join("<br>")
      : "No subjects";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.name ?? ""}</td>
      <td>${s.email}</td>
      <td>${s.course ?? ""}</td>
      <td>${s.rollNumber}</td>
      <td>${subjectsHtml}</td>
      <td>
        <button class="delete" onclick="deleteStudent(${s.id})">Delete</button>
        <form onsubmit="addSubject(event, '${s.rollNumber}')">
          <input type="text" placeholder="Subject" id="subject-${s.rollNumber}" required>
          <input type="number" placeholder="Marks" id="marks-${s.rollNumber}" required>
          <button type="submit">Add</button>
        </form>
      </td>
    `;
    tableBody.appendChild(row);
  });
}



// Load students on page load
window.onload = fetchStudents;
