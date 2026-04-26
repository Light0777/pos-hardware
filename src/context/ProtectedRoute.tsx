import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, allowedRoles }: any) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // List of public routes that don't require authentication
  const publicRoutes = ['/login', '/signup'];
  
  if (loading) return <div className="p-4">Loading...</div>;

  // Allow access to public routes even without authentication
  if (publicRoutes.includes(location.pathname)) {
    return children;
  }

  // For all other routes, check authentication
  if (!user) return <Navigate to="/login" replace />;

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/pos" replace />;
  }

  return children;
}