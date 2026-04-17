import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/useNotification";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import SplineCardScene from "../components/SplineCardScene";
import CosmicBackdrop from "../components/CosmicBackdrop";
import ThemeToggle from "../components/ThemeToggle";

const registerSceneUrl = import.meta.env.VITE_SPLINE_SCENE_URL_REGISTER || import.meta.env.VITE_SPLINE_SCENE_URL;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addNotification } = useNotification();
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [entered, setEntered] = useState(false);

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
      const response = await register(form);
      const message = response.message || "Registrasi berhasil. Akun Anda menunggu persetujuan admin.";
      setSuccess(message);
      addNotification(message, "success", 3000);
      setTimeout(() => navigate("/login", { state: { from: "register", message } }), 1500);
    } catch (err) {
      setError(err.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f9_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] px-4 py-8 transition-colors duration-300">
      <CosmicBackdrop />

      <section
        className={`relative z-10 w-full max-w-[1060px] overflow-hidden rounded-[30px] bg-white dark:bg-slate-900 shadow-[0_30px_80px_-35px_rgba(2,16,44,0.55)] dark:shadow-[0_30px_80px_-35px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out md:grid md:grid-cols-[1.08fr_1fr] ${entered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        <aside className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[linear-gradient(180deg,#2592ea_0%,#4aa6f2_52%,#61b1f5_100%)] px-0 pt-0 pb-0 text-white md:min-h-[600px] md:rounded-r-[36px] md:pb-0">
          <div className="pointer-events-none absolute -right-8 top-20 h-36 w-36 rounded-full" />

          <div className="relative flex flex-col items-center gap-3 px-6 pt-6 md:px-8 md:pt-8">
            <img src="/image/AA_HD.png" alt="Logo Antick Async" className="h-24" />
            <p className="mt-3 text-lg text-blue-50/95">"Support That Works on Your Time"</p>
          </div>

          <SplineCardScene
            className="relative mt-0 h-[210px] w-full flex-1 overflow-hidden"
            sceneUrl={registerSceneUrl}
          />
        </aside>

        <div className="flex flex-col justify-center bg-white dark:bg-slate-900 p-6 md:p-10 transition-colors duration-500">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl transition-colors duration-500">Sign up</h2>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-400 md:text-xl transition-colors duration-500">
                Create your account to start submitting tickets.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <Input
              label="Full Name"
              name="name"
              required
              minLength={2}
              value={form.name}
              onChange={onChange}
              placeholder="Enter your full name"
              className="rounded-xl border-blue-300 bg-white py-3 text-base"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              placeholder="Enter your email"
              className="rounded-xl border-blue-300 bg-white py-3 text-base"
            />

            <label className="block text-sm text-slate-800 dark:text-slate-200 transition-colors duration-500">
              <span className="font-medium">Password</span>
              <div className="mt-1 flex items-center rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 focus-within:border-blue-300 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-300 dark:focus-within:ring-blue-500 transition-all duration-300">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={onChange}
                  placeholder="Create your password"
                  className="w-full border-none bg-transparent text-base text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="ml-2 text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6A2 2 0 0012 14a2 2 0 001.4-.6" />
                      <path d="M9.9 4.2A10.5 10.5 0 0112 4c5 0 9.3 3.1 11 7.5a11.7 11.7 0 01-3.2 4.7" />
                      <path d="M6.6 6.7C4.4 8 2.7 9.9 1 11.5a12.2 12.2 0 003.7 5" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error && (
              <Alert 
                message={error} 
                type="error" 
                onClose={() => setError("")}
                autoClose={true}
                duration={4000}
              />
            )}
            {success && (
              <Alert 
                message={success} 
                type="success" 
                onClose={() => setSuccess("")}
                autoClose={true}
                duration={3000}
              />
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#2592ea] py-3 text-lg hover:bg-blue-500"
            >
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
              className="font-semibold text-[#2592ea] underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
