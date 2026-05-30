"use client";

import React from "react";
import { Home, Search, Receipt, Wallet } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Search, label: "Sell" },
  { icon: Receipt, label: "History" },
  { icon: Wallet, label: "Wallet" },
];

export function BottomNav() {
  return (
    <div className="fixed bottom-4 left-4 right-4 grid grid-cols-4 gap-2 rounded-2xl bg-white border p-2 shadow-sm">
      {navItems.map(({ icon: Icon, label }) => (
        <div 
          key={label} 
          className="rounded-xl p-2 text-center text-xs text-zinc-600 hover:bg-zinc-50 cursor-pointer"
        >
          <Icon className="h-5 w-5 mx-auto mb-1" />
          {label}
        </div>
      ))}
    </div>
  );
}
