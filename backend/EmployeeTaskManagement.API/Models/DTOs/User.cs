using EmployeeTaskManagement.API.Models.Enums;

namespace EmployeeTaskManagement.API.DTOs.User;

public class UserResponseDto
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public string Department { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;
}