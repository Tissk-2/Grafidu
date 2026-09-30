"use client";

import Image from "next/image";
import Link from "next/link";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { dummyGuruData } from "@/lib/guru-demo";
import { classAvg, parseIdDate, useRoutedClass } from "@/lib/guru";
import { StatCard } from "@/components/ui/stat-card";
import MainSkeleton from "@/components/ui/main-skeleton";
import BodySync from "@/components/body-sync";

/**
 * The dashboard's middle column. The sidebar and rightbar live in
 * `src/app/teacher/layout.tsx`, so switching class or page re-renders only
 * this component — the shell stays mounted and the data just swaps in place.
 */
export default function TeacherClassHome() {
  // Prototipe: guard role dimatikan supaya halaman bisa diakses tanpa login
  // sebagai guru. Kembalikan `useRequireUser("teacher")` sebelum production.
  const u = useRequireUser();
  const { kelas } = useRoutedClass();

  useTitle(`Dashboard ${kelas.kelas} — Grafidu`);

  // useRequireUser returns null while the session resolves. The routed class is
  // always defined, so this is only ever the auth wait — skeleton, not blank.
  if (!u) return <MainSkeleton />;

  const aktif = kelas.tugas.filter((t) => !t.completed).length;

  const byDeadline = [...kelas.tugas].sort(
    (a, b) => parseIdDate(b.deadline).getTime() - parseIdDate(a.deadline).getTime(),
  );
  // Tasks that already have submissions waiting to be graded
  const perluDinilai = byDeadline.filter((t) => t.muridSelesai > 0).slice(0, 3);

  return (
    <>
      <BodySync dataPage="teacher-home" />
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
    </>
  );
}
