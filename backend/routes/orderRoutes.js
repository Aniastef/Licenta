import express from 'express';
import {
  getUserOrders,
  addOrder,
  deleteOrder,
  cancelOrder,
  getAllOrders,
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/all', getAllOrders);
router.get('/:userId', getUserOrders);
router.post('/:userId', addOrder);
router.delete('/:userId/:orderId', deleteOrder);
router.patch('/:userId/cancel/:orderId', cancelOrder);

export default router;
