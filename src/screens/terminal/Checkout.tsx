"use client";

import React, { useState } from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Printer } from "lucide-react";

export function TerminalCheckout() {
  const [printVoucher, setPrintVoucher] = useState(true);

  return (
    <PhoneFrame>
      <AppHeader
        title="Confirm Sale"
        subtitle="Global Call Card £5"
        rightIcon={ShieldCheck}
      />

      <div className="p-4 space-y-4 pb-20">
        {/* Sale Summary */}
        <Card className="rounded-3xl shadow-sm border-0">
          <CardContent className="p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Selling price</span>
              <span className="font-semibold">£5.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Wallet before</span>
              <span>£1,248.60</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Wallet after</span>
              <span>£1,243.60</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Retailer margin</span>
              <span className="text-emerald-700 font-semibold">£0.56</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Contact */}
        <div className="rounded-3xl bg-white border-0 shadow-sm p-4">
          <p className="text-sm text-zinc-500 mb-2">Customer mobile/email optional</p>
          <div className="h-11 rounded-2xl bg-zinc-100 border" />
        </div>

        {/* Print Toggle */}
        <div className="rounded-3xl bg-white border-0 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">Print voucher</p>
            <p className="text-sm text-zinc-500">Use Castle S1F4 thermal printer</p>
          </div>
          <Switch
            checked={printVoucher}
            onCheckedChange={setPrintVoucher}
            className="data-[state=checked]:bg-zinc-950"
          />
        </div>

        {/* Action Buttons */}
        <Button className="w-full h-14 rounded-2xl text-base">
          Confirm & sell
        </Button>
        <Button variant="outline" className="w-full h-12 rounded-2xl">
          Cancel
        </Button>
      </div>
    </PhoneFrame>
  );
}
