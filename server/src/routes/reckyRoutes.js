import { Router } from 'express';
import {
  assignReckyPlanner,
  listReckyAssignmentsForEvent,
  listMyReckyAssignments,
  logReckyExpense,
  listReckyExpenses,
} from '../controllers/reckyController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth); // every recky route requires login

router.get('/my-assignments', listMyReckyAssignments);

router.post(
  '/events/:eventId/assign',
  requireRole('event_coordinator', 'super_admin'),
  assignReckyPlanner
);
router.get(
  '/events/:eventId/assignments',
  requireRole('event_coordinator', 'super_admin'),
  listReckyAssignmentsForEvent
);

// Expense routes are open to any authenticated user — the controller itself
// checks whether they're actually the assigned recky planner or a coordinator
router.post('/events/:eventId/expenses', upload.single('receipt'), logReckyExpense);
router.get('/events/:eventId/expenses', listReckyExpenses);

export default router;