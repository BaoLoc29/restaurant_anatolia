import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { HiOutlineLogout } from "react-icons/hi";
import { BsArrowLeftShort } from "react-icons/bs";
import { DASHBOARD_SIDEBAR_LINKS } from "../../lib/consts/navigation";
import { logout } from "../../feature/user/userSlice.js";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

const linkClass =
  "flex items-center gap-2 font-light px-3 py-2 hover:bg-neutral-700 hover:no-underline active:bg-neutral-600 rounded-sm text-base";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(pathname === "/");

  useEffect(() => {
    setOpen(!(pathname === "/order-dish"));
  }, [pathname]);

  return (
    <div
      className={`flex flex-col bg-neutral-900 ${open ? "w-60" : "w-20"} duration-300 p-3 text-white relative`}
    >
      <BsArrowLeftShort
        className={`bg-white text-neutral-900 text-3xl rounded-full absolute -right-3 top-4 border border-neutral-900 cursor-pointer ${!open && "rotate-180"}`}
        onClick={() => {
          setOpen(!open);
        }}
      />

      {open ? (
        <div className="flex items-center gap-2 px-5 pt-4 pb-7 border-b border-neutral-700">
          <img src={assets.logo_image} alt="logo" height={64} width={180} />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 pt-4 pb-7 border-b border-neutral-700">
          <img
            src={assets.logo_mini}
            alt="alternate logo"
            height={64}
            width={180}
          />
        </div>
      )}
      <div className="py-5 flex flex-1 flex-col gap-0.5">
        {DASHBOARD_SIDEBAR_LINKS.map((item) => (
          <SidebarLink key={item.key} item={item} open={open} />
        ))}
      </div>
      <div className="flex flex-col gap-0.5 pt-2 border-t border-neutral-700">
        <div
          className={classNames(linkClass, "cursor-pointer text-red-500", {
            "flex items-center justify-center": !open,
          })}
          onClick={() => {
            dispatch(logout());
            navigate("/");
          }}
        >
          <span className="text-2xl">
            <HiOutlineLogout className="rotate-180" />
          </span>
          {open ? <span>Logout</span> : null}
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ item, open }) {
  const { pathname } = useLocation();
  return (
    <Link
      to={item.path}
      className={classNames(
        { "flex items-center justify-center": !open },
        pathname === item.path
          ? "bg-neutral-700 text-white"
          : "text-neutral-400",
        linkClass
      )}
    >
      <span className="text-2xl">{item.icon}</span>
      {open ? <span>{item.label}</span> : null}
    </Link>
  );
}

export default Sidebar;
