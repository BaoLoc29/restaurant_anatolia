import {
  Alert,
  Badge,
  Button,
  Calendar,
  Input,
  Select,
  Space,
  Form,
  Result,
  Modal,
} from "antd";
import "../antdCss/Drawer.css";
import moment from "moment";
import { TiDelete } from "react-icons/ti";
import { PlusOutlined } from "@ant-design/icons";
import React, { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import DrawerCreateOrder from "./DrawerCreateOrder/index.jsx";
import ModalListOrderDate from "./ModalListOrderDate/index.jsx";
import {
  createReservation,
  getOrderByDate,
  getOrders,
} from "../services/reservation.js";

const Orders = () => {
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());
  const [value, setValue] = useState(() => dayjs());
  const [selectedValue, setSelectedValue] = useState(() => dayjs());
  const [drawerCreateOrder, setDrawerCreateOrder] = useState(false);
  const [modalDetailOrder, setModalDetailOrder] = useState(false);
  const [ordersForDate, setOrdersForDate] = useState([]);

  const [pageSize, setPageSize] = useState(7);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoc, setTotalDoc] = useState(0);
  const [form] = Form.useForm();
  const [showResult, setShowResult] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");

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
    const ordersForDateFiltered = order.filter(
      (item) => item && dayjs(item.date).isSame(value, "date")
    );

    // Determine type based on date and time comparison
    const listData = ordersForDateFiltered.map((item) => {
      let type = "processing";
      if (item.status === "Đã đặt trước") {
        type = "processing";
      } else if (item.status === "Đang hoạt động") {
        type = "success";
      } else if (item.status === "Đã hủy") {
        type = "error";
      } else if (item.status === "Thanh toán thất bại") {
        type = "error";
      }
      return {
        ...item,
        type,
      };
    });
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item._id}>
            <Badge status={item.type} text={`Bàn ${item.table}`} />
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
    setModalDetailOrder(false);
    // setSelectedValue(null);
  };

  const handleCloseDrawer = () => {
    form.resetFields();
    setDrawerCreateOrder(false);
  };

  const getReservation = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getOrders({ month, year });
      setOrder(result.data.orders);
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
      getOrderDate();
    }
  }, [modalDetailOrder, selectedValue, getOrderDate]);

  const handleCreateOrder = async (values) => {
    try {
      setLoading(true);
      const { date, time, ...dataToSend } = values;
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const formattedTime = moment(time, "HH:mm").format("HH:mm");
      const dataToSendWithTime = {
        ...dataToSend,
        time: formattedTime,
        date: formattedDate,
        depositAmount: dataToSend.deposit ? 200000 : 0,
      };

      const result = await createReservation(dataToSendWithTime);
      setOrder([result.data.savedReservation, ...order]);
      const tableCode = result.data.reservation.table;
      setSelectedTable(tableCode);
      setShowResult(true);
      setDrawerCreateOrder(false);
      getReservation();
      form.resetFields();
      setTimeout(() => {
        setShowResult(false);
      }, 90000);
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = error.response.data.errors.map((err) => err.msg);
        setErrorMessages(errorMessages);
      } else {
        setErrorMessages(["Đã xảy ra lỗi khi đặt bàn. Vui lòng thử lại sau."]);
      }
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResultModal = () => {
    setShowResult(false);
    setErrorMessages("");
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center px-2 pb-4 px-2 pt-0">
        <h1 className="text-gray-500 text-xl">Danh sách đơn đặt bàn</h1>
        <Space.Compact className="w-[32rem] relative">
          <Select defaultValue="code" className="w-[10rem]" />
          <Input placeholder="Nhập từ khóa tìm kiếm ...." />
          <TiDelete className="text-gray-400 text-xl absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer z-10" />
        </Space.Compact>
        <Button
          type="primary"
          onClick={() => setDrawerCreateOrder(true)}
          icon={<PlusOutlined />}
        >
          Tạo đơn mới
        </Button>
      </div>
      <div className="px-3 bg-white">
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
          title="Open"
          isModalOpen={modalDetailOrder}
          handleCancel={handelCloseModal}
          selectedValue={selectedValue}
          orders={ordersForDate}
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
      <Modal
        visible={showResult}
        footer={null}
        onCancel={handleCloseResultModal}
      >
        {errorMessages.length > 0 ? (
          <Result
            status="error"
            title="Đặt bàn không thành công"
            subTitle={errorMessages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
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
                Cảm ơn quý khách đã tin tưởng. Chúc quý khách có bữa ăn ngon
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
