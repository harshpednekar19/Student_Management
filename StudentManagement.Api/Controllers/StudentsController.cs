using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using StudentManagement.Api.Data;
using StudentManagement.Api.Models;

namespace StudentManagement.Api.Controllers
{
    

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _context;
    public StudentsController(AppDbContext context) => _context = context;
  
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Student>>>  GetStudents()
    {
        return await _context.Students.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Student>> CreateStudent(Student student)
    {
        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStudents), new { id = student.Id} , student);
        
       
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStudent(int id, Student student)
    {
        if(id != student.Id)
            return BadRequest();

        _context.Entry(student).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if(!_context.Students.Any(e => e.Id == id))
                return NotFound();
            else
                throw;
        }
        return NoContent();
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudent(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null)
        return NotFound();

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();

        return NoContent();
    }

}}
