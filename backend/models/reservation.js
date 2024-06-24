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
    validate: {
      validator: function (value) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= currentDate;
      },
      message: "Ngày đặt chỗ phải từ ngày hiện tại trở đi."
    }
  },
  time: {
    type: String,
    required: [true, "Thời gian đặt chỗ là bắt buộc."],
    validate: [
      {
        validator: function (value) {
          const [hours, minutes] = value.split(':').map(Number);
          const selectedTotalMinutes = hours * 60 + minutes;
          return selectedTotalMinutes >= 480 && selectedTotalMinutes <= 1380;
        },
        message: "Thời gian phải nằm trong khoảng từ 08:00 đến 23:00."
      },
      {
        validator: function (value) {
          const [hours, minutes] = value.split(':').map(Number);

          // Kiểm tra nếu ngày đặt chỗ là hôm nay
          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);
          const selectedDate = new Date(this.date);
          selectedDate.setHours(0, 0, 0, 0);

          if (selectedDate.getTime() === currentDate.getTime()) {
            // Nếu ngày đặt chỗ là hôm nay, kiểm tra thời gian không được trong quá khứ so với thời gian hiện tại
            return hours >= currentDate.getHours() && minutes >= currentDate.getMinutes();
          }
          return true;
        },
        message: "Không thể chọn thời gian trong quá khứ nếu ngày đặt chỗ là ngày hiện tại."
      }
    ]
  },
  email: {
    type: String,
    required: [true, "Email là bắt buộc."],
    validate: [validator.isEmail, "Vui lòng cung cấp một địa chỉ email hợp lệ."],
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
    default: "Đã đặt trước"
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
