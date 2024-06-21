import schedule from 'node-schedule';
import moment from 'moment';
import ErrorHandler from "../middlewares/error.js";
import { Reservation } from "../models/reservation.js";
import { TableReservation } from "../models/tableReservation.js"
import Table from "../models/table.js";
import joi from "joi";

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
    const { name, email, date, time, phone, guests, notes, deposit, depositAmount } =
      req.body;

    if (!name || !email || !date || !time || !phone || !guests) {
      return next(
        new ErrorHandler('Vui lòng điền đầy đủ vào mẫu đặt chỗ!', 400)
      );
    }

    // Kiểm tra ngày và thời gian đặt chỗ
    const reservationDateTime = moment(`${date}T${time}`);
    const now = moment();

    // Kiểm tra xem ngày đặt chỗ có phải là ngày hiện tại không
    const isToday = reservationDateTime.isSame(now, 'day');

    // Kiểm tra thời gian đặt chỗ phải sau thời điểm hiện tại nếu là ngày hiện tại
    if (isToday && reservationDateTime.isBefore(now)) {
      return next(
        new ErrorHandler(
          'Thời gian đặt chỗ phải từ thời điểm hiện tại trở đi đối với ngày hiện tại.',
          400
        )
      );
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
      return next(
        new ErrorHandler(
          'Số lượng khách quá lớn. Vui lòng liên hệ nhà hàng để biết thêm chi tiết.',
          400
        )
      );
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
        status: 'Còn trống',
      }).sort({ capacity: 1 });
    }
    if (!tables || tables.length === 0) {
      tables = await Table.find({
        capacity: tableCapacity,
        status: 'Còn trống',
      }).sort({ capacity: 1 });
    }

    if (!tables || tables.length === 0) {
      return next(
        new ErrorHandler(
          'Hiện tại không còn bàn phù hợp. Vui lòng thử lại vào thời gian khác hoặc liên hệ nhà hàng để biết thêm chi tiết.',
          400
        )
      );
    }

    let availableTable;
    for (const table of tables) {
      const isTableReserved = await TableReservation.exists({
        tableId: table.id_table,
        reservationDate: reservationDateTime.toDate(),
      });
      if (!isTableReserved) {
        availableTable = table;
        break;
      }
    }

    if (!availableTable) {
      return next(new ErrorHandler('Bàn đã được đặt chỗ cho thời gian này. Vui lòng chọn thời gian khác.', 400));
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
    await availableTable.save();

    // Lên lịch thay đổi trạng thái bàn vào đúng ngày và giờ đến
    schedule.scheduleJob(reservationDateTime.toDate(), async function () {
      const tableToUpdate = await Table.findOne({ id_table: availableTable.id_table });
      console.log(`Bàn ${availableTable.id_table} đã được đặt chỗ.`);
      tableToUpdate.status = deposit ? 'Đã đặt cọc' : 'Chưa đặt cọc';
      await tableToUpdate.save()
      console.log(
        `Bàn ${availableTable.id_table} đã được cập nhật sang trạng thái '${tableToUpdate.status}'.`
      );
    });

    const cancelTime = reservationDateTime.clone().add(3, 'minutes').toDate();
    console.log('Thời điểm đặt bàn:', reservationDateTime.toDate());
    console.log('Thời điểm hủy bàn:', cancelTime);

    // Lên lịch hủy đơn sau 3 phút
    schedule.scheduleJob(cancelTime, async function () {
      const reservation = await Reservation.findById(savedReservation._id);
      if (reservation && reservation.status === 'Đang hoạt động') {
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
      status: joi.string()
        .required()
        .valid('Đang hoạt động', 'Đã hủy')
        .messages({
          'string.empty': 'Trạng thái đơn đặt bàn không được để trống!',
          'any.only': "Trạng thái phải là 'Đang hoạt động' hoặc 'Đã hủy'",
        }),
    });

    const { error } = editSchema.validate({ status });
    if (error) {
      return res.status(400).json({
        error: error.details.map((e) => e.message),
      });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt bàn này!' });
    }

    const originalStatus = reservation.status;
    reservation.status = status;
    await reservation.save();

    const tableId = reservation.table;
    let tableStatus;

    if (originalStatus === 'Đang hoạt động' && status === 'Đã hủy') {
      tableStatus = 'Còn trống';
    } else if (originalStatus === 'Đã hủy' && status === 'Đang hoạt động') {
      tableStatus = 'Đang sử dụng';
    }

    const updatedTable = await Table.findOneAndUpdate(
      { id_table: tableId },
      { status: tableStatus },
      { new: true }
    );

    if (!updatedTable) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bàn này!' });
    }

    return res.status(200).json({ message: 'Cập nhật đơn đặt bàn thành công.' });

  } catch (error) {
    console.error('Lỗi khi cập nhật đơn đặt bàn:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật đơn đặt bàn.' });
  }
};
