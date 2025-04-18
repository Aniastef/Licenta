import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import upload from "../config/imgUpload.js";
import {
  createGallery,
  getGallery,
  getGalleryById,
  updateGallery,
  deleteGallery,
  getAllGalleries,
  addProductToGallery,
  getProductsNotInGallery,
  addMultipleProductsToGallery,
  removeProductFromGallery,
  updateProductOrder,
} from "../controllers/galleryController.js";

const router = express.Router();

// 🔄 Obținere galerie după ID (folosită pentru editare)
router.get("/:galleryId", protectRoute, getGalleryById); // trebuie să fie înainte de username/name

// 👤 Obținere galerie după username + gallery name (pentru afișare publică)
router.get("/:username/:galleryName", getGallery);

// ✅ Creare galerie
router.post("/create", upload.single("coverPhoto"), protectRoute, createGallery);

// 🔁 Actualizare galerie
router.put("/:galleryId", protectRoute, upload.single("coverPhoto"), updateGallery);

// ❌ Ștergere galerie
router.delete("/:galleryId", protectRoute, deleteGallery);

// 🌍 Toate galeriile
router.get("/", getAllGalleries);

// 🧩 Produse
router.post("/:galleryId/add-product/:productId", protectRoute, addProductToGallery);
router.post("/:galleryId/add-products", protectRoute, addMultipleProductsToGallery);
router.delete("/:galleryId/remove-product/:productId", protectRoute, removeProductFromGallery);
router.put("/:galleryId/reorder-products", protectRoute, updateProductOrder);
router.get("/not-in-gallery/:galleryId", protectRoute, getProductsNotInGallery);

export default router;
