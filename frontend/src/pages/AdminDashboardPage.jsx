import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi, categoryApi, ticketApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { ActivityLineChart, CategoryDonutChart } from "../components/dashboard/ChartPanels";

const statusOptions = ["open", "in_progress", "resolved", "closed"];
const roleOptions = ["employee", "it_employee", "admin", "superadmin"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const validTabs = ["overview", "tickets", "users", "categories"];

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

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get("tab");
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(
    validTabs.includes(queryTab) ? queryTab : "overview"
  );
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", assignee: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ticketData, userData, dashboardData, categoryData] = await Promise.all([
        ticketApi.list({ limit: 100 }),
        adminApi.listUsers({ limit: 100 }),
        adminApi.dashboard(),
        categoryApi.list(),
      ]);
      setTickets(ticketData.items || []);
      setUsers(userData.items || []);
      setDashboard(dashboardData);
      setCategories(categoryData || []);
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

  const itEmployees = users.filter((item) => item.role === "it_employee" || item.role === "admin");

  const summary = useMemo(() => {
    const total = dashboard?.total_tickets ?? tickets.length;
    const resolved = (dashboard?.by_status?.resolved || 0) + (dashboard?.by_status?.closed || 0);
    const resolvedRate = total ? `${Math.round((resolved / total) * 100)}%` : "0%";
    const activeUsers = users.filter((item) => item.is_active).length;

    return [
      { label: "Total Tickets", value: total },
      { label: "Active Users", value: activeUsers },
      { label: "Response Time", value: "2.4h" },
      { label: "Resolved", value: resolvedRate },
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
      subtitle: "Manage user roles and team access.",
    },
    categories: {
      title: "Settings",
      subtitle: "Configure support categories.",
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

  const createCategory = async (event) => {
    event.preventDefault();
    try {
      await categoryApi.create(categoryForm);
      setCategoryForm({ name: "", description: "" });
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

  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch =
      !filters.search ||
      ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = !filters.status || ticket.status === filters.status;
    const matchPriority = !filters.priority || ticket.priority === filters.priority;
    const matchAssignee = !filters.assignee || String(ticket.assignee_id || "") === filters.assignee;
    return matchSearch && matchStatus && matchPriority && matchAssignee;
  });

  if (loading) {
    return <LoadingSpinner text="Memuat dashboard admin..." />;
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{tabMeta[activeTab].title}</h1>
          <p className="mt-1 text-sm text-slate-500">{tabMeta[activeTab].subtitle}</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={loadData}>Refresh Dashboard</Button>
      </section>

      {activeTab === "overview" && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <MetricCard key={item.label} label={item.label} value={item.value} />
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

          <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            <Card title="Ticket List" subtitle="Recent tickets in system.">
              <div className="overflow-x-auto">
                <table className="min-w-[680px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2">Ticket ID</th>
                      <th className="py-2">Subject</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.slice(0, 6).map((ticket) => (
                      <tr key={ticket.id} className="border-b border-slate-100">
                        <td className="py-2 text-slate-500">#{ticket.id}</td>
                        <td className="py-2 font-medium text-slate-800">{ticket.title}</td>
                        <td className="py-2">
                          <StatusBadge value={ticket.status} />
                        </td>
                        <td className="py-2 text-slate-600">{ticket.assignee?.name || "Unassigned"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Recent Activities" subtitle="Latest ticket updates.">
              <div className="space-y-3">
                {recentActivities.length === 0 && <p className="text-sm text-slate-500">No activity data yet.</p>}
                {recentActivities.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-800">#{ticket.id} {ticket.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Updated: {new Date(ticket.updated_at || ticket.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {activeTab === "tickets" && (
        <Card title="All Tickets" subtitle="Manage assignee, status, and find ticket quickly.">
          <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Search"
              placeholder="title/description"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            <label className="text-sm text-slate-700">
              Status
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              >
                <option value="">All</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700">
              Priority
              <select
                value={filters.priority}
                onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              >
                <option value="">All</option>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700">
              Assignee
              <select
                value={filters.assignee}
                onChange={(e) => setFilters((prev) => ({ ...prev, assignee: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              >
                <option value="">All</option>
                {itEmployees.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          </div>

          {filteredTickets.length === 0 ? (
            <p className="text-sm text-slate-500">No ticket data matches your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2">Title</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Priority</th>
                    <th className="py-2">Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-slate-100 align-top">
                      <td className="py-2 pr-4">
                        <p className="font-medium text-slate-800">{ticket.title}</p>
                        <p className="text-xs text-slate-500">Requester: {ticket.requester?.name || "-"}</p>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="mb-1"><StatusBadge value={ticket.status} /></div>
                        <select
                          value={ticket.status}
                          onChange={(e) => updateTicket(ticket.id, { status: e.target.value })}
                          className="rounded-md border border-slate-300 px-2 py-1"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-4">
                        <StatusBadge value={ticket.priority} />
                      </td>
                      <td className="py-2">
                        <select
                          value={ticket.assignee_id ?? ""}
                          onChange={(e) =>
                            updateTicket(ticket.id, {
                              assignee_id: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          className="rounded-md border border-slate-300 px-2 py-1"
                        >
                          <option value="">Unassigned</option>
                          {itEmployees.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
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
        <Card title="User Management" subtitle="Change role assignments for the team.">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.email}</td>
                    <td className="py-2"><StatusBadge value={item.role} /></td>
                    <td className="py-2">
                      <select
                        value={item.role}
                        onChange={(e) => updateRole(item.id, e.target.value)}
                        className="rounded-md border border-slate-300 px-2 py-1"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "categories" && (
        <Card title="Category Management" subtitle="Create and update support categories.">
          <form onSubmit={createCategory} className="mb-4 grid gap-2 md:grid-cols-[1fr_2fr_auto]">
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
            <div className="self-end">
              <Button type="submit" className="w-full md:w-auto">Add Category</Button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-[620px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.description || "-"}</td>
                    <td className="py-2">
                      <Button variant="secondary" size="sm" onClick={() => setEditingCategory(item)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
