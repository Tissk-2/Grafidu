"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastItem = { id: number; message: string; type?: "error" };
type ToastCtx = { toast: (message: string, type?: "error") => void };

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

const ICON_OK = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const ICON_WARN = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

let nextId = 1;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const toast = useCallback((message: string, type?: "error") => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, message, type }]);
    const t = setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
      timers.current.delete(id);
    }, 3200);
    timers.current.set(id, t);
  }, []);

  useEffect(() => {
    // expose global for parity with the original window.gtoast calls
    (window as unknown as { gtoast?: (m: string, t?: "error") => void }).gtoast = toast;
    // The Map instance is never reassigned, only mutated; capture it so the
    // cleanup does not read the ref after this effect instance is torn down.
    const timersMap = timers.current;
    return () => {
      timersMap.forEach((t) => clearTimeout(t));
      timersMap.clear();
    };
  }, [toast]);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={"toast in" + (t.type === "error" ? " error" : "")}>
            <span className="t-ic">{t.type === "error" ? ICON_WARN : ICON_OK}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}