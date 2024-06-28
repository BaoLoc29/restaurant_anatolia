import React from "react";
import { FaEdit } from "react-icons/fa";
import { Modal, Pagination, Table, Tag } from "antd";

const ModalListOrderDate = ({
  isModalOpen,
  handleCancel,
  selectedValue,
  loading,
  orders,
  pageIndex,
  pageSize,
  totalDoc,
  searchResults,
}) => {
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
      align: "center",
      key: "guests",
    },
    {
      title: "Mã bàn",
      dataIndex: "table",
      key: "table",
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
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
          "Đã đặt trước": "blue",
          "Đang hoạt động": "green",
          "Đã hủy": "red",
          "Thanh toán thất bại": "red",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (row) => {
        return (
          <div className="flex gap-2 justify-center">
            <FaEdit
              className="text-blue-500 text-2xl hover:text-blue-700 cursor-pointer"
              // onClick={() => handleOpenEditModal(row._id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        searchResults && searchResults.length > 0
          ? "Danh sách kết quả tìm kiếm"
          : `Danh sách đơn đặt bàn ngày ${selectedValue?.format("DD-MM-YYYY")}`
      }
      visible={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={1000}
      style={{
        top: 50,
      }}
    >
      <Table
        loading={loading}
        columns={columns}
        itemLayout="horizontal"
        className="mt-5"
        dataSource={
          searchResults && searchResults.length > 0 ? searchResults : orders
        }
        pagination={false}
      />
      <div className="flex justify-end mt-4">
        <Pagination
          defaultCurrent={1}
          current={pageIndex}
          total={totalDoc}
          pageSize={pageSize}
          showSizeChanger
        />
      </div>
    </Modal>
  );
};

export default ModalListOrderDate;
