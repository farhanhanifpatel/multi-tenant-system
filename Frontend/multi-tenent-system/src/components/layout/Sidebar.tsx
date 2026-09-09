import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/auth.service";
import {
  LayoutDashboard,
  Package,
  Users,
  Boxes,
  ShoppingCart,
  // CreditCard,
  // Receipt,
  LogOut,
  X,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Products",
      icon: Package,
      path: "/products",
    },
    {
      name: "Customers",
      icon: Users,
      path: "/customers",
    },
    {
      name: "Suppliers",
      icon: Boxes,
      path: "/suppliers",
    },
    {
      name: "Sales",
      icon: ShoppingCart,
      path: "/sales",
    },

    // {
    //   name: "Payments",
    //   icon: CreditCard,
    //   path: "/payments",
    // },
    // {
    //   name: "Credits",
    //   icon: Receipt,
    //   path: "/credits",
    // },
  ];

  const handleLogout = async () => {
    try {
      await logout();

      localStorage.removeItem("accessToken");
      // localStorage.removeItem("refreshToken");

      setUser(null);

      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
    fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
    bg-gray-900
    border-r border-gray-800
    transform transition-transform duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
          <div>
            <h1 className="text-lg font-bold  text-gray-400 tracking-wider">
              <Link to={"/dashboard"}>{user?.shopId.shopName}</Link>
            </h1>
          </div>

          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="" />
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.path === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-muted-foreground  hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-gray-800 p-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition hover:bg-red-500/10 hover:text-red-300">
                <LogOut size={20} />
                Logout
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Logout</AlertDialogTitle>

                <AlertDialogDescription>
                  Are you sure you want to logout from your account?
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction onClick={handleLogout}>
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
