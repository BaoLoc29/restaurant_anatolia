import axios from "axios"

const axiosInstance = axios.create({
    baseURL: "https://restaurant-anatolia-backend.onrender.com"
})


export { axiosInstance }