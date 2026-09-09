import mongoose from "mongoose";
import Product from "../models/product.model";
import { Customer } from "../models/customer.model";
import { Sale } from "../models/sale.model";

export const getDashboardStatsService = async (shopId: string) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const shopObjectId = new mongoose.Types.ObjectId(shopId);

  const [
    totalProducts,
    lowStockCount,
    customerCount,
    outstandingCustomers,
    todaySales,
    inventoryValue,
  ] = await Promise.all([
    Product.countDocuments({
      shopId: shopObjectId,
      isActive: true,
    }),

    Product.countDocuments({
      shopId: shopObjectId,
      isActive: true,
      $expr: {
        $lte: ["$stock", "$lowStockThreshold"],
      },
    }),

    Customer.countDocuments({
      shopId: shopObjectId,
      isActive: true,
    }),

    Customer.find({
      shopId: shopObjectId,
      isActive: true,
      dueAmount: {
        $gt: 0,
      },
    }),

    Sale.find({
      shopId: shopObjectId,
      createdAt: {
        $gte: startOfDay,
      },
    }),

    // Current inventory value
    Product.aggregate([
      {
        $match: {
          shopId: shopObjectId,
          isActive: true,
        },
      },

      {
        $group: {
          _id: null,

          totalPurchaseAmount: {
            $sum: {
              $multiply: ["$stock", "$purchasePrice"],
            },
          },

          totalSellingAmount: {
            $sum: {
              $multiply: ["$stock", "$sellingPrice"],
            },
          },
        },
      },
    ]),
  ]);

  const outstandingAmount = outstandingCustomers.reduce((sum, customer) => {
    return sum + Number(customer.dueAmount || 0);
  }, 0);

  // Today's sales
  const totalSales = todaySales.reduce((sum, sale) => {
    return sum + Number(sale.totalAmount || 0);
  }, 0);

  // Today's profit
  let totalProfit = 0;

  for (const sale of todaySales) {
    for (const item of sale.items) {
      const product = await Product.findById(item.productId);

      if (!product) continue;

      const sellingAmount = Number(item.price) * Number(item.quantity);

      const purchaseAmount =
        Number(product.purchasePrice) * Number(item.quantity);

      totalProfit += sellingAmount - purchaseAmount;
    }
  }

  // Current inventory values
  const totalPurchaseAmount = Number(
    inventoryValue[0]?.totalPurchaseAmount || 0,
  );

  const totalSellingAmount = Number(inventoryValue[0]?.totalSellingAmount || 0);

  return {
    todaySales: totalSales,

    todayProfit: totalProfit,

    totalPurchaseAmount,

    totalSellingAmount,

    totalProducts,

    lowStockCount,

    outstandingAmount,

    customerCount,
  };
};
