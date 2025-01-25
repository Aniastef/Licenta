import Product from "../models/productModel.js"
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import multer from "multer";
import {uploadToCloudinary} from "../config/imgUpload.js";
import Comment from "../models/commentModel.js";

export const createProduct = async (req, res) => {
	try {
	  const { name, description, price, gallery } = req.body;
  
	  if (!req.user) {
		return res.status(403).json({ error: "User not authenticated" });
	  }
  
	  const uploadedImages = [];
	  for (const file of req.files) {
		const imageUrl = await uploadToCloudinary(file);
		uploadedImages.push(imageUrl);
	  }
  
	  const newProduct = new Product({
		name,
		description,
		price,
		gallery,
		images: uploadedImages,
		user: req.user._id,
	  });
  
	  await newProduct.save();
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
		.populate("gallery", "name type"); // Exemplu dacă există galerie
  
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
	  const { productId } = req.params;
  
	  const product = await Product.findById(productId);
  
	  if (!product) {
		return res.status(404).json({ error: "Product not found" });
	  }
  
	  // Verifică dacă utilizatorul are permisiunea să șteargă produsul
	  if (product.user.toString() !== req.user._id.toString()) {
		return res.status(403).json({ error: "Unauthorized action" });
	  }
  
	  await product.deleteOne();
  
	  res.status(200).json({ message: "Product deleted successfully" });
	} catch (err) {
	  res.status(500).json({ error: err.message });
	  console.log("Error deleting product: ", err.message);
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
  



