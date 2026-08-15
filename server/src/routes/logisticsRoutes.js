import { Router } from 'express';
import {
  createInventoryItem,
  listInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/logisticsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const READ_ROLES = [
  'master_logistics',
  'event_coordinator',
  'vp_ops',
  'president',
  'finance_master',
  'super_admin',
];

router.use(requireAuth, requireRole(...READ_ROLES));

router.get('/events/:eventId', listInventoryItems);
router.post('/events/:eventId', requireRole('master_logistics', 'finance_master', 'super_admin'), createInventoryItem);
router.patch('/:id', requireRole('master_logistics', 'finance_master', 'super_admin'), updateInventoryItem);
router.delete('/:id', requireRole('master_logistics', 'finance_master', 'super_admin'), deleteInventoryItem);

export default router;