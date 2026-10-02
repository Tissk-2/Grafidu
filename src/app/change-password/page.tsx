"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/app/actions/auth";
import { clearSessionCache, getSessionUser, type SessionUser } from "@/lib/auth";

/**
 * Ganti kata sandi wajib untuk akun yang masih memakai sandi sementara dari
 * admin. Setelah sandi diganti, penanda must_change_password dihapus dan
 * pengguna diteruskan ke dashboard rolenya.
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSessionUser().then((u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      if (!u.mustChangePassword) {
        router.replace(
          u.role === "teacher" ? "/teacher/home" : u.role === "admin" ? "/admin" : "/student/home"
        );
        return;
      }
      setUser(u);
      setChecked(true);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (newPw.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }
    setBusy(true);
    try {
      // Akun wajib-ganti: tanpa verifikasi sandi lama (baru saja login dengannya).
      const result = await changePassword(null, newPw);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearSessionCache();
      const target =
        user?.role === "teacher" ? "/teacher/home" : user?.role === "admin" ? "/admin" : "/student/home";
      router.replace(target);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!checked) {
    return (
      <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 20 }}>
        <p style={{ color: "var(--gray-3)", fontSize: 14 }}>Memeriksa sesi…</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 20 }}>
      <div className="auth-box" style={{ width: "min(420px, 100%)" }}>
        <h2>Ganti Kata Sandi</h2>
        <p className="sub">
          Akunmu masih memakai kata sandi sementara. Buat kata sandi baru untuk melanjutkan.
          {user?.email ? ` (${user.email})` : ""}
        </p>

        {error ? (
          <div className="field-error" role="alert" style={{ color: "var(--red)", marginBottom: 12, fontSize: 13 }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="new-pw">Kata Sandi Baru</label>
            <div className="control">
              <input
                id="new-pw"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                required
                minLength={8}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                disabled={busy}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirm-pw">Konfirmasi Kata Sandi</label>
            <div className="control">
              <input
                id="confirm-pw"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Ulangi kata sandi baru"
                required
                minLength={8}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                disabled={busy}
              />
              <button type="button" className="show-pw" onClick={() => setShowPw((s) => !s)} tabIndex={-1}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button className="btn-auth" type="submit" disabled={busy} aria-busy={busy}>
            {busy ? "Menyimpan..." : "Simpan & Lanjutkan"}
          </button>
        </form>
      </div>
    </main>
  );
}
