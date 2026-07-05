using EmployeeTaskManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<TaskItem> TaskItems { get; set; }
    public DbSet<Notification> Notifications { get; set; }
}