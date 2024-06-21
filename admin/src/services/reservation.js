import { axiosInstanceAuth } from "./index";

const getPagingReservation = ({ pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/reservation/get-paging-reservation?pageSize=${pageSize}&pageIndex=${pageIndex}`);
}
const editReservation = (id, data) => {
    return axiosInstanceAuth.put(`/reservation/${id}`, data)
}
export {
    getPagingReservation,
    editReservation
}