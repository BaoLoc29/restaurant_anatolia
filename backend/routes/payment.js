import express from "express";
import { createCheckoutSession, handleStripeWebhook } from '../controllers/payment.js';

const router = express.Router();

// Đường dẫn để tạo phiên thanh toán

router.post("/create-checkout-session", createCheckoutSession);
router.post('/webhook', handleStripeWebhook);
export default router;