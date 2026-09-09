import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineMail, MdLockOutline } from "react-icons/md";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { login, getMe } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { setUser } = useAuth();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: login,

    onSuccess: async (response) => {
      try {
        const accessToken = response.data.accessToken;

        localStorage.setItem("accessToken", accessToken);
        // localStorage.setItem("refreshToken", refreshToken);

        const meResponse = await getMe();

        setUser(meResponse.data);

        toast.success("Login successful");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    mutate(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <span className="text-2xl font-bold text-white">S</span>
          </div>

          <div className="mb-10 text-center">
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>

            <p className="mt-3 text-sm text-zinc-400">
              Sign in to manage your inventory, sales and customer payments.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>

            {errors.password && (
              <p className="mt-2 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="my-8 flex items-center">
          <div className="h-px flex-1 bg-slate-800" />

          <span className="px-4 text-xs uppercase text-slate-500">OR</span>

          <div className="h-px flex-1 bg-slate-800" />
        </div>
        <Link to="/register">
          <button className="w-full rounded-xl border border-slate-700 py-3 font-semibold text-slate-200 transition hover:bg-slate-800">
            Create Shop Account
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

export default Login;
