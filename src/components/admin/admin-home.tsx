"use client";

import Link from "next/link";
import { useDB } from "@/lib/store";
import { demoAdmin } from "@/lib/admin-demo";

/** Ringkasan Sekolah: honest counts + recent school announcements, straight
 *  from the in-browser store (frontend-only). */
export default function AdminHome() {
  const db = useDB();

  const activeStudents = (db?.users ?? []).filter(
    (u) => u.role === "student" && u.isActive !== false
  ).length;
  const activeTeachers = (db?.users ?? []).filter(
    (u) => u.role === "teacher" && u.isActive !== false
  ).length;
  const classCount = db?.classes.length ?? 0;

  const recentAnnouncements = [...(db?.announcements ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map((a) => ({
      ...a,
      creator: a.createdBy ? db?.users.find((u) => u.id === a.createdBy) ?? null : null,
    }));

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="page-title">Ringkasan Sekolah</h1>
          <p className="page-sub">
            Kelola akun, kelas, dan pengumuman Grafidu untuk sekolah Anda, {demoAdmin.name.split(" ")[0]}.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-primary btn-sm" href="/admin/users">
            Kelola Akun
          </Link>
          <Link className="btn btn-outline btn-sm" href="/admin/classes">
            Kelola Kelas
          </Link>
        </div>
      </div>

      <div className="adm-stat-grid">
        <div className="adm-stat">
          <span className="ic purple" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="9" cy="7" r="3.2" />
              <circle cx="16.5" cy="9.5" r="2.4" />
              <path d="M3.5 20c.6-3.2 2.9-5.2 5.5-5.2s4.9 2 5.5 5.2" />
              <path d="M15 15.4c.5-.3 1-.5 1.6-.5 1.9 0 3.5 1.6 4.1 3.9" />
            </svg>
          </span>
          <div>
            <b>{activeStudents}</b>
            <span>Siswa aktif</span>
          </div>
        </div>
        <div className="adm-stat">
          <span className="ic blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M22 10 12 5 2 10l10 5 10-5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </span>
          <div>
            <b>{activeTeachers}</b>
            <span>Guru aktif</span>
          </div>
        </div>
        <div className="adm-stat">
          <span className="ic green" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </span>
          <div>
            <b>{classCount}</b>
            <span>Kelas terdaftar</span>
          </div>
        </div>
      </div>

      <div className="adm-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2>Pengumuman Terbaru</h2>
            <p className="sub">Papan pengumuman sekolah yang juga tampil untuk siswa dan guru.</p>
          </div>
          <Link className="link-underline" href="/admin/announcements">
            Buat Pengumuman
          </Link>
        </div>

        {recentAnnouncements.length === 0 ? (
          <div className="adm-empty">
            <span className="ic" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m3 11 18-5v12L3 14v-3z" />
                <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
              </svg>
            </span>
            <b>Belum ada pengumuman</b>
            <p>Terbitkan pengumuman pertama untuk seluruh sekolah.</p>
            <Link className="btn btn-primary btn-sm" href="/admin/announcements">
              Buat Pengumuman
            </Link>
          </div>
        ) : (
          <div className="adm-announce-list">
            {recentAnnouncements.map((a) => (
              <div key={a.id} className="adm-announce-item">
                <b>{a.title}</b>
                <span>
                  {a.creator?.name ? `Oleh ${a.creator.name} • ` : ""}
                  {a.createdLabel || "Pengumuman Sekolah"}
                </span>
                {a.body ? <p>{a.body}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="adm-card">
        <h2>Langkah Cepat</h2>
        <p className="sub">Tindakan administrasi yang paling sering dipakai staf.</p>
        <div className="adm-announce-list">
          <div className="adm-announce-item">
            <b>Tambah siswa atau guru baru</b>
            <span>Buat akun dengan kata sandi sementara — akun baru menggantinya saat login pertama.</span>
            <p>
              <Link className="link-underline" href="/admin/users">
                Buka manajemen akun →
              </Link>
            </p>
          </div>
          <div className="adm-announce-item">
            <b>Atur kelas dan pengampu</b>
            <span>Pindahkan siswa antar kelas atau tugaskan guru ke mata pelajaran.</span>
            <p>
              <Link className="link-underline" href="/admin/classes">
                Buka manajemen kelas →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
