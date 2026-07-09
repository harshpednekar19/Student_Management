# Student Management System

A full-stack Student Management System with role-based access for **Teachers** and **Students**, built with an ASP.NET Core Web API backend and a vanilla HTML/CSS/JS frontend.

Teachers can register students, add multiple subjects with marks in bulk, and view all students in a searchable dashboard. Students can log in with their roll number and view their own profile, subjects, and marks.

---

## Features

- 🔐 **JWT-based authentication** with role-based authorization (`Teacher` / `Student`)
- 🧑‍🏫 **Teacher Dashboard**
  - Add new students
  - Add multiple subjects with marks in a single request (bulk add)
  - View all students with their subjects/marks in a summary table
  - Delete students
- 🎓 **Student Dashboard**
  - Log in using email, password, and roll number
  - View personal profile (name, roll number, email, course)
  - View all enrolled subjects and marks in a tabular format
- 🔑 Teacher accounts require a secret **Teacher Code** at login (extra layer of protection)
- ✅ Passwords hashed with **BCrypt**
- 🌐 CORS configured for local frontend development

---

## Tech Stack

**Backend**
- ASP.NET Core 8 Web API (C#)
- Entity Framework Core 8 (Code-First, SQL Server)
- JWT Bearer Authentication (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- BCrypt.Net for password hashing
- Swagger / OpenAPI for API exploration

**Frontend**
- HTML5, CSS3, vanilla JavaScript (no frameworks)
- Fetch API for HTTP requests
- LocalStorage for JWT session persistence

---

## Project Structure

```
Student_management/
├── StudentManagement.Api/           # ASP.NET Core Web API
│   ├── Controllers/
│   │   ├── AuthController.cs        # Login & registration
│   │   └── StudentsController.cs    # Student & subject management
│   ├── Data/
│   │   └── AppDbContext.cs          # EF Core DbContext
│   ├── Dtos/
│   │   ├── LoginModel.cs
│   │   ├── RegisterModel.cs
│   │   └── SubjectDto.cs
│   ├── Models/
│   │   ├── ApplicationUser.cs       # Login credentials + role
│   │   ├── Student.cs               # Student profile
│   │   └── Subject.cs               # Subject + marks (belongs to a Student)
│   ├── Migrations/                  # EF Core migrations
│   ├── Program.cs                   # App startup, DI, JWT & CORS config
│   └── appsettings.json             # Connection string, JWT settings, teacher code
│
└── StutdentManagement.Frontend/     # Static frontend
    ├── login.html / login.js
    ├── register.html / register.js
    ├── teacherDashboard.html / teacherDashboard.js
    ├── studentDashboard.html / studentDashboard.js
    ├── common.js                    # Shared helpers (auth headers, JWT decode, toasts)
    └── style.css
```

---

## Data Model

```
ApplicationUser            Student                 Subject
──────────────             ──────────────          ──────────────
Id                         Id                       Id
Email                      Email                    Name
PasswordHash               RollNumber               Marks
Role ("Teacher"/"Student") Name                      StudentId (FK)
RollNumber (nullable)      Course
                           Subjects (1-to-many) ───► Subject
```

- `ApplicationUser` stores login credentials and is used for authentication only.
- `Student` stores the academic profile and is linked to `Subject` records in a **one-to-many** relationship.
- A student is matched to their academic record at login time via **RollNumber**, which is embedded as a claim in their JWT.

---

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- SQL Server (LocalDB or SQL Server Express)
- A simple local static file server for the frontend (e.g. VS Code **Live Server** extension)

### 1. Configure the backend

Edit `StudentManagement.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=StudentDb;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "<your-secret-key-at-least-32-characters>",
    "Issuer": "http://localhost:5010",
    "Audience": "http://localhost:5010"
  },
  "Teacher": {
    "SecretCode": "<your-teacher-registration-code>"
  }
}
```

> ⚠️ For a real deployment, move `Jwt:Key` and `Teacher:SecretCode` out of source control (e.g. environment variables or `dotnet user-secrets`).

### 2. Apply migrations & run the API

```bash
cd StudentManagement.Api
dotnet restore
dotnet ef database update
dotnet run
```

The API will start at **http://localhost:5010** (see `Properties/launchSettings.json` to change the port). Swagger UI is available at `http://localhost:5010/swagger` in development mode.

### 3. Run the frontend

Open `StutdentManagement.Frontend/` with a static file server (e.g. right-click `login.html` → "Open with Live Server" in VS Code) so it's served from `http://127.0.0.1:5500` or `http://localhost:5500` — these are the origins already whitelisted in the API's CORS policy (`Program.cs`).

> If your frontend runs on a different port, update the `AllowFrontend` CORS policy in `Program.cs` accordingly.

### 4. Try it out

1. Go to `register.html` and create a **Teacher** account (you'll need the `Teacher:SecretCode` from `appsettings.json`) and one or more **Student** accounts (each requires a roll number).
2. Log in as the teacher, add students, and assign subjects with marks.
3. Log in as a student using that same roll number to view your profile and marks.

---

## API Reference

Base URL: `http://localhost:5010/api`

| Method | Endpoint                              | Auth              | Description                                    |
|--------|----------------------------------------|-------------------|------------------------------------------------|
| POST   | `/auth/register`                      | Public            | Register a new Teacher or Student account      |
| POST   | `/auth/login`                         | Public            | Log in and receive a JWT                        |
| GET    | `/students`                           | Teacher           | Get all students with their subjects            |
| POST   | `/students`                           | Teacher           | Add a new student                                |
| DELETE | `/students/{id}`                      | Teacher           | Delete a student by ID                           |
| POST   | `/students/{rollNumber}/subjects`     | Teacher           | Add a single subject + marks to a student        |
| POST   | `/students/{rollNumber}/subjects/bulk`| Teacher           | Add multiple subjects + marks in one request     |
| GET    | `/students/me`                        | Student           | Get the logged-in student's own profile          |
| GET    | `/students/me/subjects`               | Student           | Get the logged-in student's own subjects & marks |

### Example: Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "yourpassword",
  "role": "Student",
  "rollNumber": "10"
}
```

### Example: Bulk add subjects

```http
POST /api/students/10/subjects/bulk
Authorization: Bearer <teacher-jwt>
Content-Type: application/json

[
  { "name": "Mathematics", "marks": 92 },
  { "name": "Science", "marks": 85 },
  { "name": "English", "marks": 78 }
]
```

---

## Authentication Flow

1. User logs in via `POST /auth/login` with email, password, role, and (for students) roll number, or (for teachers) the shared teacher secret code.
2. On success, the API returns a signed JWT containing:
   - `NameIdentifier` claim → email
   - `Role` claim → `"Teacher"` or `"Student"`
   - `RollNumber` claim (students only)
3. The frontend stores this token in `localStorage` and attaches it as a `Bearer` token on every subsequent API request.
4. Protected endpoints use `[Authorize(Roles = "...")]` to restrict access by role.
5. The `/students/me` and `/students/me/subjects` endpoints read the `RollNumber` claim directly from the JWT to identify the requesting student — no ID needs to be passed by the client.

---

## Known Limitations / Ideas for Future Work

- No token refresh mechanism — JWTs expire after 1 hour and require re-login.
- No password reset flow.
- Teacher secret code is a single shared static value rather than per-teacher credentials.
- No pagination on the students list (fine for classroom-scale data, not for large datasets).
- Frontend has no build step/bundler — kept intentionally simple as vanilla JS.

---

## License

This project is open source and available for educational use.
