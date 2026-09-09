import SalesTrendChart from "../../components/dashboard/SalesTrendChart";
import StatCard from "../../components/dashboard/StatCard";
import { useSalesTrend } from "../../hooks/useSalesTrend";
import TopProducts from "@/components/dashboard/TopProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ListLowSTockOnDashboard from "@/components/dashboard/ListLowSTockOnDashboard";
const Dashboard = () => {
  const { data: salesTrend = [], isLoading } = useSalesTrend();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl text-gray-400 tracking-wider">Dashboard</h1>

      <StatCard />

      <div className="mt-6 rounded-xl bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold ">Sales Trend</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <SalesTrendChart data={salesTrend} />
          )}
          <TopProducts />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ListLowSTockOnDashboard />

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>

          <CardContent>Coming Soon...</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
