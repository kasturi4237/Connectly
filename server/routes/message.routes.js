import express from 'express';
import { getMessages, sendMessage, deleteMessage, markAsRead } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();
router.use(protect);
router.get('/:userId', getMessages);
router.post('/send/:receiverId', sendMessage);
router.delete('/:id', deleteMessage);
router.put('/read/:senderId', markAsRead);

export default router;