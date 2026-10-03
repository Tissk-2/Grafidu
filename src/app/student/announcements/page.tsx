"use client";

import AnnouncementsView from "@/components/client/announcements-view";
import BodySync from "@/components/body-sync";

/** Middle column only — the sidebar and rightbar come from the student layout. */
export default function StudentAnnouncementsPage() {
  return (
    <>
      <BodySync dataPage="student-announcements" />
      <AnnouncementsView />
    </>
  );
}
