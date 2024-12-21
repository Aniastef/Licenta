import Comment from "../models/commentModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Event from "../models/eventModel.js";
import mongoose from "mongoose";

export const addComment = async (req, res) => {
  try {
    const { content, userId, resourceId, resourceType } = req.body;

    // Validare date de intrare
    if (!content || !userId || !resourceId || !resourceType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Verifică dacă resursa există
    let resource;
    if (resourceType === "Product") {
      resource = await Product.findById(resourceId);
    } else if (resourceType === "Event") {
      resource = await Event.findById(resourceId);
    } else {
      return res.status(400).json({ error: "Invalid resource type" });
    }

    if (!resource) {
      return res.status(404).json({ error: `${resourceType} not found` });
    }

    // Creează comentariul
    const newComment = new Comment({
      content,
      userId,
      resourceId,
      resourceType,
    });

    await newComment.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (err) {
    console.error("Error while adding comment:", err.message);
    res.status(500).json({ error: "Failed to add comment" });
  }
};


export const getComments = async (req, res) => {
  try {
    const { resourceId, resourceType } = req.query;

    // Validare parametri
    if (!resourceId || !resourceType) {
      return res.status(400).json({ error: "resourceId and resourceType are required" });
    }

    // Găsește comentariile asociate resursei
    const comments = await Comment.find({ resourceId, resourceType })
      .populate("userId", "username profilePic") // Populează informații despre utilizator
      .populate({
        path: "replies",
        populate: { path: "userId", select: "username profilePic" }, // Populează răspunsurile
      });

    res.status(200).json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err.message);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};
