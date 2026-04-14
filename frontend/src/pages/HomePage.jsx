import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdminLike = ["superadmin", "admin", "it_employee"].includes(user.role);
  if (isAdminLike) {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === "employee") {
    return <Navigate to="/employee" replace />;
  }

  // Stop redirect loops for unexpected role values.
  return <Navigate to="/login" replace />;
}
