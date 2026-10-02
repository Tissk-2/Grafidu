import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

/**
 * POST /api/admin/users — buat akun siswa/guru baru.
 *
 * Menulis langsung ke Postgres self-hosted: baris auth.users (hash bcrypt,
 * email terkonfirmasi) + profiles + enrollment dalam SATU transaksi —
 * tidak ada lagi rollback manual ala service-role Supabase.
 * Pemanggil wajib admin.
 * Body: { role, name, email, phone?, classId?, subject?, password }
 */

type Gate = { status: number; message: string } | null;

async function requireAdmin(): Promise<Gate> {
  const user = await getSessionUser();
  if (!user) return { status: 401, message: "Kamu harus login terlebih dahulu." };
  if (user.role !== "admin") {
    return { status: 403, message: "Hanya admin yang boleh melakukan aksi ini." };
  }
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  let body: {
    role?: string;
    name?: string;
    email?: string;
    phone?: string;
    classId?: string;
    subject?: string;
    password?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const role = body.role === "teacher" ? "teacher" : body.role === "student" ? "student" : null;
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const password = body.password ?? "";

  if (!role) return NextResponse.json({ error: "Peran akun tidak valid." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Nama lengkap wajib diisi." }, { status: 400 });
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Kata sandi sementara minimal 8 karakter." },
      { status: 400 }
    );
  }
  if (role === "teacher" && !subject) {
    return NextResponse.json({ error: "Mapel utama wajib diisi untuk guru." }, { status: 400 });
  }

  let className: string | null = null;
  if (role === "student") {
    if (!body.classId) {
      return NextResponse.json({ error: "Pilih kelas untuk siswa." }, { status: 400 });
    }
    const classes = await sql<{ id: string; name: string }[]>`
      SELECT id, name FROM public.classes WHERE id = ${body.classId} LIMIT 1
    `;
    if (!classes[0]) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 400 });
    }
    className = classes[0].name;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const userId = await sql.begin(async (tx) => {
      const inserted = await tx<{ id: string }[]>`
        INSERT INTO auth.users (
          aud, role, email, encrypted_password, email_confirmed_at,
          raw_app_meta_data, raw_user_meta_data,
          created_at, updated_at, is_sso_user, is_anonymous
        ) VALUES (
          'authenticated', 'authenticated', ${email}, ${passwordHash}, now(),
          ${sql.json({ provider: "email", providers: ["email"] })},
          ${sql.json({ name, role })},
          now(), now(), false, false
        )
        RETURNING id
      `;
      const id = inserted[0].id;

      await tx`
        INSERT INTO public.profiles (
          id, role, name, email, phone, subject, class_name,
          is_active, must_change_password
        ) VALUES (
          ${id}, ${role}, ${name}, ${email}, ${phone || null},
          ${role === "teacher" ? subject : null},
          ${className},
          true, true
        )
      `;

      if (role === "student" && body.classId) {
        await tx`
          INSERT INTO public.enrollments (class_id, student_id)
          VALUES (${body.classId}, ${id})
        `;
      }

      return id;
    });

    return NextResponse.json({ id: userId, temporaryPassword: password });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }
    const message = (err as Error).message ?? "Gagal membuat akun.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
