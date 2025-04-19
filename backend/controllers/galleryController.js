import Gallery from "../models/galleryModel.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../config/imgUpload.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Notification from "../models/notificationModel.js";
import { createNotification } from "./notificationController.js"; // adaugă sus

export const createGallery = async (req, res) => {
  try {
    const { name, category, description, tags, collaborators, isPublic } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Gallery name is required" });
    }

    let coverPhotoUrl = null;
    if (req.file) {
      coverPhotoUrl = await uploadToCloudinary(req.file);
    }

    const currentUserId = req.user._id.toString();

    // ✅ Parsează ID-urile de colaboratori (indiferent de format)
    let parsedCollaborators = [];
    try {
      const raw = typeof collaborators === "string" ? JSON.parse(collaborators) : collaborators;
      parsedCollaborators = Array.isArray(raw)
        ? raw.map((c) => {
            const id = typeof c === "string" ? c : c?.value;
            return mongoose.Types.ObjectId.isValid(id) ? id : null;
          }).filter(Boolean)
        : [];
    } catch (e) {
      parsedCollaborators = [];
    }

    // ✅ Elimină duplicări: ownerul și colaboratori existenți
    const uniquePendingCollaborators = [
      ...new Set(
        parsedCollaborators.filter((id) => id.toString() !== currentUserId)
      ),
    ];

    const newGallery = new Gallery({
      name,
      category,
      description,
      coverPhoto: coverPhotoUrl,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      owner: currentUserId,
      pendingCollaborators: uniquePendingCollaborators,
      isPublic: isPublic === "true" || isPublic === true,
    });

    await newGallery.save();
    await newGallery.populate("owner", "username");

    await User.findByIdAndUpdate(
      currentUserId,
      { $push: { galleries: newGallery._id } },
      { new: true }
    );

    // ✅ Trimite notificări doar colaboratorilor adăugați efectiv
    for (const userId of uniquePendingCollaborators) {
      await createNotification({
        userId,
        type: "invite",
        message: `${req.user.firstName} ${req.user.lastName} invited you to collaborate on gallery "${name}"`,
        link: `/galleries/${req.user.username}/${name}`,
        meta: { galleryId: newGallery._id },
      });
      console.log("📩 Notificare pentru:", userId);
    }

    res.status(201).json(newGallery);
  } catch (err) {
    console.error("Error creating gallery:", err.message);
    res.status(500).json({ message: err.message });
  }
};





  

// ✅ MODIFICAT pentru a controla accesul corect în funcție de owner/collaborator/pending
// ✅ MODIFICAT pentru a controla accesul corect în funcție de owner/collaborator/pending
export const getGallery = async (req, res) => {
  try {
    const { username } = req.params;
    const galleryName = decodeURIComponent(req.params.galleryName);
    const currentUserId = req.user?._id?.toString();

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🔄 Caută galeria după nume și owner SAU colaborator
    const gallery = await Gallery.findOne({
      name: galleryName,
      $or: [
        { owner: user._id },
        { collaborators: user._id },
      ],
    })
      .populate("owner", "firstName lastName username _id")
      .populate("collaborators", "username firstName lastName _id")
      .populate("pendingCollaborators", "username firstName lastName _id")
      .populate({
        path: "products.product",
        select: "images name price quantity forSale description",
      });

    if (!gallery) return res.status(404).json({ error: "Gallery not found" });

    const ownerId =
      typeof gallery.owner === "object" && gallery.owner._id
        ? gallery.owner._id.toString()
        : gallery.owner.toString();

    const isOwner = currentUserId && ownerId === currentUserId;
    const isCollaborator =
      currentUserId &&
      gallery.collaborators.some((c) => c._id.toString() === currentUserId);

    // 🔐 Verifică accesul
    if (!gallery.isPublic && !isOwner && !isCollaborator) {
      return res.status(403).json({ error: "This gallery is private." });
    }

    gallery.products.sort((a, b) => a.order - b.order);
    return res.status(200).json(gallery);
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

    // 🔄 Actualizări de bază
    gallery.name = name || gallery.name;
    gallery.category = category || gallery.category;
    gallery.description = description || gallery.description;
    gallery.tags = tags ? tags.split(",").map((t) => t.trim()) : gallery.tags;
    gallery.isPublic = isPublic === "true" || isPublic === true;

    // ✅ Parsează colaboratori din request
    let parsedCollaborators = [];
    try {
      const raw = typeof collaborators === "string" ? JSON.parse(collaborators) : collaborators;
      parsedCollaborators = Array.isArray(raw)
        ? raw.map((c) => {
            const id = typeof c === "string" ? c : c?.value;
            return mongoose.Types.ObjectId.isValid(id) ? id : null;
          }).filter(Boolean)
        : [];
    } catch (err) {
      parsedCollaborators = [];
    }

    // ✅ Curățăm listele
    const currentUserId = req.user._id.toString();
    const newCollaborators = new Set();
    const newPending = new Set();

    for (const id of parsedCollaborators) {
      const idStr = id.toString();
      if (idStr === currentUserId) continue; // nu adăuga ownerul

      if (gallery.collaborators.map((c) => c.toString()).includes(idStr)) {
        newCollaborators.add(idStr); // rămâne colaborator
      } else {
        newPending.add(idStr); // invitat nou
      }
    }

    // ✅ Setăm listele
    gallery.collaborators = Array.from(newCollaborators);
    gallery.pendingCollaborators = Array.from(newPending);

    // ✅ Trimitere notificări DOAR celor noi în pending
    for (const userId of newPending) {
      const alreadyNotified = await Notification.findOne({
        user: userId,
        type: "invite",
        "meta.galleryId": gallery._id,
      });

      if (!alreadyNotified) {
        await createNotification({
          userId,
          type: "invite",
          message: `${req.user.firstName} ${req.user.lastName} invited you to collaborate on gallery "${gallery.name}"`,
          link: `/galleries/${req.user.username}/${gallery.name}`,
          meta: { galleryId: gallery._id },
        });
      }
    }

    // 🖼️ Gestionare imagine (opțional)
    const shouldRemoveCover = !req.file && req.body.coverPhoto === "null";
    if (shouldRemoveCover && gallery.coverPhoto) {
      const publicId = gallery.coverPhoto.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
      gallery.coverPhoto = null;
    }

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
      .populate("collaborators", "username firstName lastName _id")
      .populate({
        path: "products.product",
        select: "images name price quantity forSale description",
      });

    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    if (!gallery.owner) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Include și ID-ul userului logat în răspuns
    const currentUserId = req.user?._id?.toString();

    res.status(200).json({
      ...gallery.toObject(), // convertim la obiect pur pentru a putea extinde
      currentUserId,
    });
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
  
  
  export const acceptGalleryInvite = async (req, res) => {
    try {
      const { galleryId } = req.params;
      const userId = req.user._id;
  
      const gallery = await Gallery.findById(galleryId);
      if (!gallery) return res.status(404).json({ error: "Gallery not found" });
  
      const isPending = gallery.pendingCollaborators.some(
        (id) => id.toString() === userId.toString()
      );
            if (!isPending) return res.status(400).json({ error: "No invitation found" });
  
      gallery.collaborators.push(userId);
      gallery.pendingCollaborators = gallery.pendingCollaborators.filter(
        (id) => id.toString() !== userId.toString()
      );

      
      await gallery.save();

      console.log("🎯 Pending:", gallery.pendingCollaborators.map(id => id.toString()));
console.log("👤 Current:", userId.toString());

  
      res.status(200).json({ message: "You are now a collaborator" });
    } catch (err) {
      console.error("Error accepting invite:", err.message);
      res.status(500).json({ error: "Failed to accept invite" });
    }
  };
  
  export const declineGalleryInvite = async (req, res) => {
    try {
      const { galleryId } = req.params;
      const userId = req.user._id;
  
      const gallery = await Gallery.findById(galleryId);
      if (!gallery) return res.status(404).json({ error: "Gallery not found" });
  
      // 🔁 Fix: folosește .some() cu toString() pentru comparație corectă
      const wasPending = gallery.pendingCollaborators.some(
        (id) => id.toString() === userId.toString()
      );
  
      if (!wasPending) return res.status(400).json({ error: "No invite found" });
  
      gallery.pendingCollaborators = gallery.pendingCollaborators.filter(
        (id) => id.toString() !== userId.toString()
      );
      await gallery.save();
  
      // ✅ Șterge notificarea aferentă
      await Notification.deleteMany({
        user: userId,
        type: "invite",
        "meta.galleryId": galleryId,
      });
  
      res.status(200).json({ message: "Invite declined" });
    } catch (err) {
      console.error("Error declining invite:", err.message);
      res.status(500).json({ error: "Failed to decline invite" });
    }
  };