using System.ComponentModel.DataAnnotations;
using EmployeeTaskManagement.API.Models.Enums;

namespace EmployeeTaskManagement.API.DTOs.Tasks;

public class UpdateTaskDto
{
    [Required]
    [StringLength(150)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Required]
    public TaskPriority Priority { get; set; }

    [Required]
    public TaskItemStatus Status { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime DueDate { get; set; }

    [Required]
    public int AssignedToUserId { get; set; }
}
