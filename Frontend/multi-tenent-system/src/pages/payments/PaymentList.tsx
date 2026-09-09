/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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

const PaymentList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [open, setOpen] = useState(false);

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
    formState: { errors },
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

        <Button onClick={handleCreate}>+ Create Customer</Button>
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
        <table className="min-w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">Due Amount</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-slate-800">
                  <td className="p-3">
                    <div className="h-4 w-24 rounded bg-slate-700" />
                  </td>

                  <td className="p-3">
                    <div className="h-4 w-20 rounded bg-slate-700" />
                  </td>

                  <td className="p-3">
                    <div className="h-4 w-32 rounded bg-slate-700" />
                  </td>

                  <td className="p-3">
                    <div className="h-4 w-16 rounded bg-slate-700" />
                  </td>

                  <td className="p-3">
                    <div className="h-8 w-24 rounded bg-slate-700" />
                  </td>
                </tr>
              ))
            ) : customers.length > 0 ? (
              customers.map((customer: any) => (
                <tr
                  key={customer._id}
                  className="border-b border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="p-3">{customer.name}</td>

                  <td className="p-3">{customer.mobile}</td>

                  <td className="p-3">{customer.address || "-"}</td>

                  <td className="p-3">
                    <Badge
                      variant={
                        customer.dueAmount > 0 ? "destructive" : "secondary"
                      }
                    >
                      ₹{customer.dueAmount || 0}
                    </Badge>
                  </td>

                  <td className="p-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mr-2 rounded bg-yellow-500 px-3 py-1 text-sm  hover:bg-yellow-600"
                      onClick={() => handleEdit(customer)}
                    >
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded bg-red-500 px-3 py-1 text-sm  hover:bg-red-600"
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
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
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-slate-900  sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white tracking-wider">
              {editingCustomer ? "Edit Product" : "Create Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-white tracking-wider mb-2 block text-sm">
                  Customer Name
                </label>

                <input
                  {...register("name")}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                />

                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm text-white tracking-wider">
                  Mobile
                </label>

                <input
                  {...register("mobile")}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                />

                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.mobile.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-white tracking-wider">
                  Address
                </label>

                <textarea
                  {...register("address")}
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2"
                />

                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>{" "}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>

              <Button type="submit">
                {editingCustomer ? "Update Customer" : "Create Customer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentList;
