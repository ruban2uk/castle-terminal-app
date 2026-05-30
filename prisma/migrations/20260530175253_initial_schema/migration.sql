-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RETAILER_OWNER', 'RETAILER_STAFF', 'SUPPORT_OPERATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RetailerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "WalletLedgerType" AS ENUM ('CREDIT', 'DEBIT', 'HOLD', 'CAPTURE', 'RELEASE', 'REFUND');

-- CreateEnum
CREATE TYPE "WalletLedgerStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('ETOPUP', 'ESIM', 'VOUCHER', 'GIFT_CARD', 'DATA');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED');

-- CreateEnum
CREATE TYPE "PinStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'EXPIRED', 'VOID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('CREATED', 'QUOTED', 'PENDING', 'SUCCESS', 'FAILED', 'REVERSED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "FulfilmentMode" AS ENUM ('API_REALTIME', 'MANUAL_PIN', 'HYBRID');

-- CreateEnum
CREATE TYPE "ProviderTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'TIMEOUT', 'REVERSED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_LOGIN', 'USER_LOGOUT', 'RETAILER_CREATED', 'RETAILER_APPROVED', 'RETAILER_REJECTED', 'RETAILER_SUSPENDED', 'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED', 'PIN_BATCH_UPLOADED', 'PIN_REVEALED', 'PIN_SOLD', 'PIN_REPRINTED', 'PIN_VOIDED', 'TRANSACTION_CREATED', 'TRANSACTION_COMPLETED', 'TRANSACTION_FAILED', 'TRANSACTION_REFUNDED', 'TRANSACTION_REVERSED', 'WALLET_CREDITED', 'WALLET_DEBITED', 'WALLET_HOLD_PLACED', 'WALLET_HOLD_RELEASED', 'SETTINGS_UPDATED', 'PROVIDER_ENABLED', 'PROVIDER_DISABLED');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'RETRYING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'RETAILER_STAFF',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "googleId" TEXT,
    "microsoftId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retailer" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "tradingName" TEXT,
    "companyNumber" TEXT,
    "vatNumber" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'GB',
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "RetailerStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Retailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailerOutlet" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailerOutlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailerStaff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "pin" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canSell" BOOLEAN NOT NULL DEFAULT true,
    "canRefund" BOOLEAN NOT NULL DEFAULT false,
    "canTopUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailerStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerminalDevice" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "pairedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerminalDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "holdAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletLedger" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "WalletLedgerType" NOT NULL,
    "status" "WalletLedgerStatus" NOT NULL DEFAULT 'COMPLETED',
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceBefore" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "transactionId" TEXT,
    "reference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategoryModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategoryModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "retailPrice" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "operator" TEXT,
    "country" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "fulfillmentMode" TEXT NOT NULL DEFAULT 'API',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" "ProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "apiBaseUrl" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "webhookSecret" TEXT,
    "successRate" DECIMAL(5,2),
    "avgResponseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderProduct" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "providerProductCode" TEXT NOT NULL,
    "buyingPrice" DECIMAL(10,2) NOT NULL,
    "retailPrice" DECIMAL(10,2) NOT NULL,
    "platformMargin" DECIMAL(10,2) NOT NULL,
    "retailerMargin" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "stockLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PinBatch" (
    "id" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalCount" INTEGER NOT NULL,
    "availableCount" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "buyingPrice" DECIMAL(10,2) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PinBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PinInventory" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "encryptedPin" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "serialNumber" TEXT,
    "status" "PinStatus" NOT NULL DEFAULT 'AVAILABLE',
    "transactionId" TEXT,
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PinInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "outletId" TEXT,
    "terminalId" TEXT,
    "staffId" TEXT,
    "reference" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'CREATED',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "retailerMargin" DECIMAL(10,2) NOT NULL,
    "platformMargin" DECIMAL(10,2) NOT NULL,
    "fulfilmentMode" "FulfilmentMode" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "providerId" TEXT,
    "productName" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "retailPrice" DECIMAL(10,2) NOT NULL,
    "buyingPrice" DECIMAL(10,2) NOT NULL,
    "retailerMargin" DECIMAL(10,2) NOT NULL,
    "platformMargin" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "providerName" TEXT,
    "providerProductCode" TEXT,
    "routingDecision" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderTransaction" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerReference" TEXT,
    "status" "ProviderTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "webhookPayload" JSONB,
    "webhookReceivedAt" TIMESTAMP(3),

    CONSTRAINT "ProviderTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "receiptData" JSONB NOT NULL,
    "printedAt" TIMESTAMP(3),
    "printedBy" TEXT,
    "printCount" INTEGER NOT NULL DEFAULT 0,
    "emailedTo" TEXT,
    "emailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "retailerId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "provider" TEXT,
    "payload" JSONB NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'PENDING',
    "endpoint" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3),
    "responseStatus" INTEGER,
    "responseBody" TEXT,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_microsoftId_key" ON "User"("microsoftId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "Retailer_status_idx" ON "Retailer"("status");

-- CreateIndex
CREATE INDEX "Retailer_businessName_idx" ON "Retailer"("businessName");

-- CreateIndex
CREATE INDEX "RetailerOutlet_retailerId_idx" ON "RetailerOutlet"("retailerId");

-- CreateIndex
CREATE UNIQUE INDEX "RetailerStaff_userId_key" ON "RetailerStaff"("userId");

-- CreateIndex
CREATE INDEX "RetailerStaff_outletId_idx" ON "RetailerStaff"("outletId");

-- CreateIndex
CREATE UNIQUE INDEX "TerminalDevice_deviceId_key" ON "TerminalDevice"("deviceId");

-- CreateIndex
CREATE INDEX "TerminalDevice_outletId_idx" ON "TerminalDevice"("outletId");

-- CreateIndex
CREATE INDEX "TerminalDevice_deviceId_idx" ON "TerminalDevice"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_retailerId_key" ON "Wallet"("retailerId");

-- CreateIndex
CREATE INDEX "WalletLedger_walletId_idx" ON "WalletLedger"("walletId");

-- CreateIndex
CREATE INDEX "WalletLedger_type_idx" ON "WalletLedger"("type");

-- CreateIndex
CREATE INDEX "WalletLedger_status_idx" ON "WalletLedger"("status");

-- CreateIndex
CREATE INDEX "WalletLedger_createdAt_idx" ON "WalletLedger"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategoryModel_name_key" ON "ProductCategoryModel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategoryModel_slug_key" ON "ProductCategoryModel"("slug");

-- CreateIndex
CREATE INDEX "ProductCategoryModel_slug_idx" ON "ProductCategoryModel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_code_key" ON "Provider"("code");

-- CreateIndex
CREATE INDEX "Provider_code_idx" ON "Provider"("code");

-- CreateIndex
CREATE INDEX "Provider_status_idx" ON "Provider"("status");

-- CreateIndex
CREATE INDEX "ProviderProduct_productId_idx" ON "ProviderProduct"("productId");

-- CreateIndex
CREATE INDEX "ProviderProduct_isActive_idx" ON "ProviderProduct"("isActive");

-- CreateIndex
CREATE INDEX "ProviderProduct_priority_idx" ON "ProviderProduct"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProduct_providerId_productId_key" ON "ProviderProduct"("providerId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "PinBatch_batchCode_key" ON "PinBatch"("batchCode");

-- CreateIndex
CREATE INDEX "PinBatch_productId_idx" ON "PinBatch"("productId");

-- CreateIndex
CREATE INDEX "PinBatch_batchCode_idx" ON "PinBatch"("batchCode");

-- CreateIndex
CREATE UNIQUE INDEX "PinInventory_pinHash_key" ON "PinInventory"("pinHash");

-- CreateIndex
CREATE INDEX "PinInventory_batchId_idx" ON "PinInventory"("batchId");

-- CreateIndex
CREATE INDEX "PinInventory_status_idx" ON "PinInventory"("status");

-- CreateIndex
CREATE INDEX "PinInventory_pinHash_idx" ON "PinInventory"("pinHash");

-- CreateIndex
CREATE INDEX "PinInventory_transactionId_idx" ON "PinInventory"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE INDEX "Transaction_retailerId_idx" ON "Transaction"("retailerId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_reference_idx" ON "Transaction"("reference");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "TransactionItem_transactionId_idx" ON "TransactionItem"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionItem_productId_idx" ON "TransactionItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderTransaction_transactionId_key" ON "ProviderTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "ProviderTransaction_providerId_idx" ON "ProviderTransaction"("providerId");

-- CreateIndex
CREATE INDEX "ProviderTransaction_status_idx" ON "ProviderTransaction"("status");

-- CreateIndex
CREATE INDEX "ProviderTransaction_providerReference_idx" ON "ProviderTransaction"("providerReference");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_transactionId_key" ON "Receipt"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "Receipt_receiptNumber_idx" ON "Receipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_retailerId_idx" ON "AuditLog"("retailerId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_idx" ON "WebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");

-- CreateIndex
CREATE INDEX "WebhookEvent_provider_idx" ON "WebhookEvent"("provider");

-- CreateIndex
CREATE INDEX "WebhookEvent_createdAt_idx" ON "WebhookEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "RetailerOutlet" ADD CONSTRAINT "RetailerOutlet_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailerStaff" ADD CONSTRAINT "RetailerStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailerStaff" ADD CONSTRAINT "RetailerStaff_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "RetailerOutlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerminalDevice" ADD CONSTRAINT "TerminalDevice_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "RetailerOutlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedger" ADD CONSTRAINT "WalletLedger_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategoryModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderProduct" ADD CONSTRAINT "ProviderProduct_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderProduct" ADD CONSTRAINT "ProviderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinInventory" ADD CONSTRAINT "PinInventory_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "PinBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTransaction" ADD CONSTRAINT "ProviderTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTransaction" ADD CONSTRAINT "ProviderTransaction_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
