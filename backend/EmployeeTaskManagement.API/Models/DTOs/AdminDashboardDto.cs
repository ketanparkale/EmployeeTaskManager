namespace EmployeeTaskManagement.API.DTOs.Dashboard;

public class AdminDashboardDto
{
    public int TotalEmployees { get; set; }

    public int TotalTasks { get; set; }

    public int CompletedTasks { get; set; }

    public int PendingTasks { get; set; }
}
