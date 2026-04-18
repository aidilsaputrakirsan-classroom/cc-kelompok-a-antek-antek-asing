import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Tags, Ticket, User, Users, Clock, Building2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getAvatarPath } from "../constants/avatars";
import NotificationCenter from "../components/NotificationCenter";
import ThemeToggle from "../components/ThemeToggle";
import Button from "../components/ui/Button";

function SidebarLink({ to, label, isActive, onClick, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      aria-label={label}
      title={collapsed ? label : undefined}
      className={`group relative isolate flex items-center overflow-hidden rounded-xl py-2 text-sm font-medium ${
        collapsed ? "justify-center px-2" : "gap-2 px-3"
      } ${
        isActive
          ? "text-white shadow-sm"
          : "text-slate-600 dark:text-slate-400"
      }`}
    >
      <span
        className={`pointer-events-none absolute inset-0 rounded-xl transition-all duration-300 ease-out ${
          isActive
            ? "scale-100 bg-[#2592ea] opacity-100"
            : "scale-95 bg-slate-100 dark:bg-slate-800 opacity-0 group-hover:scale-100 group-hover:opacity-100"
        }`}
      />
      {Icon && (
        <Icon
          size={16}
          aria-hidden="true"
          className={`relative z-10 shrink-0 transition-colors duration-200 ${
            isActive ? "text-white" : "text-slate-500 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-300"
          }`}
        />
      )}
      <span
        className={`relative z-10 overflow-hidden whitespace-nowrap transition-all duration-300 ${
          collapsed ? "max-w-0 -translate-x-1 opacity-0" : "max-w-[180px] translate-x-0 opacity-100"
        } ${
          isActive ? "text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100"
        }`}
      >
        {label}
      </span>
    </NavLink>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  const currentParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const currentTab = currentParams.get("tab") || "overview";

  const isAdminLike = useMemo(
    () => ["superadmin", "admin", "it_employee"].includes(user?.role),
    [user?.role]
  );

  const navItems = useMemo(() => {
    if (user?.role === "superadmin" || user?.role === "admin") {
      return [
        { to: "/admin", label: "Overview", tab: "overview", icon: LayoutDashboard },
        { to: "/admin/pending-users", label: "Pending Users", tab: "pending-users", icon: Clock },
        { to: "/admin?tab=tickets", label: "All Tickets", tab: "tickets", icon: Ticket },
        { to: "/admin?tab=users", label: "Team Member", tab: "users", icon: Users },
        { to: "/admin?tab=departments", label: "Departments", tab: "departments", icon: Building2 },
        { to: "/admin?tab=categories", label: "Categories", tab: "categories", icon: Tags },
      ];
    }

    if (user?.role === "it_employee") {
      return [
        { to: "/admin", label: "Overview", tab: "overview", icon: LayoutDashboard },
        { to: "/admin?tab=tickets", label: "All Tickets", tab: "tickets", icon: Ticket },
      ];
    }

    if (isAdminLike) {
      return [
        { to: "/admin", label: "Dashboard", tab: "overview", icon: LayoutDashboard },
      ];
    }

    return [
      { to: "/employee", label: "Dashboard", tab: "overview", icon: LayoutDashboard },
      { to: "/employee?tab=my-ticket", label: "My Ticket", tab: "my-ticket", icon: Ticket },
    ];
  }, [isAdminLike, user?.role]);

  const breadcrumbItems = useMemo(() => {
    if (location.pathname === "/admin/pending-users") {
      return ["Dashboard", "Pending Users"];
    }

    if (location.pathname.startsWith("/admin")) {
      const tabLabelMap = {
        overview: "Overview",
        tickets: "All Tickets",
        users: "Team Member",
        categories: "Categories",
      };
      return ["Dashboard", tabLabelMap[currentTab] || "Overview"];
    }

    if (location.pathname.startsWith("/employee/tickets/") && location.pathname.endsWith("/edit")) {
      return ["Dashboard", "My Tickets", "Edit Ticket"];
    }

    if (location.pathname.startsWith("/employee/tickets/")) {
      return ["Dashboard", "My Tickets", "Ticket Detail"];
    }

    if (location.pathname.startsWith("/employee")) {
      const employeeTabLabelMap = {
        overview: "Overview",
        "my-ticket": "My Ticket",
      };
      return ["Dashboard", employeeTabLabelMap[currentTab] || "Overview"];
    }

    if (location.pathname.startsWith("/profile")) {
      return ["Dashboard", "Profile"];
    }

    return ["Dashboard"];
  }, [currentTab, location.pathname]);

  const userAvatar = getAvatarPath(user?.avatar_index);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f9_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] md:h-screen md:overflow-hidden transition-colors duration-300">
      <div className="flex min-h-dvh w-screen gap-3 p-3 md:h-full md:gap-5 md:p-4">
        <aside
          className={`group/sidebar fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/95 dark:border-slate-700 dark:bg-slate-900/95 p-4 backdrop-blur-md transition-[transform,width] duration-300 ease-in-out md:relative md:static md:h-full md:translate-x-0 md:rounded-2xl md:border ${
            sidebarCollapsed ? "md:w-24" : "md:w-72"
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <button
            type="button"
            className="hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-400 shadow-sm transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 md:absolute md:right-0 md:top-8 md:z-20 md:inline-flex md:translate-x-1/2 md:pointer-events-none md:translate-y-1 md:opacity-0 md:group-hover/sidebar:pointer-events-auto md:group-hover/sidebar:translate-y-0 md:group-hover/sidebar:opacity-100 md:group-focus-within/sidebar:pointer-events-auto md:group-focus-within/sidebar:translate-y-0 md:group-focus-within/sidebar:opacity-100"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={16} aria-hidden="true" />
            ) : (
              <ChevronLeft size={16} aria-hidden="true" />
            )}
          </button>

          <div className="flex h-full flex-col">
            <div className="mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex min-w-0 items-center gap-1">
                <img
                  src="/image/logo_antick_async.png"
                  alt="Antick Async Logo"
                  className="h-10 w-20 rounded-md object-contain"
                />
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                  }`}
                >
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Antick</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const getIsActive = () => {
                  // Exact match untuk pending-users
                  if (item.to === "/admin/pending-users") {
                    return location.pathname === "/admin/pending-users";
                  }

                  // Admin routes
                  if (location.pathname === "/admin") {
                    // Admin overview
                    if (item.to === "/admin") {
                      return currentTab === "overview";
                    }
                    // Admin query string based items (All Tickets, Team Member, Categories)
                    if (item.to.includes("?tab=")) {
                      const expectedTab = new URLSearchParams(item.to.split("?")[1]).get("tab");
                      return currentTab === expectedTab;
                    }
                  }

                  // Employee routes
                  if (location.pathname === "/employee") {
                    // Employee dashboard
                    if (item.to === "/employee") {
                      return currentTab === "overview" || !location.search;
                    }
                    // Employee query string based items (My Ticket)
                    if (item.to.includes("?tab=")) {
                      const expectedTab = new URLSearchParams(item.to.split("?")[1]).get("tab");
                      return currentTab === expectedTab;
                    }
                  }

                  // Fallback for other routes
                  return false;
                };

                return (
                  <SidebarLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    collapsed={sidebarCollapsed}
                    onClick={() => setMobileOpen(false)}
                    isActive={getIsActive()}
                  />
                );
              })}
            </nav>
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

        <section className="flex min-h-dvh min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/85 dark:border-slate-700 dark:bg-slate-900/85 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)] dark:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.7)] md:h-full md:min-h-0 md:rounded-2xl transition-colors duration-300">
          <header className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 md:px-6 bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                Menu
              </Button>

              <div className="hidden min-w-0 items-center gap-2 text-sm text-slate-500 dark:text-slate-400 md:flex">
                {breadcrumbItems.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex min-w-0 items-center gap-2">
                    {index > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                    <span
                      className={
                        index === breadcrumbItems.length - 1
                          ? "truncate font-semibold text-slate-700 dark:text-slate-300"
                          : "truncate"
                      }
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="relative ml-auto flex items-center gap-3" ref={profileMenuRef}>
                <ThemeToggle />
                <NotificationCenter />

                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 transition hover:shadow-sm dark:hover:bg-slate-700"
                  aria-label="Open profile menu"
                >
                  <span className="hidden text-right leading-tight md:block">
                    <span className="block max-w-[180px] truncate text-base font-semibold text-slate-800 dark:text-slate-100">
                      {user?.name || "User"}
                    </span>
                    <span className="block max-w-[180px] truncate text-xs capitalize text-slate-500 dark:text-slate-400">
                      {user?.role || "-"}
                    </span>
                  </span>

                  <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <img src={userAvatar} alt="User profile" className="h-full w-full object-cover" />
                  </span>

                  <ChevronDown size={16} aria-hidden="true" className="hidden text-slate-400 dark:text-slate-500 md:block" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)]">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-4 text-left text-sm text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                      onClick={() => {
                        navigate("/profile");
                        setProfileMenuOpen(false);
                      }}
                    >
                      <User size={15} aria-hidden="true" />
                      Profile
                    </button>

                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-4 text-left text-sm text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5 dark:bg-slate-900">
            <Outlet />
          </main>
        </section>
      </div>
    </div>
  );
}
