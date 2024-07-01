import express from "express"
import { createTable, deleteTable, editTable, getPagingTable, getTableById, searchTable, getTotalTable } from "../controllers/table.js"
import authentication from './../middlewares/authentication.js';
import authorization from './../middlewares/authorization.js';
const router = express.Router()
router.post("/create-table", authentication, createTable)
router.put("/:id", authentication, authorization, editTable)
router.delete("/:id", authentication, authorization, deleteTable)
router.get("/get-paging-table", authentication, authorization, getPagingTable)
router.get("/get-total-table", authentication, authorization, getTotalTable)
router.get("/:id", authentication, authorization, getTableById)
router.post("/search-table", authentication, authorization, searchTable)
export default router