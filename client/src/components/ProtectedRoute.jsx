import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Wrap any route element that requires login. Optionally pass allowedRoles
// to restrict to specific roles (e.g. <ProtectedRoute allowedRoles={['super_admin']}>).
export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}