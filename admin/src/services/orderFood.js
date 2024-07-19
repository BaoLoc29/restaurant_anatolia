import { axiosInstanceAuth } from "./index";

const getPagingOrderFood = ({ pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/order/get-order-food?pageSize=${pageSize}&pageIndex=${pageIndex}`);
}
const getDetailOrderFood = (reservationId) => {
    return axiosInstanceAuth.get(`/order/get-detail-order/${reservationId}`);
}
const deleteOrder = (reservationId, dishCode) => {
    return axiosInstanceAuth.delete(`/order/delete-order/${reservationId}/${dishCode}`)
}
const createOrderFood = (reservationId, data) => {
    return axiosInstanceAuth.post(`/order/order-food/${reservationId}`, data)
}
const getStatistics = ({ startYear, endYear }) => {
    return axiosInstanceAuth.get(`/order/revenue-statistics?startYear=${startYear}&endYear=${endYear}`)
}
const getTop3Dishes = () => {
    return axiosInstanceAuth.get("/order/top-dishes")
}

export {
    getPagingOrderFood,
    getDetailOrderFood,
    createOrderFood,
    getStatistics,
    getTop3Dishes,
    deleteOrder
}