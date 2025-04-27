import mongoose from "mongoose";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";

export const getConversations = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.error("❌ User ID not found in request.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("🔄 Fetching conversations for user:", req.user._id);

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
            $cond: [{ $eq: ["$sender", req.user._id] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: { content: "$content", timestamp: "$timestamp", sender: "$sender" } },
          isUnread: {
            $first: {
              $cond: [
                { $and: [{ $eq: ["$receiver", req.user._id] }, { $eq: ["$isRead", false] }] },
                true,
                false,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          "user._id": 1,
          "user.firstName": 1,
          "user.lastName": 1,
          "user.profilePicture": 1,
          "lastMessage.content": 1,
          "lastMessage.timestamp": 1,
          "lastMessage.sender": 1,
          "isUnread": 1,
        },
      },
      { $sort: { "lastMessage.timestamp": -1 } }, // Sortare conversații
    ]);
    
    

    console.log("✅ Conversations found:", conversations);
    res.status(200).json({ conversations });
  } catch (err) {
    console.error("❌ Error fetching conversations:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📢 Fetching messages between:", req.user._id, "and", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid user ID:", userId);
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const messages = await Message.find({
  $or: [
    { sender: req.user._id, receiver: userId },
    { sender: userId, receiver: req.user._id },
  ],
})
.populate("sender", "firstName lastName profilePicture") // ✅ Verifică aici
.populate("receiver", "firstName lastName profilePicture")
.sort({ timestamp: 1 });


    console.log("✅ Messages response:", JSON.stringify(messages, null, 2)); // 🔥 DEBUGGING

    res.status(200).json({ messages });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      return res.status(400).json({ error: "Missing fields." });
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    // ✅ Dacă expeditorul l-a blocat pe destinatar
    if (sender.blockedUsers.includes(receiverId)) {
      return res.status(403).json({ error: "You blocked this user." });
    }

    // ✅ Dacă destinatarul l-a blocat pe expeditor
    if (receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({ error: "You are blocked by this user." });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    await newMessage.save();
    res.status(200).json({ data: newMessage });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
};



export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    await Message.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      {
        $set: {
          isRead: true,
          readAt: new Date(), // 👈 setăm ora la care s-a citit
        },
      }
    );
    

    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    console.error("❌ Error marking messages as read:", err);
    res.status(500).json({ error: "Server error" });
  }
};
