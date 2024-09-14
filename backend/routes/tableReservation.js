import express from "express";
import { deleteOrder, getOrderById, getPagingOrder, getTop3Dishes, orderFood, searchOrder, statistics } from '../controllers/tableReservation.js';
const router = express.Router();
import authentication from './../middlewares/authentication.js';

router.get("/revenue-statistics", authentication, statistics)
router.get('/top-dishes', authentication, getTop3Dishes);
router.get("/get-detail-order/:reservationId", authentication, getOrderById)
router.get("/get-order-food", authentication, getPagingOrder)
router.post("/order-food/:reservationId", authentication, orderFood)
router.post("/search-order", authentication, searchOrder)
router.delete("/delete-order/:reservationId/:dishCode", authentication, deleteOrder)


export default router;