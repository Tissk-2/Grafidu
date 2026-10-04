// Tipe view-model + helper murni untuk area siswa (dan beberapa halaman guru).
// Modul biasa (bukan "use server") — aman diimpor dari client components.

// Semua tipe memakai id string (uuid).

export type SidebarTask = { id: string; title: string; sub: string; done: boolean };

export type SubjectScore = {
  subject: string;
  score: number;
  trend: 1 | -1;
  status: "Atas Rata Rata" | "Bawah Rata Rata";
};

export type StudentMaterial = {
  id: string;
  title: string;
  description: string;
  attachments: string[];
  teacherName: string;
  views: number;
  createdAt: string;
};

export type AnnouncementItem = { title: string; body: string; when: string; hl: boolean; author: string };

export type TeacherAnnouncement = {
  id: string;
  title: string;
  body: string;
  when: string;
  date: string;
  className: string | null;
  mine: boolean;
  author: string;
};

export type TodoItem = { id: string; title: string; subtitle: string; done: boolean };

export type SchoolTask = {
  id: string;
  title: string;
  subject: string;
  dueAt: string;
  done: boolean;
  grade: number | null;
};

export type TaskDetail = {
  id: string;
  title: string;
  description: string;
  subject: string;
  assignedAt: string;
  dueAt: string;
  creatorName: string;
  material: { id: string; title: string; url: string | null } | null;
};

export type TaskStatus = {
  done: boolean;
  submittedAt: string | null;
  grade: number | null;
  feedback: string;
  attachmentUrl: string | null;
};

export type ClassTeacher = { teacher: string; subject: string; avatar: string };

export type AnnouncementPageItem = { title: string; body: string; when: string; date: string; author: string };

// ---------------------------------------------------------------------------
// Kuis siswa
// ---------------------------------------------------------------------------

/** Soal untuk pemain kuis — TANPA kunci jawaban (kunci hanya dinilai di server). */
export type PlayQuestion = { text: string; options: string[] };

/** Satu butir review setelah pengumpulan: pilihan siswa vs kunci jawaban. */
export type ReviewQuestion = PlayQuestion & { chosen: number | null; answerIdx: number };

export type StudentQuiz = {
  id: string;
  title: string;
  topic: string;
  subject: string;
  difficulty: string;
  numQuestions: number;
  durationMin: number;
  createdAt: string;
  /** null = belum dikerjakan; else hasil percobaan (satu percobaan per kuis). */
  attempt: { score: number; submittedAt: string } | null;
};

export type QuizPlayData = {
  id: string;
  title: string;
  topic: string;
  subject: string;
  difficulty: string;
  durationMin: number;
  teacherName: string;
  questions: PlayQuestion[];
  /** Sudah dikerjakan → tampilkan hasil, blok pengerjaan ulang. */
  attempt: {
    score: number;
    submittedAt: string;
    answers: (number | null)[];
    review: ReviewQuestion[];
  } | null;
};

export function pill(score: number): "Atas Rata Rata" | "Bawah Rata Rata" {
  return score >= 70 ? "Atas Rata Rata" : "Bawah Rata Rata";
}

/** Label relatif ala "Kemarin" / "3 Hari lalu" dari created_at. */
export function relativeWhen(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays <= 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  return `${diffDays} Hari lalu`;
}

export function avgOf(scores: SubjectScore[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length);
}

/** Catatan AI sederhana yang diturunkan dari data nilai asli. */
export function aiNoteFromScores(scores: SubjectScore[]): string {
  if (scores.length === 0) return "Data nilai belum tersedia. Minta gurumu mengisi nilai agar rekomendasi muncul.";
  const lowest = [...scores].sort((a, b) => a.score - b.score)[0];
  if (lowest.score < 70)
    return `Fokuskan pembelajaranmu ke ${lowest.subject} dan lanjutkan mempertahankan mapel lainnya.`;
  return "Semua nilai dalam kondisi aman. Pertahankan!";
}
