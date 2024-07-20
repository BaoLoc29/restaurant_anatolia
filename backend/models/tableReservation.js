import mongoose from "mongoose";
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
    },
    statusReservation: {
        type: String,
        required: true
    },
    deposit: {
        type: Boolean,
        required: true,
    },
    depositAmount: {
        type: Number,
        required: function () {
            return this.deposit;
        },
        min: [0, "Số tiền đặt cọc không thể nhỏ hơn 0."]
    },
    status: {
        type: String,
        required: true,
        default: "Chưa thanh toán"
    },
    dishes: [{
        dishName: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        totalPerDish: {
            type: Number,
            required: true
        },
        code: {
            type: String,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    paid: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

export const TableReservation = mongoose.model("TableReservation", TableReservationSchema);
