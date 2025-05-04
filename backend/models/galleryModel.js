import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    
    category: {
      type: String,
      default: "General", 
    },
    description: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String, // Fiecare tag va fi un string
      },
    ],
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        order: { type: Number, default: 0 }
      }
    ],    
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Proprietarul galeriei
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],  
    pendingCollaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  },
  {
    timestamps: true,
  }
);

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
