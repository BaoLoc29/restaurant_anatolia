import express from 'express';
import { createAdminCheckoutSession, handleStripe } from '../controllers/adminPayment.js';

const router = express.Router();

router.post('/create-checkout-session', createAdminCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripe);

export default router;