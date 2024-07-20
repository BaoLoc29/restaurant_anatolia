import express from "express"
import { login, createUser, editUser, deleteUser, getPagingUser, searchUser, getUserProfile, changePassword, getUserById, getTotalUser } from "../controllers/user.js"
import authentication from './../middlewares/authentication.js';
import authorization from './../middlewares/authorization.js';
const router = express.Router()
router.post("/login", login)
router.get("/get-user-profile", getUserProfile)
router.get("/get-total-user", getTotalUser)
router.post("/create-user", authentication, authorization, createUser)
router.put("/:id", authentication, authorization, editUser)
router.delete("/:id", authentication, authorization, deleteUser)
router.get("/get-paging-user", getPagingUser)
router.post("/search-user", searchUser)
router.put("/change-password/:id", changePassword)
router.get("/:id", getUserById)
export default router