import React, { useEffect, useCallback, useState } from "react";
import { RiAdminFill } from "react-icons/ri";
import { IoFastFoodSharp } from "react-icons/io5";
import { TbBrandAirtable } from "react-icons/tb";
import { HiMiniDocumentChartBar } from "react-icons/hi2";

import { getTotalUser } from "../services/user.js";
import { getReservation } from "../services/reservation.js";
import { getTotalTable } from "../services/table.js";
import { getAllMenu } from "../services/menu.js";

function DashboardStatsGrid() {
  const [users, setUsers] = useState({ total: 0, recent: 0 });
  const [reservations, setReservations] = useState({ total: 0, recent: 0 });
  const [tables, setTables] = useState({ total: 0, recent: 0 });
  const [menus, setMenus] = useState({ total: 0, recent: 0 });
  const [loading, setLoading] = useState(false);

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getTotalUser();
      const { totalUser, recentUsers } = result.data;
      setUsers({ total: totalUser, recent: recentUsers });
    } catch (error) {
      console.log("Error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getReservations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getReservation();
      const { totalReservation, recentReservation } = result.data;
      setReservations({ total: totalReservation, recent: recentReservation });
    } catch (error) {
      console.log("Error fetching reservations: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTables = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getTotalTable();
      const { totalTable, recentTable } = result.data;
      setTables({ total: totalTable, recent: recentTable });
    } catch (error) {
      console.log("Error fetching reservations: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMenus = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllMenu();
      const { totalMenu, recentMenu } = result.data;
      setMenus({ total: totalMenu, recent: recentMenu });
    } catch (error) {
      console.log("Error fetching reservations: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUsers();
    getReservations();
    getTables();
    getMenus();
  }, [getUsers, getReservations, getTables, getMenus]);

  return (
    <div className="flex gap-4 w-full">
      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-sky-500">
          <TbBrandAirtable className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-500 font-bold">Tất cả bàn</span>
          <div className="flex items-center">
            <strong className="text-xl text-gray-700 font-semibold">
              {loading ? 0 : tables.total}
            </strong>
            <span className="text-sm text-green-500 pl-2">
              ({loading ? 0 : tables.recent} bàn mới)
            </span>
          </div>
        </div>
      </BoxWrapper>
      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-orange-600">
          <RiAdminFill className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-500 font-bold">
            Tất cả nhân viên
          </span>
          <div className="flex items-center">
            <strong className="text-xl text-gray-700 font-semibold">
              {loading ? 0 : users.total}
            </strong>
            <span className="text-sm text-green-500 pl-2">
              ({loading ? 0 : users.recent} nhân viên mới)
            </span>
          </div>
        </div>
      </BoxWrapper>
      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-yellow-400">
          <IoFastFoodSharp className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-500 font-bold">Tất cả món ăn</span>
          <div className="flex items-center">
            <strong className="text-xl text-gray-700 font-semibold">
              {loading ? 0 : menus.total}
            </strong>
            <span className="text-sm text-green-500 pl-2">
              ({loading ? 0 : menus.recent} món mới)
            </span>
          </div>
        </div>
      </BoxWrapper>

      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-green-500">
          <HiMiniDocumentChartBar className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-500 font-bold">
            Tất cả đơn đặt bàn
          </span>
          <div className="flex items-center">
            <strong className="text-xl text-gray-700 font-semibold">
              {loading ? 0 : reservations.total}
            </strong>
            <span className="text-sm text-green-500 pl-2">
              ({loading ? 0 : reservations.recent} đơn mới)
            </span>
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
