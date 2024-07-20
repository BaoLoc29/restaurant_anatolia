import express from "express"
import { createTable, deleteTable, editTable, getPagingTable, getTableById, searchTable, getTotalTable } from "../controllers/table.js"
import authentication from './../middlewares/authentication.js';
import authorization from './../middlewares/authorization.js';

const router = express.Router()
router.post("/create-table", authentication, authorization, createTable)
router.put("/:id", authentication, authorization, editTable)
router.delete("/:id", authentication, authorization, deleteTable)
router.get("/get-paging-table", getPagingTable)
router.get("/get-total-table", getTotalTable)
router.get("/:id", getTableById)
router.post("/search-table", searchTable)
export default router