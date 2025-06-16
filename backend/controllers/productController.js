import Product from '../models/productModel.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import { uploadToCloudinary } from '../config/imgUpload.js';
import Comment from '../models/commentModel.js';
import Gallery from '../models/galleryModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import { addAuditLog } from './auditLogController.js'; // ← modifică path-ul dacă e diferit

// în productController.js


export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      writing,
      price,
      quantity,
      forSale, // This 'forSale' variable is already available here
      galleries,
      images = [],
      videos = [],
      audios = [],
      category,
    } = req.body;

    if (!req.user) {
      console.error('Error: User not authenticated for product creation.');
      return res.status(403).json({ error: 'User not authenticated' });
    }

    const uploadedImages = [];
    const uploadedVideos = [];
    const uploadedAudios = [];

    // --- Image/Video/Audio Upload Logic (no changes needed here from last review) ---
    for (const img of images) {
      if (img && img.startsWith('data:')) {
        try {
          const uploadRes = await cloudinary.uploader.upload(img);
          uploadedImages.push(uploadRes.secure_url);
        } catch (uploadError) {
          console.error('Cloudinary Image Upload Error:', uploadError);
        }
      }
    }

    for (const video of videos) {
      if (video && video.startsWith('data:')) {
        try {
          const uploadRes = await cloudinary.uploader.upload(video, { resource_type: 'video', folder: 'products_videos' });
          uploadedVideos.push(uploadRes.secure_url);
        } catch (uploadError) {
          console.error('Cloudinary Video Upload Error:', uploadError);
        }
      }
    }

    for (const audio of audios) {
      if (audio && audio.startsWith('data:')) {
        try {
          const uploadRes = await cloudinary.uploader.upload(audio, { resource_type: 'raw', folder: 'products_audios' }); // Keep 'raw' or 'auto'
          uploadedAudios.push(uploadRes.secure_url);
        } catch (uploadError) {
          console.error('Cloudinary Audio Upload Error:', uploadError);
        }
      }
    }
    // --- End Upload Logic ---

    // Sanitize and provide defaults for newProduct creation
const newProduct = new Product({
      title,
      description: description?.trim() || 'No description',
      price: forSale ? (price !== undefined && price !== null ? price : 0) : undefined,
      quantity: quantity || 0,
      forSale: forSale !== undefined ? forSale : true,
      images: uploadedImages,
      videos: uploadedVideos,
      audios: uploadedAudios,
      writing,
      category: Array.isArray(category) && category.length > 0 ? category : ['General'],
      user: req.user._id,
      // CORRECTED LINE: Map incoming gallery IDs to the schema's expected format
      galleries: Array.isArray(galleries) && galleries.length > 0
        ? galleries.map(gId => ({ gallery: gId, order: 0 })) // Default order to 0 for new products
        : [],
    });

    // Price validation specific for 'forSale'
    // This check can now safely use newProduct.forSale because newProduct is defined.
    // However, the prior fix made 'price' 0 if undefined, so this check for `price <= 0` is now the relevant part for validation.
    if (newProduct.forSale && newProduct.price <= 0) { // Assuming 0 is not a valid sale price, adjust if it is.
        return res.status(400).json({ error: 'Price must be greater than 0 if artwork is for sale.' });
    }
    // If you want to allow price 0, remove the `newProduct.price <= 0` part.
    // If you just want to ensure it's not undefined if for sale, the line above where newProduct is created already handles it by setting it to 0.


    await newProduct.save();
    console.log('Product saved successfully:', newProduct._id);

    // Update user's products array
    await User.findByIdAndUpdate(req.user._id, { $push: { products: newProduct._id } });
    console.log('User document updated with new product ID.');

    // Add audit log
    await addAuditLog({
      action: 'create_product',
      performedBy: req.user._id,
      targetProduct: newProduct._id,
      details: `Created artwork: ${newProduct.title}`,
    });
    console.log('Audit log added.');

    // Update Galleries with 'order' field (logic is okay from previous step)
    if (galleries && galleries.length > 0) {
      console.log(`Processing ${galleries.length} galleries for new product ${newProduct._id}.`);
      for (const galleryId of galleries) {
        try {
          const gallery = await Gallery.findById(galleryId);

          if (gallery) {
            if (!Array.isArray(gallery.products)) {
                gallery.products = [];
                console.warn(`Gallery ${gallery._id} products array was not an array. Initialized.`);
            }

            if (!gallery.products.some(p => p.product && p.product.toString() === newProduct._id.toString())) {
              const currentOrders = gallery.products.map(p => p.order || 0);
              const nextOrder = currentOrders.length > 0
                ? Math.max(...currentOrders) + 1
                : 0;

              gallery.products.push({ product: newProduct._id, order: nextOrder });
              await gallery.save();
              console.log(`Product ${newProduct._id} successfully added to gallery ${galleryId} with order ${nextOrder}.`);
            }
          } else {
            console.warn(`Gallery with ID ${galleryId} not found when attempting to add product ${newProduct._id}.`);
          }
        } catch (galleryUpdateError) {
          console.error(`ERROR PROCESSING GALLERY ${galleryId} FOR PRODUCT ${newProduct._id}:`, galleryUpdateError.message);
        }
      }
    }

    res.status(201).json(newProduct);

  } catch (err) {
    console.error('FATAL SERVER ERROR IN createProduct FUNCTION:', err.stack || err.message || err);
    res.status(500).json({ error: 'Server error during product creation', details: err.message });
  }
};
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findById(id)
      .populate('user', 'username firstName lastName')
      .populate({
        path: 'galleries.gallery', // Populează câmpul 'gallery' din obiectele din array-ul 'galleries'
        select: '_id name', // Selectează doar _id și name
      });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ product });
  } catch (err) {
    console.error('Error while fetching product:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// în productController.js

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (
      product.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    // NOU: Șterge referința din documentul utilizatorului
    await User.findByIdAndUpdate(product.user, { $pull: { products: product._id } });

    await product.deleteOne();

    await addAuditLog({
      action: 'delete_product',
      performedBy: req.user._id,
      targetProduct: product._id,
      details: `Deleted product: ${product.title}`,
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      title,
      description,
      price,
      quantity,
      forSale,
      galleries,
      images = [],
      videos = [],
      audios = [],
      writing,
      category,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.user) {
      return res.status(403).json({ error: 'Product owner is missing' });
    }

    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    // Upload updated images
    const uploadedImages = [];
    for (const img of images) {
      if (img.startsWith('data:')) {
        const uploadRes = await cloudinary.uploader.upload(img);
        uploadedImages.push(uploadRes.secure_url);
      } else {
        uploadedImages.push(img); // Already uploaded image
      }
    }

    // Upload updated videos
    const uploadedVideos = [];
    for (const video of videos) {
      if (video.startsWith('data:')) {
        const uploadRes = await cloudinary.uploader.upload(video, { resource_type: 'video' });
        uploadedVideos.push(uploadRes.secure_url);
      } else {
        uploadedVideos.push(video);
      }
    }

    // Upload updated audios
    const uploadedAudios = [];
    for (const audio of audios) {
      if (audio.startsWith('data:')) {
        const uploadRes = await cloudinary.uploader.upload(audio, { resource_type: 'video' }); // audio = video tip pentru Cloudinary
        uploadedAudios.push(uploadRes.secure_url);
      } else {
        uploadedAudios.push(audio);
      }
    }

    // Update fields
    product.title = title || product.title;
    product.description = description?.trim() || product.description || 'No description';
    product.price = price ?? product.price;
    product.quantity = quantity ?? product.quantity;
    product.forSale = forSale !== undefined ? forSale : product.forSale;
    product.galleries = galleries || product.galleries;
    product.images = uploadedImages;
    product.videos = uploadedVideos;
    product.audios = uploadedAudios;
    product.writing = writing ?? product.writing;
    product.category = category || product.category;

    await product.save();
    await addAuditLog({
      action: 'update_product',
      performedBy: req.user._id,
      targetProduct: product._id,
      details: `Updated product: ${product.title}`,
    });

    res.status(200).json(product);
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// export const updateProductRating = async (productId) => {
// const comments = await Comment.find({ resourceId: productId, resourceType: "Product", rating: { $exists: true } });
// if (comments.length > 0) {
// 	const avg = comments.reduce((sum, c) => sum + c.rating, 0) / comments.length;
// 	await Product.findByIdAndUpdate(productId, { averageRating: avg.toFixed(2) });
// }
// };

export const getAllProducts = async (req, res) => {
  try {
    // Găsește toate produsele și populează informațiile despre utilizator
    const products = await Product.find()
      .populate('user', 'firstName lastName') // Populează datele utilizatorului
      .sort({ createdAt: -1 }); // Sortează produsele în ordine descrescătoare (cele mai recente prime)

    res.status(200).json({ products });
  } catch (err) {
    console.error('Error fetching all products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getAllProductsWithoutGallery = async (req, res) => {
  try {
    const products = await Product.find({ galleries: { $size: 0 } }).populate(
      'user',
      'firstName lastName',
    );

    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching all unassigned products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductsNotInGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;

    // Găsește galeria și produsele sale
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    // Găsește produsele care NU sunt în această galerie
    const products = await Product.find({ _id: { $nin: gallery.products } });

    res.status(200).json({ products });
  } catch (err) {
    console.error('Error fetching products not in gallery:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getAllUserProducts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('firstName lastName username');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const products = await Product.find({ user: user._id })
      .populate('galleries.gallery', 'name')
      .select('title price  quantity forSale images videos audios writing galleries createdAt');

    res.status(200).json({ user, products }); // ✅ trimite și user
  } catch (err) {
    console.error("Error fetching user's products:", err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getAvailableProducts = async (req, res) => {
  try {
    const products = await Product.find({ forSale: true, quantity: { $gt: 0 } })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err) {
    console.error('Error fetching available products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getDisplayOnlyProducts = async (req, res) => {
  try {
    const products = await Product.find({ forSale: false })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err) {
    console.error('Error fetching display-only products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const addToFavorites = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const product = await Product.findById(productId).populate('user', 'username');

    if (!user || !product) {
      return res.status(404).json({ message: 'User or product not found' });
    }

    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();

      // ✅ Trimite notificare dacă utilizatorul NU e proprietarul produsului
      if (product.user._id.toString() !== userId.toString()) {
        await Notification.create({
          user: product.user._id, // destinatar: creatorul produsului
          fromUser: user._id, // cine a dat favorite
          resourceType: 'Product',
          resourceId: product._id,
          type: 'favorite_product',
          message: `${user.username} added your product "${product.title}" to favorites.`,
        });
      }

      return res.json({ message: 'Product added to favorites', favorites: user.favorites });
    }

    return res.status(400).json({ message: 'Product already in favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const removeFromFavorites = async (req, res) => {
  try {
    const { id: productId } = req.params; // Extragem ID-ul produsului
    const userId = req.user.id; // ID-ul utilizatorului autentificat

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Eliminăm produsul din lista de favorite
    user.favorites = user.favorites.filter((fav) => fav.toString() !== productId);
    await user.save(); // ✅ Salvăm modificarea

    return res.json({ message: 'Product removed from favorites' });
  } catch (error) {
    console.error('Error removing product from favorites:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

//   export const getFavoriteProducts = async (req, res) => {
// 	try {
// 	  const user = await User.findById(req.params.userId).populate("favorites");
// 	  if (!user) return res.status(404).json({ message: "User not found" });

// 	  res.json(user.favorites);
// 	} catch (error) {
// 	  res.status(500).json({ message: "Server error", error });
// 	}
//   };

export const getFavoriteProducts = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate('favorites');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.favorites);
  } catch (error) {
    console.error('Error fetching favorite products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
