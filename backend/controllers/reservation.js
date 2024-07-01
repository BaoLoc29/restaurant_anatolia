import schedule from 'node-schedule';
import moment from 'moment';
import { Reservation } from "../models/reservation.js";
import { TableReservation } from "../models/tableReservation.js"
import Table from "../models/table.js";
import joi from "joi";
import dayjs from "dayjs";

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
export const send_reservation = async (req, res, next) => {
  try {
    const { name, email, date, time, phone, guests, notes, deposit, depositAmount, status } =
      req.body;

    // Kiểm tra ngày và thời gian đặt chỗ
    const reservationDateTime = moment(`${date}T${time}`);
    const now = moment();
    const isToday = reservationDateTime.isSame(now, 'day');

    // Kiểm tra thời gian đặt chỗ phải sau thời điểm hiện tại nếu là ngày hiện tại
    if (isToday && reservationDateTime.isBefore(now)) {
      return res.status(200).json({
        success: false,
        message: 'Thời gian đặt chỗ phải từ thời điểm hiện tại trở đi đối với ngày hiện tại.',
      })
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
      return res.status(200).json({
        success: false,
        message: 'Số lượng khách quá lớn. Vui lòng liên hệ nhà hàng để biết thêm chi tiết.',
      })
    }

    let tables;
    if (notes) {
      const matchingKeywords = findMatchingKeywords(notes);
      tables = await Table.find({
        capacity: tableCapacity,
        $or: [
          { location: { $regex: notes, $options: 'i' } },
          { location: { $in: matchingKeywords } },
        ],
        // status: 'Còn trống',
      }).sort({ capacity: 1 });
    }
    if (!tables || tables.length === 0) {
      tables = await Table.find({
        capacity: tableCapacity,
        // status: 'Còn trống',
      }).sort({ capacity: 1 });
    }

    if (!tables || tables.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'Hiện tại không còn bàn phù hợp. Vui lòng thử lại hoặc liên hệ nhà hàng để biết thêm chi tiết.',
      })
    }

    let availableTable;
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
      if (!isTableReserved) {
        availableTable = table;
        break;
      }
    }

    if (!availableTable) {
      return res.status(200).json({
        success: false,
        message: 'Hiện tại không còn bàn phù hợp. Vui lòng thử lại hoặc liên hệ nhà hàng để biết thêm chi tiết.',
      })
    }

    console.log(`Reservation Date Time: ${reservationDateTime}`);

    const newReservation = new Reservation({
      name,
      date: reservationDateTime,
      time,
      email,
      phone,
      guests,
      notes,
      status,
      table: availableTable.id_table,
      deposit: deposit || false,
      depositAmount: depositAmount || 0,
    });

    const savedReservation = await newReservation.save();

    const newTableReservation = new TableReservation({
      reservationId: savedReservation._id,
      tableId: availableTable.id_table,
      reservationDate: reservationDateTime,
      reservationTime: time,
    });
    await newTableReservation.save();

    availableTable.reservations = availableTable.reservations || [];
    availableTable.reservations.push(savedReservation._id);

    if (savedReservation.status === 'Đang hoạt động') {
      availableTable.status = 'Đang sử dụng';
    }
    await availableTable.save();

    // Lên lịch thay đổi trạng thái bàn vào đúng ngày và giờ đến
    schedule.scheduleJob(reservationDateTime.toDate(), async function () {
      const tableToUpdate = await Table.findOne({ id_table: availableTable.id_table });

      if (tableToUpdate.status !== 'Đang sử dụng') {
        tableToUpdate.status = deposit ? 'Đã đặt cọc' : 'Chưa đặt cọc';
        await tableToUpdate.save()
        console.log(
          `Bàn ${availableTable.id_table} đã được cập nhật sang trạng thái '${tableToUpdate.status}'.`
        );
      } else {
        console.log(`Bàn ${availableTable.id_table} đang trong trạng thái 'Đang sử dụng', không thay đổi trạng thái tự động.`);
      }
    });

    const cancelTime = reservationDateTime.clone().add(3, 'minutes').toDate();
    console.log('Thời điểm đặt bàn:', reservationDateTime.toDate());
    console.log('Thời điểm hủy bàn:', cancelTime);

    // Lên lịch hủy đơn sau 3 phút
    schedule.scheduleJob(cancelTime, async function () {
      const reservation = await Reservation.findById(savedReservation._id);
      if (reservation && reservation.status === 'Đã đặt trước') {
        reservation.status = 'Đã hủy';
        await reservation.save();

        const tableToUpdate = await Table.findOne({
          id_table: reservation.table,
        });
        if (tableToUpdate) {
          tableToUpdate.status = 'Còn trống';
          await tableToUpdate.save();
        }

        console.log(
          `Đơn đặt chỗ ${savedReservation._id} đã bị hủy tự động.`
        );
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Đặt bàn thành công!',
      reservation: {
        ...savedReservation.toObject(),
        table: availableTable.id_table,
      }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
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
      status: joi.string()
        .required()
        .valid('Đã đặt trước', 'Đang hoạt động', 'Đã hủy')
        .messages({
          'string.empty': 'Trạng thái đơn đặt bàn không được để trống!',
          'any.only': "Trạng thái phải là 'Đã đặt trước', 'Đang hoạt động' 'Đã hủy'",
        }),
    });

    const { error } = editSchema.validate({ status });
    if (error) {
      return res.status(200).json({
        success: false,
        error: error.details.map((e) => e.message),
      });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(200).json({
        success: false,
        message: 'Không tìm thấy đơn đặt bàn này!'
      });
    }

    const originalStatus = reservation.status;
    reservation.status = status;
    await reservation.save();

    const tableId = reservation.table;
    let tableStatus;

    if (originalStatus === 'Đã đặt trước' && status === 'Đã hủy') {
      tableStatus = 'Còn trống';
    } else if (originalStatus === 'Đã hủy' && status === 'Đang hoạt động') {
      tableStatus = 'Đang sử dụng';
    } else if (originalStatus === 'Đang hoạt động' && status === 'Đã hủy') {
      tableStatus = 'Còn trống';
    }

    const updatedTable = await Table.findOneAndUpdate(
      { id_table: tableId },
      { status: tableStatus },
      { new: true }
    );

    if (!updatedTable) {
      return res.status(200).json({
        success: false,
        message: 'Không tìm thấy đơn đặt bàn này!'
      });
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
    if (!month || !year) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" })
    }

    // Đảm bảo tháng và năm lần lượt có hai chữ số và bốn chữ số
    const monthString = month.padStart(2, '0');
    const yearString = year.padStart(4, '0');

    // Xác định khoảng thời gian bắt đầu và kết thúc của tháng
    const startDate = moment(`${yearString}-${monthString}-01`, "YYYY-MM-DD").startOf('month').toDate();
    const endDate = moment(`${yearString}-${monthString}-01`, "YYYY-MM-DD").endOf('month').toDate();

    const orders = await Reservation.find({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort({ createdAt: "desc" });

    return res.status(200).json({ orders })
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
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
      }
    }).skip((pageIndex - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: "desc" });

    const countReservation = await Reservation.countDocuments({
      date: {
        $gte: formattedDate,
        $lt: endDate
      }
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
    const reservations = await Reservation.find().sort({ createdAt: "desc" });

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


