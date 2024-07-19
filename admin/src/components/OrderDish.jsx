import {
  Pagination,
  Card,
  Spin,
  Button,
  AutoComplete,
  Form,
  Table,
  Alert,
  Empty,
  notification,
  Popconfirm,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { getPagingMenu, getAllMenu, searchMenu } from "../services/menu.js";
import {
  createOrderFood,
  getDetailOrderFood,
  deleteOrder,
} from "../services/orderFood.js";
import { createCheckoutSession } from "../services/payment.js";
import { MdDelete, MdLocalPrintshop } from "react-icons/md";
import { TbBrandAirtable } from "react-icons/tb";
import ModalGetReservation from "../components/ModalGetReservation/index.jsx";
import QuantityInput from "./QuantityInput/index.jsx";
import toast from "react-hot-toast";

const OrderDish = () => {
  const [form] = Form.useForm();
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalGetReservation, setModalGetReservation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(6);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoc, setTotalDoc] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [orderData, setOrderData] = useState({ dishes: [], depositAmount: 0 });
  const { Option } = AutoComplete;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const response = await createCheckoutSession(selectedTable);
      if (response.data.success) {
        window.location.href = response.data.session_url;
      } else {
        toast.error("Failed to initiate payment session.");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment session.");
    } finally {
      setLoading(false);
    }
  };

  const getMenus = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPagingMenu({
        pageSize,
        pageIndex,
        category: activeCategory,
      });
      setMenus(result.data.menus);
      setTotalPages(result.data.totalPages);
      setTotalDoc(result.data.count);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageIndex, activeCategory]);

  const handleGetAllMenu = useCallback(async () => {
    try {
      const result = await getAllMenu();
      if (result.data.categories) {
        setCategories(result.data.categories);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    getMenus();
    handleGetAllMenu();
  }, [getMenus, handleGetAllMenu]);

  useEffect(() => {
    const total = orderData.dishes.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setTotalQuantity(total);
  }, [orderData]);

  const handlePaginationChange = (pageIndex, pageSize) => {
    setPageSize(pageSize);
    setPageIndex(pageIndex);
  };

  const handleCategoryClick = (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      setPageIndex(1);
      getMenus();
    } else {
      setActiveCategory(category);
      setPageIndex(1);
    }
  };
  const truncatedName = (name, maxLength) => {
    if (name.length > maxLength) {
      return `${name.slice(0, maxLength)}...`;
    }
    return name;
  };
  const handleSearch = async (keyword) => {
    try {
      const result = await searchMenu(keyword, "name");
      setOptions(result.data.menus);
    } catch (error) {
      console.log(error);
    }
  };
  const handleCloseModal = () => {
    form.resetFields();
    setModalGetReservation(false);
  };
  const handleSelectTable = (reservationId) => {
    setSelectedTable(reservationId);
    console.log(reservationId);
    setModalGetReservation(false);
  };

  const handleQuantityChange = (dishId, newQuantity) => {
    const updatedDishes = orderData.dishes.map((dish) =>
      dish._id === dishId ? { ...dish, quantity: newQuantity } : dish
    );

    setOrderData((prevData) => ({
      ...prevData,
      dishes: updatedDishes,
    }));
  };

  const addDishToOrder = (code, dishName, price) => {
    if (!selectedTable) {
      notification.error({
        message: <span className="font-bold">Chọn bàn</span>,
        description: "Vui lòng chọn bàn trước khi thêm món ăn.",
      });
      setModalGetReservation(true);
      return;
    }

    const existingDishIndex = orderData.dishes.findIndex(
      (dish) => dish.code === code
    );

    const newDish = {
      code,
      dishName,
      price,
      quantity: 1,
    };

    if (existingDishIndex !== -1) {
      setOrderData((prevOrderData) => ({
        ...prevOrderData,
        dishes: [newDish, ...prevOrderData.dishes],
      }));
    } else {
      setOrderData((prevOrderData) => ({
        ...prevOrderData,
        dishes: [newDish, ...prevOrderData.dishes],
      }));
    }
  };

  const handleDeleteDish = async (reservationId, dishCode) => {
    const dishToDelete = orderData.dishes.find(
      (dish) => dish.code === dishCode
    );
    if (!dishToDelete._id) {
      setOrderData((prevData) => ({
        ...prevData,
        dishes: prevData.dishes.filter((dish) => dish.code !== dishCode),
      }));

      notification.success({
        message: "Thành công",
        description: "Đã xóa món ăn khỏi đơn đặt hàng thành công!",
      });
      return;
    }
    if (selectedTable) {
      try {
        const response = await deleteOrder(reservationId, dishCode);
        if (response.data.success) {
          setOrderData((prevData) => ({
            ...prevData,
            dishes: prevData.dishes.filter((dish) => dish.code !== dishCode),
          }));
          notification.success({
            message: "Thành công",
            description: "Đã xóa món ăn khỏi đơn đặt hàng thành công!",
          });
        }
      } catch (error) {
        console.log(error);
        notification.error({
          message: "Lỗi",
          description: "Có lỗi xảy ra khi xóa món ăn.",
        });
      }
    }
  };

  const handleCreateOrder = async () => {
    try {
      console.log(orderData);
      const newDishes = orderData.dishes.filter((dish) => !dish._id);

      const data = {
        dishes: newDishes.map((dish) => ({
          code: dish.code,
          quantity: dish.quantity,
        })),
      };

      const response = await createOrderFood(selectedTable, data);

      if (response.data.success) {
        toast.success("Đặt món thành công!");
        window.location.reload();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error.message);
    }
  };

  const getOrderById = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDetailOrderFood(selectedTable);
      const orderData = result.data.tableReservation;
      form.setFieldsValue({
        reservationId: orderData.reservationId,
        tableId: orderData.tableId,
        depositAmount: orderData.depositAmount,
        totalAmount: orderData.totalAmount,
        status: orderData.status,
        dishes: orderData.dishes.map((dish) => ({
          code: dish.code,
          quantity: dish.quantity,
        })),
      });
      setOrderData(orderData);
      setDepositAmount(orderData.depositAmount);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [selectedTable, form]);

  useEffect(() => {
    if (selectedTable) getOrderById();
  }, [selectedTable, getOrderById]);

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      render: (text, record, index) => <div>{index + 1}</div>,
    },
    {
      title: "Tên món",
      dataIndex: "dishName",
      key: "dishName",
      align: "center",
      render: (text, record) => (
        <div>
          <div className="font-bold">{record.dishName}</div>
          <div className="font-bold text-gray-500">
            {record.price.toLocaleString()} đ
          </div>
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (text, dish) => (
        <QuantityInput
          value={dish.quantity}
          onChange={(newQuantity) =>
            handleQuantityChange(dish._id, newQuantity)
          }
        />
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "center",
      render: (text, record) => (
        <div>{(record.price * record.quantity).toLocaleString()} đ</div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (record) => {
        return (
          <div className="flex gap-2 justify-center">
            <Popconfirm
              title="Xóa món ăn khỏi đơn đặt hàng"
              description="Bạn có chắc muốn xóa món ăn này không?!!"
              onConfirm={() => handleDeleteDish(selectedTable, record.code)}
              okText="Đồng ý"
              cancelText="Hủy"
              cursor
            >
              <MdDelete className="text-red-500 text-2xl hover:text-red-700 cursor-pointer" />
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  return (
    <div className="flex justify-between h-[39rem]">
      {/* Tìm món */}
      <div className="bg-white p-4 w-[15rem]">
        <AutoComplete
          size="large"
          onSearch={handleSearch}
          placeholder="Tìm kiếm món ăn"
          className="w-[13rem]"
          allowClear
        >
          {options.map((option) => (
            <Option key={option._id} value={option.name}>
              <div
                className="flex items-center"
                onClick={() =>
                  addDishToOrder(
                    option.code,
                    option.name,
                    option.price,
                    option.imageMenu
                  )
                }
              >
                <img
                  src={option.imageMenu}
                  alt={option.name}
                  className="w-12 h-12 mr-2"
                />
                <div>
                  <h1 className="font-bold">{option.name}</h1>
                  <div>{option.price.toLocaleString()} đ</div>
                </div>
              </div>
            </Option>
          ))}
        </AutoComplete>

        <ul className="mt-3">
          <li
            className={`w-[13rem] h-10 text-sm text-left mb-3 px-3 border border-gray-300 rounded-lg inline-block transition duration-300 cursor-pointer flex items-center ${
              activeCategory === null
                ? "border border-gray-900"
                : "hover:bg-gray-200"
            }`}
            onClick={() => handleCategoryClick(null)}
          >
            Tất cả món ăn
          </li>
          {categories.map((category) => (
            <li
              key={category}
              className={`w-[13rem] h-10 text-sm text-left mb-3 px-3 border border-gray-300 rounded-lg inline-block transition duration-300 cursor-pointer flex items-center ${
                activeCategory === category
                  ? "border border-gray-900"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>
      {/* Chọn món */}
      <div className="w-[35rem] bg-white p-4">
        <div className="flex flex-wrap gap-[1rem] justify-start ">
          {loading ? (
            <Spin
              size="large"
              className="w-full h-[32rem] flex items-center justify-center"
            />
          ) : menus.length > 0 ? (
            menus.map((menu) => (
              <Card
                key={menu._id}
                hoverable
                style={{
                  width: 165,
                }}
                bodyStyle={{ padding: 7 }}
                cover={
                  <img
                    className="h-[10rem]"
                    src={menu.imageMenu}
                    alt="menu_image"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                }
                onClick={() =>
                  addDishToOrder(
                    menu.code,
                    menu.name,
                    menu.price,
                    menu.imageMenu
                  )
                }
              >
                <h1 className="my-2 font-bold text-base text-center">
                  {truncatedName(menu.name, 15)}
                </h1>
                <p className="my-2 text-base text-center">
                  {menu.price.toLocaleString()} đ
                </p>
              </Card>
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-[33rem] bg-gray-200">
              <Empty description="Không có dữ liệu" />
            </div>
          )}
        </div>

        <Pagination
          className="w-full flex justify-end mt-5"
          defaultCurrent={1}
          current={pageIndex}
          total={totalDoc}
          totalPages={totalPages}
          pageSize={pageSize}
          showSizeChanger
          onChange={handlePaginationChange}
        />
      </div>
      {/* Đặt món */}
      <div className="w-[37rem] h-[39rem] bg-white p-4">
        <div className="flex mb-2 justify-between w-full">
          <Alert
            message={
              <span>
                Bạn đã chọn bàn có mã là{" "}
                <span className="text-red-500 font-bold">
                  {orderData?.tableId || "___"}
                </span>
              </span>
            }
          />

          <Button
            className="h-9 text-lg flex items-center"
            icon={<TbBrandAirtable />}
            onClick={() => {
              setModalGetReservation(true);
              setSelectedTable(null);
            }}
          >
            Chọn bàn
          </Button>

          <ModalGetReservation
            title="Chọn bàn đã được đặt trước"
            isModalOpen={modalGetReservation}
            handleCancel={handleCloseModal}
            handleSelectTable={handleSelectTable}
            selectedTable={selectedTable}
          />
        </div>
        {/* Đặt món */}
        <div className="h-[34rem] flex flex-col justify-between">
          <div className="h-[200rem] overflow-y-auto mt-2 mb-0">
            {orderData.dishes.length > 0 ? (
              <Table
                columns={columns}
                dataSource={orderData.dishes}
                pagination={false}
                className="min-w-full"
                rowKey={(record) => record.key}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-[22rem] bg-gray-100">
                <Empty
                  description={
                    <span className="font-bold text-gray-400">
                      Chưa có món ăn nào được thêm!
                    </span>
                  }
                />
              </div>
            )}
          </div>
          <div className="h-[10rem] mb-3">
            <div className="flex justify-between mt-4">
              <h1>Tạm tính ({totalQuantity} món)</h1>
              <p className="font-bold">
                {orderData.dishes
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString()}{" "}
                đ
              </p>
            </div>

            <div className="flex justify-between mt-3">
              <h1>Đã đặt cọc</h1>
              <p className="font-bold">
                {orderData.depositAmount.toLocaleString() || "0"} đ
              </p>
            </div>
          </div>

          <hr />

          <div className="h-[16rem] flex items-center justify-between mb-1">
            <div className="flex justify-between">
              <Button
                loading={loading}
                className="flex flex-col items-center text-base p-3 h-[4rem] w-[6rem]"
                type="text"
                icon={<MdLocalPrintshop className="text-xl" />}
                onClick={handleCreateOrder}
              >
                In tạm tính
              </Button>
            </div>
            <div className="flex flex-col items-end justify-end text-right">
              <h1 className="font-bold">Thành Tiền</h1>
              <p className="text-green-600 font-bold mt-1">
                {(
                  orderData.dishes.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  ) - depositAmount
                ).toLocaleString()}{" "}
                đ
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full items-center h-12 mt-auto">
            <Button
              loading={loading}
              type="primary"
              className="text-lg h-[3rem] w-full"
              onClick={handleCheckout}
            >
              Thanh Toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDish;
