import { TableReservation } from '../models/tableReservation.js';
import Menu from '../models/menu.js';

const formatCreatedAt = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const orderFood = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { dishes } = req.body;

        // Kiểm tra đầu vào dishes
        if (!Array.isArray(dishes) || dishes.length === 0) {
            return res.status(400).json({ success: false, message: "Dishes phải là một mảng không rỗng." });
        }

        const tableReservation = await TableReservation.findOne({ reservationId });

        if (!tableReservation || tableReservation.statusReservation === "Đã hủy") {
            return res.status(404).json({ success: false, message: "Đơn đặt hàng không tồn tại hoặc đã bị hủy." });
        }

        // Lấy thông tin món ăn từ model Menu
        const menuDishes = await Menu.find({ code: { $in: dishes.map(dish => dish.code) } });

        if (!menuDishes.length) {
            return res.status(404).json({ success: false, message: "Không tìm thấy món ăn nào." });
        }

        // Thêm từng món vào đơn đặt hàng và tính tổng tiền
        dishes.forEach(dish => {
            const menuDish = menuDishes.find(m => m.code === dish.code);
            if (menuDish) {
                tableReservation.dishes.push({
                    dishName: menuDish.name,
                    price: menuDish.price,
                    quantity: dish.quantity,
                    totalPerDish: menuDish.price * dish.quantity
                });
            }
        });

        // Tính tổng tiền của đơn đặt hàng
        let totalAmount = 0;
        tableReservation.dishes.forEach(dish => {
            totalAmount += dish.totalPerDish;
        });
        tableReservation.totalAmount = totalAmount;

        await tableReservation.save();

        return res.status(200).json({ success: true, message: "Đã thêm các món vào đơn đặt hàng và tính tổng tiền thành công.", tableReservation });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getPagingOrder = async (req, res) => {
    try {
        const query = req.query
        const orders = await TableReservation.find({ statusReservation: "Đang hoạt động" })
            .skip(query.pageSize * query.pageIndex - query.pageSize)
            .limit(query.pageSize).sort({ createdAt: "desc" })

        const countOrderFood = await TableReservation.countDocuments()
        const totalPage = Math.ceil(countOrderFood / query.pageSize)

        const formattedOrderFood = orders.map(order => ({
            ...order.toObject(),
            createdAt: formatCreatedAt(order.createdAt)
        }));

        return res.status(200).json({ success: true, orders: formattedOrderFood, totalPage, count: countOrderFood })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
export const searchOrder = async (req, res) => {
    try {
        const { tableId } = req.body;

        if (!tableId) {
            return res.status(400).json({ success: false, message: "Mã bàn không hợp lệ! Vui lòng kiểm tra lại!" });
        }
        const searchField = {
            tableId: { $regex: tableId + '$', $options: 'i' },
            statusReservation: "Chưa thanh toán"
        };

        const tableReservations = await TableReservation.find(searchField);

        if (!tableReservations || tableReservations.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm tấy mã bàn cần tìm!" });
        }

        return res.status(200).json({ success: true, tableReservations });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
