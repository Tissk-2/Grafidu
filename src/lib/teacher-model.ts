// Tipe view-model untuk area guru. Modul biasa — aman diimpor client.

export type TeacherClass = {
  id: string;
  name: string;
  kkm: number;
  subject: string;
};

export type TeacherTask = {
  id: string;
  title: string;
  subject: string;
  description: string;
  assignedAt: string;
  dueAt: string;
  isCompleted: boolean;
  total: number;
  submitted: number;
  graded: number;
};

export type RosterRow = {
  id: string;
  name: string;
  avatar: string;
  gradeCount: number;
  avg: number;
  tuntas: boolean;
};

export type MaterialRow = {
  id: string;
  title: string;
  description: string;
  attachments: string[];
  status: string; // "published" | "draft"
  views: number;
  createdAt: string;
};

export type TaskDetail = {
  id: string;
  title: string;
  description: string;
  subject: string;
  assignedAt: string;
  dueAt: string;
  isCompleted: boolean;
  material: { id: string; title: string; url: string | null } | null;
};

export type SubmissionRow = {
  id: string | null; // id task_statuses — null saat siswa belum punya baris status
  studentId: string;
  name: string;
  avatar: string;
  done: boolean;
  submittedAt: string | null;
  grade: number | null;
  feedback: string;
  answer: string;
  attachmentUrl: string | null;
};

export type TaskInput = {
  title: string;
  description: string;
  subject: string;
  dueAt: string; // ISO
  materialId?: string | null; // materi terkait dari halaman Materi
};

export type QuizQuestion = {
  text: string;
  options: string[]; // pilihan ganda; panjang bebas (umumnya 4)
  answerIdx: number; // indeks jawaban benar (0-based) — hanya untuk guru
};

export type QuizRow = {
  id: string;
  title: string;
  topic: string;
  subject: string;
  difficulty: string;
  numQuestions: number;
  durationMin: number;
  status: string; // "draft" | "published"
  createdAt: string;
  questions: QuizQuestion[];
  attempts: number; // berapa siswa yang sudah mengerjakan
};
