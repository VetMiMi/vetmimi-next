"use client";

import { createContext, use, useCallback, useEffect, useState } from "react";
import { CheckCircle, Info, X } from "@phosphor-icons/react";

type Tone = "success" | "info";
type Toast = { id: number; message: string; tone: Tone };
type Show = (message: string, tone?: Tone) => void;

const ToastContext = createContext<Show>(() => {});

// For completed, non-blocking outcomes only ("Availability saved."). A
// failure or partial failure is a Notice that stays on the page (brief §7).
export const useToast = () => use(ToastContext);

const LIFETIME = 5000;
let nextId = 0;

// Mounted once by the shell. The live region is always in the page, so a
// toast added to it is announced once.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback<Show>((message, tone = "success") => {
    setToasts((list) => [...list, { id: nextId++, message, tone }]);
  }, []);
  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      {/* Above the bottom tab bar below 1024px, bottom-right above it. */}
      <div
        role="status"
        className="fixed inset-x-5 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3 lg:inset-x-auto lg:right-8 lg:bottom-8"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  // Hover or focus holds the toast so it can be read or dismissed; it
  // leaves 5 seconds after the last of either.
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (held) return;
    const timer = setTimeout(() => onDismiss(toast.id), LIFETIME);
    return () => clearTimeout(timer);
  }, [held, onDismiss, toast.id]);

  const Icon = toast.tone === "success" ? CheckCircle : Info;
  return (
    <div
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
      }}
      className="flex w-full max-w-[400px] items-center gap-3 rounded-notice bg-paper py-2 pr-2 pl-5 text-[0.92rem] shadow-lifted"
    >
      <Icon
        aria-hidden="true"
        size={20}
        className={`shrink-0 ${toast.tone === "success" ? "text-olive" : "text-indigo"}`}
      />
      <p className="grow py-2">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-control text-muted transition-colors duration-150 hover:text-ink motion-reduce:transition-none"
      >
        <X aria-hidden="true" size={18} />
      </button>
    </div>
  );
}
