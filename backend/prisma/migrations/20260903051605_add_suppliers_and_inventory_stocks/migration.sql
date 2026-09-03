/*
  Warnings:

  - Added the required column `brand` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" VARCHAR(100) NOT NULL,
ADD COLUMN     "minStock" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "Supplier" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ruc" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "contactName" VARCHAR(150),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierProductStock" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "supplierSku" VARCHAR(100),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "costPrice" DECIMAL(12,2) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SupplierProductStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_ruc_key" ON "Supplier"("ruc");

-- CreateIndex
CREATE INDEX "Supplier_ruc_idx" ON "Supplier"("ruc");

-- CreateIndex
CREATE INDEX "SupplierProductStock_productId_idx" ON "SupplierProductStock"("productId");

-- CreateIndex
CREATE INDEX "SupplierProductStock_supplierId_idx" ON "SupplierProductStock"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProductStock_productId_supplierId_key" ON "SupplierProductStock"("productId", "supplierId");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "Product"("brand");

-- AddForeignKey
ALTER TABLE "SupplierProductStock" ADD CONSTRAINT "SupplierProductStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProductStock" ADD CONSTRAINT "SupplierProductStock_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
