import schedule from 'node-schedule';
import Table from "../models/table.js"

export const scheduleDepositUpdate = async (reservationDateTime, availableTable, savedReservation) => {
    try {
        schedule.scheduleJob(reservationDateTime.toDate(), async function () {
            const tableToUpdate = await Table.findOne({ id_table: availableTable.id_table });
            if (tableToUpdate.status !== 'Đang sử dụng') {
                tableToUpdate.status = savedReservation.deposit ? 'Đã đặt cọc' : 'Chưa đặt cọc';
                await tableToUpdate.save();
            }
        });
    } catch (error) {
        console.error('Lỗi trong khi lên lịch cập nhật đặt cọc:', error);
    }
};