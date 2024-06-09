import { axiosInstanceAuth } from "./index";

const createMenu = (data) => {
    return axiosInstanceAuth.post('/menu/create-menu', data);
}
const editMenu = (menuId, data) => {
    return axiosInstanceAuth.put(`/menu/${menuId}`, data)
}
const deleteMenu = (menuId) => {
    return axiosInstanceAuth.delete(`/menu/${menuId}`)
}
const getPagingMenu = ({ pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/menu/get-paging-menu?pageSize=${pageSize}&pageIndex=${pageIndex}`);
}
const getMenuById = (menuId) => {
    return axiosInstanceAuth.get(`/menu/${menuId}`)
}
const searchMenu = (keyword, option) => {
    return axiosInstanceAuth.post('/menu/search-menu', { keyword, option });
}
export {
    createMenu,
    editMenu,
    deleteMenu,
    getPagingMenu,
    getMenuById,
    searchMenu
}