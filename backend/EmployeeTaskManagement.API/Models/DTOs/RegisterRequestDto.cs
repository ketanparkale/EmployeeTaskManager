using System.ComponentModel.DataAnnotations;
using EmployeeTaskManagement.API.Models.Enums;

namespace EmployeeTaskManagement.API.DTOs.Auth;

public class RegisterRequestDto
{
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
        ErrorMessage = "Password must include an uppercase letter, a lowercase letter, and a number.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }

    [Required]
    public string Department { get; set; } = string.Empty;

    [Required]
    public string Designation { get; set; } = string.Empty;
}