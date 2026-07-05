using EmployeeTaskManagement.API.Data;
using EmployeeTaskManagement.API.Models.Entities;
using EmployeeTaskManagement.API.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.API.Services;

public class DueSoonNotificationService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(1);

    public DueSoonNotificationService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckDueSoonTasksAsync(stoppingToken);
            }
            catch
            {
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task CheckDueSoonTasksAsync(CancellationToken token)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var now = DateTime.UtcNow;
        var cutoff = now.AddDays(1);

        var dueSoonTasks = await context.TaskItems
            .Where(t => t.Status != TaskItemStatus.Completed
                        && t.DueDate >= now
                        && t.DueDate <= cutoff)
            .ToListAsync(token);

        if (dueSoonTasks.Count == 0)
            return;

        var taskIds = dueSoonTasks.Select(t => t.Id).ToList();

        var alreadyNotified = await context.Notifications
            .Where(n => n.Type == "DueSoon" && n.TaskId != null && taskIds.Contains(n.TaskId.Value))
            .Select(n => n.TaskId!.Value)
            .ToListAsync(token);

        foreach (var task in dueSoonTasks)
        {
            if (alreadyNotified.Contains(task.Id))
                continue;

            context.Notifications.Add(new Notification
            {
                UserId = task.AssignedToUserId,
                Message = $"Task due within a day: {task.Title}",
                Type = "DueSoon",
                TaskId = task.Id,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        await context.SaveChangesAsync(token);
    }
}
