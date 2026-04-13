-- AlterEnum
ALTER TYPE "Platform" ADD VALUE 'NUVEMSHOP';

-- CreateEnum
CREATE TYPE "NuvemshopOrderStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NuvemshopPaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'VOIDED', 'REFUNDED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "NuvemshopFulfillmentStatus" AS ENUM ('UNPACKED', 'FULFILLED', 'UNFULFILLED', 'PARTIALLY_FULFILLED');

-- CreateTable
CREATE TABLE "NuvemshopStore" (
    "id" TEXT NOT NULL,
    "platformAccountId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "storeName" TEXT,
    "storeUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "scopes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NuvemshopStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NuvemshopOrder" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "nuvemshopOrderId" TEXT NOT NULL,
    "orderNumber" INTEGER,
    "status" "NuvemshopOrderStatus" NOT NULL DEFAULT 'OPEN',
    "paymentStatus" "NuvemshopPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "fulfillmentStatus" "NuvemshopFulfillmentStatus" NOT NULL DEFAULT 'UNPACKED',
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shippingCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "productsCount" INTEGER NOT NULL DEFAULT 0,
    "couponCodes" TEXT[],
    "customerEmail" TEXT,
    "customerName" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "landingUrl" TEXT,
    "referralUrl" TEXT,
    "storefront" TEXT,
    "ga4TransactionId" TEXT,
    "ga4Matched" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "orderCreatedAt" TIMESTAMP(3) NOT NULL,
    "rawData" JSONB,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NuvemshopOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NuvemshopStore_platformAccountId_key" ON "NuvemshopStore"("platformAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "NuvemshopStore_storeId_key" ON "NuvemshopStore"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "NuvemshopOrder_storeId_nuvemshopOrderId_key" ON "NuvemshopOrder"("storeId", "nuvemshopOrderId");

-- CreateIndex
CREATE INDEX "NuvemshopOrder_storeId_orderCreatedAt_idx" ON "NuvemshopOrder"("storeId", "orderCreatedAt");

-- CreateIndex
CREATE INDEX "NuvemshopOrder_storeId_paymentStatus_idx" ON "NuvemshopOrder"("storeId", "paymentStatus");

-- CreateIndex
CREATE INDEX "NuvemshopOrder_ga4TransactionId_idx" ON "NuvemshopOrder"("ga4TransactionId");

-- CreateIndex
CREATE INDEX "NuvemshopOrder_orderCreatedAt_idx" ON "NuvemshopOrder"("orderCreatedAt");

-- AddForeignKey
ALTER TABLE "NuvemshopStore" ADD CONSTRAINT "NuvemshopStore_platformAccountId_fkey" FOREIGN KEY ("platformAccountId") REFERENCES "PlatformAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NuvemshopOrder" ADD CONSTRAINT "NuvemshopOrder_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "NuvemshopStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
