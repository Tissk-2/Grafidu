import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/users — buat akun siswa/guru baru.
 *
 * Membuat user di auth.users (butuh service-role key, tidak bisa dari
 * browser), lalu baris profiles + enrollment. Pemanggil wajib admin.
 * Body: { role, name, email, phone?, classId?, subject?, password }
 */

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServerClient(url, key, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

type Gate = { status: number; message: string } | null;

async function requireAdmin(): Promise<Gate> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 401, message: "Kamu harus login terlebih dahulu." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
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

  const admin = serviceClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local. Tambahkan service role key dari Dashboard Supabase (Settings → API) lalu restart dev server.",
      },
      { status: 500 }
    );
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
    const { data: cls, error: clsErr } = await admin
      .from("classes")
      .select("id, name")
      .eq("id", body.classId)
      .single();
    if (clsErr || !cls) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 400 });
    }
    className = (cls as { name: string }).name;
  }

  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });
  if (authErr || !authData?.user) {
    const message = authErr?.message ?? "Gagal membuat user auth.";
    const status = /already|registered|exists/i.test(message) ? 409 : 400;
    return NextResponse.json(
      { error: status === 409 ? "Email sudah terdaftar." : message },
      { status }
    );
  }

  const userId = authData.user.id;
  const { error: profErr } = await admin.from("profiles").insert({
    id: userId,
    role,
    name,
    email,
    phone: phone || null,
    subject: role === "teacher" ? subject : null,
    class_name: className,
    is_active: true,
    must_change_password: true,
  });
  if (profErr) {
    // Rollback user auth agar tidak ada akun yatim tanpa profil.
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }

  if (role === "student" && body.classId) {
    const { error: enrollErr } = await admin
      .from("enrollments")
      .insert({ class_id: body.classId, student_id: userId });
    if (enrollErr) {
      await admin.from("profiles").delete().eq("id", userId);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: enrollErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ id: userId, temporaryPassword: password });
}
