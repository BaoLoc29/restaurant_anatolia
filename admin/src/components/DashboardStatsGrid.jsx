import React, { useEffect, useCallback, useState } from "react";
import { IoBagHandle, IoPeople, IoCart } from "react-icons/io5";
import { RiAdminFill } from "react-icons/ri";
import { getPagingUser } from "../services/user.js";
function DashboardStatsGrid() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPagingUser();
      if (result.error) throw new Error(result.error);
      else setUsers(result.data.users.count);
      console.log(result.data.user.count);
    } catch (err) {
      console.log("Error: ", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Đếm số lượng người dùng theo vai trò
  const userCount = users
    ? users.filter((user) => user.role === "Nhân viên").length
    : 0;

  return (
    <div className="flex gap-4 w-full">
      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-sky-500">
          <IoBagHandle className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-500 font-light">
            Total Product
          </span>
          <div className="flex items-center">
            <strong className="text-xl text-gray-700 font-semibold">30</strong>
            <span className="text-sm text-green-500 pl-2">+30</span>
          </div>
        </div>
      </BoxWrapper>
      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-orange-600">
          <RiAdminFill className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-500 font-light">
            Tất cả nhân viên
          </span>
          <div className="flex items-center">
            <strong className="text-xl text-gray-700 font-semibold">
              {userCount}
            </strong>
            <span className="text-sm text-green-500 pl-2">+{userCount}</span>
          </div>
        </div>
      </BoxWrapper>
      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-yellow-400">
          <IoPeople className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-500 font-light">
            Total Customer
          </span>
          <div className="flex items-center">
            <strong className="text-xl text-gray-700 font-semibold">42</strong>
            <span className="text-sm text-green-500 pl-2">+42</span>
          </div>
        </div>
      </BoxWrapper>
      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-green-600">
          <IoCart className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-500 font-light">Total Orders</span>
          <div className="flex items-center">
            <strong className="text-xl text-gray-700 font-semibold">655</strong>
            <span className="text-sm text-green-500 pl-2">+43</span>
          </div>
        </div>
      </BoxWrapper>
    </div>
  );
}

export default DashboardStatsGrid;

function BoxWrapper({ children }) {
  return (
    <div className="bg-white rounded-sm p-4 flex-1 border border-gray-200 flex items-center">
      {children}
    </div>
  );
}
