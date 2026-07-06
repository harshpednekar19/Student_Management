using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Api.Models
{
    public class ApplicationUser
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password hash is required")]
        public string PasswordHash { get; set; } = string.Empty;

        [Required(ErrorMessage = "Role is required")]
        public string Role { get; set; } = string.Empty; // "Student" or "Teacher"

        // RollNumber is optional here, only used for students
        public string? RollNumber { get; set; }
    }
}
