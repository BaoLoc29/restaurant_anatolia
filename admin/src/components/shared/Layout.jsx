import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
function Layout() {
  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar className="fixed top-0 left-0 h-full" />
      <div className="flex-1 ml-[width-of-sidebar] overflow-y-auto">
        <Header />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
