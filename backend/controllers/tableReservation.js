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

        const menuDishes = await Menu.find({ code: { $in: dishes.map(dish => dish.code) } });
        if (!menuDishes.length) {
            return res.status(404).json({ success: false, message: "Không tìm thấy món ăn nào." });
        }

        // Lưu các món ăn hiện tại để kiểm tra xem có món nào cần cập nhật không
        const currentDishes = new Map(tableReservation.dishes.map(dish => [dish.code, dish]));

        const newDishes = [];
        // Cập nhật hoặc thêm món ăn vào danh sách tạm thời và tính tổng tiền
        dishes.forEach(dish => {
            const menuDish = menuDishes.find(m => m.code === dish.code);
            if (menuDish) {
                if (currentDishes.has(dish.code)) {
                    // Nếu món ăn đã tồn tại, cập nhật số lượng và tổng tiền
                    const existingDish = currentDishes.get(dish.code);
                    existingDish.quantity += dish.quantity;
                    existingDish.totalPerDish = menuDish.price * existingDish.quantity;
                } else {
                    // Nếu món ăn chưa tồn tại, thêm mới vào danh sách newDishes
                    newDishes.push({
                        dishName: menuDish.name,
                        price: menuDish.price,
                        quantity: dish.quantity,
                        totalPerDish: menuDish.price * dish.quantity,
                        code: menuDish.code
                    });
                }
            }
        });

        // Cập nhật lại danh sách món ăn hiện tại
        tableReservation.dishes = Array.from(currentDishes.values()).concat(newDishes);

        // Cập nhật tổng tiền
        let totalAmount = 0;
        tableReservation.dishes.forEach(dish => {
            totalAmount += dish.totalPerDish;
        });

        // Trừ đi số tiền đặt cọc
        let depositAmount = tableReservation.depositAmount || 0;
        if (tableReservation.deposit && totalAmount >= depositAmount) {
            totalAmount -= depositAmount;
        }

        // Tính toán giá trị paid
        let paid;
        if (totalAmount < depositAmount) {
            paid = totalAmount;
        } else {
            paid = totalAmount + depositAmount;
        }

        tableReservation.totalAmount = totalAmount;
        tableReservation.paid = paid;
        await tableReservation.save();

        return res.status(200).json({ success: true, message: "Đã cập nhật số lượng món vào đơn đặt hàng và tính tổng tiền thành công.", paid, tableReservation });
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
        const { startYear, endYear } = req.query;

        if (!startYear || !endYear) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ startYear và endYear" });
        }

        const totalRevenueByYear = await TableReservation.aggregate([
            {
                $match: {
                    // Đổi status thành "Đã thanh toán"
                    status: "Đã thanh toán",
                    reservationDate: {
                        $gte: new Date(startYear, 0, 1), // Từ ngày 1 tháng 1 của startYear
                        $lt: new Date(endYear + 1, 0, 1) // Đến ngày 1 tháng 1 của endYear + 1
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$reservationDate" },
                        month: { $month: "$reservationDate" }
                    },
                    total: { $sum: "$paid" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 } // Sắp xếp kết quả theo năm và tháng tăng dần
            }
        ]);

        // Tạo mảng chứa tất cả các tháng từ 1 đến 12 cho hai năm startYear và endYear
        const allMonths = [];
        for (let year of [parseInt(startYear), parseInt(endYear)]) {
            for (let month = 1; month <= 12; month++) {
                allMonths.push({ year, month, total: 0 });
            }
        }

        // Mảng chứa các từ viết tắt của tháng trong tiếng Anh
        const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Kết hợp kết quả từ aggregate với mảng allMonths và đổi tháng thành từ viết tắt
        const result = allMonths.map(monthObj => {
            const monthData = totalRevenueByYear.find(data => data._id.year === monthObj.year && data._id.month === monthObj.month);
            const monthName = monthAbbreviations[monthObj.month - 1];
            return {
                month: monthName,
                year: monthObj.year,
                total: monthData ? monthData.total : 0
            };
        });

        // Tạo cấu trúc kết quả cuối cùng nhóm theo năm và tháng
        const finalResult = {};
        result.forEach(item => {
            if (!finalResult[item.month]) {
                finalResult[item.month] = {};
            }
            finalResult[item.month][item.year] = item.total;
        });

        // Đảm bảo mỗi tháng có đủ dữ liệu của cả hai năm
        Object.keys(finalResult).forEach(month => {
            for (let year of [parseInt(startYear), parseInt(endYear)]) {
                if (!finalResult[month][year]) {
                    finalResult[month][year] = 0;
                }
            }
        });

        // Trả về kết quả trong JSON response
        return res.status(200).json({ success: true, totalRevenueByYear: finalResult });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getTop3Dishes = async (req, res) => {
    try {
        const topDishes = await TableReservation.aggregate([
            { $unwind: "$dishes" },
            {
                $group: {
                    _id: "$dishes.dishName",
                    totalQuantity: { $sum: "$dishes.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 3 }
        ]);

        return res.status(200).json({ success: true, topDishes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteOrder = async (req, res) => {
    try {
        const { reservationId, dishCode } = req.params;

        // Tìm đơn đặt bàn bằng reservationId
        const tableReservation = await TableReservation.findOne({ reservationId });
        if (!tableReservation || tableReservation.statusReservation === "Đã thanh toán") {
            return res.status(404).json({ success: false, message: "Đơn đặt hàng không tồn tại!" });
        }

        // Tìm và xóa món ăn bằng dishCode
        const dishIndex = tableReservation.dishes.findIndex(dish => dish.code === dishCode);
        if (dishIndex === -1) {
            return res.status(404).json({ success: false, message: "Không tìm thấy món ăn!" });
        }
        tableReservation.dishes.splice(dishIndex, 1);

        // Cập nhật tổng tiền
        let totalAmount = 0;
        tableReservation.dishes.forEach(dish => {
            totalAmount += dish.totalPerDish;
        });

        // Trừ đi số tiền đặt cọc
        let depositAmount = tableReservation.depositAmount || 0;
        if (tableReservation.deposit && totalAmount >= depositAmount) {
            totalAmount -= depositAmount;
        }

        // Tính toán giá trị paid
        let paid;
        if (totalAmount < depositAmount) {
            paid = totalAmount;
        } else {
            paid = totalAmount + depositAmount;
        }

        tableReservation.totalAmount = totalAmount;
        tableReservation.paid = paid;
        await tableReservation.save();

        // Trả về phản hồi thành công
        res.status(200).json({ success: true, message: "Xóa món ăn thành công!", tableReservation });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}