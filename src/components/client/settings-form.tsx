"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { avatarSrc, type SessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

export default function SettingsForm({ initialUser }: { initialUser: SessionUser }) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.gtoast?.("Pilih berkas gambar (JPG, PNG, WEBP, dll).", "error");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      window.gtoast?.("Ukuran foto maksimal 2 MB.", "error");
      return;
    }
    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${initialUser.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw new Error(upErr.message);

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ avatar: data.publicUrl })
        .eq("id", initialUser.id);
      if (profErr) throw new Error(profErr.message);

      window.gtoast?.("Foto profil berhasil diperbarui.");
      // Muat ulang agar sidebar & header ikut memakai avatar baru.
      window.setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSavePassword() {
    if (!currentPw) {
      window.gtoast?.("Masukkan kata sandi saat ini dulu.", "error");
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
      // Supabase tidak mewajibkan sandi lama saat sesi aktif — verifikasi
      // manual dengan sign-in ulang supaya kolom ini benar-benar dicek.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: initialUser.email,
        password: currentPw,
      });
      if (signInErr) {
        throw new Error(
          signInErr.status === 400 ? "Kata sandi saat ini salah." : signInErr.message,
        );
      }
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw new Error(error.message);
      setCurrentPw("");
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

  return (
    <div className="settings-grid">
      <div className="set-profile">
        <span className="avatar-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarSrc(initialUser.avatar)} alt={initialUser.name} width={80} height={80} />
          <button
            type="button"
            className="avatar-edit"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto}
          >
            <Camera size={13} aria-hidden />
            {uploadingPhoto ? "Mengunggah..." : "Ubah Foto"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
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
          </div>
        </div>
      </div>

      <div className="set-card">
        <h3>Ubah Kata Sandi</h3>
        <p className="sub">Gunakan kata sandi yang kuat dan belum pernah dipakai sebelumnya.</p>
        <div className="field">
          <label>Kata Sandi Saat Ini</label>
          <div className="control">
            <input
              type="password"
              placeholder="Masukkan kata sandi yang sekarang"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
              style={{ letterSpacing: 3 }}
            />
          </div>
        </div>
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
