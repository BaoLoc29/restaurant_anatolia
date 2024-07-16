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
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { getStatistics as fetchStatistics } from "../../services/orderFood.js";

const TransactionChart = () => {
  const { RangePicker } = DatePicker;
  const [dataChart, setDataChart] = useState([]);
  const [selectedYears, setSelectedYears] = useState([2023, 2024]);

  const getStatistics = useCallback(async () => {
    const [startYear, endYear] = selectedYears;
    try {
      const response = await fetchStatistics({ startYear, endYear });
      if (response.data.success) {
        const rawData = response.data.totalRevenueByYear;
        const formattedData = Object.keys(rawData).map((month) => ({
          month,
          ...rawData[month],
        }));
        setDataChart(formattedData);
      }
    } catch (error) {
      console.log(error);
    }
  }, [selectedYears]);

  useEffect(() => {
    getStatistics();
  }, [getStatistics]);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setSelectedYears([dates[0].year(), dates[1].year()]);
    }
  };

  return (
    <div className="h-[22rem] bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
      <div className="flex justify-between ">
        <strong className="text-gray-700 font-medium">
          Thống kê doanh thu
        </strong>
        <RangePicker
          picker="year"
          defaultValue={[dayjs("2023"), dayjs("2024")]}
          onChange={handleDateChange}
        />
      </div>

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
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="2023" fill="#e74c3c" />
            <Bar dataKey="2024" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionChart;
