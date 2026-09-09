export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  isActive: boolean;
  image?: string;
}
