import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { categoryApi, ticketApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { ActivityLineChart, CategoryDonutChart } from "../components/dashboard/ChartPanels";

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

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryFilter = (searchParams.get("q") || "").trim().toLowerCase();
  const requestedTab = (searchParams.get("tab") || "overview").toLowerCase();
  const activeTab = requestedTab === "my-ticket" ? "my-ticket" : "overview";
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ title: "", description: "", priority: "low", category_id: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoryData, ticketData] = await Promise.all([
        categoryApi.list(),
        ticketApi.list({ limit: 100 }),
      ]);
      setCategories(categoryData);
      setTickets(ticketData.items || []);
    } catch (err) {
      setMessage(err.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onCreateTicket = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await ticketApi.create({
        title: form.title,
        description: form.description,
        priority: form.priority,
        category_id: Number(form.category_id),
      });
      setForm({ title: "", description: "", priority: "low", category_id: "" });
      setMessage("Tiket berhasil dibuat.");
      await loadData();
    } catch (err) {
      setMessage(err.message || "Gagal membuat tiket.");
    }
  };

  const summary = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter((item) => item.status === "resolved" || item.status === "closed").length;
    const inProgress = tickets.filter((item) => item.status === "in_progress").length;
    const resolvedRate = total ? `${Math.round((resolved / total) * 100)}%` : "0%";

    return [
      { label: "My Tickets", value: total },
      { label: "In Progress", value: inProgress },
      { label: "Response Time", value: "2.4h" },
      { label: "Resolved", value: resolvedRate },
    ];
  }, [tickets]);

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

  const filteredTickets = useMemo(() => {
    if (!queryFilter) return tickets;

    return tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(queryFilter) ||
        ticket.description.toLowerCase().includes(queryFilter) ||
        String(ticket.id).includes(queryFilter)
    );
  }, [queryFilter, tickets]);

  const filteredRecentActivities = useMemo(
    () => recentActivities.filter((ticket) => filteredTickets.some((item) => item.id === ticket.id)),
    [filteredTickets, recentActivities]
  );

  if (loading) {
    return <LoadingSpinner text="Memuat dashboard employee..." />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)] md:p-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {activeTab === "my-ticket" ? "My Ticket" : `Welcome ${user?.name || "Employee"}`}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {activeTab === "my-ticket"
            ? "Create new requests and review your ticket history."
            : "Track your support performance."}
        </p>

        {activeTab === "overview" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <MetricCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        ) : null}
      </section>

      {activeTab === "overview" ? (
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
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.3fr_1.7fr]">
          <Card title="Create Ticket" subtitle="Submit IT issue for support team.">
            <form className="space-y-3" onSubmit={onCreateTicket}>
              <Input
                label="Title"
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Issue title"
              />
              <label className="block text-sm text-slate-700 dark:text-slate-300">
                Description
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  placeholder="Issue details"
                />
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="text-sm text-slate-700 dark:text-slate-300">
                  Priority
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </label>
                <label className="text-sm text-slate-700 dark:text-slate-300">
                  Category
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <Button type="submit" className="w-full">Create Ticket</Button>
            </form>
            {message && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{message}</p>}
          </Card>

          <Card title="History" subtitle="Only tickets from your account.">
            {filteredTickets.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No tickets yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <th className="py-2">Ticket ID</th>
                      <th className="py-2">Subject</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Priority</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.slice(0, 12).map((ticket) => (
                      <tr key={ticket.id} className="border-b border-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2 text-slate-500 dark:text-slate-400">#{ticket.id}</td>
                        <td className="py-2 font-medium text-slate-800 dark:text-slate-200">{ticket.title}</td>
                        <td className="py-2"><StatusBadge value={ticket.status} /></td>
                        <td className="py-2"><StatusBadge value={ticket.priority} /></td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/employee/tickets/${ticket.id}`}>
                              <Button variant="secondary" size="sm">Detail</Button>
                            </Link>
                            <Link to={`/employee/tickets/${ticket.id}/edit`}>
                              <Button size="sm">Edit</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "my-ticket" ? (
        <Card title="Recent Activities" subtitle="Latest updates from your tickets.">
          <div className="space-y-3">
            {filteredRecentActivities.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No activity data yet.</p>}
            {filteredRecentActivities.map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 transition hover:bg-slate-100 dark:hover:bg-slate-700">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">#{ticket.id} {ticket.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Status: {ticket.status.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </article>
  );
}
