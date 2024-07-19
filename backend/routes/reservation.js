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
import authentication from './../middlewares/authentication.js';
import authorization from './../middlewares/authorization.js';
const router = express.Router();

router.post("/send", authentication, send_reservation);
router.get("/get-paging-reservation", authentication, getPagingReservation)
router.put("/:id", authentication, editReservation)
router.get('/details/:id', authentication, getReservationDetails);
router.get("/get-orders", authentication, getOrders)
router.get("/get-all-reservation", authentication, authorization, getAllReservation)
router.get("/get-order-by-date", authentication, getOrderByDate)
router.post("/search-reservation", authentication, searchOrderByPhone)
export default router;