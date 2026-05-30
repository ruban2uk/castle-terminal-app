"use client";

import React, { useState } from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/display/Badge";
import { Search, ChevronRight } from "lucide-react";

const products = [
  {
    name: "Lebara £10 Top-up",
    type: "API",
    category: "eTopup",
    price: "£10.00",
    buy: "£8.90",
    margin: "£0.72",
    provider: "DT One",
    tag: "Real-time",
  },
  {
    name: "Global Call Card £5",
    type: "Manual PIN",
    category: "Voucher",
    price: "£5.00",
    buy: "£4.12",
    margin: "£0.56",
    provider: "Batch A",
    tag: "Lowest cost",
  },
  {
    name: "USA eSIM 5GB",
    type: "API",
    category: "eSIM",
    price: "£14.99",
    buy: "£11.95",
    margin: "£1.85",
    provider: "DT One",
    tag: "QR delivery",
  },
  {
    name: "Nigeria Data 2GB",
    type: "Hybrid",
    category: "Data",
    price: "£8.00",
    buy: "£6.44",
    margin: "£0.80",
    provider: "Least-cost",
    tag: "Auto route",
  },
];

const countries = ["All", "UK", "Nigeria", "USA", "India", "Travel"];

export function ProductSearch() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <PhoneFrame>
      <AppHeader
        title="Sell Product"
        subtitle="Search and route automatically"
        rightIcon={Search}
      />

      <div className="p-4 space-y-4 pb-20">
        {/* Search Bar */}
        <div className="rounded-3xl bg-white border-0 shadow-sm p-4 flex items-center gap-3">
          <Search className="h-5 w-5 text-zinc-400" />
          <span className="text-zinc-500 text-sm">
            Search country, operator or product
          </span>
        </div>

        {/* Country Filters */}
        <div className="flex gap-2 text-xs overflow-x-auto pb-1">
          {countries.map((item, i) => (
            <button
              key={item}
              onClick={() => setActiveFilter(item)}
              className={`px-3 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeFilter === item
                  ? "bg-zinc-950 text-white"
                  : "bg-white border"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.name} className="rounded-3xl shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <Badge
                        tone={
                          product.type === "Manual PIN"
                            ? "amber"
                            : product.type === "Hybrid"
                            ? "blue"
                            : "green"
                        }
                      >
                        {product.type}
                      </Badge>
                      <Badge>{product.tag}</Badge>
                    </div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {product.category} · Provider: {product.provider}
                    </p>
                    <p className="text-xs text-emerald-700 mt-2">
                      Retailer margin {product.margin}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{product.price}</p>
                    <ChevronRight className="h-5 w-5 mt-7 ml-auto text-zinc-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
