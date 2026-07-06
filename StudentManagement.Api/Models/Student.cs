using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Api.Models
{
    public class Student
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Roll number is required")]
        [StringLength(20, ErrorMessage = "Roll number cannot exceed 20 characters")]
        public string RollNumber { get; set; } = string.Empty;

        // Optional fields
        [StringLength(50, ErrorMessage = "Name cannot exceed 50 characters")]
        public string? Name { get; set; }

        [StringLength(30, ErrorMessage = "Course cannot exceed 30 characters")]
        public string? Course { get; set; }

        public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    }
}
