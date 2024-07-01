import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { getAllMenu } from "../services/menu.js";

// const popularProducts = [
//   {
//     id: "3432",
//     product_name: 'Macbook M1 Pro 14"',
//     product_thumbnail: "https://source.unsplash.com/100x100?macbook",
//     product_price: "$1499.00",
//     product_stock: 341,
//   },
//   {
//     id: "7633",
//     product_name: "Samsung Galaxy Buds 2",
//     product_thumbnail: "https://source.unsplash.com/100x100?earbuds",
//     product_price: "$399.00",
//     product_stock: 24,
//   },
//   {
//     id: "6534",
//     product_name: "Asus Zenbook Pro",
//     product_thumbnail: "https://source.unsplash.com/100x100?laptop",
//     product_price: "$899.00",
//     product_stock: 56,
//   },
//   {
//     id: "9234",
//     product_name: "LG Flex Canvas",
//     product_thumbnail: "https://source.unsplash.com/100x100?smartphone",
//     product_price: "$499.00",
//     product_stock: 98,
//   },
//   {
//     id: "4314",
//     product_name: "Apple Magic Touchpad",
//     product_thumbnail: "https://source.unsplash.com/100x100?touchpad",
//     product_price: "$699.00",
//     product_stock: 0,
//   },
//   {
//     id: "4342",
//     product_name: "Nothing Earbuds One",
//     product_thumbnail: "https://source.unsplash.com/100x100?earphone",
//     product_price: "$399.00",
//     product_stock: 453,
//   },
// ];

function PopularProducts() {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState([]);

  const handleGetAllMenu = useCallback(async () => {
    try {
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
    <div className="bg-white p-4 rounded-sm border border-gray-200 w-[20rem]">
      <strong className="text-gray-700 font-medium">Danh sách món mới</strong>
      <div className="mt-4 flex flex-col gap-3">
        {menus.map((menu) => (
          <ul
            key={menu._id}
            className="flex items-start hover:no-underline"
            loading={loading}
          >
            <li className="w-11 h-11 min-w-[2.5rem] bg-gray-200 rounded-sm">
              <img
                className="w-full h-full object-cover rounded-sm"
                src="https://www.foodiesfeed.com/wp-content/uploads/2023/06/burger-with-melted-cheese.jpg"
                alt="Món ăn ngon"
              />
            </li>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-800 font-bold">{menu.name}</p>
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
    </div>
  );
}

export default PopularProducts;
