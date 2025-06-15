import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  attachments: [
    {
      url: String,
      type: {
        type: String,
        enum: ['image', 'video', 'audio', 'application', 'other'],
        default: 'other',
      },
    },
  ],
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Message', messageSchema);
