export const BUSINESS_TYPES = [
  "GROCERY",
  "MEDICAL",
  "CLOTHING",
  "FOOTWEAR",
  "HARDWARE",
  "ELECTRONICS",
  "OTHER",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
