import { Reservation } from "../models/reservation.js";
import { TableReservation } from "../models/tableReservation.js"
import Table from "../models/table.js"
import schedule from 'node-schedule';
import moment from 'moment';

export const scheduleCancellation = async (reservationDateTime, savedReservation) => {
    try {

        const runAt = reservationDateTime.clone().add(3, 'minutes');
        const now = moment();

        if (runAt.isBefore(now)) {
            console.log("Không thể đặt lịch trong quá khứ");
            return;
        }

        console.log(`Đặt lịch hủy tự động đơn ${savedReservation._id} vào lúc:`, runAt.format());


        schedule.scheduleJob(runAt.toDate(), async () => {
            try {
                const reservation = await Reservation.findById(savedReservation._id);
                if (reservation && reservation.status === 'Đã đặt trước') {
                    reservation.status = 'Đã hủy';
                    await reservation.save();

                    const table = await Table.findOne({ id_table: reservation.table });
                    if (table) {
                        table.status = 'Còn trống';
                        await table.save();
                    }

                    const tableRes = await TableReservation.findOne({ reservationId: savedReservation._id });
                    if (tableRes) {
                        tableRes.statusReservation = 'Đã hủy';
                        await tableRes.save();
                    }

                    console.log(`Đơn ${savedReservation._id} đã được hủy tự động.`);
                }
            } catch (err) {
                console.error(`Lỗi khi hủy đơn ${savedReservation._id}:`, err.message);
            }
        });
    } catch (error) {
        console.error('Lỗi khi lên lịch hủy:', error.message);
    }
};