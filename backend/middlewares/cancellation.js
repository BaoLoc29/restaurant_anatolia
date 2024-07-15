import { Reservation } from "../models/reservation.js";
import { TableReservation } from "../models/tableReservation.js"
import Table from "../models/table.js"
import schedule from 'node-schedule';

export const scheduleCancellation = async (reservationDateTime, savedReservation) => {
    try {
        schedule.scheduleJob(reservationDateTime.clone().add(3, 'minutes').toDate(), async function () {
            const reservation = await Reservation.findById(savedReservation._id);
            if (reservation && reservation.status === 'Đã đặt trước') {
                reservation.status = 'Đã hủy';
                await reservation.save();
                const tableToUpdate = await Table.findOne({ id_table: reservation.table });
                if (tableToUpdate) {
                    tableToUpdate.status = 'Còn trống';
                    await tableToUpdate.save();
                }
                console.log(`Đơn đặt chỗ ${savedReservation._id} đã bị hủy tự động.`);
                // Cập nhật trạng thái trong bảng phụ (TableReservation)
                const tableReservation = await TableReservation.findOne({ reservationId: savedReservation._id });
                if (tableReservation) {
                    tableReservation.statusReservation = 'Đã hủy';
                    await tableReservation.save();
                    console.log(`Đã cập nhật trạng thái trong bảng phụ(TableReservation) cho đơn đặt chỗ ${savedReservation._id}.`);
                }
            }
        });
    } catch (error) {
        console.error('Lỗi trong khi lên lịch hủy đặt chỗ tự động:', error);
    }
};