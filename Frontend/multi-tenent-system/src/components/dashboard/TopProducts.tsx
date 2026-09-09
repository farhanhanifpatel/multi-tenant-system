import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Skeleton } from "@/components/ui/skeleton";

import { useTopProducts } from "../../hooks/useTopProduct";

const TopProducts = () => {
  const { data, isLoading } = useTopProducts();

  const [showAll, setShowAll] = useState(false);

  const products = data?.data || [];

  // Only show first 5 products on dashboard
  const topFiveProducts = products.slice(0, 5);

  const maxSold = Math.max(...products.map((p: any) => p.quantitySold), 1);

  if (isLoading) {
    return (
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Top Selling Products</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item}>
              <Skeleton className="mb-2 h-4 w-full bg-slate-800" />
              <Skeleton className="h-2 w-full bg-slate-800" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* ================= DASHBOARD CARD ================= */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Top Selling Products</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {topFiveProducts.map((product: any) => (
            <div key={product.productId}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="truncate text-sm text-slate-300">
                  {product.name}
                </span>

                <span className="shrink-0 text-sm font-semibold text-green-400">
                  {product.quantitySold}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-1000"
                  style={{
                    width: `${(product.quantitySold / maxSold) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}

          {/* No products */}
          {products.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">
              No sales found
            </p>
          )}

          {/* View All Button */}
          {products.length > 5 && (
            <div className="border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                View Top Selling Products
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================= ALL PRODUCTS MODAL ================= */}
      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden border-slate-700 bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              All Top Selling Products
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-2">
            {products.map((product: any) => (
              <div key={product.productId}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="truncate text-sm text-slate-300">
                    {product.name}
                  </span>

                  <span className="shrink-0 text-sm font-semibold text-green-400">
                    {product.quantitySold}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                    style={{
                      width: `${(product.quantitySold / maxSold) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TopProducts;
