import Gallery from "../models/galleryModel.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../config/imgUpload.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

export const createGallery = async (req, res) => {
  try {
    const { name, category, description, tags, collaborators } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Gallery name is required" });
    }

    let coverPhotoUrl = null;
    if (req.file) {
      coverPhotoUrl = await uploadToCloudinary(req.file);
    }

    const collaboratorIds = collaborators
      ? collaborators.split(",").map((id) => id.trim()).filter(Boolean)
      : [];

    const newGallery = new Gallery({
      name,
      category,
      description,
      coverPhoto: coverPhotoUrl,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      owner: req.user._id,
      collaborators: collaboratorIds,
    });

    await newGallery.save();

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { galleries: newGallery._id } },
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

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const gallery = await Gallery.findOne({ owner: user._id, name: galleryName })
      .populate("owner", "firstName lastName username")
      .populate("collaborators", "username firstName lastName")
      .populate({
        path: "products.product",
        select: "images name price quantity forSale description",
      });

    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    gallery.products.sort((a, b) => a.order - b.order);

    res.status(200).json(gallery);
  } catch (err) {
    console.error("Error fetching gallery:", err.message);
    res.status(500).json({ message: err.message });
  }
};


  
export const getProductsNotInGallery = async (req, res) => {
    try {
      const { galleryId } = req.params;
  
      if (!req.user) {
        return res.status(403).json({ error: "User not authenticated" });
      }
  
      const products = await Product.find({
        user: req.user._id, // Doar produsele utilizatorului conectat
        galleries: { $ne: galleryId }, // Nu sunt asociate galeriei curente
      });
  
      res.status(200).json({ products });
    } catch (err) {
      console.error("Error fetching products not in gallery:", err.message);
      res.status(500).json({ error: "Failed to fetch products not in gallery" });
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
    const { name, category, description, tags, collaborators, isPublic } = req.body;
    const gallery = await Gallery.findById(galleryId);

    if (!gallery) return res.status(404).json({ error: "Gallery not found" });
    if (gallery.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    gallery.name = name || gallery.name;
    gallery.category = category || gallery.category;
    gallery.description = description || gallery.description;
    gallery.tags = tags ? tags.split(",").map((t) => t.trim()) : gallery.tags;
    gallery.collaborators = collaborators
      ? collaborators.split(",").map((id) => id.trim())
      : gallery.collaborators;
    gallery.isPublic = isPublic === "true" || isPublic === true;

    // 🧹 Șterge imaginea anterioară dacă nu mai e dorită
    const shouldRemoveCover = !req.file && req.body.coverPhoto === "null";
    if (shouldRemoveCover && gallery.coverPhoto) {
      const publicId = gallery.coverPhoto.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
      gallery.coverPhoto = null;
    }

    // 🔄 Înlocuiește cu imagine nouă
    if (req.file) {
      if (gallery.coverPhoto) {
        const publicId = gallery.coverPhoto.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      gallery.coverPhoto = await uploadToCloudinary(req.file);
    }

    await gallery.save();
    res.status(200).json(gallery);
  } catch (err) {
    console.error("Error updating gallery:", err.message);
    res.status(500).json({ error: err.message });
  }
};



export const getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find()
      .populate("owner", "firstName lastName profilePicture")
      .populate({
        path: "products",
        select: "images", // ✅ Populează doar imaginile produselor
      })
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

    const isOwner = gallery.owner.toString() === req.user._id.toString();
    const isCollaborator = gallery.collaborators.map(id => id.toString()).includes(req.user._id.toString());

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const alreadyInGallery = gallery.products.some(
      (item) => item.product.toString() === product._id.toString()
    );

    if (!alreadyInGallery) {
      gallery.products.push({
        product: product._id,
        order: gallery.products.length
      });
      await gallery.save();
    }

    if (!product.galleries.includes(gallery._id)) {
      product.galleries.push(gallery._id);
      await product.save();
    }

    res.status(200).json({ message: "Product added to gallery", gallery });
  } catch (err) {
    console.error("Error adding product to gallery:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get gallery by ID (for editing)
export const getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.galleryId)
      .populate("owner", "username")
      .populate("collaborators", "username firstName lastName")
      .populate({
        path: "products.product",
        select: "images name price quantity forSale description",
      });

    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    // verificare dacă owner există după populate
    if (!gallery.owner) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(gallery);
  } catch (err) {
    console.error("Error fetching gallery by ID:", err.message);
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
};



  
export const addMultipleProductsToGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const { productIds } = req.body;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    const isOwner = gallery.owner.toString() === req.user._id.toString();
    const isCollaborator = gallery.collaborators.map(id => id.toString()).includes(req.user._id.toString());

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const existingIds = gallery.products.map((p) => p.product.toString());
    const newProducts = productIds.filter((id) => !existingIds.includes(id));

    newProducts.forEach((id, index) => {
      gallery.products.push({
        product: id,
        order: gallery.products.length + index,
      });
    });

    await gallery.save();

    await Product.updateMany(
      { _id: { $in: newProducts } },
      { $push: { galleries: gallery._id } }
    );

    res.status(200).json({ message: "Products added successfully" });
  } catch (err) {
    console.error("Error adding multiple products to gallery:", err.message);
    res.status(500).json({ error: "Failed to add products" });
  }
};



export const removeProductFromGallery = async (req, res) => {
  try {
    const { galleryId, productId } = req.params;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    const isOwner = gallery.owner.toString() === req.user._id.toString();
    const isCollaborator = gallery.collaborators.map(id => id.toString()).includes(req.user._id.toString());

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    gallery.products = gallery.products.filter(
      (item) => item.product.toString() !== productId
    );
    await gallery.save();

    await Product.findByIdAndUpdate(productId, { $pull: { galleries: gallery._id } });

    res.status(200).json({ message: "Product removed from gallery" });
  } catch (err) {
    console.error("Error removing product from gallery:", err.message);
    res.status(500).json({ error: "Failed to remove product from gallery" });
  }
};


  export const updateProductOrder = async (req, res) => {
    const { galleryId } = req.params;
    const { orderedProductIds } = req.body;
  
    try {
      const gallery = await Gallery.findById(galleryId);
      if (!gallery) return res.status(404).json({ error: "Gallery not found" });
  
      // Reordonează produsele după ID-urile primite
      gallery.products = orderedProductIds.map((productId, index) => ({
        product: productId,
        order: index,
      }));
  
      await gallery.save();
      res.status(200).json({ message: "Product order updated" });
    } catch (err) {
      console.error("Error updating product order:", err.message);
      res.status(500).json({ error: "Failed to update product order" });
    }
  };
  
  