using Microsoft.EntityFrameworkCore;
using StudentManagement.Api.Models;

namespace StudentManagement.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<ApplicationUser> Users { get; set; }   // for AuthController
        public DbSet<Student> Students { get; set; }        // for StudentsController
        public DbSet<Subject> Subjects { get; set; }        // for subject management

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure one-to-many relationship between Student and Subject
            modelBuilder.Entity<Student>()
                .HasMany(s => s.Subjects)
                .WithOne(sub => sub.Student)
                .HasForeignKey(sub => sub.StudentId);
        }
    }
}
