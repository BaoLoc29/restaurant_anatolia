import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Reservation } from '../models/reservation.js';

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
            // Tạo một đặt bàn mới với trạng thái "đang chờ thanh toán"
            const newReservation = new Reservation({
                name,
                email,
                phone,
                date,
                time,
                guests,
                notes,
                table: "MãBànNàoĐó",
                status: "Đang chờ thanh toán",
                deposit: true,
                depositAmount: 200000,
            });

            // Lưu đặt bàn vào cơ sở dữ liệu
            const savedReservation = await newReservation.save();
            const reservationId = savedReservation._id.toString();

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
                success_url: `${success_url}?reservationId=${reservationId}`,
                cancel_url: `${cancel_url}?reservationId=${reservationId}`,
                metadata: {
                    reservationId,
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

            console.log("Đã tạo phiên Stripe:", session.url);
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
                table: "MãBànNàoĐó",
                status: "Đang hoạt động",
                deposit: false,
                depositAmount: 0,
            });
            await newReservation.save();
            console.log("Đặt chỗ đã được lưu thành công.");

            res.json({ success: true, message: 'Đã tạo đặt bàn thành công' });
        }
    } catch (error) {
        console.error("Lỗi trong quá trình tạo phiên thanh toán:", error);
        res.status(500).json({ success: false, message: 'Lỗi trong quá trình tạo đặt bàn hoặc phiên thanh toán' });
    }
};

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Sự kiện được xác minh:", event);
    } catch (err) {
        console.error(`Xác minh chữ ký webhook thất bại:`, err.message);
        return res.sendStatus(400);
    }

    console.log("Sự kiện nhận được:", JSON.stringify(event, null, 2));

    switch (event.type) {
        case 'checkout.session.completed':
            await handlePaymentSuccess(event.data.object);
            break;
        case 'payment_intent.payment_failed':
        case 'charge.failed':
            await handlePaymentFailed(event.data.object);
            break;
        default:
            console.log(`Loại sự kiện không xử lý ${event.type}`);
    }

    res.status(200).end();
};

const handlePaymentSuccess = async (session) => {
    const reservationId = session.metadata.reservationId;

    try {
        const reservation = await Reservation.findById(reservationId);
        if (reservation) {
            reservation.status = "Thanh toán thành công";
            await reservation.save();
            console.log("Đặt chỗ đã được cập nhật thành công sau khi thanh toán.");
        } else {
            console.error("Không tìm thấy đơn đặt bàn:", reservationId);
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật đặt bàn sau khi thanh toán:", error);
    }
};

const handlePaymentFailed = async (paymentIntent) => {
    const reservationId = paymentIntent.metadata.reservationId;

    try {
        const reservation = await Reservation.findById(reservationId);
        if (reservation) {
            reservation.status = "Thanh toán thất bại";
            await reservation.save();
            console.log("Đặt chỗ đã được cập nhật với trạng thái thanh toán thất bại.");
        } else {
            console.error("Không tìm thấy đặt bàn:", reservationId);
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật đặt bàn sau khi thanh toán thất bại:", error.message);
    }
};

export { createCheckoutSession, handleStripeWebhook };
