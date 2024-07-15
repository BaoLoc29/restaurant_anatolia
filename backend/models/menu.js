import mongoose from "mongoose";

const Menu = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    classify: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "Còn món"
    },
    imageMenu: {
        type: String,
        required: true
    }

}, { timestamps: true })
export default mongoose.model("menu", Menu)