import { axiosInstanceAuth } from "./index";

const getPagingOrderFood = ({ pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/order/get-order-food?pageSize=${pageSize}&pageIndex=${pageIndex}`);
}
const getDetailOrderFood = (reservationId) => {
    return axiosInstanceAuth.get(`/order/get-detail-order/${reservationId}`);
}

const createOrderFood = (reservationId, data) => {
    return axiosInstanceAuth.post(`/order/order-food/${reservationId}`, data)
}

export {
    getPagingOrderFood,
    getDetailOrderFood,
    createOrderFood
}