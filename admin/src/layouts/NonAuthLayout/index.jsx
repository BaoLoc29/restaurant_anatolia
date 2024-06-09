import { Outlet } from "react-router";
const NonAuthLayout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default NonAuthLayout;
