import express from "express";
import userRouter from "./user.js"
import menuRouter from "./menu.js"
import tableRouter from "./table.js"
import reservationRouter from "./reservation.js"

const router = express.Router()
router.use("/user", userRouter)
router.use("/menu", menuRouter)
router.use("/table", tableRouter)
router.use("/reservation",reservationRouter)
export default router