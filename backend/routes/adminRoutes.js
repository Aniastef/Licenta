import express from 'express';
import {
  getAllUsers,
  deleteUser,
  updateAdminRole,
  toggleBlockUser,
  updateUserAdmin,
  handleRoleChange,
  uploadProfilePicture,
} from '../controllers/adminController.js';
import protectRoute from '../middlewares/protectRoute.js';
import adminOnly from '../middlewares/adminOnly.js';
import upload from '../config/imgUpload.js';

const router = express.Router();

router.get('/users', protectRoute, getAllUsers);
router.delete('/users/:id', protectRoute, adminOnly, deleteUser);
router.put('/users/:id/admin', protectRoute, adminOnly, updateAdminRole);
router.put('/users/:id/block', protectRoute, adminOnly, toggleBlockUser);
router.put('/users/:id/update', protectRoute, adminOnly, updateUserAdmin);
router.put('/users/:id/role', protectRoute, handleRoleChange);
router.post(
  '/users/:id/upload',
  protectRoute,
  upload.single('profilePicture'),
  uploadProfilePicture,
);

export default router;
