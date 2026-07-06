using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using StudentManagement.Api.Data;
using StudentManagement.Api.Models;
using Microsoft.EntityFrameworkCore;   // For Include, FirstOrDefaultAsync
using System.Security.Claims;          // For FindFirstValue


[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _context;
    public StudentsController(AppDbContext context) => _context = context;

    // Teachers can view all students (with subjects)
    [Authorize(Roles = "Teacher")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Student>>> GetStudents()
    {
        return await _context.Students.ToListAsync();
    }

    // Students can view their own data by RollNumber from JWT
    [Authorize(Roles = "Student")]
    [HttpGet("me")]
    public async Task<ActionResult<Student>> GetMyData()
    {
        var rollNumber = User.FindFirstValue("RollNumber");
        var student = await _context.Students.FirstOrDefaultAsync(s => s.RollNumber == rollNumber);
        if (student == null) return NotFound();
        return student;
    }

    // Students can view their own subjects by RollNumber
    [Authorize(Roles = "Student")]
    [HttpGet("me/subjects")]
    public async Task<IActionResult> GetMySubjects()
    {
        var rollNumber = User.FindFirst("RollNumber")?.Value;
        if (string.IsNullOrEmpty(rollNumber))
            return Unauthorized("Missing roll number claim");

        var student = await _context.Students
            .Include(s => s.Subjects)
            .FirstOrDefaultAsync(s => s.RollNumber == rollNumber);

        if (student == null)
            return NotFound("Student not found");

        return Ok(student.Subjects);
    }

    // Teachers can add a single subject by roll number
    [Authorize(Roles = "Teacher")]
    [HttpPost("{rollNumber}/subjects")]
    public async Task<ActionResult<Subject>> AddSubject(string rollNumber, SubjectDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || dto.Marks < 0)
            return BadRequest("Invalid subject data");

        var student = await _context.Students.FirstOrDefaultAsync(s => s.RollNumber == rollNumber);
        if (student == null) return NotFound("Student not found");

        var subject = new Subject
        {
            Name = dto.Name,
            Marks = dto.Marks,
            StudentId = student.Id
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();
        return Ok(subject);
    }

    // Teachers can add multiple subjects at once by roll number
    [Authorize(Roles = "Teacher")]
    [HttpPost("{rollNumber}/subjects/bulk")]
    public async Task<ActionResult<IEnumerable<Subject>>> AddSubjects(string rollNumber, List<SubjectDto> subjectsDto)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.RollNumber == rollNumber);
        if (student == null) return NotFound("Student not found");

        var subjects = subjectsDto.Select(dto => new Subject
        {
            Name = dto.Name,
            Marks = dto.Marks,
            StudentId = student.Id
        }).ToList();

        _context.Subjects.AddRange(subjects);
        await _context.SaveChangesAsync();

        return Ok(subjects);
    }
    // Teachers can add new students
[Authorize(Roles = "Teacher")]
[HttpPost]
public async Task<ActionResult<Student>> AddStudent(Student student)
{
    if (string.IsNullOrWhiteSpace(student.Name) ||
        string.IsNullOrWhiteSpace(student.Email) ||
        string.IsNullOrWhiteSpace(student.Course) ||
        string.IsNullOrWhiteSpace(student.RollNumber))
        return BadRequest("Invalid student data");

    _context.Students.Add(student);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetStudents), new { id = student.Id }, student);

}

[Authorize(Roles = "Teacher")]
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteStudent(int id)
{
    var student = await _context.Students.FindAsync(id);
    if (student == null) return NotFound();

    _context.Students.Remove(student);
    await _context.SaveChangesAsync();
    return NoContent();
}


}

// DTO for subject input
public class SubjectDto
{
    public string Name { get; set; } = string.Empty;
    public int Marks { get; set; }
}
