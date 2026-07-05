import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAppSelector } from '../app/hooks';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the dashboard numbers once when the page opens.
  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (!stats) return <p>Could not load the dashboard.</p>;

  // Pick which four tiles to show based on the logged-in role.
  const tiles: [string, number][] =
    user?.role === 'Admin'
      ? [
          ['Total Employees', stats.totalEmployees],
          ['Total Tasks', stats.totalTasks],
          ['Completed Tasks', stats.completedTasks],
          ['Pending Tasks', stats.pendingTasks],
        ]
      : [
          ['My Tasks', stats.myTasks],
          ['Completed', stats.completedTasks],
          ['Pending', stats.pendingTasks],
          ['Overdue', stats.overdueTasks],
        ];

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="stat-grid">
        {tiles.map(([label, value]) => (
          <div className="stat-tile" key={label}>
            <div className="value">{value ?? 0}</div>
            <div className="label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
