import express from "express";
import { getPagingOrder, orderFood, searchOrder } from '../controllers/tableReservation.js';
const router = express.Router();

router.post("/order-food/:reservationId", orderFood)
router.get("/get-order-food", getPagingOrder)
router.post("/search-order", searchOrder)
export default router;