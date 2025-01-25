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

    const validResourceTypes = ["Product", "User", "Event"];
    if (!validResourceTypes.includes(resourceType)) {
      return res.status(400).json({ error: "Invalid resourceType" });
    }

    const newComment = new Comment({
      content,
      userId,
      resourceId,
      resourceType,
    });

    await newComment.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: {
        ...newComment.toObject(),
        createdAtFormatted: new Date(newComment.createdAt).toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });
  } catch (err) {
    console.error("Error while adding comment:", err.message);
    res.status(500).json({ message: "Failed to add comment" });
  }
};



export const addReply = async (req, res) => {
  try {
    const { content, parentId } = req.body;

    if (!content || !parentId) {
      return res.status(400).json({ message: "Content and parentId are required" });
    }

    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const reply = new Comment({
      content,
      userId: req.user._id,
      resourceId: parentComment.resourceId,
      resourceType: parentComment.resourceType,
      parentId,
    });

    await reply.save();

    parentComment.replies.push(reply._id);
    await parentComment.save();

    const populatedReply = await reply.populate("userId", "username profilePic");

    res.status(201).json({
      message: "Reply added successfully",
      reply: {
        ...populatedReply.toObject(),
        createdAtFormatted: new Date(reply.createdAt).toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        updatedAtFormatted: new Date(reply.updatedAt).toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });
  } catch (err) {
    console.error("Error while adding reply:", err.message);
    res.status(500).json({ message: "Failed to add reply", error: err.message });
  }
};



export const getComments = async (req, res) => {
  try {
    const { resourceId, resourceType } = req.query;

    if (!resourceId || !resourceType) {
      return res.status(400).json({ error: "resourceId and resourceType are required" });
    }

    const validResourceTypes = ["Product", "User", "Event"];
    if (!validResourceTypes.includes(resourceType)) {
      return res.status(400).json({ error: "Invalid resourceType" });
    }

    const comments = await Comment.find({ resourceId, resourceType })
      .populate("userId", "username profilePic")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "username profilePic" },
      });

    res.status(200).json(
      comments.map((comment) => ({
        ...comment.toObject(),
        createdAtFormatted: new Date(comment.createdAt).toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        updatedAtFormatted: new Date(comment.updatedAt).toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        replies: comment.replies.map((reply) => ({
          ...reply.toObject(),
          createdAtFormatted: new Date(reply.createdAt).toLocaleString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          updatedAtFormatted: new Date(reply.updatedAt).toLocaleString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      }))
    );
  } catch (err) {
    console.error("Error fetching comments:", err.message);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};





export const likeUnlikeComment = async (req, res) => {
  try {
    const { id: commentId } = req.params; // ID-ul comentariului
    const userId = req.user._id; // ID-ul utilizatorului din autentificare

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userLiked = comment.likes.includes(userId);

    if (userLiked) {
      // Retrage like-ul dacă există
      comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Adaugă like și elimină dislike-ul dacă există
      if (comment.dislikes.includes(userId)) {
        comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId.toString());
      }
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      message: userLiked ? "Like removed" : "Liked successfully",
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
    });
  } catch (err) {
    console.error("Error in like/unlike:", err.message);
    res.status(500).json({ message: "Failed to process like/unlike", error: err.message });
  }
};

const handleLikeAndUnlike = async (commentId) => {
  if (!user) {
    showToast("Error", "You must be logged in to like or unlike a comment", "error");
    return;
  }

  try {
    const res = await fetch(`/api/comments/${commentId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include autentificarea
    });

    const data = await res.json();

    if (!res.ok) {
      showToast("Error", data.message || "Failed to like/unlike the comment", "error");
      return;
    }

    // Actualizăm starea locală a comentariilor
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              likes: Array.isArray(comment.likes) ? data.likes : comment.likes,
              dislikes: Array.isArray(comment.dislikes) ? data.dislikes : comment.dislikes,
            }
          : comment
      )
    );

    showToast("Success", data.message, "success");
  } catch (err) {
    console.error("Error in like/unlike:", err.message);
    showToast("Error", "Failed to process your request", "error");
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
      comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Adaugă dislike și elimină like-ul dacă există
      if (comment.likes.includes(userId)) {
        comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
      }
      comment.dislikes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      message: userDisliked ? "Dislike removed" : "Disliked successfully",
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
    });
  } catch (err) {
    console.error("Error in dislike/undislike:", err.message);
    res.status(500).json({ message: "Failed to process dislike/dislike", error: err.message });
  }
};







