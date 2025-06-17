import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, 
    message: { type: String, required: true },
    link: { type: String }, 
    seen: { type: Boolean, default: false },
    meta: { type: Object, default: {} }, 
  },
    { timestamps: true },
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
