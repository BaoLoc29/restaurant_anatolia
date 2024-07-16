import Stripe from 'stripe';
import dotenv from 'dotenv';
import moment from 'moment';
import { Reservation } from '../models/reservation.js';
import { TableReservation } from '../models/tableReservation.js';
import Table from '../models/table.js';
import { scheduleCancellation } from '../middlewares/cancellation.js';
import { scheduleDepositUpdate } from '../middlewares/depositUpdate.js';

// Reuse extracted functions
const synonymKeywords = {
    "Cạnh cửa sổ": ["gần cửa sổ", "sát cửa sổ", "view đẹp"],
    "Ngoài trời": ["cảnh đẹp", "thoáng mát", "ngắm cảnh", "view đẹp"],
};

const findMatchingKeywords = (notes) => {
    let matchingKeywords = [];
    const normalizedNotes = notes.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    for (const [key, value] of Object.entries(synonymKeywords)) {
        const normalizedKeywords = value.map(keyword => keyword.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));
        if (normalizedKeywords.some(keyword => normalizedNotes.includes(keyword))) {
            matchingKeywords.push(key);
        }
    }
    return matchingKeywords;
};

const checkReservationTime = (date, time) => {
    const reservationDateTime = moment(`${date}T${time}`);
    const now = moment();
    const isToday = reservationDateTime.isSame(now, 'day');

    if (isToday && reservationDateTime.isBefore(now)) {
        throw new Error('Thời gian đặt chỗ phải từ thời điểm hiện tại trở đi đối với ngày hiện tại.');
    }
    const reservationTime = moment(time, 'HH:mm');
    const reservationDeadline = moment(date).set({ hour: 23, minute: 0 }).subtract(15, 'minutes');

    if (reservationDateTime.isSameOrAfter(reservationDeadline)) {
        throw new Error('Chúng tôi không thể nhận đơn đặt bàn cho thời gian này! Vui lòng đặt lại vào thời gian khác!');
    }
    return reservationDateTime;
};

const getTableCapacity = (guests) => {
    if (guests >= 1 && guests <= 2) return 2;
    if (guests >= 3 && guests <= 4) return 4;
    if (guests >= 5 && guests <= 8) return 8;
    if (guests >= 9 && guests <= 12) return 12;
    throw new Error('Số lượng khách quá lớn. Vui lòng liên hệ nhà hàng để biết thêm chi tiết!');
};

const findAvailableTable = async (reservationDateTime, tableCapacity, notes) => {
    let tables = [];
    if (notes) {
        const matchingKeywords = findMatchingKeywords(notes);
        tables = await Table.find({
            capacity: tableCapacity,
            $or: [
                { location: { $regex: notes, $options: 'i' } },
                { location: { $in: matchingKeywords } },
            ],
        }).sort({ capacity: 1 });
    }
    if (!tables.length) {
        tables = await Table.find({ capacity: tableCapacity }).sort({ capacity: 1 });
    }
    if (!tables.length) {
        throw new Error('Hiện tại không còn bàn phù hợp. Vui lòng liên hệ nhà hàng để biết thêm chi tiết!');
    }

    for (const table of tables) {
        const fifteenMinutesBefore = reservationDateTime.clone().subtract(15, 'minutes').toDate();
        const fifteenMinutesAfter = reservationDateTime.clone().add(15, 'minutes').toDate();
        const isTableReserved = await TableReservation.exists({
            tableId: table.id_table,
            reservationDate: {
                $gte: fifteenMinutesBefore,
                $lte: fifteenMinutesAfter,
            },
        });
        if (!isTableReserved) return table;
    }
    throw new Error('Hiện tại không còn bàn phù hợp. Vui lòng thử lại hoặc liên hệ nhà hàng để biết thêm chi tiết.');
};

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const frontend_url = "http://localhost:5173";
const success_url = `${frontend_url}/success`;
const cancel_url = `${frontend_url}/payment-cancel`;

const createCheckoutSession = async (req, res) => {
    const { name, email, phone, date, time, guests, notes, deposit } = req.body;
    console.log("Received data:", { name, email, phone, date, time, guests, notes, deposit });

    try {
        const reservationDateTime = checkReservationTime(date, time);
        const tableCapacity = getTableCapacity(guests);
        const availableTable = await findAvailableTable(reservationDateTime, tableCapacity, notes);

        const newReservation = new Reservation({
            name,
            email,
            phone,
            date: reservationDateTime,
            time,
            guests,
            notes,
            table: availableTable.id_table,
            status: "Chờ đặt cọc",
            deposit: deposit || false,
            depositAmount: deposit ? 200000 : 0,
        });

        const savedReservation = await newReservation.save();

        const newTableReservation = new TableReservation({
            reservationId: savedReservation._id,
            tableId: availableTable.id_table,
            reservationDate: reservationDateTime,
            reservationTime: time,
            statusReservation: savedReservation.status,
            deposit: savedReservation.deposit,
            depositAmount: savedReservation.depositAmount,
        });
        await newTableReservation.save();

        await scheduleCancellation(reservationDateTime, savedReservation);

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
                success_url: `${success_url}?reservationId=${savedReservation._id}`,
                cancel_url: `${cancel_url}?reservationId=${savedReservation._id}`,
                metadata: {

                    reservationId: savedReservation._id.toString(),
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

            console.log("Stripe session created:", session.url);
            res.json({ success: true, session_url: session.url });
        } else {
            console.log("Reservation saved successfully without deposit.");
            res.json({ success: true, message: 'Reservation created successfully' });
        }


    } catch (error) {
        console.error("Error during checkout session creation:", error);
        res.status(500).json({ success: false, message: 'Error creating reservation or session' });
    }
};


const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Sự kiện được xác minh:", event);
    } catch (err) {
        console.error(`⚠️  Xác minh chữ ký webhook thất bại:`, err.message);
        return res.sendStatus(400);
    }

    console.log("Sự kiện nhận được:", JSON.stringify(event, null, 2));

    switch (event.type) {
        case 'checkout.session.completed':
            await handlePaymentSuccess(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
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
            reservation.status = "Đã đặt trước";
            await reservation.save();
            console.log("Reservation updated successfully after payment.");

            const tableReservation = await TableReservation.findOne({ reservationId });
            if (tableReservation) {
                tableReservation.statusReservation = "Đã đặt trước";
                await tableReservation.save();
            }

            const reservationDateTime = moment(reservation.date);
            const availableTable = await Table.findOne({ id_table: reservation.table });
            await scheduleDepositUpdate(reservationDateTime, availableTable, reservation);
        } else {
            console.error("Reservation not found:", reservationId);
        }
    } catch (error) {
        console.error("Error updating reservation after payment:", error);
    }
};

const handlePaymentFailed = async (session) => {
    const reservationId = session.metadata.reservationId;

    try {
        const reservation = await Reservation.findById(reservationId);
        if (reservation) {
            reservation.status = "Đặt cọc thất bại";
            await reservation.save();
            console.log("Reservation updated with payment failed status.");

            const tableReservation = await TableReservation.findOne({ reservationId });
            if (tableReservation) {
                tableReservation.statusReservation = "Đặt cọc thất bại";
                await tableReservation.save();
            }
        } else {
            console.error("Reservation not found:", reservationId);
        }
    } catch (error) {
        console.error("Error updating reservation after payment failure:", error.message);
    }
};


export { createCheckoutSession, handleStripeWebhook };