namespace EmployeeTaskManagement.API.DTOs.Dashboard;

public class EmployeeDashboardDto
{
    public int MyTasks { get; set; }

    public int CompletedTasks { get; set; }

    public int PendingTasks { get; set; }

    public int OverdueTasks { get; set; }
}
