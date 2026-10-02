"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/auth";

function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/home";
  if (role === "admin") return "/admin";
  return "/student/home";
}

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Auto auth: kalau sesi masih ada (sudah login), langsung lempar ke dashboard
  // tanpa harus isi form lagi. Ini cover navigasi client-side / tombol back.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getSessionUser();
        if (user && !cancelled) {
          router.replace(dashboardPath(user.role));
          return;
        }
      } catch {
        // Abaikan — biarkan form tampil.
      } finally {
        if (!cancelled) setChecking(false);
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
      const result = await signIn(em, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      // Satu refresh setelah navigasi agar layout server membaca session baru.
      const target = result.mustChangePassword
        ? "/change-password"
        : dashboardPath(result.role);
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
      <p className="sub">
        {checking ? "Checking your session..." : "Sign in to see what needs attention today."}
      </p>

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
