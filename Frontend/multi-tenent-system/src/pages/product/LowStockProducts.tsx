/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLowStockProducts } from "../../hooks/useLowStockProducts";
import { useDebounce } from "../../hooks/useDebounce";

const BUSINESS_TYPES = [
  "GROCERY",
  "MEDICAL",
  "CLOTHING",
  "FOOTWEAR",
  "HARDWARE",
  "ELECTRONICS",
  "OTHER",
];

const LowStockProducts = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("stock");

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching } = useLowStockProducts({
    page,
    limit: 10,
    search: debouncedSearch,
    category,
    sort,
  });

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Low Stock Products</h1>

          <p className="text-slate-400">Products that need restocking</p>
        </div>

        <button
          onClick={() => navigate("/products")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
        >
          All Products
        </button>
      </div>

      {isFetching && (
        <div className="mb-3 text-sm text-blue-400">Loading products...</div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white lg:w-80"
        />

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white"
        >
          <option value="">All Categories</option>

          {BUSINESS_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white"
        >
          <option value="stock">Stock Low-High</option>
          <option value="-stock">Stock High-Low</option>
          <option value="name">Name A-Z</option>
          <option value="-name">Name Z-A</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="min-w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-4 text-left text-white">Product</th>
              <th className="p-4 text-left text-white">SKU</th>
              <th className="p-4 text-left text-white">Stock</th>
              <th className="p-4 text-left text-white">Threshold</th>
              <th className="p-4 text-left text-white">Status</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td className="p-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-700" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-700" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-12 animate-pulse rounded bg-slate-700" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-12 animate-pulse rounded bg-slate-700" />
                  </td>
                  <td className="p-4">
                    <div className="h-6 w-24 animate-pulse rounded bg-slate-700" />
                  </td>
                </tr>
              ))
            ) : products.length > 0 ? (
              products.map((product: any) => (
                <tr
                  key={product._id}
                  className="border-t border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="p-4 text-white">{product.name}</td>

                  <td className="p-4 text-slate-300">{product.sku}</td>

                  <td className="p-4">
                    <span className="rounded bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-400">
                      {product.stock}
                    </span>
                  </td>

                  <td className="p-4 text-slate-300">
                    {product.lowStockThreshold}
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      Low Stock
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-slate-500" />

                  <h3 className="text-lg font-medium text-white">
                    No low stock products
                  </h3>

                  <p className="mt-1 text-slate-400">
                    All products are sufficiently stocked 🎉
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-slate-400">
            Showing page {pagination.page} of {pagination.totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <div className="rounded-lg bg-blue-600 px-4 py-2 text-white">
              {pagination.page}
            </div>

            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockProducts;
