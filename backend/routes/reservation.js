import express from "express";
import { editReservation, getOrderByDate, getOrders, getPagingReservation, send_reservation } from '../controllers/reservation.js';
const router = express.Router();

router.post("/send", send_reservation);
router.get("/get-paging-reservation", getPagingReservation)
router.put("/:id", editReservation)
router.get("/get-orders", getOrders)
router.get("/get-order-by-date", getOrderByDate)
export default router;