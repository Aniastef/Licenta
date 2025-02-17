import Product from "../models/productModel.js"
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import multer from "multer";
import {uploadToCloudinary} from "../config/imgUpload.js";
import Comment from "../models/commentModel.js";
import Gallery from "../models/galleryModel.js";
import User from "../models/userModel.js";

export const createProduct = async (req, res) => {
	try {
	  const { name, description, price, galleries } = req.body; // ✅ galleries este acum un array
  
	  if (!req.user) {
		return res.status(403).json({ error: "User not authenticated" });
	  }
  
	  // ✅ Upload imagini la Cloudinary
	  const uploadedImages = [];
	  for (const file of req.files) {
		const imageUrl = await uploadToCloudinary(file);
		uploadedImages.push(imageUrl);
	  }
  
	  // ✅ Creăm produsul
	  const newProduct = new Product({
		name,
		description,
		price,
		galleries: galleries ? galleries : [], // ✅ Poate fi gol
		images: uploadedImages,
		user: req.user._id,
	  });
  
	  await newProduct.save();
  
	  // ✅ Adaugă produsul în fiecare galerie selectată
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
		.populate("user", "firstName lastName email") // Populează utilizatorul
		.populate("galleries", "name type"); // Exemplu dacă există galerie
  
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
	  const { name, description, price, image } = req.body;
  
	  const product = await Product.findById(productId);
  
	  if (!product) {
		return res.status(404).json({ error: "Product not found" });
	  }
  
	  // Verifică dacă utilizatorul are permisiunea să actualizeze produsul
	  if (product.user.toString() !== req.user._id.toString()) {
		return res.status(403).json({ error: "Unauthorized action" });
	  }
  
	  product.name = name || product.name;
	  product.description = description || product.description;
	  product.price = price || product.price;
	  product.image = image || product.image;
  
	  await product.save();
  
	  res.status(200).json(product);
	} catch (err) {
	  res.status(500).json({ error: err.message });
	  console.log("Error updating product: ", err.message);
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
  

  
  
  