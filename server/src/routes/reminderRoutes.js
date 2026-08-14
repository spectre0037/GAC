import { Router } from 'express';
import { sendEventReminders } from '../controllers/reminderController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post(
  '/events/:eventId/send',
  requireAuth,
  requireRole('event_coordinator', 'super_admin'),
  sendEventReminders
);

export default router;