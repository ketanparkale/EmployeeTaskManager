namespace EmployeeTaskManagement.API.Models.Entities;

public class Notification
{
    public int Id { get; set; }

    public string Message { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public int? TaskId { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }

    public User User { get; set; } = null!;
}