import User from "../models/userModel.js"
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Gallery from "../models/galleryModel.js";
import Product from "../models/productModel.js";

export const getUserProfile = async (req, res) => {
	try {
	  const username = req.params.username;
	  const currentUserId = req.user?._id?.toString();
  
	  const user = await User.findOne({ username }).select("-password -updatedAt");
	  if (!user) return res.status(404).json({ message: "User not found" });
  
	  const isSelfProfile = currentUserId && user._id.toString() === currentUserId;
  
	  // 1. Galeriile create de acest user
	  const ownedGalleries = await Gallery.find({ owner: user._id })
		.select("name isPublic owner collaborators pendingCollaborators");
  
	  // 2. Galeriile unde acest user e colaborator (deținute de alții)
	  const collaboratedGalleries = await Gallery.find({
		collaborators: user._id,
		owner: { $ne: user._id },
	  }).select("name isPublic owner collaborators pendingCollaborators");
  
	  // Dacă profilul este al userului logat — returnează toate galeriile (și private)
	  // Dacă e alt profil, returnează doar cele publice sau unde logatul e colaborator/owner
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
  
	  await user.populate([
		{
		  path: "eventsMarkedInterested",
		  select: "name date location coverImage",
		  populate: { path: "user", select: "firstName lastName" },
		},
		{
		  path: "eventsMarkedGoing",
		  select: "name date location coverImage",
		  populate: { path: "user", select: "firstName lastName" },
		},
		{
		  path: "events",
		  select: "name date location coverImage",
		  populate: { path: "user", select: "firstName lastName" },
		},
	  ]);
  
	  return res.status(200).json(user);
	} catch (err) {
	  console.error("Error in getUserProfile:", err.message);
	  res.status(500).json({ error: err.message });
	}
  };
  
  
  
  
  
  
  
  



export const signupUser = async (req, res) => {
  try {
    const { firstName,lastName, email, username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

	const isFirstUser = (await User.countDocuments()) === 0;

	const newUser = new User({
	firstName,
	lastName,
	email,
	username,
	password: hashedPassword,
	role: isFirstUser ? "superadmin" : "user", // ✅ Primul user devine superadmin
	});

	

    await newUser.save();

    if (newUser) {
      console.log("New user created");
      generateTokenAndSetCookie(newUser._id, res); 

      res.status(201).json({
        _id: newUser._id,
        firstName: newUser.firstName,
		lastName: newUser.lastName,
        email: newUser.email,
        username: newUser.username,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
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
	  }).select("_id firstName lastName username");
  
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
	} = req.body;
  
	const userId = req.user._id; // Utilizatorul care face cererea
  
	try {
	  let user = await User.findById(userId);
	  if (!user) return res.status(404).json({ error: "User not found" });
  
	  // ✅ Utilizatorii nu pot modifica alți useri
	  if (req.params.id !== userId.toString()) {
		return res.status(403).json({ error: "You cannot update another user's profile" });
	  }
  
	  // ✅ Actualizare doar a propriilor informații
	  user.firstName = firstName || user.firstName;
	  user.lastName = lastName || user.lastName;
	  user.email = email || user.email;
	  user.username = username || user.username;
	  user.profilePicture = req.body.profilePicture || user.profilePicture;
	  user.bio = bio || user.bio;
	  user.location = location || user.location;
	  user.profession = profession || user.profession;
	  user.age = age || user.age;
	  user.facebook = facebook || user.facebook;
	  user.instagram = instagram || user.instagram;
	  user.webpage = webpage || user.webpage;
  
	  // ✅ Utilizatorii își pot schimba parola doar dacă furnizează `oldPassword`
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
	  res.status(200).json({ message: "Profile updated successfully" });
	} catch (err) {
	  res.status(500).json({ error: err.message });
	  console.log("Error in updateUser:", err.message);
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

export const moveToFavorites = async (req, res) => {
	try {
	  const { userId, productId } = req.body;
  
	  const user = await User.findById(userId);
	  if (!user) return res.status(404).json({ error: "User not found" });
  
	  // Nu adăuga duplicat
	  if (!user.favorites.includes(productId)) {
		user.favorites.push(productId);
	  }
  
	  // 🔁 Opțional: șterge produsul din coș
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
	  res.status(200).json(user);
	} catch (error) {
	  console.error("getMe error:", error);
	  res.status(500).json({ error: "Internal server error" });
	}
  };
  
  