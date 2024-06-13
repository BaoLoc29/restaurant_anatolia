import { axiosInstanceAuth } from "./index";

const getPagingReservation = ({ pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/reservation/get-paging-reservation?pageSize=${pageSize}&pageIndex=${pageIndex}`);
}

export {
    getPagingReservation
}