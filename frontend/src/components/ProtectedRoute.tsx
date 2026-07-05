import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

export default function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
