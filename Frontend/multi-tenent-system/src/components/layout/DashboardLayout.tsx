import React, { useState, type Dispatch, type SetStateAction } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const SidebarComponent = Sidebar as React.ComponentType<{
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}>;

const HeaderComponent = Header as React.ComponentType<{
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}>;

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617]">
      <SidebarComponent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="lg:ml-64">
        <HeaderComponent setSidebarOpen={setSidebarOpen} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
