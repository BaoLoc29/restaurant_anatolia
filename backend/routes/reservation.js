import express from "express";
import { editReservation, getPagingReservation, send_reservation } from '../controllers/reservation.js';

const router = express.Router();

router.post("/send", send_reservation);
router.get("/get-paging-reservation", getPagingReservation)
router.post("/:id", editReservation)
export default router;