import Product from "../models/productModel.js"
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import {uploadToCloudinary} from "../config/imgUpload.js";
import Comment from "../models/commentModel.js";
import Gallery from "../models/galleryModel.js";
import User from "../models/userModel.js";

export const createProduct = async (req, res) => {
	try {
	  const { name, description, price, quantity, forSale, galleries, images = [], videos = [], audios = [] } = req.body;
  
	  if (!req.user) {
		return res.status(403).json({ error: "User not authenticated" });
	  }
  
	  const uploadedImages = [];
	  const uploadedVideos = [];
	  const uploadedAudios = [];
  
	  // Upload images
	  for (const img of images) {
		if (img.startsWith("data:")) {
		  const uploadRes = await cloudinary.uploader.upload(img);
		  uploadedImages.push(uploadRes.secure_url);
		}
	  }
  
	  // Upload videos
	  for (const video of videos) {
		if (video.startsWith("data:")) {
		  const uploadRes = await cloudinary.uploader.upload(video, { resource_type: "video" });
		  uploadedVideos.push(uploadRes.secure_url);
		}
	  }
  
	  // Upload audios
	  for (const audio of audios) {
		if (audio.startsWith("data:")) {
		  const uploadRes = await cloudinary.uploader.upload(audio, { resource_type: "video" }); // Cloudinary tratează audio ca video
		  uploadedAudios.push(uploadRes.secure_url);
		}
	  }
  
	  const newProduct = new Product({
		name,
		description,
		price,
		quantity: quantity || 0,
		forSale: forSale !== undefined ? forSale : true,
		galleries: galleries || [],
		images: uploadedImages,
		videos: uploadedVideos,
		audios: uploadedAudios,
		user: req.user._id,
	  });
  
	  await newProduct.save();
  
	  if (galleries && galleries.length > 0) {
		await Gallery.updateMany(
		  { _id: { $in: galleries } },
		  { $push: { products: newProduct._id } }
		);
	  }
  
	  res.status(201).json(newProduct);
	} catch (err) {
	  console.error("Error while creating product:", err.message);
	  res.status(500).json({ message: err.message });
	}
  };
  

export const getProduct = async (req, res) => {
	try {
	  const { id } = req.params;
  
	  if (!id) {
		return res.status(400).json({ error: "Product ID is required" });
	  }
  
	  const product = await Product.findById(id)
		.populate("user", "firstName lastName email")
		.populate("galleries", "name type");
  
	  if (!product) {
		return res.status(404).json({ error: "Product not found" });
	  }
  
	  res.status(200).json({ product });
	} catch (err) {
	  console.error("Error while fetching product:", err.message);
	  res.status(500).json({ message: err.message });
	}
  };
  
  
  

  export const deleteProduct = async (req, res) => {
	try {
	  const { id } = req.params;
  
	  if (!id) {
		return res.status(400).json({ error: "Product ID is required" });
	  }
  
	  const product = await Product.findById(id);
	  if (!product) {
		return res.status(404).json({ error: "Product not found" });
	  }
  
	  if (product.user.toString() !== req.user._id.toString()) {
		return res.status(403).json({ error: "Unauthorized action" });
	  }
  
	  await product.deleteOne();
  
	  res.status(200).json({ message: "Product deleted successfully" });
	} catch (err) {
	  console.error("Error deleting product:", err.message);
	  res.status(500).json({ error: "Failed to delete product" });
	}
  };
  
  
  
  
  

  export const updateProduct = async (req, res) => {
	try {
	  const { productId } = req.params;
	  const { name, description, price, quantity, forSale, galleries, images = [], videos = [], audios = [] } = req.body;
  
	  const product = await Product.findById(productId);
	  if (!product) {
		return res.status(404).json({ error: "Product not found" });
	  }
  
	  if (product.user.toString() !== req.user._id.toString()) {
		return res.status(403).json({ error: "Unauthorized action" });
	  }
  
	  // Upload updated images
	  const uploadedImages = [];
	  for (const img of images) {
		if (img.startsWith("data:")) {
		  const uploadRes = await cloudinary.uploader.upload(img);
		  uploadedImages.push(uploadRes.secure_url);
		} else {
		  uploadedImages.push(img); // Already uploaded image
		}
	  }
  
	  // Upload updated videos
	  const uploadedVideos = [];
	  for (const video of videos) {
		if (video.startsWith("data:")) {
		  const uploadRes = await cloudinary.uploader.upload(video, { resource_type: "video" });
		  uploadedVideos.push(uploadRes.secure_url);
		} else {
		  uploadedVideos.push(video);
		}
	  }
  
	  // Upload updated audios
	  const uploadedAudios = [];
	  for (const audio of audios) {
		if (audio.startsWith("data:")) {
		  const uploadRes = await cloudinary.uploader.upload(audio, { resource_type: "video" }); // audio = video tip pentru Cloudinary
		  uploadedAudios.push(uploadRes.secure_url);
		} else {
		  uploadedAudios.push(audio);
		}
	  }
  
	  // Update fields
	  product.name = name || product.name;
	  product.description = description || product.description;
	  product.price = price ?? product.price;
	  product.quantity = quantity ?? product.quantity;
	  product.forSale = forSale !== undefined ? forSale : product.forSale;
	  product.galleries = galleries || product.galleries;
	  product.images = uploadedImages;
	  product.videos = uploadedVideos;
	  product.audios = uploadedAudios;
  
	  await product.save();
	  res.status(200).json(product);
	} catch (err) {
	  console.error("Error updating product:", err.message);
	  res.status(500).json({ error: err.message });
	}
  };
  
  
export const getAllProducts = async (req, res) => {
	try {
	  // Găsește toate produsele și populează informațiile despre utilizator
	  const products = await Product.find()
		.populate("user", "firstName lastName") // Populează datele utilizatorului
		.sort({ createdAt: -1 }); // Sortează produsele în ordine descrescătoare (cele mai recente prime)
  
	  res.status(200).json({ products });
	} catch (err) {
	  console.error("Error fetching all products:", err.message);
	  res.status(500).json({ error: "Failed to fetch products" });
	}
  };
  



  export const getAllProductsWithoutGallery = async (req, res) => {
    try {
      const products = await Product.find({ galleries: { $size: 0 } }).populate("user", "firstName lastName");
      
      res.status(200).json(products);
    } catch (err) {
      console.error("Error fetching all unassigned products:", err.message);
      res.status(500).json({ error: "Failed to fetch products" });
    }
};



export const getProductsNotInGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;

    // Găsește galeria și produsele sale
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    // Găsește produsele care NU sunt în această galerie
    const products = await Product.find({ _id: { $nin: gallery.products } });

    res.status(200).json({ products });
  } catch (err) {
    console.error("Error fetching products not in gallery:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getAllUserProducts = async (req, res) => {
	try {
	  const { username } = req.params;
	  console.log("Fetching products for user:", username);
  
	  // Găsește utilizatorul după username
	  const user = await User.findOne({ username });
	  if (!user) {
		console.error("User not found:", username);
		return res.status(404).json({ error: "User not found" });
	  }
  
	  console.log("User found:", user);
  
	  // Găsește toate produsele utilizatorului
	  const products = await Product.find({ user: user._id });
	  console.log("Products found:", products);
  
	  res.status(200).json({ products });
	} catch (err) {
	  console.error("Error fetching user's products:", err.message);
	  res.status(500).json({ error: "Failed to fetch products" });
	}
  };
  

  export const getAvailableProducts = async (req, res) => {
	try {
	  const products = await Product.find({ forSale: true, quantity: { $gt: 0 } })
		.populate("user", "firstName lastName")
		.sort({ createdAt: -1 });

	  res.status(200).json({ products });
	} catch (err) {
	  console.error("Error fetching available products:", err.message);
	  res.status(500).json({ error: "Failed to fetch products" });
	}
};

export const getDisplayOnlyProducts = async (req, res) => {
	try {
	  const products = await Product.find({ forSale: false })
		.populate("user", "firstName lastName")
		.sort({ createdAt: -1 });

	  res.status(200).json({ products });
	} catch (err) {
	  console.error("Error fetching display-only products:", err.message);
	  res.status(500).json({ error: "Failed to fetch products" });
	}
};

export const addToFavorites = async (req, res) => {
	try {
	  const { id: productId } = req.params;
	  const userId = req.user.id;
  
	  const user = await User.findById(userId);
	  if (!user) return res.status(404).json({ message: "User not found" });
  
	  if (!Array.isArray(user.favorites)) {
		user.favorites = [];
	  }
  
	  if (!user.favorites.includes(productId)) {
		user.favorites.push(productId);
		await user.save();
		return res.json({ message: "Product added to favorites", favorites: user.favorites });
	  }
  
	  return res.status(400).json({ message: "Product already in favorites" });
	} catch (error) {
	  console.error("Error adding to favorites:", error);
	  return res.status(500).json({ message: "Server error", error });
	}
  };


  
export const removeFromFavorites = async (req, res) => {
    try {
        const { id: productId } = req.params; // Extragem ID-ul produsului
        const userId = req.user.id; // ID-ul utilizatorului autentificat

        console.log("Removing favorite product:", productId, "for user:", userId);

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Eliminăm produsul din lista de favorite
        user.favorites = user.favorites.filter((fav) => fav.toString() !== productId);
        await user.save(); // ✅ Salvăm modificarea

        return res.json({ message: "Product removed from favorites" });
    } catch (error) {
        console.error("Error removing product from favorites:", error);
        return res.status(500).json({ message: "Server error", error });
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

    const user = await User.findById(userId).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.favorites);
  } catch (error) {
    console.error("Error fetching favorite products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
