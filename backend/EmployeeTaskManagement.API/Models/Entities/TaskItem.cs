using EmployeeTaskManagement.API.Models.Enums;

namespace EmployeeTaskManagement.API.Models.Entities;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TaskPriority Priority { get; set; }

    public TaskItemStatus Status { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime DueDate { get; set; }

    public string? AttachmentPath { get; set; }

    public int AssignedToUserId { get; set; }

    public User AssignedToUser { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}