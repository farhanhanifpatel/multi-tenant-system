import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandling } from "./middleware/err_handler.middleware";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import customerRoutes from "./routes/customer.route";
import saleRoutes from "./routes/sale.route";
import transactionRoutes from "./routes/transaction.route";
import dashboardRoutes from "./routes/dashboard.route";
import supplierRoutes from "./routes/supplier.routes";
import supplierPurchaseRoutes from "./routes/supplier-purchase.route";

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/suppliers", supplierRoutes);

app.use("/api/supplier-purchases", supplierPurchaseRoutes);
app.use(errorHandling);

export default app;
