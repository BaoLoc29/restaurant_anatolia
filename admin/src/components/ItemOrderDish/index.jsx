import { Pagination, Card } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { getPagingMenu, getAllMenu } from "../../services/menu.js";

const ItemOrderDish = () => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(6);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoc, setTotalDoc] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);

  const getMenus = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPagingMenu({
        pageSize,
        pageIndex,
        category: activeCategory, // Pass activeCategory directly
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
        setCategories(result.data?.categories);
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

  return (
    <div className="flex justify-between h-[38rem]">
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
            className={`w-[13rem] h-[3rem] text-lg text-left mb-3 px-3 border rounded inline-block transition duration-300 cursor-pointer flex items-center ${
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
              className={`w-[13rem] h-[3rem] text-lg text-left mb-3 px-3 border border-gray-300 rounded hover:border-gray-700 inline-block transition duration-300 cursor-pointer flex items-center ${
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
      <div className="w-[40rem] bg-white p-4 ">
        <div className="flex flex-wrap gap-[1rem] justify-start">
          {menus.length > 0 ? (
            menus.map((menu) => (
              <Card
                loading={loading}
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
      <div className="w-[32rem] bg-white p-4">Sidebar content</div>
    </div>
  );
};

export default ItemOrderDish;
