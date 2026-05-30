"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  tone?: "zinc" | "green" | "blue" | "amber" | "red" | "dark";
}

export function Badge({ children, tone = "zinc" }: BadgeProps) {
  const styles = {
    zinc: "bg-zinc-100 text-zinc-700 border-zinc-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    dark: "bg-zinc-950 text-white border-zinc-950",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
