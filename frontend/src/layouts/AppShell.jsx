import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";

function SidebarLink({ to, label, isActive, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </NavLink>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentTab = new URLSearchParams(location.search).get("tab") || "overview";

  const isAdminLike = useMemo(
    () => ["superadmin", "admin", "it_employee"].includes(user?.role),
    [user?.role]
  );

  const navItems = useMemo(() => {
    if (user?.role === "superadmin" || user?.role === "admin") {
      return [
        { to: "/admin", label: "Overview", tab: "overview" },
        { to: "/admin?tab=tickets", label: "All Tickets", tab: "tickets" },
        { to: "/admin?tab=users", label: "Team Member", tab: "users" },
        { to: "/admin?tab=categories", label: "Settings", tab: "categories" },
      ];
    }

    if (user?.role === "it_employee") {
      return [
        { to: "/admin", label: "Overview", tab: "overview" },
        { to: "/admin?tab=tickets", label: "All Tickets", tab: "tickets" },
      ];
    }

    if (isAdminLike) {
      return [{ to: "/admin", label: "Dashboard", tab: "overview" }];
    }

    return [{ to: "/employee", label: "Dashboard", tab: "overview" }];
  }, [isAdminLike, user?.role]);

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f9_100%)]">
      <div className="mx-auto flex h-full w-full max-w-[1400px] gap-4 p-3 md:gap-5 md:p-4">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/95 p-4 backdrop-blur-md transition-transform md:static md:h-full md:translate-x-0 md:rounded-2xl md:border ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <p className="text-lg font-semibold text-slate-900">TicketFlow</p>
              <p className="text-xs text-slate-500">Support dashboard workspace</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  onClick={() => setMobileOpen(false)}
                  isActive={
                    item.to.startsWith("/admin")
                      ? location.pathname.startsWith("/admin") &&
                        (user?.role !== "superadmin" || currentTab === item.tab)
                      : location.pathname.startsWith("/employee")
                  }
                />
              ))}
            </nav>

            <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500">Role: {user?.role || "-"}</p>
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-900/35 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <section className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/85 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)]">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-6">
            <div>
              <p className="text-sm font-semibold text-slate-800">Dashboard</p>
              <p className="text-xs text-slate-500">Professional support overview</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              Menu
            </Button>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
            <Outlet />
          </main>
        </section>
      </div>
    </div>
  );
}
