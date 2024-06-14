import ErrorHandler from "../middlewares/error.js";
import { Reservation } from "../models/reservation.js";
import Table from "../models/table.js"
import joi from "joi"
const synonymKeywords = {
  "Cạnh cửa sổ": ["gần cửa sổ", "sát cửa sổ", "view đẹp"],
  "Ngoài trời": ["cảnh đẹp", "thoáng mát", "ngắm cảnh", "view đẹp"],
};

const findMatchingKeywords = (notes) => {
  let matchingKeywords = [];

  const normalizedNotes = notes.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  for (const [key, value] of Object.entries(synonymKeywords)) {
    const normalizedKeywords = value.map(keyword => keyword.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));

    // Kiểm tra xem normalizedNotes có chứa bất kỳ từ khóa nào trong normalizedKeywords không
    if (normalizedKeywords.some(keyword => normalizedNotes.includes(keyword))) {
      matchingKeywords.push(key);
    }
  }

  return matchingKeywords;
};

export const send_reservation = async (req, res, next) => {
  try {
    const { name, email, date, time, phone, guests, notes } = req.body;

    if (!name || !email || !date || !time || !phone || !guests) {
      return next(new ErrorHandler("Vui lòng điền đầy đủ vào mẫu đặt chỗ!", 400));
    }

    let tableCapacity;
    if (guests >= 1 && guests <= 2) {
      tableCapacity = 2;
    } else if (guests >= 3 && guests <= 4) {
      tableCapacity = 4;
    } else if (guests >= 5 && guests <= 8) {
      tableCapacity = 8;
    } else if (guests >= 9 && guests <= 12) {
      tableCapacity = 12;
    } else {
      return next(new ErrorHandler("Số lượng khách quá lớn. Vui lòng liên hệ nhà hàng để biết thêm chi tiết.", 400));
    }

    let table;
    if (notes) {
      const matchingKeywords = findMatchingKeywords(notes);
      table = await Table.findOne({ capacity: { $gte: guests }, $or: [{ location: { $regex: notes, $options: 'i' } }, { location: { $in: matchingKeywords } }], status: "Còn trống" }).sort({ capacity: 1 });
    }
    if (!table) {
      table = await Table.findOne({ capacity: { $gte: guests }, status: "Còn trống" }).sort({ capacity: 1 });
    }
    if (!table) {
      return next(new ErrorHandler("Hiện tại không còn bàn phù hợp. Vui lòng thử lại vào thời gian khác hoặc liên hệ nhà hàng để biết thêm chi tiết.", 400));
    }

    const newReservation = new Reservation({
      name,
      date,
      time,
      email,
      phone,
      guests,
      notes,
      table: table.id_table
    });

    const savedReservation = await newReservation.save();

    if (!table.reservations) {
      table.reservations = [];
    }

    table.reservations.push(savedReservation._id);
    table.status = "Chưa đặt cọc";
    await table.save();

    res.status(201).json(savedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getPagingReservation = async (req, res) => {
  try {
    const query = req.query
    const reservations = await Reservation.find()
      .skip(query.pageSize * query.pageIndex - query.pageSize)
      .limit(query.pageSize).sort({ createdAt: "desc" })

    const countReservation = await Reservation.countDocuments()
    const totalPage = Math.ceil(countReservation / query.pageSize)

    return res.status(200).json({ reservations, totalPage, count: countReservation })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
export const editReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const editSchema = joi.object({
      status: joi.string().required().valid('Đang hoạt động', 'Đã hủy').messages({
        'string.empty': 'Trạng thái đơn đật bàn không được để trống!',
        'any.only': "Trạng thái phải là 'Đang hoạt động' hoặc 'Đã hủy'",
      })
    })
    const { error } = editSchema.validate({ status });
    if (error) {
      return res.status(400).json({
        error: error.details.map(e => e.message)
      });
    }
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt bàn này!' });
    }

    // Tính chênh lệch thời gian theo phút
    const currentTime = new Date();
    const reservationTime = new Date(reservation.time);
    const timeDiffInMinutes = Math.floor((currentTime - reservationTime) / (1000 * 60));

    // Hủy đơn nếu đâ trôi qua thời gian đặt    phút
    if (timeDiffInMinutes > 1 && reservation.status === 'Đang hoạt động') {
      reservation.status = 'Đã hủy';
      await reservation.save();
      return res.status(200).json({ message: 'Cập nhật đơn đặt bàn thành công.' });
    }

    // Ngược lại cập nhật trạng thái đặt chỗ theo yêu cầu
    reservation.status = status;
    await reservation.save();
    return res.status(200).json({ message: 'Cập nhật đơn đặt bàn thành công.' });

  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
