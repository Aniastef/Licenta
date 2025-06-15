import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.get('/logs', protectRoute, getAuditLogs);

export default router;
