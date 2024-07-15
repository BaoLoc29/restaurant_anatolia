import React from "react";
import DashboardStatsGrid from "../components/DashboardStatsGrid";
import TransactionChart from "../components/shared/TransactionChart";
import RecentOrders from "../components/RecentOrders";
import PopularProducts from "../components/PopularProducts";

function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <DashboardStatsGrid />
      <div className="flex flex-row gap-4 w-full">
        <TransactionChart />
      </div>
      <div className="flex flex-row gap-4 w-full">
        <RecentOrders />
        <PopularProducts />
      </div>
    </div>
  );
}

export default Dashboard;
