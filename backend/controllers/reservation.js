import ErrorHandler from "../middlewares/error.js";
import { Reservation } from "../models/reservation.js";

const send_reservation = async (req, res, next) => {
  const { name, email, date, time, phone, guests, notes } = req.body;

  if (!name || !email || !date || !time || !phone || !guests) {
    return next(new ErrorHandler("Vui lòng điền đầy đủ vào mẫu đặt chỗ!", 400));
  }

  try {
    await Reservation.create({ name, email, date, time, phone, guests, notes });
    res.status(201).json({
      success: true,
      message: "Đặt chỗ thành công!",
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return next(new ErrorHandler(validationErrors.join(', '), 400));
    }

    return next(error);
  }
};

export default send_reservation;