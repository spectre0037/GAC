import { Router } from 'express';
import {
  createLineItem,
  listLineItems,
  updateLineItem,
  deleteLineItem,
  getBudgetSummary,
} from '../controllers/budgetController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

const READ_ROLES = [
  'finance_master',
  'master_logistics',
  'vp_ops',
  'president',
  'event_coordinator',
  'super_admin',
];

router.use(requireAuth, requireRole(...READ_ROLES));

router.get('/events/:eventId', listLineItems);
router.get('/events/:eventId/summary', getBudgetSummary);

router.post(
  '/events/:eventId',
  requireRole('finance_master', 'master_logistics', 'super_admin'),
  upload.single('receipt'),
  createLineItem
);
router.patch('/:id', requireRole('finance_master', 'super_admin'), updateLineItem);
router.delete('/:id', requireRole('finance_master', 'super_admin'), deleteLineItem);

export default router;