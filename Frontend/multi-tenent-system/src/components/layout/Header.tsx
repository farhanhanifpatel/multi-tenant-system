import { Bell, Menu, User } from "lucide-react";
import AppBreadcrumb from "./AppBreadcrumb";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-gray-800 bg-[#0F172A] px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="" />
          </button>

          <div>
            <p className="mt-4 ">
              Welcome back{" "}
              <span className="text-xl text-gray-400 tracking-wider">
                {user?.name}👋
              </span>
            </p>

            <AppBreadcrumb />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Bell className="" />

          <div className="hidden md:flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2">
            <User size={18} />
            <span className="">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
