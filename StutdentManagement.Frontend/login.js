// Toggle fields based on role
document.getElementById("loginRole").addEventListener("change", function () {
  const rollDiv = document.getElementById("rollNumberDiv");
  const teacherDiv = document.getElementById("teacherCodeDiv");
  const rollInput = document.getElementById("loginRollNumber");
  const teacherInput = document.getElementById("teacherCode");

  if (this.value === "Student") {
    rollDiv.style.display = "block";
    teacherDiv.style.display = "none";
    rollInput.required = true;
    teacherInput.required = false;
  } else {
    rollDiv.style.display = "none";
    teacherDiv.style.display = "block";
    teacherInput.required = true;
    rollInput.required = false;
  }
});

// Handle login form submit
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const role = document.getElementById("loginRole").value;
  const rollNumber = role === "Student" ? document.getElementById("loginRollNumber").value.trim() : null;
  const teacherCode = role === "Teacher" ? document.getElementById("teacherCode").value.trim() : null;

  showSpinner();

  try {
    const response = await fetch("http://localhost:5010/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, rollNumber, teacherCode })
    });

    if (!response.ok) throw new Error("Invalid credentials");

    const data = await response.json();

    // Save JWT token
    localStorage.setItem("token", data.token);

    // Optional: decode JWT payload to extract RollNumber claim
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    if (payload.RollNumber) {
      localStorage.setItem("rollNumber", payload.RollNumber);
    }

    showToast("Login successful!", "success");

    // Redirect based on role
    if (role === "Teacher") {
      window.location.href = "teacherDashboard.html";
    } else {
      window.location.href = "studentDashboard.html";
    }
  } catch (error) {
    showToast("Login failed: " + error.message, "error");
  } finally {
    hideSpinner();
  }
});
