"use client";

import { useParams, usePathname } from "next/navigation";
import { useTeacherShellData } from "@/app/teacher/teacher-shell-data";
import type { RosterRow, TeacherClass } from "@/lib/teacher-model";

export type { TeacherClass };
export type TeacherTaskRow = RosterRow;

/**
 * Helper nilai kelas — sekarang bekerja di atas roster LIVE (RosterRow dari
 * actions/teacher), bukan lagi data demo. Bentuk return dipertahankan agar
 * halaman lama tetap jalan.
 */
export function classAvg(roster: RosterRow[]): number {
  if (roster.length === 0) return 0;
  const sum = roster.reduce((acc, r) => acc + r.avg, 0);
  return Math.round((sum / roster.length) * 10) / 10;
}

/** Siswa diurutkan rata-rata terendah dulu, dengan status vs rata kelas. */
export function studentsWithStatus(roster: RosterRow[]) {
  const avg = classAvg(roster);
  return roster
    .map((r) => ({
      nama: r.name,
      rata: r.avg,
      status: r.avg >= avg ? "Atas Rata Rata" : "Bawah Rata Rata",
    }))
    .sort((a, b) => a.rata - b.rata);
}

/** Kelas aktif bersama antar halaman — kini dari shell context (data live). */
export function useActiveClass() {
  const { classes, activeClassId, select } = useTeacherShellData();
  return {
    classes,
    active: classes.find((c) => c.id === activeClassId) ?? classes[0] ?? null,
    select,
  };
}

/**
 * Kelas yang dirender shell guru: param rute /teacher/home/[id] menang,
 * lalu kelas aktif dari shell context (yang sendirinya menghormati localStorage).
 * Semua sumber membaca data yang sama sehingga tidak mungkin berbeda.
 */
export function useRoutedClass() {
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const { classes, kelas, select } = useTeacherShellData();

  // Hanya /teacher/home/[id] yang class-scoped. Rute dinamis lain memakai
  // segmen `id` untuk hal lain (mis. /teacher/tasks/[id] itu id tugas).
  const routeId = pathname.startsWith("/teacher/home/") ? (params?.id ?? null) : null;
  const fromRoute = routeId ? classes.some((c) => c.id === routeId) : false;
  const routed = fromRoute ? classes.find((c) => c.id === routeId) : undefined;

  return { kelas: routed ?? kelas, classes, select };
}
