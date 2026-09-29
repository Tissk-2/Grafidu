"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { demoAdmin } from "@/lib/admin-demo";

/**
 * Admin "Pengaturan" page: own profile and password controls. Frontend-only —
 * saves show success feedback without persisting; the real implementation
 * posts to the profile/password endpoints.
 */
export default function AdminSettingsForm() {
  const router = useRouter();
  const [name, setName] = useState(demoAdmin.name);
  const [email, setEmail] = useState(demoAdmin.email);
  const [phone, setPhone] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  function handleSaveProfile() {
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
    window.gtoast?.("Profil berhasil diperbarui.");
  }

  function handleSavePassword() {
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
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    window.gtoast?.("Kata sandi berhasil diperbarui.");
  }

  function handleLogout() {
    // Frontend-only: session clearing happens server-side in the real flow.
    router.push("/login");
  }

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
          {demoAdmin.name.trim().charAt(0).toUpperCase()}
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
            <button type="button" className="btn btn-primary" id="save-profile" onClick={handleSaveProfile}>
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
              placeholder="Kata sandi saat ini"
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
          <button className="btn btn-primary" type="button" onClick={handleSavePassword}>
            Perbarui Kata Sandi
          </button>
        </div>
      </div>
    </div>
  );
}
