import express from "express";
import { deleteOrder, getOrderById, getPagingOrder, getTop3Dishes, orderFood, searchOrder, statistics } from '../controllers/tableReservation.js';
const router = express.Router();

router.get("/revenue-statistics", statistics)
router.get('/top-dishes', getTop3Dishes);
router.get("/get-detail-order/:reservationId", getOrderById)
router.get("/get-order-food", getPagingOrder)
router.post("/order-food/:reservationId", orderFood)
router.post("/search-order", searchOrder)
router.delete("/delete-order/:reservationId/:dishCode", deleteOrder)


export default router;