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

  return (
    <Card className="bg-slate-900 border-slate-800 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Low Stock Products</CardTitle>

        <AlertTriangle className="h-5 w-5 text-red-400" />
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded bg-slate-800"
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-slate-400">No low stock products 🎉</p>
        ) : (
          <>
            <div className="space-y-3">
              {data.slice(0, 5).map((product: any) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 p-3"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>

                    <p className="text-xs text-slate-400">
                      Threshold: {product.lowStockThreshold}
                    </p>
                  </div>

                  <span className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">
                    {product.stock}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/products/low-stock")}
              className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm hover:bg-blue-500"
            >
              View All
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockWidget;
