/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createPayment,
  customerLedger,
} from "../../services/transaction.service";
import { useCustomer } from "../../hooks/useCustomer";
import { useDebounce } from "../../hooks/useDebounce";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../services/customer.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "../../components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  customerSchema,
  type CustomerFormData,
} from "@/validation/customer.validation";

const CustomerList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [open, setOpen] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);

  const [paymentCustomer, setPaymentCustomer] = useState<any>(null);

  const [paymentAmount, setPaymentAmount] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [note, setNote] = useState("");

  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(search, 500);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const { data, isLoading, isFetching } = useCustomer({
    page,
    limit: 10,
    search: debouncedSearch,
    sort,
  });

  const customers = data?.data?.customers || [];
  const pagination = data?.data?.pagination;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        name: formData.name,
        mobile: formData.mobile,
        address: formData.address || "",
      };
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, payload);

        toast.success("Customer updated successfully");
      } else {
        await createCustomer(payload);

        toast.success("Customer created successfully");
      }

      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      reset();
      setOpen(false);
      setEditingCustomer(null);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleCreate = () => {
    reset();

    setEditingCustomer(null);

    setOpen(true);
  };
  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);

    setValue("name", customer.name);
    setValue("mobile", customer.mobile);
    setValue("address", customer.address || "");

    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);

      toast.success("Customer deleted successfully");

      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleReceivePayment = async () => {
    try {
      await createPayment({
        customerId: paymentCustomer._id,
        amount: Number(paymentAmount),
        paymentMethod,
        note,
      });
      const amount = Number(paymentAmount);

      if (amount <= 0) {
        toast.error("Payment amount must be greater than 0");
        return;
      }

      if (amount > paymentCustomer.dueAmount) {
        toast.error(
          `Payment cannot exceed due amount of ₹${paymentCustomer.dueAmount}`,
        );
        return;
      }
      toast.success("Payment received successfully");

      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["outstanding"] });

      setPaymentOpen(false);
    } catch (error) {
      toast.error("Failed to receive payment");
    }
  };

  const handleViewLedger = async (customer: any) => {
    try {
      setSelectedCustomer(customer);
      setLedgerLoading(true);

      const res = await customerLedger(customer._id);
      setSelectedCustomer(res.data.customer);
      setLedgerData(res.data.ledger);
      setLedgerOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch customer ledger");
    } finally {
      setLedgerLoading(false);
    }
  };

  const closeModal = () => {
    reset();
    setEditingCustomer(null);
    setOpen(false);
  };

  return (
    <div className="rounded-xl bg-slate-900 p-6 ">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>

        <Button className="bg-blue-600 px-4 py-2" onClick={handleCreate}>
          + Create Customer
        </Button>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <div className="relative w-full lg:w-80">
          <input
            placeholder="Search by name or mobile..."
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
          <option value="name">A-Z</option>
          <option value="-name">Z-A</option>

          <option value="-dueAmount">Highest Due Amount</option>
          <option value="dueAmount">Lowest Due Amount</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-800">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">Mobile</th>
              <th className="px-3 py-2.5">Address</th>
              <th className="px-3 py-2.5">Due Amount</th>
              <th className="px-3 py-2.5 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* =================================================
          LOADING
      ================================================== */}
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
                    <div className="h-4 w-32 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-5 w-20 rounded-full bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="mx-auto h-8 w-32 rounded bg-slate-700" />
                  </td>
                </tr>
              ))
            ) : customers.length > 0 ? (
              /* =================================================
           CUSTOMERS
        ================================================== */
              customers.map((customer: any) => (
                <tr
                  key={customer._id}
                  className="border-b border-slate-800 transition-colors hover:bg-slate-800/50"
                >
                  {/* NAME */}
                  <td className="px-3 py-2">
                    <span className="font-medium text-slate-200">
                      {customer.name}
                    </span>
                  </td>

                  {/* MOBILE */}
                  <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                    {customer.mobile}
                  </td>

                  {/* ADDRESS */}
                  <td className="max-w-[220px] px-3 py-2">
                    <span
                      className="block truncate text-slate-400"
                      title={customer.address || "-"}
                    >
                      {customer.address || "-"}
                    </span>
                  </td>

                  {/* DUE AMOUNT */}
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        customer.dueAmount > 0 ? "destructive" : "secondary"
                      }
                      className="px-2 py-0.5 text-xs"
                    >
                      ZK {Number(customer.dueAmount || 0).toLocaleString()}
                    </Badge>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      {/* EDIT */}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded bg-yellow-500 px-3 text-xs font-medium text-black hover:bg-yellow-600"
                        onClick={() => handleEdit(customer)}
                      >
                        Edit
                      </Button>

                      {/* LEDGER */}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
                        onClick={() => handleViewLedger(customer)}
                      >
                        Ledger
                      </Button>

                      {/* DELETE */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 rounded bg-red-500 px-3 text-xs font-medium text-white hover:bg-red-600"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Customer</AlertDialogTitle>

                            <AlertDialogDescription>
                              Are you sure you want to delete{" "}
                              <strong>{customer.name}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>

                            <AlertDialogAction
                              onClick={() => handleDelete(customer._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* RECEIVE PAYMENT */}
                      {customer.dueAmount > 0 ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 rounded bg-green-500 px-3 text-xs font-medium text-white hover:bg-green-600"
                          onClick={() => {
                            setPaymentCustomer(customer);
                            setPaymentOpen(true);
                          }}
                        >
                          Receive Payment
                        </Button>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="px-2 py-0.5 text-xs"
                        >
                          No Due
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              /* =================================================
           EMPTY
        ================================================== */
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-10 text-center text-sm text-slate-400"
                >
                  No customers found
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
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);

          if (!value) {
            reset();
            setEditingCustomer(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-700 bg-slate-900 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="tracking-wider text-white">
              {editingCustomer ? "Edit Customer" : "Create Customer"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5 md:grid-cols-2">
              {/* CUSTOMER NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Customer Name
                </label>

                <input
                  {...register("name")}
                  placeholder="Enter customer name"
                  aria-invalid={!!errors.name}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* MOBILE */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Mobile
                </label>

                <input
                  {...register("mobile")}
                  placeholder="Enter mobile number"
                  aria-invalid={!!errors.mobile}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              {/* ADDRESS */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Address
                </label>

                <textarea
                  {...register("address")}
                  rows={3}
                  placeholder="Enter customer address"
                  aria-invalid={!!errors.address}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">
              {/* CANCEL */}
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
                className="border-slate-600 bg-white text-black hover:bg-amber-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </Button>

              {/* SUBMIT */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[150px] bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    {editingCustomer ? "Updating..." : "Creating..."}
                  </span>
                ) : editingCustomer ? (
                  "Update Customer"
                ) : (
                  "Create Customer"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={paymentOpen}
        onOpenChange={(value) => {
          setPaymentOpen(value);

          if (!value) {
            setPaymentCustomer(null);
            setPaymentAmount("");
            setPaymentMethod("CASH");
            setNote("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-700 bg-slate-900 text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="tracking-wider text-white">
              Receive Payment
            </DialogTitle>
          </DialogHeader>

          {paymentCustomer && (
            <div className="space-y-5">
              {/* CUSTOMER DETAILS */}
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                <h3 className="mb-3 font-semibold text-white">
                  Customer Details
                </h3>

                <div className="space-y-3 text-sm">
                  {/* Name */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Name</span>

                    <span className="font-medium text-slate-100">
                      {paymentCustomer.name}
                    </span>
                  </div>

                  {/* Mobile */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Mobile</span>

                    <span className="font-medium text-slate-100">
                      {paymentCustomer.mobile}
                    </span>
                  </div>

                  {/* Outstanding */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Outstanding Due</span>

                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-400">
                      ZK{" "}
                      {Number(paymentCustomer.dueAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* PAYMENT AMOUNT */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Payment Amount
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    ZK
                  </span>

                  <input
                    type="number"
                    min={1}
                    max={paymentCustomer.dueAmount}
                    value={paymentAmount}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      if (value <= paymentCustomer.dueAmount) {
                        setPaymentAmount(e.target.value);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Maximum payable:{" "}
                  <span className="font-medium text-slate-300">
                    ZK {Number(paymentCustomer.dueAmount || 0).toLocaleString()}
                  </span>
                </p>
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="BANK">Bank Transfer</option>
                </select>
              </div>

              {/* NOTE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Note
                </label>

                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional payment note..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">
                {/* CANCEL */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentOpen(false)}
                  className="border-slate-600 bg-white text-black hover:bg-amber-50 hover:text-black"
                >
                  Cancel
                </Button>

                {/* RECEIVE PAYMENT */}
                <Button
                  type="button"
                  onClick={handleReceivePayment}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Receive Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={ledgerOpen} onOpenChange={setLedgerOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-slate-900 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white tracking-wider">
              Customer Ledger
            </DialogTitle>
          </DialogHeader>

          {/* Customer Card */}
          {selectedCustomer && (
            <div className="mb-5 rounded-xl border border-slate-700 bg-slate-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedCustomer.name}
                  </h2>

                  <p className="text-slate-400">📞 {selectedCustomer.mobile}</p>

                  <p className="text-slate-400">
                    📍 {selectedCustomer.address || "No Address"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-400">Outstanding Due</p>

                  <p className="text-3xl font-bold text-red-500">
                    ₹{selectedCustomer.dueAmount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 👇 ADD THE TABLE HERE */}
          {ledgerLoading ? (
            <div className="py-6 text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="min-w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="p-3 text-left text-white text-xl">Date</th>
                    <th className="p-3 text-left text-white text-xl">Type</th>
                    <th className="p-3 text-right text-white text-xl">Debit</th>
                    <th className="p-3 text-right text-white text-xl">
                      Credit
                    </th>
                    <th className="p-3 text-right text-white text-xl">
                      Balance
                    </th>
                    <th className="p-3 text-left text-white text-xl">Note</th>
                  </tr>
                </thead>

                <tbody>
                  {ledgerData.map((item: any) => {
                    const isDebit =
                      item.type === "SALE" || item.type === "CREDIT";

                    const isCredit = item.type === "PAYMENT";

                    return (
                      <tr
                        key={item._id}
                        className="border-b border-slate-700/70 transition-colors hover:bg-slate-800/50"
                      >
                        {/* DATE */}
                        <td className="p-3 text-sm text-slate-300">
                          {new Date(item.date).toLocaleDateString()}
                        </td>

                        {/* TYPE */}
                        <td className="p-3">
                          {isDebit ? (
                            <span className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                              Debit
                            </span>
                          ) : isCredit ? (
                            <span className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                              Credit
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                              {item.type}
                            </span>
                          )}
                        </td>

                        {/* DEBIT */}
                        <td className="p-3 text-right">
                          {isDebit ? (
                            <span className="font-semibold text-red-400">
                              - ZK {Number(item.amount || 0).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* CREDIT */}
                        <td className="p-3 text-right">
                          {isCredit ? (
                            <span className="font-semibold text-green-400">
                              + ZK {Number(item.amount || 0).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* BALANCE */}
                        <td className="p-3 text-right">
                          <span
                            className={`font-bold ${
                              Number(item.balance || 0) > 0
                                ? "text-orange-400"
                                : "text-green-400"
                            }`}
                          >
                            ZK {Number(item.balance || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* NOTE */}
                        <td className="p-3 text-sm text-slate-400">
                          {item.note || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerList;
