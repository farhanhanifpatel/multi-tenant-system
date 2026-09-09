export interface Supplier {
  _id: string;
  shopId: string;

  name: string;
  companyName?: string;
  mobile: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;

  totalPurchaseAmount: number;
  totalPaidAmount: number;
  dueAmount: number;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  companyName?: string;
  mobile: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  companyName?: string;
  mobile?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;
}
