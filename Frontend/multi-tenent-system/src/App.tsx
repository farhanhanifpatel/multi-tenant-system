import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./routes/PublicRoute";
import HomeRedirect from "./routes/HomeRedirect";
import DashboardLayout from "./components/layout/DashboardLayout";
import CreateProduct from "./pages/product/CreateProduct";
import ProductList from "./pages/product/ProductList";
import LowStockProducts from "./pages/product/LowStockProducts";
import CustomerList from "./pages/customers/CustomerList";

import SaleList from "./pages/sales/SaleList";

import CustomerOutstanding from "./pages/customers/GetOutStanding";
import Register from "./pages/auth/Register";
// import path from "path";
import SupplierList from "./pages/suppliers/SupplierList";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route path="/" element={<HomeRedirect />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/products" element={<ProductList />} />

          <Route path="/products/create" element={<CreateProduct />} />

          <Route path="/customers" element={<CustomerList />} />

          <Route path="/suppliers" element={<SupplierList />} />

          <Route path="/sales" element={<SaleList />} />

          <Route path="/products/low-stock" element={<LowStockProducts />} />

          <Route
            path="/customers/outstanding"
            element={<CustomerOutstanding />}
          />
        </Route>
      </Routes>

      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
