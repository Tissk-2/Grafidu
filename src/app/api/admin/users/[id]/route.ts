import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { destroyUserSessions, getSessionUser } from "@/lib/session";

/**
 * PATCH /api/admin/users/[id] — ubah akun siswa/guru.
 *
 * Field profil (nama/telepon/mapel) langsung ke profiles. Untuk siswa,
 * classId mengganti kelas: enrollment lama diganti baru dan label
 * profiles.class_name disinkronkan. Email dan kata sandi ditulis ke
 * auth.users (hash bcrypt); ganti sandi menandai must_change_password dan
 * menutup semua session user itu. Nonaktif (is_active = false) juga menutup
 * session — pengganti mekanisme ban Supabase.
 * Body: { name?, email?, phone?, subject?, classId?, isActive?, password? }
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Gate = { status: number; message: string } | null;

async function requireAdmin(): Promise<Gate> {
  const user = await getSessionUser();
  if (!user) return { status: 401, message: "Kamu harus login terlebih dahulu." };
  if (user.role !== "admin") {
    return { status: 403, message: "Hanya admin yang boleh melakukan aksi ini." };
  }
  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (gate) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Id pengguna tidak valid." }, { status: 400 });
  }

  let body: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    classId?: string;
    isActive?: boolean;
    password?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const current = await sql<{ email: string | null; role: string | null }[]>`
    SELECT u.email, p.role
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE u.id = ${id} LIMIT 1
  `;
  if (!current[0]) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }
  const currentEmail = current[0].email ?? "";

  // Pindah kelas (siswa): validasi kelasnya dulu, eksekusinya di transaksi.
  let newClassId: string | null = null;
  let newClassName: string | null = null;
  if (body.classId !== undefined && body.classId !== "") {
    if (!UUID_RE.test(body.classId)) {
      return NextResponse.json({ error: "Id kelas tidak valid." }, { status: 400 });
    }
    if (current[0].role !== "student") {
      return NextResponse.json({ error: "Hanya akun siswa yang memiliki kelas." }, { status: 400 });
    }
    const cls = await sql<{ id: string; name: string }[]>`
      SELECT id, name FROM public.classes WHERE id = ${body.classId} LIMIT 1
    `;
    if (!cls[0]) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 400 });
    }
    newClassId = cls[0].id;
    newClassName = cls[0].name;
  }

  const email = body.email?.trim().toLowerCase() ?? undefined;
  const emailChanged = Boolean(email && email !== currentEmail.toLowerCase());
  let passwordHash: string | null = null;
  if (body.password) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
    }
    passwordHash = await bcrypt.hash(body.password, 10);
  }
  const deactivating = body.isActive === false;

  // postgres.js menolak parameter undefined — normalisasi ke null di sini.
  const newEmail = emailChanged && email ? email : null;
  const newName = body.name !== undefined ? body.name.trim() : null;
  const newPhone = body.phone !== undefined ? body.phone.trim() || null : null;
  const newSubject = body.subject !== undefined ? body.subject.trim() || null : null;
  const newIsActive = body.isActive !== undefined ? body.isActive : null;

  try {
    await sql.begin(async (tx) => {
      if (emailChanged || passwordHash) {
        await tx`
          UPDATE auth.users SET
            email = COALESCE(${newEmail}, email),
            email_confirmed_at = CASE WHEN ${emailChanged} THEN now() ELSE email_confirmed_at END,
            encrypted_password = COALESCE(${passwordHash}, encrypted_password),
            updated_at = now()
          WHERE id = ${id}
        `;
      }

      await tx`
        UPDATE public.profiles SET
          name                 = COALESCE(${newName}, name),
          email                = COALESCE(${newEmail}, email),
          phone                = COALESCE(${newPhone}, phone),
          subject              = COALESCE(${newSubject}, subject),
          class_name           = COALESCE(${newClassName}, class_name),
          is_active            = COALESCE(${newIsActive}, is_active),
          must_change_password = CASE WHEN ${passwordHash !== null} THEN true ELSE must_change_password END
        WHERE id = ${id}
      `;

      if (newClassId && newClassName) {
        await tx`DELETE FROM public.enrollments WHERE student_id = ${id}`;
        await tx`
          INSERT INTO public.enrollments (class_id, student_id)
          VALUES (${newClassId}, ${id})
        `;
      }
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json({ error: "Email sudah dipakai akun lain." }, { status: 409 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  // Ganti sandi / nonaktif = tutup semua session yang berjalan.
  if (passwordHash || deactivating) {
    await destroyUserSessions(id);
  }

  return NextResponse.json({ ok: true });
}
