import { Router } from 'express';
import {
  submitRegistration,
  getMyRegistrations,
  cancelMyRegistration,
  uploadPaymentScreenshot,
  listRegistrationsForEvent,
  approveRegistration,
  rejectPaymentScreenshot,
  rejectRegistration,
  manuallyAddRegistration,
  getEventAnalytics,
} from '../controllers/registrationController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth); // every registration action requires login

// Student-facing
router.get('/my', getMyRegistrations);
router.post('/events/:eventId', submitRegistration);
router.patch('/:id/cancel', cancelMyRegistration);
router.post('/:id/payment', upload.single('screenshot'), uploadPaymentScreenshot);

// Coordinator-facing
router.get(
  '/events/:eventId',
  requireRole('event_coordinator', 'super_admin'),
  listRegistrationsForEvent
);
router.get(
  '/events/:eventId/analytics',
  requireRole('event_coordinator', 'super_admin', 'president', 'vp_ops', 'finance_master', 'master_logistics'),
  getEventAnalytics
);
router.post(
  '/events/:eventId/manual',
  requireRole('event_coordinator', 'super_admin'),
  manuallyAddRegistration
);
router.patch(
  '/:id/approve',
  requireRole('event_coordinator', 'super_admin'),
  approveRegistration
);
router.patch(
  '/:id/reject-payment',
  requireRole('event_coordinator', 'super_admin'),
  rejectPaymentScreenshot
);
router.patch(
  '/:id/reject',
  requireRole('event_coordinator', 'super_admin'),
  rejectRegistration
);

export default router;