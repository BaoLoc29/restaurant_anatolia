import React, { useCallback, useEffect, useState } from "react";
import { getReservation } from "../services/reservation.js";
import { Table, Tag } from "antd";

export default function RecentOrders() {
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);

  const handleGetReservation = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getReservation();
      setReservations(result.data.reservations.slice(0, 5));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    handleGetReservation();
  }, [handleGetReservation]);

  const columns = [
    {
      title: "Mã bàn",
      dataIndex: "table",
      key: "table",
      align: "center",
    },
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Liên lạc",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    {
      title: "Số khách",
      dataIndex: "guests",
      align: "center",
      key: "guests",
    },
    {
      title: "Ngày đến",
      dataIndex: "date",
      key: "date",
      align: "center",
      sorter: (a, b) => {
        if (typeof a.date === "string" && typeof b.date === "string") {
          return new Date(a.date) - new Date(b.date);
        }
        return a.date.localeCompare(b.date);
      },
      render: (date) => {
        const formattedDate = new Date(date).toLocaleDateString("en-GB");
        return formattedDate;
      },
    },
    {
      title: "Giờ đến",
      dataIndex: "time",
      key: "time",
      align: "center",
      sorter: (a, b) => {
        const timeA = new Date(`1970-01-01T${a.time}`);
        const timeB = new Date(`1970-01-01T${b.time}`);
        return timeA - timeB;
      },
    },
    {
      title: "Đã đặt cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
      align: "center",
      render: (depositAmount) => {
        if (typeof depositAmount === "number") {
          return depositAmount.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          });
        } else {
          return "Invalid depositAmount";
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const colorMap = {
          "Đã đặt trước": "green",
          "Đang hoạt động": "blue",
          "Đã hủy": "red",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
  ];
  return (
    <div className="bg-white px-4 pt-3 pb-4 rounded-sm border border-gray-200 flex-1">
      <strong className="text-gray-700 font-medium">Đơn đặt bàn mới</strong>
      <div className="mt-3">
        <Table
          loading={loading}
          columns={columns}
          dataSource={reservations}
          pagination={false}
        />
      </div>
    </div>
  );
}
