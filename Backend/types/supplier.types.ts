import type { Types } from "mongoose";

/* =========================================================
   CREATE SUPPLIER
========================================================= */

export interface CreateSupplierRequest {
  name: string;
  companyName?: string;
  mobile: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;
}

/* =========================================================
   UPDATE SUPPLIER
========================================================= */

export interface UpdateSupplierRequest {
  name?: string;
  companyName?: string;
  mobile?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;
  isActive?: boolean;
}

/* =========================================================
   SUPPLIER RESPONSE
========================================================= */

export interface SupplierResponse {
  _id: Types.ObjectId;
  shopId: Types.ObjectId;

  name: string;
  companyName?: string;
  mobile: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/* =========================================================
   SUPPLIER LIST QUERY
========================================================= */

export interface SupplierQuery {
  search?: string;
  isActive?: string;
  page?: string;
  limit?: string;
  sort?: string;
}
