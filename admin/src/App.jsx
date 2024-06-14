import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import Layout from "./components/shared/Layout";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import NonAuthLayout from "./layouts/NonAuthLayout/index.jsx";
import AuthLayout from "./layouts/AuthLayout/index.jsx";
import isObjctEmpty from "./utils/isObjectEmpty";
import Order from "./components/Order.jsx";
import Profile from "./components/Profile.jsx";
import Employee from "./components/Employee.jsx";
import Table from "./components/Table.jsx";
import Menu from "./components/Menu.jsx";
function App() {
  const user = useSelector((state) => state.users.user);
  return (
    <>
      <Toaster />
      <Routes>
        {isObjctEmpty(user) ? (
          <Route path="/" element={<NonAuthLayout />}>
            <Route index element={<Login />} />
          </Route>
        ) : (
          <Route path="/" element={<AuthLayout />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Order />} />
              <Route path="employees" element={<Employee />} />
              <Route path="tables" element={<Table />} />
              <Route path="menus" element={<Menu />} />
              <Route path="my-profile" element={<Profile />} />
            </Route>
          </Route>
        )}
      </Routes>
    </>
  );
}

export default App;
