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
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", req.user._id] }, "$receiver", "$sender"],
          },
          lastMessage: { $last: "$content" },
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
          "user.profilePicture": 1,  // ✅ Adăugăm poza de profil
          "lastMessage": 1,
        }
      }
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
    console.log("📢 Fetching messages between:", req.user._id, "and", userId); // DEBUG

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
    .populate("sender", "firstName lastName profilePicture")
    .populate("receiver", "firstName lastName profilePicture")
    .sort({ timestamp: 1 });
    

    console.log("✅ Found messages:", messages);
    res.status(200).json({ messages });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: "Receiver and content are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "Invalid receiver ID" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    await message.save();

    res.status(201).json({ message: "Message sent successfully", data: message });
  } catch (err) {
    console.error("Error in sendMessage:", err);
    res.status(500).json({ error: "Server error" });
  }
};
