import express from "express";
import { getOrderById, getPagingOrder, orderFood, searchOrder } from '../controllers/tableReservation.js';
const router = express.Router();

router.post("/order-food/:reservationId", orderFood)
router.get("/get-detail-order/:reservationId", getOrderById)
router.get("/get-order-food", getPagingOrder)
router.post("/search-order", searchOrder)

export default router;