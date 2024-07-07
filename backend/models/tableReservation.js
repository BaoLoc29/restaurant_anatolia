import mongoose from "mongoose";

// Schema TableReservation
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
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

// Tính tổng tiền cho mỗi món
TableReservationSchema.pre('save', function (next) {
    let totalAmount = 0;
    this.dishes.forEach(dish => {
        dish.totalPerDish = dish.price * dish.quantity;
        totalAmount += dish.totalPerDish;
    });
    this.totalAmount = totalAmount;
    next();
})

export const TableReservation = mongoose.model("TableReservation", TableReservationSchema);
