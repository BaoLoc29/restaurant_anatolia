import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { getAllMenu } from "../services/menu.js";
import { Empty } from "antd";

function PopularProducts() {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState([]);

  const handleGetAllMenu = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllMenu();
      setMenus(result.data.menus.slice(0, 6));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetAllMenu();
  }, [handleGetAllMenu]);

  return (
    <div
      loading={loading}
      className="bg-white p-4 rounded-sm border border-gray-200 w-[20rem]"
    >
      <strong className="text-gray-700 font-medium">Danh sách món mới</strong>
      {menus.length === 0 ? (
        <Empty className="mt-[3rem]" description="Không có món nào" />
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {menus.map((menu) => (
            <ul key={menu._id} className="flex items-start hover:no-underline">
              <li className="w-11 h-11 min-w-[2.5rem] bg-gray-200 rounded-sm">
                <img
                  className="w-full h-full object-cover rounded-sm"
                  src={menu.imageMenu}
                  alt={menu.name}
                />
              </li>
              <div className="ml-4 flex-1">
                <p className="text-sm text-gray-800 font-bold">
                  {menu.name.length > 19
                    ? `${menu.name.substring(0, 19)}...`
                    : menu.name}
                </p>
                <span
                  className={classNames(
                    {
                      "text-red-500": menu.status === "Hết món",
                      "text-green-500": menu.status === "Còn món",
                    },
                    "text-xs font-medium"
                  )}
                >
                  {menu.status}
                </span>
              </div>
              <div className="text-xs font-medium text-gray-400 pl-1.5">
                {menu.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </div>
            </ul>
          ))}
        </div>
      )}
    </div>
  );
}

export default PopularProducts;
