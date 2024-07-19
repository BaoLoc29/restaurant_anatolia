import User from "../models/user.js"
import bcrypt from "bcryptjs"
import joi from "joi"
import jwt from "jsonwebtoken"
import moment from 'moment'
const tokenSecret = 'secret'
const formatCreatedAt = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const login = async (req, res) => {
    const { compareSync } = bcrypt
    try {
        const email = req.body.email
        const password = req.body.password

        const loginSchema = joi.object({
            email: joi.string().email().min(3).max(32).required().messages({
                "string.email": "Định dạng email không hợp lệ!",
                "string.min": "Email phải có ít nhất 3 ký tự!",
                "string.max": "Email không được vượt quá 32 ký tự!"
            }),
            password: joi.string().min(6).max(32).required().messages({
                "string.password": "Định dạng mật khẩu không hợp lệ!",
                "string.min": "Mật khẩu phải có ít nhất 6 ký tự!",
                "string.max": "Mật khẩu không được vượt quá 32 ký tự!"
            }),
        })

        const validate = loginSchema.validate({ email, password })

        if (validate.error) {
            return res.status(400).json({
                error: validate.error.details[0].message
            })
        }
        const findUser = await User.findOne({ email }).lean()
        if (!findUser) {
            return res.status(401).json({
                error: "Không tìm thấy người dùng!"
            })
        }

        const checkPassword = compareSync(password, findUser.password)

        const accessToken = jwt.sign({
            id: findUser._id,
        }, process.env.SECRET_KEY, { expiresIn: '1d' })


        const {
            password: userPassword,
            ...returnUser
        } = findUser

        if (!checkPassword) {
            return res.status(401).json({
                error: "Mật khẩu không chính xác!"
            })
        }
        if (findUser) {
            return res.status(200).json({
                message: "Đăng nhập thành công.",
                user: returnUser,
                accessToken
            })
        }
    } catch (error) {
        console.error(error);
        if (error.details) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        } else {
            return res.status(500).json({ message: "Đăng nhập thất bại" });
        }
    }
}
export const createUser = async (req, res) => {
    const { hashSync, genSaltSync } = bcrypt;
    try {
        const data = req.body;
        const { password, email, role } = data;
        const createSchema = joi.object({
            name: joi.string().required().messages({
                'string.empty': 'Tên người dùng là bắt buộc!',
            }),
            gender: joi.boolean().required().messages({
                'boolean.empty': 'Giới tính là bắt buộc!',
            }),
            phone: joi.string().length(10).required().messages({
                'string.length': 'Số điện thoại phải có 10 chữ số!',
                'any.required': 'Vui lòng nhập số điện thoại của bạn!',
            }),
            email: joi.string().email().required().messages({
                'string.email': 'Email không hợp lệ!',
                'string.empty': 'Email là bắt buộc!',
            }),
            password: joi.string().min(6).required().messages({
                'string.min': 'Mật khẩu phải có ít nhất 6 ký tự!',
                'string.empty': 'Mật khẩu là bắt buộc!',
            }),
            role: joi.string().valid('Quản lý', 'Nhân viên').required().messages({
                'string.empty': 'Vai trò là bắt buộc!',
                'any.only': "Vai trò phải là Quản lý hoặc Nhân viên!",
            }),
        });

        const { error } = createSchema.validate(data);
        if (error) {
            return res.status(400).json({
                error: error.details.map((e) => e.message),
            });
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(400).json({
                message: 'Email người dùng đã được sử dụng. Hãy thử sử dụng email khác!',
            });
        }

        // Xác định tiền tố cho e_code dựa trên vai trò
        let prefix;
        if (role === 'Quản lý') {
            prefix = 'QL';
        } else if (role === 'Nhân viên') {
            prefix = 'NV';
        } else {
            return res.status(400).json({
                message: "Vai trò không hợp lệ. Vai trò phải là 'Quản lý' hoặc 'Nhân viên'!",
            });
        }

        // Tìm người dùng có e_code hiện có cao nhất dựa trên tiền tố
        const latestUser = await User.findOne({ e_code: new RegExp(`^${prefix}`) })
            .sort({ e_code: -1 })
            .exec();
        let newECode;
        if (latestUser && latestUser.e_code) {
            // Tách số ra khỏi chữ và tăng lên 1
            const latestECode = latestUser.e_code;
            const numericPart = parseInt(latestECode.slice(2)) + 1;
            newECode = `${prefix}${numericPart.toString().padStart(3, '0')}`;
        } else {
            newECode = `${prefix}001`;
        }

        const salt = genSaltSync();
        const hashedPassword = hashSync(password, salt);

        const result = await User.create({
            ...data,
            e_code: newECode,
            password: hashedPassword,
        });

        return res.status(200).json({
            message: 'Tạo tài khoản thành công.',
            ...result.toObject(),
            createdAt: formatCreatedAt(result.createdAt),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Tạo tài khoản thất bại!' });
    }
};
export const editUser = async (req, res) => {
    try {
        const { name, gender, phone, email, role } = req.body;
        const { id } = req.params;

        const editSchema = joi.object({
            name: joi.string().required().messages({
                'string.empty': 'Tên người dùng là bắt buộc!'
            }),
            gender: joi.boolean().required().messages({
                'boolean.empty': 'Giới tính là bắt buộc!'
            }),
            phone: joi.string().length(10).required().messages({
                "string.length": "Số điện thoại phải có 10 chữ số!",
                "any.required": "Vui lòng nhập số điện thoại của bạn!"
            }),
            email: joi.string().email().required().messages({
                'string.email': 'Email không hợp lệ!',
                'string.empty': 'Email là bắt buộc!'
            }),
            role: joi.string().valid('Quản lý', 'Nhân viên').required().messages({
                'string.empty': 'Vai trò là bắt buộc!',
                'any.only': "Vai trò phải là Quản lý hoặc Nhân viên!"
            }),
        })
        const { error } = editSchema.validate({ name, gender, phone, email, role });
        if (error) {
            return res.status(400).json({
                error: error.details.map(e => e.message)
            });
        }

        const findUserByEmail = await User.findOne({ email });
        if (findUserByEmail && findUserByEmail._id.toString() !== id) {
            return res.status(400).json({ message: "Email người dùng đã được sử dụng. Hãy thử sử dụng email khác!" });
        }

        const updateUser = await User.findByIdAndUpdate(id, {
            name, gender, email, phone, role
        }, { new: true }).select("-password")

        if (!updateUser) {
            return res.status(400).json({ message: "Người dùng không tồn tại!" })
        }

        let prefix;
        if (role === 'Quản lý') {
            prefix = 'QL';
        } else if (role === 'Nhân viên') {
            prefix = 'NV';
        } else {
            return res.status(400).json({ message: "Vai trò không hợp lệ. Vai trò phải là 'Quản lý' hoặc 'Nhân viên'." });
        }

        if ((role === 'Quản lý' && !updateUser.e_code.startsWith('QL')) ||
            (role === 'Nhân viên' && !updateUser.e_code.startsWith('NV'))) {
            // Tìm người dùng có mã nhân viên lớn nhất của vai trò mới
            const latestUser = await User.findOne({ e_code: new RegExp(`^${prefix}`) }).sort({ e_code: -1 }).exec();
            let newECode;
            if (latestUser && latestUser.e_code) {
                const latestECode = latestUser.e_code;
                const numericPart = parseInt(latestECode.slice(2)) + 1;
                newECode = `${prefix}${numericPart.toString().padStart(3, '0')}`;
            } else {
                newECode = `${prefix}001`;
            }

            // Cập nhật mã nhân viên mới cho người dùng
            updateUser.e_code = newECode;
            await updateUser.save();
        }

        return res.status(200).json({
            message: "Cập nhật thông tin người dùng thành công.",
            user: {
                ...updateUser.toObject(),
                createdAt: formatCreatedAt(updateUser.createdAt)
            }
        })
    } catch (error) {
        console.error(error);
        if (error.details) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        } else {
            return res.status(500).json({ message: "Cập nhật thông tin người dùng thất bại!" });
        }
    }
}
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại!" })
        }
        return res.status(200).json({ message: "Xóa người dùng thành công." })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const getPagingUser = async (req, res) => {
    try {
        const query = req.query
        const users = await User.find({ role: "Nhân viên" })
            .skip(query.pageSize * query.pageIndex - query.pageSize)
            .limit(query.pageSize).sort({ createdAt: "desc" })

        const countUsers = await User.countDocuments({ role: "Nhân viên" })
        const totalPage = Math.ceil(countUsers / query.pageSize)

        // Format createdAt for each user
        const formattedUsers = users.map(user => ({
            ...user.toObject(),
            createdAt: formatCreatedAt(user.createdAt)
        }));

        return res.status(200).json({ users: formattedUsers, totalPage, count: countUsers })
    } catch (error) {
        return res.status(500).json(error)
    }
}
export const searchUser = async (req, res) => {
    try {
        const { keyword, option } = req.body;

        if (!keyword || !option) {
            const noKeyword = await User.find()
            return res.status(200).json({ noKeyword });
        }

        let searchField = {};
        if (option === "name") {
            searchField = { name: { $regex: keyword, $options: 'i' } };
        } else if (option === "email") {
            searchField = { email: { $regex: keyword, $options: 'i' } };
        } else if (option === "e_code") {
            searchField = { e_code: { $regex: keyword, $options: 'i' } };
        }

        const users = await User.find({ ...searchField, role: 'Nhân viên' });

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }

        const formattedUsers = users.map(user => ({
            ...user.toObject(),
            createdAt: formatCreatedAt(user.createdAt)
        }));

        return res.status(200).json({ users: formattedUsers });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
export const changePassword = async (req, res) => {
    const { compareSync, genSaltSync, hashSync } = bcrypt
    try {
        const id = req.params.id
        const oldPassword = req.body.oldPassword
        const newPassword = req.body.newPassword

        const changePasswordSchema = joi.object({
            oldPassword: joi.string().min(6).max(32).required().messages({
                'string.empty': `Mật khẩu cũ là bắt buộc`,
                'string.min': `Mật khẩu cũ phải có ít nhất 6 ký tự`,
                'string.max': `Mật khẩu cũ phải có tối đa 32 ký tự`,
                'any.required': `Mật khẩu cũ là bắt buộc`
            }),
            newPassword: joi.string().min(6).max(32).required().messages({
                'string.empty': `Mật khẩu mới là bắt buộc`,
                'string.min': `Mật khẩu mới phải có ít nhất 6 ký tự`,
                'string.max': `Mật khẩu mới phải có tối đa 32 ký tự`,
                'any.required': `Mật khẩu mới là bắt buộc`
            })
        })
        const { error } = changePasswordSchema.validate({ oldPassword, newPassword })
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }

        const checkPassword = compareSync(oldPassword, user.password)
        if (!checkPassword) {
            return res.status(400).json({ message: "Mật khẩu cũ không chính xác!" })
        }

        const salt = genSaltSync()
        const hashPassword = hashSync(newPassword, salt)

        const updatePassword = await User.findByIdAndUpdate(id, {
            password: hashPassword
        }).select("-password")

        return res.status(200).json({
            message: "Đổi mật khẩu thành công.",
            user: updatePassword
        })
    } catch (error) {
        console.error(error);
        if (error.details) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        } else {
            return res.status(500).json({ message: "Đổi mật khẩu thất bại!" });
        }
    }
}
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId).select('-password')
        return res.status(200).json({
            user
        })
    } catch (error) {
        return res.status(500).json({ error })
    }
}
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        return res.status(200).json({ user })
    } catch (error) {
        return res.status(500).json({ error });
    }
}
export const getTotalUser = async (req, res) => {
    try {
        const totalUser = await User.countDocuments({ role: "Nhân viên" });

        // Tính ngày hiện tại và ngày của 7 ngày trước
        const sevenDaysAgo = moment().subtract(7, 'days').toDate();

        // Đếm số nhân viên được thêm vào trong 7 ngày gần nhất
        const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo }, role: "Nhân viên" });

        return res.status(200).json({ totalUser, recentUsers });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}