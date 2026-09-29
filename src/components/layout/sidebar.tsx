"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { id } from "date-fns/locale";
import { Add, People } from "iconsax-reactjs";
import { Calendar } from "@/components/ui/calendar";

export type TodayTask = { id: string; title: string; sub: string; done: boolean };

export type SidebarClass = { id: number; name: string; total: number };

export type SidebarPropsData = {
  user: { name: string; sub: string; avatar: string };
  tasksToday: TodayTask[];
  classes?: SidebarClass[];
  activeClassId?: number;
  onSelectClass?: (id: number) => void;
};

const TASK_ICON = (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const GEAR_ICON = (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export function Sidebar({
  role,
  user,
  tasksToday,
  classes,
  activeClassId,
  onSelectClass,
}: {
  role: "student" | "teacher";
  user: { name: string; sub: string; avatar: string };
  tasksToday: TodayTask[];
  classes?: SidebarClass[];
  activeClassId?: number;
  onSelectClass?: (id: number) => void;
}) {
  const settingsHref = role === "student" ? "/student/settings" : "/teacher/settings";
  const [selected, setSelected] = useState<Date | undefined>(() => new Date());

  function openAddClassDialog() {
    const dlg = document.getElementById("dlg-add-class") as HTMLDialogElement | null;
    if (dlg) {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
    }
  }

  return (
    <aside className="sidebar">
      <Link className="brand" href="/">
        <Image src="/assets/logo.png" alt="Grafidu" width={18} height={18} />
        <span>GRAFIDU</span>
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "14px 0 6px",
        }}
      >
        <h3 className="side-sec-title" style={{ margin: 0 }}>
          Calendar
        </h3>
      </div>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        defaultMonth={selected}
        locale={id}
        weekStartsOn={1}
        showOutsideDays
        className="w-full bg-transparent p-0 [&_button[data-selected-single=true]]:text-black [&_button[data-range-start=true]]:text-black [&_button[data-range-end=true]]:text-black"
        modifiers={{ sunday: { dayOfWeek: [0] } }}
        modifiersClassNames={{ sunday: "text-[#ff3b30]" }}
        classNames={{
          today:
            "rounded-(--cell-radius) bg-[#eee7ff] text-[#751ef8] font-semibold data-[selected-single=true]:bg-primary",
        }}
      />

      {role === "student" ? (
        <>
          <div className="side-list-head">
            <h3>Tugas Hari Ini</h3>
            <Link className="link-underline" href="/student/tasks">
              Lihat Semua
            </Link>
          </div>
          {tasksToday.map((t) => (
            <div key={t.id} className={"task-card" + (t.done ? " done" : "")} data-check>
              <span className="tbox">{TASK_ICON}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/student/tasks/${t.id}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <b>{t.title}</b>
                  <span>{t.sub}</span>
                </Link>
              </span>
            </div>
          ))}
        </>
      ) : (
        <>
          <div className="side-list-head">
            <h3>Kelas yang diampu</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="class-plus"
                aria-label="Tambah kelas"
                data-dialog="dlg-add-class"
                onClick={openAddClassDialog}
              >
                <Add size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
          {(classes ?? []).map((c) => (
            <Link
              key={c.id}
              href={`/teacher/home/${c.id}`}
              className={"class-card" + (activeClassId === c.id ? " on" : "")}
              onClick={() => onSelectClass?.(c.id)}
              style={{ textDecoration: "none", color: "inherit", display: "flex" }}
            >
              <span className="cic">
                <People size={19} strokeWidth={1.8} />
              </span>
              <span>
                <b>{c.name}</b>
                <span>{c.total} Murid</span>
              </span>
            </Link>
          ))}
        </>
      )}

      <div className="side-user pr-6!">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.avatar.startsWith("/") ? user.avatar : "/" + user.avatar} alt={user.name} />
        <span>
          <b>{user.name}</b>
          <span>{user.sub}</span>
        </span>
        <Link href={settingsHref} aria-label="Pengaturan">
          {GEAR_ICON}
        </Link>
      </div>
    </aside>
  );
}
