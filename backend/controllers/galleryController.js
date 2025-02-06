import Gallery from "../models/galleryModel.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../config/imgUpload.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

export const createGallery = async (req, res) => {
    try {
      const { name, category, description, tags } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Gallery name is required" });
      }
  
      let coverPhotoUrl = null;
      if (req.file) {
        coverPhotoUrl = await uploadToCloudinary(req.file);
      }
  
      // Crearea galeriei
      const newGallery = new Gallery({
        name,
        category,
        description,
        coverPhoto: coverPhotoUrl,
        tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
        owner: req.user._id,
      });
  
      await newGallery.save();
  
      // 🔹 Adaugă galeria la utilizator
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { galleries: newGallery._id } }, // Adaugă ID-ul galeriei în lista utilizatorului
        { new: true }
      );
  
      res.status(201).json(newGallery);
    } catch (err) {
      console.error("Error creating gallery:", err.message);
      res.status(500).json({ message: err.message });
    }
  };
  

  export const getGallery = async (req, res) => {
    try {
      const { username, galleryName } = req.params;
      if (!username || !galleryName) {
        return res.status(400).json({ error: "Username and Gallery Name are required" });
      }
  
      // ✅ Găsește utilizatorul după username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // ✅ Caută galeria după owner (ID-ul utilizatorului)
      const gallery = await Gallery.findOne({ owner: user._id, name: galleryName })
        .populate("owner", "firstName lastName username");
  
      if (!gallery) {
        return res.status(404).json({ error: "Gallery not found" });
      }
  
      res.status(200).json(gallery);
    } catch (err) {
      console.error("Error fetching gallery:", err.message);
      res.status(500).json({ message: err.message });
    }
  };
  
  

export const deleteGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    if (gallery.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    await gallery.deleteOne();
    res.status(200).json({ message: "Gallery deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error("Error deleting gallery: ", err.message);
  }
};

export const updateGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const { name, category, description, coverPhoto, tags } = req.body;
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    if (gallery.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    gallery.name = name || gallery.name;
    gallery.category = category || gallery.category;
    gallery.description = description || gallery.description;
    gallery.coverPhoto = coverPhoto || gallery.coverPhoto;
    gallery.tags = tags || gallery.tags;

    await gallery.save();
    res.status(200).json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error("Error updating gallery: ", err.message);
  }
};

export const getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find()
      .populate("owner", "firstName lastName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ galleries });
  } catch (err) {
    console.error("Error fetching all galleries:", err.message);
    res.status(500).json({ error: "Failed to fetch galleries" });
  }
};

export const addProductToGallery = async (req, res) => {
    try {
      const { galleryId, productId } = req.params;
  
      const gallery = await Gallery.findById(galleryId);
      if (!gallery) return res.status(404).json({ error: "Gallery not found" });
  
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });
  
      if (gallery.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Unauthorized action" });
      }
  
      gallery.products.push(product._id);
      await gallery.save();
  
      res.status(200).json({ message: "Product added to gallery", gallery });
    } catch (err) {
      console.error("Error adding product to gallery:", err.message);
      res.status(500).json({ message: err.message });
    }
  };