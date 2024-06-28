import connectToDb from "./db/index.js";
import express from "express";
import route from "./routes/index.js";
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser";
import { errorMiddleware } from "./middlewares/error.js";
import { handleStripeWebhook } from './controllers/payment.js';

const app = express();

dotenv.config()

app.use(express.json());

app.use(cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:3000"],
    credentials: true,
}));

// Middleware để xử lý raw body cho webhook Stripe
app.post("/payment/webhook", bodyParser.raw({ type: "application/json" }), handleStripeWebhook);

// Sử dụng body-parser để xử lý JSON và x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(route)
app.use(errorMiddleware);

connectToDb()
const PORT = 4000

app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`)
})