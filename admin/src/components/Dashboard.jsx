import React from "react";
import DashboardStatsGrid from "../components/DashboardStatsGrid";
import TransactionChart from "../components/shared/TransactionChart";
import RecentOrders from "../components/RecentOrders";

function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <DashboardStatsGrid />
      <div className="flex flex-row gap-4 w-full">
        <TransactionChart />
      </div>
      <div className="flex flex-row gap-4 w-full">
        <RecentOrders />
      </div>
    </div>
  );
}

export default Dashboard;
