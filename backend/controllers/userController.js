import User from "../models/userModel.js"
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js.js";
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

export const getUserProfile = async (req, res) => {

	const { username } = req.params;

    try{
        const user=await User.findOne({username}).select("-password").select("-updatedAt");

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
	const { firstName, lastName, email, username, password, oldPassword, bio, location, profession, age, instagram, facebook, webpage } = req.body;
	let { profilePic, coverPhoto } = req.body;
  
	const userId = req.user._id;
  
	try {
	  let user = await User.findById(userId);
	  if (!user) return res.status(400).json({ error: "User not found" });
  
	  if (req.params.id !== userId.toString())
		return res.status(400).json({ error: "You cannot update another user's profile" });
  
	  // Verificăm dacă este necesară schimbarea parolei
	  if (oldPassword || password) {
		if (!oldPassword) {
		  return res.status(400).json({ error: "Old password is required to change password" });
		}
		if (!password) {
		  return res.status(400).json({ error: "New password is required to change password" });
		}
  
		// Verifică dacă parola veche este corectă
		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
		  return res.status(400).json({ error: "Old password is incorrect" });
		}
  
		// Generează o parolă hashuită pentru noua parolă
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		user.password = hashedPassword;
	  }
  
	  if (profilePic) {
		if (user.profilePic) {
		  // Șterge avatarul existent din Cloudinary
		  await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
		}
  
		// Încarcă noul avatar
		const uploadedResponse = await cloudinary.uploader.upload(profilePic);
		profilePic = uploadedResponse.secure_url;
	  }
  
	  if (coverPhoto) {
		if (user.coverPhoto) {
		  // Șterge imaginea existentă de copertă din Cloudinary
		  await cloudinary.uploader.destroy(user.coverPhoto.split("/").pop().split(".")[0]);
		}
  
		// Încarcă noua imagine de copertă
		const uploadedResponse = await cloudinary.uploader.upload(coverPhoto);
		coverPhoto = uploadedResponse.secure_url;
	  }
  
	  // Actualizează câmpurile utilizatorului
	  user.firstName = firstName || user.firstName;
	  user.lastName = lastName || user.lastName;
	  user.email = email || user.email;
	  user.username = username || user.username;
	  user.profilePic = profilePic || user.profilePic;
	  user.coverPhoto = coverPhoto || user.coverPhoto;
	  user.bio = bio || user.bio;
	  user.location = location || user.location;
	  user.profession = profession || user.profession;
	  user.age = age || user.age;
	  user.facebook = facebook || user.facebook;
	  user.instagram = instagram || user.instagram;
	  user.webpage = webpage|| user.webpage;
  
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
	  if (userToDelete.coverPhoto) {
		await cloudinary.uploader.destroy(userToDelete.coverPhoto.split("/").pop().split(".")[0]);
	  }
  
	  // Ștergem utilizatorul din baza de date
	  await User.findByIdAndDelete(id);
  
	  res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
	  res.status(500).json({ error: err.message });
	  console.log("Error in deleteUser: ", err.message);
	}
  };
  




