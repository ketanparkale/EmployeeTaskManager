import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';

// The shared page frame: a top nav bar + the current page below it.
export default function Layout() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'Admin';

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  return (
    <div>
      <nav className="navbar">
        <span className="brand">Task Manager</span>

        <div className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/tasks">Tasks</NavLink>
          {isAdmin && <NavLink to="/employees">Employees</NavLink>}
          {isAdmin && <NavLink to="/reports">Reports</NavLink>}
          <NavLink to="/notifications">Notifications</NavLink>
        </div>

        <div className="nav-user">
          <span>{user?.fullName} ({user?.role})</span>
          <button className="btn btn-light" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
