"use client";

import { useEffect, useState } from "react";
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
