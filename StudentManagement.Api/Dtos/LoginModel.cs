using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Api.Dtos
{
    public class LoginModel
    {
        [Required(ErrorMessage = "Email is required")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        public string? Password { get; set; }

        // Optional: only for students
        public string? RollNumber { get; set; }

        [Required(ErrorMessage = "Role is required")]
        public string? Role { get; set; }

        // Optional: only for teachers
        public string? TeacherCode { get; set; }
    }
}
