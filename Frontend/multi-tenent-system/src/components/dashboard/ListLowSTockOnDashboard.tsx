/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLowStockProducts } from "@/hooks/useLowStockProducts";

const LowStockWidget = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useLowStockProducts({
    page: 1,
    limit: 2,
    search: "",
    category: "",
    sort: "stock",
  });

  const products = data?.data?.products || [];

  return (
    <Card className="border-slate-800 bg-slate-900 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Low Stock Products</CardTitle>

        <AlertTriangle className="h-5 w-5 text-red-400" />
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-slate-800"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="space-y-3">
              {products.map((product: any) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 p-3"
                >
                  <div>
                    <p className="font-medium text-white">{product.name}</p>

                    <p className="text-xs text-slate-400">
                      Threshold: {product.lowStockThreshold}
                    </p>
                  </div>

                  <span className="rounded-md bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                    Stock: {product.stock}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/products/low-stock")}
              className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              View All
            </button>
          </>
        ) : (
          <div className="py-6 text-center">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-slate-500" />

            <p className="text-sm text-slate-400">No low stock products 🎉</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockWidget;
