import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import {
  addToFavorites,
  createProduct,
  deleteProduct,
  getAllProducts,
  getAllProductsWithoutGallery,
  getAllUserProducts,
  getAvailableProducts,
  getDisplayOnlyProducts,
  getProduct,
  removeFromFavorites,
  updateProduct,
  getFavoriteProducts,
} from '../controllers/productController.js';
import { getProductsNotInGallery } from '../controllers/galleryController.js';

const router = express.Router();

router.post('/create', protectRoute, createProduct);

router.put('/update/:productId', protectRoute, updateProduct); 

router.get('/:id', getProduct);
router.get('/', getAllProducts); 
router.get('/all', getAllProducts); 
router.get('/not-in-gallery/:galleryId', protectRoute, getProductsNotInGallery);
router.get('/user/:username', getAllUserProducts);
router.get('/available', getAvailableProducts);
router.get('/display-only', getDisplayOnlyProducts);
router.get('/favorites/:userId', protectRoute, getFavoriteProducts);
router.put('/favorites/:id', protectRoute, addToFavorites);
router.delete('/favorites/:id', protectRoute, removeFromFavorites);
router.delete('/:id', protectRoute, deleteProduct);

export default router;
