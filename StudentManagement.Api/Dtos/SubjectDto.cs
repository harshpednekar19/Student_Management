using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Api.Dtos
{
    public class SubjectDto
    {
        [Required(ErrorMessage = "Subject name is required")]
        public string Name { get; set; } = string.Empty;

        [Range(0, 100, ErrorMessage = "Marks must be between 0 and 100")]
        public int Marks { get; set; }
    }
}
