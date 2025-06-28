import Gallery from '../models/galleryModel.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import { uploadToCloudinary } from '../config/imgUpload.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Notification from '../models/notificationModel.js';
import { createNotification } from './notificationController.js';
import { addAuditLog } from './auditLogController.js';

export const createGallery = async (req, res) => {
  try {
    const { name, description, collaborators, isPublic } = req.body;
    let { category, tags } = req.body;

    if (typeof category === 'string') {
      try {
        category = JSON.parse(category);
      } catch (e) {
        console.error('Error parsing category JSON:', e);
        return res.status(400).json({ error: 'Invalid category format.' });
      }
    }
    if (!Array.isArray(category)) {
      category = [];
    }
    if (category.length === 0) {
      category = ['General'];
    }

    if (typeof tags === 'string') {
      tags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    } else if (!Array.isArray(tags)) {
      tags = [];
    }

    if (!name) {
      return res.status(400).json({ error: 'Gallery name is required' });
    }

    let coverPhotoUrl = null;
    if (req.file) {
      coverPhotoUrl = await uploadToCloudinary(req.file);
    } else if (req.body.coverPhoto === 'null') {
      coverPhotoUrl = '';
    }

    const currentUserId = req.user._id.toString();

    let parsedCollaborators = [];
    try {
      const raw = typeof collaborators === 'string' ? JSON.parse(collaborators) : collaborators;
      parsedCollaborators = Array.isArray(raw)
        ? raw
            .map((c) => {
              const id = typeof c === 'string' ? c : c?.value;
              return mongoose.Types.ObjectId.isValid(id) ? id : null;
            })
            .filter(Boolean)
        : [];
    } catch (e) {
      parsedCollaborators = [];
      console.error('Error parsing collaborators:', e.message);
    }

    const uniquePendingCollaborators = [
      ...new Set(parsedCollaborators.filter((id) => id.toString() !== currentUserId)),
    ];

    const newGallery = new Gallery({
      name,
      category,
      description,
      coverPhoto: coverPhotoUrl,
      tags,
      owner: currentUserId,
      pendingCollaborators: uniquePendingCollaborators,
      isPublic: isPublic === 'true' || isPublic === true,
    });

    await newGallery.save();
    await addAuditLog({
      action: 'create_gallery',
      performedBy: req.user._id,
      targetGallery: newGallery._id,
      details: `Created gallery: ${newGallery.name}`,
    });

    await newGallery.populate('owner', 'username');

    await User.findByIdAndUpdate(
      currentUserId,
      { $push: { galleries: newGallery._id } },
      { new: true },
    );

    for (const userId of uniquePendingCollaborators) {
      await createNotification({
        userId,
        type: 'invite',
        message: `${req.user.firstName} ${req.user.lastName} invited you to collaborate on gallery "${name}"`,
        link: `/galleries/${newGallery._id}`,
        meta: { galleryId: newGallery._id },
      });
    }

    res.status(201).json(newGallery);
  } catch (err) {
    console.error('Error creating gallery:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const currentUserId = req.user?._id?.toString();

    const gallery = await Gallery.findById(galleryId)
      .populate('owner', 'firstName lastName username _id')
      .populate('collaborators', 'username firstName lastName _id')
      .populate('pendingCollaborators', 'username firstName lastName _id')
      .populate({
        path: 'products.product',
        model: 'Product',
        select: 'images title price quantity forSale description tags',
      });

    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    const isOwner = currentUserId && gallery.owner._id.toString() === currentUserId;
    const isCollaborator =
      currentUserId && gallery.collaborators.some((c) => c._id.toString() === currentUserId);

    if (!gallery.isPublic && !isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'This gallery is private.' });
    }

    gallery.products.sort((a, b) => a.order - b.order);
    return res.status(200).json(gallery);
  } catch (err) {
    console.error(' Error in getGallery:', err.message);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
};

export const getProductsNotInGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const userId = req.user._id;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    const existingProductIds = gallery.products.map((p) => p.product.toString());

    const products = await Product.find({
      user: userId,
      _id: { $nin: existingProductIds },
    });

    res.status(200).json({ products });
  } catch (err) {
    console.error('Error fetching products not in gallery:', err.message);
    res.status(500).json({ error: 'Failed to fetch products not in gallery' });
  }
};

export const deleteGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    if (gallery.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    const productIdsInGallery = gallery.products.map((p) => p.product);
    if (productIdsInGallery.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIdsInGallery } },
        { $pull: { galleries: { gallery: galleryId } } },
      );
    }

    await gallery.deleteOne();

    await User.findByIdAndUpdate(gallery.owner, { $pull: { galleries: galleryId } });

    res.status(200).json({ message: 'Gallery deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error('Error deleting gallery: ', err.message);
  }
};

export const updateGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const { name, description, collaborators, isPublic } = req.body;
    let { category, tags } = req.body;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    if (gallery.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    if (typeof category === 'string') {
      try {
        category = JSON.parse(category);
      } catch (e) {
        console.error('Error parsing category JSON for update:', e);
        return res.status(400).json({ error: 'Invalid category format for update.' });
      }
    }
    if (!Array.isArray(category)) {
      category = gallery.category || ['General'];
    }

    if (typeof tags === 'string') {
      tags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (tags === undefined) {
      tags = gallery.tags;
    } else if (!Array.isArray(tags)) {
      tags = [];
    }

    gallery.name = name || gallery.name;
    gallery.category = category;
    gallery.description = description || gallery.description;
    gallery.tags = tags;
    gallery.isPublic = isPublic === 'true' || isPublic === true;

    let parsedCollaborators = [];
    try {
      const raw = typeof collaborators === 'string' ? JSON.parse(collaborators) : collaborators;
      parsedCollaborators = Array.isArray(raw)
        ? raw
            .map((c) => {
              const id = typeof c === 'string' ? c : c?.value;
              return mongoose.Types.ObjectId.isValid(id) ? id : null;
            })
            .filter(Boolean)
        : [];
    } catch (err) {
      parsedCollaborators = [];
      console.error('Error parsing collaborators for update:', err.message);
    }

    const currentUserId = req.user._id.toString();
    const newCollaborators = new Set();
    const newPending = new Set();

    const existingCollaboratorStrings = gallery.collaborators.map((c) => c.toString());
    const existingPendingStrings = gallery.pendingCollaborators.map((p) => p.toString());

    for (const id of parsedCollaborators) {
      const idStr = id.toString();
      if (idStr === currentUserId) continue;

      if (existingCollaboratorStrings.includes(idStr)) {
        newCollaborators.add(idStr);
      } else if (!existingPendingStrings.includes(idStr)) {
        newPending.add(idStr);
      }
    }

    const collaboratorsToRemove = existingCollaboratorStrings.filter(
      (id) => !newCollaborators.has(id) && !newPending.has(id),
    );

    const pendingToRemove = existingPendingStrings.filter(
      (id) => !newCollaborators.has(id) && !newPending.has(id),
    );

    gallery.collaborators = Array.from(newCollaborators).map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    gallery.pendingCollaborators = Array.from(newPending).map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    if (pendingToRemove.length > 0) {
      await Notification.deleteMany({
        recipient: { $in: pendingToRemove.map((id) => new mongoose.Types.ObjectId(id)) },
        type: 'invite',
        'meta.galleryId': galleryId,
      });
      for (const userId of pendingToRemove) {
        await createNotification({
          userId: userId,
          type: 'info',
          message: `Your invitation to collaborate on "${gallery.name}" was withdrawn.`,
          link: `/galleries`,
          meta: { galleryId: gallery._id },
        });
        addAuditLog(
          currentUserId,
          `Withdrew collaboration invite for ${userId} from gallery "${gallery.name}"`,
        );
      }
    }

    if (collaboratorsToRemove.length > 0) {
      await Notification.deleteMany({
        recipient: { $in: collaboratorsToRemove.map((id) => new mongoose.Types.ObjectId(id)) },
        type: { $in: ['invite', 'info'] },
        'meta.galleryId': galleryId,
      });
      for (const userId of collaboratorsToRemove) {
        await createNotification({
          userId: userId,
          type: 'info',
          message: `You have been removed as a collaborator from "${gallery.name}".`,
          link: `/galleries`,
          meta: { galleryId: gallery._id },
        });
        addAuditLog(currentUserId, `Removed collaborator ${userId} from gallery "${gallery.name}"`);
      }
    }

    for (const userId of newPending) {
      const alreadyNotified = await Notification.findOne({
        userId: userId,
        type: 'invite',
        'meta.galleryId': gallery._id,
      });

      if (!alreadyNotified) {
        await createNotification({
          userId: userId,
          type: 'invite',
          message: `${req.user.firstName} ${req.user.lastName} invited you to collaborate on gallery "${gallery.name}"`,
          link: `/galleries/${gallery._id}`,
          meta: { galleryId: gallery._id },
        });
        addAuditLog(
          currentUserId,
          `Sent collaboration invite to ${userId} for gallery "${gallery.name}"`,
        );
      }
    }

    const shouldRemoveCover = !req.file && req.body.coverPhoto === 'null';
    if (shouldRemoveCover && gallery.coverPhoto) {
      const publicId = gallery.coverPhoto.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
      gallery.coverPhoto = null;
    }

    if (req.file) {
      if (gallery.coverPhoto) {
        const publicId = gallery.coverPhoto.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
      gallery.coverPhoto = await uploadToCloudinary(req.file);
    }

    await gallery.save();

    await addAuditLog({
      action: 'update_gallery',
      performedBy: req.user._id,
      targetGallery: gallery._id,
      details: `Updated gallery: ${gallery.name}`,
    });

    await gallery.populate('owner', 'username');
    res.status(200).json(gallery);
  } catch (err) {
    console.error('Error updating gallery:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find()
      .populate('owner', 'username firstName lastName profilePicture')
      .populate('collaborators', 'firstName lastName')
      .populate({
        path: 'products.product',
        select: 'images',
      })
      .select('name category tags products owner coverPhoto collaborators createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ galleries });
  } catch (err) {
    console.error('Error fetching all galleries:', err.message);
    res.status(500).json({ error: 'Failed to fetch galleries' });
  }
};

export const addProductToGallery = async (req, res) => {
  try {
    const { galleryId, productId } = req.params;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const isOwner = gallery.owner.toString() === req.user._id.toString();
    const isCollaborator = gallery.collaborators
      .map((id) => id.toString())
      .includes(req.user._id.toString());

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    const alreadyInGallery = gallery.products.some(
      (item) => item.product.toString() === product._id.toString(),
    );

    if (!alreadyInGallery) {
      gallery.products.push({
        product: product._id,
        order: gallery.products.length,
      });
      await gallery.save();
    }

    const productInThisGallery = product.galleries.some(
      (g) => g.gallery.toString() === gallery._id.toString(),
    );

    if (!productInThisGallery) {
      product.galleries.push({ gallery: gallery._id, order: 0 });
      await product.save();
    }

    res.status(200).json({ message: 'Product added to gallery', gallery });
  } catch (err) {
    console.error('Error adding product to gallery:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const addMultipleProductsToGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const { productIds } = req.body;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    const isOwner = gallery.owner.toString() === req.user._id.toString();
    const isCollaborator = gallery.collaborators
      .map((id) => id.toString())
      .includes(req.user._id.toString());

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'Unauthorized action' });
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

    if (newProducts.length > 0) {
      await Product.updateMany(
        { _id: { $in: newProducts } },
        { $addToSet: { galleries: { gallery: gallery._id, order: 0 } } },
      );
    }

    res.status(200).json({ message: 'Products added successfully' });
  } catch (err) {
    console.error('Error adding multiple products to gallery:', err.message);
    res.status(500).json({ error: 'Failed to add products' });
  }
};

export const removeProductFromGallery = async (req, res) => {
  try {
    const { galleryId, productId } = req.params;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    const isOwner = gallery.owner.toString() === req.user._id.toString();
    const isCollaborator = gallery.collaborators
      .map((id) => id.toString())
      .includes(req.user._id.toString());

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    gallery.products = gallery.products.filter((item) => item.product.toString() !== productId);
    await gallery.save();

    await Product.findByIdAndUpdate(productId, { $pull: { galleries: { gallery: gallery._id } } });

    res.status(200).json({ message: 'Product removed from gallery' });
  } catch (err) {
    console.error('Error removing product from gallery:', err.message);
    res.status(500).json({ error: 'Failed to remove product from gallery' });
  }
};

export const updateProductOrder = async (req, res) => {
  const { galleryId } = req.params;
  const { orderedProductIds } = req.body;

  try {
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const isOwner = gallery.owner.toString() === req.user._id.toString();
    const isCollaborator = gallery.collaborators
      .map((id) => id.toString())
      .includes(req.user._id.toString());

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    if (!orderedProductIds || !Array.isArray(orderedProductIds) || orderedProductIds.length === 0) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }

    const existingIds = gallery.products.map((p) => p.product.toString());
    const allIdsValid = orderedProductIds.every((id) => existingIds.includes(id));

    if (!allIdsValid) {
      console.warn('⚠️ Invalid product IDs in new order', orderedProductIds);
      return res.status(400).json({ error: 'Invalid product IDs in order' });
    }

    gallery.products = gallery.products
      .filter((p) => orderedProductIds.includes(p.product.toString()))
      .sort(
        (a, b) =>
          orderedProductIds.indexOf(a.product.toString()) -
          orderedProductIds.indexOf(b.product.toString()),
      )
      .map((p, index) => ({
        ...p.toObject(),
        order: index,
      }));

    await gallery.save();
    return res.status(200).json({ message: 'Product order updated' });
  } catch (err) {
    console.error(' Error updating product order:', err.message);
    return res.status(500).json({ error: 'Failed to update product order' });
  }
};

export const acceptGalleryInvite = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const userId = req.user._id;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const isPending = gallery.pendingCollaborators.some(
      (id) => id.toString() === userId.toString(),
    );
    if (!isPending) return res.status(400).json({ error: 'No invitation found' });

    gallery.collaborators.push(userId);
    gallery.pendingCollaborators = gallery.pendingCollaborators.filter(
      (id) => id.toString() !== userId.toString(),
    );

    await gallery.save();

    await Notification.updateMany(
      { 'meta.galleryId': galleryId, type: 'invite', user: userId },
      { seen: true },
    );

    res.status(200).json({ message: 'You are now a collaborator' });
  } catch (err) {
    console.error('Error accepting invite:', err.message);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
};

export const declineGalleryInvite = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const userId = req.user._id;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const wasPending = gallery.pendingCollaborators.some(
      (id) => id.toString() === userId.toString(),
    );

    if (!wasPending) return res.status(400).json({ error: 'No invite found' });

    gallery.pendingCollaborators = gallery.pendingCollaborators.filter(
      (id) => id.toString() !== userId.toString(),
    );
    await gallery.save();

    await Notification.deleteMany({
      user: userId,
      type: 'invite',
      'meta.galleryId': galleryId,
    });

    res.status(200).json({ message: 'Invite declined' });
  } catch (err) {
    console.error('Error declining invite:', err.message);
    res.status(500).json({ error: 'Failed to decline invite' });
  }
};

export const getFavoriteGalleries = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('favoriteGalleries');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user.favoriteGalleries);
  } catch (error) {
    console.error('Error fetching favorite galleries:', error.message);
    res.status(500).json({ error: 'Failed to fetch favorite galleries' });
  }
};

export const getAllUserGalleries = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const galleries = await Gallery.find({
      $or: [{ owner: user._id }, { collaborators: user._id }],
    })
      .populate('owner', 'firstName lastName username')
      .populate('collaborators', 'firstName lastName')
      .populate({
        path: 'products.product',
        select: 'title description images price quantity forSale tags',
      })
      .select('name tags products owner coverPhoto collaborators isPublic')
      .sort({ createdAt: -1 });

    res.status(200).json({ galleries, user });
  } catch (err) {
    console.error('Error fetching user galleries:', err.message);
    res.status(500).json({ error: 'Failed to fetch user galleries' });
  }
};
