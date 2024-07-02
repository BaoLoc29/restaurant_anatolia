import React, { useCallback, useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { getPagingOrderFood, searchOrderFood } from "../services/orderFood.js";
import { Input, Pagination, Space, Table, Tag } from "antd";
import toast from "react-hot-toast";

const ListOrderDish = () => {
  const [loading, setLoading] = useState(false);
  const [orderFood, setOrderFood] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoc, setTotalDoc] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotalDoc, setSearchTotalDoc] = useState(0);
  const [searchPageIndex, setSearchPageIndex] = useState(1);

  const columns = [
    {
      title: "Mã bàn",
      dataIndex: "tableId",
      key: "tableId",
      align: "center",
      sorter: (a, b) => {
        if (typeof a.tableId === "number" && typeof b.tableId === "number") {
          return a.tableId - b.tableId;
        }
        return a.tableId.localeCompare(b.tableId);
      },
    },
    {
      title: "Ngày đến",
      dataIndex: "reservationDate",
      key: "reservationDate",
      align: "center",
      sorter: (a, b) => {
        if (
          typeof a.reservationDate === "string" &&
          typeof b.reservationDate === "string"
        ) {
          return new Date(a.reservationDate) - new Date(b.reservationDate);
        }
        return a.reservationDate.localeCompare(b.reservationDate);
      },
      render: (reservationDate) => {
        const formattedDate = new Date(reservationDate).toLocaleDateString(
          "en-GB"
        );
        return formattedDate;
      },
    },
    {
      title: "Giờ đến",
      dataIndex: "reservationTime",
      key: "reservationTime",
      align: "center",
      sorter: (a, b) => {
        const timeA = new Date(`1970-01-01T${a.reservationTime}`);
        const timeB = new Date(`1970-01-01T${b.reservationTime}`);
        return timeA - timeB;
      },
    },
    {
      title: "Đặt cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const colorMap = {
          "Chưa thanh toán": "red",
          "Đã thanh toán": "green",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (row) => {
        return (
          <div className="flex gap-2 justify-center">
            <FaEdit
              className="text-blue-500 text-2xl hover:text-blue-700 cursor-pointer"
              //   onClick={() => handleOpenEditModal(row._id)}
            />
          </div>
        );
      },
    },
  ];
  const getOrderFood = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPagingOrderFood({ pageSize, pageIndex });
      setOrderFood(result.data.orders);
      setTotalPages(result.data.totalPages);
      setTotalDoc(result.data.count);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageIndex]);

  useEffect(() => {
    getOrderFood();
  }, [getOrderFood]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() !== "") {
        const response = await searchOrderFood({ tableId: searchQuery });
        if (response.data.success) {
          setSearchResults(response.data.tableReservations);
          setSearchTotalDoc(response.data.count);
          setSearchPageIndex(1);
        } else {
          toast.error(
            response?.data?.message ||
              "Mã bàn không hợp lệ! Vui lòng kiểm tra lại!"
          );
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Mã bàn không hợp lệ! Vui lòng kiểm tra lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    getOrderFood();
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value === "") {
      handleClearSearch();
    }
  };

  const handlePaginationChange = (pageIndex, pageSize) => {
    if (searchQuery.trim() === "") {
      setPageSize(pageSize);
      setPageIndex(pageIndex);
    } else {
      setPageSize(pageSize);
      setSearchPageIndex(pageIndex);
      handleSearch();
      console.log(totalPages);
    }
  };

  return (
    <div className="h-[37.45rem]">
      <div className="flex justify-between items-center px-2 pb-4 pr-4 pl-4 pt-0">
        <h1 className="text-gray-500 text-xl">Danh sách bàn</h1>
        <Space.Compact className=" relative">
          <Input
            placeholder="Nhập mã đơn đặt bàn..."
            className="text-sm w-[25rem]"
            value={searchQuery}
            onChange={handleInputChange}
            onPressEnter={handleSearch}
            allowClear
          />
        </Space.Compact>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={searchResults.length > 0 ? searchResults : orderFood}
        pagination={false}
      />
      <Pagination
        className="my-5 float-right"
        defaultCurrent={1}
        current={searchQuery.trim() === "" ? pageIndex : searchPageIndex}
        total={searchQuery.trim() === "" ? totalDoc : searchTotalDoc}
        pageSize={pageSize}
        showSizeChanger
        onChange={handlePaginationChange}
      />
    </div>
  );
};

export default ListOrderDish;
