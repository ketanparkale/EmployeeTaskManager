using System.ComponentModel.DataAnnotations;

namespace EmployeeTaskManagement.API.DTOs.Auth;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    // When true, issue a longer-lived token so the session persists.
    public bool RememberMe { get; set; }
}