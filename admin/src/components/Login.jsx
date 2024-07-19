import React, { useState } from "react";
import { Button, Form, Input } from "antd";
import { login } from "../services/user";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  saveTokenToLocalStorage,
  saveUserToLocalStorage,
} from "../utils/localstorage";
import { FiLogIn } from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import { login as loginAction } from "../feature/user/userSlice";
import { assets } from "../assets/assets";
const Login = () => {
  const [loading, setLoading] = useState(false);
  const naviagate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user);
  console.log(user);
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const result = await login(values);
      dispatch(loginAction({ user: result.data.user }));
      saveTokenToLocalStorage(result.data.accessToken);
      saveUserToLocalStorage(result.data.user);
      toast.success("Đăng nhập thành công!");
      if (result.data.user.role === "Quản lý") {
        naviagate("/");
      } else {
        naviagate("/orders");
      }
    } catch (error) {
      toast.error("Sai tài khoản hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Đăng nhập thất bại:", errorInfo);
  };
  return (
    <div className="flex items-center justify-center px-6 py-8 mx-auto h-screen md:h-screen shadow-custom-strong bg-gray-200 rounded-lg">
      <img
        src={assets.illustration}
        alt="illustration"
        className="mt-10 mr-20"
      />
      <div className="w-full bg-white rounded-md shadow-md md:mt-0 sm:max-w-md xl:p-0 bg-white dark:border dark:border-gray-200">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl text-black flex justify-center">
            Đăng nhập
          </h1>
          <Form
            className="space-y-4 md:space-y-6"
            name="basic"
            initialValues={{}}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Email người dùng là bắt buộc!",
                },
                {
                  min: 6,
                  message: "Email người dùng phải từ 6 kí tự trở lên!",
                },
              ]}
            >
              <Input
                placeholder="Nhập E-mail"
                className="border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-white border-gray-600 text-black"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Mật khẩu là bắt buộc!",
                },
                {
                  min: 6,
                  message: "Mật khẩu phải từ 6 kí tự trở lên!",
                },
              ]}
            >
              <Input.Password
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                className="border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 w-full p-2.5 bg-white border-gray-600 text-black"
              />
            </Form.Item>
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    aria-describedby="remember"
                    type="checkbox"
                    className="cursor-pointer w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="remember"
                    className="cursor-pointer text-gray-500 text-black"
                  >
                    Nhớ tôi
                  </label>
                </div>
              </div>
              <Link
                to="#"
                className="text-sm font-medium text-black hover:underline dark:text-primary-500"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Button
              loading={loading}
              icon={<FiLogIn fontSize={20} />}
              type="primary"
              htmlType="submit"
              className="flex items-center justify-center w-full h-[3rem] bg-blue-500 hover:bg-blue-700 text-white text-lg font-bold py-2 px-4 rounded-lg"
            >
              Đăng nhập
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
