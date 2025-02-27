import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {addToFavorites, createProduct, deleteProduct, getAllProducts, getAllProductsWithoutGallery, getAllUserProducts, getAvailableProducts, getDisplayOnlyProducts, getProduct, removeFromFavorites} from "../controllers/productController.js";
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
router.put("/favorites/:id", protectRoute, addToFavorites);
router.delete("/favorites/:id", protectRoute, removeFromFavorites);
router.get("/favorites/:userId", protectRoute, async (req, res) => {
    try {
      const userId = req.params.userId;
      
      const user = await User.findById(userId).populate("favorites");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json(user.favorites);
    } catch (error) {
      console.error("Error fetching favorite products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  


export default router;