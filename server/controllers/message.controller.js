import Message from '../models/Message.model.js';
import { io } from '../server.js';
import { getReceiverSocketId } from '../socket/socket.js';

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId }
      ],
      isDeleted: false
    })
    .sort('createdAt')
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { content, imageUrl, fileUrl, fileName, type = 'text' } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content, imageUrl, fileUrl, fileName, type
    });

    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');

    // Emit to receiver via socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (msg.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    msg.isDeleted = true;
    await msg.save();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    await Message.updateMany(
      { sender: senderId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};