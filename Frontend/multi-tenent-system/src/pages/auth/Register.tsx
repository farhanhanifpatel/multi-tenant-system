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

        navigate("/dashboard");
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
    <div className="flex min-h-screen bg-black">
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold">Create Your Shop</h2>

            <p className="mt-3 text-zinc-400">
              Create your account and start managing your business.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Shop Name */}
            <div>
              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-4 focus-within:border-blue-500">
                <MdOutlineStore size={22} className="text-zinc-400" />

                <input
                  type="text"
                  name="shopName"
                  placeholder="Shop Name"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none placeholder:text-zinc-500"
                />
              </label>

              {errors.shopName && (
                <p className="mt-2 text-sm text-red-500">{errors.shopName}</p>
              )}
            </div>

            {/* Owner Name */}
            <div>
              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-4 focus-within:border-blue-500">
                <MdPersonOutline size={22} className="text-zinc-400" />

                <input
                  type="text"
                  name="ownerName"
                  placeholder="Owner Name"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none placeholder:text-zinc-500"
                />
              </label>

              {errors.ownerName && (
                <p className="mt-2 text-sm text-red-500">{errors.ownerName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-4 focus-within:border-blue-500">
                <MdOutlineMail size={22} className="text-zinc-400" />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none placeholder:text-zinc-500"
                />
              </label>

              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-4 focus-within:border-blue-500">
                <MdPhone size={22} className="text-zinc-400" />

                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none placeholder:text-zinc-500"
                />
              </label>

              {errors.mobile && (
                <p className="mt-2 text-sm text-red-500">{errors.mobile}</p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 outline-none focus:border-blue-500"
              >
                <option value="">Select Business Type</option>
                <option value="GROCERY">Grocery Shop</option>
                <option value="MEDICAL">Medical Store</option>
                <option value="CLOTHING">Clothing Store</option>
                <option value="FOOTWEAR">Footwear Shop</option>
                <option value="HARDWARE">Hardware Store</option>
                <option value="ELECTRONICS">Electronics Shop</option>
                <option value="OTHER">Other</option>
              </select>

              {errors.businessType && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.businessType}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-4 focus-within:border-blue-500">
                <MdLocationOn size={22} className="text-zinc-400" />

                <input
                  type="text"
                  name="address"
                  placeholder="Address (Optional)"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none placeholder:text-zinc-500"
                />
              </label>
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-4 focus-within:border-blue-500">
                <MdLockOutline size={22} className="text-zinc-400" />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none placeholder:text-zinc-500"
                />
              </label>

              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-4 focus-within:border-blue-500">
                <MdLockOutline size={22} className="text-zinc-400" />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none placeholder:text-zinc-500"
                />
              </label>

              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-blue-500 py-3 font-bold transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Creating Account..." : "Create Shop"}
            </button>
          </form>

          <div className="my-8 flex items-center">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="px-4 text-sm text-zinc-500">OR</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <Link to="/login">
            <button className="w-full rounded-full border border-zinc-700 py-3 font-bold transition hover:bg-zinc-900">
              Already have an account? Sign In
            </button>
          </Link>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Shop Management System for Inventory, Sales, Customers & Udhar
            Tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
