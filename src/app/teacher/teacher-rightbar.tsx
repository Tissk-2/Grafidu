"use client";

import { useTeacherShellData } from "./teacher-shell-data";
import { studentsWithStatus } from "@/lib/guru";
import { StudentRightbar } from "@/components/layout/rightbar";

/**
 * Class-derived rightbar shared by every teacher page. Data dari shell
 * context (roster + pengumuman live), bukan lagi dummy class — tetap ikut
 * berubah saat kelas aktif berganti tanpa remount.
 */
export default function TeacherRightbarSlot() {
  const { roster, announcements } = useTeacherShellData();
  const students = studentsWithStatus(roster);
  const lowest = students[0];

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
      aiNote={`Nilai rata-rata ${lowest?.nama ?? "siswa"} masih paling rendah nih. Saya bakal siapin beberapa kuis tambahan buat bantu dia catch up.`}
      ctaHref="/teacher/quiz-maker"
      ctaLabel="Buat Kuis"
    />
  );
}
