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
import type { GradeRow } from "@/components/layout/rightbar";
import PageSkeleton from "@/components/ui/page-skeleton";
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
  // Prototipe: guard role dimatikan supaya halaman bisa diakses tanpa login
  // sebagai guru. Kembalikan `useRequireUser("teacher")` sebelum production.
  const u = useRequireUser();
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

  // The shell (sidebar + rightbar) comes from the teacher layout, so waiting on
  // the session and the Supabase query only blanks the middle column — and even
  // that shows a skeleton rather than nothing.
  if (!u || !data) return <PageSkeleton />;

  return (
    <>
      <BodySync dataPage="student-settings" />
      <h1 className="page-title">Pengaturan Profil</h1>
      <p className="page-sub">Kelola informasi akun, keamanan, dan preferensi notifikasi Anda.</p>
      <SettingsForm initialUser={u} />
    </>
  );
}
