"use client";

import AnnouncementsView from "@/components/client/announcements-view";
import BodySync from "@/components/body-sync";

/**
 * Middle column only — the sidebar and rightbar come from the teacher layout.
 * Tujuan link "Lihat Semua" pengumuman di rightbar saat login sebagai guru.
 */
export default function TeacherAnnouncementsPage() {
  return (
    <>
      <BodySync dataPage="teacher-announcements" />
      <AnnouncementsView />
    </>
  );
}
