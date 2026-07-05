using System.ComponentModel.DataAnnotations;

namespace EmployeeTaskManagement.API.DTOs.User;

public class CreateEmployeeDto
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
    public string Department { get; set; } = string.Empty;

    [Required]
    public string Designation { get; set; } = string.Empty;
}
