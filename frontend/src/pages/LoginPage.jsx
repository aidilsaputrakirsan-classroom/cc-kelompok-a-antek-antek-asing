import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({ email, password });
      const adminLike = ["superadmin", "admin", "it_employee"].includes(user.role);
      navigate(adminLike ? "/admin" : "/employee", { replace: true });
    } catch (err) {
      setError(err.message || "Login gagal, cek kredensial.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_45%,#f8fafc_100%)]" />
      <section className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_26px_70px_-45px_rgba(15,23,42,0.55)] md:grid-cols-[1fr_1.2fr]">
        <aside className="relative flex min-h-[320px] flex-col justify-between bg-[linear-gradient(160deg,#1e3a8a_0%,#2563eb_55%,#1d4ed8_100%)] p-7 text-white md:min-h-[560px] md:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-blue-100/90">Support System</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">TicketFlow</h1>
            <p className="mt-3 max-w-sm text-sm text-blue-100/95">
              Platform tiket IT support untuk monitoring issue, assignment teknisi, dan progress penyelesaian.
            </p>
          </div>
          <p className="text-xs text-blue-100/90">Cloud Team Dashboard Workspace</p>
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        </aside>

        <div className="p-6 md:p-10">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
            <p className="mt-1 text-sm text-slate-500">Masuk untuk mengelola tiket IT Support.</p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@student.itk.ac.id"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link to="/register" className="font-medium text-slate-900 underline-offset-4 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
