import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {createProduct, deleteProduct, getAllProducts, getAllProductsWithoutGallery, getAllUserProducts, getAvailableProducts, getDisplayOnlyProducts, getProduct} from "../controllers/productController.js";
import upload from "../config/imgUpload.js";
import { getProductsNotInGallery } from "../controllers/galleryController.js";

const router=express.Router();

router.post("/create", upload.array("images"), protectRoute, createProduct); // Creare produs
router.get("/:id", getProduct); // Detalii produs după ID
router.get("/", getAllProducts); // Toate produsele
router.get("/all", getAllProducts); // Toate produsele (folosit pentru `All Products`)
router.get("/not-in-gallery/:galleryId", protectRoute, getProductsNotInGallery); // Produse care nu sunt într-o galerie
router.get("/user/:username", getAllUserProducts); // Produse ale unui utilizator
router.delete("/:id", protectRoute, deleteProduct);
router.get("/available", getAvailableProducts); // ✅ Produse disponibile pentru cumpărare
router.get("/display-only", getDisplayOnlyProducts); // ✅ Produse doar pentru afișare



export default router;