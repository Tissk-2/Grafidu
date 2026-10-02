"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

export type Role = "student" | "teacher" | "admin";

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
  /** Akun dengan sandi sementara wajib ganti sandi sebelum lanjut. */
  mustChangePassword?: boolean;
};

/**
 * Kolom `profiles.avatar` boleh berisi path lokal ("/assets/…", "/uploads/…"),
 * nama file di /public, atau URL penuh. Hanya dua pertama yang diawali "/" —
 * URL absolut dilewati apa adanya.
 */
export function avatarSrc(avatar: string): string {
  if (avatar.startsWith("http") || avatar.startsWith("/")) return avatar;
  return "/" + avatar;
}

/**
 * Satu-satunya sumber data user di client: GET /api/auth/session
 * (server membaca cookie session → tabel sessions → auth.users + profiles).
 * Tidak ada localStorage / data demo di alur login.
 */

// Cache sinkron agar komponen yang memanggil getCurrentUser() tetap jalan;
// isi cache selalu berasal dari server, bukan dari data demo.
let cachedUser: SessionUser | null = null;

// Satu fetch dibagi ke semua instance useRequireUser yang mount bersamaan
// (shell, page, rightbar) — bukan satu request per instance.
let sessionPromise: Promise<SessionUser | null> | null = null;

function fetchSessionUser(): Promise<SessionUser | null> {
  return fetch("/api/auth/session", { cache: "no-store" }).then(async (res) => {
    if (res.status === 401) return null;
    if (!res.ok) throw new Error(`session fetch failed: ${res.status}`);
    return (await res.json()) as SessionUser;
  });
}

function fetchSessionUserShared(): Promise<SessionUser | null> {
  if (!sessionPromise) {
    sessionPromise = fetchSessionUser()
      .then((u) => {
        cachedUser = u;
        return u;
      })
      .finally(() => {
        sessionPromise = null;
      });
  }
  return sessionPromise;
}

/** Bersihkan cache lokal — dipanggil setelah ganti sandi/profil agar refetch. */
export function clearSessionCache(): void {
  cachedUser = null;
  sessionPromise = null;
}

/** Versi sinkron: baca cache terakhir dari server. */
export function getCurrentUser(): SessionUser | null {
  return cachedUser;
}

/** Versi async: ambil sesi + profil fresh dari server (dedup antar pemanggil). */
export async function getSessionUser(): Promise<SessionUser | null> {
  return fetchSessionUserShared();
}

export async function logout(): Promise<void> {
  cachedUser = null;
  sessionPromise = null;
  try {
    await signOutAction();
  } catch {
    // Cookie sudah dihapus server-side walau network gagal; tetap lanjut.
  }
}

export function useRequireUser(role?: Role): SessionUser | null {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(cachedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const applyUser = (u: SessionUser | null) => {
      if (cancelled) return;
      cachedUser = u;
      if (!u) {
        setUser(null);
        setLoading(false);
        router.replace("/login");
        return;
      }
      if (role && u.role !== role) {
        const target =
          u.role === "teacher"
            ? "/teacher/home"
            : u.role === "admin"
              ? "/admin"
              : "/student/home";
        setUser(null);
        setLoading(false);
        router.replace(target);
        return;
      }
      setUser(u);
      setLoading(false);
    };

    // Fast path: cache dari mount sebelumnya (shell sudah resolve) langsung
    // dipakai tanpa fetch ulang.
    if (cachedUser) {
      applyUser(cachedUser);
    } else {
      fetchSessionUserShared()
        .then((u) => applyUser(u))
        .catch(() => applyUser(null));
    }

    return () => {
      cancelled = true;
    };
  }, [router, role]);

  if (loading) return null;
  return user;
}
