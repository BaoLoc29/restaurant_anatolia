import express from "express"
import { createMenu, deleteMenu, editMenu, getAll, getAllMenu, getMenuByCategory, getMenuById, getPagingMenu, searchMenu } from "../controllers/menu.js"
import upload from "../middlewares/upload.js";
import authentication from './../middlewares/authentication.js';
import authorization from './../middlewares/authorization.js';

const router = express.Router()
router.get("/get-all-menu", authentication, getAllMenu)
router.post("/create-menu", upload.single("image"), authentication, authorization, createMenu)
router.put("/:id", upload.single("image"), authentication, authorization, editMenu)
router.delete("/:id", authentication, authorization, deleteMenu)
router.get("/get-paging-menu", authentication, getPagingMenu)
router.get('/category/:category', authentication, getMenuByCategory);

router.get("/", getAll);
router.get("/:id", authentication, getMenuById)
router.post("/search-menu", authentication, searchMenu)
export default router