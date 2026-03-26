import express from 'express';
import { getUsers, updateProfile, updateAvatar, searchUsers } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();
router.use(protect);
router.get('/', getUsers);
router.get('/search', searchUsers);
router.put('/profile', updateProfile);
router.put('/avatar', upload.single('avatar'), updateAvatar);

export default router;