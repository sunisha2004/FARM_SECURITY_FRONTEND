import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!user) {
      return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role to avoid getting stuck
      if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (user.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
      return <Navigate to="/" replace />; // Fallback
  }

  return <Outlet />;
};

export default ProtectedRoute;
