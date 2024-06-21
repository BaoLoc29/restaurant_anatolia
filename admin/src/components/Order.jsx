import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Table, Pagination, Switch, Button } from "antd";
import { toast } from "react-hot-toast";
import {
  getPagingReservation,
  editReservation,
} from "../services/reservation.js";
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoc, setTotalDoc] = useState(0);
  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Liên lạc",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Số khách",
      dataIndex: "guests",
      key: "guests",
      sorter: (a, b) => {
        if (typeof a.guests === "number" && typeof b.guests === "number") {
          return a.guests - b.guests;
        }
        return a.guests.localeCompare(b.guests);
      },
    },

    {
      title: "Mã bàn",
      dataIndex: "table",
      key: "table",
    },
    {
      title: "Ngày đến",
      dataIndex: "date",
      key: "date",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Giờ đến",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Đã đặt cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
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
      render: (status, record) => {
        return (
          <Switch
            checkedChildren="On"
            unCheckedChildren="Off"
            checked={status === "Đang hoạt động"}
            onChange={(checked) => edit(record._id, checked)}
          />
        );
      },
    },
  ];

  const getOrders = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPagingReservation({ pageSize, pageIndex });
      setOrders(result.data.reservations);
      setTotalPages(result.data.totalPages);
      setTotalDoc(result.data.count);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageIndex]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const edit = async (id, checked) => {
    try {
      const status = checked ? "Đang hoạt động" : "Đã hủy";
      const updatedOrders = orders.map((order) =>
        order._id === id ? { ...order, status: status } : order
      );
      setOrders(updatedOrders);
      await editReservation(id, { status });
      toast.success("Cập nhật đơn đặt bàn thành công!");
    } catch (error) {
      console.log(error);
      toast.success("Cập nhật đơn đặt bàn thất bại!");
    }
  };
  return (
    <div className="h-[37.45rem]">
      <div className="flex justify-between items-center px-2 pb-4 pr-4 pl-4 pt-0">
        <h1 className="text-gray-500 text-xl">Danh sách đơn đặt bàn</h1>
        <Button type="primary">Tạo đơn đặt bàn</Button>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={orders}
        pagination={false}
      />
      <Pagination
        className="my-5 float-right"
        defaultCurrent={1}
        current={pageIndex}
        total={totalDoc}
        pageSize={pageSize}
        totalPages={totalPages}
        showSizeChanger
        onChange={(pageIndex, pageSize) => {
          setPageSize(pageSize);
          setPageIndex(pageIndex);
        }}
      />
    </div>
  );
};

export default Orders;
