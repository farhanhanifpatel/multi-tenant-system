import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import type { DashboardStats } from "../../types/dashboard.types";

import {
  Package,
  User,
  CircleDollarSign,
  ShoppingCart,
  BadgeDollarSign,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  route?: string;
  bg: string;
  iconColor: string;
}

const StatCard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ----------------------------------------
  // Fetch Dashboard Statistics
  // ----------------------------------------

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");

        console.log("Dashboard Stats:", response.data);

        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ----------------------------------------
  // Loading State
  // ----------------------------------------

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} className="border-slate-800 bg-slate-900">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-28 bg-slate-800" />

                  <Skeleton className="h-9 w-24 bg-slate-800" />

                  <Skeleton className="h-3 w-32 bg-slate-800" />
                </div>

                <Skeleton className="h-12 w-12 rounded-xl bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ----------------------------------------
  // Error State
  // ----------------------------------------

  if (!stats) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        Failed to load dashboard statistics.
      </div>
    );
  }

  // ----------------------------------------
  // Currency Formatter
  // ----------------------------------------

  const formatCurrency = (amount: number) => {
    return `ZK ${Number(amount || 0).toLocaleString("en-ZM", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ----------------------------------------
  // Dashboard Cards
  // ----------------------------------------

  const cards: StatCardItem[] = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      route: "/products",
      bg: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },

    {
      title: "Customers",
      value: stats.customerCount,
      icon: User,
      route: "/customers",
      bg: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
    },

    {
      title: "Today's Profit",
      value: formatCurrency(stats.todayProfit),
      icon: CircleDollarSign,
      route: "/sales",
      bg: "bg-green-500/10",
      iconColor: "text-green-400",
    },

    {
      title: "Outstanding",
      value: formatCurrency(stats.outstandingAmount),
      icon: CircleDollarSign,
      route: "/customers/outstanding",
      bg: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },

    {
      title: "Total Purchase Amount",
      value: formatCurrency(stats.totalPurchaseAmount),
      icon: ShoppingCart,
      bg: "bg-red-500/10",
      iconColor: "text-red-400",
    },

    {
      title: "Total Selling Amount",
      value: formatCurrency(stats.totalSellingAmount),
      icon: BadgeDollarSign,
      bg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
  ];

  // ----------------------------------------
  // Dashboard UI
  // ----------------------------------------

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        const isClickable = Boolean(card.route);

        return (
          <Card
            key={card.title}
            onClick={() => {
              if (card.route) {
                navigate(card.route);
              }
            }}
            className={`
              group
              border-slate-800
              bg-slate-900
              transition-all
              duration-300
              ${
                isClickable
                  ? "cursor-pointer hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10"
                  : "cursor-default"
              }
            `}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                {/* -------------------------------- */}
                {/* Card Content */}
                {/* -------------------------------- */}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-5 text-slate-400">
                    {card.title}
                  </p>

                  {/* 
                    IMPORTANT:
                    Do NOT use "truncate" here.
                    Otherwise amounts become:
                    ZK ...
                  */}

                  <h2 className="mt-3 whitespace-nowrap text-2xl font-bold text-slate-100">
                    {card.value}
                  </h2>

                  <p className="mt-2 text-xs text-slate-500">
                    Updated recently
                  </p>
                </div>

                {/* -------------------------------- */}
                {/* Icon */}
                {/* -------------------------------- */}

                <div
                  className={`
                    shrink-0
                    rounded-xl
                    p-3
                    transition-all
                    duration-300
                    ${card.bg}
                    ${
                      isClickable
                        ? "group-hover:scale-110 group-hover:rotate-2"
                        : ""
                    }
                  `}
                >
                  <Icon
                    className={`h-6 w-6 ${card.iconColor}`}
                    strokeWidth={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatCard;
