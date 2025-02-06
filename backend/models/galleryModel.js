import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General", // Categoria produsului (opțional)
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
