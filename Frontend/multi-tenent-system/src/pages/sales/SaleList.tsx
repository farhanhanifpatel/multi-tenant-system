/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useSales } from "../../hooks/useSales";
import { useDebounce } from "../../hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSaleById } from "../../services/sale.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useProducts } from "@/hooks/useProduct";
import { useCustomer } from "@/hooks/useCustomer";

import { createSale } from "../../services/sale.service";
import toast from "react-hot-toast";

const SalesList = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-createdAt");

  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [loadingSale, setLoadingSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState(0);

  const [items, setItems] = useState<
    {
      productId: string;
      quantity: number;
    }[]
  >([]);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching } = useSales({
    page,
    limit: 10,
    search: debouncedSearch,
    sort,
  });

  const sales = data?.data?.sales || [];
  const pagination = data?.data?.pagination;

  const { data: productsData } = useProducts({
    page: 1,
    limit: 100,
    search: "",
    category: "",
    sort: "-createdAt",
  });

  const salesData = productsData;

  const { data: customersData } = useCustomer({
    page: 1,
    limit: 100,
    search: "",
    sort: "-createdAt",
  });

  const handleView = async (id: string) => {
    try {
      setLoadingSale(true);

      const response = await getSaleById(id);

      setSelectedSale(response.data);

      setOpenView(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSale(false);
    }
  };

  const handleCreateSale = async () => {
    const payload = {
      customerId: customerId || undefined,
      paymentMethod,
      paidAmount,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      await createSale(payload as any);

      toast.success("Sale created successfully");

      setOpen(false);

      // Refresh sales list
      await queryClient.invalidateQueries({
        queryKey: ["sales"],
      });
    } catch (error) {
      toast.error("Failed to create sale");
    }
  };

  return (
    <div className="rounded-xl bg-slate-900 p-6 ">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales</h1>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2"
        >
          + Create Sale
        </button>
      </div>
      {/* SEARCH + FILTERS */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        {/* SEARCH */}
        <div className="relative w-full lg:w-80">
          <input
            placeholder="Search customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 pr-10"
          />

          {isFetching && (
            <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          )}
        </div>

        {/* SORT */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
        >
          <option value="-createdAt">Newest</option>

          <option value="createdAt">Oldest</option>

          <option value="-totalAmount">Highest Amount</option>

          <option value="totalAmount">Lowest Amount</option>

          <option value="-dueAmount">Highest Due</option>

          <option value="dueAmount">Lowest Due</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-slate-800">
            <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-3 py-2.5 text-left">Customer</th>
              <th className="px-3 py-2.5 text-left">Mobile</th>
              <th className="px-3 py-2.5 text-center">Items</th>
              <th className="px-3 py-2.5 text-right">Total</th>
              <th className="px-3 py-2.5 text-right">Paid</th>
              <th className="px-3 py-2.5 text-right">Due</th>
              <th className="px-3 py-2.5 text-center">Status</th>
              <th className="px-3 py-2.5 text-left">Method</th>
              <th className="px-3 py-2.5 text-left">Date</th>
              <th className="px-3 py-2.5 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-slate-800">
                  <td className="px-3 py-2">
                    <div className="h-4 w-24 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-4 w-20 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="mx-auto h-5 w-8 rounded-full bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="ml-auto h-4 w-16 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="ml-auto h-4 w-16 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="ml-auto h-5 w-16 rounded-full bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="mx-auto h-6 w-16 rounded-full bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-4 w-16 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-4 w-20 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="mx-auto h-8 w-14 rounded bg-slate-700" />
                  </td>
                </tr>
              ))
            ) : sales.length > 0 ? (
              sales.map((sale: any) => (
                <tr
                  key={sale._id}
                  className="border-b border-slate-800 transition-colors hover:bg-slate-800/50"
                >
                  {/* CUSTOMER */}
                  <td className="max-w-[180px] px-3 py-2">
                    <span
                      className="block truncate font-medium text-slate-200"
                      title={sale.customerId?.name ?? "Walk-in Customer"}
                    >
                      {sale.customerId?.name ?? "Walk-in Customer"}
                    </span>
                  </td>

                  {/* MOBILE */}
                  <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                    {sale.customerId?.mobile ?? "-"}
                  </td>

                  {/* ITEMS */}
                  <td className="px-3 py-2 text-center">
                    <span className="inline-flex min-w-[30px] items-center justify-center rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                      {sale.items?.length ?? 0}
                    </span>
                  </td>

                  {/* TOTAL */}
                  <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-slate-200">
                    ZK {Number(sale.totalAmount || 0).toLocaleString()}
                  </td>

                  {/* PAID */}
                  <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-green-400">
                    ZK {Number(sale.paidAmount || 0).toLocaleString()}
                  </td>

                  {/* DUE */}
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                        Number(sale.dueAmount || 0) > 0
                          ? "border-red-500/20 bg-red-500/10 text-red-400"
                          : "border-green-500/20 bg-green-500/10 text-green-400"
                      }`}
                    >
                      ZK {Number(sale.dueAmount || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-3 py-2 text-center">
                    <Badge
                      variant={
                        sale.paymentStatus === "PAID"
                          ? "secondary"
                          : sale.paymentStatus === "PARTIAL"
                            ? "default"
                            : "destructive"
                      }
                      className="px-2 py-0.5 text-xs"
                    >
                      {sale.paymentStatus}
                    </Badge>
                  </td>

                  {/* METHOD */}
                  <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                    {sale.paymentMethod}
                  </td>

                  {/* DATE */}
                  <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-3 py-2 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleView(sale._id)}
                      disabled={loadingSale}
                      className="h-8 rounded bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingSale ? "Loading..." : "View"}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-10 text-center text-sm text-slate-400"
                >
                  No sales found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination?.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
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

      {/* MODAL */}

      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-700 bg-slate-900 text-white sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-wider text-white">
              Sale Details
            </DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-5">
              {/* CUSTOMER & PAYMENT INFORMATION */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* CUSTOMER */}
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Customer Information
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Customer</span>

                      <span className="text-right font-medium text-slate-100">
                        {selectedSale.customerId?.name ?? "Walk-in Customer"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Mobile</span>

                      <span className="text-slate-300">
                        {selectedSale.customerId?.mobile ?? "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Products</span>

                      <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200">
                        {selectedSale.items?.length ?? 0} Items
                      </span>
                    </div>
                  </div>
                </div>

                {/* PAYMENT */}
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Payment Information
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Method</span>

                      <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200">
                        {selectedSale.paymentMethod}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Status</span>

                      <Badge
                        variant={
                          selectedSale.paymentStatus === "PAID"
                            ? "secondary"
                            : selectedSale.paymentStatus === "PARTIAL"
                              ? "default"
                              : "destructive"
                        }
                        className="px-2 py-0.5 text-xs"
                      >
                        {selectedSale.paymentStatus}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Date</span>

                      <span className="text-right text-slate-300">
                        {new Date(selectedSale.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PURCHASED PRODUCTS */}
              <div className="overflow-hidden rounded-lg border border-slate-700">
                <div className="border-b border-slate-700 bg-slate-800 px-4 py-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Purchased Products
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-sm">
                    <thead className="bg-slate-900">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <th className="px-3 py-2.5 text-left">Product</th>

                        <th className="px-3 py-2.5 text-left">SKU</th>

                        <th className="px-3 py-2.5 text-left">Category</th>

                        <th className="px-3 py-2.5 text-center">Qty</th>

                        <th className="px-3 py-2.5 text-right">Price</th>

                        <th className="px-3 py-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedSale.items?.map((item: any) => (
                        <tr
                          key={item._id}
                          className="border-t border-slate-800 transition-colors hover:bg-slate-800/50"
                        >
                          <td className="max-w-[180px] px-3 py-2">
                            <span
                              className="block truncate font-medium text-slate-200"
                              title={item.productId?.name}
                            >
                              {item.productId?.name ?? "-"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                            {item.productId?.sku ?? "-"}
                          </td>

                          <td className="max-w-[140px] px-3 py-2">
                            <span
                              className="block truncate text-slate-400"
                              title={item.productId?.category}
                            >
                              {item.productId?.category ?? "-"}
                            </span>
                          </td>

                          <td className="px-3 py-2 text-center">
                            <span className="inline-flex min-w-[30px] items-center justify-center rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                              {item.quantity}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-right text-slate-300">
                            ZK {Number(item.price || 0).toLocaleString()}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-slate-100">
                            ZK {Number(item.subtotal || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="grid gap-3 md:grid-cols-3">
                {/* TOTAL */}
                <div className="rounded-lg border border-blue-800/60 bg-blue-950/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Total Amount
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    ZK {Number(selectedSale.totalAmount || 0).toLocaleString()}
                  </p>
                </div>

                {/* PAID */}
                <div className="rounded-lg border border-green-800/60 bg-green-950/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Paid Amount
                  </p>

                  <p className="mt-2 text-xl font-bold text-green-400">
                    ZK {Number(selectedSale.paidAmount || 0).toLocaleString()}
                  </p>
                </div>

                {/* DUE */}
                <div className="rounded-lg border border-red-800/60 bg-red-950/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Due Amount
                  </p>

                  <p className="mt-2 text-xl font-bold text-red-400">
                    ZK {Number(selectedSale.dueAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end border-t border-slate-800 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenView(false)}
                  className="border-slate-600 bg-white text-black hover:bg-amber-50 hover:text-black"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);

          if (!value) {
            setCustomerId("");
            setPaymentMethod("CASH");
            setPaidAmount(0);

            setItems([
              {
                productId: "",
                quantity: 1,
              },
            ]);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-slate-900 sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-white tracking-wider">
              Create Sale
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer + Payment */}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white tracking-wider">
                  Customer
                </label>

                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                >
                  <option value="">Walk In Customer</option>

                  {customersData?.data?.customers?.map((customer: any) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.mobile})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white tracking-wider">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="BANK">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Products */}

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Products</h3>

                <Button
                  type="button"
                  onClick={() =>
                    setItems([
                      ...items,
                      {
                        productId: "",
                        quantity: 1,
                      },
                    ])
                  }
                >
                  + Add Product
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => {
                  const product = salesData?.data?.products?.find(
                    (p: any) => p._id === item.productId,
                  );

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 rounded-lg border border-slate-800 p-4"
                    >
                      <div className="col-span-5">
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const temp = [...items];
                            temp[index].productId = e.target.value;
                            setItems(temp);
                          }}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                        >
                          <option value="">Select Product</option>

                          {salesData?.data?.products?.map((product: any) => (
                            <option key={product._id} value={product._id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => {
                            const temp = [...items];
                            temp[index].quantity = Number(e.target.value);
                            setItems(temp);
                          }}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                        />
                      </div>

                      <div className="col-span-2 flex items-center">
                        ₹{product?.sellingPrice ?? 0}
                      </div>

                      <div className="col-span-2 flex items-center font-semibold">
                        ₹{(product?.sellingPrice ?? 0) * item.quantity}
                      </div>

                      <div className="col-span-1">
                        <Button
                          variant="destructive"
                          type="button"
                          onClick={() =>
                            setItems(items.filter((_, i) => i !== index))
                          }
                        >
                          X
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment */}

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-white">
                  Paid Amount
                </label>

                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white">
                  Total Amount
                </label>

                <input
                  readOnly
                  value={items.reduce((total, item) => {
                    const product = salesData?.data?.products?.find(
                      (p: any) => p._id === item.productId,
                    );

                    return total + (product?.sellingPrice ?? 0) * item.quantity;
                  }, 0)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white">
                  Due Amount
                </label>

                <input
                  readOnly
                  value={
                    items.reduce((total, item) => {
                      const product = salesData?.data?.products?.find(
                        (p: any) => p._id === item.productId,
                      );

                      return (
                        total + (product?.sellingPrice ?? 0) * item.quantity
                      );
                    }, 0) - paidAmount
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                />
              </div>
            </div>

            {/* Footer */}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button type="button" onClick={handleCreateSale}>
                Create Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesList;
