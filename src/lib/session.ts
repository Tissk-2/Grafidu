import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";

export type Role = "student" | "teacher" | "admin";

/** Bentuk identik dengan SessionUser lama di lib/auth.ts — konsumen tidak berubah. */
export type SessionUser = {
  id: string;
  role: Role;
  name: string;
  email: string;
  className: string | null;
  subject: string | null;
  avatar: string;
  phone: string;
  prefs: string;
  mustChangePassword: boolean;
};

export const SESSION_COOKIE = "grafidu_session";
const SESSION_TTL_DAYS = 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/home";
  if (role === "admin") return "/admin";
  return "/student/home";
}

/**
 * Buat session baru: simpan sha256(token) di tabel sessions, taruh token di
 * cookie httpOnly. Token acak 32 byte — tidak bisa ditebak, hash di DB agar
 * kebocoran database tidak bisa diputar ulang jadi session.
 */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);

  await sql`
    INSERT INTO public.sessions (user_id, token_hash)
    VALUES (${userId}, ${tokenHash})
  `;

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

type SessionRow = {
  user_id: string;
  email: string;
  role: Role | null;
  name: string | null;
  email_profile: string | null;
  class_name: string | null;
  avatar: string | null;
  is_active: boolean | null;
  must_change_password: boolean | null;
};

/**
 * Satu-satunya sumber identitas di server: cookie session → tabel sessions
 * → auth.users + profiles. Session kedaluwarsa/dihapus → null.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = hashToken(token);

  const rows = await sql<SessionRow[]>`
    SELECT
      u.id          AS user_id,
      u.email       AS email,
      p.role        AS role,
      p.name        AS name,
      p.email       AS email_profile,
      p.class_name  AS class_name,
      p.avatar      AS avatar,
      p.is_active   AS is_active,
      p.must_change_password AS must_change_password
    FROM public.sessions s
    JOIN auth.users u ON u.id = s.user_id
    LEFT JOIN public.profiles p ON p.id = s.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.expires_at > now()
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;
  if (row.is_active === false) return null;

  // last_seen_at diperbarui terpisah — kegagalannya tidak boleh
  // menggagalkan pembacaan session.
  await sql`
    UPDATE public.sessions SET last_seen_at = now()
    WHERE token_hash = ${tokenHash}
  `.catch(() => undefined);

  const role: Role = row.role ?? "student";
  const email = row.email_profile || row.email || "";
  return {
    id: row.user_id,
    role,
    name: row.name || email || "User",
    email,
    className: row.class_name ?? null,
    subject: null,
    avatar: row.avatar || "/assets/logo.png",
    phone: "",
    prefs: "{}",
    mustChangePassword: row.must_change_password === true,
  };
}

/** Hapus session milik cookie saat ini (sign out satu perangkat). */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await sql`DELETE FROM public.sessions WHERE token_hash = ${hashToken(token)}`;
  }
  jar.delete(SESSION_COOKIE);
}

/** Cabut semua session seorang user (admin reset sandi / deaktivasi akun). */
export async function destroyUserSessions(userId: string): Promise<void> {
  await sql`DELETE FROM public.sessions WHERE user_id = ${userId}`;
}

/**
 * Guard untuk server layout & server action: wajib login (→ /login),
 * wajib ganti sandi dulu bila ditandai (→ /change-password), dan role
 * harus cocok (→ dashboard role-nya sendiri).
 */
export async function requireRole(role?: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/change-password");
  if (role && user.role !== role) redirect(dashboardPath(user.role));
  return user;
}
