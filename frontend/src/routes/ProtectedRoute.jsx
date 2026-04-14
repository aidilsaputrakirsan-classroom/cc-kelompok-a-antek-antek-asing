import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isBootstrapping, role } = useAuth();

  if (isBootstrapping) {
    return <p className="p-6 text-slate-600">Loading session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const adminLike = ["superadmin", "admin", "it_employee"].includes(role);
    const fallbackPath = adminLike ? "/admin" : role === "employee" ? "/employee" : "/login";
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
