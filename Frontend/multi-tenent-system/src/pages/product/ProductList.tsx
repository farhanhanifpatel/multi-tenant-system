import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";

import { useExportProducts, useProducts } from "../../hooks/useProduct";
import { useDebounce } from "../../hooks/useDebounce";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/product.service";

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

import {
  productSchema,
  type ProductFormData,
  type ProductFormInput,
} from "../../validation/product.validation";

import { Badge } from "../../components/ui/badge";
import { Button } from "@/components/ui/button";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  _id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  image?: string | File | null;
};

/* =========================================================
   CONSTANTS
========================================================= */

const BUSINESS_TYPES = [
  "GROCERY",
  "MEDICAL",
  "CLOTHING",
  "FOOTWEAR",
  "HARDWARE",
  "ELECTRONICS",
  "OTHER",
];

/* =========================================================
   COMPONENT
========================================================= */

const ProductList = () => {
  /* =========================================================
     STATE
  ========================================================= */

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("-createdAt");

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [previewImage, setPreviewImage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(search, 500);

  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  const { data, isLoading, isFetching } = useProducts({
    page,
    limit: 10,
    search: debouncedSearch,
    category,
    sort,
  });

  const products: Product[] = data?.data?.products || [];

  const pagination = data?.data?.pagination;

  /* =========================================================
     FORM
  ========================================================= */

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ProductFormInput, any, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 0,
      lowStockThreshold: 0,
      unit: "",
    },
  });

  /* =========================================================
     CLEANUP IMAGE PREVIEW
  ========================================================= */

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* =========================================================
     ERROR MESSAGE HELPER
  ========================================================= */

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Something went wrong"
      );
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong";
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const onSubmit: SubmitHandler<ProductFormData> = async (formData) => {
    try {
      setIsSubmitting(true);

      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("sku", formData.sku);
      payload.append("category", formData.category);

      payload.append("purchasePrice", String(formData.purchasePrice));

      payload.append("sellingPrice", String(formData.sellingPrice));

      payload.append("stock", String(formData.stock));

      payload.append("lowStockThreshold", String(formData.lowStockThreshold));

      payload.append("unit", formData.unit);

      /* =====================================================
         IMAGE
      ===================================================== */

      if (selectedImage) {
        payload.append("image", selectedImage);
      }

      /* =====================================================
         UPDATE
      ===================================================== */

      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);

        toast.success("Product updated successfully");
      } else {
        /* =====================================================
         CREATE
      ===================================================== */
        await createProduct(payload);

        toast.success("Product created successfully");
      }

      /* =====================================================
         REFRESH PRODUCTS
      ===================================================== */

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      /* =====================================================
         RESET
      ===================================================== */

      reset();

      setSelectedImage(null);
      setImagePreview("");
      setEditingProduct(null);
      setOpen(false);
    } catch (error) {
      console.error("Product submit error:", error);

      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     CREATE PRODUCT
  ========================================================= */

  const handleCreate = () => {
    reset({
      name: "",
      sku: "",
      category: "",
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 0,
      lowStockThreshold: 0,
      unit: "",
    });

    setSelectedImage(null);
    setImagePreview("");
    setEditingProduct(null);

    setOpen(true);
  };

  /* =========================================================
     EDIT PRODUCT
  ========================================================= */

  const handleEdit = (product: Product) => {
    setEditingProduct(product);

    setValue("name", product.name);
    setValue("sku", product.sku);
    setValue("category", product.category);

    setValue("purchasePrice", product.purchasePrice);
    setValue("sellingPrice", product.sellingPrice);

    setValue("stock", product.stock);

    setValue("lowStockThreshold", product.lowStockThreshold);

    setValue("unit", product.unit);

    /* =====================================================
       EXISTING IMAGE
    ===================================================== */

    if (typeof product.image === "string") {
      setImagePreview(product.image);
    } else if (product.image instanceof File) {
      setImagePreview(URL.createObjectURL(product.image));
    } else {
      setImagePreview("");
    }

    setSelectedImage(null);

    setOpen(true);
  };

  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);

      toast.success("Product deleted successfully");

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    } catch (error) {
      console.error("Delete product error:", error);

      toast.error(getErrorMessage(error));
    }
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    reset();

    setSelectedImage(null);
    setImagePreview("");
    setEditingProduct(null);

    setOpen(false);
  };

  /* =========================================================
     IMAGE SELECT
  ========================================================= */

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    /* =====================================================
       FILE TYPE VALIDATION
    ===================================================== */

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");

      event.target.value = "";

      return;
    }

    /* =====================================================
       FILE SIZE VALIDATION
    ===================================================== */

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");

      event.target.value = "";

      return;
    }

    /* =====================================================
       SET IMAGE
    ===================================================== */

    setSelectedImage(file);

    setValue("image", file, {
      shouldValidate: true,
    });

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  const { mutateAsync: exportProductsAsync, isPending: isExporting } =
    useExportProducts();

  const handleExportExcel = async () => {
    try {
      const blob = await exportProductsAsync({
        search,
        category,
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "products.xlsx";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="rounded-xl bg-slate-900 p-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>

        <div className="flex gap-3">
          <Button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="rounded-lg bg-green-600 px-4 py-2 hover:bg-green-700"
          >
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>

          <Button
            onClick={handleCreate}
            className="rounded-lg bg-blue-600 px-4 py-2"
          >
            + Create Product
          </Button>
        </div>
      </div>

      {/* =====================================================
          SEARCH + FILTERS
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        {/* SEARCH */}

        <div className="relative w-full lg:w-80">
          <input
            placeholder="Search by name or SKU..."
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

        {/* CATEGORY */}

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
        >
          <option value="">All Categories</option>

          {BUSINESS_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

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

          <option value="name">A-Z</option>

          <option value="-name">Z-A</option>

          <option value="sellingPrice">Low Price</option>

          <option value="-sellingPrice">High Price</option>

          <option value="stock">Low Stock</option>

          <option value="-stock">High Stock</option>
        </select>
      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-800">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-3 py-2.5">Image</th>
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">SKU</th>
              <th className="px-3 py-2.5">Category</th>
              <th className="px-3 py-2.5">Stock</th>
              <th className="px-3 py-2.5">Purchase</th>
              <th className="px-3 py-2.5">Selling</th>
              <th className="px-3 py-2.5">Actions</th>
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
                    <div className="h-12 w-12 rounded-lg bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-4 w-24 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-4 w-20 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-4 w-16 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-5 w-10 rounded-full bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-4 w-16 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-4 w-16 rounded bg-slate-700" />
                  </td>

                  <td className="px-3 py-2">
                    <div className="h-8 w-24 rounded bg-slate-700" />
                  </td>
                </tr>
              ))
            ) : products.length > 0 ? (
              /* =================================================
           PRODUCTS
        ================================================== */
              products.map((product) => {
                let imageUrl = "";

                if (typeof product.image === "string") {
                  imageUrl = product.image;
                } else if (product.image instanceof File) {
                  imageUrl = URL.createObjectURL(product.image);
                }

                return (
                  <tr
                    key={product._id}
                    className="border-b border-slate-800 transition-colors hover:bg-slate-800/50"
                  >
                    {/* IMAGE */}
                    <td className="px-3 py-2">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          onClick={() => {
                            setPreviewImage(imageUrl);
                            setPreviewOpen(true);
                          }}
                          className="h-12 w-12 cursor-pointer rounded-lg border border-slate-700 object-cover transition hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-slate-700 text-[10px] text-slate-500">
                          No Img
                        </div>
                      )}
                    </td>

                    {/* NAME */}
                    <td className="max-w-[180px] px-3 py-2">
                      <span
                        className="block truncate font-medium text-slate-200"
                        title={product.name}
                      >
                        {product.name}
                      </span>
                    </td>

                    {/* SKU */}
                    <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                      {product.sku}
                    </td>

                    {/* CATEGORY */}
                    <td className="max-w-[140px] px-3 py-2">
                      <span
                        className="block truncate text-slate-400"
                        title={product.category}
                      >
                        {product.category}
                      </span>
                    </td>

                    {/* STOCK */}
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          product.stock <= product.lowStockThreshold
                            ? "destructive"
                            : "secondary"
                        }
                        className="px-2 py-0.5 text-xs"
                      >
                        {product.stock}
                      </Badge>
                    </td>

                    {/* PURCHASE */}
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-300">
                      ZK {Number(product.purchasePrice).toLocaleString()}
                    </td>

                    {/* SELLING */}
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-green-400">
                      ZK {Number(product.sellingPrice).toLocaleString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {/* EDIT */}
                        <Button
                          onClick={() => handleEdit(product)}
                          variant="secondary"
                          className="h-8 rounded bg-yellow-500 px-3 text-xs font-medium text-black hover:bg-yellow-600"
                        >
                          Edit
                        </Button>

                        {/* DELETE */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="secondary"
                              className="h-8 rounded bg-red-500 px-3 text-xs font-medium text-white hover:bg-red-600"
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Product
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{product.name}</strong>? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() => handleDelete(product._id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              /* =================================================
           EMPTY
        ================================================== */
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-10 text-center text-sm text-slate-400"
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          PAGINATION
      ====================================================== */}

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

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);

          if (!value) {
            reset();
            setSelectedImage(null);
            setImagePreview("");
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-700 bg-slate-900 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="tracking-wider text-white">
              {editingProduct ? "Edit Product" : "Create Product"}
            </DialogTitle>
          </DialogHeader>

          {/* =================================================
      FORM
  ================================================== */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5 md:grid-cols-2">
              {/* PRODUCT NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Product Name
                </label>

                <input
                  {...register("name")}
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* SKU */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  SKU
                </label>

                <input
                  {...register("sku")}
                  placeholder="Enter SKU"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.sku && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.sku.message}
                  </p>
                )}
              </div>

              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Category
                </label>

                <select
                  {...register("category")}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>

                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* UNIT */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Unit
                </label>

                <input
                  {...register("unit")}
                  placeholder="Kg, Piece, Liter..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.unit && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.unit.message}
                  </p>
                )}
              </div>

              {/* PURCHASE PRICE */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Purchase Price
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    ZK
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("purchasePrice", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {errors.purchasePrice && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.purchasePrice.message}
                  </p>
                )}
              </div>

              {/* SELLING PRICE */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Selling Price
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    ZK
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("sellingPrice", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {errors.sellingPrice && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.sellingPrice.message}
                  </p>
                )}
              </div>

              {/* STOCK */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  {...register("stock", {
                    valueAsNumber: true,
                  })}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.stock && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.stock.message}
                  </p>
                )}
              </div>

              {/* LOW STOCK THRESHOLD */}
              <div>
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Low Stock Threshold
                </label>

                <input
                  type="number"
                  min="0"
                  {...register("lowStockThreshold", {
                    valueAsNumber: true,
                  })}
                  placeholder="10"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.lowStockThreshold && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lowStockThreshold.message}
                  </p>
                )}
              </div>

              {/* IMAGE */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium tracking-wider text-white">
                  Product Image
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 p-6 transition hover:border-slate-500 hover:bg-slate-800/70">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product Preview"
                      className="h-40 w-40 rounded-lg object-cover"
                    />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mb-3 h-12 w-12 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 16.5V18a3 3 0 003 3h12a3 3 0 003-3v-1.5M16 8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>

                      <p className="text-sm text-slate-300">
                        Click to upload product image
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        PNG, JPG, JPEG (Max 5MB)
                      </p>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>

                {errors.image && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.image.message}
                  </p>
                )}
              </div>
            </div>

            {/* =================================================
        BUTTONS
    ================================================== */}
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
                className="border-slate-600 bg-white text-black hover:bg-amber-50 hover:text-black"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    {editingProduct ? "Updating..." : "Creating..."}
                  </span>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          IMAGE PREVIEW
      ====================================================== */}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl border-slate-800 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="tracking-wider text-white">
              Product Image
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-center">
            {previewImage && (
              <img
                src={previewImage}
                alt="Product"
                className="max-h-[80vh] w-auto rounded-lg object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductList;
