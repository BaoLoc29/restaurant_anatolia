import React, { useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  TimePicker,
} from "antd";
import moment from "moment";
import "../../antdCss/DatePicker.css";
const DrawerCreateOrder = ({
  form,
  loading,
  open,
  onClose,
  title,
  handleOk,
}) => {
  const [time, setTime] = useState(null);
  const [date, setDate] = useState(null);

  const onChangeTime = (time) => {
    if (time) {
      const formattedTime = time.format("HH:mm");
      setTime(formattedTime);
    } else {
      setTime(null);
    }
  };

  const onChangeDate = (date) => {
    if (date) {
      const formattedDate = date.format("YYYY-MM-DD");
      setDate(formattedDate);
    } else {
      setDate(null);
    }
  };

  const disabledDate = (current) => {
    // Không cho phép chọn ngày trong quá khứ hoặc hôm nay
    return current && current < moment().startOf("day");
  };
  const disabledDateTime = () => {
    if (date && moment(date).isSame(moment(), "day")) {
      // Nếu ngày đã chọn là hôm nay, không cho phép chọn thời gian đã qua
      return {
        disabledHours: () => range(0, 24).splice(0, moment().hour()),
        disabledMinutes: () => range(0, 60).splice(0, moment().minute()),
      };
    }
    return {};
  };
  const disabledHours = () => {
    if (date && moment(date).isSame(moment(), "day")) {
      return range(0, 24).filter(
        (hour) => hour < moment().hour() || hour < 8 || hour > 22
      );
    }
    return range(0, 24).filter((hour) => hour < 8 || hour > 22);
  };

  const disabledMinutes = (selectedHour) => {
    if (
      date &&
      moment(date).isSame(moment(), "day") &&
      selectedHour === moment().hour()
    ) {
      return range(0, 60).filter((minute) => minute < moment().minute());
    }
    return [];
  };

  const range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        handleOk({ ...values, date, time });
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
      });
  };
  return (
    <Drawer title={title} width={750} onClose={onClose} open={open}>
      <Form
        form={form}
        layout="vertical"
        name="createOrderForm"
        onFinish={handleOk}
        initialValues={{
          email: "user@gmail.com",
          deposit: false,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={<span className="font-bold">Tên khách hàng </span>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên khách hàng!",
                },
              ]}
            >
              <Input placeholder="Nhập tên khách hàng" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label={<span className="font-bold">E-mail</span>}
              rules={[
                { type: "email", message: "Email không đúng định dạng!" },
              ]}
            >
              <Input placeholder="Nhập email khách hàng" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label={<span className="font-bold">Số điện thoại</span>}
              rules={[
                {
                  pattern: /^0\d{9}$/,
                  message:
                    "Số điện thoại phải bắt đầu từ số 0 và có 10 chữ số.",
                },
                {
                  required: true,
                  message: "Số điện thoại không được để trống!",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="guests"
              label={<span className="font-bold">Số lượng khách</span>}
              rules={[
                {
                  required: true,
                  message: "Số lượng khách không được để trống!",
                },
                {
                  pattern: /^([1-9]\d*)$/,
                  message: "Số lượng khách phải từ 1 người trở lên!",
                },
              ]}
            >
              <Input placeholder="Nhập số lượng khách" type="number" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date"
              label={<span className="font-bold">Ngày đến</span>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày đến!",
                },
              ]}
            >
              <DatePicker
                className="w-full"
                placeholder="--Chọn ngày đến--"
                onChange={onChangeDate}
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="time"
              label={<span className="font-bold">Giờ đến</span>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian khách đến!",
                },
              ]}
            >
              <TimePicker
                className="w-full"
                placeholder="--Chọn giờ đến--"
                format={"HH:mm"}
                onChange={onChangeTime}
                disabled={!date}
                disabledHours={disabledHours}
                disabledMinutes={disabledMinutes}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="deposit"
              label={<span className="font-bold">Đặt cọc</span>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn đặt cọc hoặc không!",
                },
              ]}
            >
              <Select placeholder="--Lựa chọn đặt cọc--" className="text-base">
                <Select.Option value={false}>Không cọc</Select.Option>
                <Select.Option value={true}>Đặt cọc (200.000đ)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <div className="flex justify-between">
              <img
                src="https://becexamguide.com/wp-content/uploads/2020/10/logo-stripe.png"
                alt="Stripe"
                width={240}
                className="-mx-4 my-0 absolute"
              />
              <img
                src="https://landing.nvncdn.com/business/3705/tai_lieu_gioi_thieu_payment_website_pdf_(ban_thuyet_trinh)_(3)_20211203150731.png"
                alt="momo"
                width={170}
                className="ml-[12rem] mt-0"
              />
            </div>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="notes"
              label={<span className="font-bold">Yêu cầu</span>}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập yêu cầu của khách hàng"
              />
            </Form.Item>
          </Col>
        </Row>
        <Space className="float-right">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            Submit
          </Button>
        </Space>
      </Form>
    </Drawer>
  );
};

export default DrawerCreateOrder;
