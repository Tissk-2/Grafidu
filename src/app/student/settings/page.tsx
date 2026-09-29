"use client";

import { useEffect, useState } from "react";
import { useRequireUser, type SessionUser } from "@/lib/auth";
import {
  fetchTasksToday,
  fetchSubjectScores,
  aiNoteFromScores,
  type SidebarTask,
} from "@/lib/supabase/queries";
import { useTitle } from "@/lib/hooks";
import DashboardShell from "@/components/layout/dashboard-shell";
import { StudentRightbar, type GradeRow } from "@/components/layout/rightbar";
import SettingsForm from "@/components/client/settings-form";
import BodySync from "@/components/body-sync";

type SettingsPageData = {
  tasksToday: SidebarTask[];
  grades: GradeRow[];
  aiNote: string;
};

async function loadSettingsPage(u: SessionUser): Promise<SettingsPageData> {
  const [tasksToday, scores] = await Promise.all([
    fetchTasksToday(u),
    fetchSubjectScores(u.id),
  ]);
  return {
    tasksToday,
    grades: scores.map((s) => ({ subject: s.subject, score: s.score, status: s.status })),
    aiNote: aiNoteFromScores(scores),
  };
}

export default function StudentSettingsPage() {
  const u = useRequireUser("student");
  const [data, setData] = useState<SettingsPageData | null>(null);
  useTitle("Pengaturan Profil — Grafidu");

  useEffect(() => {
    if (!u) return;
    let cancelled = false;
    loadSettingsPage(u).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [u]);

  if (!u || !data) return null;

  return (
    <>
      <BodySync dataPage="student-settings" />
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
            aiNote={data.aiNote}
            ctaHref="/student/todo"
            ctaLabel="Buat To-Do List"
          />
        }
      >
        <h1 className="page-title">Pengaturan Profil</h1>
        <p className="page-sub">Kelola informasi akun, keamanan, dan preferensi notifikasi Anda.</p>
        <SettingsForm initialUser={u} />
      </DashboardShell>
    </>
  );
}
