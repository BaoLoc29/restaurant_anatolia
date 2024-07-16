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

        // Cập nhật hoặc thêm món ăn vào đơn đặt hàng và tính tổng tiền
        dishes.forEach(dish => {
            const menuDish = menuDishes.find(m => m.code === dish.code);
            if (menuDish) {
                // Kiểm tra xem món ăn đã có trong danh sách chưa
                const existingDish = tableReservation.dishes.find(d => d.code === dish.code);
                if (existingDish) {
                    // Nếu đã có, cập nhật số lượng
                    existingDish.quantity += dish.quantity;
                    existingDish.totalPerDish = menuDish.price * existingDish.quantity;
                } else {
                    // Nếu chưa có, thêm mới
                    tableReservation.dishes.push({
                        dishName: menuDish.name,
                        price: menuDish.price,
                        quantity: dish.quantity,
                        totalPerDish: menuDish.price * dish.quantity,
                        code: menuDish.code
                    });
                }
            }
        });

        // Cập nhật tổng tiền
        let totalAmount = 0;
        tableReservation.dishes.forEach(dish => {
            totalAmount += dish.totalPerDish;
        });

        // Trừ đi số tiền đặt cọc
        if (tableReservation.deposit) {
            totalAmount -= tableReservation.depositAmount;
        }

        tableReservation.totalAmount = totalAmount;

        await tableReservation.save();

        return res.status(200).json({ success: true, message: "Đã cập nhật số lượng món vào đơn đặt hàng và tính tổng tiền thành công.", tableReservation });
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

        const countOrderFood = await TableReservation.countDocuments({ statusReservation: "Đang hoạt động" })
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
export const getOrderById = async (req, res) => {
    try {
        const { reservationId } = req.params;

        const tableReservation = await TableReservation.findOne({ reservationId });

        if (!tableReservation) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng này!" });
        }

        return res.status(200).json({ success: true, tableReservation })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
export const statistics = async (req, res) => {
    try {
        const yearToQuery = 2024;
        const totalRevenueByYear = await TableReservation.aggregate([
            {
                $match: {
                    status: "Chưa thanh toán",
                    reservationDate: {
                        $gte: new Date(yearToQuery, 0, 1), // Từ ngày 1 tháng 1 năm được chỉ định
                        $lt: new Date(yearToQuery + 1, 0, 1) // Đến ngày 1 tháng 1 năm sau
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$reservationDate" }, // Nhóm theo tháng
                    total: { $sum: "$totalAmount" } // Tính tổng doanh thu từ trường totalAmount
                }
            },
            {
                $sort: { _id: 1 } // Sắp xếp kết quả theo tháng tăng dần
            }
        ]);

        // Tạo mảng chứa tất cả các tháng từ 1 đến 12 với giá trị mặc định là 0
        const allMonths = Array.from({ length: 12 }, (v, i) => ({
            month: i + 1,
            2024: 0
        }));

        // Mảng chứa các từ viết tắt của tháng trong tiếng Anh
        const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Kết hợp kết quả từ aggregate với mảng allMonths và đổi tháng thành từ viết tắt
        const result = allMonths.map(monthObj => {
            const monthData = totalRevenueByYear.find(data => data._id === monthObj.month);
            const monthName = monthAbbreviations[monthObj.month - 1];
            return monthData ? { month: monthName, 2024: monthData.total } : { month: monthName, 2024: 0 };
        });

        // Trả về kết quả trong JSON response
        return res.status(200).json({ success: true, totalRevenueByYear: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

