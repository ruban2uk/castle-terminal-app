"use client";

import React, { useState } from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { Button } from "@/components/ui/button";
import { SmartphoneCharging, KeyRound } from "lucide-react";

export function TerminalLogin() {
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`pin-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <PhoneFrame>
      <div className="min-h-[760px] bg-zinc-950 text-white p-6 flex flex-col justify-between">
        <div>
          <div className="h-14 w-14 rounded-2xl bg-white text-zinc-950 flex items-center justify-center">
            <SmartphoneCharging className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold mt-8">Retailer POS</h1>
          <p className="text-zinc-400 mt-2">
            Secure sales app for Castle S1F4 terminal.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white/10 border border-white/10 p-4">
            <p className="text-sm text-zinc-400 mb-2">Staff PIN</p>
            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  type="password"
                  maxLength={1}
                  value={pin[i]}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-12 rounded-xl bg-white/10 border border-white/10 text-center text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              ))}
            </div>
          </div>

          <Button className="w-full h-14 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100">
            <KeyRound className="h-4 w-4 mr-2" /> Unlock Terminal
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl border-white/20 text-white hover:bg-white/10"
          >
            Owner email login
          </Button>

          <p className="text-xs text-zinc-500 text-center">
            Device bound to Asha Telecom · Outlet 001
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
