import React, { useEffect, useCallback, useState } from "react";
import { Form, Input, Modal, Select, Button, Spin } from "antd";
import { getUserById } from "../../services/user.js";

const ModalCreateUser = ({
  form,
  loading,
  title,
  isModalOpen,
  handleCancel,
  handleOk,
  selectedUser,
}) => {
  const [loadingData, setLoadingData] = useState(false);

  const getUser = useCallback(async () => {
    try {
      setLoadingData(true);
      const result = await getUserById(selectedUser);
      form.setFieldsValue({
        e_code: result.data.user.e_code,
        name: result.data.user.name,
        email: result.data.user.email,
        phone: result.data.user.phone,
        gender: result.data.user.gender ? "true" : "false",
        role: result.data.user.role,
      });
      setLoadingData(false);
    } catch (error) {
      console.log(error);
      setLoadingData(false);
    }
  }, [selectedUser, form]);

  useEffect(() => {
    if (selectedUser) getUser();
  }, [selectedUser, getUser]);

  return (
    <Modal
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      style={{
        top: 18,
      }}
    >
      <div className="text-center text-xl font-bold mb-2">
        <h2>{title}</h2>
      </div>
      <Spin spinning={loadingData}>
        <Form form={form} name="Users" onFinish={handleOk}>
          {selectedUser && (
            <>
              <label htmlFor="e_code" className="block text-sm font-bold mb-1">
                Mã nhân viên: <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="e_code"
                style={{ marginBottom: 10 }}
                rules={[
                  {
                    required: true,
                    message: "Mã nhân viên không được để trống",
                  },
                ]}
              >
                <Input
                  id="e_code"
                  placeholder="Mã nhân viên"
                  size="large"
                  disabled={true}
                />
              </Form.Item>
            </>
          )}

          <label htmlFor="name" className="block text-sm font-bold mb-1">
            Họ và tên: <span className="text-red-500">*</span>
          </label>
          <Form.Item
            name="name"
            style={{ marginBottom: 10 }}
            rules={[
              { required: true, message: "Tên nhân viên không được để trống" },
            ]}
          >
            <Input placeholder="Họ và tên" size="large" />
          </Form.Item>

          <label htmlFor="email" className="block text-sm font-bold mb-1">
            E-mail: <span className="text-red-500">*</span>
          </label>
          <Form.Item
            name="email"
            style={{ marginBottom: 10 }}
            rules={[
              { type: "email", message: "Email không đúng định dạng!" },
              { required: true, message: "Email không được để trống!" },
            ]}
          >
            <Input
              placeholder="E-mail"
              disabled={!!selectedUser}
              size="large"
            />
          </Form.Item>

          <label htmlFor="phone" className="block text-sm font-bold mb-1">
            Số điện thoại: <span className="text-red-500">*</span>
          </label>
          <Form.Item
            name="phone"
            style={{ marginBottom: 10 }}
            rules={[
              {
                pattern: /^\d{10}$/,
                message: "Số điện thoại phải có 10 chữ số!",
              },
              { required: true, message: "Số điện thoại không được để trống!" },
            ]}
          >
            <Input placeholder="Số điện thoại" size="large" />
          </Form.Item>

          <label htmlFor="gender" className="block text-sm font-bold mb-1">
            Giới tính: <span className="text-red-500">*</span>
          </label>
          <Form.Item
            name="gender"
            style={{ marginBottom: 10 }}
            rules={[
              {
                required: true,
                message: "Giới tính của nhân viên không được để trống!",
              },
            ]}
          >
            <Select placeholder="--Chọn giới tính--" size="large">
              <Select.Option value="true">Nam</Select.Option>
              <Select.Option value="false">Nữ</Select.Option>
            </Select>
          </Form.Item>

          <label htmlFor="role" className="block text-sm font-bold mb-1">
            Chức vụ: <span className="text-red-500">*</span>
          </label>
          <Form.Item
            name="role"
            style={{ marginBottom: 10 }}
            rules={[
              {
                required: true,
                message: "Chức vụ của nhân viên không được để trống!",
              },
            ]}
          >
            <Select placeholder="--Chọn chức vụ--" size="large">
              <Select.Option value="Quản lý">Quản lý</Select.Option>
              <Select.Option value="Nhân viên">Nhân viên</Select.Option>
            </Select>
          </Form.Item>

          {!selectedUser && (
            <>
              <label
                htmlFor="password"
                className="block text-sm font-bold mb-1"
              >
                Mật khẩu: <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="password"
                style={{ marginBottom: 10 }}
                rules={[
                  { required: true, message: "Mật khẩu không được để trống!" },
                  { min: 6, message: "Mật khẩu phải có 6 kí tự trở lên" },
                  { type: "password" },
                ]}
                hasFeedback
              >
                <Input.Password placeholder="Nhập mật khẩu" size="large" />
              </Form.Item>
            </>
          )}

          {!selectedUser && (
            <>
              <label htmlFor="confirm" className="block text-sm font-bold mb-1">
                Nhập lại mật khẩu: <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="confirm"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Mật khẩu không khớp, vui lòng kiểm tra lại!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu không khớp, vui lòng kiểm tra lại!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu" size="large" />
              </Form.Item>
            </>
          )}

          <div className="flex justify-end mt-5">
            <Button onClick={handleCancel} className="mr-2 mb-2" size="large">
              Hủy
            </Button>
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              className="mb-2"
              size="large"
            >
              {selectedUser ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ModalCreateUser;
