using EmployeeTaskManagement.API.Data;
using EmployeeTaskManagement.API.DTOs;
using EmployeeTaskManagement.API.DTOs.User;
using EmployeeTaskManagement.API.Models.Entities;
using EmployeeTaskManagement.API.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/users?search=&sortBy=name&sortDir=asc&page=1&pageSize=10
    [HttpGet]
    public async Task<IActionResult> GetEmployees(
        string? search = null,
        string sortBy = "name",
        string sortDir = "asc",
        int page = 1,
        int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;

        var query = _context.Users
            .Where(u => u.Role == UserRole.Employee);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u =>
                u.FullName.Contains(search) ||
                u.Email.Contains(search) ||
                u.Department.Contains(search) ||
                u.Designation.Contains(search));
        }

        bool desc = sortDir.ToLower() == "desc";
        query = sortBy.ToLower() switch
        {
            "email" => desc ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "department" => desc ? query.OrderByDescending(u => u.Department) : query.OrderBy(u => u.Department),
            "designation" => desc ? query.OrderByDescending(u => u.Designation) : query.OrderBy(u => u.Designation),
            _ => desc ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName),
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedResult<UserResponseDto>
        {
            Items = items.Select(ToDto),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    // GET: api/users/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployee(int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Employee);

        if (user == null)
            return NotFound();

        return Ok(ToDto(user));
    }

    // POST: api/users
    [HttpPost]
    public async Task<IActionResult> CreateEmployee(CreateEmployeeDto dto)
    {
        bool emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (emailExists)
            return BadRequest(new { Message = "Email already exists." });

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Employee,
            Department = dto.Department,
            Designation = dto.Designation
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmployee), new { id = user.Id }, ToDto(user));
    }

    // PUT: api/users/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, UpdateEmployeeDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Employee);

        if (user == null)
            return NotFound();

        // Prevent taking an email already used by someone else.
        bool emailTaken = await _context.Users
            .AnyAsync(u => u.Email == dto.Email && u.Id != id);
        if (emailTaken)
            return BadRequest(new { Message = "Email already exists." });

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.Department = dto.Department;
        user.Designation = dto.Designation;

        await _context.SaveChangesAsync();

        return Ok(ToDto(user));
    }

    // DELETE: api/users/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Employee);

        if (user == null)
            return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static UserResponseDto ToDto(User u) => new()
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        Role = u.Role,
        Department = u.Department,
        Designation = u.Designation
    };
}
