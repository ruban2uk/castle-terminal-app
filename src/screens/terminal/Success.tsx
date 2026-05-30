"use client";

import React from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Printer, QrCode } from "lucide-react";

export function TerminalSuccess() {
  return (
    <PhoneFrame>
      <div className="p-5 min-h-[760px] flex flex-col justify-between bg-zinc-50">
        <div className="text-center pt-12">
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-700" />
          </div>
          <h2 className="text-2xl font-bold mt-5">Sale successful</h2>
          <p className="text-zinc-500 mt-1">TXN-10482</p>
        </div>

        <Card className="rounded-[2rem] shadow-sm bg-white border-0">
          <CardContent className="p-5 space-y-4">
            <div className="text-center border-b pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Voucher PIN</p>
              <p className="text-3xl font-black tracking-widest mt-2">8492 1120 7733</p>
              <p className="text-sm text-zinc-500 mt-2">Serial: GC-100248</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-zinc-500">Amount</p>
                <p className="font-semibold">£5.00</p>
              </div>
              <div>
                <p className="text-zinc-500">Provider</p>
                <p className="font-semibold">Manual PIN</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button className="w-full h-14 rounded-2xl">
            <Printer className="h-4 w-4 mr-2" /> Print Again
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-2xl">
            <QrCode className="h-4 w-4 mr-2" /> Show QR Code
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-2xl">
            New Sale
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
}
