import moment from 'moment';
import { Reservation } from "../models/reservation.js";
import { TableReservation } from "../models/tableReservation.js"
import Table from "../models/table.js";
import joi from "joi";
import dayjs from "dayjs";
import { scheduleCancellation } from '../middlewares/cancellation.js';
import { scheduleDepositUpdate } from '../middlewares/depositUpdate.js';


const synonymKeywords = {
  "Cạnh cửa sổ": ["gần cửa sổ", "sát cửa sổ", "view đẹp"],
  "Ngoài trời": ["cảnh đẹp", "thoáng mát", "ngắm cảnh", "view đẹp"],
};
const findMatchingKeywords = (notes) => {
  let matchingKeywords = [];
  const normalizedNotes = notes.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  for (const [key, value] of Object.entries(synonymKeywords)) {
    const normalizedKeywords = value.map(keyword => keyword.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));
    if (normalizedKeywords.some(keyword => normalizedNotes.includes(keyword))) {
      matchingKeywords.push(key);
    }
  }
  return matchingKeywords;
};
const checkReservationTime = (date, time) => {
  const reservationDateTime = moment(`${date}T${time}`);
  const now = moment();
  const isToday = reservationDateTime.isSame(now, 'day');

  if (isToday && reservationDateTime.isBefore(now)) {
    throw new Error('Thời gian đặt chỗ phải từ thời điểm hiện tại trở đi đối với ngày hiện tại.');
  }
  const reservationTime = moment(time, 'HH:mm');
  const reservationDeadline = moment(date).set({ hour: 23, minute: 0 }).subtract(15, 'minutes');

  // Kiểm tra thời gian đặt chỗ phải trước 23:00 và không quá 15 phút trước giờ đó
  if (reservationDateTime.isSameOrAfter(reservationDeadline)) {
    throw new Error('Chúng tôi không thể nhận đơn đặt bàn cho thời gian này! Vui lòng đặt lại vào thời gian khác!');
  }
  return reservationDateTime;
};
const getTableCapacity = (guests) => {
  if (guests >= 1 && guests <= 2) return 2;
  if (guests >= 3 && guests <= 4) return 4;
  if (guests >= 5 && guests <= 8) return 8;
  if (guests >= 9 && guests <= 12) return 12;
  throw new Error('Số lượng khách quá lớn. Vui lòng liên hệ nhà hàng để biết thêm chi tiết!');
};
const findAvailableTable = async (reservationDateTime, tableCapacity, notes) => {
  let tables = [];
  if (notes) {
    const matchingKeywords = findMatchingKeywords(notes);
    tables = await Table.find({
      capacity: tableCapacity,
      $or: [
        { location: { $regex: notes, $options: 'i' } },
        { location: { $in: matchingKeywords } },
      ],
    }).sort({ capacity: 1 });
  }
  if (!tables.length) {
    tables = await Table.find({ capacity: tableCapacity }).sort({ capacity: 1 });
  }
  if (!tables.length) {
    throw new Error('Hiện tại không còn bàn phù hợp. Vui lòng liên hệ nhà hàng để biết thêm chi tiết!');
  }

  for (const table of tables) {
    const fifteenMinutesBefore = reservationDateTime.clone().subtract(15, 'minutes').toDate();
    const fifteenMinutesAfter = reservationDateTime.clone().add(15, 'minutes').toDate();
    const isTableReserved = await TableReservation.exists({
      tableId: table.id_table,
      reservationDate: {
        $gte: fifteenMinutesBefore,
        $lte: fifteenMinutesAfter,
      },
    });
    if (!isTableReserved) return table;
  }
  throw new Error('Hiện tại không còn bàn phù hợp. Vui lòng thử lại hoặc liên hệ nhà hàng để biết thêm chi tiết.');
};
export const send_reservation = async (req, res, next) => {
  try {
    const { name, email, date, time, phone, guests, notes, deposit, depositAmount, status } = req.body;
    const reservationDateTime = checkReservationTime(date, time);
    const tableCapacity = getTableCapacity(guests);
    const availableTable = await findAvailableTable(reservationDateTime, tableCapacity, notes);

    const newReservation = new Reservation({
      name, date: reservationDateTime, time, email, phone, guests, notes, status,
      table: availableTable.id_table, deposit: deposit || false, depositAmount: depositAmount || 0,
    });
    const savedReservation = await newReservation.save();

    const newTableReservation = new TableReservation({
      reservationId: savedReservation._id, tableId: availableTable.id_table,
      reservationDate: reservationDateTime, reservationTime: time, statusReservation: savedReservation.status,
      deposit: savedReservation.deposit, depositAmount: savedReservation.depositAmount
    });
    await newTableReservation.save();

    availableTable.reservations = availableTable.reservations || [];
    availableTable.reservations.push(savedReservation._id);
    if (savedReservation.status === 'Đang hoạt động') availableTable.status = 'Đang sử dụng';
    await availableTable.save();

    await scheduleDepositUpdate(reservationDateTime, availableTable, savedReservation);
    await scheduleCancellation(reservationDateTime, savedReservation);

    return res.status(200).json({
      success: true, message: 'Đặt bàn thành công!',
      reservation: {
        ...savedReservation.toObject(),
        table: availableTable.id_table
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const editReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const editSchema = joi.object({
      status: joi.string().required().valid('Đã đặt trước', 'Đang hoạt động', 'Đã hủy').messages({
        'string.empty': 'Trạng thái đơn đặt bàn không được để trống!',
        'any.only': "Trạng thái phải là 'Đã đặt trước', 'Đang hoạt động' 'Đã hủy'",
      }),
    });

    const { error } = editSchema.validate({ status });
    if (error) {
      return res.status(200).json({ success: false, error: error.details.map(e => e.message) });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(200).json({ success: false, message: 'Không tìm thấy đơn đặt bàn này!' });

    const originalStatus = reservation.status;
    reservation.status = status;
    await reservation.save();

    const tableId = reservation.table;
    let tableStatus;

    if (originalStatus === 'Đã đặt trước' && status === 'Đã hủy') tableStatus = 'Còn trống';
    else if (originalStatus === 'Đã hủy' && status === 'Đang hoạt động') tableStatus = 'Đang sử dụng';
    else if (originalStatus === 'Đang hoạt động' && status === 'Đã hủy') tableStatus = 'Còn trống';

    const updatedTable = await Table.findOneAndUpdate({ id_table: tableId }, { status: tableStatus }, { new: true });
    if (!updatedTable) return res.status(200).json({ success: false, message: 'Không tìm thấy đơn đặt bàn này!' });

    const tableReservation = await TableReservation.findOne({ reservationId: id });
    if (tableReservation) {
      tableReservation.statusReservation = status;
      await tableReservation.save();
    }

    return res.status(200).json({ success: true, message: 'Cập nhật đơn đặt bàn thành công.' });
  } catch (error) {
    console.error('Lỗi khi cập nhật đơn đặt bàn:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getOrders = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });

    const startDate = moment(`${year}-${month.padStart(2, '0')}-01`).startOf('month').toDate();
    const endDate = moment(`${year}-${month.padStart(2, '0')}-01`).endOf('month').toDate();

    const orders = await Reservation.find({ date: { $gte: startDate, $lt: endDate } }).sort({ createdAt: "desc" });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
    return res.status(500).json({ message: error.message });
  }
};
export const getOrderByDate = async (req, res) => {
  try {
    const { date, pageSize, pageIndex } = req.query;

    // Kiểm tra và log giá trị date
    if (!date) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }

    const formattedDate = dayjs(date).startOf('day').toDate();
    const endDate = dayjs(date).endOf('day').toDate();

    const orders = await Reservation.find({
      date: {
        $gte: formattedDate,
        $lt: endDate
      },
      status: { $ne: "Chờ đặt cọc" }
    }).skip((pageIndex - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ time: "asc" });

    const countReservation = await Reservation.countDocuments({
      date: {
        $gte: formattedDate,
        $lt: endDate
      }, status: { $ne: "Chờ đặt cọc" }
    });

    const totalPage = Math.ceil(countReservation / pageSize);

    return res.status(200).json({ orders, totalPage, count: countReservation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
export const searchOrderByPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone < 10) {
      return res.status(400).json({ message: "Vui lòng nhập số điện thoại hợp lệ!" });
    }
    const searchField = { phone: { $regex: phone + '$', $options: 'i' } };
    const reservations = await Reservation.find(searchField);

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    return res.status(200).json({ reservations });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getAllReservation = async (req, res) => {
  try {
    const reservations = await Reservation.find({ status: "Đã đặt trước" }).sort({ createdAt: "desc" });

    const totalReservation = await Reservation.countDocuments();

    // Tính ngày hiện tại và ngày của 7 ngày trước
    const sevenDaysAgo = moment().subtract(7, 'days').toDate();

    // Đếm số nhân viên được thêm vào trong 7 ngày gần nhất
    const recentReservation = await Reservation.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    return res.status(200).json({ reservations, totalReservation, recentReservation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
export const getPagingReservation = async (req, res) => {
  try {
    const { pageSize, pageIndex } = req.query;
    const reservations = await Reservation.find().skip(pageSize * (pageIndex - 1)).limit(pageSize).sort({ createdAt: "desc" });
    const countReservation = await Reservation.countDocuments();
    const totalPage = Math.ceil(countReservation / pageSize);
    return res.status(200).json({ reservations, totalPage, count: countReservation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getReservationDetails = async (req, res) => {
  const reservationId = req.params.id;

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const table = await Table.findOne({ id_table: reservation.table });
    const holdTime = reservation.deposit ? 30 : 15;

    const reservationDetails = {
      table: reservation.table,
      time: reservation.time,
      date: reservation.date,
      holdTime,
      status: reservation.status,
      name: reservation.name,
      guests: reservation.guests,
      email: reservation.email,
      phone: reservation.phone,
      notes: reservation.notes,
      tableDetails: table ? table.details : "Unknown",
    };

    res.json({ success: true, reservationDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reservation details' });
  }
};

