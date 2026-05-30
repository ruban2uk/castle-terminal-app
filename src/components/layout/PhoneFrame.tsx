"use client";

import React from "react";

interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="mx-auto w-[375px] rounded-[2.4rem] bg-zinc-950 p-3 shadow-2xl">
      <div className="rounded-[1.85rem] bg-zinc-50 overflow-hidden border border-zinc-800 min-h-[760px]">
        {children}
      </div>
    </div>
  );
}
