using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using StudentManagement.Api.Data;
using StudentManagement.Api.Dtos;
using StudentManagement.Api.Models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _context;

    public AuthController(IConfiguration config, AppDbContext context)
    {
        _config = config;
        _context = context;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel login)
    {
        var user = _context.Users.FirstOrDefault(u => u.Email == login.Email && u.Role == login.Role);
        if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");

        // Teacher login requires secret code
        var teacherCode = _config["Teacher:SecretCode"];
        if (user.Role == "Teacher" && login.TeacherCode != teacherCode)
            return Unauthorized("Invalid teacher code");

        // Student login requires roll number
        if (user.Role == "Student" && string.IsNullOrEmpty(login.RollNumber))
            return Unauthorized("Roll number required for student login");

        var token = GenerateJwtToken(user.Email, user.Role, login.RollNumber);
        return Ok(new { token });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (_context.Users.Any(u => u.Email == model.Email))
            return BadRequest("Email already registered");

        if (model.Role != "Teacher" && model.Role != "Student")
            return BadRequest("Invalid role");

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.Password);

        var user = new ApplicationUser
        {
            Email = model.Email,
            PasswordHash = hashedPassword,
            Role = model.Role
        };
        _context.Users.Add(user);

        if (model.Role == "Student")
        {
            if (string.IsNullOrEmpty(model.RollNumber))
                return BadRequest("Roll number is required for students");

            var student = new Student
            {
                Email = model.Email,
                RollNumber = model.RollNumber
            };
            _context.Students.Add(student);
        }

        await _context.SaveChangesAsync();
        return Ok("User registered successfully");
    }

    private string GenerateJwtToken(string email, string role, string? rollNumber)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (!string.IsNullOrEmpty(rollNumber))
            claims.Add(new Claim("RollNumber", rollNumber));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
