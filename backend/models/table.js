import mongoose from "mongoose";

const Table = new mongoose.Schema({
    id_table: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "Còn trống",
        enum: ['Còn trống', 'Đã đặt cọc', 'Chưa đặt cọc', 'Đang sử dụng'],
    },
}, { timestamps: true })
export default mongoose.model("tables", Table)