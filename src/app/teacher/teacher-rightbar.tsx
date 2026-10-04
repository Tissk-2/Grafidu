"use client";

import { useTeacherShellData } from "./teacher-shell-data";
import { studentsWithStatus } from "@/lib/guru";
import { StudentRightbar } from "@/components/layout/rightbar";

/** Fallback sebelum data kelas termuat — lalu digantikan shell (fallback lokal → AI asli). */
const LOADING_NOTE =
  "Nilai rata-rata siswa masih paling rendah nih. Saya bakal siapin beberapa kuis tambahan buat bantu dia catch up.";

/**
 * Class-derived rightbar shared by every teacher page. Data dari shell
 * context (roster + pengumuman live), bukan lagi dummy class — tetap ikut
 * berubah saat kelas aktif berganti tanpa remount.
 */
export default function TeacherRightbarSlot() {
  const { roster, announcements, aiNote } = useTeacherShellData();
  const students = studentsWithStatus(roster);

  return (
    <StudentRightbar
      grades={
        students.slice(0, 10).map((s) => ({
          subject: s.nama,
          score: s.rata,
          status: s.status,
        })) as never
      }
      announcements={
        announcements.map((a, i) => ({
          id: String(i),
          title: a.title,
          body: a.body,
          date: a.when,
        })) as never
      }
      gradesHref="/teacher/grades"
      announcementsHref="/teacher/announcements"
      aiNote={aiNote || LOADING_NOTE}
      ctaHref="/teacher/quiz-maker"
      ctaLabel="Buat Kuis"
    />
  );
}
