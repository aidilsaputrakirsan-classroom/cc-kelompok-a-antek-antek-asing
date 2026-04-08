import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AppShell from "./layouts/AppShell";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import EmployeeTicketDetailPage from "./pages/EmployeeTicketDetailPage";
import EmployeeTicketEditPage from "./pages/EmployeeTicketEditPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <HomePage /> },
      {
        element: <AppShell />,
        children: [
          {
            path: "/admin",
            element: <ProtectedRoute allowedRoles={["superadmin", "admin", "it_employee"]} />,
            children: [{ index: true, element: <AdminDashboardPage /> }],
          },
          {
            path: "/employee",
            element: <ProtectedRoute allowedRoles={["employee"]} />,
            children: [
              { index: true, element: <EmployeeDashboardPage /> },
              { path: "tickets/:ticketId", element: <EmployeeTicketDetailPage /> },
              { path: "tickets/:ticketId/edit", element: <EmployeeTicketEditPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
