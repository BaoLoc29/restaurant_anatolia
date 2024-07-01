import { axiosInstance, axiosInstanceAuth } from "./index";

const login = ({ email, password }) => {
    return axiosInstance.post("/user/login", { email, password })
}
const getUserById = (userId) => {
    return axiosInstanceAuth.get(`/user/${userId}`)
}
const createUser = (data) => {
    return axiosInstanceAuth.post('/user/create-user', data);
}
const editUser = (userId, data) => {
    return axiosInstanceAuth.put(`/user/${userId}`, data)
}
const deleteUser = (userId) => {
    return axiosInstanceAuth.delete(`/user/${userId}`)
}
const getUserProfile = () => {
    return axiosInstanceAuth.get('/user/get-user-profile')
}

const changePassword = (userId, oldPassword, newPassword) => {
    return axiosInstanceAuth.put(`/user/change-password/${userId}`, oldPassword, newPassword)
}
const getPagingUser = ({ pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/user/get-paging-user?pageSize=${pageSize}&pageIndex=${pageIndex}`);
}
const getTotalUser = () => {
    return axiosInstanceAuth.get("/user/get-total-user/")
}
const searchUser = (keyword, option) => {
    return axiosInstanceAuth.post('/user/search-user', { keyword, option });
}
export {
    login,
    createUser,
    editUser,
    deleteUser,
    getUserProfile,
    changePassword,
    getPagingUser,
    getUserById,
    searchUser,
    getTotalUser
}