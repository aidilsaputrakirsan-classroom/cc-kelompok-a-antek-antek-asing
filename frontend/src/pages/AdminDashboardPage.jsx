import { useEffect, useState } from "react";
import AppNavbar from "../components/AppNavbar";
import { adminApi, categoryApi, ticketApi } from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

const statusOptions = ["open", "in_progress", "resolved", "closed"];
const roleOptions = ["employee", "it_employee", "admin", "superadmin"];
const priorityOptions = ["low", "medium", "high", "urgent"];

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("tickets");
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", assignee: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ticketData, userData, dashboardData, categoryData] = await Promise.all([
        ticketApi.list(),
        adminApi.listUsers(),
        adminApi.dashboard(),
        categoryApi.list(),
      ]);
      setTickets(ticketData.items || []);
      setUsers(userData.items || []);
      setDashboard(dashboardData);
      setCategories(categoryData || []);
    } catch (err) {
      setError(err?.response?.data?.detail || "Gagal memuat dashboard admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const itEmployees = users.filter((user) => user.role === "it_employee");

  const updateTicket = async (ticketId, payload) => {
    try {
      await ticketApi.updateByAdmin(ticketId, payload);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Gagal update tiket.");
    }
  };

  const updateRole = async (userId, role) => {
    try {
      await adminApi.updateUserRole(userId, role);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Gagal mengubah role user.");
    }
  };

  const createCategory = async (event) => {
    event.preventDefault();
    try {
      await categoryApi.create(categoryForm);
      setCategoryForm({ name: "", description: "" });
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Gagal membuat kategori.");
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
      setError(err?.response?.data?.detail || "Gagal update kategori.");
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

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total" value={dashboard?.total_tickets ?? "-"} />
          <MetricCard label="Open" value={dashboard?.by_status?.open ?? 0} />
          <MetricCard label="In Progress" value={dashboard?.by_status?.in_progress ?? 0} />
          <MetricCard label="Resolved" value={dashboard?.by_status?.resolved ?? 0} />
        </section>

        <div className="flex flex-wrap gap-2">
          <Button variant={activeTab === "tickets" ? "primary" : "secondary"} onClick={() => setActiveTab("tickets")}>Tickets</Button>
          <Button variant={activeTab === "users" ? "primary" : "secondary"} onClick={() => setActiveTab("users")}>Users</Button>
          <Button variant={activeTab === "categories" ? "primary" : "secondary"} onClick={() => setActiveTab("categories")}>Categories</Button>
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        {loading && <LoadingSpinner text="Memuat dashboard admin..." />}

        {!loading && activeTab === "tickets" && (
          <Card title="Semua Ticket" subtitle="Filter berdasarkan status, priority, assignee, dan keyword.">
            <div className="mb-4 grid gap-2 md:grid-cols-4">
              <Input
                label="Cari"
                placeholder="judul/deskripsi"
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
                  <option value="">Semua</option>
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
                  <option value="">Semua</option>
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
                  <option value="">Semua</option>
                  {itEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </label>
            </div>

            {filteredTickets.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada data sesuai filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
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
                            {itEmployees.map((employee) => (
                              <option key={employee.id} value={employee.id}>{employee.name}</option>
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

        {!loading && activeTab === "users" && (
          <Card title="User Management" subtitle="Hanya admin/superadmin yang dapat mengganti role user.">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2">Nama</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="py-2">{user.name}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">
                        <StatusBadge value={user.role} />
                      </td>
                      <td className="py-2">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value)}
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

        {!loading && activeTab === "categories" && (
          <Card title="Category Management" subtitle="Buat dan edit kategori tiket.">
            <form onSubmit={createCategory} className="mb-4 grid gap-2 md:grid-cols-[1fr_2fr_auto]">
              <Input
                label="Nama"
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Deskripsi"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
              />
              <div className="self-end">
                <Button type="submit">Tambah</Button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2">Nama</th>
                    <th className="py-2">Deskripsi</th>
                    <th className="py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-slate-100">
                      <td className="py-2">{category.name}</td>
                      <td className="py-2">{category.description || "-"}</td>
                      <td className="py-2">
                        <Button variant="secondary" size="sm" onClick={() => setEditingCategory(category)}>
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
          confirmText="Simpan"
        >
          {editingCategory && (
            <div className="space-y-2">
              <Input
                label="Nama"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Deskripsi"
                value={editingCategory.description || ""}
                onChange={(e) => setEditingCategory((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
