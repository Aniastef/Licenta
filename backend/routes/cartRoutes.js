import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from '../controllers/cartController.js';

const router = express.Router();

router.post('/add-to-cart', addToCart); // ✅ Adaugă un produs în cart
router.get('/:userId', getCart); // ✅ Obține conținutul cart-ului
router.delete('/remove', removeFromCart);
router.post('/update', updateCartItem);

export default router;
