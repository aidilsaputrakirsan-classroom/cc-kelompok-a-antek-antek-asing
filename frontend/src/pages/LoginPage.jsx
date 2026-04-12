import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [entered, setEntered] = useState(false);
  const fromRegister = location.state?.from === "register";

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#0a5fc6] bg-[url('/image/bg-login-page.png')] bg-cover bg-center bg-no-repeat px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(6,39,96,0.55)_0%,rgba(15,98,194,0.35)_52%,rgba(9,85,168,0.5)_100%)]" />

      <section
        className={`relative z-10 w-full max-w-[1060px] overflow-hidden rounded-[18px] bg-white shadow-[0_30px_80px_-35px_rgba(2,16,44,0.55)] transition-all duration-300 md:grid md:grid-cols-[1.08fr_1fr] ${
          entered
            ? "translate-x-0 opacity-100"
            : fromRegister
              ? "-translate-x-10 opacity-0"
              : "translate-x-10 opacity-0"
        }`}
      >
        <aside className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[linear-gradient(180deg,#2592ea_0%,#4aa6f2_52%,#61b1f5_100%)] p-6 text-white md:min-h-[600px] md:p-8">
          <div className="pointer-events-none absolute -right-8 top-20 h-36 w-36 rounded-full" />

          <div className="relative flex flex-col items-center gap-3">
            <img src="/image/AA_HD.png" alt="Logo Antick Async" className="h-24" />
            <p className="mt-3 text-lg text-blue-50/95">"Support That Works on Your Time"</p>
          </div>
        </aside>

        <div className="flex flex-col justify-center bg-white p-6 md:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-5xl">Log in</h2>
            <p className="mt-2 text-base text-slate-600 md:text-xl">
              Welcome back! Choose your preferred sign-in method.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="rounded-xl  border-blue-300 bg-white py-3 text-base"
            />

            <label className="block text-sm text-slate-800">
              <span className="font-medium">Password</span>
              <div className="mt-1 flex items-center rounded-xl border border-blue-300  bg-white px-3 py-2.5">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Password"
                  className="w-full border-none bg-transparent text-base outline-none "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Remember me for 30 days
              </label>
              <button type="button" className="font-medium text-blue-600 hover:text-blue-700">
                Forgot password?
              </button>
            </div>

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-lg hover:bg-blue-500"
            >
              {loading ? "Processing..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-3 text-slate-300">
            <div className="h-px flex-1 bg-slate-300" />
            <span className="text-sm">or</span>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <p className="mt-4 text-center text-base text-slate-600 md:text-xl">
            New here? Create an account{" "}
            <Link
              to="/register"
              state={{ from: "login" }}
              className="font-semibold text-blue-600 underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
