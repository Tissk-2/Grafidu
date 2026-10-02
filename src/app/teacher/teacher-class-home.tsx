"use client";

import Image from "next/image";
import Link from "next/link";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { classAvg, useRoutedClass } from "@/lib/guru";
import { useTeacherShellData } from "./teacher-shell-data";
import { fmtDate } from "@/lib/format";
import { StatCard } from "@/components/ui/stat-card";
import MainSkeleton from "@/components/ui/main-skeleton";
import TaskCard from "@/components/ui/task-card";
import BottomCards from "./teacher-bottom-cards";
import BodySync from "@/components/body-sync";

/**
 * Kolom tengah dashboard. Sidebar dan rightbar tinggal di
 * `src/app/teacher/layout.tsx`, jadi ganti kelas atau halaman hanya merender
 * ulang komponen ini — shell tetap terpasang dan datanya bertukar di tempat.
 * Semua data live dari database (tasks, roster, pengumuman) lewat shell context.
 */
export default function TeacherClassHome() {
  const u = useRequireUser("teacher");
  const { kelas } = useRoutedClass();
  const { tasks, roster, announcements, classes, classTotals, classesLoading } =
    useTeacherShellData();

  useTitle(`Dashboard ${kelas?.name ?? "Kelas"} — Grafidu`);

  // useRequireUser null saat session resolve; kelas null saat kelas pertama
  // belum ter-load — skeleton, bukan kosong. Tapi begitu daftar kelas selesai
  // diambil dan kosong, guru memang belum mengampu kelas apa pun — tampilkan
  // empty state, bukan skeleton yang tidak pernah selesai.
  if (!u || classesLoading || (!kelas && classes.length > 0)) return <MainSkeleton />;

  if (!kelas) {
    return (
      <div className="empty-state mt-10 block">
        <b>Belum mengampu kelas</b>
        <span>
          Akun ini belum terdaftar sebagai pengampu kelas mana pun. Klik tombol + di panel
          “Kelas yang diampu” pada sidebar untuk membuat kelas baru.
        </span>
      </div>
    );
  }

  const aktif = tasks.filter((t) => !t.isCompleted).length;

  const byDeadline = [...tasks].sort(
    (a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime(),
  );
  // Tugas yang sudah ada pengumpulan menunggu penilaian
  const perluDinilai = byDeadline.filter((t) => t.submitted > 0).slice(0, 3);

  // Mapel tampil di bawah nama — gabungan unik mapel yang diampu.
  const mapel = [...new Set(classes.map((c) => c.subject).filter(Boolean))].join(" • ");

  return (
    <>
      <BodySync dataPage="teacher-home" />
      <div className="profile-head">
        <Image src={u.avatar} alt={u.name} width={96} height={96} />
        <div>
          <div className="profile-name">
            {u.name} <span className="dot"></span>
            <small>{mapel}</small>
          </div>
          <div className="profile-sub">
            Kelola kelas, pantau pembelajaran, dan buat pembelajaran yang lebih efektif
          </div>
        </div>
      </div>

      <h2 className="h2">Overview — {kelas.name}</h2>
      <div className="stat-grid">
        <StatCard label="Total Tugas" value={tasks.length} tone="green" />
        <StatCard label="Rata Rata Kelas" value={classAvg(roster)} tone="blue" />
        <StatCard label="Tugas Aktif" value={aktif} tone="purple" />
      </div>

      {/* List Tugas */}
      <div className="sec-row" style={{ marginTop: 28, marginBottom: 14 }}>
        <h2 className="h2" style={{ margin: 0 }}>
          List Tugas
        </h2>
        <Link href="/teacher/tasks" style={{ fontSize: 13, color: "var(--purple)" }}>
          Lihat Semua
        </Link>
      </div>
      <ul className="grid gap-2.5">
        {byDeadline.slice(0, 3).map((t) => (
          <li key={t.id}>
            <TaskCard
              task={{
                id: t.id,
                name: t.title,
                ditugaskan: fmtDate(t.assignedAt),
                deadline: fmtDate(t.dueAt),
                completed: t.isCompleted,
                muridSelesai: t.submitted,
              }}
              total={classTotals[kelas.id] ?? 0}
            />
          </li>
        ))}
      </ul>

      {/* Aktivitas & Perlu Dinilai */}
      <BottomCards pengumuman={announcements} perluDinilai={perluDinilai} />
    </>
  );
}
