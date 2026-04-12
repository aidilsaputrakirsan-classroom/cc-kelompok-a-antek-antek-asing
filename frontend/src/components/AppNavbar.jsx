import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function NavItem({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`rounded-md px-3 py-1.5 text-sm transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

export default function AppNavbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdminLike =
    user?.role === "admin" || user?.role === "superadmin" || user?.role === "it_employee";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Antick Async</p>
          <p className="text-xs text-slate-500">Role: {user?.role}</p>
        </div>

        <nav className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <NavItem to="/" active={location.pathname === "/"}>
            Home
          </NavItem>
          {!isAdminLike && (
            <NavItem to="/employee" active={location.pathname.startsWith("/employee")}>
              Employee
            </NavItem>
          )}
          {isAdminLike && (
            <NavItem to="/admin" active={location.pathname.startsWith("/admin")}>
              Admin
            </NavItem>
          )}
          <button
            onClick={logout}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
