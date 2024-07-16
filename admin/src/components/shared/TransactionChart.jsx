import React, { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getStatistics as fetchStatistics } from "../../services/orderFood.js";

const TransactionChart = () => {
  const [dataChart, setDataChart] = useState([]);

  const getStatistics = useCallback(async () => {
    try {
      const response = await fetchStatistics();
      if (response.data.success) {
        setDataChart(response.data.totalRevenueByYear);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    getStatistics();
  }, [getStatistics]);

  return (
    <div className="h-[22rem] bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
      <strong className="text-gray-700 font-medium">Thống kê doanh thu</strong>
      <div className="mt-3 w-full flex-1 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={dataChart}
            margin={{
              top: 20,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis dataKey="2024" />
            <Tooltip />
            <Legend />
            <Bar dataKey="2024" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionChart;
