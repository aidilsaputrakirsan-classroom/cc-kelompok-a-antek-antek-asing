import { useMemo, useState } from "react";
import { LockKeyhole, Save, UserCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ProfilePage() {
  const { user, updateLocalProfile } = useAuth();
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatarUrl: user?.profilePicture || user?.profile_picture || user?.avatarUrl || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const userInitial = useMemo(() => (profileForm.name || "U").charAt(0).toUpperCase(), [profileForm.name]);

  const onSaveProfile = (event) => {
    event.preventDefault();

    updateLocalProfile({
      name: profileForm.name,
      email: profileForm.email,
      profilePicture: profileForm.avatarUrl,
      avatarUrl: profileForm.avatarUrl,
    });

    setProfileMessage("Perubahan profil disimpan pada sesi saat ini.");
  };

  const onPasswordSubmit = (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage("Lengkapi seluruh field password terlebih dahulu.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("Konfirmasi password baru tidak sama.");
      return;
    }

    setPasswordMessage("UI ubah password sudah tersedia. Proses backend belum diaktifkan.");
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola nama, email, foto profil, dan password akun Anda.</p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card title="Informasi Profil" subtitle="Data ini digunakan di tampilan dashboard.">
          <form className="space-y-3" onSubmit={onSaveProfile}>
            <Input
              label="Nama"
              required
              value={profileForm.name}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nama lengkap"
            />

            <Input
              label="Email"
              type="email"
              required
              value={profileForm.email}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="nama@email.com"
            />

            <Input
              label="Profile Picture URL"
              value={profileForm.avatarUrl}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, avatarUrl: event.target.value }))}
              placeholder="https://..."
            />

            <div className="pt-1">
              <Button type="submit" className="inline-flex items-center gap-2">
                <Save size={16} aria-hidden="true" />
                Simpan Profil
              </Button>
            </div>

            {profileMessage && (
              <p className="rounded-lg border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                {profileMessage}
              </p>
            )}
          </form>
        </Card>

        <Card title="Preview" subtitle="Tampilan avatar yang digunakan pada AppShell.">
          <div className="flex flex-col items-center gap-3 py-2">
            {profileForm.avatarUrl ? (
              <img
                src={profileForm.avatarUrl}
                alt="Profile preview"
                className="h-24 w-24 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-3xl font-semibold text-slate-700 dark:text-slate-300">
                {userInitial}
              </div>
            )}
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{profileForm.name || user?.name || "User"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{profileForm.email || user?.email || "-"}</p>
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs text-slate-600 dark:text-slate-400">
              <UserCircle size={13} aria-hidden="true" />
              Role: {user?.role || "-"}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Ubah Password" subtitle="Bagian ini baru UI, backend belum diaktifkan.">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onPasswordSubmit}>
          <Input
            label="Password Saat Ini"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
            }
            placeholder="••••••••"
          />

          <Input
            label="Password Baru"
            type="password"
            value={passwordForm.newPassword}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
            placeholder="Minimal 8 karakter"
          />

          <Input
            label="Konfirmasi Password Baru"
            type="password"
            className="md:col-span-2"
            value={passwordForm.confirmPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
            }
            placeholder="Ulangi password baru"
          />

          <div className="md:col-span-2">
            <Button type="submit" className="inline-flex items-center gap-2">
              <LockKeyhole size={16} aria-hidden="true" />
              Simpan Password
            </Button>
          </div>

          {passwordMessage && (
            <p className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {passwordMessage}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
