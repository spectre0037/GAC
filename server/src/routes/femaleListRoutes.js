import { Router } from 'express';
import {
  createEntry,
  listEntriesForEvent,
  updateEntry,
  updateEntryStatus,
  deleteEntry,
} from '../controllers/femaleListController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const READ_ROLES = ['general_secretary', 'super_admin', 'event_coordinator'];
const WRITE_ROLES = ['general_secretary', 'super_admin'];

router.use(requireAuth, requireRole(...READ_ROLES));

router.get('/events/:eventId', listEntriesForEvent);
router.post('/events/:eventId', requireRole(...WRITE_ROLES), createEntry);
router.patch('/:id', requireRole(...WRITE_ROLES), updateEntry);
router.patch('/:id/status', requireRole('super_admin'), updateEntryStatus);
router.delete('/:id', requireRole(...WRITE_ROLES), deleteEntry);

export default router;