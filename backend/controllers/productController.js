import Product from "../models/productModel.js"

export const createProduct = async (req, res) => {
	try {
	  const { name, description, price, images } = req.body;
  
	
	  if (!name || !price) {
		return res.status(400).json({ error: "Name and price are required" });
	  }
  
	
	  let uploadedImages = [];
	  if (images && Array.isArray(images)) {
		for (const image of images) {
		  const uploadedResponse = await cloudinary.uploader.upload(image);
		  uploadedImages.push(uploadedResponse.secure_url);
		}
	  }
  
	  const newProduct = new Product({
		name,
		description,
		price,
		images: uploadedImages,
	  });
  
	  await newProduct.save();
  
	  res.status(201).json({
		success: true,
		message: "Product created successfully",
		product: newProduct,
	  });
	} catch (err) {
	  console.error("Error creating product: ", err.message);
	  res.status(500).json({ error: err.message });
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

export const addImageToProduct = async (req, res) => {
	try {
		const { productId } = req.params;
		const { imageUrl } = req.body; 

		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		
		product.images.push(imageUrl);
		await product.save();

		res.status(200).json({ message: "Image added successfully", images: product.images });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error adding image: ", err.message);
	}
};


export const removeImageFromProduct = async (req, res) => {
	try {
		const { productId } = req.params;
		const { imageUrl } = req.body; // URL-ul imaginii de șters

		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		
		product.images = product.images.filter((img) => img !== imageUrl);
		await product.save();

		res.status(200).json({ message: "Image removed successfully", images: product.images });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error removing image: ", err.message);
	}
};

export const getProductImages = async (req, res) => {
	try {
		const { productId } = req.params;

		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		res.status(200).json({ images: product.images });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error fetching product images: ", err.message);
	}
};





