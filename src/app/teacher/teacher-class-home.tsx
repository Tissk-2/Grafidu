"use client";

import Image from "next/image";
import Link from "next/link";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { dummyGuruData } from "@/lib/guru-demo";
import { classAvg, parseIdDate, useRoutedClass } from "@/lib/guru";
import { StatCard } from "@/components/ui/stat-card";
import MainSkeleton from "@/components/ui/main-skeleton";
import TaskCard from "@/components/ui/task-card";
import BottomCards from "./teacher-bottom-cards";
import BodySync from "@/components/body-sync";

/**
 * The dashboard's middle column. The sidebar and rightbar live in
 * `src/app/teacher/layout.tsx`, so switching class or page re-renders only
 * this component — the shell stays mounted and the data just swaps in place.
 */
export default function TeacherClassHome() {
  const u = useRequireUser("teacher");
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
      <ul className="grid gap-2.5">
        {byDeadline.slice(0, 3).map((t) => (
          <li key={t.id}>
            <TaskCard task={t} total={kelas.totalMurid} />
          </li>
        ))}
      </ul>

      {/* Aktivitas & Perlu Dinilai */}
      <BottomCards pengumuman={kelas.pengumuman} perluDinilai={perluDinilai} />
    </>
  );
}
