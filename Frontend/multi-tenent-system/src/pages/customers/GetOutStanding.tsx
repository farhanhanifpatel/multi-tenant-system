/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { Badge } from "../../components/ui/badge";
import { useOutstanding } from "@/hooks/useTransaction";

const CustomerOutstanding = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-dueAmount");

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching } = useOutstanding({
    page,
    limit: 10,
    search: debouncedSearch,
    sort,
  });

  const customers = data?.data?.customers || [];
  const pagination = data?.data?.pagination;
  const totalOutstanding = data?.data?.totalOutstanding || 0;

  return (
    <div className="rounded-xl bg-slate-900 p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Customer Outstanding
          </h1>

          <div className="mt-2 flex gap-6 text-sm text-slate-400">
            <p className="text-slate-400">
              Amount to Receive:
              <span className="ml-2 text-xl font-bold text-green-400">
                ₹{totalOutstanding.toLocaleString("en-IN")}
              </span>
            </p>

            <p>
              Customers:
              <span className="ml-2 font-bold text-white">
                {pagination?.total || 0}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <div className="relative w-full lg:w-80">
          <input
            placeholder="Search by customer name or mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 pr-10 text-white"
          />

          {isFetching && (
            <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white"
        >
          <option value="-dueAmount">Highest Due Amount</option>
          <option value="dueAmount">Lowest Due Amount</option>
          <option value="name">Customer A-Z</option>
          <option value="-name">Customer Z-A</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="min-w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Due Amount</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-slate-800">
                  <td className="p-3">
                    <div className="h-4 w-28 rounded bg-slate-700" />
                  </td>

                  <td className="p-3">
                    <div className="h-4 w-24 rounded bg-slate-700" />
                  </td>

                  <td className="p-3">
                    <div className="h-4 w-20 rounded bg-slate-700" />
                  </td>
                </tr>
              ))
            ) : customers.length > 0 ? (
              customers.map((customer: any) => (
                <tr
                  key={customer._id}
                  className="border-b border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="p-3 font-medium">{customer.name}</td>

                  <td className="p-3">{customer.mobile}</td>

                  <td className="p-3">
                    <Badge
                      variant="destructive"
                      className="px-3 py-1 text-sm font-semibold"
                    >
                      ₹{customer.dueAmount.toLocaleString()}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-400">
                  No outstanding customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination?.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded bg-slate-700 px-4 py-2 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-3 py-2">
            {pagination.page} / {pagination.totalPages}
          </span>

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded bg-blue-600 px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerOutstanding;
