"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
 * Kolom `profiles.avatar` boleh berisi path lokal ("/assets/…"), nama file di
 * /public, atau URL penuh dari Supabase Storage. Hanya dua pertama yang perlu
 * diawali "/" — URL absolut harus dilewati apa adanya.
 */
export function avatarSrc(avatar: string): string {
  if (avatar.startsWith("http") || avatar.startsWith("/")) return avatar;
  return "/" + avatar;
}

type ProfileRow = {
  role: Role | string | null;
  name: string | null;
  email: string | null;
  class_name: string | null;
  avatar: string | null;
  must_change_password?: boolean | null;
};

/**
 * Ambil baris profil. Coba kolom lengkap dulu; kalau skema tabel belum
 * punya semua kolom (PostgREST 400), mundur ke `role` saja agar login
 * tetap jalan. Return null kalau baris memang tidak ada / tak bisa dibaca.
 */
async function fetchProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<ProfileRow | null> {
  const full = await supabase
    .from("profiles")
    .select("role, name, email, class_name, avatar, must_change_password")
    .eq("id", userId)
    .single();
  if (!full.error) return (full.data as ProfileRow | null) ?? null;

  const minimal = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (!minimal.error) return (minimal.data as ProfileRow | null) ?? null;

  if (process.env.NODE_ENV === "development") {
    console.warn("[auth:profile]", full.error?.code, full.error?.message);
  }
  return null;
}

/**
 * Satu-satunya sumber data user: Supabase Auth + tabel `profiles`.
 * Tidak ada localStorage / data demo di alur login.
 */
async function fetchSessionUser(): Promise<SessionUser | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const authUser = session?.user;
  if (!authUser) return null;

  const p = await fetchProfile(supabase, authUser.id);
  if (!p) return null;
  const role = (p?.role as Role) || "student";
  return {
    id: authUser.id,
    role,
    name: p?.name || p?.email || authUser.email || "User",
    email: p?.email || authUser.email || "",
    className: p?.class_name ?? null,
    subject: null,
    avatar: p?.avatar || "/assets/logo.png",
    phone: "",
    prefs: "{}",
    mustChangePassword: p?.must_change_password === true,
  };
}

// Cache sinkron agar komponen lama yang memanggil getCurrentUser()
// tetap jalan; isi cache selalu berasal dari Supabase via useRequireUser()
// atau getSessionUser(), bukan dari data demo.
let cachedUser: SessionUser | null = null;

// Satu fetch profil dibagi ke semua instance useRequireUser yang mount
// bersamaan (shell, page, rightbar) — bukan satu query per instance.
let sessionPromise: Promise<SessionUser | null> | null = null;

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

/** Versi sinkron: baca cache terakhir dari Supabase. */
export function getCurrentUser(): SessionUser | null {
  return cachedUser;
}

/** Versi async: ambil sesi + profil fresh dari Supabase (dedup antar pemanggil). */
export async function getSessionUser(): Promise<SessionUser | null> {
  return fetchSessionUserShared();
}

export function login(): never {
  throw new Error("Gunakan Supabase Auth langsung via auth-form.tsx");
}

export function signup(): never {
  throw new Error("Gunakan Supabase Auth langsung");
}

export async function logout(): Promise<void> {
  if (typeof window === "undefined") return;
  cachedUser = null;
  sessionPromise = null;
  const supabase = createClient();
  await supabase.auth.signOut();
}

export function useRequireUser(role?: Role): SessionUser | null {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(cachedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
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
    // dipakai tanpa fetch ulang — subscription di bawah yang menjaga fresh.
    if (cachedUser) {
      applyUser(cachedUser);
    } else {
      fetchSessionUserShared()
        .then((u) => applyUser(u))
        .catch(() => applyUser(null));
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (!session?.user) {
        applyUser(null);
        return;
      }
      // User yang sama persis: INITIAL_SESSION (emit otomatis tiap subscribe)
      // dan TOKEN_REFRESHED tidak perlu fetch + setUser ulang — identitas
      // objek baru memicu efek data shell jalan dua kali. USER_UPDATED atau
      // ganti akun (id beda) tetap di-fetch ulang.
      if (cachedUser && cachedUser.id === session.user.id && event !== "USER_UPDATED") {
        return;
      }
      fetchSessionUserShared()
        .then((u) => applyUser(u))
        .catch(() => applyUser(null));
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router, role]);

  if (loading) return null;
  return user;
}
