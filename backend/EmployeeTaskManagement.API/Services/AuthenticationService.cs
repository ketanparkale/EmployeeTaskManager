using BCrypt.Net;
using EmployeeTaskManagement.API.Data;
using EmployeeTaskManagement.API.DTOs.Auth;
using EmployeeTaskManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.API.Services;

public class AuthenticationService
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;

    public AuthenticationService(
        ApplicationDbContext context,
        JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
  
        bool emailExists = await _context.Users
            .AnyAsync(u => u.Email == request.Email);

        if (emailExists)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Email already exists."
                };
            }


        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

    
        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = passwordHash,
            Role = request.Role,
            Department = request.Department,
            Designation = request.Designation
        };

    
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Success = true,
            Message = "Registration successful."
        };
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
     
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return null;
        }

    
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash);

        if (!isPasswordValid)
        {
            return null;
        }

     
        string token = _jwtService.GenerateToken(user, request.RememberMe);

        return new LoginResponseDto
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role
        };
    }
}