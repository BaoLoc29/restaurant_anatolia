import { axiosInstanceAuth } from "./index";

const getPagingOrderFood = ({ pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/order/get-order-food?pageSize=${pageSize}&pageIndex=${pageIndex}`);
}
const searchOrderFood = ({ tableId }) => {
    return axiosInstanceAuth.post(`/order/search-order`, { tableId })
}

export {
    getPagingOrderFood,
    searchOrderFood
}