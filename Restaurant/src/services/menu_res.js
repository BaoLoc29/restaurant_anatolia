import { axiosInstance } from './index.js';

const getAll = async () => {
    return axiosInstance.get('/menu')
}

export { getAll };