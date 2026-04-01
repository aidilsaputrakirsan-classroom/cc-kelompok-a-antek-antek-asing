import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AppNavbar from "../components/AppNavbar";
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
        setError(err?.response?.data?.detail || "Gagal memuat detail tiket.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticketId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <Card title="Detail Ticket" subtitle={`Ticket ID: #${ticketId}`}>
          {loading && <LoadingSpinner text="Memuat detail tiket..." />}
          {!loading && error && <p className="text-sm text-rose-600">{error}</p>}
          {!loading && ticket && (
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={ticket.status} />
                <StatusBadge value={ticket.priority} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Judul</p>
                <p className="font-medium text-slate-900">{ticket.title}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Deskripsi</p>
                <p>{ticket.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <p>
                  <span className="text-slate-500">Kategori:</span> {ticket.category?.name || "-"}
                </p>
                <p>
                  <span className="text-slate-500">Assignee:</span> {ticket.assignee?.name || "Belum di-assign"}
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
      </main>
    </div>
  );
}
