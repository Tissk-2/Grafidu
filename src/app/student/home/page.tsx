"use client";

import { useEffect, useState } from "react";
import { useRequireUser } from "@/lib/auth";
import { fetchClassTeachers } from "@/app/actions/student";
import type { ClassTeacher } from "@/lib/student-model";
import { useTitle } from "@/lib/hooks";
import { StatCard } from "@/components/ui/stat-card";
import StudentHomeSkeleton from "@/components/ui/student-home-skeleton";
import StudentClassSearch from "@/components/client/student-class-search";
import BodySync from "@/components/body-sync";
import { useStudentShellData } from "../student-shell-data";

/** Middle column only — the sidebar and rightbar come from the student layout. */
export default function StudentHomePage() {
  const u = useRequireUser("student");
  // tasksToday and the subject average are already loaded by the shell for the
  // sidebar and rightbar, so they are shared here rather than re-queried.
  const shell = useStudentShellData();
  const [classes, setClasses] = useState<ClassTeacher[] | null>(null);
  useTitle("Dashboard Siswa — Grafidu");

  useEffect(() => {
    if (!u) return;
    let cancelled = false;
    fetchClassTeachers().then((c) => {
      if (!cancelled) setClasses(c);
    });
    return () => {
      cancelled = true;
    };
  }, [u]);

  // The shell (sidebar + rightbar) comes from the student layout and is already
  // rendered, so these waits only affect the middle column — and even that shows
  // a skeleton rather than nothing.
  if (!u || !shell || !classes) return <StudentHomeSkeleton />;

  const total = shell.tasksToday.length;
  const done = shell.tasksToday.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const subHead = `${classes.length} Kelas Terjadwal | ${total - done} Tugas Belum Terkerjakan | ${done} Tugas Telah Selesai`;

  return (
    <>
      <BodySync dataPage="student-home" />
      <div className="profile-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={u.avatar} alt={u.name} width={96} height={96} />
        <div>
          <div className="profile-name">
            {u.name} <span className="dot"></span>
            <small>{u.className}</small>
          </div>
          <div className="profile-sub">{subHead}</div>
        </div>
      </div>

      <h2 className="h2">Overview</h2>
      <div className="stat-grid">
        <StatCard label="Tugas Selesai" value={pct} tone="green" />
        <StatCard label="Rata-rata Nilai" value={shell.avg} tone="blue" />
        <StatCard label="Tugas Baru" value={Math.max(0, total - done)} tone="purple" />
      </div>

      <h2 className="h2">Kelas</h2>
      <StudentClassSearch classes={classes} />
    </>
  );
}
