import { Router } from 'express';
import { createNotification, listNotifications, emailNotification } from '../controllers/notificationController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listNotifications); // everyone can view

router.post('/', requireRole('super_admin'), createNotification);
router.post('/:id/email', requireRole('super_admin'), emailNotification);

export default router;