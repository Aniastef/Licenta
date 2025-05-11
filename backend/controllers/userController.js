import User from "../models/userModel.js"
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Gallery from "../models/galleryModel.js";
import Product from "../models/productModel.js";
import Article from "../models/articleModel.js"; // Asigură-te că e importat

export const getUserProfile = async (req, res) => {
	try {
	  const username = req.params.username;
	  const currentUserId = req.user?._id?.toString();
  
	  const user = await User.findOne({ username }).select("-password -updatedAt");
	  if (!user) return res.status(404).json({ message: "User not found" });
  
	  const isSelfProfile = currentUserId && user._id.toString() === currentUserId;
  
	 // 1. Galeriile create de acest user
const ownedGalleries = await Gallery.find({ owner: user._id })
.select("name isPublic owner collaborators pendingCollaborators coverPhoto type tags");

// 2. Galeriile unde acest user e colaborator (deținute de alții)
const collaboratedGalleries = await Gallery.find({
collaborators: user._id,
owner: { $ne: user._id },
}).select("name isPublic owner collaborators pendingCollaborators coverPhoto type tags");

  
	  // Vizibilitatea galeriilor
	  const visibleGalleries = [...ownedGalleries, ...collaboratedGalleries].filter((gallery) => {
		if (gallery.isPublic) return true;
		if (!currentUserId) return false;
  
		const isOwner = gallery.owner.toString() === currentUserId;
		const isCollaborator = gallery.collaborators.some(
		  (c) => c.toString() === currentUserId
		);
		return isOwner || isCollaborator;
	  });
  
	  user.galleries = visibleGalleries;
  
	  // Populare pentru events
	  await user.populate([
		{
		  path: "eventsMarkedInterested",
		  select: "name date time location coverImage",
		  populate: { path: "user", select: "firstName lastName" },
		},
		{
		  path: "eventsMarkedGoing",
		  select: "name date time location coverImage",
		  populate: { path: "user", select: "firstName lastName" },
		},
		{
		  path: "events",
		  select: "name date time location coverImage",
		  populate: { path: "user", select: "firstName lastName" },
		},
	  ]);
  

	  // ⚠️ QUERY SEPARAT PENTRU PRODUSE (NU populate pe `products[]`)
	  const products = await Product.find({ user: user._id })
		.select("name price images tags createdAt")
		.sort({ createdAt: -1 }); // Cele mai noi

		const articles = await Article.find({ user: user._id })
  .select("title subtitle createdAt content")
  .sort({ createdAt: -1 })
  .limit(3);



	  // Atașez produsele separat
	  const userObject = user.toObject(); // Convertesc din Mongoose Document în obiect simplu
	  userObject.products = products;
  userObject.articles = articles;

	  return res.status(200).json(userObject);
	} catch (err) {
	  console.error("Error in getUserProfile:", err.message);
	  res.status(500).json({ error: err.message });
	}
  };
  
  export const removeArticleFromFavorites = async (req, res) => {
	try {
	  const { articleId } = req.body;
	  const user = await User.findById(req.user._id);
	  if (!user) return res.status(404).json({ error: "User not found" });
  
	  user.favoriteArticles = user.favoriteArticles.filter(
		(id) => id.toString() !== articleId
	  );
	  await user.save();
  
	  res.status(200).json({ message: "Removed from favorites" });
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };

  
  export const addArticleToFavorites = async (req, res) => {
	try {
	  const { articleId } = req.body;
	  const user = await User.findById(req.user._id);
	  if (!user) return res.status(404).json({ error: "User not found" });
  
	  if (!user.favoriteArticles.includes(articleId)) {
		user.favoriteArticles.push(articleId);
		await user.save();
	  }
  
	  res.status(200).json({ message: "Article added to favorites" });
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };
  
  export const signupUser = async (req, res) => {
	try {
	  const {
		firstName,
		lastName,
		email,
		username,
		password,
		confirmPassword,
		gender,
		pronouns,
		address,
		city,
		country,
		phone,
		bio,
		profilePicture,
	  } = req.body;
  
	  if (password !== confirmPassword) {
		return res.status(400).json({ error: "Passwords do not match" });
	  }
	  
	  const userExists = await User.findOne({ $or: [{ email }, { username }] });
	  if (userExists) {
		return res.status(400).json({ error: "User already exists" });
	  }
	  
	  const salt = await bcrypt.genSalt(10);
	  const hashedPassword = await bcrypt.hash(password, salt);
	  
	  let profilePictureUrl = null;

	  if (profilePicture) {
		// Dacă este deja un URL Cloudinary (probabil începe cu "http" sau "https"), nu face upload
		if (profilePicture.startsWith("http")) {
		  profilePictureUrl = profilePicture;
		} else {
		  // Altfel, presupune că este base64 sau data URL și urcă pe Cloudinary
		  const uploadedResponse = await cloudinary.uploader.upload(profilePicture, {
			folder: "profiles",
			resource_type: "auto",
		  });
		  profilePictureUrl = uploadedResponse.secure_url;
		}
	  }
	  
	  
	  const isFirstUser = (await User.countDocuments()) === 0;
	  
	  const newUser = new User({
		firstName,
		lastName,
		email,
		username,
		password: hashedPassword,
		gender,
		pronouns,
		address,
		city,
		country,
		phone,
		bio,
		profilePicture: profilePictureUrl, // 🔥
		role: isFirstUser ? "superadmin" : "user",
	  });
	  
	  await newUser.save();
	  generateTokenAndSetCookie(newUser._id, res);
	  
	  res.status(201).json({
		_id: newUser._id,
		firstName: newUser.firstName,
		lastName: newUser.lastName,
		email: newUser.email,
		username: newUser.username,
		bio: newUser.bio,
		profilePicture: newUser.profilePicture,
		location: newUser.location,
		profession: newUser.profession,
		age: newUser.age,
		instagram: newUser.instagram,
		facebook: newUser.facebook,
		webpage: newUser.webpage,
		soundcloud: newUser.soundcloud,
		spotify: newUser.spotify,
		linkedin: newUser.linkedin,
		phone: newUser.phone,
		hobbies: newUser.hobbies,
		gender: newUser.gender,
		pronouns: newUser.pronouns,
		address: newUser.address,
		city: newUser.city,
		country: newUser.country,
	  });
	  
	  
	  
	} catch (err) {
	  res.status(500).json({ message: err.message });
	  console.log("Error while signing user up: ", err.message);
	}
  };
  



export const loginUser = async (req, res) => {
	try {
	  const { username, password } = req.body;
	  const user = await User.findOne({ username });
  
	  if (!user) 
		return res.status(400).json({ error: "Invalid username or password" });
  
	  // ✅ Verifică dacă utilizatorul este blocat
	  if (user.isBlocked) {
		return res.status(403).json({ error: "Your account has been blocked. Contact support for assistance." });
	  }
  
	  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  
	  if (!isPasswordCorrect) 
		return res.status(400).json({ error: "Invalid username or password" });
  
	  generateTokenAndSetCookie(user._id, res);
  
	  res.status(200).json({
		_id: user._id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		username: user.username,
		bio: user.bio,
		profilePicture: user.profilePicture,
		location: user.location,
		profession: user.profession,
		age: user.age,
		instagram: user.instagram,
		facebook: user.facebook,
		webpage: user.webpage,
		soundcloud: user.soundcloud,
		spotify: user.spotify,
		linkedin: user.linkedin,
		phone: user.phone,
		hobbies: user.hobbies,
	  });
	  
  
	} catch (error) {
	  res.status(500).json({ error: error.message });
	  console.log("Error in loginUser: ", error.message);
	}
  };
  
  

  export const searchUsers = async (req, res) => {
	try {
	  const { query } = req.query;
	  if (!query) return res.status(400).json({ error: "Query is required" });
  
	  const users = await User.find({
		$or: [
		  { firstName: new RegExp(query, "i") },
		  { lastName: new RegExp(query, "i") },
		  { username: new RegExp(query, "i") },
		],
	  }).select("_id firstName lastName username profilePicture"); // 👈 Aici lipsește profilePicture
  
	  res.status(200).json({ users });
	} catch (err) {
	  console.error("Error searching users:", err);
	  res.status(500).json({ error: "Server error" });
	}
  };
  
  
export const logoutUser = (req, res) => {

	try {
		res.cookie("jwt", "", { maxAge: 1 });
		res.status(200).json({ message: "User logged out successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};
  
  
export const updateUser = async (req, res) => {
	const {
	  firstName,
	  lastName,
	  email,
	  username,
	  password,
	  oldPassword,
	  bio,
	  location,
	  profession,
	  age,
	  instagram,
	  facebook,
	  webpage,
	  soundcloud,
	  spotify,
	  linkedin,
	  phone,
	  hobbies,
	  message,
	  heart,
	  profilePicture
	} = req.body;
  
	const userId = req.user._id;
  
	try {
	  let user = await User.findById(userId);
	  if (!user) return res.status(404).json({ error: "User not found" });
  
	  if (req.params.id !== userId.toString()) {
		return res.status(403).json({ error: "You cannot update another user's profile" });
	  }
  
	  // 🔁 Upload imagine dacă este în base64
	  if (profilePicture) {
		const isBase64 = profilePicture.startsWith("data:image");
  
		if (isBase64) {
		  const uploadedResponse = await cloudinary.uploader.upload(profilePicture, {
			folder: "profiles",
			resource_type: "auto",
		  });
		  user.profilePicture = uploadedResponse.secure_url;
		} else {
		  user.profilePicture = profilePicture; // Dacă este deja un URL valid
		}
	  }
  
// 🔧 Actualizare câmpuri generale
if (firstName !== undefined) user.firstName = firstName;
if (lastName !== undefined) user.lastName = lastName;
if (email !== undefined) user.email = email;
if (username !== undefined) user.username = username;
if (bio !== undefined) user.bio = bio;
if (location !== undefined) user.location = location;
if (profession !== undefined) user.profession = profession;
if (age !== undefined) user.age = age;

// 🔧 Rețele sociale și date personale
if (instagram !== undefined) user.instagram = instagram;
if (facebook !== undefined) user.facebook = facebook;
if (webpage !== undefined) user.webpage = webpage;
if (soundcloud !== undefined) user.soundcloud = soundcloud;
if (spotify !== undefined) user.spotify = spotify;
if (linkedin !== undefined) user.linkedin = linkedin;
if (phone !== undefined) user.phone = phone;
if (hobbies !== undefined) user.hobbies = hobbies;
if (message !== undefined) user.message = message;
if (heart !== undefined) user.heart = heart;

  
	  // 🔐 Parolă
	  if (password) {
		if (!oldPassword) {
		  return res.status(400).json({ error: "Old password required" });
		}
		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) return res.status(400).json({ error: "Old password is incorrect" });
  
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);
	  }
  
	  await user.save();
  
	  // ✅ Trimite user-ul actualizat înapoi
	  res.status(200).json({
		message: "Profile updated successfully",
		user: {
		  _id: user._id,
		  firstName: user.firstName,
		  lastName: user.lastName,
		  email: user.email,
		  username: user.username,
		  bio: user.bio,
		  profilePicture: user.profilePicture,
		  location: user.location,
		  profession: user.profession,
		  age: user.age,
		  instagram: user.instagram,
		  facebook: user.facebook,
		  webpage: user.webpage,
		  soundcloud: user.soundcloud,
		  spotify: user.spotify,
		  linkedin: user.linkedin,
		  phone: user.phone,
		  hobbies: user.hobbies,
		  message: user.message,
		  heart: user.heart,
		}
	  });
  
	} catch (err) {
	  res.status(500).json({ error: err.message });
	  console.log("Error in updateUser:", err.message);
	}
  };
  
// În userController.js (sau controllerul corespunzător)
export const saveQuote = async (req, res) => {
	try {
	  const { quote } = req.body; // Citatul din request body
	  const userId = req.user._id; // ID-ul utilizatorului logat
  
	  // Verifică dacă utilizatorul există
	  const user = await User.findById(userId);
	  if (!user) {
		return res.status(404).json({ message: "User not found" });
	  }
  
	  // Actualizează citatul utilizatorului
	  user.quote = quote;
	  await user.save();
  
	  res.status(200).json({ message: "Quote saved successfully" });
	} catch (error) {
	  console.error("Error saving quote:", error);
	  res.status(500).json({ message: "Failed to save quote" });
	}
  };
  
  
  export const addGalleryToFavorites = async (req, res) => {
	try {
	  const { galleryId } = req.body;
	  const userId = req.user._id; // ✅ folosește ID-ul din token
  
	  const user = await User.findById(userId);
	  if (!user) return res.status(404).json({ error: "User not found" });
  
	  if (!user.favoriteGalleries.includes(galleryId)) {
		user.favoriteGalleries.push(galleryId);
		await user.save();
	  }
  
	  res.status(200).json({ message: "Gallery added to favorites", favoriteGalleries: user.favoriteGalleries });
	} catch (err) {
	  console.error("Error adding gallery to favorites:", err.message);
	  res.status(500).json({ error: "Failed to add gallery to favorites" });
	}
  };
  
  export const getUserFavorites = async (req, res) => {
	try {
	  const user = await User.findOne({ username: req.params.username })
		.populate("favorites")
		.populate("favoriteArticles", "title subtitle createdAt")
		.populate({
		  path: "favoriteGalleries",
		  populate: {
			path: "owner",
			select: "username firstName lastName",
		  },
		});
  
	  if (!user) return res.status(404).json({ message: "User not found" });
  
	  res.status(200).json({
		favoriteProducts: user.favorites || [],
		favoriteGalleries: user.favoriteGalleries || [],
		favoriteArticles: user.favoriteArticles || [],
	  });
	} catch (err) {
	  console.error("Error fetching favorites:", err);
	  return res.status(500).json({ error: "Failed to fetch favorites" });
	}
  };
  
  
  
  
  
  
  
  
export const getUserWithGalleries = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("galleries", "name _id") // Populează galeriile utilizatorului
            .select("galleries");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ galleries: user.galleries });
    } catch (err) {
        console.error("Error fetching user galleries:", err.message);
        res.status(500).json({ error: "Failed to fetch user galleries" });
    }
};
export const removeGalleryFromFavorites = async (req, res) => {
  try {
    const { userId, galleryId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.favoriteGalleries = user.favoriteGalleries.filter(
      (id) => id.toString() !== galleryId
    );

    await user.save();

    res.status(200).json({ message: "Gallery removed from favorites", favoriteGalleries: user.favoriteGalleries });
  } catch (err) {
    console.error("Error removing gallery from favorites:", err.message);
    res.status(500).json({ error: "Failed to remove gallery from favorites" });
  }
};

export const moveToFavorites = async (req, res) => {
	try {
	  const userId = req.user._id; // ← ia userId din token
	  const { productId } = req.body;
  
	  const user = await User.findById(userId);
	  if (!user) return res.status(404).json({ error: "User not found" });
  
	  if (!user.favorites.includes(productId)) {
		user.favorites.push(productId);
	  }
  
	  user.cart = user.cart.filter((item) => !item.product.equals(productId));
  
	  await user.save();
	  res.status(200).json({ favorites: user.favorites, cart: user.cart });
	} catch (err) {
	  console.error("❌ Error in moveToFavorites:", err.message);
	  res.status(500).json({ error: "Failed to move to favorites" });
	}
  };
  
  


  export const deleteUser = async (req, res) => {
	try {
	  const { id } = req.params;
	  const currentUserId = req.user._id;
  
	  // Găsim utilizatorul curent care face cererea
	  const currentUser = await User.findById(currentUserId);
	  if (!currentUser) {
		return res.status(403).json({ error: "Unauthorized" });
	  }
  
	  // Verificăm dacă utilizatorul este administrator
	  if (!currentUser.isAdmin) {
		return res.status(403).json({ error: "Only admins can delete users" });
	  }
  
	  // Verificăm dacă utilizatorul curent încearcă să-și șteargă propriul profil
	  if (id === currentUserId.toString()) {
		return res.status(400).json({ error: "You cannot delete your own profile!" });
	  }
  
	  // Găsim utilizatorul care urmează să fie șters
	  const userToDelete = await User.findById(id);
	  if (!userToDelete) {
		return res.status(404).json({ error: "User not found" });
	  }
  
	  // Ștergem avatarul și imaginea de copertă de pe Cloudinary, dacă există
	  if (userToDelete.profilePicture) {
		await cloudinary.uploader.destroy(userToDelete.profilePicture.split("/").pop().split(".")[0]);
	  }
	  
  
	  // Ștergem utilizatorul din baza de date
	  await User.findByIdAndDelete(id);
  
	  res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
	  res.status(500).json({ error: err.message });
	  console.log("Error in deleteUser: ", err.message);
	}
  };
  

  export const getFavoriteProducts = async (req, res) => {
	try {
	  const user = await User.findOne({ username: req.params.username }).populate("favorites");
	  if (!user) return res.status(404).json({ message: "User not found" });
  
	  res.json(user.favorites);
	} catch (error) {
	  res.status(500).json({ message: "Server error", error });
	}
  };
  

  export const blockUser = async (req, res) => {
	try {
	  const userToBlock = req.params.userId;
	  const currentUser = await User.findById(req.user._id);
  
	  if (!currentUser.blockedUsers.includes(userToBlock)) {
		currentUser.blockedUsers.push(userToBlock);
		await currentUser.save();
	  }
  
	  // ✅ Trimite user-ul actualizat înapoi
	  res.status(200).json(currentUser);
	} catch (error) {
	  console.error("Error blocking user:", error.message);
	  res.status(500).json({ error: "Failed to block user" });
	}
  };
  
  export const unblockUser = async (req, res) => {
	try {
	  const user = await User.findById(req.user._id);
	  user.blockedUsers = user.blockedUsers.filter(
		(id) => id.toString() !== req.params.userId
	  );
	  await user.save();
  
	  // ✅ Trimite user-ul actualizat înapoi
	  res.status(200).json(user);
	} catch (err) {
	  console.error("Unblock error:", err);
	  res.status(500).json({ error: "Failed to unblock user" });
	}
  };
  
  
  export const getBlockedUsers = async (req, res) => {
	try {
	  const user = await User.findById(req.user._id).populate("blockedUsers", "firstName lastName profilePicture");
	  res.status(200).json({ blockedUsers: user.blockedUsers });
	} catch (err) {
	  console.error("Get blocked users error:", err);
	  res.status(500).json({ error: "Failed to get blocked users" });
	}
  };

  export const getMe = async (req, res) => {
	try {
	  const user = await User.findById(req.user._id).populate("blockedUsers", "_id");
	  if (!user) return res.status(404).json({ error: "User not found" });
	  res.status(200).json({
		_id: user._id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		username: user.username,
		bio: user.bio,
		profilePicture: user.profilePicture,
		location: user.location,
		profession: user.profession,
		age: user.age,
		instagram: user.instagram,
		facebook: user.facebook,
		webpage: user.webpage,
		soundcloud: user.soundcloud,
		spotify: user.spotify,
		linkedin: user.linkedin,
		phone: user.phone,
		hobbies: user.hobbies,
		gender: user.gender,
		pronouns: user.pronouns,
		address: user.address,
		city: user.city,
		country: user.country,
	  });
	  
		  } catch (error) {
	  console.error("getMe error:", error);
	  res.status(500).json({ error: "Internal server error" });
	}
  };
  
  export const getRandomUsers = async (req, res) => {
	try {
		const users = await User.aggregate([
			{ $sample: { size: 6 } },
			{ $project: { firstName: 1, lastName: 1, profilePicture: 1, profession: 1 } }
		  ]);
		  
	  res.status(200).json(users);
	} catch (err) {
	  console.error("Error getting random users:", err.message);
	  res.status(500).json({ error: "Failed to fetch users" });
	}
  };

  export const getUserFavoriteArticles = async (req, res) => {
	try {
	  const user = await User.findById(req.user._id).populate("favoriteArticles", "title _id");
	  if (!user) return res.status(404).json({ error: "User not found" });
  
	  res.status(200).json({ favoriteArticles: user.favoriteArticles });
	} catch (err) {
	  console.error("Error fetching favorite articles:", err.message);
	  res.status(500).json({ error: "Failed to get favorites" });
	}
  };
  