"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const em = email.trim().toLowerCase();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Format email tidak valid.");
      return;
    }
    if (!password) {
      setError("Kata sandi wajib diisi.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: em,
        password: password,
      });
      if (error || !data.user) {
        setError(`Login gagal: ${error?.message ?? "Email atau kata sandi salah."}`);
        return;
      }

      // Sumber kebenaran tunggal: tabel `profiles` di Supabase.
      // Login hanya butuh `role`; kolom lain opsional agar tidak 400
      // kalau skema tabel belum lengkap.
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("role, must_change_password")
        .eq("id", data.user.id)
        .single();

      if (profErr || !profile) {
        await supabase.auth.signOut();
        if (process.env.NODE_ENV === "development") {
          console.warn("[login:profile]", profErr?.code, profErr?.message);
        }
        // PGRST116 = baris tidak ada (user belum didaftarkan).
        // Kode lain (mis. 400 / RLS) = masalah skema atau policy.
        setError(
          profErr?.code === "PGRST116"
            ? "Akun ini belum terdaftar di database (tabel profiles). Hubungi admin sekolah untuk didaftarkan."
            : `Gagal membaca data profil: ${profErr?.message ?? "unknown error"}. Periksa kolom tabel profiles dan RLS policy.`
        );
        return;
      }

      const role = (profile as { role: string }).role;
      const mustChangePassword =
        (profile as { must_change_password?: boolean | null }).must_change_password === true;
      // Satu refresh setelah navigasi agar cookie sesi terbaca middleware.
      const target = mustChangePassword
        ? "/change-password"
        : role === "teacher"
          ? "/teacher/home"
          : role === "admin"
            ? "/admin"
            : "/student/home";
      router.push(target);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-box">
      <h2>Welcome back</h2>
      <p className="sub">Sign in to see what needs attention today.</p>

      {error ? (
        <div
          className="field-error"
          role="alert"
          style={{ color: "var(--red)", marginBottom: 12, fontSize: 13 }}
        >
          {error}
        </div>
      ) : null}

      {/* Enter di kolom mana pun memicu submit via form onSubmit di bawah. */}
      <form id="login-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="control">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@sekolah.sch.id"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="control">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete={remember ? "current-password" : "off"}
              placeholder="Enter your password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button type="button" className="show-pw" onClick={() => setShowPw((s) => !s)} tabIndex={-1}>
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="auth-row">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="box">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.4"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            Remember me
          </label>
          <span className="spacer"></span>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
        <button className="btn-auth" type="submit" disabled={loading} aria-busy={loading}>
          {loading ? "Memproses..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
