import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

// Wraps routes that require a login. If there's no user, redirect to /login.
// If `adminOnly` is set, non-admins get bounced back to the dashboard.
export default function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // <Outlet /> renders whichever child route matched the URL.
  return <Outlet />;
}
