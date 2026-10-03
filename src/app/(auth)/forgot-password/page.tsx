"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLeft from "@/components/auth/auth-left";
import { getSessionUser } from "@/lib/auth";

function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/home";
  if (role === "admin") return "/admin";
  return "/student/home";
}

/**
 * Atur ulang kata sandi. Pemulihan lewat email (SMTP) belum tersedia di
 * infrastruktur self-hosted — alur lama Supabase mengandalkan email link
 * dan memang belum lengkap. Untuk saat ini reset dilakukan admin sekolah
 * lewat panel Akun (sandi sementara + wajib ganti di login berikutnya).
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Auto auth: sudah login tidak perlu reset password dari sini.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getSessionUser();
        if (user && !cancelled) router.replace(dashboardPath(user.role));
      } catch {
        // Abaikan — biarkan form tampil.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return;
    setSubmitted(true);
  }

  return (
    <div className="auth">
      <AuthLeft />
      <main className="auth-right">
        <div className="auth-box">
          <div className="auth-switch">
            Remembered your password? <Link href="/login">Sign in</Link>
          </div>

          <h2>Atur Ulang Kata Sandi</h2>
          <p className="sub">
            Masukkan alamat email akun Grafidu kamu untuk melihat cara pemulihan kata sandi.
          </p>

          {submitted ? (
            <div style={{ background: "#F9FAFB", border: "1px solid var(--line)", borderRadius: 12, padding: 22, marginTop: 20, textAlign: "center" }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--purple-soft)",
                  color: "var(--purple)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 12px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <b style={{ fontSize: 16, display: "block", marginBottom: 6 }}>Hubungi Admin Sekolah</b>
              <p style={{ fontSize: 13.5, color: "var(--gray-3)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Pemulihan lewat email belum tersedia. Admin sekolah dapat mengatur ulang kata sandi
                untuk <b>{email}</b> lewat panel Akun — kamu akan menerima kata sandi sementara dan
                diminta membuat yang baru saat login.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ width: "100%" }}>
                Kembali ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ marginTop: 20 }}>
              <div className="field">
                <label htmlFor="reset-email">Email Terdaftar</label>
                <div className="control">
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="nama@sekolah.sch.id"
                    autoComplete="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="btn-auth" type="submit">
                Lanjutkan
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--gray-4)" }}>
            Butuh bantuan lain? Hubungi guru pembimbing atau <a href="mailto:care@grafidu.com" style={{ color: "var(--purple)" }}>dukungan teknis Grafidu</a>.
          </div>
        </div>
      </main>
    </div>
  );
}
