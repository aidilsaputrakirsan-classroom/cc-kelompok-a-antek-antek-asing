import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import { categoryApi, ticketApi } from "../services/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

export default function EmployeeDashboardPage() {
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ title: "", description: "", priority: "low", category_id: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoryData, ticketData] = await Promise.all([categoryApi.list(), ticketApi.list()]);
      setCategories(categoryData);
      setTickets(ticketData.items || []);
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Gagal memuat data.");
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
      setMessage(err?.response?.data?.detail || "Gagal membuat tiket.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
        <Card title="Buat Ticket" subtitle="Submit issue IT untuk tim support.">
          <form className="mt-4 space-y-3" onSubmit={onCreateTicket}>
            <Input
              label="Judul"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Judul masalah"
            />
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Deskripsi masalah"
            />
            <select
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              required
              value={form.category_id}
              onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
          {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
        </Card>

        <Card title="Ticket Saya" subtitle="Hanya tiket milik akun Anda.">
          {loading ? (
            <LoadingSpinner text="Memuat tiket..." />
          ) : tickets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Belum ada ticket.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2">Title</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Priority</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-slate-100">
                      <td className="py-2 text-slate-800">{ticket.title}</td>
                      <td className="py-2">
                        <StatusBadge value={ticket.status} />
                      </td>
                      <td className="py-2">
                        <StatusBadge value={ticket.priority} />
                      </td>
                      <td className="py-2">{ticket.category?.name || "-"}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <Link to={`/employee/tickets/${ticket.id}`}>
                            <Button variant="secondary" size="sm">
                              Detail
                            </Button>
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
      </main>
    </div>
  );
}
