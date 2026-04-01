import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./routes/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import EmployeeTicketDetailPage from "./pages/EmployeeTicketDetailPage";
import EmployeeTicketEditPage from "./pages/EmployeeTicketEditPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <p className="p-6 text-slate-600">Loading session...</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
        <Route path="/employee" element={<EmployeeDashboardPage />} />
        <Route path="/employee/tickets/:ticketId" element={<EmployeeTicketDetailPage />} />
        <Route path="/employee/tickets/:ticketId/edit" element={<EmployeeTicketEditPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["superadmin", "admin", "it_employee"]} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;