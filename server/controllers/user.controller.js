import User from '../models/User.model.js';
import { cloudinary } from '../config/cloudinary.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id }, isVerified: true })
      .select('username avatar isOnline lastSeen bio')
      .sort('-isOnline username');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const user = req.user;
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    await user.save();
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = req.user;
    // Delete old avatar from cloudinary
    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`chat-app/${publicId}`);
    }
    user.avatar = req.file.path;
    await user.save();
    res.json({ avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      _id: { $ne: req.user._id },
      isVerified: true,
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('username avatar isOnline bio');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};