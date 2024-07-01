import axios from "axios"
import { API_URL } from "../config"
import { getTokenFromLocalStorage, removeTokenFromLocalStorage, removeUserFromLocalStorage } from '../utils/localstorage'
const axiosInstance = axios.create({
    baseURL: API_URL
})
const axiosInstanceAuth = axios.create({
    baseURL: API_URL
})

axiosInstanceAuth.interceptors.request.use((config) => {
    config.headers.authorization = `Bearer ${getTokenFromLocalStorage()}`
    return config
})

axiosInstanceAuth.interceptors.response.use(
    (res) => {
        return res
    },
    (error) => {
        if (error.response.status === 401) {
            removeTokenFromLocalStorage();
            removeUserFromLocalStorage();
            window.dispatchEvent(new Event('sessionExpired'));
        }
        return Promise.reject(error);

    }
)
export {
    axiosInstance,
    axiosInstanceAuth
}