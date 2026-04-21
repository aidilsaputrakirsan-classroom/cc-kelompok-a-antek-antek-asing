import { useState } from "react";
import { LockKeyhole, Save, UserCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { userApi, authApi } from "../services/api";
import { getAvatarPath } from "../constants/avatars";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AvatarSelector from "../components/AvatarSelector";

export default function ProfilePage() {
  const { user, updateLocalProfile } = useAuth();
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const selectedAvatarIndex = user?.avatar_index ?? 0;

  const handleAvatarSelect = async (index) => {
    try {
      setAvatarLoading(true);
      // Optimistic UI update
      updateLocalProfile({ avatar_index: index });
      // API call
      const response = await userApi.updateUserAvatar(index);
      // Ensure latest from server
      updateLocalProfile({ avatar_index: response.avatar_index });
      setProfileMessage("Avatar berhasil diperbarui!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update avatar:", err);
      setProfileMessage(`Gagal mengubah avatar: ${err.detail || err.message}`);
      // Revert optimistic update
      updateLocalProfile({ avatar_index: user?.avatar_index ?? 0 });
    } finally {
      setAvatarLoading(false);
    }
  };

  const onSaveProfile = async (event) => {
    event.preventDefault();

    if (!profileForm.name || !profileForm.email) {
      setProfileMessage("Nama dan email harus diisi!");
      return;
    }

    try {
      setProfileLoading(true);
      // Optimistic UI update
      updateLocalProfile({
        name: profileForm.name,
        email: profileForm.email,
      });
      
      // API call to persist changes
      const response = await userApi.updateUserProfile(profileForm.name, profileForm.email);
      
      // Update with server response
      updateLocalProfile({
        name: response.name,
        email: response.email,
      });

      setProfileMessage("✅ Profil berhasil diperbarui ke database!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setProfileMessage(`❌ Gagal menyimpan profil: ${err.detail || err.message}`);
      // Revert optimistic update
      updateLocalProfile({
        name: user?.name || "",
        email: user?.email || "",
      });
      // Revert form
      setProfileForm({
        name: user?.name || "",
        email: user?.email || "",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage("Lengkapi seluruh field password terlebih dahulu.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("Konfirmasi password baru tidak sama.");
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      setPasswordMessage(`✅ ${response.message || "Password berhasil diubah."} Sesi direfresh dalam 3 detik.`);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Token invalidates, triggering logout
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("Failed to change password:", err);
      setPasswordMessage(`❌ Gagal: ${err.detail || err.message}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola nama, email, avatar, dan password akun Anda.</p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card title="Informasi Profil" subtitle="Data ini digunakan di tampilan dashboard.">
          <form className="space-y-4" onSubmit={onSaveProfile}>
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

            <div className="pt-1">
              <Button type="submit" disabled={profileLoading} className="inline-flex items-center gap-2">
                <Save size={16} aria-hidden="true" />
                {profileLoading ? "Menyimpan..." : "Simpan Profil"}
              </Button>
            </div>

            {profileMessage && (
              <p className="rounded-lg border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                {profileMessage}
              </p>
            )}
          </form>
        </Card>

        <Card title="Avatar" subtitle="Pilih avatar profil Anda dari galeri di bawah.">
          <div className="flex flex-col items-center gap-4 py-2">
            <img
              src={getAvatarPath(selectedAvatarIndex)}
              alt="Selected avatar"
              className="h-24 w-24 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover"
            />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{profileForm.name || user?.name || "User"}</p>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs text-slate-600 dark:text-slate-400">
                <UserCircle size={13} aria-hidden="true" />
                Role: {user?.role || "-"}
              </div>
              {user?.department && (
                <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs text-blue-700 dark:text-blue-400 font-medium">
                  Department: {user.department}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Pilih Avatar" subtitle="Klik untuk memilih avatar baru Anda.">
        <AvatarSelector
          selected={selectedAvatarIndex}
          onSelect={handleAvatarSelect}
          loading={avatarLoading}
        />
      </Card>

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
            <Button type="submit" disabled={passwordLoading} className="inline-flex items-center gap-2">
              <LockKeyhole size={16} aria-hidden="true" />
              {passwordLoading ? "Menyimpan..." : "Simpan Password"}
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
