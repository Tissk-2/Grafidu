"use client";

import { useRoutedClass, studentsWithStatus } from "@/lib/guru";
import { StudentRightbar } from "@/components/layout/rightbar";

/**
 * Class-derived rightbar shared by every teacher page. Reads the routed class
 * itself, so it re-renders on navigation through the router context even though
 * the layout mounting it does not — it stays in place, only the data changes.
 */
export default function TeacherRightbarSlot() {
  const { kelas } = useRoutedClass();
  const students = studentsWithStatus(kelas);
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
        kelas.pengumuman.map((p) => ({
          id: p.id,
          title: p.nama,
          body: p.description,
          date: p.date,
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
