import { Router } from 'express';
import { signup, login, getMe, updateProfile, uploadAvatar } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateProfile);
router.post('/me/avatar', requireAuth, upload.single('avatar'), uploadAvatar);

export default router;