import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {createProduct, getProduct} from "../controllers/productController.js";
import upload from "../config/imgUpload.js";

const router=express.Router();

router.post("/create", upload.array("images"),protectRoute, createProduct);
router.get("/:id", getProduct);





export default router;