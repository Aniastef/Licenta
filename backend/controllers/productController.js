import Product from "../models/productModel.js"
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import multer from "multer";
import {uploadToCloudinary} from "../config/imgUpload.js";

export const createProduct = async (req, res) => {
  try {

	console.log(req.headers);
	console.log(req.body);
	console.log(req.files);

    const { name, description, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
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
      images: uploadedImages,
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

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("Error while fetching product:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
	try {
		const { productId } = req.params;

		const product = await Product.findByIdAndDelete(productId );

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

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

export const addProductComment = async (req, res) => {
	try {
		const { productId} = req.params; 
		const { user, comment } = req.body;

		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

        product.comments.push({ user, comment });
		await product.save();

		res.status(201).json({ message: "Comment added successfully", comments: product.comments });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error adding comment: ", err.message);
	}
};


export const addToFavorites = async (req, res) => {
	try {
		const { productId } = req.params; 
		const { userId } = req.body; 

		const product = await Product.findById(productId );
		const user = await User.findById(userId);

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// add product to user's favorites list
		if (!user.favorites.includes(productId)) {
			user.favorites.push(productId);
			await user.save();
		} else {
			return res.status(400).json({ error: "Product already in user's favorites" });
		}

		// add user to product's favorites list
		if (!product.favorites.includes(userId)) {
			product.favorites.push(userId);
			await product.save();
		} else {
			return res.status(400).json({ error: "User already added this product to favorites" });
		}

		res.status(200).json({ message: "Added to favorites", userFavorites: user.favorites, productFavorites: product.favorites });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error adding product to favorites: ", err.message);
	}
};



export const removeFromFavorites = async (req, res) => {
	try {
		const { productId } = req.params; // ID produs
		const { userId } = req.body; // ID utilizator

		const product = await Product.findById(productId);
		const user = await User.findById(userId);

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// delete product from user's favorites
		user.favorites = user.favorites.filter((favoriteProductId) => favoriteProductId.toString() !== id);
		await user.save();

		// delete user from product's favorites list
		product.favorites = product.favorites.filter((favoriteUserId) => favoriteUserId.toString() !== userId);
		await product.save();

		res.status(200).json({ message: "Removed from favorites", userFavorites: user.favorites, productFavorites: product.favorites });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error removing product from favorites: ", err.message);
	}
};



