"use client";

import TeacherAnnouncementsManager from "@/components/client/teacher-announcements-manager";
import BodySync from "@/components/body-sync";

/**
 * Middle column only — the sidebar and rightbar come from the teacher layout.
 * Halaman milik guru: komposer pengumuman kelas + daftar dengan hapus.
 */
export default function TeacherAnnouncementsPage() {
  return (
    <>
      <BodySync dataPage="teacher-announcements" />
      <TeacherAnnouncementsManager />
    </>
  );
}
