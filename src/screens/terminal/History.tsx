"use client";

import React from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/display/Badge";
import { Receipt, ChevronRight } from "lucide-react";

const transactions = [
  { id: "TXN-10482", product: "Global Call Card £5", status: "Success", amount: "£5.00", margin: "£0.56", provider: "Manual PIN", time: "10:42" },
  { id: "TXN-10481", product: "USA eSIM 5GB", status: "Success", amount: "£14.99", margin: "£1.85", provider: "DT One", time: "10:18" },
  { id: "TXN-10480", product: "Lebara £10 Top-up", status: "Pending", amount: "£10.00", margin: "£0.72", provider: "DT One", time: "09:58" },
];

export function TerminalHistory() {
  return (
    <PhoneFrame>
      <AppHeader
        title="History"
        subtitle="Today transactions"
        rightIcon={Receipt}
      />

      <div className="p-4 space-y-3 pb-20">
        {transactions.map((txn) => (
          <Card key={txn.id} className="rounded-3xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <Badge tone={txn.status === "Success" ? "green" : "amber"}>
                      {txn.status}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm">{txn.product}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {txn.id} · {txn.time}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Margin {txn.margin}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{txn.amount}</p>
                  <p className="text-xs text-zinc-500 mt-1">{txn.provider}</p>
                  <ChevronRight className="h-5 w-5 mt-4 ml-auto text-zinc-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PhoneFrame>
  );
}
