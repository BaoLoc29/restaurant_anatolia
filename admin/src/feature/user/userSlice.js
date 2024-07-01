import { createSlice } from '@reduxjs/toolkit'
import { getUserFromLocalStorage, removeTokenFromLocalStorage, removeUserFromLocalStorage } from '../../utils/localstorage.js';

const initialState = {
    user: getUserFromLocalStorage(),
}
export const userSlide = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = action.payload.user;
        },
        logout: (state) => {
            state.user = {}
            removeUserFromLocalStorage()
            removeTokenFromLocalStorage()
        }
    }
})
export const { login, logout } = userSlide.actions

export default userSlide.reducer