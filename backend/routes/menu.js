import express from "express"
import { createMenu, deleteMenu, editMenu, getMenuById, getPagingMenu, searchMenu } from "../controllers/menu.js"
import authentication from './../middlewares/authentication.js';
import authorization from './../middlewares/authorization.js';
const router = express.Router()
router.post("/create-menu", authentication, authorization, createMenu)
router.put("/:id", authentication, authorization, editMenu)
router.delete("/:id", authentication, authorization, deleteMenu)
router.get("/get-paging-menu", authentication, authorization, getPagingMenu)
router.get("/:id", authentication, authorization, getMenuById)
router.post("/search-menu", authentication, authorization, searchMenu)
export default router