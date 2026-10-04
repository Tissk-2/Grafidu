import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSessionUser } from "@/lib/session";

/**
 * POST /api/upload/submission — unggah berkas jawaban tugas untuk siswa.
 * Simpan ke public/uploads/submission/<studentId>/ (disajikan Next langsung),
 * kembalikan path publiknya untuk disimpan ke task_statuses.attachment_url.
 * Pemanggil wajib login sebagai siswa; satu berkas per permintaan.
 */

const MAX_SUBMISSION_BYTES = 10 * 1024 * 1024; // 10 MB per berkas
const ALLOWED_EXT = new Set([
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "jpg", "jpeg", "png", "webp", "gif", "txt", "zip",
]);

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Kamu harus login terlebih dahulu." }, { status: 401 });
  }
  if (user.role !== "student") {
    return NextResponse.json({ error: "Hanya siswa yang boleh mengunggah jawaban tugas." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 400 });
  }
  if (file.size > MAX_SUBMISSION_BYTES) {
    return NextResponse.json({ error: "Ukuran berkas maksimal 10 MB." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Berkas kosong." }, { status: 400 });
  }

  // Nama asli tetap terbaca di URL, tapi dibersihkan dari karakter liar.
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "tugas";
  const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { error: "Format tidak didukung. Gunakan PDF, Word, PPT, Excel, gambar, TXT, atau ZIP." },
      { status: 400 }
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", "submission", user.id);
  const fileName = `${base}-${Date.now()}.${ext}`;
  const publicPath = `/uploads/submission/${user.id}/${fileName}`;

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Gagal menyimpan berkas." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: publicPath });
}
