import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCheck, ChevronDown, CircleDot, Clock3, FolderCheck, Pencil, Plus, Trash2, User, Eye, Ticket, Users } from "lucide-react";
import { adminApi, categoryApi, ticketApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { getAvatarPath } from "../constants/avatars";
import { AnimatedMetricValue } from "../components/AnimatedMetricValue";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { ActivityLineChart, CategoryDonutChart, DepartmentBarChart, ResponseTimeBarChart } from "../components/dashboard/ChartPanels";

const statusOptions = ["open", "in_progress", "resolved", "closed"];
const roleOptions = ["employee", "it_employee", "admin", "superadmin"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const validTabs = ["overview", "tickets", "users", "categories", "departments"];

function monthLabel(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short" });
}

function buildSeries(tickets) {
  const now = new Date();
  const monthKeys = [];

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const initial = monthKeys.reduce((acc, key) => {
    acc[key] = { total: 0, resolved: 0, open: 0 };
    return acc;
  }, {});

  tickets.forEach((ticket) => {
    const date = new Date(ticket.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!initial[key]) return;

    initial[key].total += 1;
    if (ticket.status === "resolved" || ticket.status === "closed") {
      initial[key].resolved += 1;
    }
    if (ticket.status === "open" || ticket.status === "in_progress") {
      initial[key].open += 1;
    }
  });

  return {
    labels: monthKeys.map((key) => {
      const [year, month] = key.split("-");
      return monthLabel(new Date(Number(year), Number(month) - 1, 1));
    }),
    totalSeries: monthKeys.map((key) => initial[key].total),
    resolvedSeries: monthKeys.map((key) => initial[key].resolved),
    openSeries: monthKeys.map((key) => initial[key].open),
  };
}

function getAvatarUrl(person) {
  // Use avatar_index if available, otherwise fallback to default
  if (typeof person?.avatar_index === "number") {
    return getAvatarPath(person.avatar_index);
  }
  // Fallback to legacy URL fields for backward compatibility
  return (
    person?.profile_picture ||
    person?.profilePicture ||
    person?.avatar_url ||
    person?.avatarUrl ||
    getAvatarPath() // Default avatar
  );
}

function UserInline({ person, fallback = "-" }) {
  if (!person) {
    return <span className="text-slate-500 dark:text-slate-400">{fallback}</span>;
  }

  const avatarUrl = getAvatarUrl(person);
  const displayName = person?.name || fallback;

  return (
    <span className="inline-flex items-center gap-2">
      <img
        src={avatarUrl}
        alt={displayName}
        className="h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
      />
      <div className="flex flex-row items-center gap-2">
        <span className="text-slate-700 dark:text-slate-300">{displayName}</span>
        {person?.department && (
          <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium w-fit">
            {person.department}
          </span>
        )}
      </div>
    </span>
  );
}

function StatusMark({ status }) {
  const meta = {
    open: { icon: CircleDot, style: "bg-slate-100 text-slate-700" },
    in_progress: { icon: Clock3, style: "bg-amber-100 text-amber-800" },
    resolved: { icon: CheckCheck, style: "bg-emerald-100 text-emerald-800" },
    closed: { icon: FolderCheck, style: "bg-zinc-200 text-zinc-700" },
  };

  const config = meta[status] || meta.open;
  const Icon = config.icon;

  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${config.style}`}>
      <Icon size={13} aria-hidden="true" />
    </span>
  );
}

function AssigneeAvatar({ person }) {
  if (!person) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-500">
        <User size={12} aria-hidden="true" />
      </span>
    );
  }

  const avatarUrl = getAvatarUrl(person);
  const displayName = person?.name || "U";

  return (
    <img
      src={avatarUrl}
      alt={displayName}
      className="h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
    />
  );
}

function ThemedSelect({ value, onChange, children, className = "", leftAdornment = null }) {
  return (
    <div className="relative">
      {leftAdornment && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{leftAdornment}</span>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 text-sm text-slate-700 dark:text-slate-100 outline-none transition focus:border-slate-300 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 ${leftAdornment ? "pl-11" : "pl-3"} ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get("tab");
  const queryFilter = (searchParams.get("q") || "").trim().toLowerCase();
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [departmentAnalytics, setDepartmentAnalytics] = useState([]);
  const [responseTimeAnalytics, setResponseTimeAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(
    validTabs.includes(queryTab) ? queryTab : "overview"
  );
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", assignee: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({ name: "", description: "" });
  const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [assigneePickerTicket, setAssigneePickerTicket] = useState(null);
  const [editingUserDepartment, setEditingUserDepartment] = useState(null);
  const [departmentEditMode, setDepartmentEditMode] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assigneePickerPosition, setAssigneePickerPosition] = useState({ top: 0, left: 0 });
  const assigneePickerRef = useRef(null);
  const assigneeTriggerRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ticketData, userData, dashboardData, categoryData, departmentData, deptAnalytics, responseTimeData] = await Promise.all([
        ticketApi.list({ limit: 100 }),
        adminApi.listUsers({ limit: 100 }),
        adminApi.dashboard(),
        categoryApi.list(),
        adminApi.getDepartments(),
        adminApi.departmentAnalytics(),
        adminApi.responseTimeAnalytics(),
      ]);
      setTickets(ticketData.items || []);
      setUsers(userData.items || []);
      setDashboard(dashboardData);
      setCategories(categoryData || []);
      setDepartments(Array.isArray(departmentData) ? departmentData : (departmentData.items || []));
      setDepartmentAnalytics(deptAnalytics || []);
      setResponseTimeAnalytics(responseTimeData || []);
    } catch (err) {
      setError(err.message || "Gagal memuat dashboard admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (validTabs.includes(queryTab)) {
      setActiveTab(queryTab);
      return;
    }
    setActiveTab("overview");
  }, [queryTab]);

  useEffect(() => {
    if (!assigneePickerTicket) return undefined;

    const handleOutsideClick = (event) => {
      const isInsidePicker = assigneePickerRef.current?.contains(event.target);
      const isInsideTrigger = assigneeTriggerRef.current?.contains(event.target);

      if (!isInsidePicker && !isInsideTrigger) {
        setAssigneePickerTicket(null);
      }
    };

    const updatePickerPosition = () => {
      if (!assigneeTriggerRef.current || !assigneePickerRef.current) return;

      const triggerRect = assigneeTriggerRef.current.getBoundingClientRect();
      const panelWidth = assigneePickerRef.current.offsetWidth;
      const panelHeight = assigneePickerRef.current.offsetHeight;
      const gap = 8;
      const sidePadding = 10;

      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const shouldOpenTop =
        spaceBelow < panelHeight + gap && spaceAbove > panelHeight + gap;

      let top = shouldOpenTop
        ? triggerRect.top - panelHeight - gap
        : triggerRect.bottom + gap;
      let left = triggerRect.right - panelWidth;

      top = Math.min(
        Math.max(top, sidePadding),
        window.innerHeight - panelHeight - sidePadding
      );
      left = Math.min(
        Math.max(left, sidePadding),
        window.innerWidth - panelWidth - sidePadding
      );

      setAssigneePickerPosition({ top, left });
    };

    updatePickerPosition();
    window.addEventListener("resize", updatePickerPosition);
    window.addEventListener("scroll", updatePickerPosition, true);

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("resize", updatePickerPosition);
      window.removeEventListener("scroll", updatePickerPosition, true);
    };
  }, [assigneePickerTicket]);

  const itEmployees = users.filter((item) => item.role === "it_employee" || item.role === "admin");

  const summary = useMemo(() => {
    const total = dashboard?.total_tickets ?? tickets.length;
    const resolved = (dashboard?.by_status?.resolved || 0) + (dashboard?.by_status?.closed || 0);
    const resolvedRate = total ? `${Math.round((resolved / total) * 100)}%` : "0%";
    const activeUsers = users.filter((item) => item.is_active).length;

    return [
      { label: "Total Tickets", value: total, icon: Ticket },
      { label: "Active Users", value: activeUsers, icon: Users },
      { label: "Response Time", value: "2.4h", icon: Clock3 },
      { label: "Resolved", value: resolvedRate, icon: CheckCheck },
    ];
  }, [dashboard, tickets.length, users]);

  const chartSeries = useMemo(() => buildSeries(tickets), [tickets]);

  const categoryValues = useMemo(() => {
    const palette = ["#2563eb", "#38bdf8", "#a78bfa", "#f59e0b", "#10b981", "#0ea5e9"];
    return categories.map((cat, index) => {
      const count = tickets.filter((ticket) => ticket.category_id === cat.id).length;
      return { label: cat.name, value: count, color: palette[index % palette.length] };
    });
  }, [categories, tickets]);

  const recentActivities = useMemo(
    () =>
      [...tickets]
        .sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at).getTime() -
            new Date(a.updated_at || a.created_at).getTime()
        )
        .slice(0, 5),
    [tickets]
  );

  const tabMeta = {
    overview: {
      title: `Welcome ${user?.name || "Admin"}`,
      subtitle: "Here is your support performance overview.",
    },
    tickets: {
      title: "All Tickets",
      subtitle: "Manage assignee, status, and ticket progress.",
    },
    users: {
      title: "Team Member",
      subtitle: "Manage user roles, departments and team access.",
    },
    categories: {
      title: "Categories",
      subtitle: "Configure support categories.",
    },
    departments: {
      title: "Departments",
      subtitle: "View all available departments in the system.",
    },
  };

  const updateTicket = async (ticketId, payload) => {
    try {
      await ticketApi.updateByAdmin(ticketId, payload);
      await loadData();
    } catch (err) {
      setError(err.message || "Gagal update tiket.");
    }
  };

  const updateRole = async (userId, role) => {
    try {
      await adminApi.updateUserRole(userId, role);
      await loadData();
    } catch (err) {
      setError(err.message || "Gagal mengubah role user.");
    }
  };

  const updateUserDepartment = async (userId, department) => {
    try {
      await adminApi.updateUserDepartment(userId, department);
      await loadData();
      setEditingUserDepartment(null);
      setDepartmentEditMode(null);
    } catch (err) {
      setError(err.message || "Gagal mengubah departemen user.");
    }
  };

  const createCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    try {
      await categoryApi.create(categoryForm);
      setCategoryForm({ name: "", description: "" });
      setIsCreateCategoryOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Gagal membuat kategori.");
    }
  };

  const saveCategoryUpdate = async () => {
    if (!editingCategory) return;
    try {
      await categoryApi.update(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description,
      });
      setEditingCategory(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Gagal update kategori.");
    }
  };

  const deleteCategory = async (categoryId) => {
    const confirmDelete = window.confirm("Hapus kategori ini?");
    if (!confirmDelete) return;

    try {
      await categoryApi.remove(categoryId);
      await loadData();
    } catch (err) {
      setError(err.message || "Gagal menghapus kategori.");
    }
  };

  const createDepartment = async () => {
    if (!departmentForm.name.trim()) {
      setError("Nama departemen tidak boleh kosong.");
      return;
    }

    try {
      await adminApi.createDepartment(departmentForm);
      setDepartmentForm({ name: "", description: "" });
      setIsCreateDepartmentOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Gagal membuat departemen.");
    }
  };

  const updateDepartment = async () => {
    if (!editingDepartment) return;

    try {
      await adminApi.updateDepartment(editingDepartment.id, {
        name: editingDepartment.name,
        description: editingDepartment.description,
      });
      setEditingDepartment(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Gagal mengubah departemen.");
    }
  };

  const deleteDepartment = async (deptId) => {
    const confirmDelete = window.confirm("Hapus departemen ini?");
    if (!confirmDelete) return;

    try {
      await adminApi.deleteDepartment(deptId);
      await loadData();
    } catch (err) {
      setError(err.message || "Gagal menghapus departemen.");
    }
  };

  const handleAssigneeSelect = async (assigneeId) => {
    if (!assigneePickerTicket) return;

    const ticketId = assigneePickerTicket.id;
    setAssigneePickerTicket(null);
    await updateTicket(ticketId, { assignee_id: assigneeId });
  };

  const handleAssigneePickerToggle = (ticket, event) => {
    if (assigneePickerTicket?.id === ticket.id) {
      setAssigneePickerTicket(null);
      return;
    }

    assigneeTriggerRef.current = event.currentTarget;

    // Temporary anchor before measured reposition runs in effect.
    const triggerRect = event.currentTarget.getBoundingClientRect();
    setAssigneePickerPosition({ top: triggerRect.bottom + 8, left: triggerRect.right - 320 });
    setAssigneePickerTicket(ticket);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const tabQueryMatch =
      !queryFilter ||
      ticket.title.toLowerCase().includes(queryFilter) ||
      ticket.description.toLowerCase().includes(queryFilter) ||
      String(ticket.id).includes(queryFilter);

    const matchSearch =
      !filters.search ||
      ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = !filters.status || ticket.status === filters.status;
    const matchPriority = !filters.priority || ticket.priority === filters.priority;
    const matchAssignee = !filters.assignee || String(ticket.assignee_id || "") === filters.assignee;
    return tabQueryMatch && matchSearch && matchStatus && matchPriority && matchAssignee;
  });

  const filteredUsers = users.filter((item) => {
    if (!queryFilter) return true;

    return (
      item.name.toLowerCase().includes(queryFilter) ||
      item.email.toLowerCase().includes(queryFilter) ||
      item.role.toLowerCase().includes(queryFilter)
    );
  });

  const filteredCategories = categories.filter((item) => {
    if (!queryFilter) return true;

    return (
      item.name.toLowerCase().includes(queryFilter) ||
      (item.description || "").toLowerCase().includes(queryFilter)
    );
  });

  if (loading) {
    return <LoadingSpinner text="Memuat dashboard admin..." />;
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{tabMeta[activeTab].title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tabMeta[activeTab].subtitle}</p>
        </div>

        {activeTab === "categories" && (
          <Button
            onClick={() => setIsCreateCategoryOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2592ea] px-4 py-2 text-white hover:bg-blue-500"
          >
            <Plus size={16} aria-hidden="true" />
            Add Category
          </Button>
        )}

        {activeTab === "departments" && (
          <Button
            onClick={() => setIsCreateDepartmentOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2592ea] px-4 py-2 text-white hover:bg-blue-500"
          >
            <Plus size={16} aria-hidden="true" />
            Add Department
          </Button>
        )}
      </section>

      {activeTab === "overview" && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <MetricCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
            ))}
          </section>

          <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
            <ActivityLineChart
              labels={chartSeries.labels}
              lines={[
                { label: "Total", color: "#2563eb", values: chartSeries.totalSeries },
                { label: "Resolved", color: "#10b981", values: chartSeries.resolvedSeries },
                { label: "Open", color: "#f59e0b", values: chartSeries.openSeries },
              ]}
            />
            <CategoryDonutChart values={categoryValues} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <DepartmentBarChart values={departmentAnalytics} />
            <ResponseTimeBarChart values={responseTimeAnalytics} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            <Card title="Ticket List" subtitle="Recent tickets in system.">
              <div className="overflow-x-auto">
                <table className="min-w-[680px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <th className="py-3">ID</th>
                      <th className="py-3">Subject</th>
                      <th className="py-3">Requester</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.slice(0, 6).map((ticket) => (
                      <tr key={ticket.id} className="border-b border-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2 text-slate-500 dark:text-slate-400">#{ticket.id}</td>
                        <td className="py-2 font-medium text-slate-800 dark:text-slate-200">{ticket.title}</td>
                        <td className="py-2">
                          <UserInline person={ticket.requester} fallback="-" />
                        </td>
                        <td className="py-2">
                          <StatusBadge value={ticket.status} />
                        </td>
                        <td className="py-2">
                          <UserInline person={ticket.assignee} fallback="Unassigned" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Recent Activities" subtitle="Latest ticket updates.">
              <div className="space-y-3">
                {recentActivities.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No activity data yet.</p>}
                {recentActivities.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 transition hover:bg-slate-100 dark:hover:bg-slate-700">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">#{ticket.id} {ticket.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Updated: {new Date(ticket.updated_at || ticket.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {error && <p className="rounded-lg border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">{error}</p>}

      {activeTab === "tickets" && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Search"
              placeholder="title/description"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            <label className="text-sm text-slate-700 dark:text-slate-300">
              Status
              <ThemedSelect
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1"
              >
                <option value="">All</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </ThemedSelect>
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-300">
              Priority
              <ThemedSelect
                value={filters.priority}
                onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                className="mt-1"
              >
                <option value="">All</option>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </ThemedSelect>
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-300">
              Assignee
              <ThemedSelect
                value={filters.assignee}
                onChange={(e) => setFilters((prev) => ({ ...prev, assignee: e.target.value }))}
                className="mt-1"
              >
                <option value="">All</option>
                {itEmployees.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </ThemedSelect>
            </label>
          </div>

          {filteredTickets.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No ticket data matches your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <th className="py-2">Title</th>
                    <th className="py-2">Priority</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Assignee</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/40 transition align-middle">
                      <td className="py-2 pr-4">
                        <p className="font-medium text-slate-800">{ticket.title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400"></p>
                        <div className="mt-1 text-xs">
                          <UserInline person={ticket.requester} fallback="-" />
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <StatusBadge value={ticket.priority} />
                      </td>
                      <td className="py-2 pr-4">
                        <ThemedSelect
                          value={ticket.status}
                          onChange={(e) => updateTicket(ticket.id, { status: e.target.value })}
                          className="rounded-lg bg-white py-1.5 pr-8"
                          leftAdornment={<StatusMark status={ticket.status} />}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
                          ))}
                        </ThemedSelect>
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={(event) => handleAssigneePickerToggle(ticket, event)}
                          className="inline-flex w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-left text-sm text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <span className="inline-flex items-center gap-2">
                            <AssigneeAvatar person={ticket.assignee} />
                            <span>{ticket.assignee?.name || "Unassigned"}</span>
                          </span>
                          <ChevronDown size={14} aria-hidden="true" className="text-slate-400" />
                        </button>
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(ticket)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                          title="View details"
                        >
                          <Eye size={16} aria-hidden="true" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === "users" && (
        <Card>
          {filteredUsers.length === 0 && (
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Tidak ada user yang cocok dengan pencarian.</p>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Department</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2">
                      <UserInline person={item} fallback={item.name || "-"} />
                    </td>
                    <td className="py-2 text-slate-600 dark:text-slate-400">{item.email}</td>
                    <td className="py-2">
                      {editingUserDepartment === item.id ? (
                        <ThemedSelect
                          value={item.role}
                          onChange={(e) => setDepartmentEditMode((prev) => ({ ...prev, role: e.target.value }))}
                          className="rounded-lg bg-white dark:bg-slate-800 py-1.5 pr-8 text-xs"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </ThemedSelect>
                      ) : (
                        <StatusBadge value={item.role} />
                      )}
                    </td>
                    <td className="py-2">
                      {editingUserDepartment === item.id ? (
                        <ThemedSelect
                          value={departmentEditMode?.department || item.department_id || ""}
                          onChange={(e) => setDepartmentEditMode((prev) => ({ ...prev, department: e.target.value }))}
                          className="rounded-lg bg-white dark:bg-slate-800 py-1.5 pr-8 text-xs"
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </ThemedSelect>
                      ) : (
                        <span className="text-slate-600 dark:text-slate-400">
                          {item.department || "-"}
                        </span>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        {editingUserDepartment === item.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (departmentEditMode?.role && departmentEditMode.role !== item.role) {
                                  updateRole(item.id, departmentEditMode.role);
                                }
                                if (departmentEditMode?.department && departmentEditMode.department !== item.department_id) {
                                  updateUserDepartment(item.id, parseInt(departmentEditMode.department));
                                }
                                setEditingUserDepartment(null);
                                setDepartmentEditMode(null);
                              }}
                              className="inline-flex items-center justify-center rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-2 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 transition hover:bg-green-100 dark:hover:bg-green-900/40"
                            >
                              <CheckCheck size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUserDepartment(null);
                                setDepartmentEditMode(null);
                              }}
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUserDepartment(item.id);
                              setDepartmentEditMode({ role: item.role, department: item.department_id });
                            }}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "categories" && (
        <>
          <Card>
            <div className="overflow-x-auto">
              {filteredCategories.length === 0 && (
                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Tidak ada kategori yang cocok dengan pencarian.</p>
              )}
              <table className="min-w-[620px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <th className="py-2">Name</th>
                    <th className="py-2">Description</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2 text-slate-900 dark:text-slate-100">{item.name}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-400">{item.description || "-"}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingCategory(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                            aria-label="Edit category"
                            title="Edit category"
                          >
                            <Pencil size={14} aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteCategory(item.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            aria-label="Delete category"
                            title="Delete category"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeTab === "departments" && (
        <>
          <Card>
            <div className="overflow-x-auto">
              {departments.length === 0 && (
                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Tidak ada departemen yang tersedia.</p>
              )}
              <table className="min-w-[620px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <th className="py-2">Name</th>
                    <th className="py-2">Description</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2 text-slate-900 dark:text-slate-100">{item.name}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-400">{item.description || "-"}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingDepartment(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                            aria-label="Edit department"
                            title="Edit department"
                          >
                            <Pencil size={14} aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteDepartment(item.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            aria-label="Delete department"
                            title="Delete department"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {assigneePickerTicket && (
        <div
          ref={assigneePickerRef}
          className="fixed z-[80] w-[320px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-lg dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)]"
          style={{
            top: assigneePickerPosition.top,
            left: assigneePickerPosition.left,
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Pilih Assignee
            </p>
            <button
              type="button"
              onClick={() => setAssigneePickerTicket(null)}
              className="text-xs text-slate-500 dark:text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-300"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleAssigneeSelect(null)}
              className={`aspect-square rounded-xl border p-2 transition ${
                !assigneePickerTicket.assignee_id
                  ? "border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-900"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <span className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  <User size={16} aria-hidden="true" />
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Unassigned</span>
              </span>
            </button>

            {itEmployees.map((item) => {
              const isActive = assigneePickerTicket.assignee_id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAssigneeSelect(item.id)}
                  className={`aspect-square rounded-xl border p-2 transition ${
                    isActive
                      ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                  title={item.name}
                >
                  <span className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <AssigneeAvatar person={item} />
                    <span className="line-clamp-2 text-xs font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      )}

      <Modal
        open={isCreateCategoryOpen}
        title="Add Category"
        onClose={() => setIsCreateCategoryOpen(false)}
        onConfirm={createCategory}
        confirmText="Add Category"
      >
        <div className="space-y-2">
          <Input
            label="Name"
            required
            value={categoryForm.name}
            onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Description"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(editingCategory)}
        title="Edit Category"
        onClose={() => setEditingCategory(null)}
        onConfirm={saveCategoryUpdate}
        confirmText="Save"
      >
        {editingCategory && (
          <div className="space-y-2">
            <Input
              label="Name"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Description"
              value={editingCategory.description || ""}
              onChange={(e) => setEditingCategory((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={isCreateDepartmentOpen}
        title="Add Department"
        onClose={() => setIsCreateDepartmentOpen(false)}
        onConfirm={createDepartment}
        confirmText="Add Department"
      >
        <div className="space-y-2">
          <Input
            label="Name"
            required
            value={departmentForm.name}
            onChange={(e) => setDepartmentForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Description"
            value={departmentForm.description}
            onChange={(e) => setDepartmentForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(editingDepartment)}
        title="Edit Department"
        onClose={() => setEditingDepartment(null)}
        onConfirm={updateDepartment}
        confirmText="Save"
      >
        {editingDepartment && (
          <div className="space-y-2">
            <Input
              label="Name"
              value={editingDepartment.name}
              onChange={(e) => setEditingDepartment((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Description"
              value={editingDepartment.description || ""}
              onChange={(e) => setEditingDepartment((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(selectedTicket)}
        title={selectedTicket ? `Ticket #${selectedTicket.id}` : ""}
        onClose={() => setSelectedTicket(null)}
      >
        {selectedTicket && (
          <div className="grid grid-cols-[1.5fr_1fr] gap-6">
            {/* Left Column: Title & Description & Timestamps */}
            <div className="space-y-4">
              {/* Title with border */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">Judul Masalah</h3>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">{selectedTicket.title}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">Deskripsi</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Timestamps - minimal styling */}
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-2">
                <p>Created: {new Date(selectedTicket.created_at).toLocaleString("id-ID")}</p>
                {selectedTicket.updated_at && (
                  <p>Updated: {new Date(selectedTicket.updated_at).toLocaleString("id-ID")}</p>
                )}
              </div>
            </div>

            {/* Right Column: Requester, Status, Priority */}
            <div className="space-y-4">
              {/* Requester */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-3">Pelapor</h3>
                <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-center">
                  {selectedTicket.requester && (
                    <>
                      <img
                        src={getAvatarUrl(selectedTicket.requester)}
                        alt={selectedTicket.requester.name}
                        className="h-16 w-16 rounded-full border-2 border-slate-300 dark:border-slate-600 object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedTicket.requester.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{selectedTicket.requester.department || "-"}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">Status</h3>
                  <StatusBadge value={selectedTicket.status} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">Priority</h3>
                  <StatusBadge value={selectedTicket.priority} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MetricCard({ label, value, icon: IconComponent }) {
  return (
    <article className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            <AnimatedMetricValue value={value} />
          </p>
        </div>
        {IconComponent && (
          <div className="transition-all duration-300 ease-out group-hover:scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400">
            <IconComponent size={40} className="text-slate-300 dark:text-slate-600 flex-shrink-0" strokeWidth={1.5} />
          </div>
        )}
      </div>
    </article>
  );
}
