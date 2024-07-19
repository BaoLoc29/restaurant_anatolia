import React, { useEffect, useState } from "react";
import { getTop3Dishes } from "../../services/orderFood.js";
import { PieChart, Pie, ResponsiveContainer, Legend, Cell } from "recharts";

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function BuyerProfileChart() {
  const [data, setData] = useState([]);
  const COLORS = ["#FF0000", "#22C55E", "#0084ff"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTop3Dishes();
        const topDishes = response.data.topDishes.map((dish) => ({
          name: dish._id,
          value: dish.totalQuantity,
        }));
        setData(topDishes);
      } catch (error) {
        console.error("Error fetching top dishes:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-[20rem] h-[24rem] bg-white p-4 rounded-sm border border-gray-200 flex flex-col">
      <strong className="text-gray-700 font-medium">
        Top 3 Món Ăn Bán Chạy Nhất
      </strong>
      <div className="mt-3 w-full flex-1 text-xs"></div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={105}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BuyerProfileChart;
