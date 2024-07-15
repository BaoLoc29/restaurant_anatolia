import { axiosInstanceAuth } from "./index";

const createMenu = (formData) => {
    return axiosInstanceAuth.post('/menu/create-menu', formData);
}
const editMenu = (menuId, formData) => {
    return axiosInstanceAuth.put(`/menu/${menuId}`, formData)
}
const deleteMenu = (menuId) => {
    return axiosInstanceAuth.delete(`/menu/${menuId}`)
}
const getPagingMenu = ({ pageSize, pageIndex, category }) => {
    let url = `/menu/get-paging-menu?pageSize=${pageSize}&pageIndex=${pageIndex}`;

    // Handle category parameter only if it's defined and not null
    if (category !== undefined && category !== null) {
        url += `&category=${category}`;
    }

    return axiosInstanceAuth.get(url);
}

const getMenuById = (menuId) => {
    return axiosInstanceAuth.get(`/menu/${menuId}`)
}
const getAllMenu = () => {
    return axiosInstanceAuth.get("/menu/get-all-menu")
}
const searchMenu = (keyword, option) => {
    return axiosInstanceAuth.post('/menu/search-menu', { keyword, option });
}
export {
    createMenu,
    editMenu,
    deleteMenu,
    getPagingMenu,
    getAllMenu,
    getMenuById,
    searchMenu
}