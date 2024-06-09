import {
  HiOutlineViewGrid,
  // HiOutlineShoppingCart,
  HiOutlineQuestionMarkCircle,
  HiOutlineCog,
} from "react-icons/hi";
import { SiAirtable } from "react-icons/si";
import { FaUserTie } from "react-icons/fa";
import { IoFastFood } from "react-icons/io5";

export const DASHBOARD_SIDEBAR_LINKS = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: <HiOutlineViewGrid />,
  },
  // {
  //   key: "orders",
  //   label: "Orders",
  //   path: "/orders",
  //   icon: <HiOutlineShoppingCart />,
  // },
  {
    key: "tables",
    label: "Quản lý bàn",
    path: "/tables",
    icon: <SiAirtable />,
  },
  {
    key: "employees",
    label: "Quản lý thực đơn",
    path: "/menus",
    icon: <IoFastFood />,
  },
  {
    key: "employees",
    label: "Quản lý nhân viên",
    path: "/employees",
    icon: <FaUserTie />,
  },
];

export const DASHBOARD_SIDEBAR_BOTTOM_LINKS = [
  {
    key: "settings",
    label: "Settings",
    path: "/settings",
    icon: <HiOutlineCog />,
  },
  {
    key: "support",
    label: "Help & Support",
    path: "/support",
    icon: <HiOutlineQuestionMarkCircle />,
  },
];
