"use client";

import React from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Receipt,
  CreditCard,
  Smartphone,
  Globe2,
  Gift,
  Store,
  Cpu,
} from "lucide-react";

export function TerminalHome() {
  return (
    <PhoneFrame>
      <AppHeader
        title="Retailer POS"
        subtitle="Asha Telecom · Staff: Ruban"
        rightIcon={Store}
      />
      
      <div className="p-4 space-y-4 pb-24">
        {/* Wallet Card */}
        <Card className="rounded-3xl shadow-sm border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Wallet balance</p>
                <p className="text-3xl font-bold">£1,248.60</p>
              </div>
              <Wallet className="h-9 w-9 text-zinc-700" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
              <div className="rounded-2xl bg-zinc-100 p-3">
                <p className="text-zinc-500">Today sales</p>
                <p className="font-semibold">£386.40</p>
              </div>
              <div className="rounded-2xl bg-zinc-100 p-3">
                <p className="text-zinc-500">Today margin</p>
                <p className="font-semibold">£31.84</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Smartphone, title: "eTopup", note: "Mobile airtime" },
            { icon: Cpu, title: "eSIM", note: "Travel bundles" },
            { icon: Globe2, title: "Intl Voucher", note: "Calling PINs" },
            { icon: Gift, title: "Gift Card", note: "Digital codes" },
          ].map(({ icon: Icon, title, note }) => (
            <button
              key={title}
              className="rounded-3xl bg-white p-4 text-left shadow-sm border-0 hover:bg-zinc-50 transition-colors"
            >
              <Icon className="h-7 w-7 mb-3 text-zinc-700" />
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-zinc-500 mt-1">{note}</p>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="rounded-2xl h-12">
            <Receipt className="h-4 w-4 mr-2" /> History
          </Button>
          <Button variant="outline" className="rounded-2xl h-12">
            <CreditCard className="h-4 w-4 mr-2" /> Top-up
          </Button>
        </div>
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
