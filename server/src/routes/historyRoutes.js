import { Router } from 'express';
import {
  listHistory,
  createHistoryMember,
  updateHistoryMember,
  deleteHistoryMember,
  uploadHistoryPhoto,
} from '../controllers/historyController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', listHistory); // public — landing page needs this

router.use(requireAuth, requireRole('super_admin'));

router.post('/', createHistoryMember);
router.patch('/:id', updateHistoryMember);
router.delete('/:id', deleteHistoryMember);
router.post('/:id/photo', upload.single('photo'), uploadHistoryPhoto);

export default router;