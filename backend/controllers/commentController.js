import Comment from '../models/commentModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Event from '../models/eventModel.js';
import mongoose from 'mongoose';
import Notification from '../models/notificationModel.js';
import Gallery from '../models/galleryModel.js';
import Article from '../models/articleModel.js';

export const addComment = async (req, res) => {
  try {
    const { content, userId, resourceId, resourceType } = req.body;

    if (!content || !userId || !resourceId || !resourceType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const validResourceTypes = ['Product', 'User', 'Event', 'Gallery', 'Article'];
    if (!validResourceTypes.includes(resourceType)) {
      return res.status(400).json({ error: 'Invalid resourceType' });
    }

    const newComment = new Comment({
      content,
      userId,
      resourceId,
      resourceType,
    });

    await newComment.save();

    const user = await User.findById(userId).select('firstName lastName username');
    const fullName = `${user?.firstName || 'Someone'} ${user?.lastName || ''}`.trim();

    let ownerId = null;
    let link = '/';

    if (resourceType === 'Product') {
      const product = await Product.findById(resourceId);
      ownerId = product?.user?.toString();
      link = `/products/${resourceId}#comment-${newComment._id}`;
    } else if (resourceType === 'Event') {
      const event = await Event.findById(resourceId);
      ownerId = event?.user?.toString();
      link = `/events/${resourceId}#comment-${newComment._id}`;
    } else if (resourceType === 'Gallery') {
      const gallery = await Gallery.findById(resourceId).populate('owner', 'username');
      ownerId = gallery?.owner?._id?.toString();
      link = `/galleries/${gallery?.owner?.username}/${gallery?.name}#comment-${newComment._id}`;
    } else if (resourceType === 'Article') {
      const article = await Article.findById(resourceId).populate('user', '_id');
      ownerId = article?.user?._id?.toString();
      link = `/articles/${resourceId}#comment-${newComment._id}`;
    } else if (resourceType === 'User') {
      const profileOwner = await User.findById(resourceId);
      ownerId = profileOwner?._id?.toString();
      link = `/profile/${profileOwner?.username}#comment-${newComment._id}`;
    }

    if (ownerId && ownerId !== userId) {
      await Notification.create({
        user: ownerId,
        fromUser: userId,
        resourceType,
        resourceId,
        type: 'new_comment',
        link,
        message:
          resourceType === 'User'
            ? `${fullName} left a comment on your profile.`
            : `${fullName} commented on your ${resourceType.toLowerCase()}.`,
      });
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        ...newComment.toObject(),
        createdAtFormatted: new Date(newComment.createdAt).toLocaleString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    });
  } catch (err) {
    console.error('Error while adding comment:', err.message);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

export const addReply = async (req, res) => {
  try {
    const { content, parentId } = req.body;

    if (!content || !parentId) {
      return res.status(400).json({ message: 'Content and parentId are required' });
    }

    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
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

    if (parentComment.userId.toString() !== req.user._id.toString()) {
      const fromUser = await User.findById(req.user._id).select('firstName lastName');
      const fullName = `${fromUser?.firstName || 'Someone'} ${fromUser?.lastName || ''}`.trim();

      let link = '/';
      const type = parentComment.resourceType;
      const id = parentComment.resourceId;

      if (type === 'Product') link = `/products/${id}#comment-${reply._id}`;
      else if (type === 'Event') link = `/events/${id}#comment-${reply._id}`;
      else if (type === 'Article') link = `/articles/${id}#comment-${reply._id}`;
      else if (type === 'User') {
        const user = await User.findById(id);
        link = `/profile/${user?.username || ''}#comment-${reply._id}`;
      } else if (type === 'Gallery') {
        const gallery = await Gallery.findById(id).populate('owner', 'username');
        link = `/galleries/${gallery?.owner?.username}/${gallery?.name}#comment-${reply._id}`;
      }

      await Notification.create({
        user: parentComment.userId,
        fromUser: req.user._id,
        resourceType: type,
        resourceId: id,
        type: 'new_reply',
        link,
        message: `${fullName} replied to your comment.`,
      });
    }

    const populatedReply = await reply.populate('userId', 'username profilePicture');

    res.status(201).json({
      message: 'Reply added successfully',
      reply: {
        ...populatedReply.toObject(),
        createdAtFormatted: new Date(reply.createdAt).toLocaleString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        updatedAtFormatted: new Date(reply.updatedAt).toLocaleString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    });
  } catch (err) {
    console.error('Error while adding reply:', err.message);
    res.status(500).json({ message: 'Failed to add reply', error: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { resourceId, resourceType } = req.query;

    if (!resourceId || !resourceType) {
      return res.status(400).json({ error: 'resourceId and resourceType are required' });
    }

    const validResourceTypes = ['Product', 'User', 'Event', 'Gallery', 'Article'];
    if (!validResourceTypes.includes(resourceType)) {
      return res.status(400).json({ error: 'Invalid resourceType' });
    }

    const allComments = await Comment.find({ resourceId, resourceType })
      .populate('userId', 'username firstName lastName profilePicture')
      .populate('replies', 'content userId createdAt updatedAt')
      .lean();

    const commentMap = {};
    allComments.forEach((comment) => {
      comment.replies = [];
      commentMap[comment._id] = comment;
    });

    const topLevelComments = [];
    allComments.forEach((comment) => {
      if (comment.parentId) {
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    });

    res.status(200).json(topLevelComments);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const likeUnlikeComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userLiked = comment.likes.includes(userId);

    if (userLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      if (comment.dislikes.includes(userId)) {
        comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId.toString());
      }
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      message: userLiked ? 'Like removed' : 'Liked successfully',
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
    });
  } catch (err) {
    console.error('Error in like/unlike:', err.message);
    res.status(500).json({ message: 'Failed to process like/unlike', error: err.message });
  }
};

const handleLikeAndUnlike = async (commentId) => {
  if (!user) {
    showToast('Error', 'You must be logged in to like or unlike a comment', 'error');
    return;
  }

  try {
    const res = await fetch(`/api/comments/${commentId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      showToast('Error', data.message || 'Failed to like/unlike the comment', 'error');
      return;
    }

    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              likes: Array.isArray(comment.likes) ? data.likes : comment.likes,
              dislikes: Array.isArray(comment.dislikes) ? data.dislikes : comment.dislikes,
            }
          : comment,
      ),
    );

    showToast('Success', data.message, 'success');
  } catch (err) {
    console.error('Error in like/unlike:', err.message);
    showToast('Error', 'Failed to process your request', 'error');
  }
};

export const dislikeUndislikeComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userDisliked = comment.dislikes.includes(userId);

    if (userDisliked) {
      comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId.toString());
    } else {
      if (comment.likes.includes(userId)) {
        comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
      }
      comment.dislikes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      message: userDisliked ? 'Dislike removed' : 'Disliked successfully',
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
    });
  } catch (err) {
    console.error('Error in dislike/undislike:', err.message);
    res.status(500).json({ message: 'Failed to process dislike/dislike', error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const isAdmin = requestingUser.role === 'admin';
    const isOwner = comment.userId.toString() === requestingUser._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "You don't have permission to delete this comment" });
    }

    if (!comment.parentId) {
      await Comment.deleteMany({ parentId: comment._id });
    }

    await Comment.findByIdAndDelete(id);

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
