import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:    { type: String, default: '' },
  imageUrl:   { type: String, default: '' },
  fileUrl:    { type: String, default: '' },
  fileName:   { type: String, default: '' },
  type:       { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  isRead:     { type: Boolean, default: false },
  readAt:     { type: Date },
  isDeleted:  { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);