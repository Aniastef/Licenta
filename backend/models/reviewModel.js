import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Creează câmpuri createdAt și updatedAt
  }
);

// Asigură că un utilizator poate lăsa un singur review per produs
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
