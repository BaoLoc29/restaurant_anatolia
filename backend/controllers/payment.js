import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Reservation } from '../models/reservation.js';
import { FailedTransaction } from '../models/failedTransaction.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const frontend_url = "http://localhost:5173";
const success_url = `${frontend_url}/success`;
const cancel_url = `${frontend_url}/payment-cancel`;

const createCheckoutSession = async (req, res) => {
    const { name, email, phone, date, time, guests, notes, deposit } = req.body;
    console.log("Nhận dữ liệu:", { name, email, phone, date, time, guests, notes, deposit });

    try {
        if (deposit) {
            const line_items = [{
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: 'Đặt cọc'
                    },
                    unit_amount: 200000,
                },
                quantity: 1,
            }];

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url,
                cancel_url,
                metadata: {
                    name,
                    email,
                    phone,
                    date,
                    time,
                    guests,
                    notes,
                    deposit: "true"
                },
            });

            console.log("Phiên Stripe được tạo:", session.url);
            res.json({ success: true, session_url: session.url });
        } else {
            const newReservation = new Reservation({
                name,
                email,
                phone,
                date,
                time,
                guests,
                notes,
                table,
                status: "Đã đặt trước",
                deposit: false,
                depositAmount: 0,
            });
            await newReservation.save();
            console.log("Lưu đặt chỗ thành công!");

            res.json({ success: true, message: 'Đặt chỗ thành công!' });
        }
    } catch (error) {
        console.error("Lỗi trong quá trình tạo phiên thanh toán:", error);
        res.status(500).json({ success: false, message: 'Lỗi tạo đặt chỗ hoặc phiên thanh toán' });
    }
};

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Xác minh sự kiện:", event);
    } catch (err) {
        console.log(`⚠️  Xác minh chữ ký webhook thất bại.`, err.message);
        return res.sendStatus(400);
    }

    switch (event.type) {
        case 'checkout.session.completed':
            await handlePaymentSuccess(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
        default:
            console.log(`Loại sự kiện không xử lý: ${event.type}`);
    }

    res.status(200).end();
};

const handlePaymentSuccess = async (session) => {
    const { name, email, phone, date, time, guests, notes } = session.metadata;

    try {
        const newReservation = new Reservation({
            name,
            email,
            phone,
            date,
            time,
            guests,
            notes,
            table,
            status: "Đã đặt trước",
            deposit: true,
            depositAmount: 200000,
        });
        await newReservation.save();
        console.log("Lưu đặt chỗ thành công sau khi thanh toán.");
    } catch (error) {
        console.error("Lỗi lưu đặt chỗ sau khi thanh toán:", error);
    }
};

const handlePaymentFailed = async (session) => {
    console.log("Phiên thanh toán thất bại:", JSON.stringify(session, null, 2));

    const { metadata, last_payment_error } = session;
    const payment_method = last_payment_error ? last_payment_error.payment_method : null;

    if (!payment_method) {
        console.error("Không thể lấy thông tin phương thức thanh toán.");
        return;
    }

    const { billing_details } = payment_method;
    const email = billing_details.email || "Null";
    const name = billing_details.name || "Null";
    const phone = metadata.phone || "Null";
    const date = metadata.date || "Null";
    const time = metadata.time || "Null";
    const guests = metadata.guests || 0;
    const notes = metadata.notes || "";

    try {
        const failedTransaction = new FailedTransaction({
            name,
            email,
            phone,
            date,
            time,
            guests,
            notes,
            deposit: false, // Đặt cọc không thành công nên đánh dấu là false
            depositAmount: 0, // Không có số tiền cọc đã đặt
            status: "Thanh toán thất bại",
            createdAt: new Date(),
            payment_failure_code: last_payment_error ? last_payment_error.code : "Không xác định",
            payment_failure_message: last_payment_error ? last_payment_error.message : "Không xác định",
        });

        await failedTransaction.save();
        console.log("Lưu trữ giao dịch thất bại thành công.");
    } catch (error) {
        console.error("Lỗi khi lưu đặt chỗ sau khi thanh toán thất bại:", error.message);
    }
};

export { createCheckoutSession, handleStripeWebhook };
