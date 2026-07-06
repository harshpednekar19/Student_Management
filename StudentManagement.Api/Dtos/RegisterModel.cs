using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Api.Dtos
{
    public class RegisterModel
    {
        [Required(ErrorMessage = "Email is required")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Role is required")]
        public string Role { get; set; } = string.Empty; // "Student" or "Teacher"

        // Required only if Role = Student
        public string? RollNumber { get; set; }
    }
}
