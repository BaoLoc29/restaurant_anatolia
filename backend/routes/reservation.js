import express from "express";
import { getPagingReservation, send_reservation } from '../controllers/reservation.js';

const router = express.Router();

router.post("/send", send_reservation);
router.get("/get-paging-reservation", getPagingReservation)

export default router;