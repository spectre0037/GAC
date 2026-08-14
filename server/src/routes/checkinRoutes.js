import { Router } from 'express';
import { getTicketByCode, confirmCheckIn } from '../controllers/checkinController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const CHECKIN_ROLES = ['event_coordinator', 'master_logistics', 'super_admin'];

router.use(requireAuth, requireRole(...CHECKIN_ROLES));

router.get('/:code', getTicketByCode);
router.patch('/:code/confirm', confirmCheckIn);

export default router;