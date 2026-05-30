import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Seed Product Categories
    const categories = await Promise.all([
      prisma.productCategoryModel.create({
        data: { name: "eTopup", slug: "etopup", description: "Mobile airtime top-up", icon: "Smartphone", sortOrder: 1 },
      }),
      prisma.productCategoryModel.create({
        data: { name: "eSIM", slug: "esim", description: "Travel data bundles", icon: "Cpu", sortOrder: 2 },
      }),
      prisma.productCategoryModel.create({
        data: { name: "International Voucher", slug: "voucher", description: "Calling PINs", icon: "Globe2", sortOrder: 3 },
      }),
      prisma.productCategoryModel.create({
        data: { name: "Gift Card", slug: "gift-card", description: "Digital codes", icon: "Gift", sortOrder: 4 },
      }),
    ]);

    // Seed Products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          sku: "LEB-10-UK",
          name: "Lebara £10 Top-up",
          description: "UK Lebara mobile airtime top-up",
          retailPrice: 10.00,
          type: "ETOPUP",
          operator: "Lebara",
          country: "GB",
          categoryId: categories[0].id,
          fulfillmentMode: "API",
        },
      }),
      prisma.product.create({
        data: {
          sku: "GCC-5-INT",
          name: "Global Call Card £5",
          description: "International calling voucher",
          retailPrice: 5.00,
          type: "VOUCHER",
          country: "INT",
          categoryId: categories[2].id,
          fulfillmentMode: "MANUAL_PIN",
        },
      }),
      prisma.product.create({
        data: {
          sku: "USA-ESIM-5GB",
          name: "USA eSIM 5GB",
          description: "USA travel data bundle 5GB",
          retailPrice: 14.99,
          type: "ESIM",
          country: "US",
          categoryId: categories[1].id,
          fulfillmentMode: "API",
        },
      }),
    ]);

    // Seed Providers
    const providers = await Promise.all([
      prisma.provider.create({
        data: {
          name: "DT One",
          code: "DT_ONE",
          description: "Global digital value provider",
          type: "API",
          status: "ACTIVE",
          apiBaseUrl: "https://api.dtone.com",
        },
      }),
      prisma.provider.create({
        data: {
          name: "Internal PIN Stock",
          code: "INTERNAL",
          description: "Manual PIN inventory",
          type: "MANUAL",
          status: "ACTIVE",
        },
      }),
    ]);

    // Seed Provider Products
    await Promise.all([
      prisma.providerProduct.create({
        data: {
          providerId: providers[0].id,
          productId: products[0].id,
          providerProductCode: "DT-LEB-10",
          buyingPrice: 8.90,
          retailPrice: 10.00,
          platformMargin: 0.38,
          retailerMargin: 0.72,
          priority: 1,
        },
      }),
      prisma.providerProduct.create({
        data: {
          providerId: providers[1].id,
          productId: products[1].id,
          providerProductCode: "INT-GCC-5",
          buyingPrice: 4.12,
          retailPrice: 5.00,
          platformMargin: 0.32,
          retailerMargin: 0.56,
          priority: 1,
          stockLevel: 1284,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Seed data created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    );
  }
}
