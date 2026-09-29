"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout, type SessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export default function SettingsForm({ initialUser }: { initialUser: SessionUser }) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);

  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Preferensi notifikasi hanya berlaku di sesi ini (belum ada kolomnya di database).
  const [prefs, setPrefs] = useState({
    task: true,
    deadline: true,
    ai: false,
    email: false,
  });

  async function handleSaveProfile() {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail) {
      window.gtoast?.("Nama dan email wajib diisi.", "error");
      return;
    }
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ name: cleanName })
        .eq("id", initialUser.id);
      if (profErr) throw new Error(profErr.message);

      if (cleanEmail !== initialUser.email) {
        const { error: emailErr } = await supabase.auth.updateUser({ email: cleanEmail });
        if (emailErr) throw new Error(emailErr.message);
        await supabase.from("profiles").update({ email: cleanEmail }).eq("id", initialUser.id);
        window.gtoast?.("Profil diperbarui. Cek email barumu untuk konfirmasi penggantian email.");
      } else {
        window.gtoast?.("Profil berhasil diperbarui.");
      }
      router.refresh();
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePassword() {
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
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw new Error(error.message);
      setNewPw("");
      setConfirmPw("");
      window.gtoast?.("Kata sandi berhasil diperbarui.");
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    } finally {
      setSavingPw(false);
    }
  }

  function togglePref(key: keyof typeof prefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="settings-grid">
      <div className="set-profile">
        <span className="avatar-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={initialUser.avatar.startsWith("/") ? initialUser.avatar : "/" + initialUser.avatar} alt={initialUser.name} width={80} height={80} />
        </span>
        <div className="set-fields">
          <div className="field">
            <label>Nama Lengkap</label>
            <div className="control">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          </div>
          <div className="field">
            <label>Email</label>
            <div className="control">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>
          {initialUser.className && (
            <div className="field">
              <label>Kelas (dari database, tidak bisa diubah)</label>
              <div className="control">
                <input type="text" value={initialUser.className} disabled readOnly />
              </div>
            </div>
          )}
          <div className="set-save" style={{ marginTop: 22 }}>
            <button type="button" className="btn btn-primary" id="save-profile" onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
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
        <div className="pw-grid">
          <div className="field">
            <label>Kata Sandi Baru</label>
            <div className="control">
              <input
                type="password"
                placeholder="••••••••"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
                style={{ letterSpacing: 3 }}
              />
            </div>
          </div>
          <div className="field">
            <label>Konfirmasi Kata Sandi</label>
            <div className="control">
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
                style={{ letterSpacing: 3 }}
              />
            </div>
          </div>
        </div>
        <div className="set-save">
          <button className="btn btn-primary" type="button" onClick={handleSavePassword} disabled={savingPw}>
            {savingPw ? "Memperbarui..." : "Perbarui Kata Sandi"}
          </button>
        </div>
      </div>

      <div className="set-card">
        <h3>Preferensi Notifikasi</h3>
        <p className="sub">Atur notifikasi apa saja yang ingin Anda terima. Berlaku di sesi ini.</p>
        <div style={{ marginTop: 8 }}>
          <div className="toggle-row">
            <span>
              <b>Pengumpulan Tugas Baru</b>
              <span>Dapatkan notifikasi saat siswa mengumpulkan tugas.</span>
            </span>
            <button
              className={"switch" + (prefs.task ? " on" : "")}
              aria-label="toggle"
              onClick={() => togglePref("task")}
            ></button>
          </div>
          <div className="toggle-row">
            <span>
              <b>Pengingat Tenggat Waktu</b>
              <span>Ingatkan saya sebelum tenggat tugas berakhir.</span>
            </span>
            <button
              className={"switch" + (prefs.deadline ? " on" : "")}
              aria-label="toggle"
              onClick={() => togglePref("deadline")}
            ></button>
          </div>
          <div className="toggle-row">
            <span>
              <b>Rekomendasi AI</b>
              <span>Terima saran kuis dan materi berdasarkan nilai terbaru.</span>
            </span>
            <button
              className={"switch" + (prefs.ai ? " on" : "")}
              aria-label="toggle"
              onClick={() => togglePref("ai")}
            ></button>
          </div>
          <div className="toggle-row">
            <span>
              <b>Email Mingguan</b>
              <span>Terima ringkasan nilai dan tugas setiap Senin pagi.</span>
            </span>
            <button
              className={"switch" + (prefs.email ? " on" : "")}
              aria-label="toggle"
              onClick={() => togglePref("email")}
            ></button>
          </div>
        </div>
      </div>
    </div>
  );
}
