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





  

export const getGallery = async (req, res) => {
  try {
    const { username } = req.params;
    const galleryName = decodeURIComponent(req.params.galleryName);
    const currentUserId = req.user?._id?.toString();

    // 🔍 Găsește userul după username
    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ User not found:", username);
      return res.status(404).json({ error: "User not found" });
    }

    // 🔍 Găsește galeria asociată
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
        model: "Product", // ✅ Asigură modelul explicit
        select: "images name price quantity forSale description",
      });

    if (!gallery) {
      console.log("❌ Gallery not found:", galleryName);
      return res.status(404).json({ error: "Gallery not found" });
    }

    // 🔐 Verifică permisiunile
    const isOwner = currentUserId && gallery.owner._id.toString() === currentUserId;
    const isCollaborator = currentUserId &&
      gallery.collaborators.some((c) => c._id.toString() === currentUserId);

    if (!gallery.isPublic && !isOwner && !isCollaborator) {
      return res.status(403).json({ error: "This gallery is private." });
    }

    // 🔀 Sortează produsele după `order`
    gallery.products.sort((a, b) => a.order - b.order);

    console.log("📦 Returned product order:", gallery.products.map(p => ({
      id: p.product?._id?.toString(),
      order: p.order
    })));

    return res.status(200).json(gallery);
  } catch (err) {
    console.error("💥 Error in getGallery:", err.message);
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
};










  
export const getProductsNotInGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const userId = req.user._id;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    // 🔍 Ia doar produsele utilizatorului care NU sunt deja în gallery.products
    const existingProductIds = gallery.products.map(p => p.product.toString());

    const products = await Product.find({
      user: userId,
      _id: { $nin: existingProductIds },
    });

    console.log("🧾 Toate produsele tale:", products.map(p => ({
      id: p._id.toString(),
      name: p.name,
    })));
    console.log("🟢 Produse disponibile pt adăugare:", products.map(p => p._id.toString()));

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

    if (
      gallery.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
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
    await gallery.populate("owner", "username"); // 🔥 adaugă această linie
    res.status(200).json(gallery);
  } catch (err) {
    console.error("Error updating gallery:", err.message);
    res.status(500).json({ error: err.message });
  }
};




export const getAllGalleries = async (req, res) => {
  try {
   // getAllGalleries
   const galleries = await Gallery.find()
   .populate("owner", "username firstName lastName profilePicture")
   .populate("collaborators", "firstName lastName")
   .populate({
     path: "products",
     select: "images",
   })
   .select("name category tags products owner coverPhoto collaborators createdAt") // 👈 AICI!
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

    const isOwner = gallery.owner.toString() === req.user._id.toString();
    const isCollaborator = gallery.collaborators
      .map((id) => id.toString())
      .includes(req.user._id.toString());

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    if (!orderedProductIds || !Array.isArray(orderedProductIds) || orderedProductIds.length === 0) {
      return res.status(400).json({ error: "No product IDs provided" });
    }

    const existingIds = gallery.products.map((p) => p.product.toString());
    const allIdsValid = orderedProductIds.every((id) => existingIds.includes(id));

    if (!allIdsValid) {
      console.warn("⚠️ Invalid product IDs in new order", orderedProductIds);
      return res.status(400).json({ error: "Invalid product IDs in order" });
    }

    gallery.products = gallery.products
      .filter((p) => orderedProductIds.includes(p.product.toString()))
      .sort(
        (a, b) =>
          orderedProductIds.indexOf(a.product.toString()) -
          orderedProductIds.indexOf(b.product.toString())
      )
      .map((p, index) => ({
        ...p.toObject(), // preserve subdocument _id
        order: index,
      }));

    console.log(
      "✅ Saved new product order:",
      gallery.products.map((p) => ({
        id: p.product.toString(),
        order: p.order,
      }))
    );

    await gallery.save();
    return res.status(200).json({ message: "Product order updated" });
  } catch (err) {
    console.error("❌ Error updating product order:", err.message);
    return res.status(500).json({ error: "Failed to update product order" });
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

  export const getAllUserGalleries = async (req, res) => {
    try {
      const { username } = req.params;
  
      // Caută utilizatorul după username
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      // Caută galeriile unde userul e owner sau colaborator
      const galleries = await Gallery.find({
        $or: [{ owner: user._id }, { collaborators: user._id }],
      })
        .populate("owner", "firstName lastName username")
        .populate("collaborators", "firstName lastName")
        .populate({
          path: "products",
          select: "images",
        })
        .select("name tags products owner coverPhoto collaborators isPublic")
        .sort({ createdAt: -1 });
  
      res.status(200).json({ galleries, user });
    } catch (err) {
      console.error("Error fetching user galleries:", err.message);
      res.status(500).json({ error: "Failed to fetch user galleries" });
    }
  };
  