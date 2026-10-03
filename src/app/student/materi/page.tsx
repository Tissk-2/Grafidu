"use client";

import StudentMateriView from "@/components/client/student-materi-view";
import BodySync from "@/components/body-sync";

/**
 * Middle column only — the sidebar and rightbar come from the student layout.
 * Tujuan: siswa membaca materi yang diterbitkan guru kelasmu (/teacher/materi).
 */
export default function StudentMateriPage() {
  return (
    <>
      <BodySync dataPage="student-materi" />
      <StudentMateriView />
    </>
  );
}
