export interface Customer {
  _id?: string;

  customerId: string;

  name: string;

  mobile: string;

  address?: string;

  dueAmount?: number;

  createdAt?: string;

  updatedAt?: string;
}
