using System.Security.Claims;
using EmployeeTaskManagement.API.Data;
using EmployeeTaskManagement.API.DTOs.Tasks;
using EmployeeTaskManagement.API.Models.Entities;
using EmployeeTaskManagement.API.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    private static readonly string[] AllowedExtensions = { ".pdf", ".jpg", ".jpeg", ".png" };
    private const long MaxFileSize = 5 * 1024 * 1024;

    public TasksController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin => User.IsInRole(UserRole.Admin.ToString());

    [HttpGet]
    public async Task<IActionResult> GetTasks()
    {
        var query = _context.TaskItems
            .Include(t => t.AssignedToUser)
            .AsQueryable();

        if (!IsAdmin)
        {
            query = query.Where(t => t.AssignedToUserId == CurrentUserId);
        }

        var tasks = await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var task = await _context.TaskItems
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound();

        if (!IsAdmin && task.AssignedToUserId != CurrentUserId)
            return Forbid();

        return Ok(ToDto(task));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask(CreateTaskDto dto)
    {
        if (dto.DueDate < dto.StartDate)
            return BadRequest(new { Message = "Due date must not be earlier than start date." });

        var assignedToUserId = IsAdmin ? dto.AssignedToUserId : CurrentUserId;

        var assignee = await _context.Users.FindAsync(assignedToUserId);
        if (assignee == null)
            return BadRequest(new { Message = "Assigned employee does not exist." });

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = dto.Status,
            StartDate = dto.StartDate,
            DueDate = dto.DueDate,
            AssignedToUserId = assignedToUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        AddNotification(assignedToUserId, $"You have been assigned a new task: {task.Title}", "Assigned", task.Id);
        await _context.SaveChangesAsync();

        task.AssignedToUser = assignee;

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, ToDto(task));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto dto)
    {
        var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound();

        if (!IsAdmin && task.AssignedToUserId != CurrentUserId)
            return Forbid();

        if (task.Status == TaskItemStatus.Completed)
            return BadRequest(new { Message = "Completed tasks cannot be edited." });

        if (dto.DueDate < dto.StartDate)
            return BadRequest(new { Message = "Due date must not be earlier than start date." });

        var assignedToUserId = IsAdmin ? dto.AssignedToUserId : CurrentUserId;

        var assignee = await _context.Users.FindAsync(assignedToUserId);
        if (assignee == null)
            return BadRequest(new { Message = "Assigned employee does not exist." });

        var previousAssignee = task.AssignedToUserId;

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Priority = dto.Priority;
        task.Status = dto.Status;
        task.StartDate = dto.StartDate;
        task.DueDate = dto.DueDate;
        task.AssignedToUserId = assignedToUserId;
        task.UpdatedAt = DateTime.UtcNow;

        if (assignedToUserId != previousAssignee)
            AddNotification(assignedToUserId, $"You have been assigned a task: {task.Title}", "Assigned", task.Id);

        if (dto.Status == TaskItemStatus.Completed)
            AddNotification(assignedToUserId, $"Task marked complete: {task.Title}", "Completed", task.Id);

        await _context.SaveChangesAsync();

        task.AssignedToUser = assignee;
        return Ok(ToDto(task));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound();

        if (!IsAdmin && task.AssignedToUserId != CurrentUserId)
            return Forbid();

        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/attachment")]
    public async Task<IActionResult> UploadAttachment(int id, IFormFile file)
    {
        var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound();

        if (!IsAdmin && task.AssignedToUserId != CurrentUserId)
            return Forbid();

        if (file == null || file.Length == 0)
            return BadRequest(new { Message = "No file was uploaded." });

        if (file.Length > MaxFileSize)
            return BadRequest(new { Message = "File exceeds the 5 MB size limit." });

        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!AllowedExtensions.Contains(extension))
            return BadRequest(new { Message = "Only PDF, JPG, and PNG files are allowed." });

        var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        task.AttachmentPath = fileName;
        task.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { task.AttachmentPath });
    }

    [HttpGet("{id}/attachment")]
    public async Task<IActionResult> DownloadAttachment(int id)
    {
        var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound();

        if (!IsAdmin && task.AssignedToUserId != CurrentUserId)
            return Forbid();

        if (string.IsNullOrEmpty(task.AttachmentPath))
            return NotFound(new { Message = "This task has no attachment." });

        var fullPath = Path.Combine(_env.ContentRootPath, "uploads", task.AttachmentPath);
        if (!System.IO.File.Exists(fullPath))
            return NotFound(new { Message = "Attachment file is missing." });

        var contentType = Path.GetExtension(task.AttachmentPath).ToLower() switch
        {
            ".pdf" => "application/pdf",
            ".png" => "image/png",
            _ => "image/jpeg"
        };

        var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);
        return File(bytes, contentType, task.AttachmentPath);
    }

    private void AddNotification(int userId, string message, string type, int taskId)
    {
        _context.Notifications.Add(new Notification
        {
            UserId = userId,
            Message = message,
            Type = type,
            TaskId = taskId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });
    }

    private static TaskResponseDto ToDto(TaskItem t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Priority = t.Priority,
        Status = t.Status,
        StartDate = t.StartDate,
        DueDate = t.DueDate,
        AssignedToUserId = t.AssignedToUserId,
        AssignedToName = t.AssignedToUser != null ? t.AssignedToUser.FullName : string.Empty,
        AttachmentPath = t.AttachmentPath,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };
}
