import express from 'express';
import {
  signupUser,
  loginUser,
  logoutUser,
  updateUser,
  getUserProfile,
  getUserWithGalleries,
  searchUsers,
  getFavoriteProducts,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getMe,
  moveToFavorites,
  getRandomUsers,
  saveQuote,
  addGalleryToFavorites,
  removeGalleryFromFavorites,
  getUserFavorites,
  addArticleToFavorites,
  removeArticleFromFavorites,
  getUserFavoriteArticles,
  updateUserByAdmin,
  toggleFavoriteGallery,
  getUserFavoriteGalleries,
} from '../controllers/userController.js';
import protectRoute from '../middlewares/protectRoute.js';
import adminOnly from '../middlewares/adminOnly.js';
import { getFavoriteGalleries } from '../controllers/galleryController.js';

const router = express.Router();

router.get('/profile/:username', getUserProfile);
router.get('/profile', protectRoute, getUserProfile); // ✅ Returnează utilizatorul logat
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.put('/update/:id', protectRoute, updateUser);
router.get('/galleries', protectRoute, getUserWithGalleries);
router.get('/search', protectRoute, searchUsers);
router.get('/favorites/:username', getFavoriteProducts);
router.post('/block/:userId', protectRoute, blockUser);
router.post('/unblock/:userId', protectRoute, unblockUser);
router.get('/blocked', protectRoute, getBlockedUsers);
router.get('/me', protectRoute, getMe);

router.post('/favorites/move', moveToFavorites);
router.get('/random-users', getRandomUsers);
router.post('/quote', protectRoute, saveQuote); // Salvează citatul utilizatorului
router.post('/favorites/gallery', protectRoute, addGalleryToFavorites);
router.post('/favorites/gallery/remove', protectRoute, removeGalleryFromFavorites);
router.get('/:username/favorites-all', getUserFavorites);
router.post('/favorites/articles', protectRoute, addArticleToFavorites);
router.delete('/favorites/articles/remove', protectRoute, removeArticleFromFavorites);
router.get('/favorites', protectRoute, getUserFavoriteArticles); // ✅ adaugă
router.put('/admin/users/:id/update', protectRoute, adminOnly, updateUserByAdmin);
// Route to toggle favorite status for a gallery (add/remove)
router.post('/favorites/gallery', protectRoute, toggleFavoriteGallery);
router.delete('/favorites/gallery/:galleryId', protectRoute, toggleFavoriteGallery); // <--- NEW DELETE ROUTE

// Route to get all favorite galleries for the current user
router.get('/users/:userId/favorite-galleries', protectRoute, getUserFavoriteGalleries);
router.get('/me/favorite-galleries', protectRoute, getFavoriteGalleries);

export default router;
