import express from 'express';
import {
  createReport,
  deleteReport,
  getReports,
  resolveReport,
} from '../controllers/reportController.js';
import adminOnly from '../middlewares/adminOnly.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.post('/', protectRoute, createReport);

router.get('/', protectRoute, adminOnly, getReports);

router.delete('/:id', protectRoute, adminOnly, deleteReport);

router.patch('/:id/resolve', protectRoute, adminOnly, resolveReport);

export default router;
