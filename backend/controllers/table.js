import Table from "../models/table.js"
import joi from "joi"
import moment from 'moment';
const formatCreatedAt = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const createTable = async (req, res) => {
    try {
        const { capacity, location } = req.body

        const createSchema = joi.object({
            capacity: joi.number().required().messages({
                'any.required': 'Sức chứa của bàn không được để trống!',
            }),
            location: joi.string().valid('Cạnh cửa sổ', 'Ngoài trời', 'Trung tâm').required().messages({
                'string.empty': 'Vị trí bàn không được để trống!',
                'any.only': "Vị trí phải là Cạnh cửa sổ, Ngoài trời hoặc Trung tâm",
            })
        });

        const { error } = createSchema.validate({ capacity, location });
        if (error) {
            return res.status(400).json({
                error: error.details.map(e => e.message)
            });
        }

        // thêm tiền tố
        let prefix;
        if (location === 'Cạnh cửa sổ') {
            prefix = 'A';
        } else if (location === 'Ngoài trời') {
            prefix = 'B';
        } else if (location === 'Trung tâm') {
            prefix = 'C';
        } else {
            return res.status(400).json({ message: "Vị trí bàn không hợp lệ!" });
        }

        const latestTable = await Table.findOne({ id_table: new RegExp(`^${prefix}`) }).sort({ id_table: -1 }).exec();
        let newIdTable;
        if (latestTable && latestTable.id_table) {
            // Tách số ra khỏi chữ và tăng lên 1
            const numericPart = parseInt(latestTable.id_table.slice(1)) + 1;
            newIdTable = `${prefix}${numericPart.toString().padStart(3, '0')}`;
        } else {
            newIdTable = `${prefix}001`;
        }

        const result = await Table.create({
            id_table: newIdTable,
            capacity,
            location
        });

        return res.status(200).json({
            message: "Tạo bàn thành công.",
            table: {
                ...result.toObject(),
                createdAt: formatCreatedAt(result.createdAt)
            }
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const editTable = async (req, res) => {
    try {
        const { id } = req.params;
        const { capacity, location, status } = req.body;

        const editSchema = joi.object({
            capacity: joi.number().required().messages({
                'any.required': 'Sức chứa của bàn không được để trống!',
            }),
            location: joi.string().valid('Cạnh cửa sổ', 'Ngoài trời', 'Trung tâm').required().messages({
                'string.empty': 'Vị trí bàn không được để trống!',
                'any.only': "Vị trí phải là Cạnh cửa sổ, Ngoài trời hoặc Trung tâm",
            }),
            status: joi.string().required().valid('Còn trống', 'Đang sử dụng', 'Đã đặt cọc', 'Chưa đặt cọc').messages({
                'string.empty': 'Trạng thái bàn không được để trống!',
                'any.only': "Trạng thái phải là Còn trống, Đang sử dụng, Đã đặt cọc hoặc Chưa đặt cọc",
            })
        })
        const { error } = editSchema.validate({ capacity, location, status });
        if (error) {
            return res.status(400).json({
                error: error.details.map(e => e.message)
            });
        }

        const updateTable = await Table.findByIdAndUpdate(id, { capacity, location, status }, { new: true })
        if (!updateTable) {
            return res.status(404).json({ message: "Không tìm thấy bàn." })
        }

        let prefix;
        if (location === 'Cạnh cửa sổ') {
            prefix = 'A';
        } else if (location === 'Ngoài trời') {
            prefix = 'B';
        } else if (location === 'Trung tâm') {
            prefix = 'C';
        } else {
            return res.status(400).json({ message: "Vị trí bàn không hợp lệ!" });
        }

        if ((location === 'Cạnh cửa sổ' && !updateTable.id_table.startsWith('A')) ||
            (location === 'Ngoài trời' && !updateTable.id_table.startsWith('B')) ||
            (location === 'Trung tâm' && !updateTable.id_table.startsWith('C'))) {
            const latestTable = await Table.findOne({ id_table: new RegExp(`^${prefix}`) }).sort({ id_table: -1 }).exec();
            let newIdTable;
            if (latestTable && latestTable.id_table) {
                const numericPart = parseInt(latestTable.id_table.slice(1)) + 1;
                newIdTable = `${prefix}${numericPart.toString().padStart(3, '0')}`;
            } else {
                newIdTable = `${prefix}001`;
            }
            updateTable.id_table = newIdTable;
            await updateTable.save();
        }

        return res.status(200).json({
            message: "Cập nhật bàn thành công.",
            table: {
                ...updateTable.toObject(),
                createdAt: formatCreatedAt(updateTable.createdAt)
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })
    }
}
export const deleteTable = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await Table.findByIdAndDelete(id)
        if (!table) {
            return res.status(400).json({ message: "Không tìm thấy bàn cần tìm!" })
        }
        return res.status(200).json({
            message: "Xóa bàn thành công."
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const getPagingTable = async (req, res) => {
    try {
        const query = req.query
        const tables = await Table.find()
            .skip(query.pageSize * query.pageIndex - query.pageSize)
            .limit(query.pageSize).sort({ createdAt: "desc" })

        const countTables = await Table.countDocuments()
        const totalPage = Math.ceil(countTables / query.pageSize)

        const formattedTables = tables.map(table => ({
            ...table.toObject(),
            createdAt: formatCreatedAt(table.createdAt)
        }));

        return res.status(200).json({ tables: formattedTables, totalPage, count: countTables })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const getTableById = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await Table.findById(id)
        if (!table) {
            return res.status(400).json({ message: "Không tìm thấy bàn cần tìm!" })
        }
        return res.status(200).json({ table })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const searchTable = async (req, res) => {
    try {
        const { keyword, option } = req.body
        if (!keyword || !option) {
            const noKeyword = await Table.find()
            return res.status(400).json({ noKeyword })
        }
        let searchField = {};
        if (option === "location") {
            searchField = { location: { $regex: keyword, $options: 'i' } };
        } else if (option === "id_table") {
            searchField = { id_table: { $regex: keyword, $options: 'i' } };
        } else {
            return res.status(400).json({ message: "Tùy chọn tìm kiếm không hợp lệ!" });
        }

        const tables = await Table.find({ ...searchField });

        if (!tables || tables.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy loại bàn đó!" });
        }

        const formattedTables = tables.map(table => ({
            ...table.toObject(),
            createdAt: formatCreatedAt(table.createdAt)
        }));

        return res.status(200).json({ tables: formattedTables });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const getTotalTable = async (req, res) => {
    try {
        const totalTable = await Table.countDocuments();

        // Tính ngày hiện tại và ngày của 7 ngày trước
        const sevenDaysAgo = moment().subtract(7, 'days').toDate();

        // Đếm số nhân viên được thêm vào trong 7 ngày gần nhất
        const recentTable = await Table.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        return res.status(200).json({ totalTable, recentTable })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}