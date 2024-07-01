const saveTokenToLocalStorage = (token) => {
    localStorage.setItem("accessToken", token);
}

const removeTokenFromLocalStorage = (token) => {
    localStorage.removeItem('accessToken', token);
}

const getTokenFromLocalStorage = () => {
    const token = localStorage.getItem("accessToken");
    return token;
}

const saveUserToLocalStorage = (user) => {
    localStorage.setItem("user", JSON.stringify(user))
}

const removeUserFromLocalStorage = () => {
    localStorage.removeItem("user")
}
const getUserFromLocalStorage = () => {
    const userString = localStorage.getItem("user")

    if (!userString) {
        return {}
    }
    const user = JSON.parse(userString)
    return user
}

export {
    saveTokenToLocalStorage,
    removeTokenFromLocalStorage,
    getTokenFromLocalStorage,
    saveUserToLocalStorage,
    removeUserFromLocalStorage,
    getUserFromLocalStorage
}