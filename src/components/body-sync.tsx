"use client";

import { useEffect } from "react";

/**
 * Syncs document.body classes from the current layout.
 * Mirrors the original <body class="landing"> / "app-root" conventions.
 *
 * Menambah/menghapus class satu per satu (bukan menimpa className), supaya
 * class lain di <body> seperti `sheet-open` tidak ikut terhapus.
 */
export default function BodySync({
  className,
  dataPage,
}: {
  className?: string;
  dataPage?: string;
}) {
  useEffect(() => {
    document.documentElement.classList.add("js");
    const classes = (className ?? "").split(/\s+/).filter(Boolean);
    classes.forEach((c) => document.body.classList.add(c));
    if (dataPage) document.body.setAttribute("data-page", dataPage);
    return () => {
      classes.forEach((c) => document.body.classList.remove(c));
      if (dataPage) document.body.removeAttribute("data-page");
    };
  }, [className, dataPage]);
  return null;
}