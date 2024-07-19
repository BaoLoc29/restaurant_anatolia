import { axiosInstanceAuth } from "./index";

const createCheckoutSession = (reservationId) => {
    return axiosInstanceAuth.post(`/admin-payment/create-checkout-session`, { reservationId });
};

export { createCheckoutSession };