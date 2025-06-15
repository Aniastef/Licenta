import Notification from '../models/notificationModel.js';

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAllAsSeen = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, seen: false }, { seen: true });
    res.status(200).json({ message: 'All marked as seen' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};

export const createNotification = async ({ userId, message, type, link, meta }) => {
  try {
    const newNotif = new Notification({
      user: userId,
      message,
      type,
      link,
      meta,
    });
    await newNotif.save();
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
};

export const markNotificationAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { seen: true },
      { new: true },
    );
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.status(200).json({ message: 'Marked as seen' });
  } catch (err) {
    console.error('Error marking notification:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
