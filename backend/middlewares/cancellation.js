import { Reservation } from "../models/reservation.js";
import { TableReservation } from "../models/tableReservation.js"
import Table from "../models/table.js"
import schedule from 'node-schedule';

export const scheduleCancellation = async (reservationDateTime, savedReservation) => {
    try {

        let cancelTime = reservationDateTime.clone().add(3, 'minutes').toDate();
        if (savedReservation.deposit) {
            cancelTime = reservationDateTime.clone().add(4, 'minutes').toDate();
        }

        schedule.scheduleJob(cancelTime, async function () {
            const reservation = await Reservation.findById(savedReservation._id);
            if (reservation && reservation.status === 'Đã đặt trước' || reservation.status === 'Chờ đặt cọc') {
                reservation.status = 'Đã hủy';
                await reservation.save();
                const tableToUpdate = await Table.findOne({ id_table: reservation.table });
                if (tableToUpdate) {
                    tableToUpdate.status = 'Còn trống';
                    await tableToUpdate.save();
                }
                const tableReservation = await TableReservation.findOne({ reservationId: savedReservation._id });
                if (tableReservation) {
                    tableReservation.statusReservation = 'Đã hủy';
                    await tableReservation.save();
                }
            }
        });
    } catch (error) {
        console.error('Lỗi trong khi lên lịch hủy đặt chỗ tự động:', error);
    }
};