"use server";

import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import {
  createSession,
  destroySession,
  getSessionUser,
  type Role,
} from "@/lib/session";

export type SignInResult =
  | { ok: true; role: Role; mustChangePassword: boolean }
  | { ok: false; error: string };

const GENERIC_LOGIN_ERROR = "Email atau kata sandi salah.";

/**
 * Login: verifikasi bcrypt terhadap hash lama Supabase (auth.users.
 * encrypted_password — format $2a$ dibaca bcryptjs apa adanya, jadi
 * sandi semua user tetap berlaku), lalu buat session cookie.
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
  const em = email.trim().toLowerCase();
  if (!em || !password) return { ok: false, error: GENERIC_LOGIN_ERROR };

  // Error dari server action disamarkan Next.js di production — tangkap di
  // sini agar pengguna selalu melihat pesan yang bisa dimengerti.
  try {
    const users = await sql<{ id: string; encrypted_password: string | null }[]>`
      SELECT id, encrypted_password
      FROM auth.users
      WHERE email = ${em}
        AND deleted_at IS NULL
      LIMIT 1
    `;
    const user = users[0];
    const hash = user?.encrypted_password ?? null;
    const valid =
      hash !== null && (await bcrypt.compare(password, hash));
    if (!user || !valid) return { ok: false, error: GENERIC_LOGIN_ERROR };

    const profiles = await sql<
      {
        role: Role | null;
        is_active: boolean | null;
        must_change_password: boolean | null;
      }[]
    >`
      SELECT role, is_active, must_change_password
      FROM public.profiles
      WHERE id = ${user.id}
      LIMIT 1
    `;
    const profile = profiles[0];
    if (!profile) {
      // User auth ada tapi baris profiles tidak — sama seperti alur lama:
      // jangan biarkan masuk tanpa profil.
      return {
        ok: false,
        error:
          "Akun ini belum terdaftar di database (tabel profiles). Hubungi admin sekolah untuk didaftarkan.",
      };
    }
    if (profile.is_active === false) {
      return {
        ok: false,
        error: "Akun dinonaktifkan. Hubungi admin sekolah.",
      };
    }

    await createSession(user.id);
    return {
      ok: true,
      role: profile.role ?? "student",
      mustChangePassword: profile.must_change_password === true,
    };
  } catch {
    return {
      ok: false,
      error: "Gagal menghubungi server. Periksa koneksi lalu coba lagi.",
    };
  }
}

/** Sign out: hapus baris session + cookie. */
export async function signOutAction(): Promise<void> {
  await destroySession();
}

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

/**
 * Ganti sandi. Dua mode, sama seperti alur Supabase lama:
 * - Wajib ganti (akun sandi sementara): cukup session — user baru saja
 *   membuktikan kepesertaan lewat login.
 * - Ganti biasa (halaman settings): wajib verifikasi sandi lama dulu.
 */
export async function changePassword(
  currentPassword: string | null,
  newPassword: string
): Promise<ChangePasswordResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sesi berakhir. Silakan login ulang." };
  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "Kata sandi minimal 8 karakter." };
  }

  const rows = await sql<{ encrypted_password: string | null }[]>`
    SELECT encrypted_password FROM auth.users WHERE id = ${user.id} LIMIT 1
  `;
  const hash = rows[0]?.encrypted_password ?? null;
  if (!user.mustChangePassword) {
    if (!currentPassword || !hash || !(await bcrypt.compare(currentPassword, hash))) {
      return { ok: false, error: "Kata sandi lama salah." };
    }
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await sql.begin(async (tx) => {
    await tx`
      UPDATE auth.users
      SET encrypted_password = ${newHash}, updated_at = now()
      WHERE id = ${user.id}
    `;
    await tx`
      UPDATE public.profiles
      SET must_change_password = false
      WHERE id = ${user.id}
    `;
  });
  return { ok: true };
}

export type UpdateProfileResult = { ok: true } | { ok: false; error: string };

/**
 * Perbarui profil sendiri (nama / email / telepon / preferensi).
 * Email disinkronkan ke auth.users DAN profiles (perilaku sama dengan
 * alur Supabase lama).
 */
export async function updateProfile(fields: {
  name?: string;
  email?: string;
  phone?: string;
  prefs?: string;
}): Promise<UpdateProfileResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sesi berakhir. Silakan login ulang." };

  const name = fields.name?.trim();
  const email = fields.email?.trim().toLowerCase();
  const phone = fields.phone?.trim();
  const prefs = fields.prefs;

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Format email tidak valid." };
  }

  try {
    await sql.begin(async (tx) => {
      if (name !== undefined || phone !== undefined || prefs !== undefined || email !== undefined) {
        await tx`
          UPDATE public.profiles SET
            name  = COALESCE(${name ?? null}, name),
            email = COALESCE(${email ?? null}, email),
            phone = COALESCE(${phone ?? null}, phone),
            prefs = COALESCE(${prefs ?? null}, prefs)
          WHERE id = ${user.id}
        `;
      }
      if (email) {
        await tx`
          UPDATE auth.users
          SET email = ${email}, updated_at = now()
          WHERE id = ${user.id}
        `;
      }
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return { ok: false, error: "Email sudah dipakai akun lain." };
    }
    return { ok: false, error: "Gagal menyimpan profil. Coba lagi." };
  }
  return { ok: true };
}
