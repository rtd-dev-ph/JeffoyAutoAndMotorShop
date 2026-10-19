/**
 * TypeScript interfaces mirroring the C# DTOs returned by the backend API.
 * Source: backend/JeffoyAutoAndMotorShop.Api/DTOs/
 */

// ─── Categories ───────────────────────────────────────────────

export interface CategoryDto {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string | null;
}

// ─── Products ─────────────────────────────────────────────────

export interface ProductDto {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  categoryId: number;
  categoryName: string | null;
  costPrice: number;         // decimal → number
  sellingPrice: number;      // decimal → number
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;       // computed property
  isActive: boolean;
  createdAtUtc: string;      // DateTime → ISO string
  updatedAtUtc: string;      // DateTime → ISO string
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string | null;
  categoryId: number;
  costPrice: number;
  sellingPrice: number;
  openingStock: number;
  lowStockThreshold?: number; // defaults to 5
  openingStockReason?: string | null;
}

export interface UpdateProductDto {
  sku: string;
  name: string;
  description?: string | null;
  categoryId: number;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
  isActive: boolean;
}

// ─── Sales ────────────────────────────────────────────────────

export interface CheckoutItemDto {
  productId: number;
  quantity: number;
}

export interface CheckoutDto {
  items: CheckoutItemDto[];
  paymentMethod: string; // "Cash" | "GCash"
}

export interface SaleItemDto {
  productId: number;
  productSKU: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  lineTotal: number;
}

export interface CheckoutResponseDto {
  saleId: number;
  saleNumber: string;
  grandTotal: number;
  paymentMethod: string;
  createdAtUtc: string;
  items: SaleItemDto[];
}

export interface SaleDto {
  id: number;
  saleNumber: string;
  grandTotal: number;
  paymentMethod: string;
  status: string;        // "Completed" | "Voided"
  createdAtUtc: string;
  voidedAtUtc: string | null;
  voidReason: string | null;
  items: SaleItemDto[];
}

export interface VoidSaleDto {
  reason: string;
}

// ─── Stock Movements ──────────────────────────────────────────

export interface StockMovementDto {
  id: number;
  productId: number;
  productName: string;
  productSKU: string;
  movementType: string;   // "OpeningStock" | "Sale" | "Restock" | "Adjustment"
  quantityChange: number;
  resultingStockQuantity: number;
  saleId: number | null;
  reference: string | null;
  createdAtUtc: string;
}

// ─── Reports ─────────────────────────────────────────────────

export interface DailySalesReportDto {
  date: string;          // DateOnly → "YYYY-MM-DD"
  transactionCount: number;
  totalItemsSold: number;
  totalSales: number;
  cashTotal: number;
  gCashTotal: number;
  sales: SaleDto[];
}

// ─── Health ───────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  database: string;
}

// ─── Utility ─────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
