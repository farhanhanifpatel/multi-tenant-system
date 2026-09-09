export const generateSlug = (shopName: string): string => {
  return shopName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};
