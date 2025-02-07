import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {createProduct, getAllProducts, getAllProductsWithoutGallery, getProduct} from "../controllers/productController.js";
import upload from "../config/imgUpload.js";
import { getProductsNotInGallery } from "../controllers/galleryController.js";

const router=express.Router();

router.post("/create", upload.array("images"),protectRoute, createProduct);
router.get("/:id", getProduct);
router.get("/", getAllProducts);
router.get("/all", getAllProductsWithoutGallery);
router.get("/not-in-gallery/:galleryId", protectRoute, getProductsNotInGallery);





export default router;