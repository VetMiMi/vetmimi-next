"use client";
import { useState } from "react";

export function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-start justify-between gap-4 border-none bg-none py-[1.35rem] text-left"
      >
        <span className="font-display text-[1.05rem] leading-[1.4] text-ink">
          {q}
        </span>
        <span
          className={`mt-0.5 block shrink-0 text-[1.4rem] leading-none text-coral transition-transform duration-250 ease-[ease] ${open ? "rotate-45" : "rotate-0"}`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-350 ease-[ease] ${open ? "max-h-[600px]" : "max-h-0"}`}
      >
        <p className="m-0 pb-[1.35rem] font-body text-[0.93rem] leading-[1.8] text-ink/65">
          {a}
        </p>
      </div>
    </div>
  );
}
