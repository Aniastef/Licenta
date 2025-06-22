import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';

export const getConversations = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.error('User ID not found in request.');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', req.user._id] }, '$receiver', '$sender'],
          },
          lastMessage: {
            $first: {
              content: '$content',
              timestamp: '$timestamp',
              sender: '$sender',
              attachments: { $ifNull: ['$attachments', []] },
            },
          },

          isUnread: {
            $first: {
              $cond: [
                { $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$isRead', false] }] },
                true,
                false,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          'user._id': 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.profilePicture': 1,
          'lastMessage.content': 1,
          'lastMessage.timestamp': 1,
          'lastMessage.sender': 1,
          'lastMessage.attachments': 1,
          isUnread: 1,
        },
      },
      { $sort: { 'lastMessage.timestamp': -1 } },
    ]);

    res.status(200).json({ conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(' Invalid user ID:', userId);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'firstName lastName profilePicture')
      .populate('receiver', 'firstName lastName profilePicture')
      .sort({ timestamp: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    console.error(' Error fetching messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

import { v2 as cloudinary } from 'cloudinary';

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, attachments } = req.body;
    const senderId = req.user._id;

    if (!receiverId || (!content && (!attachments || attachments.length === 0))) {
      return res.status(400).json({ error: 'Missing fields.' });
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (sender.blockedUsers.includes(receiverId)) {
      return res.status(403).json({ error: 'You blocked this user.' });
    }
    if (receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({ error: 'You are blocked by this user.' });
    }

    let uploadedAttachments = [];
    if (attachments?.length > 0) {
      for (let att of attachments) {
        if (att.url?.startsWith('data:')) {
          const uploadOptions = {
            resource_type:
              att.type === 'image'
                ? 'image'
                : att.type === 'video'
                  ? 'video'
                  : att.type === 'audio'
                    ? 'audio'
                    : 'raw',
          };
          const uploaded = await cloudinary.uploader.upload(att.url, uploadOptions);
          uploadedAttachments.push({
            url: uploaded.secure_url,
            type: att.type,
            originalName: att.name,
          });
        }
      }
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      attachments: uploadedAttachments,
    });

    await newMessage.save();
    await newMessage.populate('sender', 'firstName lastName profilePicture');
    res.status(200).json({ data: newMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    await Message.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(' Error marking messages as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
