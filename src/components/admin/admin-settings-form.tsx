"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRequireUser } from "@/lib/auth";

/**
 * Admin "Pengaturan" page: real profile (profiles row) and password controls.
 * Password change re-authenticates with the current password first, then
 * updates via Supabase Auth.
 */
export default function AdminSettingsForm() {
  const router = useRouter();
  const user = useRequireUser("admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  async function handleSaveProfile() {
    if (!user || savingProfile) return;
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail) {
      window.gtoast?.("Nama dan email wajib diisi.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      window.gtoast?.("Format email tidak valid.", "error");
      return;
    }
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ name: cleanName, email: cleanEmail, phone: phone.trim() || null })
        .eq("id", user.id);
      if (error) throw error;
      // Email juga hidup di auth.users; perbarui bila berubah. Bila proyek
      // mengaktifkan konfirmasi email, perubahan berlaku setelah konfirmasi.
      if (cleanEmail !== user.email) {
        const { error: authErr } = await supabase.auth.updateUser({ email: cleanEmail });
        if (authErr) {
          window.gtoast?.(`Profil tersimpan, tetapi email login gagal diperbarui: ${authErr.message}`, "error");
          return;
        }
        window.gtoast?.("Profil diperbarui. Cek email baru untuk konfirmasi bila diminta.");
      } else {
        window.gtoast?.("Profil berhasil diperbarui.");
      }
      router.refresh();
    } catch (err) {
      window.gtoast?.((err as Error).message || "Gagal memperbarui profil.", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePassword() {
    if (!user || savingPw) return;
    if (!currentPw) {
      window.gtoast?.("Isi kata sandi saat ini dulu.", "error");
      return;
    }
    if (newPw.length < 8) {
      window.gtoast?.("Kata sandi baru minimal 8 karakter.", "error");
      return;
    }
    if (newPw !== confirmPw) {
      window.gtoast?.("Konfirmasi kata sandi tidak sama.", "error");
      return;
    }
    setSavingPw(true);
    try {
      const supabase = createClient();
      // Verifikasi sandi lama lewat sign-in ulang (Supabase tidak memverifikasi
      // sandi lama pada updateUser).
      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPw,
      });
      if (verifyErr) {
        window.gtoast?.("Kata sandi saat ini salah.", "error");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      window.gtoast?.("Kata sandi berhasil diperbarui.");
    } catch (err) {
      window.gtoast?.((err as Error).message || "Gagal memperbarui kata sandi.", "error");
    } finally {
      setSavingPw(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div className="settings-grid">
      <div className="set-profile">
        <span
          aria-hidden="true"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--purple-soft)",
            color: "var(--purple)",
            display: "grid",
            placeItems: "center",
            fontSize: 30,
            fontWeight: 700,
            flex: "none",
          }}
        >
          {(name || "A").trim().charAt(0).toUpperCase()}
        </span>
        <div className="set-fields">
          <div className="field">
            <label htmlFor="settings-name">Nama Lengkap</label>
            <div className="control">
              <input id="settings-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="settings-email">Email</label>
            <div className="control">
              <input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="settings-phone">Nomor Telepon</label>
            <div className="control">
              <input id="settings-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="set-save" style={{ marginTop: 22 }}>
            <button
              type="button"
              className={"btn btn-primary" + (savingProfile ? " is-loading" : "")}
              id="save-profile"
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              Simpan Perubahan
            </button>
            <button type="button" className="btn btn-outline" id="logout-btn" onClick={handleLogout}>
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="set-card">
        <h3>Ubah Kata Sandi</h3>
        <p className="sub">Gunakan kata sandi yang kuat dan belum pernah dipakai sebelumnya.</p>
        <div className="field">
          <label htmlFor="settings-current-pw">Kata Sandi Saat Ini</label>
          <div className="control">
            <input
              id="settings-current-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              style={{ letterSpacing: 3 }}
            />
          </div>
        </div>
        <div className="pw-grid">
          <div className="field">
            <label htmlFor="settings-new-pw">Kata Sandi Baru</label>
            <div className="control">
              <input
                id="settings-new-pw"
                type="password"
                placeholder="••••••••"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                style={{ letterSpacing: 3 }}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="settings-confirm-pw">Konfirmasi Kata Sandi</label>
            <div className="control">
              <input
                id="settings-confirm-pw"
                type="password"
                placeholder="••••••••"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                style={{ letterSpacing: 3 }}
              />
            </div>
          </div>
        </div>
        <div className="set-save">
          <button
            className={"btn btn-primary" + (savingPw ? " is-loading" : "")}
            type="button"
            onClick={handleSavePassword}
            disabled={savingPw}
          >
            Perbarui Kata Sandi
          </button>
        </div>
      </div>
    </div>
  );
}
