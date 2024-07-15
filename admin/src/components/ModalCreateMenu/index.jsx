import React, { useEffect, useCallback, useState } from "react";
import {
  Form,
  Input,
  Modal,
  Select,
  Button,
  Row,
  Col,
  Spin,
  Upload,
  Image,
  message,
} from "antd";
import { getMenuById } from "../../services/menu.js";
import { PlusOutlined } from "@ant-design/icons";
const { TextArea } = Input;
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const ModalCreateMenu = ({
  form,
  loading,
  title,
  isModalOpen,
  handleCancel,
  handleOk,
  selectedMenu,
}) => {
  const [loadingData, setLoadingData] = useState(false);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getMenu = useCallback(async () => {
    try {
      setLoadingData(true);
      const result = await getMenuById(selectedMenu);
      form.setFieldsValue({
        code: result.data.menu.code,
        name: result.data.menu.name,
        classify: result.data.menu.classify,
        category: result.data.menu.category,
        description: result.data.menu.description,
        unit: result.data.menu.unit,
        price: result.data.menu.price,
        status: result.data.menu.status,
        imageMenu: result.data.menu.imageMenu,
      });
      setImageUrl(result.data.menu.imageMenu);
      setLoadingData(false);
    } catch (error) {
      setLoadingData(false);
      console.log(error);
    }
  }, [selectedMenu, form]);

  useEffect(() => {
    if (selectedMenu) getMenu();
  }, [selectedMenu, getMenu]);

  const onFinish = async (values) => {
    try {
      await handleOk(values, file);
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error(
        selectedMenu
          ? "Sửa ảnh món ăn thất bại!"
          : "Thêm ảnh món ăn thành công!"
      );
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChangeFile = (info) => {
    const fileList = [...info.fileList];
    if (fileList.length > 0) {
      setFile(fileList[0].originFileObj);
      setImageUrl(null);
    }
  };

  return (
    <Modal
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={800}
      style={{
        top: 30,
      }}
    >
      <div className="text-center text-xl font-bold mb-4">
        <h2>{title}</h2>
      </div>
      <Spin spinning={loadingData}>
        <Form form={form} name="Menus" onFinish={onFinish}>
          <div className="flex justify-center gap-2 mb-4">
            {selectedMenu && imageUrl && (
              <div className="text-center">
                <Image src={imageUrl} alt="Preview" width={150} height={100} />
              </div>
            )}
            <Form.Item
              name="imageMenu"
              style={{ marginBottom: 10 }}
              rules={[
                {
                  required: true,
                  message: "Ảnh món ăn không được để trống!",
                },
              ]}
            >
              <Upload
                className="flex justify-center"
                name="image"
                beforeUpload={() => false}
                maxCount={1}
                listType="picture-card"
                accept="image/*"
                onPreview={handlePreview}
                onChange={handleChangeFile}
              >
                <Button
                  className="flex flex-col items-center justify-center w-[6rem] h-[6rem]"
                  type="button"
                >
                  <PlusOutlined />
                  <div className="mt-2">Thêm ảnh</div>
                </Button>
              </Upload>
              {previewImage && (
                <Image
                  wrapperStyle={{
                    display: "none",
                  }}
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                    afterOpenChange: (visible) =>
                      !visible && setPreviewImage(""),
                  }}
                  src={previewImage}
                />
              )}
            </Form.Item>
          </div>

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
                      size="large"
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
                <Input placeholder="Tên món ăn" size="large" />
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
                      size="large"
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
                <Input placeholder="Giá món ăn" size="large" type="number" />
              </Form.Item>
              <label
                htmlFor="category"
                className="block text-sm font-bold mb-1"
              >
                Danh mục: <span className="text-red-500">*</span>
              </label>

              <Form.Item
                name="category"
                style={{ marginBottom: 10 }}
                rules={[
                  {
                    required: true,
                    message: "Danh mục món ăn không được để trống!",
                  },
                ]}
              >
                <Select placeholder="--Chọn phân loại--" size="large">
                  <Select.Option value="Bữa sáng">Bữa sáng</Select.Option>
                  <Select.Option value="Bữa trưa">Bữa trưa</Select.Option>
                  <Select.Option value="Bữa tối">Bữa tối</Select.Option>
                  <Select.Option value="Ngày tết">Ngày tết</Select.Option>
                  <Select.Option value="Noel">Noel</Select.Option>
                  <Select.Option value="Tình nhân">Tình nhân</Select.Option>
                  <Select.Option value="Gia đình">Gia đình</Select.Option>
                  <Select.Option value="Lương về">Lương về</Select.Option>
                </Select>
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
                <Select placeholder="--Chọn phân loại--" size="large">
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
                    <Select placeholder="--Chọn trạng thái--" size="large">
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
                Mô tả món ăn:
              </label>
              <Form.Item name="description" style={{ marginBottom: 10 }}>
                <TextArea rows={4} placeholder="Mô tả món ăn" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end mt-3">
            <Button onClick={handleCancel} className="mr-2" size="large">
              Hủy
            </Button>
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              size="large"
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
