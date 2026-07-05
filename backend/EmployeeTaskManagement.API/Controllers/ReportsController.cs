using System.Text;
using ClosedXML.Excel;
using EmployeeTaskManagement.API.Data;
using EmployeeTaskManagement.API.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/reports/completed?format=excel|csv
    [HttpGet("completed")]
    public async Task<IActionResult> CompletedTasks(string format = "excel")
    {
        var tasks = await _context.TaskItems
            .Include(t => t.AssignedToUser)
            .Where(t => t.Status == TaskItemStatus.Completed)
            .OrderBy(t => t.DueDate)
            .ToListAsync();

        var headers = new[] { "Title", "Assigned To", "Priority", "Start Date", "Due Date", "Status" };
        var rows = tasks.Select(t => new[]
        {
            t.Title,
            t.AssignedToUser?.FullName ?? "",
            t.Priority.ToString(),
            t.StartDate.ToString("yyyy-MM-dd"),
            t.DueDate.ToString("yyyy-MM-dd"),
            t.Status.ToString()
        }).ToList();

        return Export(format, "CompletedTasks", headers, rows);
    }

    // GET: api/reports/pending?format=excel|csv
    [HttpGet("pending")]
    public async Task<IActionResult> PendingTasks(string format = "excel")
    {
        var tasks = await _context.TaskItems
            .Include(t => t.AssignedToUser)
            .Where(t => t.Status != TaskItemStatus.Completed)
            .OrderBy(t => t.DueDate)
            .ToListAsync();

        var headers = new[] { "Title", "Assigned To", "Priority", "Start Date", "Due Date", "Status" };
        var rows = tasks.Select(t => new[]
        {
            t.Title,
            t.AssignedToUser?.FullName ?? "",
            t.Priority.ToString(),
            t.StartDate.ToString("yyyy-MM-dd"),
            t.DueDate.ToString("yyyy-MM-dd"),
            t.Status.ToString()
        }).ToList();

        return Export(format, "PendingTasks", headers, rows);
    }

    // GET: api/reports/employee-wise?format=excel|csv
    [HttpGet("employee-wise")]
    public async Task<IActionResult> EmployeeWise(string format = "excel")
    {
        var now = DateTime.UtcNow;

        var employees = await _context.Users
            .Where(u => u.Role == UserRole.Employee)
            .Select(u => new
            {
                u.FullName,
                u.Email,
                u.Department,
                Total = u.AssignedTasks.Count,
                Completed = u.AssignedTasks.Count(t => t.Status == TaskItemStatus.Completed),
                Pending = u.AssignedTasks.Count(t => t.Status != TaskItemStatus.Completed),
                Overdue = u.AssignedTasks.Count(t => t.Status != TaskItemStatus.Completed && t.DueDate < now)
            })
            .OrderBy(u => u.FullName)
            .ToListAsync();

        var headers = new[] { "Employee", "Email", "Department", "Total Tasks", "Completed", "Pending", "Overdue" };
        var rows = employees.Select(e => new[]
        {
            e.FullName,
            e.Email,
            e.Department,
            e.Total.ToString(),
            e.Completed.ToString(),
            e.Pending.ToString(),
            e.Overdue.ToString()
        }).ToList();

        return Export(format, "EmployeeWiseTasks", headers, rows);
    }

    // Picks CSV or Excel based on the format query param.
    private IActionResult Export(string format, string name, string[] headers, List<string[]> rows)
    {
        if (format.ToLower() == "csv")
        {
            var bytes = BuildCsv(headers, rows);
            return File(bytes, "text/csv", $"{name}.csv");
        }

        var excel = BuildExcel(name, headers, rows);
        return File(excel,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"{name}.xlsx");
    }

    private static byte[] BuildCsv(string[] headers, List<string[]> rows)
    {
        var sb = new StringBuilder();
        sb.AppendLine(string.Join(",", headers.Select(Escape)));

        foreach (var row in rows)
        {
            sb.AppendLine(string.Join(",", row.Select(Escape)));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    // Wrap values in quotes and escape inner quotes so commas/quotes don't break the CSV.
    private static string Escape(string value)
    {
        value ??= "";
        return $"\"{value.Replace("\"", "\"\"")}\"";
    }

    private static byte[] BuildExcel(string sheetName, string[] headers, List<string[]> rows)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add(sheetName);

        for (int c = 0; c < headers.Length; c++)
        {
            sheet.Cell(1, c + 1).Value = headers[c];
            sheet.Cell(1, c + 1).Style.Font.Bold = true;
        }

        for (int r = 0; r < rows.Count; r++)
        {
            for (int c = 0; c < rows[r].Length; c++)
            {
                sheet.Cell(r + 2, c + 1).Value = rows[r][c];
            }
        }

        sheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
