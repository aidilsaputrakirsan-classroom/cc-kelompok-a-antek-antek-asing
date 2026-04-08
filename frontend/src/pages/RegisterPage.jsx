import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register(form);
      setSuccess("Registrasi berhasil, silakan login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(err.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_45%,#f8fafc_100%)]" />
      <section className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_26px_70px_-45px_rgba(15,23,42,0.55)] md:grid-cols-[1fr_1.2fr]">
        <aside className="relative flex min-h-[320px] flex-col justify-between bg-[linear-gradient(160deg,#1e3a8a_0%,#2563eb_55%,#1d4ed8_100%)] p-7 text-white md:min-h-[600px] md:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-blue-100/90">Support System</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">TicketFlow</h1>
            <p className="mt-3 max-w-sm text-sm text-blue-100/95">
              Buat akun baru untuk mengajukan tiket, memantau status issue, dan berkolaborasi dengan tim IT.
            </p>
          </div>
          <p className="text-xs text-blue-100/90">Cloud Team Dashboard Workspace</p>
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        </aside>

        <div className="p-6 md:p-10">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Register</h2>
            <p className="mt-1 text-sm text-slate-500">Buat akun employee untuk membuat tiket.</p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Nama"
              name="name"
              required
              minLength={2}
              value={form.name}
              onChange={onChange}
              placeholder="Nama Anda"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              placeholder="user@student.itk.ac.id"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={onChange}
              placeholder="Minimal 8 karakter + simbol"
            />

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Memproses..." : "Register"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-medium text-slate-900 underline-offset-4 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
