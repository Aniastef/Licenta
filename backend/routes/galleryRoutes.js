import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import upload from '../config/imgUpload.js';
import {
  createGallery,
  getGallery,
  updateGallery,
  deleteGallery,
  getAllGalleries,
  addProductToGallery,
  getProductsNotInGallery,
  addMultipleProductsToGallery,
  removeProductFromGallery,
  updateProductOrder,
  acceptGalleryInvite,
  declineGalleryInvite,
  getAllUserGalleries,
  getFavoriteGalleries,
} from '../controllers/galleryController.js';

const router = express.Router();

// routes/galleryRoutes.js
router.post('/:galleryId/accept-invite', protectRoute, acceptGalleryInvite);
router.post('/:galleryId/decline-invite', protectRoute, declineGalleryInvite);
// 🔄 Obținere galerie după ID (folosită pentru editare)
router.get('/:galleryId', getGallery);
router.get('/user/:username', getAllUserGalleries);

// ✅ Creare galerie
router.post('/create', upload.single('coverPhoto'), protectRoute, createGallery);

// 🔁 Actualizare galerie
router.put('/:galleryId', protectRoute, upload.single('coverPhoto'), updateGallery);

// ❌ Ștergere galerie
router.delete('/:galleryId', protectRoute, deleteGallery);

// 🌍 Toate galeriile
router.get('/', getAllGalleries);

// 🧩 Produse
router.post('/:galleryId/add-product/:productId', protectRoute, addProductToGallery);
router.post('/:galleryId/add-products', protectRoute, addMultipleProductsToGallery);
router.delete('/:galleryId/remove-product/:productId', protectRoute, removeProductFromGallery);
router.put('/:galleryId/reorder-products', protectRoute, updateProductOrder);
router.get('/not-in-gallery/:galleryId', protectRoute, getProductsNotInGallery);

export default router;
