"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Settings } from "lucide-react";
import type { SidebarPropsData } from "@/components/layout/sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import AddClassDialog from "@/components/dialogs/add-class-dialog";

export default function DashboardShell({
  role,
  sidebar,
  rightbar,
  children,
  activeNav,
}: {
  role: "student" | "teacher";
  sidebar: SidebarPropsData;
  rightbar: React.ReactNode;
  children: React.ReactNode;
  activeNav: string;
}) {
  const settingsHref = role === "student" ? "/student/settings" : "/teacher/settings";

  // Panel sidebar di layar kecil. Disimpan sebagai "path tempat panel dibuka",
  // jadi otomatis tertutup begitu pengguna pindah halaman.
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const navOpen = openAt === pathname;

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAt(null);
    };
    const onResize = () => {
      if (window.innerWidth > 940) setOpenAt(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <div className={"app" + (navOpen ? " m-nav-open" : "")}>
      {/* Top bar khusus layar kecil (<= 940px). Di desktop disembunyikan CSS. */}
      <div className="m-topbar">
        <button
          type="button"
          className="m-menu"
          aria-label="Buka kalender dan tugas"
          aria-expanded={navOpen}
          onClick={() => setOpenAt(navOpen ? null : pathname)}
        >
          <CalendarDays size={19} aria-hidden />
        </button>

        <Link className="brand" href="/">
          <Image src="/assets/logo.png" alt="Grafidu" width={28} height={28} />
          <span>GRAFIDU</span>
        </Link>

        <Link className="m-gear" href={settingsHref} aria-label="Pengaturan">
          <Settings size={19} aria-hidden />
        </Link>
      </div>

      <button
        type="button"
        className="m-backdrop"
        aria-label="Tutup panel"
        tabIndex={-1}
        onClick={() => setOpenAt(null)}
      />

      <Sidebar
        role={role}
        user={sidebar.user}
        tasksToday={sidebar.tasksToday}
        classes={sidebar.classes}
        activeClassId={sidebar.activeClassId}
        onSelectClass={sidebar.onSelectClass}
      />
      <main className="main">{children}</main>
      {rightbar}
      <BottomNav role={role} active={activeNav} />
      {role === "teacher" ? <AddClassDialog /> : null}
    </div>
  );
} 