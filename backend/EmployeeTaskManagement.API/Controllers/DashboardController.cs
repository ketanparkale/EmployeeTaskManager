using System.Security.Claims;
using EmployeeTaskManagement.API.Data;
using EmployeeTaskManagement.API.DTOs.Dashboard;
using EmployeeTaskManagement.API.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin => User.IsInRole(UserRole.Admin.ToString());

    // GET: api/dashboard -> admin sees org-wide stats, employee sees their own.
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        if (IsAdmin)
        {
            var stats = new AdminDashboardDto
            {
                TotalEmployees = await _context.Users
                    .CountAsync(u => u.Role == UserRole.Employee),
                TotalTasks = await _context.TaskItems.CountAsync(),
                CompletedTasks = await _context.TaskItems
                    .CountAsync(t => t.Status == TaskItemStatus.Completed),
                // "Pending" here means any task not yet completed.
                PendingTasks = await _context.TaskItems
                    .CountAsync(t => t.Status != TaskItemStatus.Completed)
            };

            return Ok(stats);
        }
        else
        {
            var myTasks = _context.TaskItems
                .Where(t => t.AssignedToUserId == CurrentUserId);

            var now = DateTime.UtcNow;

            var stats = new EmployeeDashboardDto
            {
                MyTasks = await myTasks.CountAsync(),
                CompletedTasks = await myTasks
                    .CountAsync(t => t.Status == TaskItemStatus.Completed),
                PendingTasks = await myTasks
                    .CountAsync(t => t.Status != TaskItemStatus.Completed),
                OverdueTasks = await myTasks
                    .CountAsync(t => t.Status != TaskItemStatus.Completed && t.DueDate < now)
            };

            return Ok(stats);
        }
    }
}
