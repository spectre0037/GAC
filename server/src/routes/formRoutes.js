import { Router } from 'express';
import {
  getFormForAdmin,
  getFormForPublic,
  upsertForm,
  setFormPublishStatus,
  setFormClosedStatus,
  deleteForm,
  uploadFormImage,
} from '../controllers/formController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/events/:eventId/public', getFormForPublic);

router.use(requireAuth, requireRole('event_coordinator', 'super_admin'));

router.get('/events/:eventId', getFormForAdmin);
router.put('/events/:eventId', upsertForm);
router.patch('/events/:eventId/publish', setFormPublishStatus);
router.patch('/events/:eventId/close', setFormClosedStatus);
router.delete('/events/:eventId', deleteForm);
router.post('/events/:eventId/image', upload.single('image'), uploadFormImage);

export default router;