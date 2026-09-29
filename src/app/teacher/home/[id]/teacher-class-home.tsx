"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { dummyGuruData, type GuruClass } from "@/lib/guru-demo";
import { classAvg, parseIdDate, studentsWithStatus } from "@/lib/guru";
import DashboardShell from "@/components/layout/dashboard-shell";
import { StudentRightbar } from "@/components/layout/rightbar";
import { StatCard } from "@/components/ui/stat-card";
import BodySync from "@/components/body-sync";

/** Renders one class's dashboard; the class comes from the route's id. */
export default function TeacherClassHome({ kelas }: { kelas: GuruClass }) {
  // Prototipe: guard role dimatikan supaya halaman bisa diakses tanpa login
  // sebagai guru. Kembalikan `useRequireUser("teacher")` sebelum production.
  const u = useRequireUser();
  useTitle(`Dashboard ${kelas.kelas} — Grafidu`);

  // The URL is the source of truth here; mirror it to localStorage so the
  // other teacher pages (which read it via useActiveClass) stay in sync.
  useEffect(() => {
    try {
      localStorage.setItem("guru-class", String(kelas.id));
    } catch {}
  }, [kelas.id]);

  if (!u) return null;

  const students = studentsWithStatus(kelas);
  const lowest = students[0];
  const aktif = kelas.tugas.filter((t) => !t.completed).length;

  const byDeadline = [...kelas.tugas].sort(
    (a, b) => parseIdDate(b.deadline).getTime() - parseIdDate(a.deadline).getTime(),
  );
  // Tasks that already have submissions waiting to be graded
  const perluDinilai = byDeadline.filter((t) => t.muridSelesai > 0).slice(0, 3);

  /** Sidebar click already navigates; this only records the choice. */
  function select(next: number) {
    try {
      localStorage.setItem("guru-class", String(next));
    } catch {}
  }

  return (
    <>
      <BodySync dataPage="teacher-home" />
      <DashboardShell
        role="teacher"
        sidebar={{
          user: { name: dummyGuruData.name, sub: dummyGuruData.mapel, avatar: u.avatar },
          tasksToday: [],
          classes: dummyGuruData.dataKelas.map((c) => ({
            id: c.id,
            name: c.kelas,
            total: c.totalMurid,
          })),
          activeClassId: kelas.id,
          onSelectClass: select,
        }}
        activeNav="Home"
        rightbar={
          <StudentRightbar
            grades={
              students.slice(0, 10).map((s) => ({
                subject: s.nama,
                score: s.rata,
                status: s.status,
              })) as never
            }
            announcements={
              kelas.pengumuman.map((p) => ({
                id: p.id,
                title: p.nama,
                body: p.description,
                date: p.date,
              })) as never
            }
            aiNote={`Nilai rata-rata ${lowest?.nama ?? "siswa"} masih paling rendah nih. Saya bakal siapin beberapa kuis tambahan buat bantu dia catch up.`}
            ctaHref="/teacher/quiz"
            ctaLabel="Buat Kuis"
          />
        }
      >
        <div className="profile-head">
          <Image src={u.avatar} alt={dummyGuruData.name} width={96} height={96} />
          <div>
            <div className="profile-name">
              {dummyGuruData.name} <span className="dot"></span>
              <small>{dummyGuruData.mapel}</small>
            </div>
            <div className="profile-sub">
              Kelola kelas, pantau pembelajaran, dan buat pembelajaran yang lebih efektif
            </div>
          </div>
        </div>

        <h2 className="h2">Overview — {kelas.kelas}</h2>
        <div className="stat-grid">
          <StatCard label="Total Tugas" value={kelas.tugas.length} tone="green" />
          <StatCard label="Rata Rata Kelas" value={classAvg(kelas)} tone="blue" />
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
        <div style={{ display: "grid", gap: 12 }}>
          {byDeadline.slice(0, 3).map((t) => (
            <div key={t.id} className="task-row">
              <span className="task-ic">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="5" y="3" width="14" height="18" rx="2.5" />
                  <path d="M9 3.5V2h6v1.5" />
                  <path d="m8.6 12.4 2 2 4-4" />
                </svg>
              </span>
              <span className="info">
                <b>{t.name}</b>
                <span>Tenggat: {t.deadline}</span>
              </span>
              <span
                className="right"
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}
              >
                <b>
                  {t.muridSelesai}/{kelas.totalMurid}
                </b>
                <span className={t.completed ? "pill pill-green-plain" : "pill pill-red"}>
                  {t.completed ? "Selesai" : "Belum Selesai"}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Aktivitas & Perlu Dinilai */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 28 }}>
          <section>
            <div className="sec-row" style={{ marginBottom: 12 }}>
              <h2 className="h2" style={{ margin: 0 }}>
                Aktivitas Terbaru
              </h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {kelas.pengumuman.map((p) => (
                <div key={p.id} className="task-row">
                  <span className="info">
                    <b>{p.nama}</b>
                    <span>{p.date}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="sec-row" style={{ marginBottom: 12 }}>
              <h2 className="h2" style={{ margin: 0 }}>
                Tugas Perlu Dinilai
              </h2>
              <Link href="/teacher/tasks" style={{ fontSize: 13, color: "var(--purple)" }}>
                Lihat Semua
              </Link>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {perluDinilai.map((t) => (
                <div key={t.id} className="task-row">
                  <span className="info">
                    <b>{t.name}</b>
                    <span>{t.muridSelesai} pengumpulan</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DashboardShell>
    </>
  );
}
