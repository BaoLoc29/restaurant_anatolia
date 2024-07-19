const authorization = async (req, res, next) => {
    try {
        const user = req.user
        if (!(user.role == "Quản lý")) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập trang này!" })
        }
        next()
    } catch (error) {
        return res.status(500).json(error)
    }
}

export default authorization;