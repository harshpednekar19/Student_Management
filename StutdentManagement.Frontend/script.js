// Fetch students from your API and display them
fetch("http://localhost:5010/api/students")
  .then(response => response.json())
  .then(data => {
    const tableBody = document.querySelector("#studentsTable tbody");
    tableBody.innerHTML = ""; // clear existing rows

    data.forEach(student => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.course}</td>
        <td>
        <button onclick="editStudent(${student.id})">Edit</button>
        <button onclick="deleteStudent(${student.id})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  })
  .catch(error => console.error("Error fetching students:", error));


  document.getElementById("addStudentForm").addEventListener("submit", function(e){
    e.preventDefault();
    const student = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      course: document.getElementById("course").value
    };
    fetch("http://localhost:5010/api/students",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(student)
    })
    .then(response =>{
        if(!response.ok){
          throw new Error("Failed to add Student");
        }
        return response.json();
      })
      .then(data => {
        alert("Student added successfully!");
        location.reload();
      })
      .catch(error => console.error("Error adding student:", error));
    })

    function deleteStudent(id){
      fetch(`http://localhost:5010/api/students/${id}`,{
        method: "DELETE"
      })
      .then(response => {
        if(!response.ok) throw new Error("Failed to delete student");
        alert("Student deleted successfully!");
        location.reload();
      })
      .catch(error => console.error("Error deleting student:", error));
    }

    function editStudent(id){
      const newName = prompt("ENter a new name:");
      const newEmail = prompt("Enter a new email");
      const newCourse = prompt("Enter new course");

      const updatedStudent ={
        id: id,
        name: newName,
        email: newEmail,
        course: newCourse
      };
      fetch(`http://localhost:5010/api/students/${id}`,{
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent)
      })
      .then(response => {
        if(!response.ok) throw new Error ("Failed to update student");
        alert("Student updated successfully!");
        location.reload();
      })
      .catch(error => console.error("Error updationg student:", error));
    }
function showMessage(msg, type){
  const box = document.getElementById("messageBox");
  box.innerText = msg;
  box.style.color = type === "error" ? "red" : "green";
}