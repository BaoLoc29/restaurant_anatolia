import {
  Alert,
  Badge,
  Button,
  Calendar,
  Form,
  Result,
  Modal,
  Input,
} from "antd";
import "../antdCss/Drawer.css";
import { PlusOutlined } from "@ant-design/icons";
import React, { useState, useCallback, useEffect, useRef } from "react";
import dayjs from "dayjs";
import DrawerCreateOrder from "./DrawerCreateOrder/index.jsx";
import ModalListOrderDate from "./ModalListOrderDate/index.jsx";
import {
  createReservation,
  editReservation,
  getOrderByDate,
  getOrders,
  searchReservation,
} from "../services/reservation.js";
import toast from "react-hot-toast";

const Orders = () => {
  const inputRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());
  const [value, setValue] = useState(() => dayjs());
  const [selectedValue, setSelectedValue] = useState(() => dayjs());
  const [drawerCreateOrder, setDrawerCreateOrder] = useState(false);
  const [modalDetailOrder, setModalDetailOrder] = useState(false);
  const [ordersForDate, setOrdersForDate] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [pageSize, setPageSize] = useState(6);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoc, setTotalDoc] = useState(0);

  const [form] = Form.useForm();
  const [showResult, setShowResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const onSelect = (newValue) => {
    setValue(newValue);
    setSelectedValue(newValue);
    setModalDetailOrder(true);
  };

  const onPanelChange = (newValue) => {
    setValue(newValue);
    setMonth(newValue.month() + 1);
    setYear(newValue.year());
  };

  const monthCellRender = () => {
    return null;
  };

  const dateCellRender = (value) => {
    // Filter orders for the current date
    const ordersForDateFiltered = orders.filter(
      (item) => item && dayjs(item.date).isSame(value, "date")
    );

    const listData = ordersForDateFiltered.map((item) => {
      let color = "";
      if (item.status === "Đã đặt trước") {
        color = "lime";
      } else if (item.status === "Đang hoạt động") {
        color = "blue";
      } else if (item.status === "Đã hủy") {
        color = "red";
      } else if (item.status === "Chờ đặt cọc") {
        color = "gray";
      }
      return {
        ...item,
        color,
      };
    });

    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item._id}>
            <Badge color={item.color} text={`Bàn ${item.table}`} />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    if (info.type === "month") return monthCellRender(current);
    return info.originNode;
  };

  const handelCloseModal = () => {
    if (searchQuery.trim() !== "") {
      setIsSearchModalOpen(false);
      handleClearSearch();
    }
    setModalDetailOrder(false);
    setSearchQuery("");
    inputRef.current?.input?.blur();
  };

  const handleCloseDrawer = () => {
    form.resetFields();
    setDrawerCreateOrder(false);
  };

  const getReservation = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getOrders({ month, year });
      setOrders(result.data.orders);
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    getReservation();
  }, [getReservation]);

  // Get List Order By Date
  const getOrderDate = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getOrderByDate({
        date: selectedValue,
        pageSize,
        pageIndex,
      });
      setOrdersForDate(result.data.orders);
      setTotalPages(result.data.totalPages);
      setTotalDoc(result.data.count);
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedValue, pageSize, pageIndex]);

  useEffect(() => {
    if (modalDetailOrder) {
      setPageIndex(1);
      getOrderDate();
    }
  }, [modalDetailOrder, selectedValue, getOrderDate]);

  const handleCreateOrder = async (value) => {
    try {
      setLoading(true);
      const { confirm, ...dataToSend } = value;
      const confirmValue = {
        ...dataToSend,
        depositAmount: dataToSend.deposit ? 200000 : 0,
        status: "Đang hoạt động",
      };
      const result = await createReservation(confirmValue);
      if (result.data?.success) {
        const tableCode = result.data.reservation.table;
        setSelectedTable(tableCode);
        setShowResult(true);
        setDrawerCreateOrder(false);
        getReservation();
        form.resetFields();
        setTimeout(() => {
          setShowResult(false);
        }, 6000);
        setErrorMessage("");
      } else {
        const errorMessage =
          result.data.message || "Đặt bàn thất bại! Vui lòng kiểm tra lại!";
        setErrorMessage(errorMessage);
        setShowResult(true);
      }
    } catch (error) {
      const errorMessage =
        error.response.data?.message ||
        "Đặt bàn thất bại! Vui lòng kiểm tra lại!";
      setErrorMessage(errorMessage);
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReservation = async (id, status) => {
    try {
      setLoading(true);
      const result = await editReservation(id, { status });
      if (result.data.success) {
        const updatedOrders = orders.map((order) =>
          order._id === id ? { ...order, status } : order
        );
        setOrders(updatedOrders);
        getReservation();
        handelCloseModal();
        toast.success("Cập nhật đơn đặt bàn thành công!");
      } else {
        const errorMessage =
          result.data?.message || "Cập nhật thất bại! Vui lòng kiểm tra lại!";
        setErrorMessage(errorMessage);
        // setShowResult(true);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error.data?.message || "Cập nhật thất bại! Vui lòng kiểm tra lại!";
      setErrorMessage(errorMessage);
      // setShowResult(true);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResultModal = () => {
    setShowResult(false);
    setErrorMessage("");
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() !== "") {
        const response = await searchReservation({ phone: searchQuery });
        const searchResults = response.data.reservations;
        setSearchResults(searchResults);
        setIsSearchModalOpen(true);
      }
    } catch (error) {
      toast.error("Không tìm thấy khách hàng này!");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const handlePaginationChange = (pageIndex, pageSize) => {
    if (searchQuery.trim() === "") {
      setPageSize(pageSize);
      setPageIndex(pageIndex);
    } else {
      setPageSize(pageSize);
      handleSearch();
    }
  };

  return (
    <div className="h-screen">
      <div className="flex justify-between items-center px-2 pb-4 px-2 pt-0">
        <h1 className="text-gray-500 text-xl">Danh sách đơn đặt bàn</h1>
        <Input
          size="large"
          ref={inputRef}
          placeholder="Nhập số điện thoại khách hàng...."
          maxLength={10}
          className=" w-[30rem]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button
          type="primary"
          size="large"
          onClick={() => setDrawerCreateOrder(true)}
          icon={<PlusOutlined />}
        >
          Tạo đơn mới
        </Button>
      </div>
      <div className="px-3 bg-white relative">
        <Alert
          message={`Bạn đã chọn ngày ${selectedValue?.format("DD-MM-YYYY")}`}
          className="absolute my-3"
        />
        <div className="custom-calendar">
          <Calendar
            value={value}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
            cellRender={cellRender}
          />
        </div>
        <ModalListOrderDate
          loading={loading}
          isModalOpen={
            searchQuery && searchQuery.trim() !== ""
              ? isSearchModalOpen
              : modalDetailOrder
          }
          handleCancel={handelCloseModal}
          selectedValue={selectedValue}
          orders={searchQuery.trim() !== "" ? searchResults : ordersForDate}
          searchQuery={searchQuery}
          handleEditReservation={handleEditReservation}
          handlePaginationChange={handlePaginationChange}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalPages={totalPages}
          totalDoc={totalDoc}
        />
      </div>
      <DrawerCreateOrder
        form={form}
        loading={loading}
        title="Tạo đơn đặt bàn mới"
        open={drawerCreateOrder}
        onClose={handleCloseDrawer}
        handleOk={handleCreateOrder}
      />
      <Modal open={showResult} footer={null} onCancel={handleCloseResultModal}>
        {errorMessage ? (
          <Result
            status="error"
            title="Đặt bàn không thành công!"
            subTitle={<span className="text-lg">{errorMessage}</span>}
          />
        ) : (
          <Result
            status="success"
            title="Đặt bàn thành công!"
            subTitle={
              <span className="text-lg">
                Bàn của quý khách là bàn{" "}
                <strong className="text-red-500">{selectedTable}</strong>.{" "}
                <br />
                Cảm ơn quý khách đã tin tưởng. Chúc quý khách có một bữa ăn ngon
                miệng!
              </span>
            }
          />
        )}
      </Modal>
    </div>
  );
};

export default Orders;
