import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Photography", "Sculpture", "Painting", "Other"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Produse asociate galeriei
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Proprietarul galeriei
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
