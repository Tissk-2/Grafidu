"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRequireUser, type SessionUser } from "@/lib/auth";
import {
  fetchTasksToday,
  fetchSubjectScores,
  fetchAnnouncements,
  fetchClassTeachers,
  avgOf,
  type SidebarTask,
  type SubjectScore,
  type AnnouncementItem,
  type ClassTeacher,
} from "@/lib/supabase/queries";
import { useTitle } from "@/lib/hooks";
import DashboardShell from "@/components/layout/dashboard-shell";
import { StudentRightbar } from "@/components/layout/rightbar";
import { StatCard } from "@/components/ui/stat-card";
import StudentClassSearch from "@/components/client/student-class-search";
import BodySync from "@/components/body-sync";
import type { GradeRow } from "@/components/layout/rightbar";

type HomeData = {
  tasksToday: SidebarTask[];
  grades: GradeRow[];
  avg: number;
  announcements: AnnouncementItem[];
  aiNote: string;
  classes: ClassTeacher[];
  done: number;
  total: number;
};

async function loadHome(u: SessionUser): Promise<HomeData> {
  const [tasksToday, scores, announcements, classes] = await Promise.all([
    fetchTasksToday(u),
    fetchSubjectScores(u.id),
    fetchAnnouncements(3),
    fetchClassTeachers(u.className),
  ]);
  const done = tasksToday.filter((t) => t.done).length;
  return {
    tasksToday,
    grades: scores.map((s: SubjectScore) => ({
      subject: s.subject,
      score: s.score,
      status: s.status,
    })),
    avg: avgOf(scores),
    announcements,
    aiNote:
      scores.length === 0
        ? "Data nilai belum tersedia. Minta gurumu mengisi nilai agar rekomendasi muncul."
        : (() => {
            const lowest = [...scores].sort((a, b) => a.score - b.score)[0];
            return lowest.score < 70
              ? `Fokuskan pembelajaranmu ke ${lowest.subject} dan lanjutkan mempertahankan mapel lainnya.`
              : "Semua nilai dalam kondisi aman. Pertahankan!";
          })(),
    classes,
    done,
    total: tasksToday.length,
  };
}

export default function StudentHomePage() {
  const u = useRequireUser("student");
  const [data, setData] = useState<HomeData | null>(null);
  useTitle("Dashboard Siswa — Grafidu");

  useEffect(() => {
    if (!u) return;
    let cancelled = false;
    loadHome(u).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [u]);

  if (!u || !data) return null;

  const pct = data.total ? Math.round((data.done / data.total) * 100) : 0;
  const subHead = `${data.classes.length} Kelas Terjadwal | ${data.total - data.done} Tugas Belum Terkerjakan | ${data.done} Tugas Telah Selesai`;

  return (
    <>
      <BodySync dataPage="student-home" />
      <DashboardShell
        role="student"
        sidebar={{
          user: { name: u.name, sub: u.className ?? "Siswa", avatar: u.avatar },
          tasksToday: data.tasksToday,
        }}
        activeNav="Home"
        rightbar={
          <StudentRightbar
            grades={data.grades}
            announcements={data.announcements}
            aiNote={data.aiNote}
            ctaHref="/student/todo"
            ctaLabel="Buat To-Do List"
          />
        }
      >
        <div className="profile-head">
          <Image src={u.avatar} alt={u.name} width={96} height={96} />
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
          <StatCard label="Rata-rata Nilai" value={data.avg} tone="blue" />
          <StatCard label="Tugas Baru" value={Math.max(0, data.total - data.done)} tone="purple" />
        </div>

        <h2 className="h2">Kelas</h2>
        <StudentClassSearch classes={data.classes} />
      </DashboardShell>
    </>
  );
}
