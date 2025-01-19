import Comment from "../models/commentModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Event from "../models/eventModel.js";
import mongoose from "mongoose";

export const addComment = async (req, res) => {
  try {
    const { content, userId, resourceId, resourceType } = req.body;

    if (!content || !userId || !resourceId || !resourceType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Creează comentariul
    const newComment = new Comment({
      content,
      userId,
      resourceId,
      resourceType,
    });

    await newComment.save();
    res.status(201).json({ message: "Comment added successfully", comment: newComment });
  } catch (err) {
    console.error("Error while adding comment:", err.message);
    res.status(500).json({ message: "Failed to add comment" });
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

export const addReply = async (req, res) => {
  try {
    const { content, parentId } = req.body;

    if (!content || !parentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const reply = new Comment({
      content,
      userId: req.user._id, // User autenticat din middleware
      resourceId: parentComment.resourceId,
      resourceType: parentComment.resourceType,
    });

    await reply.save();

    parentComment.replies.push(reply._id);
    await parentComment.save();

    return res.status(201).json({ message: "Reply added successfully", reply });
  } catch (err) {
    console.error("Error while adding reply:", err.message);
    return res.status(500).json({ message: "Failed to add reply", error: err.message });
  }
};

export const likeUnlikeComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userLiked = comment.likes.includes(userId);

    if (userLiked) {
      // Retrage like-ul dacă există
      comment.likes.pull(userId);
      await comment.save();

      return res.status(200).json({
        message: "Like removed",
        likes: comment.likes.length,
        dislikes: comment.dislikes.length,
      });
    } else {
      // Adaugă like
      if (comment.dislikes.includes(userId)) {
        comment.dislikes.pull(userId); // Elimină dislike-ul dacă există
      }
      comment.likes.push(userId);
      await comment.save();

      return res.status(200).json({
        message: "Liked successfully",
        likes: comment.likes.length,
        dislikes: comment.dislikes.length,
      });
    }
  } catch (err) {
    console.error("Error in like/unlike:", err.message);
    res.status(500).json({ message: "Failed to process like/unlike", error: err.message });
  }
};

export const dislikeUndislikeComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userDisliked = comment.dislikes.includes(userId);

    if (userDisliked) {
      // Retrage dislike-ul dacă există
      comment.dislikes.pull(userId);
      await comment.save();

      return res.status(200).json({
        message: "Dislike removed",
        likes: comment.likes.length,
        dislikes: comment.dislikes.length,
      });
    } else {
      // Adaugă dislike
      if (comment.likes.includes(userId)) {
        comment.likes.pull(userId); // Elimină like-ul dacă există
      }
      comment.dislikes.push(userId);
      await comment.save();

      return res.status(200).json({
        message: "Disliked successfully",
        likes: comment.likes.length,
        dislikes: comment.dislikes.length,
      });
    }
  } catch (err) {
    console.error("Error in dislike/undislike:", err.message);
    res.status(500).json({ message: "Failed to process dislike/undislike", error: err.message });
  }
};







