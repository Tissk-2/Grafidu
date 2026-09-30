"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { dummyGuruData, type GuruClass } from "@/lib/guru-demo";

export type { GuruClass };
export type GuruTask = GuruClass["tugas"][number];

const BULAN: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  october: 9,
  november: 10,
  desember: 11,
};

/** "10 September 2026" -> Date */
export function parseIdDate(s: string): Date {
  const [d, m, y] = s.split(" ");
  return new Date(Number(y), BULAN[m.toLowerCase()] ?? 0, Number(d));
}

export const studentAvg = (nilai: number[]) =>
  Math.round(nilai.reduce((a, b) => a + b, 0) / nilai.length);

export function classAvg(k: GuruClass) {
  const avgs = k.dataMurid.map((m) => studentAvg(m.nilai));
  return Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10;
}

/** Students sorted by lowest average first, with status vs class average */
export function studentsWithStatus(k: GuruClass) {
  const avg = classAvg(k);
  return k.dataMurid
    .map((m) => {
      const rata = studentAvg(m.nilai);
      return { nama: m.nama, rata, status: rata >= avg ? "Atas Rata Rata" : "Bawah Rata Rata" };
    })
    .sort((a, b) => a.rata - b.rata);
}

/** Active class shared between pages (persisted in localStorage) */
export function useActiveClass() {
  const classes = dummyGuruData.dataKelas;
  const [id, setId] = useState<number>(classes[0].id);

  useEffect(() => {
    const saved = Number(localStorage.getItem("guru-class"));
    if (classes.some((c) => c.id === saved)) setId(saved);
  }, [classes]);

  const select = (next: number) => {
    setId(next);
    try {
      localStorage.setItem("guru-class", String(next));
    } catch {}
  };

  return { classes, active: classes.find((c) => c.id === id) ?? classes[0], select };
}

/**
 * The class the teacher shell should render: the `:id` route param wins, and
 * otherwise we fall back to the class last picked on /teacher/home. Because
 * this lives in the layout's shell, the sidebar, the rightbar and the page all
 * read the same source and can never disagree.
 *
 * The route is also mirrored back to localStorage so the pages that only read
 * the stored id (/teacher/tasks and friends) follow the URL.
 */
export function useRoutedClass() {
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const { classes, active, select } = useActiveClass();
  // Only /teacher/home/[id] is class-scoped. Other dynamic routes reuse the
  // `id` segment for something else (e.g. /teacher/tasks/[id] is a task id), so
  // honouring it there would silently switch the active class.
  const routeId = pathname.startsWith("/teacher/home/") ? Number(params?.id) : Number.NaN;
  const fromRoute = classes.some((c) => c.id === routeId);

  useEffect(() => {
    if (!fromRoute || routeId === active.id) return;
    try {
      localStorage.setItem("guru-class", String(routeId));
    } catch {}
  }, [fromRoute, routeId, active.id]);

  const kelas = (fromRoute ? classes.find((c) => c.id === routeId) : undefined) ?? active;
  return { kelas, classes, select };
}
