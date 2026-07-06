// Toggle roll number field based on role
document.getElementById("registerRole").addEventListener("change", function () {
  const rollDiv = document.getElementById("rollNumberDiv");
  const rollInput = document.getElementById("registerRollNumber");

  if (this.value === "Student") {
    rollDiv.style.display = "block";
    rollInput.required = true;
  } else {
    rollDiv.style.display = "none";
    rollInput.required = false;
    rollInput.value = ""; // clear if switching back
  }
});

document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  const role = document.getElementById("registerRole").value;
  const rollNumber = role === "Student" ? document.getElementById("registerRollNumber").value.trim() : null;

  const body = role === "Student"
    ? { email, password, role, rollNumber }
    : { email, password, role };

  showSpinner();

  try {
    const response = await fetch("http://localhost:5010/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      showToast("Registration successful!", "success");
      setTimeout(() => window.location.href = "login.html", 1500);
    } else {
      const error = await response.text();
      showToast("Registration failed: " + error, "error");
    }
  } catch (err) {
    showToast("Error: " + err.message, "error");
  } finally {
    hideSpinner();
  }
});
