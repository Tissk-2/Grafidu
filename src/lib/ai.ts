import { getDB, update, startOfToday } from "@/lib/store";
import { studentSubjects, teacherClasses, classStudents } from "@/lib/data";
import { fmtDate } from "@/lib/format";
import {
  executeTool,
  validateToolCall,
  recordAction,
  actionSummary,
  type ToolName,
} from "@/lib/ai-tools";
import type { SessionUser } from "@/lib/auth";

export type AiReplyResult = {
  reply: string;
  /** Set when the agent proposed a class-wide action that waits for the user's confirmation. */
  pendingAction?: { id: number; tool: string; summary: string };
};

/**
 * Grafidu AI — a fully local, deterministic agent. It matches keywords in the
 * message against live store data and answers in Indonesian; class-wide actions
 * are stored as pending AiActions for one-click confirmation in the chat UI.
 */
export function aiReply(user: SessionUser, text: string): AiReplyResult {
  const t = (text || "").toLowerCase();
  const db = getDB();

  if (user.role === "student") {
    const subs = studentSubjects(db, user.id);
    const ordered = [...subs].sort((a, b) => a.score - b.score);
    const weakest = ordered.slice(0, 2);
    const strongest = ordered[ordered.length - 1] ?? null;
    const avg = subs.length
      ? Math.round(subs.reduce((acc, s) => acc + s.score, 0) / subs.length)
      : 0;

    const startToday = startOfToday().getTime();
    const upcomingTasks = db.tasks
      .filter(
        (task) =>
          task.classId === db.classes.find((c) => c.name === (user.className ?? ""))?.id &&
          new Date(task.dueAt).getTime() >= startToday
      )
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      .slice(0, 4);

    if (/(?:buat(?:kan)?\s*(?:to.?do|daftar\s*kegiatan)|to.?do\s*list)/.test(t)) {
      if (!weakest.length) {
        return { reply: "Belum ada data nilai, jadi aku belum tahu harus prioritaskan apa. Tambahkan to-do manual dulu ya." };
      }
      const created: string[] = [];
      for (const s of weakest) {
        const args = { title: `Review materi ${s.subject}`, subtitle: `Prioritas belajar (Nilai saat ini: ${s.score})` };
        const result = executeTool(user, "create_todo", args);
        recordAction(user.id, "create_todo", JSON.stringify(args), "executed", result);
        created.push(s.subject);
      }
      return {
        reply:
          `Beres! Aku buatkan to-do list untuk review ${created.join(" dan ")}. ` +
          "Cek halaman To-Do List dan centang satu per satu ya.",
      };
    }

    if (/(?:jadwal|tenggat|deadline|agenda)/.test(t)) {
      if (!upcomingTasks.length) {
        return { reply: "Tidak ada tenggat yang akan datang. Waktunya santai atau nambah latihan?" };
      }
      return {
        reply:
          "Jadwal tugasmu ke depan:\n" +
          upcomingTasks.map((r) => `- ${r.title} (${r.subject}): ${fmtDate(r.dueAt)}`).join("\n"),
      };
    }

    if (["rencana", "plan", "belajar"].some((k) => t.includes(k))) {
      if (!weakest.length) {
        return { reply: "Belum ada nilai tercatat, jadi aku belum bisa menyusun rencana. Mulai dari mengerjakan tugas yang ada ya!" };
      }
      return {
        reply:
          `Siap! Rencana minggu ini: (1) review materi ${weakest[0].subject} 20 menit per hari, ` +
          (weakest[1] ? `(2) kerjakan latihan soal ${weakest[1].subject} dua kali seminggu, ` : "") +
          (strongest ? `(3) jaga nilai ${strongest.subject} dengan kuis singkat tiap Jumat.` : ""),
      };
    }

    if (["nilai", "ringkas", "semester"].some((k) => t.includes(k))) {
      return {
        reply:
          `Rata-rata nilaimu ${avg}/100. Paling kuat di ${strongest?.subject ?? "Umum"} (${strongest?.score ?? 0}), ` +
          `paling perlu perhatian ${weakest[0]?.subject ?? "Umum"} (${weakest[0]?.score ?? 0}). ` +
          'Mau kubuatkan to-do list untuk dua mata pelajaran terlemahmu?',
      };
    }

    if (["latihan", "soal", "kuis", "quiz"].some((k) => t.includes(k))) {
      return {
        reply:
          `Aku rekomendasikan latihan kuis untuk ${weakest[0]?.subject ?? "pembelajaranmu"}. ` +
          "Buka menu Kuis di navigasi bawah dan kerjakan pelan-pelan.",
      };
    }

    const classTasks = db.tasks.filter(
      (task) => task.classId === db.classes.find((c) => c.name === (user.className ?? ""))?.id
    );
    const notDone = (task: (typeof classTasks)[number]) => {
      const st = db.taskStatuses.find((s) => s.taskId === task.id && s.studentId === user.id);
      return !st?.done;
    };
    let undone = classTasks.filter(
      (task) => new Date(task.dueAt).getTime() === startToday && notDone(task)
    );
    if (!undone.length) {
      undone = classTasks
        .filter(notDone)
        .sort((a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime())
        .slice(0, 3);
    }
    const due = undone.length ? undone.map((r) => r.title).join(", ") : "tidak ada — semua beres";
    return {
      reply:
        `Hari ini tugasmu: ${due}. ` +
        'Bilang "buatkan to-do list" kalau mau kususun prioritas belajarmu.',
    };
  }

  // teacher
  const classes = teacherClasses(db, user.id);
  const klass = user.className ?? classes[0] ?? "XI RPL A";
  const weakStudents = classStudents(db, klass)
    .filter((s) => s.avg < 70)
    .sort((a, b) => a.avg - b.avg)
    .map((s) => ({ name: s.name, avg: s.avg }));
  const pendingGradesCount = db.taskStatuses.filter((s) => {
    const task = db.tasks.find((x) => x.id === s.taskId);
    return task?.createdBy === user.id && s.submittedAt !== null && s.grade === null;
  }).length;

  if (/(?:buat(?:kan)?\s*(?:kuis|quiz|soal))/.test(t)) {
    const m = t.match(/(?:tentang|soal|kuis)\s+(?:tentang\s+)?([a-z0-9\- ]{4,60})/);
    const topic = (m ? m[1].trim() : "Materi Kelas").replace(/\b\w/g, (c) => c.toUpperCase());
    const args = { topic, className: klass, num: 5 };
    const result = executeTool(user, "create_quiz_draft", args);
    recordAction(user.id, "create_quiz_draft", JSON.stringify(args), "executed", result);
    return { reply: result };
  }

  if (/(?:ingatkan|pengingat|remind)/.test(t)) {
    const withMissing = db.tasks
      .filter((task) => task.createdBy === user.id)
      .map((task) => {
        const roster = db.enrollments.filter((e) => e.classId === task.classId).length;
        const submitted = db.taskStatuses.filter(
          (s) => s.taskId === task.id && s.submittedAt !== null
        ).length;
        return { task, missing: roster - submitted };
      })
      .sort((a, b) => b.missing - a.missing);
    if (!withMissing.length || withMissing[0].missing <= 0) {
      return { reply: "Semua siswa sudah mengumpulkan tugas — tidak ada yang perlu diingatkan." };
    }
    const target = withMissing[0];
    const args = { taskId: target.task.id };
    const actionId = createPendingAction(user, "remind_students", args);
    return {
      reply:
        `Aku bisa mengingatkan ${target.missing} siswa yang belum mengumpulkan "${target.task.title}". ` +
        "Konfirmasi di kartu di bawah ya — aksi ini menjangkau seluruh kelas.",
      pendingAction: { id: actionId, tool: "remind_students", summary: actionSummary("remind_students", args) },
    };
  }

  if (/(?:jadwal|tenggat|deadline|agenda)/.test(t)) {
    const startToday = startOfToday().getTime();
    const rows = db.tasks
      .filter(
        (task) =>
          task.createdBy === user.id && new Date(task.dueAt).getTime() >= startToday
      )
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      .slice(0, 5);
    if (!rows.length) return { reply: "Tidak ada tenggat tugas yang akan datang." };
    return {
      reply: "Tenggat tugasmu ke depan:\n" + rows.map((r) => `- ${r.title}: ${fmtDate(r.dueAt)}`).join("\n"),
    };
  }

  if (["perhatian", "rendah", "remedial", "menilai", "grade"].some((k) => t.includes(k))) {
    const names = weakStudents.length
      ? weakStudents.map((s) => `${s.name} (${s.avg})`).join(", ")
      : "semua siswa aman";
    const extra = pendingGradesCount ? ` Ada ${pendingGradesCount} pengumpulan menunggu penilaian.` : "";
    return { reply: `Siswa yang perlu perhatian: ${names}.${extra} Mau kubuatkan kuis tambahan?` };
  }

  if (["nilai", "ringkas", "kelas"].some((k) => t.includes(k))) {
    const students = db.users.filter((x) => x.role === "student" && x.className === klass);
    const avgs = students
      .map((s) => {
        const grades = db.grades.filter((g) => g.studentId === s.id);
        return grades.length ? grades.reduce((acc, g) => acc + g.score, 0) / grades.length : 0;
      })
      .filter((a) => a > 0);
    const avg = avgs.length ? Math.round(avgs.reduce((acc, a) => acc + a, 0) / avgs.length) : 0;
    return { reply: `Rata-rata kelas ${klass} sekarang ${avg}/100.` };
  }

  if (["kuis", "quiz", "soal"].some((k) => t.includes(k))) {
    return {
      reply:
        "Buka menu Quiz Maker: pilih kelas, tulis topik dari materimu, lalu Generate. " +
        'Atau bilang "buatkan kuis tentang [topik]" dan kubuatkan draftnya langsung.',
    };
  }

  return {
    reply:
      "Mau mulai dari mana: cek siswa yang perlu perhatian, lihat jadwal tenggat, " +
      'atau bilang "buatkan kuis tentang [topik]"?',
  };
}

/** Stores a confirm-tier proposal; the chat UI renders it as a confirm card. */
export function createPendingAction(
  user: SessionUser,
  tool: ToolName,
  args: Record<string, unknown>
): number {
  let actionId = 0;
  update((d) => {
    actionId = d.nextId++;
    d.aiActions.push({
      id: actionId,
      userId: user.id,
      tool,
      payload: JSON.stringify(args),
      status: "pending",
      result: "",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });
  });
  return actionId;
}

export type ResolveResult = { ok: boolean; result?: string; error?: string };

/** Confirms or declines a pending action from the chat's action card. */
export function resolveAction(
  user: SessionUser,
  actionId: number,
  approved: boolean
): ResolveResult {
  const db = getDB();
  const action = db.aiActions.find((a) => a.id === actionId);
  if (!action || action.userId !== user.id) {
    return { ok: false, error: "Aksi tidak ditemukan." };
  }
  if (action.status !== "pending") {
    return { ok: false, error: "Aksi ini sudah diproses." };
  }

  if (!approved) {
    update((d) => {
      const a = d.aiActions.find((x) => x.id === actionId);
      if (a) {
        a.status = "declined";
        a.resolvedAt = new Date().toISOString();
      }
    });
    return { ok: true, result: "Aksi dibatalkan." };
  }

  const args = JSON.parse(action.payload || "{}") as Record<string, unknown>;
  const invalidReason = validateToolCall(user, action.tool, args);
  if (invalidReason) {
    update((d) => {
      const a = d.aiActions.find((x) => x.id === actionId);
      if (a) {
        a.status = "failed";
        a.result = invalidReason;
        a.resolvedAt = new Date().toISOString();
      }
    });
    return { ok: false, error: invalidReason };
  }

  const result = executeTool(user, action.tool as ToolName, args);
  update((d) => {
    const a = d.aiActions.find((x) => x.id === actionId);
    if (a) {
      a.status = "executed";
      a.result = result;
      a.resolvedAt = new Date().toISOString();
    }
  });
  return { ok: true, result };
}
