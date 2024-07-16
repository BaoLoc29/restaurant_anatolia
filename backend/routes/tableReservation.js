import express from "express";
import { getOrderById, getPagingOrder, orderFood, searchOrder, statistics } from '../controllers/tableReservation.js';
const router = express.Router();

router.post("/order-food/:reservationId", orderFood)
router.get("/revenue-statistics", statistics)
router.get("/get-detail-order/:reservationId", getOrderById)
// router.delete("/delete-order/:reservationId", deleteOrderFood)
router.get("/get-order-food", getPagingOrder)
router.post("/search-order", searchOrder)

export default router;