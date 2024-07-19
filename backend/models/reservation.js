import mongoose from "mongoose";
import validator from "validator";

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Họ và tên là bắt buộc."],
    maxLength: [30, "Họ và tên không được vượt quá 30 ký tự."],
  },
  date: {
    type: Date,
    required: [true, "Ngày đặt chỗ là bắt buộc."],
  },
  time: {
    type: String,
    required: [true, "Thời gian đặt chỗ là bắt buộc."],

  },
  email: {
    type: String,
    required: [true, "Email là bắt buộc."],
  },
  phone: {
    type: String,
    required: [true, "Số điện thoại là bắt buộc."],
    validate: {
      validator: function (value) {
        return /^0\d{9}$/.test(value);
      },
      message: "Số điện thoại phải bắt đầu bằng '0' và có đúng 10 chữ số."
    }
  },
  guests: {
    type: Number,
    required: [true, "Số lượng khách là bắt buộc."],
    min: [1, "Phải có ít nhất 1 khách."],
    max: [12, "Số lượng khách không được quá 12 người."]
  },
  notes: {
    type: String,
    maxLength: [500, "Ghi chú không được vượt quá 500 ký tự."],
  },
  table: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: "Đã đặt trước",
    enum: ['Chờ đặt cọc', 'Đã đặt trước', 'Đặt cọc thất bại', 'Đang hoạt động', 'Đã hủy', 'Đã thanh toán'],
  },
  deposit: {
    type: Boolean,
    required: true,
    default: false
  },
  depositAmount: {
    type: Number,
    required: function () {
      return this.deposit;
    },
    min: [0, "Số tiền đặt cọc không thể nhỏ hơn 0."]
  }
}, { timestamps: true });

export const Reservation = mongoose.model("Reservation", reservationSchema);