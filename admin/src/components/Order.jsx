import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Table, Pagination } from "antd";
import { getPagingReservation } from "../services/reservation.js";
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
      title: "E-mail",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Liên lạc",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Số người đi",
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
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
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
  return (
    <div className="h-[37.45rem]">
      <div className="flex justify-between items-center px-2 pb-4 pr-4 pl-4 pt-0">
        <h1 className="text-gray-500 text-xl">Danh sách đơn đặt bàn</h1>
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
