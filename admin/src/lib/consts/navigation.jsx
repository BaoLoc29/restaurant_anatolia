import { HiOutlineViewGrid } from "react-icons/hi";
import { HiDocumentChartBar } from "react-icons/hi2";
import { TbBrandAirtable } from "react-icons/tb";
import { FaUserTie } from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import { IoFastFood } from "react-icons/io5";

export const DASHBOARD_SIDEBAR_LINKS = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: <HiOutlineViewGrid />,
  },
  {
    key: "employees",
    label: "Quản lý nhân viên",
    path: "/employees",
    icon: <FaUserTie />,
  },
  {
    key: "tables",
    label: "Quản lý bàn",
    path: "/tables",
    icon: <TbBrandAirtable />,
  },
  {
    key: "employees",
    label: "Quản lý thực đơn",
    path: "/menus",
    icon: <MdMenuBook />,
  },
  {
    key: "orders",
    label: "Quản lý đặt bàn",
    path: "/orders",
    icon: <HiDocumentChartBar />,
  },
  {
    key: "foods",
    label: "Quản lý đặt món",
    path: "/order-dish",
    icon: <IoFastFood />,
  },
];
