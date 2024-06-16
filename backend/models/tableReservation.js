import mongoose from "mongoose";

// Schema TableReservation
const TableReservationSchema = new mongoose.Schema({
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
        required: true
    },
    tableId: {
        type: String,
        ref: "Table",
        required: true
    },
    reservationDate: {
        type: Date,
        required: true
    },
    reservationTime: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const TableReservation = mongoose.model("TableReservation", TableReservationSchema);
