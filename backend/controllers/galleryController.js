import Gallery from "../models/galleryModel.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../config/imgUpload.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Notification from "../models/notificationModel.js";
import { createNotification } from "./notificationController.js"; // adaugă sus
import { addAuditLog } from "./auditLogController.js"; // ← modifică path-ul dacă e diferit

export const createGallery = async (req, res) => {
  try {
    const { name, description, collaborators, isPublic } = req.body; // Remove category and tags from destructuring here
    let { category, tags } = req.body; // Declare them as mutable

    // --- FIX 1: Parse category from JSON string ---
    if (typeof category === 'string') {
      try {
        category = JSON.parse(category);
      } catch (e) {
        console.error("Error parsing category JSON:", e);
        return res.status(400).json({ error: "Invalid category format." });
      }
    }
    if (!Array.isArray(category)) {
      category = []; // Ensure it's an array if parsing failed or it wasn't an array initially
    }
    // Set a default if it's empty after parsing
    if (category.length === 0) {
      category = ['General'];
    }

    // --- FIX 2: Parse tags from comma-separated string ---
    if (typeof tags === 'string') {
      tags = tags.split(",").map(tag => tag.trim()).filter(Boolean); // Filter(Boolean) removes empty strings
    } else if (!Array.isArray(tags)) {
      tags = []; // Ensure it's an array
    }


    if (!name) {
      return res.status(400).json({ error: "Gallery name is required" });
    }

    let coverPhotoUrl = null;
    if (req.file) {
      coverPhotoUrl = await uploadToCloudinary(req.file);
    } else if (req.body.coverPhoto === 'null') { // Handle explicit removal
      coverPhotoUrl = '';
    }


    const currentUserId = req.user._id.toString();

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
      console.error("Error parsing collaborators:", e.message); // Added console.error
    }

    const uniquePendingCollaborators = [
      ...new Set(
        parsedCollaborators.filter((id) => id.toString() !== currentUserId)
      ),
    ];

    const newGallery = new Gallery({
      name,
      category, // Use the parsed category
      description,
      coverPhoto: coverPhotoUrl,
      tags, // Use the parsed tags
      owner: currentUserId,
      pendingCollaborators: uniquePendingCollaborators,
      isPublic: isPublic === "true" || isPublic === true,
    });

    await newGallery.save();
    await addAuditLog({
      action: "create_gallery",
      performedBy: req.user._id,
      targetGallery: newGallery._id,
      details: `Created gallery: ${newGallery.name}`,
    });

    await newGallery.populate("owner", "username");

    await User.findByIdAndUpdate(
      currentUserId,
      { $push: { galleries: newGallery._id } },
      { new: true }
    );

    for (const userId of uniquePendingCollaborators) {
      await createNotification({
        userId,
        type: "invite",
        message: `${req.user.firstName} ${req.user.lastName} invited you to collaborate on gallery "${name}"`,
        link: `/galleries/${newGallery._id}`,
        meta: { galleryId: newGallery._id },
      });
    }

    res.status(201).json(newGallery);
  } catch (err) {
    console.error("Error creating gallery:", err.message); // Log the specific error message
    res.status(500).json({ message: err.message });
  }
};
  

export const getGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const currentUserId = req.user?._id?.toString();  // ← aici e nevoie să fie autentificat

    const gallery = await Gallery.findById(galleryId)
      .populate("owner", "firstName lastName username _id")
      .populate("collaborators", "username firstName lastName _id")
      .populate("pendingCollaborators", "username firstName lastName _id")
      .populate({
        path: "products.product",
        model: "Product",
        select: "images title price quantity forSale description tags", // Adaugă 'tags' aici
      });

    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    const isOwner = currentUserId && gallery.owner._id.toString() === currentUserId;
    const isCollaborator = currentUserId && gallery.collaborators.some(c => c._id.toString() === currentUserId);

    if (!gallery.isPublic && !isOwner && !isCollaborator) {
      return res.status(403).json({ error: "This gallery is private." });
    }

    gallery.products.sort((a, b) => a.order - b.order);
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
    const { name, description, collaborators, isPublic } = req.body; // Remove category and tags from destructuring
    let { category, tags } = req.body; // Declare them as mutable

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) return res.status(404).json({ error: "Gallery not found" });

    if (
      gallery.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    // --- FIX 1: Parse category from JSON string ---
    if (typeof category === 'string') {
      try {
        category = JSON.parse(category);
      } catch (e) {
        console.error("Error parsing category JSON for update:", e);
        return res.status(400).json({ error: "Invalid category format for update." });
      }
    }
    // If category is not provided in update, retain existing. If it's an empty array, it will be saved as such.
    if (!Array.isArray(category)) {
      category = gallery.category || ['General'];
    }


    // --- FIX 2: Parse tags from comma-separated string ---
    if (typeof tags === 'string') {
      tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    } else if (tags === undefined) { // If tags field is completely omitted, retain existing
        tags = gallery.tags;
    } else if (!Array.isArray(tags)) { // If it's not a string and not undefined, ensure it's an array
        tags = [];
    }


    // 🔄 Actualizări de bază
    gallery.name = name || gallery.name;
    gallery.category = category; // Use the parsed category
    gallery.description = description || gallery.description;
    gallery.tags = tags; // Use the parsed tags
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
      console.error("Error parsing collaborators for update:", err.message); // Added console.error
    }

    // ✅ Curățăm listele
    const currentUserId = req.user._id.toString();
    const newCollaborators = new Set();
    const newPending = new Set();

    // Existing collaborators and pending collaborators as strings for easy comparison
    const existingCollaboratorStrings = gallery.collaborators.map(c => c.toString());
    const existingPendingStrings = gallery.pendingCollaborators.map(p => p.toString());

    // Determine who should be a collaborator or pending based on the new list
    for (const id of parsedCollaborators) {
      const idStr = id.toString();
      if (idStr === currentUserId) continue;

      if (existingCollaboratorStrings.includes(idStr)) {
        newCollaborators.add(idStr); // Remains a collaborator
      } else if (!existingPendingStrings.includes(idStr)) {
        newPending.add(idStr); // New invite, not already pending
      }
    }

    // Identify collaborators to remove (no longer in parsedCollaborators)
    const collaboratorsToRemove = existingCollaboratorStrings.filter(
        id => !newCollaborators.has(id) && !newPending.has(id)
    );

    // Identify pending invites to remove (no longer in parsedCollaborators)
    const pendingToRemove = existingPendingStrings.filter(
        id => !newCollaborators.has(id) && !newPending.has(id)
    );


    // Update gallery's collaborators and pendingCollaborators
    gallery.collaborators = Array.from(newCollaborators).map(id => new mongoose.Types.ObjectId(id));
    gallery.pendingCollaborators = Array.from(newPending).map(id => new mongoose.Types.ObjectId(id));

    // Remove old notifications for declined/removed invites
    if (pendingToRemove.length > 0) {
      await Notification.deleteMany({
        recipient: { $in: pendingToRemove.map(id => new mongoose.Types.ObjectId(id)) },
        type: "invite",
        "meta.galleryId": galleryId,
      });
      // Optionally notify users that their invite was rescinded
      for (const userId of pendingToRemove) {
        await createNotification({
          userId: userId,
          type: "info",
          message: `Your invitation to collaborate on "${gallery.name}" was withdrawn.`,
          link: `/galleries`, // Or relevant page
          meta: { galleryId: gallery._id },
        });
        addAuditLog(currentUserId, `Withdrew collaboration invite for ${userId} from gallery "${gallery.name}"`);
      }
    }

    // Notify users who were removed as collaborators
    if (collaboratorsToRemove.length > 0) {
      await Notification.deleteMany({ // Clear any old notifications for them related to this gallery
        recipient: { $in: collaboratorsToRemove.map(id => new mongoose.Types.ObjectId(id)) },
        type: { $in: ["invite", "info"] }, // Maybe other types too
        "meta.galleryId": galleryId,
      });
      for (const userId of collaboratorsToRemove) {
        await createNotification({
          userId: userId,
          type: "info",
          message: `You have been removed as a collaborator from "${gallery.name}".`,
          link: `/galleries`, // Or relevant page
          meta: { galleryId: gallery._id },
        });
        addAuditLog(currentUserId, `Removed collaborator ${userId} from gallery "${gallery.name}"`);
      }
    }


    // ✅ Trimitere notificări DOAR celor noi în pending
    for (const userId of newPending) {
      const alreadyNotified = await Notification.findOne({
        userId: userId, // Corrected to userId
        type: "invite",
        "meta.galleryId": gallery._id,
      });

      if (!alreadyNotified) {
        await createNotification({
          userId: userId, // Corrected to userId
          type: "invite",
          message: `${req.user.firstName} ${req.user.lastName} invited you to collaborate on gallery "${gallery.name}"`,
          link: `/galleries/${gallery._id}`,
          meta: { galleryId: gallery._id },
        });
        addAuditLog(currentUserId, `Sent collaboration invite to ${userId} for gallery "${gallery.name}"`);
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

    // Fix: The audit log for "delete_gallery" should not be here in updateGallery.
    // Ensure you log "update_gallery" only once and correctly.
    await addAuditLog({
      action: "update_gallery",
      performedBy: req.user._id,
      targetGallery: gallery._id,
      details: `Updated gallery: ${gallery.name}`,
    });

    await gallery.populate("owner", "username");
    res.status(200).json(gallery);
  } catch (err) {
    console.error("Error updating gallery:", err.message); // Log the specific error message
    res.status(500).json({ error: err.message });
  }
};
// ... rest of your controller



export const getAllGalleries = async (req, res) => {
  try {
   // getAllGalleries
 const galleries = await Gallery.find()
  .populate("owner", "username firstName lastName profilePicture")
  .populate("collaborators", "firstName lastName")
  .populate({
    path: "products.product",
    select: "images", // ← doar câmpuri esențiale
  })
  .select("name category tags products owner coverPhoto collaborators createdAt")
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

  export const getFavoriteGalleries = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is authenticated and req.user is populated

    const user = await User.findById(userId).select('favoriteGalleries');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the array of favorite gallery IDs
    res.status(200).json(user.favoriteGalleries);
  } catch (error) {
    console.error("Error fetching favorite galleries:", error.message);
    res.status(500).json({ error: "Failed to fetch favorite galleries" });
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
       // In your galleryController.js (getAllUserGalleries function)
        .populate({
            path: "products.product", // This is key!
            select: "title description images price quantity forSale tags", // Select all fields needed by GalleryCard
        })  
        .select("name tags products owner coverPhoto collaborators isPublic")
        .sort({ createdAt: -1 });
  
      res.status(200).json({ galleries, user });
    } catch (err) {
      console.error("Error fetching user galleries:", err.message);
      res.status(500).json({ error: "Failed to fetch user galleries" });
    }
  };