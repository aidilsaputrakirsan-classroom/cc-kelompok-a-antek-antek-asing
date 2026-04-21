import { useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PendingUsersProvider } from "./context/PendingUsersContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useToast } from "./context/useToast";
import ToastContainer from "./components/ToastContainer";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AppShell from "./layouts/AppShell";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminPendingUsersPage from "./pages/AdminPendingUsersPage";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import EmployeeTicketDetailPage from "./pages/EmployeeTicketDetailPage";
import EmployeeTicketEditPage from "./pages/EmployeeTicketEditPage";
import ProfilePage from "./pages/ProfilePage";

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
          { path: "/profile", element: <ProfilePage /> },
          {
            path: "/admin",
            element: <ProtectedRoute allowedRoles={["superadmin", "admin", "it_employee"]} />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: "pending-users", element: <AdminPendingUsersPage /> },
            ],
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

function AppWithToast() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <PendingUsersProvider>
            <AppWithToast />
          </PendingUsersProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
