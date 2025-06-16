import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from '../controllers/cartController.js';

const router = express.Router();

router.post('/add-to-cart', addToCart);
router.get('/:userId', getCart);
router.delete('/remove', removeFromCart);
router.post('/update', updateCartItem);

export default router;
