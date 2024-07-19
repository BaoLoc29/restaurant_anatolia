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
} from "antd";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import ModalCreatUser from "./ModalCreateUser/index.jsx";
import {
  getPagingUser,
  createUser,
  deleteUser,
  editUser,
  searchUser,
} from "../services/user.js";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-hot-toast";

const Employee = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoc, setTotalDoc] = useState(0);
  const [modalCreateUser, setModalCreateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState("e_code");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotalDoc, setSearchTotalDoc] = useState(0);
  const [searchPageIndex, setSearchPageIndex] = useState(1);

  const handleOpenEditModal = (userId) => {
    setModalCreateUser(true);
    setSelectedUser(userId);
  };

  const handelCloseModal = () => {
    form.resetFields();
    setModalCreateUser(false);
    setSelectedUser(null);
  };

  const options = [
    { value: "e_code", label: "Mã nhân viên" },
    { value: "name", label: "Tên nhân viên" },
    { value: "email", label: "E-mail" },
  ];

  const columns = [
    {
      title: "Mã nhân viên",
      dataIndex: "e_code",
      key: "e_code",
      align: "center",
      sorter: (a, b) => {
        if (typeof a.e_code === "number" && typeof b.e_code === "number") {
          return a.e_code - b.e_code;
        }
        return a.e_code.localeCompare(b.e_code);
      },
    },
    {
      title: "Tên nhân viên",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "E-mail",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      render: (gender) => {
        return gender ? "Nam" : "Nữ";
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
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
              title="Xóa tài khoản nhân viên"
              description="Bạn có chắc muốn xóa tài khoản này không ?!!"
              onConfirm={() => handleDeleteUser(row._id)}
              okText="Đồng ý"
              cancelText="Hủy bỏ"
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

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPagingUser({ pageSize, pageIndex });
      setUsers(result.data.users);
      setTotalPages(result.data.totalPages);
      setTotalDoc(result.data.count);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageIndex]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleCreateUser = async (value) => {
    try {
      setLoading(true);
      const { confirm, ...dataToSend } = value;
      if (!selectedUser) {
        const result = await createUser(dataToSend);
        setUsers([result.data.result, ...users]);
        toast.success("Tạo tài khoản thành công!");
      } else {
        const result = await editUser(selectedUser, value);
        setUsers(
          users.map((user) => {
            if (user._id === selectedUser) {
              return result.data.user;
            }
            return user;
          })
        );
        toast.success("Cập nhật tài khoản thành công!");
        setSelectedUser(null);
      }
      setModalCreateUser(false);
      handleClearSearch();
      form.resetFields();
    } catch (error) {
      console.log(error);
      toast.error(
        selectedUser
          ? "Cập nhật tài khoản thất bại!"
          : "Tạo tài khoản thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await deleteUser(userId);
      setUsers(users.filter((user) => user._id !== userId));
      toast.success("Xóa tài khoản thành công!");
      handleClearSearch();
    } catch (error) {
      console.log(error);
      toast.error("Xóa tài khoản thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() !== "") {
        const response = await searchUser(
          searchQuery,
          selectedOption,
          searchPageIndex,
          pageSize
        );
        const searchResults = response.data.users;
        setSearchResults(searchResults);
        setSearchTotalDoc(response.data.count);
        setSearchPageIndex(1);
      }
    } catch (error) {
      toast.error("Không tìm thấy người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    getUsers();
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
        <h1 className="text-gray-500 text-xl">Danh sách nhân viên</h1>
        <Space.Compact className="w-[32rem] relative">
          <Select
            size="large"
            defaultValue="e_code"
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
          onClick={() => setModalCreateUser(true)}
        >
          Thêm nhân viên
        </Button>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={searchResults.length > 0 ? searchResults : users}
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
      <ModalCreatUser
        form={form}
        loading={loading}
        title={selectedUser ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
        isModalOpen={modalCreateUser}
        handleCancel={handelCloseModal}
        handleOk={handleCreateUser}
        selectedUser={selectedUser}
      />
    </div>
  );
};

export default Employee;
