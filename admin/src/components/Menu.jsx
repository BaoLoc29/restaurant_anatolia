import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  Pagination,
  Form,
  Button,
  Popconfirm,
  Space,
  Select,
  Input,
  Tag,
  Image,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import { toast } from "react-hot-toast";
import ModalCreateMenu from "./ModalCreateMenu/index.jsx";
import {
  createMenu,
  editMenu,
  deleteMenu,
  getPagingMenu,
  searchMenu,
} from "../services/menu.js";

const MenuComponent = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoc, setTotalDoc] = useState(0);
  const [modalCreateMenu, setModalCreateMenu] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState("code");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotalDoc, setSearchTotalDoc] = useState(0);
  const [searchPageIndex, setSearchPageIndex] = useState(1);

  const handleOpenEditModal = (menuId) => {
    setModalCreateMenu(true);
    setSelectedMenu(menuId);
  };

  const handelCloseModal = () => {
    form.resetFields();
    setModalCreateMenu(false);
    setSelectedMenu(null);
  };

  const options = [
    { value: "code", label: "Mã món ăn" },
    { value: "name", label: "Tên món ăn" },
  ];

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "imageMenu",
      key: "imageMenu",
      align: "center",
      render: (row) => <Image width={120} src={row} />,
    },
    {
      title: "Mã món ăn",
      dataIndex: "code",
      key: "code",
      align: "center",
      sorter: (a, b) => {
        if (typeof a.code === "number" && typeof b.code === "number") {
          return a.code - b.code;
        }
        return a.code.localeCompare(b.code);
      },
    },
    {
      title: "Tên món ăn",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Phân loại",
      dataIndex: "category",
      key: "category",
      align: "center",
      filters: [
        {
          text: "Bữa sáng",
          value: "Bữa sáng",
        },
        {
          text: "Bữa trưa",
          value: "Bữa trưa",
        },
        {
          text: "Bữa tối",
          value: "Bữa tối",
        },
        {
          text: "Ngày tết",
          value: "Ngày tết",
        },
        {
          text: "Noel",
          value: "Noel",
        },
        {
          text: "Tình nhân",
          value: "Tình nhân",
        },
        {
          text: "Gia đình",
          value: "Gia đình",
        },
        {
          text: "Lương về",
          value: "Lương về",
        },
      ],
      onFilter: (value, record) => record.category.indexOf(value) === 0,
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (price) => {
        if (typeof price === "number") {
          return price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          });
        } else {
          return "Invalid Price";
        }
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const colorMap = {
          "Còn món": "green",
          "Hết món": "red",
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
              onClick={() => handleOpenEditModal(row._id)}
            />
            <Popconfirm
              title="Xóa món ăn ra khỏi menu"
              description="Bạn có chắc muốn xóa món ăn này không?!!"
              onConfirm={() => handleDeleteMenu(row._id)}
              okText="Đồng ý"
              cancelText="Hủy"
              style={{ cursor: "pointer" }}
            >
              <MdDelete className="text-red-500 text-2xl hover:text-red-700 cursor-pointer" />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const [form] = Form.useForm();

  const getMenus = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPagingMenu({ pageSize, pageIndex });
      setMenus(result.data.menus);
      setTotalPages(result.data.totalPages);
      setTotalDoc(result.data.count);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageIndex]);

  useEffect(() => {
    getMenus();
  }, [getMenus]);

  const handleCreateMenu = async (values, file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("code", values.code);
      formData.append("name", values.name);
      formData.append("price", values.price);
      formData.append("classify", values.classify);
      formData.append("category", values.category);
      formData.append("description", values.description);
      formData.append("status", values.status);
      formData.append("image", file);

      if (!selectedMenu) {
        const result = await createMenu(formData);
        setMenus([result.data.result, ...menus]);
        toast.success("Thêm món mới vào menu thành công!");
      } else {
        const result = await editMenu(selectedMenu, formData);
        setMenus(
          menus.map((menu) => {
            if (menu._id === selectedMenu) {
              return result.data.menu;
            }
            return menu;
          })
        );
        toast.success("Cập nhật thực đơn thành công!");
        setSelectedMenu(null);
      }
      handleClearSearch();
      setModalCreateMenu(false);
      form.resetFields();
    } catch (error) {
      console.log(error);
      toast.error(
        selectedMenu ? "Cập nhật thực đơn thất bại!" : "Thêm thực đơn thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenu = async (menuId) => {
    try {
      setLoading(true);
      await deleteMenu(menuId);
      setMenus(menus.filter((menu) => menu._id !== menuId));
      toast.success("Xóa món ăn thành công!");
      handleClearSearch();
    } catch (error) {
      console.log(error);
      toast.error("Xóa món ăn thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() !== "") {
        const response = await searchMenu(
          searchQuery,
          selectedOption,
          searchPageIndex,
          pageSize
        );
        const searchResults = response.data.menus;
        setSearchResults(searchResults);
        setSearchTotalDoc(response.data.count);
        setSearchPageIndex(1);
      }
    } catch (error) {
      toast.error("Không tìm thấy món ăn này!");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    getMenus();
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
    <div className="h-screen">
      <div className="flex justify-between items-center px-2 pb-4 pr-4 pl-4 pt-0">
        <h1 className="text-gray-500 text-xl">Danh sách món ăn</h1>
        <Space.Compact className="w-[32rem] relative">
          <Select
            size="large"
            defaultValue="code"
            options={options}
            className="w-[10rem]"
            onChange={(value) => setSelectedOption(value)}
          />
          <Input
            size="large"
            placeholder="Nhập từ khóa tìm kiếm ...."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
          />
          {searchQuery && (
            <TiDelete
              className="text-gray-400 text-xl absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer z-10"
              onClick={handleClearSearch}
            />
          )}
        </Space.Compact>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setModalCreateMenu(true)}
        >
          Thêm món mới
        </Button>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={searchResults.length > 0 ? searchResults : menus}
        pagination={false}
      />
      <Pagination
        className="mt-5 pb-5 float-right"
        defaultCurrent={1}
        current={searchQuery.trim() === "" ? pageIndex : searchPageIndex}
        total={searchQuery.trim() === "" ? totalDoc : searchTotalDoc}
        pageSize={pageSize}
        showSizeChanger
        onChange={handlePaginationChange}
      />
      <ModalCreateMenu
        form={form}
        loading={loading}
        title={
          selectedMenu
            ? "Cập nhật món ăn trong thực đơn"
            : "Thêm món mới vào thực đơn"
        }
        isModalOpen={modalCreateMenu}
        handleCancel={handelCloseModal}
        handleOk={handleCreateMenu}
        selectedMenu={selectedMenu}
      />
    </div>
  );
};

export default MenuComponent;
