import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {createProduct, deleteProduct, updateProduct, addProductComment, addToFavorites,removeFromFavorites,addImageToProduct,removeImageFromProduct,getProductImages} from "../controllers/productController.js";

const router=express.Router();

router.post("/products", createProduct); 
router.delete("/products/:id", deleteProduct); 
router.put("/products/:id", updateProduct); 

// comments
router.post("/products/:id/comments", addProductComment); 

// favorites
router.post("/products/:id/favorites", addToFavorites); 
router.delete("/products/:id/favorites", removeFromFavorites); 

//images
router.post("/products/:productId/images", addImageToProduct); 
router.delete("/products/:productId/images", removeImageFromProduct); 
router.get("/products/:productId/images", getProductImages); 

export default router;