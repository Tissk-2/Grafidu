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
};

export type SubmissionRow = {
  id: string;
  studentId: string;
  name: string;
  avatar: string;
  done: boolean;
  submittedAt: string | null;
  grade: number | null;
  feedback: string;
};

export type TaskInput = {
  title: string;
  description: string;
  subject: string;
  dueAt: string; // ISO
};

export type QuizRow = {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  numQuestions: number;
  durationMin: number;
  status: string; // "draft" | "published"
  createdAt: string;
  questions: string[];
};
