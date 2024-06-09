import express from "express"
import { login, createUser, editUser, deleteUser, getPagingUser, searchUser, getUserProfile, changePassword, getUserById } from "../controllers/user.js"
import authentication from './../middlewares/authentication.js';
import authorization from './../middlewares/authorization.js';
const router = express.Router()
router.post("/login", login)
router.get("/get-user-profile", authentication, authorization, getUserProfile)
router.post("/create-user", authentication, authorization, createUser)
router.put("/:id", authentication, authorization, editUser)
router.delete("/:id", authentication, authorization, deleteUser)
router.get("/get-paging-user", authentication, authorization, getPagingUser)
router.post("/search-user", authentication, authorization, searchUser)
router.put("/change-password/:id", authentication, authorization, changePassword)
router.get("/:id", authentication, authorization, getUserById)
export default router