import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { ticketApi } from "../services/api";

export default function EmployeeTicketEditPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", priority: "low" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await ticketApi.detail(ticketId);
        setForm({ title: data.title, description: data.description, priority: data.priority });
      } catch (err) {
        setError(err.message || "Gagal memuat tiket.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ticketId]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await ticketApi.updateByEmployee(ticketId, form);
      navigate(`/employee/tickets/${ticketId}`);
    } catch (err) {
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Edit Ticket" subtitle={`Ticket ID: #${ticketId}`}>
      {loading ? (
        <LoadingSpinner text="Memuat data..." />
      ) : (
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input
            label="Judul"
            required
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <label className="block text-sm text-slate-700 dark:text-slate-300">
            Deskripsi
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none ring-slate-300 dark:ring-slate-700 focus:ring"
            />
          </label>
          <label className="block text-sm text-slate-700 dark:text-slate-300">
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

          {error && <p className="rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <div className="flex gap-2">
            <Link to={`/employee/tickets/${ticketId}`}>
              <Button variant="secondary">Batal</Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
