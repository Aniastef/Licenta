import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {createProduct, deleteProduct, updateProduct, addProductComment, addToFavorites,removeFromFavorites,addImageToProduct,removeImageFromProduct,getProductImages} from "../controllers/productController.js";

const router=express.Router();

router.post("/create", protectRoute, createProduct);
export default router;