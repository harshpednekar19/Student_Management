using Microsoft.EntityFrameworkCore;
using StudentManagement.Api.Models;

namespace StudentManagement.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Student> Students {get; set;}

    }
}