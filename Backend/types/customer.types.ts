export interface CreateCustomerRequest {
  name: string;
  mobile: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  mobile?: string;
  address?: string;
}

export interface CustomerResponse {
  customerId: string;
  name: string;
  mobile: string;
  address?: string;
}
