import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/admin/users/[id] — ubah akun siswa/guru.
 *
 * Field profil (nama/telepon/mapel) langsung ke profiles. Email, kata sandi,
 * dan status aktif disinkronkan ke auth.users lewat service-role key
 * (ganti sandi memaksa login ulang + wajib ganti sandi di login berikutnya;
 * nonaktif memban user sehingga sesi berjalan ikut ditutup).
 * Body: { name?, email?, phone?, subject?, isActive?, password? }
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BAN_DURATION = "876000h"; // ±100 tahun = nonaktif permanen

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Id pengguna tidak valid." }, { status: 400 });
  }

  let body: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    isActive?: boolean;
    password?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const { data: current, error: currentErr } = await admin
    .from("profiles")
    .select("id, email")
    .eq("id", id)
    .single();
  if (currentErr || !current) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }
  const currentEmail = (current as { email: string | null }).email ?? "";

  // auth.users: email / sandi / ban dikumpulkan jadi satu panggilan.
  const authAttrs: { email?: string; email_confirm?: boolean; password?: string; ban_duration?: string } = {};
  const email = body.email?.trim().toLowerCase();
  if (email && email !== currentEmail.toLowerCase()) {
    authAttrs.email = email;
    authAttrs.email_confirm = true;
  }
  if (body.password) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
    }
    authAttrs.password = body.password;
  }
  if (body.isActive === false) authAttrs.ban_duration = BAN_DURATION;
  if (body.isActive === true) authAttrs.ban_duration = "none";

  if (Object.keys(authAttrs).length > 0) {
    const { error: authErr } = await admin.auth.admin.updateUserById(id, authAttrs);
    if (authErr) {
      const conflict = /already|registered|exists/i.test(authErr.message);
      return NextResponse.json(
        { error: conflict ? "Email sudah dipakai akun lain." : authErr.message },
        { status: conflict ? 409 : 400 }
      );
    }
  }

  // Ganti sandi / nonaktif = tutup semua sesi yang berjalan.
  if (authAttrs.password || authAttrs.ban_duration === BAN_DURATION) {
    try {
      await admin.auth.admin.signOut(id);
    } catch {
      // Non-fatal: sesi tetap ditolak RLS ban di auth layer.
    }
  }

  const profileUpdate: Record<string, unknown> = {};
  if (body.name !== undefined) profileUpdate.name = body.name.trim();
  if (email) profileUpdate.email = email;
  if (body.phone !== undefined) profileUpdate.phone = body.phone.trim() || null;
  if (body.subject !== undefined) profileUpdate.subject = body.subject.trim() || null;
  if (body.isActive !== undefined) profileUpdate.is_active = body.isActive;
  if (authAttrs.password) profileUpdate.must_change_password = true;

  if (Object.keys(profileUpdate).length > 0) {
    const { error: profErr } = await admin.from("profiles").update(profileUpdate).eq("id", id);
    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
