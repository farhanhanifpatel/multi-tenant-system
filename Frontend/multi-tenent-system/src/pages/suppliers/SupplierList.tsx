/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../../utils/apiError";
import { useSupplier } from "../../hooks/useSupplier";
import { getProducts } from "../../services/product.service";
import { useDebounce } from "../../hooks/useDebounce";
import {
  createSupplierPurchase,
  createSupplierPayment,
} from "../../services/supplier-purchase.service";
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../services/supplier.service";

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import { Badge } from "../../components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  supplierSchema,
  type SupplierFormData,
} from "@/validation/supplier.validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SupplierList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-createdAt");

  const [open, setOpen] = useState(false);

  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(search, 500);

  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const [purchaseSearch, setPurchaseSearch] = useState("");
  // NOTE: debounce the product search so we don't fire a request on every keystroke
  const debouncedPurchaseSearch = useDebounce(purchaseSearch, 400);

  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);

  const [purchaseNote, setPurchaseNote] = useState("");

  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentNote, setPaymentNote] = useState("");

  const { data, isLoading, isFetching } = useSupplier({
    page,
    limit: 10,
    search: debouncedSearch,
    sort,
  });

  const suppliers = data?.data?.suppliers || [];
  const pagination = data?.data?.pagination;

  const {
    data: productData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["supplier-purchase-products", debouncedPurchaseSearch],
    queryFn: () =>
      getProducts({
        page: 1,
        limit: 20,
        search: debouncedPurchaseSearch,
      }),
    enabled: purchaseOpen && debouncedPurchaseSearch.trim().length > 0,
  });

  const products = productData?.data?.products ?? [];

  // FIX: products use `_id` (Mongo), not `id`. Using `product.id` meant every
  // product had `productId: undefined`, so the "already in cart" check always
  // matched the first item added and later clicks just bumped its quantity
  // instead of adding a new line.
  const addPurchaseItem = (product: any) => {
    const existingItem = purchaseItems.find(
      (item) => item.productId === product._id,
    );

    if (existingItem) {
      setPurchaseItems((items) =>
        items.map((item) =>
          item.productId === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        ),
      );

      return;
    }

    setPurchaseItems((items) => [
      ...items,
      {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        purchasePrice: product.purchasePrice || 0,
        unit: product.unit,
      },
    ]);
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      companyName: "",
      mobile: "",
      email: "",
      address: "",
      taxNumber: "",
      notes: "",
    },
  });

  const removePurchaseItem = (productId: string) => {
    setPurchaseItems((items) =>
      items.filter((item) => item.productId !== productId),
    );
  };

  const updatePurchaseQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;

    setPurchaseItems((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const updatePurchasePrice = (productId: string, purchasePrice: number) => {
    if (purchasePrice < 0) return;

    setPurchaseItems((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, purchasePrice } : item,
      ),
    );
  };

  const handleCreatePurchase = async () => {
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }

    if (purchaseItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (paidAmount > purchaseTotal) {
      toast.error("Paid amount cannot be greater than total");
      return;
    }

    try {
      await createSupplierPurchase({
        supplierId: selectedSupplier._id,
        items: purchaseItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
        })),
        paidAmount,
        paymentMethod: paymentMethod as any,
        note: purchaseNote || undefined,
      });

      toast.success("Supplier purchase created successfully");

      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      setPurchaseItems([]);
      setPaidAmount(0);
      setPaymentMethod("CASH");
      setPurchaseNote("");
      setPurchaseSearch("");
      setPurchaseOpen(false);
    } catch (error) {
      console.error(error);

      toast.error(
        getApiErrorMessage(error, "Failed to create supplier purchase"),
      );
    }
  };

  const purchaseTotal = purchaseItems.reduce(
    (total, item) => total + item.quantity * item.purchasePrice,
    0,
  );

  const purchaseDue = Math.max(purchaseTotal - paidAmount, 0);
  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const onSubmit = async (formData: SupplierFormData) => {
    try {
      const payload = {
        name: formData.name,
        companyName: formData.companyName || "",
        mobile: formData.mobile,
        email: formData.email || "",
        address: formData.address || "",
        taxNumber: formData.taxNumber || "",
        notes: formData.notes || "",
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, payload);

        toast.success("Supplier updated successfully");
      } else {
        await createSupplier(payload);

        toast.success("Supplier created successfully");
      }

      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });

      reset();

      setOpen(false);

      setEditingSupplier(null);
    } catch (error) {
      console.error(error);

      toast.error(
        getApiErrorMessage(
          error,
          editingSupplier
            ? "Failed to update supplier"
            : "Failed to create supplier",
        ),
      );
    }
  };

  // ==========================================
  // CREATE
  // ==========================================

  const handleCreate = () => {
    reset();

    setEditingSupplier(null);

    setOpen(true);
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);

    setValue("name", supplier.name || "");

    setValue("companyName", supplier.companyName || "");

    setValue("mobile", supplier.mobile || "");

    setValue("email", supplier.email || "");

    setValue("address", supplier.address || "");

    setValue("taxNumber", supplier.taxNumber || "");

    setValue("notes", supplier.notes || "");

    setOpen(true);
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id: string) => {
    try {
      await deleteSupplier(id);

      toast.success("Supplier deleted successfully");

      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete supplier");
    }
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    reset();

    setEditingSupplier(null);

    setOpen(false);
  };

  const handleCreateSupplierPayment = async () => {
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }

    if (paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (paymentAmount > selectedSupplier.dueAmount) {
      toast.error("Payment cannot be greater than supplier due amount");
      return;
    }

    try {
      await createSupplierPayment({
        supplierId: selectedSupplier._id,
        amount: paymentAmount,
        paymentMethod: paymentMethod as any,
        note: paymentNote || undefined,
      });

      toast.success("Supplier payment recorded successfully");

      // Refresh supplier list
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });

      // Reset form
      setPaymentAmount(0);
      setPaymentMethod("CASH");
      setPaymentNote("");
      setPaymentOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error(error);

      toast.error(
        getApiErrorMessage(error, "Failed to record supplier payment"),
      );
    }
  };

  return (
    <div className="rounded-xl bg-slate-900 p-6">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>

        <Button className="bg-blue-600 px-4 py-2" onClick={handleCreate}>
          + Create Supplier
        </Button>
      </div>

      {/* ==========================================
          SEARCH + FILTERS
      ========================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <div className="relative w-full lg:w-80">
          <input
            placeholder="Search by name, company or mobile..."
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

          <option value="-totalPurchaseAmount">Highest Purchase</option>

          <option value="totalPurchaseAmount">Lowest Purchase</option>
        </select>
      </div>

      {/* ==========================================
          TABLE
      ========================================== */}

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full min-w-[1050px] text-sm">
          <thead className="bg-slate-800">
            <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-3 py-2.5 text-left">Supplier</th>
              <th className="px-3 py-2.5 text-left">Company</th>
              <th className="px-3 py-2.5 text-left">Mobile</th>
              <th className="px-3 py-2.5 text-right">Total Purchase</th>
              <th className="px-3 py-2.5 text-right">Paid</th>
              <th className="px-3 py-2.5 text-right">Due</th>
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
                    <div className="h-4 w-28 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-4 w-20 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="ml-auto h-4 w-20 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="ml-auto h-4 w-20 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="ml-auto h-5 w-20 rounded-full bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="mx-auto h-8 w-32 rounded bg-slate-700" />
                  </td>
                </tr>
              ))
            ) : suppliers.length > 0 ? (
              /* =================================================
           SUPPLIERS
        ================================================== */
              suppliers.map((supplier: any) => (
                <tr
                  key={supplier._id}
                  className="border-b border-slate-800 transition-colors hover:bg-slate-800/50"
                >
                  {/* SUPPLIER */}
                  <td className="px-3 py-2">
                    <span className="font-medium text-slate-200">
                      {supplier.name}
                    </span>
                  </td>

                  {/* COMPANY */}
                  <td className="max-w-[180px] px-3 py-2">
                    <span
                      className="block truncate text-slate-400"
                      title={supplier.companyName || "-"}
                    >
                      {supplier.companyName || "-"}
                    </span>
                  </td>

                  {/* MOBILE */}
                  <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                    {supplier.mobile}
                  </td>

                  {/* TOTAL PURCHASE */}
                  <td className="whitespace-nowrap px-3 py-2 text-right font-medium text-slate-300">
                    ZK{" "}
                    {Number(supplier.totalPurchaseAmount || 0).toLocaleString()}
                  </td>

                  {/* PAID */}
                  <td className="whitespace-nowrap px-3 py-2 text-right font-medium text-green-400">
                    ZK {Number(supplier.totalPaidAmount || 0).toLocaleString()}
                  </td>

                  {/* DUE */}
                  <td className="px-3 py-2 text-right">
                    <Badge
                      variant={
                        supplier.dueAmount > 0 ? "destructive" : "secondary"
                      }
                      className="px-2 py-0.5 text-xs"
                    >
                      ZK {Number(supplier.dueAmount || 0).toLocaleString()}
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
                        onClick={() => handleEdit(supplier)}
                      >
                        Edit
                      </Button>

                      {/* LEDGER */}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setLedgerOpen(true);
                        }}
                      >
                        Ledger
                      </Button>

                      {/* PURCHASE */}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded bg-purple-600 px-3 text-xs font-medium text-white hover:bg-purple-700"
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setPurchaseOpen(true);
                        }}
                      >
                        Purchase
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
                            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>

                            <AlertDialogDescription>
                              Are you sure you want to delete{" "}
                              <strong>{supplier.name}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>

                            <AlertDialogAction
                              onClick={() => handleDelete(supplier._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* PAY SUPPLIER */}
                      {supplier.dueAmount > 0 ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 rounded bg-green-500 px-3 text-xs font-medium text-white hover:bg-green-600"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setPaymentOpen(true);
                          }}
                        >
                          Pay
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
                  colSpan={7}
                  className="px-3 py-10 text-center text-sm text-slate-400"
                >
                  No suppliers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==========================================
          PAGINATION
      ========================================== */}

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

      {/* ==========================================
          CREATE / EDIT MODAL
      ========================================== */}

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);

          if (!value) {
            reset();
            setEditingSupplier(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-700 bg-slate-900 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="tracking-wider text-white">
              {editingSupplier ? "Edit Supplier" : "Create Supplier"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5 md:grid-cols-2">
              {/* SUPPLIER NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Supplier Name <span className="text-red-400">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter supplier name"
                  {...register("name", {
                    required: "Supplier name is required",
                    minLength: {
                      value: 2,
                      message: "Supplier name must be at least 2 characters",
                    },
                  })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* COMPANY NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Company Name <span className="text-red-400">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter company name"
                  {...register("companyName", {
                    required: "Company name is required",
                    minLength: {
                      value: 2,
                      message: "COmpany name must be at least 2 characters",
                    },
                  })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              {/* MOBILE */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Mobile <span className="text-red-400">*</span>
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10 digit mobile number"
                  {...register("mobile", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Mobile number must be exactly 10 digits",
                    },
                  })}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Email <span className="text-red-400">*</span>
                </label>

                <input
                  type="email"
                  placeholder="Enter email address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* TAX NUMBER */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Tax Number <span className="text-red-400">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter tax number"
                  {...register("taxNumber", {
                    required: "Tax number is required",
                    minLength: {
                      value: 3,
                      message: "Tax number must be at least 3 characters",
                    },
                  })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.taxNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.taxNumber.message}
                  </p>
                )}
              </div>

              {/* ADDRESS */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Address <span className="text-red-400">*</span>
                </label>

                <textarea
                  {...register("address", {
                    required: "Address is required",
                    minLength: {
                      value: 5,
                      message: "Address must be at least 5 characters",
                    },
                  })}
                  rows={3}
                  placeholder="Enter supplier address"
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* NOTES */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Notes
                </label>

                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Optional notes..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.notes && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.notes.message}
                  </p>
                )}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
                className="border-slate-600 bg-white text-black hover:bg-amber-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[150px] bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {editingSupplier ? "Updating..." : "Creating..."}
                  </span>
                ) : editingSupplier ? (
                  "Update Supplier"
                ) : (
                  "Create Supplier"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={ledgerOpen} onOpenChange={setLedgerOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-slate-900 sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Supplier Ledger</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {selectedSupplier ? (
              <>
                <h2 className="mb-4 text-white text-xl font-semibold">
                  {selectedSupplier.name}
                </h2>

                <p className="text-slate-400">
                  Mobile: {selectedSupplier.mobile}
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-slate-800 p-4">
                    <p className="text-sm text-slate-400">Total Purchase</p>
                    <p className="text-blue-600 text-xl font-bold">
                      ₹
                      {(
                        selectedSupplier.totalPurchaseAmount || 0
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800 p-4">
                    <p className="text-sm text-slate-400">Total Paid</p>
                    <p className="text-xl font-bold text-green-400">
                      ₹
                      {(selectedSupplier.totalPaidAmount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800 p-4">
                    <p className="text-sm text-slate-400">Due</p>
                    <p className="text-xl font-bold text-red-400">
                      ₹{(selectedSupplier.dueAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-slate-400">
                    Ledger transactions will appear here.
                  </p>
                </div>
              </>
            ) : (
              <p>No supplier selected.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={purchaseOpen}
        onOpenChange={(value) => {
          setPurchaseOpen(value);

          if (!value) {
            setPurchaseItems([]);
            setPaidAmount(0);
            setPaymentMethod("CASH");
            setPurchaseNote("");
            setPurchaseSearch("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-slate-900 text-white sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Create Supplier Purchase
            </DialogTitle>
          </DialogHeader>

          {selectedSupplier && (
            <div className="space-y-6">
              {/* SUPPLIER */}
              <div className="rounded-lg bg-slate-800 p-4">
                <p className="text-sm text-slate-400">Supplier</p>

                <p className="text-lg font-semibold">{selectedSupplier.name}</p>

                <p className="text-sm text-slate-400">
                  {selectedSupplier.mobile}
                </p>
              </div>

              {/* PRODUCT SEARCH */}
              <div>
                <label className="mb-2 block text-sm">Search Product</label>

                <input
                  value={purchaseSearch}
                  onChange={(e) => setPurchaseSearch(e.target.value)}
                  placeholder="Search product by name or SKU..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                />
              </div>

              {/* PRODUCTS */}
              {purchaseSearch.trim().length > 0 && (
                <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-700">
                  {productsLoading ? (
                    <p className="p-4 text-slate-400">Searching products...</p>
                  ) : productsError ? (
                    <p className="p-4 text-red-400">Failed to load products</p>
                  ) : products.length === 0 ? (
                    <p className="p-4 text-slate-400">No products found</p>
                  ) : (
                    products.map((product: any) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => addPurchaseItem(product)}
                        className="flex w-full items-center justify-between border-b border-slate-700 p-3 text-left hover:bg-slate-800"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>

                          <p className="text-sm text-slate-400">
                            SKU: {product.sku}
                          </p>
                        </div>

                        <div className="text-right">
                          <p>
                            ₹
                            {Number(
                              product.purchasePrice || 0,
                            ).toLocaleString()}
                          </p>

                          <p className="text-xs text-slate-400">
                            Stock: {product.stock} {product.unit}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* PURCHASE ITEMS */}
              {purchaseItems.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Purchase Items</h3>

                  <div className="overflow-x-auto rounded-lg border border-slate-700">
                    <table className="min-w-full">
                      <thead className="bg-slate-800">
                        <tr>
                          <th className="p-3 text-left">Product</th>

                          <th className="p-3 text-center">Quantity</th>

                          <th className="p-3 text-right">Purchase Price</th>

                          <th className="p-3 text-right">Total</th>

                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {purchaseItems.map((item) => (
                          <tr
                            key={item.productId}
                            className="border-b border-slate-700"
                          >
                            <td className="p-3">
                              <p className="font-medium">{item.name}</p>

                              <p className="text-xs text-slate-400">
                                {item.sku}
                              </p>
                            </td>

                            <td className="p-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updatePurchaseQuantity(
                                    item.productId,
                                    Number(e.target.value),
                                  )
                                }
                                className="w-24 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-center"
                              />
                            </td>

                            <td className="p-3">
                              <input
                                type="number"
                                min="0"
                                value={item.purchasePrice}
                                onChange={(e) =>
                                  updatePurchasePrice(
                                    item.productId,
                                    Number(e.target.value),
                                  )
                                }
                                className="w-28 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-right"
                              />
                            </td>

                            <td className="p-3 text-right font-medium">
                              ₹
                              {(
                                item.quantity * item.purchasePrice
                              ).toLocaleString()}
                            </td>

                            <td className="p-3 text-center">
                              <Button
                                type="button"
                                variant="secondary"
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() =>
                                  removePurchaseItem(item.productId)
                                }
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PAYMENT */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm">Total Amount</label>

                  <div className="rounded-lg bg-slate-800 px-4 py-2 text-lg font-bold">
                    ₹{purchaseTotal.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm">Paid Amount</label>

                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm">Due Amount</label>

                  <div className="rounded-lg bg-slate-800 px-4 py-2 text-lg font-bold text-red-400">
                    ₹{purchaseDue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <label className="mb-2 block text-sm">Payment Method</label>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="BANK">Bank</option>
                  <option value="UPI">UPI</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* NOTE */}
              <div>
                <label className="mb-2 block text-sm">Note</label>

                <textarea
                  rows={3}
                  value={purchaseNote}
                  onChange={(e) => setPurchaseNote(e.target.value)}
                  placeholder="Optional purchase note..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                />
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPurchaseOpen(false)}
                  className="border-slate-600 bg-white text-black hover:bg-amber-50 hover:text-black"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={purchaseItems.length === 0}
                  onClick={handleCreatePurchase}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create Purchase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-700 bg-slate-900 text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="tracking-wider text-white">
              Pay Supplier
            </DialogTitle>

            <DialogDescription className="text-slate-400">
              Record a payment for this supplier.
            </DialogDescription>
          </DialogHeader>

          {selectedSupplier && (
            <div className="space-y-5">
              {/* SUPPLIER DETAILS */}
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                <h3 className="mb-3 font-semibold text-white">
                  Supplier Details
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Supplier Name :</span>

                    <span className="font-medium text-slate-100">
                      {selectedSupplier.name}
                    </span>
                  </div>

                  {selectedSupplier.companyName && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Company :</span>

                      <span className="font-medium text-slate-100">
                        {selectedSupplier.companyName}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Current Due :</span>

                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 font-semibold text-red-400">
                      ZK{" "}
                      {Number(selectedSupplier.dueAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* PAYMENT AMOUNT */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Payment Amount <span className="text-red-400">*</span>
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    ZK
                  </span>

                  <Input
                    type="number"
                    min="0.01"
                    max={selectedSupplier.dueAmount}
                    step="0.01"
                    value={paymentAmount || ""}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      if (value <= selectedSupplier.dueAmount) {
                        setPaymentAmount(value);
                      }
                    }}
                    className="border-slate-700 bg-slate-800 py-2 pl-10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter payment amount"
                  />
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Maximum payable:{" "}
                  <span className="font-medium text-slate-300">
                    ZK{" "}
                    {Number(selectedSupplier.dueAmount || 0).toLocaleString()}
                  </span>
                </p>

                {paymentAmount > selectedSupplier.dueAmount && (
                  <p className="mt-1 text-sm text-red-500">
                    Payment amount cannot be greater than the current due.
                  </p>
                )}

                {paymentAmount <= 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    Payment amount is required.
                  </p>
                )}
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
                  <option value="CARD">Card</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* NOTE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Note
                </label>

                <Textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  rows={3}
                  placeholder="Optional payment note..."
                  className="resize-none border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* BUTTONS */}
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentOpen(false)}
                  className="border-slate-600 bg-white text-black hover:bg-amber-50 hover:text-black"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleCreateSupplierPayment}
                  disabled={
                    !paymentAmount ||
                    paymentAmount <= 0 ||
                    paymentAmount > selectedSupplier.dueAmount
                  }
                  className="min-w-[150px] bg-green-600 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Record Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierList;
