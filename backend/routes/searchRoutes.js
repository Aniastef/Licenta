import express from "express";
import { universalSearch } from "../controllers/searchController.js";

const router = express.Router();
router.get("/", universalSearch);
export default router;
