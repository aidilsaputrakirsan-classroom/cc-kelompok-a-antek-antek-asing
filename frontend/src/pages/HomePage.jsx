import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdminLike = ["superadmin", "admin", "it_employee"].includes(user.role);
  return <Navigate to={isAdminLike ? "/admin" : "/employee"} replace />;
}
