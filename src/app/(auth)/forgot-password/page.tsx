"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLeft from "@/components/auth/auth-left";
import { createClient } from "@/lib/supabase/client";

function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/home";
  if (role === "admin") return "/admin";
  return "/student/home";
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto auth: sudah login tidak perlu reset password dari sini.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user || cancelled) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        const role = (profile as { role?: string } | null)?.role;
        if (role && !cancelled) router.replace(dashboardPath(role));
      } catch {
        // Abaikan — biarkan form tampil.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    const em = email.trim().toLowerCase();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Format email tidak valid.");
      return;
    }
    setLoading(true);
    try {
      // Murni via Supabase Auth — tidak ada simulasi lokal/demo.
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(em, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setError(`Gagal mengirim tautan: ${error.message}`);
        return;
      }
      setSubmitted(true);
      window.gtoast?.("Tautan pemulihan kata sandi telah dikirim ke email kamu.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
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
            Masukkan alamat email akun Grafidu kamu untuk menerima tautan atur ulang kata sandi.
          </p>

          {error && (
            <div className="field-error" style={{ color: "var(--red)", marginBottom: 12, fontSize: 13 }}>
              {error}
            </div>
          )}

          {submitted ? (
            <div style={{ background: "#F9FAFB", border: "1px solid var(--line)", borderRadius: 12, padding: 22, marginTop: 20, textAlign: "center" }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--green-soft)",
                  color: "#2F9E5B",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 12px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <b style={{ fontSize: 16, display: "block", marginBottom: 6 }}>Email Pemulihan Terkirim</b>
              <p style={{ fontSize: 13.5, color: "var(--gray-3)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Kami telah mengirimkan instruksi pemulihan ke <b>{email}</b>. Silakan periksa kotak masuk atau folder spam kamu.
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

              <button className={"btn-auth" + (loading ? " is-loading" : "")} type="submit" disabled={loading}>
                Kirim Tautan Pemulihan
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
