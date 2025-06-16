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

router.post('/:galleryId/accept-invite', protectRoute, acceptGalleryInvite);
router.post('/:galleryId/decline-invite', protectRoute, declineGalleryInvite);
router.get('/:galleryId', getGallery);
router.get('/user/:username', getAllUserGalleries);

router.post('/create', upload.single('coverPhoto'), protectRoute, createGallery);

router.put('/:galleryId', protectRoute, upload.single('coverPhoto'), updateGallery);


router.delete('/:galleryId', protectRoute, deleteGallery);

router.get('/', getAllGalleries);

router.post('/:galleryId/add-product/:productId', protectRoute, addProductToGallery);
router.post('/:galleryId/add-products', protectRoute, addMultipleProductsToGallery);
router.delete('/:galleryId/remove-product/:productId', protectRoute, removeProductFromGallery);
router.put('/:galleryId/reorder-products', protectRoute, updateProductOrder);
router.get('/not-in-gallery/:galleryId', protectRoute, getProductsNotInGallery);

export default router;
