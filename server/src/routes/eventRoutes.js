import { Router } from 'express';
import {
  createEvent,
  listPublicEvents,
  listPastEvents,
  listAllEvents,
  getEventById,
  getEventBySlug,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  uploadEventCover,
  updateItinerary,
} from '../controllers/eventController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', listPublicEvents);
router.get('/past', listPastEvents);
router.get('/slug/:slug', getEventBySlug);
router.get('/:id', getEventById);
// Read-only admin list — Finance Master, Master Logistics, VP Ops, and
// President all need this for event-selector dropdowns even though they
// can't edit events themselves.
router.get(
  '/admin/all',
  requireAuth,
  requireRole(
    'event_coordinator',
    'super_admin',
    'finance_master',
    'master_logistics',
    'vp_ops',
    'president',
    'general_secretary'
  ),
  listAllEvents
);

// Everything below is actual event editing — Coordinator/Super Admin only
router.use(requireAuth, requireRole('event_coordinator', 'super_admin'));

router.post('/', createEvent);
router.patch('/:id', updateEvent);
router.patch('/:id/status', updateEventStatus);
router.patch('/:id/itinerary', updateItinerary);
router.post('/:id/cover', upload.single('image'), uploadEventCover);
router.delete('/:id', deleteEvent);

export default router;