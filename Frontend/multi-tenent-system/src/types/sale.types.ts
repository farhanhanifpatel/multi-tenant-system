export interface SaleItem {
  productId: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    sellingPrice: number;
    unit: string;
  };

  quantity: number;
  price: number;
  subtotal: number;
}

export interface SaleCustomer {
  _id: string;
  name: string;
  mobile: string;
  address: string;
  dueAmount: number;
}

export interface Sale {
  _id: string;

  customerId: SaleCustomer;

  items: SaleItem[];

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  paymentMethod: string;
  paymentStatus: string;

  createdAt: string;
}
