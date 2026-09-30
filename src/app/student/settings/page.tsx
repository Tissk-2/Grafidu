"use client";

import { useTitle } from "@/lib/hooks";
import { useRequireUser } from "@/lib/auth";
import MainSkeleton from "@/components/ui/main-skeleton";
import SettingsForm from "@/components/client/settings-form";
import BodySync from "@/components/body-sync";

/** Middle column only — the sidebar and rightbar come from the student layout. */
export default function StudentSettingsPage() {
  const u = useRequireUser("student");
  useTitle("Pengaturan Profil — Grafidu");

  // The shell (sidebar + rightbar) comes from the student layout and is already
  // rendered, so waiting on the session only ever affects the middle column —
  // and even that shows a skeleton rather than nothing.
  if (!u) return <MainSkeleton />;

  return (
    <>
      <BodySync dataPage="student-settings" />
      <h1 className="page-title">Pengaturan Profil</h1>
      <p className="page-sub">Kelola informasi akun, keamanan, dan preferensi notifikasi Anda.</p>
      <SettingsForm initialUser={u} />
    </>
  );
}
