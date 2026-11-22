import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'NGO') return <Navigate to="/ngo/dashboard" replace />;
  return <Navigate to="/donor/dashboard" replace />;
}