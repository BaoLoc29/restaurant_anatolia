import express from "express"
import { createTable, deleteTable, editTable, getPagingTable, getTableById, searchTable, getTotalTable } from "../controllers/table.js"
import authentication from './../middlewares/authentication.js';
import authorization from './../middlewares/authorization.js';
const router = express.Router()
router.post("/create-table", authentication, authorization, createTable)
router.put("/:id", authentication, authorization, editTable)
router.delete("/:id", authentication, authorization, deleteTable)
router.get("/get-paging-table", authentication, getPagingTable)
router.get("/get-total-table", authentication, authorization, getTotalTable)
router.get("/:id", authentication, authorization, getTableById)
router.post("/search-table", authentication, searchTable)
export default router