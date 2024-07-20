import express from "express";
import {
    editReservation,
    getAllReservation,
    getOrderByDate,
    getOrders,
    getPagingReservation,
    getReservationDetails,
    searchOrderByPhone,
    send_reservation
} from '../controllers/reservation.js';
const router = express.Router();

router.post("/send", send_reservation);
router.get("/get-paging-reservation", getPagingReservation)
router.put("/:id", editReservation)
router.get('/details/:id', getReservationDetails);
router.get("/get-orders", getOrders)
router.get("/get-all-reservation", getAllReservation)
router.get("/get-order-by-date", getOrderByDate)
router.post("/search-reservation", searchOrderByPhone)
export default router;