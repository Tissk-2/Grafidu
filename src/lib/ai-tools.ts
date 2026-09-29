import { getDB, update } from "@/lib/store";
import type { SessionUser, Role } from "@/lib/auth";

/**
 * Whitelist of actions the AI agent may perform, tiered by risk.
 * - "auto": touches only the caller's own space, reversible → executes immediately.
 * - "confirm": reaches other people (class-wide) → stored as pending, executed only after the user clicks Confirm.
 */
export type RiskTier = "auto" | "confirm";

export type ToolName = "create_todo" | "create_quiz_draft" | "remind_students" | "publish_quiz";

export type ToolDecl = {
  name: ToolName;
  description: string;
  required: string[];
  allowedRoles: Role[];
  risk: RiskTier;
};

export const TOOL_DECLARATIONS: ToolDecl[] = [
  {
    name: "create_todo",
    description:
      "Buat satu item to-do belajar untuk siswa yang sedang chat. Gunakan saat siswa meminta to-do list, rencana belajar, atau pengingat review materi.",
    required: ["title"],
    allowedRoles: ["student"],
    risk: "auto",
  },
  {
    name: "create_quiz_draft",
    description:
      "Buat draft kuis untuk kelas guru. Draft bersifat privat sampai guru meninjaunya; gunakan saat guru meminta kuis/soal dibuatkan.",
    required: ["topic"],
    allowedRoles: ["teacher"],
    risk: "auto",
  },
  {
    name: "remind_students",
    description:
      "Kirim pengingat ke seluruh siswa yang belum mengumpulkan sebuah tugas. Perlu konfirmasi guru karena menjangkau banyak orang.",
    required: ["taskId"],
    allowedRoles: ["teacher"],
    risk: "confirm",
  },
  {
    name: "publish_quiz",
    description:
      "Tayangkan draft kuis agar bisa dikerjakan siswa di kelasnya. Perlu konfirmasi guru karena langsung terlihat siswa.",
    required: ["quizId"],
    allowedRoles: ["teacher"],
    risk: "confirm",
  },
];

export function findTool(name: string): ToolDecl | undefined {
  return TOOL_DECLARATIONS.find((t) => t.name === name);
}

/** Role + argument validation. Returns an error string when the call must be rejected. */
export function validateToolCall(
  user: SessionUser,
  name: string,
  args: Record<string, unknown>
): string | null {
  const tool = findTool(name);
  if (!tool) return `Alat "${name}" tidak dikenal.`;
  if (!tool.allowedRoles.includes(user.role)) {
    return `Alat "${name}" hanya untuk ${tool.allowedRoles.join("/")}.`;
  }
  for (const req of tool.required) {
    if (args[req] === undefined || args[req] === null || String(args[req]).trim() === "") {
      return `Parameter "${req}" wajib diisi.`;
    }
  }
  if (name === "create_quiz_draft") {
    const num = Number(args.num ?? 5);
    if (Number.isNaN(num) || num < 3 || num > 30) return "Jumlah soal harus 3-30.";
  }
  return null;
}

/** Indonesian label shown on the confirm card in chat UI. */
export function actionSummary(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case "create_todo":
      return `Buat to-do "${args.title}"`;
    case "create_quiz_draft":
      return `Buat draft kuis "${args.topic}"${args.className ? ` untuk ${args.className}` : ""} (${Number(args.num ?? 5)} soal)`;
    case "remind_students":
      return `Ingatkan siswa yang belum mengumpulkan tugas #${args.taskId}`;
    case "publish_quiz":
      return `Tayangkan kuis #${args.quizId} ke kelas`;
    default:
      return name;
  }
}

/** Records an executed/failed action so the chat history can audit it. */
export function recordAction(
  userId: number,
  tool: ToolName,
  payload: string,
  status: "executed" | "failed" | "declined",
  result: string
): void {
  update((db) => {
    const now = new Date().toISOString();
    db.aiActions.push({
      id: db.nextId++,
      userId,
      tool,
      payload,
      status,
      result,
      createdAt: now,
      resolvedAt: now,
    });
  });
}

/**
 * Executes a validated tool call against the in-memory store. Called directly
 * for "auto" actions and from the chat confirm card for "confirm" actions.
 * Returns a human-readable Indonesian result.
 */
export function executeTool(
  user: SessionUser,
  name: ToolName,
  args: Record<string, unknown>
): string {
  const db = getDB();
  switch (name) {
    case "create_todo": {
      const title = String(args.title).trim();
      const subtitle = String(args.subtitle ?? "Disarankan oleh AI").trim();
      let result = "";
      update((d) => {
        const id = d.nextId++;
        d.todos.push({
          id,
          userId: user.id,
          title,
          subtitle,
          done: false,
          createdAt: new Date().toISOString(),
        });
        result = `To-do "${title}" berhasil ditambahkan ke daftarmu.`;
      });
      return result;
    }

    case "create_quiz_draft": {
      const topic = String(args.topic).trim();
      const className = String(args.className ?? user.className ?? "XI RPL A").trim();
      const num = Math.max(3, Math.min(30, Number(args.num ?? 5)));
      const cls = db.classes.find((c) => c.name === className);
      if (!cls) return `Kelas ${className} tidak ditemukan.`;

      const provided = Array.isArray(args.questions)
        ? (args.questions as unknown[]).map((q) => String(q).trim()).filter(Boolean)
        : [];
      const templates = [
        `Jelaskan pengertian ${topic}.`,
        `Sebutkan tiga ciri utama ${topic}.`,
        `Berikan contoh penerapan ${topic}.`,
        `Analisislah kasus berikut terkait ${topic}.`,
        `Buatlah ringkasan materi ${topic}.`,
      ];
      const questions = fillToCount(provided, templates, num);

      let result = "";
      update((d) => {
        const quizId = d.nextId++;
        d.quizzes.push({
          id: quizId,
          classId: cls.id,
          createdBy: user.id,
          title: `Kuis: ${topic}`,
          topic,
          difficulty: "Sedang",
          numQuestions: num,
          durationMin: Math.max(10, num * 2),
          status: "draft",
          createdAt: new Date().toISOString(),
        });
        questions.forEach((text, i) => {
          d.quizQuestions.push({ id: d.nextId++, quizId, idx: i + 1, text });
        });
        result = `Draft kuis "Kuis: ${topic}" (${questions.length} soal) untuk ${className} sudah dibuat di menu Quiz Maker.`;
      });
      return result;
    }

    case "remind_students": {
      const taskId = Number(args.taskId);
      const task = db.tasks.find((t) => t.id === taskId && t.createdBy === user.id);
      if (!task) return `Tugas #${taskId} tidak ditemukan di daftarmu.`;
      const roster = db.enrollments.filter((e) => e.classId === task.classId).length;
      const submitted = db.taskStatuses.filter(
        (s) => s.taskId === taskId && s.submittedAt !== null
      ).length;
      const unsubmitted = Math.max(0, roster - submitted);
      return `Pengingat tugas "${task.title}" terkirim ke ${unsubmitted} siswa yang belum mengumpulkan.`;
    }

    case "publish_quiz": {
      const quizId = Number(args.quizId);
      const quiz = db.quizzes.find((q) => q.id === quizId && q.createdBy === user.id);
      if (!quiz) return `Kuis #${quizId} tidak ditemukan di daftarmu.`;
      update((d) => {
        const q = d.quizzes.find((x) => x.id === quizId);
        if (q) q.status = "tayang";
      });
      return `Kuis "${quiz.title}" sekarang tayang dan bisa dikerjakan siswa.`;
    }
  }
}

function fillToCount(provided: string[], templates: string[], num: number): string[] {
  const out = [...provided];
  let i = 0;
  while (out.length < num) {
    out.push(templates[i % templates.length]);
    i++;
  }
  return out;
}
