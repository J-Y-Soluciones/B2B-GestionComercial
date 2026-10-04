-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING_TRANSMISSION', 'ACCEPTED', 'REJECTED', 'ANULLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD_POS', 'BANK_TRANSFER', 'YAPE_PLIN');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING_TRANSMISSION', 'ACCEPTED', 'REJECTED', 'ANULLED');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('BOLETA', 'FACTURA', 'NOTA_VENTA');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD_POS', 'BANK_TRANSFER', 'YAPE_PLIN');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "ProformaDetail" ADD COLUMN IF NOT EXISTS "supplierId" UUID;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "ProformaDetail" ADD COLUMN IF NOT EXISTS "supplierId" UUID;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Sale" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "proformaId" UUID,
    "customerId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "igvAmount" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SaleDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "saleId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "costPrice" DECIMAL(12,2) NOT NULL,
    "priceTier" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "saleId" UUID NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "receivedAmount" DECIMAL(12,2),
    "changeAmount" DECIMAL(12,2),
    "operationCode" VARCHAR(100),
    "reference" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "saleId" UUID NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "series" VARCHAR(10) NOT NULL,
    "correlative" INTEGER NOT NULL,
    "fullCode" VARCHAR(50) NOT NULL,
    "status" "InvoiceStatus" NOT NULL,
    "hashCpe" TEXT,
    "externalId" VARCHAR(100),
    "qrCodeUrl" TEXT,
    "cdrHash" TEXT,
    "errorMessage" TEXT,
    "issuedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Sale_code_key" ON "Sale"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "Sale_proformaId_key" ON "Sale"("proformaId");
CREATE INDEX IF NOT EXISTS "Sale_code_idx" ON "Sale"("code");
CREATE INDEX IF NOT EXISTS "Sale_customerId_idx" ON "Sale"("customerId");
CREATE INDEX IF NOT EXISTS "Sale_sellerId_idx" ON "Sale"("sellerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SaleDetail_saleId_idx" ON "SaleDetail"("saleId");
CREATE INDEX IF NOT EXISTS "SaleDetail_productId_idx" ON "SaleDetail"("productId");
CREATE INDEX IF NOT EXISTS "SaleDetail_supplierId_idx" ON "SaleDetail"("supplierId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_saleId_idx" ON "Payment"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_saleId_key" ON "Invoice"("saleId");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_fullCode_key" ON "Invoice"("fullCode");
CREATE INDEX IF NOT EXISTS "Invoice_fullCode_idx" ON "Invoice"("fullCode");
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"("status");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Sale_customerId_fkey') THEN
        ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Sale_sellerId_fkey') THEN
        ALTER TABLE "Sale" ADD CONSTRAINT "Sale_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Sale_proformaId_fkey') THEN
        ALTER TABLE "Sale" ADD CONSTRAINT "Sale_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "Proforma"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SaleDetail_saleId_fkey') THEN
        ALTER TABLE "SaleDetail" ADD CONSTRAINT "SaleDetail_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SaleDetail_productId_fkey') THEN
        ALTER TABLE "SaleDetail" ADD CONSTRAINT "SaleDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SaleDetail_supplierId_fkey') THEN
        ALTER TABLE "SaleDetail" ADD CONSTRAINT "SaleDetail_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_saleId_fkey') THEN
        ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_saleId_fkey') THEN
        ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;