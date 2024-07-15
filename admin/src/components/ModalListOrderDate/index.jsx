import React, { useState } from "react";
import { Button, Modal, Pagination, Select, Table } from "antd";

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
  searchQuery,
  handleEditReservation,
  handlePaginationChange,
}) => {
  const [updatedStatus, setUpdatedStatus] = useState({});

  const handleStatusChange = (recordId, newStatus) => {
    setUpdatedStatus({
      ...updatedStatus,
      [recordId]: newStatus,
    });
  };

  const handleUpdateStatus = () => {
    Object.keys(updatedStatus).forEach((recordId) => {
      handleEditReservation(recordId, updatedStatus[recordId]);
    });
    setUpdatedStatus({});
  };
  const columns = [
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
      title: "Mã bàn",
      dataIndex: "table",
      key: "table",
      align: "center",
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
      render: (status, record) => (
        <Select
          placeholder="--Lựa chọn đặt cọc--"
          className="text-base w-[9rem]"
          value={updatedStatus[record._id] || status}
          onChange={(newStatus) => handleStatusChange(record._id, newStatus)}
        >
          <Select.Option value="Đã đặt trước">Đã đặt trước</Select.Option>
          <Select.Option value="Đang hoạt động">Đang hoạt động</Select.Option>
          <Select.Option value="Đã hủy">Đã hủy</Select.Option>
        </Select>
      ),
    },
  ];
  const hasChanges = () => Object.keys(updatedStatus).length > 0;
  return (
    <Modal
      title={
        searchQuery ? (
          <span>
            Kết quả tìm kiếm cho số điện thoại có đuôi là{" "}
            <span className="text-red-500">"{searchQuery}"</span>
          </span>
        ) : (
          `Danh sách đơn đặt bàn ngày ${selectedValue?.format("DD-MM-YYYY")}`
        )
      }
      open={isModalOpen}
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
      <div className="flex mt-4 justify-end space-x-2">
        <Pagination
          current={pageIndex}
          pageSize={pageSize}
          total={totalDoc}
          onChange={handlePaginationChange}
        />
        <Button
          type="primary"
          disabled={!hasChanges()}
          onClick={handleUpdateStatus}
        >
          Cập nhật
        </Button>
      </div>
    </Modal>
  );
};

export default ModalListOrderDate;
