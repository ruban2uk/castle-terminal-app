"use client";

import React from "react";
import { LucideIcon, Store } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  rightIcon?: LucideIcon;
}

export function AppHeader({ 
  title, 
  subtitle, 
  rightIcon: RightIcon = Store 
}: AppHeaderProps) {
  return (
    <div className="bg-zinc-950 text-white p-5 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-400">Castle S1F4 Terminal</p>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-zinc-300 mt-1">{subtitle}</p>}
        </div>
        <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <RightIcon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
