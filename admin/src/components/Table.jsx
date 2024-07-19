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
} from "antd";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import { toast } from "react-hot-toast";
import ModalCreateTable from "./ModalCreateTable/index.jsx";
import {
  createTable,
  editTable,
  deleteTable,
  getPagingTable,
  searchTable,
} from "../services/table.js";
import { PlusOutlined } from "@ant-design/icons";

const TableComponent = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoc, setTotalDoc] = useState(0);
  const [modalCreateTable, setModalCreateTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState("id_table");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotalDoc, setSearchTotalDoc] = useState(0);
  const [searchPageIndex, setSearchPageIndex] = useState(1);

  const handleOpenEditModal = (tableId) => {
    setModalCreateTable(true);
    setSelectedTable(tableId);
  };

  const handelCloseModal = () => {
    form.resetFields();
    setModalCreateTable(false);
    setSelectedTable(null);
  };

  const options = [
    { value: "id_table", label: "Mã bàn" },
    { value: "location", label: "Vị trí bàn" },
  ];

  const columns = [
    {
      title: "Mã bàn",
      dataIndex: "id_table",
      key: "id_table",
      align: "center",
      sorter: (a, b) => {
        if (typeof a.id_table === "number" && typeof b.id_table === "number") {
          return a.id_table - b.id_table;
        }
        return a.id_table.localeCompare(b.id_table);
      },
    },
    {
      title: "Sức chứa",
      dataIndex: "capacity",
      key: "capacity",
      align: "center",
      sorter: (a, b) => a.capacity - b.capacity,
    },
    {
      title: "Vị trí bàn",
      dataIndex: "location",
      key: "location",
      align: "center",
      filters: [
        {
          text: "Trung tâm",
          value: "Trung tâm",
        },
        {
          text: "Cạnh cửa sổ",
          value: "Cạnh cửa sổ",
        },
        {
          text: "Ngoài trời",
          value: "Ngoài trời",
        },
      ],
      onFilter: (value, record) => record.location.indexOf(value) === 0,
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
          "Còn trống": "green",
          "Đang sử dụng": "blue",
          "Đã đặt cọc": "",
          "Chưa đặt cọc": "red",
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
              title="Xóa bàn không dùng đến"
              description="Bạn có chắc muốn xóa bàn này không ?!!"
              onConfirm={() => handleDeleteTable(row._id)}
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

  const getTables = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPagingTable({ pageSize, pageIndex });
      setTables(result.data.tables);
      setTotalPages(result.data.totalPages);
      setTotalDoc(result.data.count);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageIndex]);

  useEffect(() => {
    getTables();
  }, [getTables]);

  const handleCreateTable = async (value) => {
    try {
      setLoading(true);
      const { confirm, ...dataToSend } = value;
      if (!selectedTable) {
        const result = await createTable(dataToSend);
        setTables([result.data.result, ...tables]);
        toast.success("Thêm bàn mới thành công!");
      } else {
        const result = await editTable(selectedTable, value);
        setTables(
          tables.map((table) => {
            if (table._id === selectedTable) {
              return result.data.table;
            }
            return table;
          })
        );
        toast.success("Cập nhật bàn thành công!");
        setSelectedTable(null);
      }
      setModalCreateTable(false);
      handleClearSearch();
      form.resetFields();
    } catch (error) {
      console.log(error);
      toast.error(
        selectedTable ? "Cập nhật bàn thất bại!" : "Thêm bàn mới thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    try {
      setLoading(true);
      await deleteTable(tableId);
      setTables(tables.filter((table) => table._id !== tableId));
      toast.success("Xóa bàn thành công!");
      handleClearSearch();
    } catch (error) {
      console.log(error);
      toast.error("Xóa bàn thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() !== "") {
        const response = await searchTable(
          searchQuery,
          selectedOption,
          searchPageIndex,
          pageSize
        );
        const searchResults = response.data.tables;
        setSearchResults(searchResults);
        setSearchTotalDoc(response.data.count);
        setSearchPageIndex(1);
      }
    } catch (error) {
      toast.error("Không tìm thấy bàn cần tìm!");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    getTables();
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
        <h1 className="text-gray-500 text-xl">Danh sách bàn</h1>
        <Space.Compact className="w-[32rem] relative">
          <Select
            size="large"
            defaultValue="id_table"
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
          onClick={() => setModalCreateTable(true)}
        >
          Thêm bàn mới
        </Button>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={searchResults.length > 0 ? searchResults : tables}
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
      <ModalCreateTable
        form={form}
        loading={loading}
        title={selectedTable ? "Cập nhật bàn" : "Thêm loại bàn mới"}
        isModalOpen={modalCreateTable}
        handleCancel={handelCloseModal}
        handleOk={handleCreateTable}
        selectedTable={selectedTable}
      />
    </div>
  );
};

export default TableComponent;
