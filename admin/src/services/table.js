import { axiosInstanceAuth } from "./index";

const createTable = (data) => {
    return axiosInstanceAuth.post('/table/create-table', data);
}
const editTable = (tableId, data) => {
    return axiosInstanceAuth.put(`/table/${tableId}`, data)
}
const deleteTable = (tableId) => {
    return axiosInstanceAuth.delete(`/table/${tableId}`)
}
const getPagingTable = ({ pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/table/get-paging-table?pageSize=${pageSize}&pageIndex=${pageIndex}`);
}
const getTableById = (tableId) => {
    return axiosInstanceAuth.get(`/table/${tableId}`)
}
const searchTable = (keyword, option) => {
    return axiosInstanceAuth.post('/table/search-table', { keyword, option });
}
const getTotalTable = () => {
    return axiosInstanceAuth.get("/table/get-total-table/")
}
export {
    createTable,
    editTable,
    deleteTable,
    getPagingTable,
    getTableById,
    searchTable,
    getTotalTable
}