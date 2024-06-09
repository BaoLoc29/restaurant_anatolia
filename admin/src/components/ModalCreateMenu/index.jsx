import React, { useEffect, useCallback, useState } from "react";
import { Form, Input, Modal, Select, Button, Row, Col, Spin } from "antd";
import { getMenuById } from "../../services/menu.js";
const { TextArea } = Input;

const ModalCreateMenu = ({
  form,
  loading,
  title,
  isModalOpen,
  handleCancel,
  handleOk,
  selectedMenu,
}) => {
  const [loadingData, setLoadingData] = useState();
  const getMenu = useCallback(async () => {
    try {
      setLoadingData(true);
      const result = await getMenuById(selectedMenu);
      form.setFieldsValue({
        code: result.data.menu.code,
        name: result.data.menu.name,
        classify: result.data.menu.classify,
        description: result.data.menu.description,
        unit: result.data.menu.unit,
        price: result.data.menu.price,
        discount: result.data.menu.discount,
        status: result.data.menu.status,
      });
      setLoadingData(false);
    } catch (error) {
      setLoadingData(false);
      console.log(error);
    }
  }, [selectedMenu, form]);

  useEffect(() => {
    if (selectedMenu) getMenu();
  }, [selectedMenu, getMenu]);

  return (
    <Modal
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={800}
      style={{
        top: 50,
      }}
    >
      <div className="text-center text-xl font-bold mb-5">
        <h2>{title}</h2>
      </div>
      <Spin spinning={loadingData}>
        <Form form={form} name="Menus" onFinish={handleOk}>
          <Row gutter={16}>
            <Col span={12}>
              {selectedMenu && (
                <>
                  <label
                    htmlFor="code"
                    className="block text-sm font-bold mb-1"
                  >
                    Mã món ăn: <span className="text-red-500">*</span>
                  </label>
                  <Form.Item name="code" style={{ marginBottom: 10 }}>
                    <Input
                      id="code"
                      placeholder="Mã món ăn"
                      className="text-base"
                      disabled={true}
                    />
                  </Form.Item>
                </>
              )}

              <label htmlFor="name" className="block text-sm font-bold mb-1">
                Tên món ăn: <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="name"
                style={{ marginBottom: 10 }}
                rules={[
                  {
                    required: true,
                    message: "Tên món ăn không được để trống!",
                  },
                ]}
              >
                <Input placeholder="Tên món ăn" className="text-base" />
              </Form.Item>

              {selectedMenu && (
                <>
                  <label
                    htmlFor="unit"
                    className="block text-sm font-bold mb-1"
                  >
                    Đơn vị khẩu phần: <span className="text-red-500">*</span>
                  </label>
                  <Form.Item name="unit" style={{ marginBottom: 10 }}>
                    <Input
                      id="unit"
                      placeholder="Đơn vị khẩu phần"
                      className="text-base"
                      disabled={true}
                    />
                  </Form.Item>
                </>
              )}

              <label htmlFor="price" className="block text-sm font-bold mb-1">
                Giá món: <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="price"
                style={{ marginBottom: 10 }}
                rules={[
                  {
                    required: true,
                    message: "Giá món ăn không được để trống!",
                  },
                  {
                    pattern: /^([1-9]\d*)$/,
                    message: "Giá món ăn phải từ 1đ trở lên!",
                  },
                ]}
              >
                <Input
                  placeholder="Giá món ăn"
                  className="text-base"
                  type="number"
                />
              </Form.Item>

              <label
                htmlFor="discount"
                className="block text-sm font-bold mb-1"
              >
                Giảm giá: <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="discount"
                style={{ marginBottom: 10 }}
                rules={[
                  { required: true, message: "Giảm giá không được để trống!" },
                  {
                    pattern: /^(0|[1-9]\d*)$/,
                    message: "Giảm giá món phải từ 0% trở lên!",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập giảm giá (nếu có)"
                  className="text-base"
                  type="number"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <label
                htmlFor="classify"
                className="block text-sm font-bold mb-1"
              >
                Phân loại món ăn: <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="classify"
                style={{ marginBottom: 10 }}
                rules={[
                  {
                    required: true,
                    message: "Loại món ăn không được để trống!",
                  },
                ]}
              >
                <Select placeholder="--Chọn phân loại--" className="text-base">
                  <Select.Option value="Món ăn">Món ăn</Select.Option>
                  <Select.Option value="Đồ uống">Đồ uống</Select.Option>
                </Select>
              </Form.Item>

              {selectedMenu && (
                <>
                  <label
                    htmlFor="status"
                    className="block text-sm font-bold mb-1"
                  >
                    Trạng thái món ăn: <span className="text-red-500">*</span>
                  </label>
                  <Form.Item
                    name="status"
                    style={{ marginBottom: 10 }}
                    rules={[
                      {
                        required: true,
                        message: "Trạng thái món ăn không được để trống!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="--Chọn trạng thái món ăn--"
                      className="text-base"
                    >
                      <Select.Option value="Còn món">Còn món</Select.Option>
                      <Select.Option value="Hết món">Hết món</Select.Option>
                    </Select>
                  </Form.Item>
                </>
              )}

              <label
                htmlFor="description"
                className="block text-sm font-bold mb-1"
              >
                Mô tả: <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="description"
                style={{ marginBottom: 10 }}
                rules={[
                  { required: true, message: "Mô tả không được để trống!" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Mô tả món ăn"
                  className="text-base"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end">
            <Button onClick={handleCancel} className="mr-2 mb-2">
              Hủy
            </Button>
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              className="mb-2"
            >
              {selectedMenu ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ModalCreateMenu;
