import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);
  const fromLogin = location.state?.from === "login";

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
      setTimeout(() => navigate("/login", { state: { from: "register" } }), 800);
    } catch (err) {
      setError(err.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[linear-gradient(140deg,#0b67d5_0%,#1184ee_48%,#0d73df_100%)] px-4 py-8">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute -left-20 bottom-[-120px] h-[340px] w-[340px] rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-[-120px] h-[320px] w-[320px] rounded-full bg-blue-200/20 blur-3xl" />

      <section
        className={`relative z-10 w-full max-w-[1060px] overflow-hidden rounded-[18px] border border-white/30 bg-white shadow-[0_30px_80px_-35px_rgba(2,16,44,0.55)] transition-all duration-300 md:grid md:grid-cols-[1.08fr_1fr] ${
          entered
            ? "translate-x-0 opacity-100"
            : fromLogin
              ? "translate-x-10 opacity-0"
              : "-translate-x-10 opacity-0"
        }`}
      >
        <aside className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[linear-gradient(180deg,#2592ea_0%,#4aa6f2_52%,#61b1f5_100%)] p-6 text-white md:min-h-[600px] md:p-8">
          <div className="pointer-events-none absolute -right-8 top-20 h-36 w-36 rounded-full border border-white/25" />
          <div className="pointer-events-none absolute -left-10 bottom-[-84px] h-56 w-56 rounded-full bg-blue-950/25 blur-2xl" />

          <div>
            <h1 className="text-[40px] font-extrabold leading-[0.95] tracking-tight drop-shadow-[0_5px_14px_rgba(5,54,112,0.26)] md:text-[56px]">
              ANTICK
              <br />
              ASYNC
            </h1>
            <p className="mt-3 text-lg text-blue-50/95">"Support That Works on Your Time"</p>
          </div>

          <div
            className="relative h-[190px] overflow-hidden rounded-2xl border border-white/25 bg-[linear-gradient(180deg,#1863c7_0%,#0f4da8_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] md:h-[290px]"
            aria-hidden="true"
          >
            <div className="absolute -left-6 right-8 bottom-0 top-[40%] rounded-tl-[42px] bg-[linear-gradient(180deg,#2f8ee5_0%,#3688db_46%,#2364bb_100%)]" />
            <div className="absolute left-8 right-16 top-[18%] h-[42%] rounded-lg bg-slate-100 shadow-[0_14px_24px_rgba(7,27,72,0.35)]" />
            <div className="absolute left-12 right-20 top-[22%] h-[4px] rounded bg-slate-300" />
            <div className="absolute left-12 right-[38%] top-[28%] h-[4px] rounded bg-slate-300" />
            <div className="absolute bottom-[23%] right-12 h-[82px] w-[120px] rounded-md border border-white/15 bg-slate-900/60" />
            <div className="absolute bottom-[23%] left-10 h-[90px] w-[88px] rounded-md border border-white/15 bg-slate-900/70" />
          </div>

          <p className="text-xs text-blue-100/90">Digital IT Support Environment</p>
        </aside>

        <div className="flex flex-col justify-center bg-[#f4f4f5] p-6 md:p-10">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Sign up</h2>
            <p className="mt-2 text-base text-slate-600 md:text-xl">
              Create your account to start submitting tickets.
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <Input
              label="Full Name"
              name="name"
              required
              minLength={2}
              value={form.name}
              onChange={onChange}
              placeholder="Enter your full name"
              className="rounded-xl border-slate-300 bg-white py-3 text-base"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              placeholder="Enter your email"
              className="rounded-xl border-slate-300 bg-white py-3 text-base"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={onChange}
              placeholder="Create your password"
              className="rounded-xl border-slate-300 bg-white py-3 text-base"
            />

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

            <Button type="submit" disabled={loading} className="w-full rounded-xl py-3 text-lg">
              {loading ? "Processing..." : "Get Started"}
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-3 text-slate-300">
            <div className="h-px flex-1 bg-slate-300" />
            <span className="text-sm">or</span>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <p className="mt-4 text-center text-base text-slate-600 md:text-xl">
            Already a member?{" "}
            <Link
              to="/login"
              state={{ from: "register" }}
              className="font-semibold text-blue-600 underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
