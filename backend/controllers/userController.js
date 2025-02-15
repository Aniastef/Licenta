import User from "../models/userModel.js"
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js.js";
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

export const getUserProfile = async (req, res) => {

	const { username } = req.params;

    try{
		const user = await User.findOne({ username })
		.select("-password -updatedAt")
		.populate({
		  path: "eventsMarkedInterested",
		  select: "name date location coverImage",
		  populate: { path: "user", select: "firstName lastName" },
		})
		.populate({
		  path: "eventsMarkedGoing",
		  select: "name date location coverImage",
		  populate: { path: "user", select: "firstName lastName" },
		})
		.populate({
		  path: "events",
		  select: "name date location coverImage",
		  populate: { path: "user", select: "firstName lastName" },
		})
		.populate({
		  path: "galleries", // ✅ Populează galeriile
		  select: "name", // ✅ Selectează doar numele galeriei
		});
  
  

        if (!user) 
        return res.status(400).json({ message: "User not found" });

        res.status(200).json(user);

    } catch (err) 
    {
        res.status(500).json({ error: err.message });
        console.log("Error in getUserProfile: ", err.message);  
    }   

}


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

    const newUser = new User({
      firstName,
	  lastName,
      email,
      username,
      password: hashedPassword, 
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
			profilePic: user.profilePic,
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
  
	let { profilePic} = req.body;
  
	const userId = req.user._id;
  
	try {
	  let user = await User.findById(userId);
	  if (!user) return res.status(400).json({ error: "User not found" });
  
	  if (req.params.id !== userId.toString())
		return res.status(400).json({ error: "You cannot update another user's profile" });
  
	  
  
	  // Restul câmpurilor și logicii pentru actualizarea utilizatorului
	  user.firstName = firstName || user.firstName;
	  user.lastName = lastName || user.lastName;
	  user.email = email || user.email;
	  user.username = username || user.username;
	  user.profilePic = profilePic || user.profilePic;
	  user.bio = bio || user.bio;
	  user.location = location || user.location;
	  user.profession = profession || user.profession;
	  user.age = age || user.age;
	  user.facebook = facebook || user.facebook;
	  user.instagram = instagram || user.instagram;
	  user.webpage = webpage || user.webpage;
  
	  if (oldPassword || password) {
		if (!oldPassword || !password) {
		  return res.status(400).json({
			error: "Both old and new passwords are required to update password",
		  });
		}
  
		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
		  return res.status(400).json({ error: "Old password is incorrect" });
		}
  
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);
	  }
  
	  // Salvează modificările
	  user = await user.save();
  
	  // Elimină parola din obiectul returnat
	  user.password = null;
  
	  res.status(200).json(user);
	} catch (err) {
	  res.status(500).json({ error: err.message });
	  console.log("Error in updateUser: ", err.message);
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
	  if (userToDelete.profilePic) {
		await cloudinary.uploader.destroy(userToDelete.profilePic.split("/").pop().split(".")[0]);
	  }
	  
  
	  // Ștergem utilizatorul din baza de date
	  await User.findByIdAndDelete(id);
  
	  res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
	  res.status(500).json({ error: err.message });
	  console.log("Error in deleteUser: ", err.message);
	}
  };
  




