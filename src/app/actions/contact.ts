"use server";

import { sql } from "@/lib/db";

export type LeadInput = {
  name: string;
  email: string;
  school: string;
  students: string;
  message: string;
};

export type LeadResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Simpan lead dari formulir kontak landing page ke tabel contact_leads.
 * Belum ada SMTP — notifikasi email menyusul; leads dibaca langsung dari DB.
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const school = input.school.trim();
  const students = input.students.trim();
  const message = input.message.trim();

  if (!name || !email || !school || !students || !message) {
    return { ok: false, error: "Semua kolom wajib diisi." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Format email tidak valid." };
  }
  if (name.length > 120 || school.length > 160 || message.length > 2000) {
    return { ok: false, error: "Isi formulir terlalu panjang." };
  }

  try {
    await sql`
      INSERT INTO contact_leads (name, email, school, students_range, message)
      VALUES (${name}, ${email}, ${school}, ${students}, ${message})
    `;
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Pesan gagal terkirim. Coba lagi, atau email kami di care@grafidu.com.",
    };
  }
}
