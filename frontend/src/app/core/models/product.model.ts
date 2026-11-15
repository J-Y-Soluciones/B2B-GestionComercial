// frontend/src/app/core/models/product.model.ts

export interface PriceTier {
  id: string;
  productId: string;
  tier: number;
  price: string | number;
  createdAt: string;
}

export interface ProductQuantityTier {
  id: string;
  productId: string;
  minQuantity: number;
  maxQuantity: number | null;
  tierPrice: string | number;
  isActive: boolean;
  createdAt: string;
}

export interface SupplierStock {
  id: string;
  productId: string;
  supplierId: string;
  supplierName?: string;
  supplierSku: string | null;
  stock: number;
  guaranteeStock: number; // <--- Stock retenido por fallas/garantías
  costPrice: string | number;
  updatedAt: string;
}

export interface Product {
  id: string;
  internalCode: string;
  barcode?: string | null; // <--- Código EAN / Barras
  name: string;
  category: string;
  brand: string;
  minStock: number;
  isActive: boolean;
  isTaxable: boolean; // <--- Semáforo Fiscal (true: 🟢 Facturable, false: 🔴 Sin Factura)
  totalStock: number;
  priceTiers: PriceTier[];
  quantityTiers?: ProductQuantityTier[];
  stocks: SupplierStock[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface ProductSearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  inStock?: boolean;
  isTaxable?: boolean; // <--- Filtro por semáforo fiscal
  limit?: number;
}
