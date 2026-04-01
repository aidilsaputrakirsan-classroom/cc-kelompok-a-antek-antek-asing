import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/ui/Card";
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
      setError(err?.response?.data?.detail || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Card className="w-full" title="Register" subtitle="Buat akun employee untuk membuat tiket.">

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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

        <p className="mt-4 text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-slate-900 underline-offset-4 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </main>
  );
}
