import ExcelJS from "exceljs";
import Product from "../models/product.model";

export const exportProductsService = async (
  shopId: string,
  queryParams: Record<string, any>,
) => {
  // ----------------------------------------
  // 1. Build filter
  // ----------------------------------------

  const filter: Record<string, any> = {
    shopId,
    isActive: true,
  };

  // Search by product name or SKU
  if (queryParams.search) {
    filter.$or = [
      {
        name: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
      {
        sku: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
    ];
  }

  // Category filter
  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  // ----------------------------------------
  // 2. Get products
  // ----------------------------------------

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

  // ----------------------------------------
  // 3. Create Excel workbook
  // ----------------------------------------

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Multi Tenant CRM";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Products");

  // ----------------------------------------
  // 4. Define Excel columns
  // ----------------------------------------

  worksheet.columns = [
    {
      header: "Product Name",
      key: "name",
      width: 30,
    },
    {
      header: "SKU",
      key: "sku",
      width: 20,
    },
    {
      header: "Category",
      key: "category",
      width: 20,
    },
    {
      header: "Purchase Price",
      key: "purchasePrice",
      width: 18,
    },
    {
      header: "Stock",
      key: "stock",
      width: 15,
    },
    {
      header: "Low Stock Threshold",
      key: "lowStockThreshold",
      width: 22,
    },
    {
      header: "Unit",
      key: "unit",
      width: 15,
    },
  ];

  // ----------------------------------------
  // 5. Add products to Excel
  // ----------------------------------------

  products.forEach((product: any) => {
    worksheet.addRow({
      name: product.name ?? "",
      sku: product.sku ?? "",
      category: product.category ?? "",
      purchasePrice: product.purchasePrice ?? 0,
      stock: product.stock ?? 0,
      lowStockThreshold: product.lowStockThreshold ?? 0,
      unit: product.unit ?? "",
    });
  });

  // ----------------------------------------
  // 6. Format header
  // ----------------------------------------

  const headerRow = worksheet.getRow(1);

  headerRow.font = {
    bold: true,
  };

  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  // ----------------------------------------
  // 7. Format purchase price
  // ----------------------------------------

  worksheet.getColumn("purchasePrice").numFmt = "#,##0.00";

  // ----------------------------------------
  // 8. Freeze header row
  // ----------------------------------------

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  // ----------------------------------------
  // 9. Generate Excel buffer
  // ----------------------------------------

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};
