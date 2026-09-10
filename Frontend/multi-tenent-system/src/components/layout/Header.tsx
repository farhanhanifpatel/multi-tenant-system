import {
  Bell,
  Menu,
  User,
  Lock,
  Store,
  Mail,
  Save,
  Loader2,
  AlertTriangle,
  CreditCard,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";

import { updateProfile } from "@/services/auth.service";
import AppBreadcrumb from "./AppBreadcrumb";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useClearNotification,
  useClearAllNotifications,
} from "../../hooks/useNotification";
import type { NotificationType } from "@/types/notification.types";
interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "LOW_STOCK":
      return Package;

    case "OUT_OF_STOCK":
      return AlertTriangle;

    case "PAYMENT_DUE":
      return CreditCard;

    case "SUPPLIER_DUE":
      return Store;

    case "SALE":
      return ShoppingCart;

    case "SUBSCRIPTION":
      return Bell;

    default:
      return Bell;
  }
};

const getRelativeTime = (date: string) => {
  const now = new Date();
  const createdAt = new Date(date);

  const diffInSeconds = Math.floor(
    (now.getTime() - createdAt.getTime()) / 1000,
  );

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return createdAt.toLocaleDateString();
};

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { user } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: notifications = [], isLoading: isNotificationsLoading } =
    useNotifications();

  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const clearNotificationMutation = useClearNotification();
  const clearAllNotificationsMutation = useClearAllNotifications();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    shopName: user?.shopId?.shopName || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await updateProfile(formData);

      toast.success(response?.message || "Profile updated successfully");

      // Replace input values with updated data
      setFormData({
        name: response.data.name,
        shopName: response.data.shopName,
        email: response.data.email,
        password: response.data.password,
        confirmPassword: "",
      });

      setProfileOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update profile";

      toast.error(message);

      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-gray-800 bg-[#0F172A] px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-300 transition hover:text-white lg:hidden"
            >
              <Menu size={24} />
            </button>

            <div>
              <p className="mt-4 text-gray-300">
                Welcome back{" "}
                <span className="text-xl font-medium tracking-wider text-gray-400">
                  {user?.name} 👋
                </span>
              </p>

              <AppBreadcrumb />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* RIGHT */}
            <div className="flex items-center gap-3">
              {/* NOTIFICATION */}
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen((prev) => !prev)}
                  className="
                  relative rounded-lg p-2 text-gray-300
                  transition hover:bg-gray-800 hover:text-white
                "
                >
                  <Bell size={20} />

                  {unreadCount > 0 && (
                    <span
                      className="
        absolute -right-0.5 -top-0.5
        flex h-4 min-w-4 items-center justify-center
        rounded-full bg-red-500 px-1
        text-[10px] font-bold text-white
      "
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION DROPDOWN */}
                <div
                  className={`
    absolute right-0 top-12 z-50
    w-80
    rounded-xl border border-slate-700
    bg-slate-900 shadow-2xl
    transition-all duration-200
    ${
      notificationOpen
        ? "visible translate-y-0 opacity-100"
        : "invisible translate-y-2 opacity-0"
    }
  `}
                >
                  {/* Header */}

                  <div className="flex items-center justify-between border-b border-slate-800 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        You have {unreadCount} unread notification
                        {unreadCount !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isPending}
                        className="text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50"
                      >
                        {markAllAsReadMutation.isPending
                          ? "Marking..."
                          : "Mark all as read"}
                      </button>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="max-h-80 overflow-y-auto">
                    {isNotificationsLoading ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500">
                        Loading notifications...
                      </div>
                    ) : unreadCount === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);

                        return (
                          <div
                            key={notification._id}
                            onClick={() => {
                              if (!notification.isRead) {
                                markAsReadMutation.mutate(notification._id);
                              }
                            }}
                            className={`
            flex gap-3
            border-b border-slate-800
            px-4 py-3
            transition
            hover:bg-slate-800/60
            ${!notification.isRead ? "bg-slate-800/30" : ""}
          `}
                          >
                            {/* Icon */}
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400">
                              <Icon size={18} />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <p
                                className={`
                text-sm
                ${
                  notification.isRead
                    ? "font-normal text-slate-300"
                    : "font-semibold text-white"
                }
              `}
                              >
                                {notification.title}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                {notification.message}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-500">
                                {getRelativeTime(notification.createdAt)}
                              </p>
                            </div>

                            {/* Right side */}
                            <div className="flex shrink-0 items-start gap-2">
                              {/* Unread dot */}
                              {!notification.isRead && (
                                <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                              )}

                              {/* Clear button */}
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();

                                  clearNotificationMutation.mutate(
                                    notification._id,
                                  );
                                }}
                                disabled={clearNotificationMutation.isPending}
                                className="
                rounded-md p-1
                text-slate-500
                transition
                hover:bg-slate-800
                hover:text-red-400
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
                                title="Clear notification"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-slate-800 p-2">
                    <button
                      type="button"
                      onClick={() => clearAllNotificationsMutation.mutate()}
                      disabled={
                        clearAllNotificationsMutation.isPending ||
                        notifications.length === 0
                      }
                      className="
      rounded-lg px-3 py-2
      text-xs font-medium
      text-red-400
      transition
      hover:bg-slate-800
      hover:text-red-300
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
                    >
                      {clearAllNotificationsMutation.isPending
                        ? "Clearing..."
                        : "Clear all"}
                    </button>

                    <button
                      type="button"
                      className="
      rounded-lg px-3 py-2
      text-xs font-medium
      text-blue-400
      transition
      hover:bg-slate-800
      hover:text-blue-300
    "
                    >
                      View all
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => {
                setFormData({
                  name: user?.name || "",
                  shopName: user?.shopId?.shopName || "",
                  email: user?.email || "",
                  password: "",
                  confirmPassword: "",
                });

                setProfileOpen(true);
              }}
              className="hidden items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 md:flex"
            >
              <User size={18} />
              <span>Profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border border-slate-800 bg-slate-900 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                <User size={22} />
              </div>
              Profile Settings
            </DialogTitle>

            <DialogDescription className="text-slate-400">
              Update your personal information and shop details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProfileSubmit} className="mt-4 space-y-5">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Owner Name
              </label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 transition focus-within:border-blue-500">
                <User className="ml-4 text-slate-400" size={19} />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Shop Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Shop Name
              </label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 transition focus-within:border-blue-500">
                <Store className="ml-4 text-slate-400" size={19} />

                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Enter shop name"
                  className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email Address
              </label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 transition focus-within:border-blue-500">
                <Mail className="ml-4 text-slate-400" size={19} />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-slate-800 pt-5">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Lock size={17} className="text-blue-400" />
                  Change Password
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Leave these fields empty if you don't want to change your
                  password.
                </p>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  New Password
                </label>

                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 transition focus-within:border-blue-500">
                  <Lock className="ml-4 text-slate-400" size={19} />

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Confirm New Password
                </label>

                <div
                  className={`flex items-center rounded-xl border bg-slate-800 transition focus-within:border-blue-500 ${
                    formData.password &&
                    formData.password !== formData.confirmPassword
                      ? "border-red-500"
                      : "border-slate-700"
                  }`}
                >
                  <Lock className="ml-4 text-slate-400" size={19} />

                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                {formData.password &&
                  formData.password !== formData.confirmPassword && (
                    <p className="mt-2 text-xs text-red-400">
                      Passwords do not match.
                    </p>
                  )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProfileOpen(false)}
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !!(
                    formData.password &&
                    formData.password !== formData.confirmPassword
                  )
                }
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
