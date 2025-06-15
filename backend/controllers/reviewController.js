// controllers/reviewController.js
import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

// 🔁 Recalculare medie rating după modificări
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ productId });
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { averageRating: 0 });
    return;
  }

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, { averageRating: avg.toFixed(2) });
};

// ✅ Adaugă sau actualizează review (1 per user/product)
export const addOrUpdateReview = async (req, res) => {
  try {
    const { productId, rating, content } = req.body;
    const userId = req.user._id;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid review data' });
    }

    const existing = await Review.findOne({ productId, userId });

    if (existing) {
      existing.rating = rating;
      existing.content = content;
      await existing.save();
    } else {
      await Review.create({ productId, userId, rating, content });
    }

    await updateProductRating(productId);
    const product = await Product.findById(productId).populate('user', 'username');
    if (product && product.user && product.user._id.toString() !== userId.toString()) {
      await Notification.create({
        user: product.user._id,
        fromUser: userId,
        type: 'review_product',
        resourceType: 'Product',
        resourceId: productId,
        message: `${req.user.username} left a review on your product "${product.name}"`,
      });
    }

    res.status(200).json({ message: 'Review saved successfully' });
  } catch (err) {
    console.error('Error saving review:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Returnează toate review-urile pentru un produs
export const getReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).populate('userId', 'username profilePicture');

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// ✅ Șterge review-ul unui utilizator
export const deleteReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOneAndDelete({ productId, userId });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    await updateProductRating(productId);
    res.status(200).json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review' });
  }
};
