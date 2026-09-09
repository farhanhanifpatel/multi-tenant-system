import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "../../services/product.service";

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  purchasePrice: string;
  sellingPrice: string;
  stock: string;
  lowStockThreshold: string;
  unit: string;
}

const CreateProduct = () => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm<ProductFormData>();

  const { mutate, isPending } = useMutation({
    mutationFn: createProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      reset();

      console.log("Product created successfully");
    },

    onError: (error) => {
      console.error("Failed to create product:", error);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    console.log("SUBMIT FIRED");

    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("sku", data.sku);
    formData.append("category", data.category);
    formData.append("purchasePrice", data.purchasePrice);
    formData.append("sellingPrice", data.sellingPrice);
    formData.append("stock", data.stock);
    formData.append("lowStockThreshold", data.lowStockThreshold);
    formData.append("unit", data.unit);

    mutate(formData);
  };

  return (
    <div className="rounded-xl bg-slate-900 p-6">
      <h1 className="mb-6 text-xl font-bold text-white">Create Product</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {/* Product Name */}
        <input
          type="text"
          {...register("name")}
          placeholder="Product Name"
          className="rounded bg-slate-800 p-3 text-white placeholder:text-slate-500"
        />

        {/* SKU */}
        <input
          type="text"
          {...register("sku")}
          placeholder="SKU"
          className="rounded bg-slate-800 p-3 text-white placeholder:text-slate-500"
        />

        {/* Category */}
        <input
          type="text"
          {...register("category")}
          placeholder="Category"
          className="rounded bg-slate-800 p-3 text-white placeholder:text-slate-500"
        />

        {/* Purchase Price */}
        <input
          type="number"
          step="0.01"
          {...register("purchasePrice")}
          placeholder="Purchase Price"
          className="rounded bg-slate-800 p-3 text-white placeholder:text-slate-500"
        />

        {/* Selling Price */}
        <input
          type="number"
          step="0.01"
          {...register("sellingPrice")}
          placeholder="Selling Price"
          className="rounded bg-slate-800 p-3 text-white placeholder:text-slate-500"
        />

        {/* Stock */}
        <input
          type="number"
          {...register("stock")}
          placeholder="Stock"
          className="rounded bg-slate-800 p-3 text-white placeholder:text-slate-500"
        />

        {/* Low Stock Threshold */}
        <input
          type="number"
          {...register("lowStockThreshold")}
          placeholder="Low Stock Threshold"
          className="rounded bg-slate-800 p-3 text-white placeholder:text-slate-500"
        />

        {/* Unit */}
        <input
          type="text"
          {...register("unit")}
          placeholder="Unit (Kg, Piece, Liter)"
          className="rounded bg-slate-800 p-3 text-white placeholder:text-slate-500"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
