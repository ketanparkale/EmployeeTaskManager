using EmployeeTaskManagement.API.Models.Enums;
namespace EmployeeTaskManagement.API.Models.Entities;
public class User
{
    public int Id { get; set; }

    public string FullName { get; set;} = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public string Department { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();

    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
