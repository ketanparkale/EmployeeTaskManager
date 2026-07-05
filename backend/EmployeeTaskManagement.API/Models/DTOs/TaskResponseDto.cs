using EmployeeTaskManagement.API.Models.Enums;

namespace EmployeeTaskManagement.API.DTOs.Tasks;

public class TaskResponseDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TaskPriority Priority { get; set; }

    public TaskItemStatus Status { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime DueDate { get; set; }

    public int AssignedToUserId { get; set; }

    public string AssignedToName { get; set; } = string.Empty;

    public string? AttachmentPath { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
