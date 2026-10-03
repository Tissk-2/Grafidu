import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

/**
 * POST /api/upload/avatar — pengganti Supabase Storage untuk foto profil.
 * Simpan ke public/uploads/avatars/<userId>/ (disajikan Next langsung),
 * lalu simpan path-nya ke profiles.avatar. Pemanggil wajib login dan hanya
 * boleh mengubah avatar dirinya sendiri.
 */

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB — sama seperti batas di form
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Kamu harus login terlebih dahulu." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Berkas foto tidak ditemukan." }, { status: 400 });
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "Ukuran foto maksimal 2 MB." }, { status: 400 });
  }
  const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { error: "Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF." },
      { status: 400 }
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", "avatars", user.id);
  const fileName = `avatar-${Date.now()}.${ext}`;
  const publicPath = `/uploads/avatars/${user.id}/${fileName}`;

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
    await sql`UPDATE public.profiles SET avatar = ${publicPath} WHERE id = ${user.id}`;
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Gagal menyimpan foto." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: publicPath });
}
