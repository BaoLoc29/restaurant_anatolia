import {
  Pagination,
  Card,
  Spin,
  Button,
  Tooltip,
  AutoComplete,
  Form,
  Table,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { getPagingMenu, getAllMenu } from "../services/menu.js";
import { IoIosPrint } from "react-icons/io";
import { MdDelete, MdLocalPrintshop } from "react-icons/md";
import { TbBrandAirtable } from "react-icons/tb";
import { UserAddOutlined } from "@ant-design/icons";
import ModalGetReservation from "../components/ModalGetReservation/index.jsx";
import QuantityInput from "./QuantityInput/index.jsx";

const { Option } = AutoComplete;
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
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      dishName: "Món 1",
      price: 100000,
      quantity: 1,
    },
    {
      key: "2",
      dishName: "Món 2",
      price: 200000,
      quantity: 1,
    },
    {
      key: "3",
      dishName: "Món 3",
      price: 200000,
      quantity: 1,
    },
    {
      key: "4",
      dishName: "Món 4",
      price: 200000,
      quantity: 1,
    },
    {
      key: "5",
      dishName: "Món 5",
      price: 200000,
      quantity: 1,
    },
  ]);

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
    const total = dataSource.reduce((sum, item) => sum + item.quantity, 0);
    setTotalQuantity(total);
  }, [dataSource]);

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

  const handleSearch = (value) => {
    // Fetch data from API or any data source
    // This is a mock example with static data
    const data = [
      { value: "Option 1" },
      { value: "Option 2" },
      { value: "Option 3" },
    ];

    const filteredData = data.filter((item) =>
      item.value.toLowerCase().includes(value.toLowerCase())
    );

    setOptions(filteredData);
  };

  const handleCloseModal = () => {
    form.resetFields();
    setModalGetReservation(false);
    setSelectedTable(null);
  };

  const handleSelectTable = (tableId) => {
    setSelectedTable(tableId);
    setModalGetReservation(false);
  };

  const handleQuantityChange = (key, newQuantity) => {
    const newData = dataSource.map((item) => {
      if (item.key === key) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.price * newQuantity,
        };
      }
      return item;
    });
    setDataSource(newData);
  };

  const columns = [
    {
      title: "Số",
      key: "index",
      align: "center",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Món",
      dataIndex: "dishName",
      key: "dishName",
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
      render: (text, record) => (
        <QuantityInput
          value={record.quantity}
          onChange={(newQuantity) =>
            handleQuantityChange(record.key, newQuantity)
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
      render: (row) => {
        return (
          <div className="flex gap-2 justify-center">
            <MdDelete className="text-red-500 text-2xl hover:text-red-700 cursor-pointer" />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex justify-between h-[37rem]">
      {/* Tìm món */}
      <div className="bg-white p-4 w-[15rem]">
        <div className="relative">
          <HiOutlineSearch
            fontSize={20}
            className="text-gray-400 absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            type="text"
            placeholder="Tìm món ..."
            className="text-sm focus:outline-none active:outline-none border border-gray-300 w-[13rem] h-10 pl-10 pr-4 rounded-sm"
          />
        </div>
        <ul className="mt-3">
          <li
            className={`w-[13rem] h-10 text-sm text-left mb-3 px-3 border border-gray-300 rounded inline-block transition duration-300 cursor-pointer flex items-center ${
              activeCategory === null
                ? "bg-gray-300 border-gray-700"
                : "hover:bg-gray-300 hover:border-gray-700"
            }`}
            onClick={() => handleCategoryClick(null)}
          >
            Tất cả món ăn
          </li>
          {categories.map((category) => (
            <li
              key={category}
              className={`w-[13rem] h-10 text-sm text-left mb-3 px-3 border border-gray-300 rounded hover:border-gray-700 inline-block transition duration-300 cursor-pointer flex items-center ${
                activeCategory === category
                  ? "bg-gray-300 hover:bg-gray-400"
                  : "hover:bg-gray-300"
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>
      {/* Chọn món */}
      <div className="w-[40rem] bg-white p-4 ">
        <div className="flex flex-wrap gap-[1rem] justify-start">
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
                  width: 192,
                }}
                bodyStyle={{ padding: 7 }}
                cover={
                  <img
                    alt="example"
                    src="https://transcode-v2.app.engoo.com/image/fetch/f_auto,c_lfill,w_300,dpr_3/https://assets.app.engoo.com/images/x7jPxj9YtJfv97hnC3mMmQog5VwuYojZ7tlrhczGXIV.jpeg"
                    className="h-[10rem] "
                  />
                }
              >
                <h1 className="m-2 font-bold text-base text-center">
                  {truncatedName(menu.name, 20)}
                </h1>
                <p className="m-2 text-base text-center">
                  {menu.price
                    ? menu.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })
                    : "N/A"}
                </p>
              </Card>
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-[33rem] bg-gray-200">
              <img src="/notFound.svg" alt="No menu available" />
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
      <div className="w-[32rem] h-[37rem] bg-white p-4">
        {/* Tìm đơn đặt bàn */}
        <div className="flex gap-2 mb-2 justify-between w-full">
          <Tooltip placement="top" title="Chọn bàn">
            <Button
              className="h-9 text-lg flex items-center"
              icon={<TbBrandAirtable />}
              onClick={() => {
                setModalGetReservation(true);
                setSelectedTable(null);
              }}
            >
              {selectedTable ? `Bàn ${selectedTable}` : "Tại bàn ..."}
            </Button>
          </Tooltip>

          <AutoComplete
            style={{ width: 290 }}
            onSearch={handleSearch}
            placeholder="Tìm kiếm"
            className="h-9 w-full"
          >
            {options.map((option) => (
              <Option
                className="text-lg"
                key={option.value}
                value={option.value}
              >
                {option.value}
              </Option>
            ))}
          </AutoComplete>

          <Button
            className="h-9"
            style={{ width: 40 }}
            icon={<UserAddOutlined />}
          />

          <ModalGetReservation
            title="Chọn bàn đã được đặt trước"
            isModalOpen={modalGetReservation}
            handleCancel={handleCloseModal}
            handleSelectTable={handleSelectTable}
            selectedTable={selectedTable}
          />
        </div>
        {/* Đặt món */}
        <div className="h-[32rem] flex flex-col justify-between">
          <div className="h-[200rem] overflow-y-auto mt-2 mb-0">
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              className="min-w-full"
            />
          </div>

          <div className="h-[10rem] mb-3">
            <div className="flex justify-between mt-4">
              <h1>Tạm tính ({totalQuantity} món)</h1>
              <p className="font-bold">
                {dataSource
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString()}{" "}
                đ
              </p>
            </div>

            <div className="flex justify-between mt-3">
              <h1>Thuế hóa đơn</h1>
              <p className="font-bold">0</p>
            </div>
          </div>

          <hr />

          <div className="h-[16rem] flex items-center justify-between mb-1">
            <div className="flex justify-between">
              <Button
                className="flex flex-col items-center text-base p-3 h-[4rem] w-[6rem]"
                type="text"
                icon={<MdLocalPrintshop className="text-xl" />}
              >
                In tạm tính
              </Button>
              <Button
                className="flex flex-col items-center text-base p-3 h-[4rem] w-[6rem]"
                type="text"
                icon={<IoIosPrint className="text-xl" />}
              >
                In Bếp
              </Button>
            </div>
            <div className="flex flex-col items-end justify-end text-right">
              <h1 className="font-bold">Thành Tiền</h1>
              <p className="text-green-600 font-bold mt-1">
                {dataSource
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString()}{" "}
                đ
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full items-center h-12 mt-auto">
            <Button type="primary" className="text-lg h-[3rem] w-full">
              Thanh Toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDish;
