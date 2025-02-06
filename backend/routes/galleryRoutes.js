import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import upload from "../config/imgUpload.js";
import {
  createGallery,
  getGallery,
  updateGallery,
  deleteGallery,
  getAllGalleries,
} from "../controllers/galleryController.js";

const router = express.Router();

// Creare galerie
router.post("/create", upload.single("coverPhoto"), protectRoute, createGallery);

// Obținere detalii despre o galerie specifică
router.get("/:username/:galleryName", getGallery);

// Actualizare galerie
router.put("/:galleryId", protectRoute, updateGallery);

// Ștergere galerie
router.delete("/:galleryId", protectRoute, deleteGallery);

// Obținere toate galeriile
router.get("/", getAllGalleries);

export default router;
