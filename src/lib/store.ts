"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * In-browser data layer. Everything — demo users, classes, tasks, grades, the
 * session — is seeded into memory on every page load and resets on refresh.
 * All dates are ISO strings.
 */

export type Role = "student" | "teacher";

export type User = {
  id: number;
  role: Role;
  name: string;
  email: string;
  password: string;
  className: string | null;
  subject: string | null;
  avatar: string;
  phone: string;
  prefs: string;
  /** Admin-account fields: absent means active / no forced password change. */
  isActive?: boolean;
  mustChangePassword?: boolean;
};

export type ClassRoom = { id: number; name: string };
export type Enrollment = { classId: number; studentId: number };
export type Teaching = { classId: number; teacherId: number; subject: string };

export type Task = {
  id: number;
  classId: number;
  createdBy: number;
  title: string;
  description: string;
  subject: string;
  assignedAt: string;
  dueAt: string;
};

export type TaskStatus = {
  id: number;
  taskId: number;
  studentId: number;
  done: boolean;
  submittedAt: string | null;
  grade: number | null;
  feedback: string;
};

export type Grade = {
  id: number;
  studentId: number;
  subject: string;
  kind: string;
  score: number;
  gradeDate: string;
};

export type Quiz = {
  id: number;
  classId: number;
  createdBy: number;
  title: string;
  topic: string;
  difficulty: string;
  numQuestions: number;
  durationMin: number;
  status: "draft" | "tayang";
  createdAt: string;
};

export type QuizQuestion = { id: number; quizId: number; idx: number; text: string };

export type Material = {
  id: number;
  teacherId: number;
  classId: number;
  title: string;
  pages: number;
  status: "draft" | "tayang";
  views: number;
  createdAt: string;
};

export type Announcement = {
  id: number;
  title: string;
  body: string;
  createdBy: number | null;
  createdLabel: string;
  createdAt: string;
};

export type ChatMessage = {
  id: number;
  userId: number;
  role: "user" | "ai";
  text: string;
  createdAt: string;
};

export type Todo = {
  id: number;
  userId: number;
  title: string;
  subtitle: string;
  done: boolean;
  createdAt: string;
};

export type AiAction = {
  id: number;
  userId: number;
  tool: string;
  payload: string;
  status: "pending" | "executed" | "declined" | "failed";
  result: string;
  createdAt: string;
  resolvedAt: string | null;
};

export type Subscriber = { id: number; email: string; createdAt: string };

export type DB = {
  users: User[];
  classes: ClassRoom[];
  enrollments: Enrollment[];
  teachings: Teaching[];
  tasks: Task[];
  taskStatuses: TaskStatus[];
  grades: Grade[];
  quizzes: Quiz[];
  quizQuestions: QuizQuestion[];
  materials: Material[];
  announcements: Announcement[];
  chatMessages: ChatMessage[];
  todos: Todo[];
  aiActions: AiAction[];
  subscribers: Subscriber[];
  nextId: number;
  sessionUserId: number | null;
};

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function iso(d: Date): string {
  return d.toISOString();
}

function daysAgo(n: number): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - n);
  return iso(dt);
}

function nextId(db: DB): number {
  return db.nextId++;
}

export function insertUser(db: DB, u: Omit<User, "id">): User {
  const user = { ...u, id: nextId(db) };
  db.users.push(user);
  return user;
}

// ---------------------------------------------------------------------------
// Seed data — matches the numbers used throughout the Figma design.
// ---------------------------------------------------------------------------

const DEMO_PASSWORD = "grafidu123";

const SUBJECTS = [
  ["Matematika", 80],
  ["Bahasa Inggris", 90],
  ["Bahasa Indonesia", 78],
  ["Fisika", 72],
  ["Kimia", 85],
  ["Biologi", 69],
  ["Sejarah", 76],
  ["Geografi", 74],
  ["Informatika", 95],
  ["Seni Budaya", 65],
] as const;

const STUDENTS = [
  ["Adam Saputra", "XI RPL A", 80, "/assets/bu-septi.png"],
  ["Andrew Toby", "XI RPL A", 90, "/assets/mr-windah.png"],
  ["Arfan Dwinarta", "XI RPL A", 98, "/assets/pak-arfan.png"],
  ["Bima Sakti", "XI RPL A", 72, "/assets/mr-windah.png"],
  ["Eka Wulandari", "XI RPL A", 85, "/assets/pak-arfan.png"],
  ["Gatot Kaca", "XI RPL A", 69, "/assets/bu-citra.png"],
  ["Prabima", "XI RPL B", 76, "/assets/pak-raka.png"],
  ["Farid Diva", "XI RPL B", 74, "/assets/bu-citra.png"],
  ["Gibran Rakabumi", "XI RPL B", 95, "/assets/pak-raka.png"],
  ["Joko Prabumi", "XI RPL B", 29, "/assets/mr-windah.png"],
  ["Sari Ramadhani", "XI RPL C", 88, "/assets/bu-dewi.png"],
  ["Dika Prasetyo", "XI RPL C", 81, "/assets/pak-arfan.png"],
  ["Laras Ayu", "XI RPL C", 66, "/assets/bu-septi.png"],
  ["Naufal Hidayat", "XI RPL C", 79, "/assets/pak-raka.png"],
] as const;

const TEACHERS = [
  ["Bu Septi Retno", "septi.retno", "Matematika", "/assets/bu-septi.png"],
  ["Mr Windah Class", "windah.class", "Informatika", "/assets/mr-windah.png"],
  ["Pak Arfan Dwinarta", "arfan.dwinarta", "Fisika", "/assets/pak-arfan.png"],
  ["Bu Dewi Lestari", "budewi.lestari", "Bahasa Indonesia", "/assets/budewi-side.png"],
  ["Bu Citra Melati", "citra.melati", "Seni Budaya", "/assets/bu-citra.png"],
  ["Pak Raka Nugraha", "raka.nugraha", "Matematika", "/assets/pak-raka.png"],
] as const;

const TASKS_DEWI = [
  {
    title: "Menulis Teks Eksposisi",
    due: "2026-09-10",
    assigned: "2026-08-20",
    desc: "Siswa membuat teks eksposisi tentang isu lingkungan di sekitar sekolah. Teks harus memuat tesis, rangkaian argumen, dan penegasan ulang. Kumpulkan dalam format .pdf, minimal 400 kata.",
  },
  {
    title: "Analisis Unsur Intrinsik Cerpen",
    due: "2026-08-12",
    assigned: "2026-07-29",
    desc: "Analisislah unsur intrinsik cerpen \"Kisah di Sekolah\": tokoh, penokohan, latar, konflik, dan amanat. Tulis dalam 2 halaman.",
  },
  {
    title: "Membuat Teks Pidato Persuasif",
    due: "2026-08-24",
    assigned: "2026-08-10",
    desc: "Siswa membuat teks pidato persuasif dengan tema bebas yang berkaitan dengan isu lingkungan di sekitar sekolah. Pidato harus memuat struktur pembuka, isi, dan penutup, serta minimal tiga argumen yang didukung data atau fakta. Kumpulkan dalam format .pdf atau .docx, minimal 400 kata.",
  },
  {
    title: "Membuat Resensi Buku",
    due: "2026-08-01",
    assigned: "2026-07-18",
    desc: "Pilih satu buku fiksi atau nonfiksi yang baru kamu baca, lalu tulis resensi lengkap: identitas buku, sinopsis, kelebihan, kekurangan, dan rekomendasi.",
  },
] as const;

const QUIZ_PREVIEWS: Record<string, string[]> = {
  "Teks Eksposisi": [
    "Apa yang dimaksud dengan teks eksposisi?",
    "Sebutkan tiga struktur pokok teks eksposisi.",
    "Tentukan gagasan pokok paragraf berikut.",
  ],
  "Unsur Intrinsik Cerpen": [
    "Apa yang dimaksud dengan tokoh dan penokohan dalam cerpen?",
    "Tentukan latar cerita dari kutipan berikut.",
    "Jelaskan konflik yang terjadi dalam cerpen tersebut.",
  ],
  "Teks Pidato Persuasif": [
    "Apa ciri-ciri kebahasaan teks pidato persuasif?",
    "Tentukan struktur pembuka dari pidato berikut.",
    "Makna kata \"persuasif\" paling tepat adalah...",
  ],
};

function buildSeed(): DB {
  const db: DB = {
    users: [],
    classes: [],
    enrollments: [],
    teachings: [],
    tasks: [],
    taskStatuses: [],
    grades: [],
    quizzes: [],
    quizQuestions: [],
    materials: [],
    announcements: [],
    chatMessages: [],
    todos: [],
    aiActions: [],
    subscribers: [],
    nextId: 1,
    sessionUserId: null,
  };

  const classes = new Map<string, number>();
  for (const name of ["XI RPL A", "XI RPL B", "XI RPL C"]) {
    const c = { id: nextId(db), name };
    db.classes.push(c);
    classes.set(name, c.id);
  }

  const teacherIds = new Map<string, number>();
  for (const [name, slug, subject, avatar] of TEACHERS) {
    const u = insertUser(db, {
      role: "teacher",
      name,
      email: `${slug}@grafidu.sch.id`,
      password: DEMO_PASSWORD,
      subject,
      avatar,
      className: null,
      phone: "+62 812-3456-7890",
      prefs: "{}",
    });
    teacherIds.set(name, u.id);
  }
  const dewi = teacherIds.get("Bu Dewi Lestari")!;

  const jessie = insertUser(db, {
    role: "student",
    name: "Jessie Cooper",
    email: "jessie.cooper@grafidu.sch.id",
    password: DEMO_PASSWORD,
    className: "XI RPL B",
    avatar: "/assets/jessie-side.png",
    subject: null,
    phone: "+62 812-3456-7890",
    prefs: '{"task":true,"deadline":true,"ai":false,"email":false}',
  });

  const offsets = [3, -2, 5, -4, 2];
  const studentIds = new Map<string, number>();
  studentIds.set("Jessie Cooper", jessie.id);

  for (const [name, klass, avg, avatar] of STUDENTS) {
    const suffix = { "XI RPL A": "a", "XI RPL B": "b", "XI RPL C": "c" }[klass];
    const email = `${name.toLowerCase().replace(/ /g, ".")}.${suffix}@grafidu.sch.id`;
    const u = insertUser(db, {
      role: "student",
      name,
      email,
      password: DEMO_PASSWORD,
      className: klass,
      avatar,
      subject: null,
      phone: "",
      prefs: "{}",
    });
    studentIds.set(name, u.id);
    for (let i = 0; i < SUBJECTS.length; i++) {
      const [subj] = SUBJECTS[i];
      const score = Math.max(25, Math.min(100, avg + offsets[i % offsets.length]));
      const delta = offsets[i % offsets.length];
      const earlier = Math.max(20, score - delta);
      db.grades.push({
        id: nextId(db),
        studentId: u.id,
        subject: subj,
        kind: "Ulangan",
        score: earlier,
        gradeDate: daysAgo(40 + i),
      });
      db.grades.push({
        id: nextId(db),
        studentId: u.id,
        subject: subj,
        kind: "Ujian",
        score,
        gradeDate: daysAgo(6 + (i % 5)),
      });
    }
  }

  for (let i = 0; i < SUBJECTS.length; i++) {
    const [subj, score] = SUBJECTS[i];
    const delta = offsets[i % offsets.length];
    db.grades.push({
      id: nextId(db),
      studentId: jessie.id,
      subject: subj,
      kind: "Ulangan",
      score: Math.max(20, score - delta),
      gradeDate: daysAgo(38 + i),
    });
    db.grades.push({
      id: nextId(db),
      studentId: jessie.id,
      subject: subj,
      kind: "Ujian",
      score,
      gradeDate: daysAgo(5 + (i % 5)),
    });
  }
  const history = [
    ["Matematika", "Latihan fungsi", 88, 1],
    ["Seni Budaya", "Kuis Seni Rupa", 62, 2],
    ["Informatika", "Projek Basis Data", 95, 3],
    ["Fisika", "Quiz Gerak Melingkar", 70, 5],
    ["Bahasa Indonesia", "Menulis Teks Eksposisi", 81, 7],
    ["Biologi", "UTS Semester", 66, 9],
  ] as const;
  for (const [subj, kind, score, ago] of history) {
    db.grades.push({
      id: nextId(db),
      studentId: jessie.id,
      subject: subj,
      kind,
      score,
      gradeDate: daysAgo(ago),
    });
  }

  for (const [name, klass] of STUDENTS) {
    db.enrollments.push({ classId: classes.get(klass)!, studentId: studentIds.get(name)! });
  }
  db.enrollments.push({ classId: classes.get("XI RPL B")!, studentId: jessie.id });

  const teaching: Record<string, [string, string][]> = {
    "XI RPL B": [
      ["Bu Septi Retno", "Matematika"],
      ["Mr Windah Class", "Informatika"],
      ["Pak Arfan Dwinarta", "Fisika"],
      ["Bu Dewi Lestari", "Bahasa Indonesia"],
      ["Bu Citra Melati", "Seni Budaya"],
      ["Pak Raka Nugraha", "Matematika"],
    ],
    "XI RPL A": [
      ["Bu Septi Retno", "Matematika"],
      ["Pak Arfan Dwinarta", "Fisika"],
      ["Bu Dewi Lestari", "Bahasa Indonesia"],
    ],
    "XI RPL C": [
      ["Bu Dewi Lestari", "Bahasa Indonesia"],
      ["Bu Citra Melati", "Seni Budaya"],
    ],
  };
  for (const [klass, pairs] of Object.entries(teaching)) {
    for (const [tname, subj] of pairs) {
      db.teachings.push({
        classId: classes.get(klass)!,
        teacherId: teacherIds.get(tname)!,
        subject: subj,
      });
    }
  }

  const taskIds = new Map<string, number>();
  for (const klass of ["XI RPL A", "XI RPL B", "XI RPL C"]) {
    for (const t of TASKS_DEWI) {
      const task: Task = {
        id: nextId(db),
        classId: classes.get(klass)!,
        createdBy: dewi,
        title: t.title,
        description: t.desc,
        subject: "Bahasa Indonesia",
        assignedAt: iso(new Date(`${t.assigned}T00:00:00`)),
        dueAt: iso(new Date(`${t.due}T00:00:00`)),
      };
      db.tasks.push(task);
      taskIds.set(`${klass}|${t.title}`, task.id);
    }
  }

  const todayTasks = [
    ["Matematika", "Latian fungsi 16:00 - 18:00", "Bu Septi Retno"],
    ["English", "Essay", "Bu Septi Retno"],
    ["Basis Data", "Basis Data Komputer", "Mr Windah Class"],
  ] as const;
  const todayIds = new Map<string, number>();
  for (const [subj, title, tname] of todayTasks) {
    const task: Task = {
      id: nextId(db),
      classId: classes.get("XI RPL B")!,
      createdBy: teacherIds.get(tname)!,
      title,
      description: title,
      subject: subj,
      assignedAt: daysAgo(1),
      dueAt: iso(startOfToday()),
    };
    db.tasks.push(task);
    todayIds.set(title, task.id);
  }
  db.taskStatuses.push({
    id: nextId(db),
    taskId: todayIds.get("Latian fungsi 16:00 - 18:00")!,
    studentId: jessie.id,
    done: true,
    submittedAt: iso(new Date(`${new Date().toISOString().slice(0, 10)}T08:12:00`)),
    grade: null,
    feedback: "",
  });

  const roster: Record<string, string[]> = {};
  for (const [name, klass] of STUDENTS) {
    (roster[klass] ??= []).push(name);
  }
  roster["XI RPL B"].push("Jessie Cooper");

  const jessieMap: Record<string, [number, number | null, string] | null> = {
    "Menulis Teks Eksposisi": null,
    "Analisis Unsur Intrinsik Cerpen": [6, 88, "Analisis sudah lengkap. Perdalam bagian amanat."],
    "Membuat Teks Pidato Persuasif": [4, null, ""],
    "Membuat Resensi Buku": [10, 90, "Resensi bagus dan jujur."],
  };

  for (const klass of ["XI RPL A", "XI RPL B", "XI RPL C"]) {
    for (let tIdx = 0; tIdx < TASKS_DEWI.length; tIdx++) {
      const title = TASKS_DEWI[tIdx].title;
      const tId = taskIds.get(`${klass}|${title}`)!;
      let missing = new Set<string>();
      if (title === "Menulis Teks Eksposisi") {
        missing = new Set(["Bima Sakti", "Gatot Kaca", "Joko Prabumi"]);
      } else if (title === "Membuat Teks Pidato Persuasif") {
        missing = new Set(["Gatot Kaca", "Farid Diva", "Joko Prabumi", "Naufal Hidayat", "Laras Ayu"]);
      } else if (title === "Membuat Resensi Buku") {
        missing = new Set(["Joko Prabumi"]);
      }
      let gIdx = 0;
      for (const name of roster[klass]) {
        if (missing.has(name)) continue;
        let sub: string;
        let grade: number | null;
        let fb: string;
        if (name === "Jessie Cooper") {
          const jm = jessieMap[title];
          if (jm === null) continue;
          sub = daysAgo(jm[0]);
          grade = jm[1];
          fb = jm[2];
        } else {
          sub = daysAgo(((tIdx * 2 + gIdx) % 9) + 1);
          grade = gIdx % 3 === 2 ? null : 70 + ((gIdx * 7) % 30);
          fb = grade !== null && grade < 78 ? "Perlu perbaikan di bagian struktur." : "";
          gIdx += 1;
        }
        db.taskStatuses.push({
          id: nextId(db),
          taskId: tId,
          studentId: studentIds.get(name)!,
          done: true,
          submittedAt: sub,
          grade,
          feedback: fb,
        });
      }
    }
  }

  const quizzes = [
    ["Kuis: Teks Eksposisi", "XI RPL A", "Teks Eksposisi — struktur, kebahasaan, dan contoh", "Sedang", 10, 20, "tayang", "2026-08-24"],
    ["Kuis: Unsur Intrinsik Cerpen", "XI RPL B", "Unsur Intrinsik Cerpen — tokoh, latar, konflik", "Sedang", 15, 30, "tayang", "2026-08-18"],
    ["Kuis: Teks Pidato Persuasif", "XI RPL C", "Teks Pidato Persuasif — struktur dan kebahasaan", "Mudah", 10, 20, "draft", "2026-09-10"],
  ] as const;
  for (const [title, klass, topic, diff, num, dur, status, created] of quizzes) {
    const quiz: Quiz = {
      id: nextId(db),
      classId: classes.get(klass)!,
      createdBy: dewi,
      title,
      topic,
      difficulty: diff,
      numQuestions: num,
      durationMin: dur,
      status: status as "tayang" | "draft",
      createdAt: iso(new Date(`${created}T00:00:00`)),
    };
    db.quizzes.push(quiz);
    const key = title.split(": ")[1];
    (QUIZ_PREVIEWS[key] ?? []).forEach((text, i) => {
      db.quizQuestions.push({ id: nextId(db), quizId: quiz.id, idx: i + 1, text });
    });
  }

  const materials = [
    ["Materi: Teks Eksposisi", "XI RPL A", 24, "tayang", 74, "2026-08-24"],
    ["Materi: Unsur Intrinsik Cerpen", "XI RPL B", 18, "tayang", 61, "2026-08-18"],
    ["Materi: Teks Pidato Persuasif", "XI RPL A", 24, "draft", 0, "2026-08-20"],
    ["Materi: Resensi Buku", "XI RPL C", 12, "tayang", 47, "2026-08-01"],
  ] as const;
  for (const [title, klass, pages, status, views, created] of materials) {
    db.materials.push({
      id: nextId(db),
      teacherId: dewi,
      classId: classes.get(klass)!,
      title,
      pages,
      status: status as "tayang" | "draft",
      views,
      createdAt: iso(new Date(`${created}T00:00:00`)),
    });
  }

  db.announcements.push(
    {
      id: nextId(db),
      title: "Ujian Akhir Semester",
      body: "Akan Dilaksanakan pada tanggal 10 September 2026",
      createdBy: dewi,
      createdLabel: "Kemarin",
      createdAt: daysAgo(1),
    },
    {
      id: nextId(db),
      title: "Pengumpulan Tugas",
      body: "Kumpulkan Tugas sebelum 1 September 2026",
      createdBy: dewi,
      createdLabel: "3 Hari lalu",
      createdAt: daysAgo(3),
    }
  );

  const todayIso = new Date().toISOString().slice(0, 10);
  db.chatMessages.push(
    {
      id: nextId(db),
      userId: jessie.id,
      role: "ai",
      text: "Hai Jessie! 👋 Aku AI Agent Grafidu. Aku sudah lihat nilai dan tugasmu minggu ini — mau mulai dari mana?",
      createdAt: iso(new Date(`${todayIso}T07:00:00`)),
    },
    {
      id: nextId(db),
      userId: dewi,
      role: "ai",
      text: "Hai Bu Dewi! 👋 Aku AI Agent Grafidu. Aku sudah lihat nilai dan tugas kelas anda minggu ini — mau mulai dari mana?",
      createdAt: iso(new Date(`${todayIso}T07:00:00`)),
    }
  );

  const todos: [string, string, number][] = [
    ["Matematika", "Latian fungsi 16:00 - 18:00", 1],
    ["English", "Essay", 0],
    ["Basis Data", "Basis Data Komputer", 0],
  ];
  for (const [t, sub, done] of todos) {
    db.todos.push({
      id: nextId(db),
      userId: jessie.id,
      title: t,
      subtitle: sub,
      done: done === 1,
      createdAt: daysAgo(0),
    });
  }

  return db;
}

// ---------------------------------------------------------------------------
// Reactive subscriptions
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

let cache: DB | null = null;
let version = 0;
const listeners = new Set<() => void>();

const EMPTY_DB: DB = {
  users: [],
  classes: [],
  enrollments: [],
  teachings: [],
  tasks: [],
  taskStatuses: [],
  grades: [],
  quizzes: [],
  quizQuestions: [],
  materials: [],
  announcements: [],
  chatMessages: [],
  todos: [],
  aiActions: [],
  subscribers: [],
  nextId: 1,
  sessionUserId: null,
};

export function getDB(): DB {
  if (!cache) cache = isBrowser() ? buildSeed() : EMPTY_DB;
  return cache;
}

/** Applies a mutation, notifies every subscribed component, and passes through the callback's return value. */
export function update<T>(fn: (db: DB) => T): T {
  const db = getDB();
  const result = fn(db);
  version += 1;
  for (const listener of listeners) listener();
  return result;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Reacts to store changes. Returns null on the server AND until mounted, so
 *  the first client render matches the SSR output (no hydration mismatch);
 *  components null-guard and fill in right after mount. */
export function useDB(): DB | null {
  useSyncExternalStore(subscribe, () => version, () => -1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!isBrowser() || !mounted) return null;
  return getDB();
}

export function resetDB(): void {
  cache = buildSeed();
  version += 1;
  for (const fn of listeners) fn();
}
