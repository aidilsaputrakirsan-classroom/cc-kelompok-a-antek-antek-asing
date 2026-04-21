import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import { ticketApi } from "../services/api";

export default function EmployeeTicketDetailPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await ticketApi.detail(ticketId);
        setTicket(data);
      } catch (err) {
        setError(err.message || "Gagal memuat detail tiket.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticketId]);

  return (
    <Card title="Detail Ticket" subtitle={`Ticket ID: #${ticketId}`}>
      {loading && <LoadingSpinner text="Memuat detail tiket..." />}
      {!loading && error && <p className="rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      {!loading && ticket && (
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={ticket.status} />
            <StatusBadge value={ticket.priority} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Judul</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{ticket.title}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Deskripsi</p>
            <p className="dark:text-slate-300">{ticket.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <p className="dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Kategori:</span> {ticket.category?.name || "-"}
            </p>
            <p className="dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Assignee:</span> {ticket.assignee?.name || "Belum di-assign"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/employee">
              <Button variant="secondary">Kembali</Button>
            </Link>
            <Link to={`/employee/tickets/${ticketId}/edit`}>
              <Button>Edit Ticket</Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
