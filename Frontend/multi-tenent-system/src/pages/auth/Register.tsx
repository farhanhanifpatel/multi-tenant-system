import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  MdOutlineMail,
  MdLockOutline,
  MdOutlineStore,
  MdPersonOutline,
  MdPhone,
  MdLocationOn,
} from "react-icons/md";
import { getMe, register } from "../../services/auth.service";
import { type BusinessType } from "../../constant/businessTypes";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();

  const { setUser } = useAuth();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    mobile: "",
    businessType: "" as BusinessType | "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: register,

    onSuccess: async () => {
      try {
        const response = await getMe();

        setUser(response.data);

        toast.success("Account created successfully");

        navigate("/login");
      } catch {
        toast.error("Failed to fetch user");
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Login failed");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.shopName.trim()) newErrors.shopName = "Shop name is required";

    if (!formData.ownerName.trim())
      newErrors.ownerName = "Owner name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";

    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";

    if (!formData.businessType) newErrors.businessType = "Select business type";

    if (!formData.password.trim()) newErrors.password = "Password is required";

    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload = {
      shopName: formData.shopName,
      ownerName: formData.ownerName,
      email: formData.email,
      mobile: formData.mobile,
      businessType: formData.businessType,
      address: formData.address,
      password: formData.password,
    };

    mutate(payload);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <span className="text-2xl font-bold text-white">S</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white">
            Create Your Shop
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Create your account and start managing your business.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Shop Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Shop Name
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 transition focus-within:border-blue-500">
              <MdOutlineStore size={20} className="text-slate-400" />

              <input
                type="text"
                name="shopName"
                placeholder="Enter your shop name"
                value={formData.shopName}
                onChange={handleChange}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>

            {errors.shopName && (
              <p className="mt-2 text-sm text-red-500">{errors.shopName}</p>
            )}
          </div>

          {/* Owner Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Owner Name
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 transition focus-within:border-blue-500">
              <MdPersonOutline size={20} className="text-slate-400" />

              <input
                type="text"
                name="ownerName"
                placeholder="Enter owner name"
                value={formData.ownerName}
                onChange={handleChange}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>

            {errors.ownerName && (
              <p className="mt-2 text-sm text-red-500">{errors.ownerName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email Address
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 transition focus-within:border-blue-500">
              <MdOutlineMail size={20} className="text-slate-400" />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>

            {errors.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Mobile Number
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 transition focus-within:border-blue-500">
              <MdPhone size={20} className="text-slate-400" />

              <input
                type="text"
                name="mobile"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>

            {errors.mobile && (
              <p className="mt-2 text-sm text-red-500">{errors.mobile}</p>
            )}
          </div>

          {/* Business Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Business Type
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 transition focus-within:border-blue-500">
              <MdOutlineStore size={20} className="text-slate-400" />

              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full bg-transparent text-white outline-none"
              >
                <option value="" className="bg-slate-900">
                  Select business type
                </option>

                <option value="GROCERY" className="bg-slate-900">
                  Grocery Shop
                </option>

                <option value="MEDICAL" className="bg-slate-900">
                  Medical Store
                </option>

                <option value="CLOTHING" className="bg-slate-900">
                  Clothing Store
                </option>

                <option value="FOOTWEAR" className="bg-slate-900">
                  Footwear Shop
                </option>

                <option value="HARDWARE" className="bg-slate-900">
                  Hardware Store
                </option>

                <option value="ELECTRONICS" className="bg-slate-900">
                  Electronics Shop
                </option>

                <option value="OTHER" className="bg-slate-900">
                  Other
                </option>
              </select>
            </div>

            {errors.businessType && (
              <p className="mt-2 text-sm text-red-500">{errors.businessType}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Address
              <span className="ml-1 text-xs text-slate-500">(Optional)</span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 transition focus-within:border-blue-500">
              <MdLocationOn size={20} className="text-slate-400" />

              <input
                type="text"
                name="address"
                placeholder="Enter shop address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 transition focus-within:border-blue-500">
              <MdLockOutline size={20} className="text-slate-400" />

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>

            {errors.password && (
              <p className="mt-2 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Confirm Password
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 transition focus-within:border-blue-500">
              <MdLockOutline size={20} className="text-slate-400" />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>

            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creating Account..." : "Create Shop Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="h-px flex-1 bg-slate-800" />

          <span className="px-4 text-xs uppercase text-slate-500">OR</span>

          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Login */}
        <Link to="/login">
          <button className="w-full rounded-xl border border-slate-700 py-3 font-semibold text-slate-200 transition hover:bg-slate-800">
            Already have an account? Sign In
          </button>
        </Link>

        {/* Footer */}
        <p className="mt-10 text-center text-xs leading-6 text-zinc-500">
          Inventory Management • Sales • Customer Ledger • Payment Tracking
        </p>
      </div>
    </div>
  );
};

export default Register;
