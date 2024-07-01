import { axiosInstanceAuth } from "./index";

const createReservation = (data) => {
    return axiosInstanceAuth.post('/reservation/send', data);
}
const getPagingReservation = ({ pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/reservation/get-paging-reservation?pageSize=${pageSize}&pageIndex=${pageIndex}`);
}
const editReservation = (id, data) => {
    return axiosInstanceAuth.put(`/reservation/${id}`, data)
}
const getOrders = ({ month, year }) => {
    return axiosInstanceAuth.get(`/reservation/get-orders?month=${month}&year=${year}`)
}
const getReservation = () => {
    return axiosInstanceAuth.get("/reservation/get-all-reservation/")
}
const getOrderByDate = ({ date, pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/reservation/get-order-by-date?date=${date}&pageSize=${pageSize}&pageIndex=${pageIndex}`)
}
const searchReservation = ({ phone }) => {
    return axiosInstanceAuth.post(`/reservation/search-reservation`, { phone })
}
export {
    getPagingReservation,
    getReservation,
    editReservation,
    getOrders,
    getOrderByDate,
    createReservation,
    searchReservation

}