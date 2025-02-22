import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import {uploadToCloudinary} from "../config/imgUpload.js";

export const getAllUsers = async (req, res) => {
  try {
      console.log("Authenticated user:", req.user); // 🔍 Debugging

      if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
          return res.status(403).json({ error: "Access denied" });
      }

      const users = await User.find().select("-password");
      res.status(200).json(users);
  } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Server error" });
  }
};



export const deleteUser = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
      return res.status(403).json({ error: "Access denied" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "superadmin") {
      return res.status(400).json({ error: "Superadmin cannot be deleted" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateAdminRole = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmins can update roles" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "superadmin" && req.body.role !== "superadmin") {
      return res.status(400).json({ error: "Superadmin cannot be downgraded" });
    }

    user.role = req.body.role;
    await user.save();
    res.json({ message: "User role updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Blocare utilizator + deconectare instantanee
export const toggleBlockUser = async (req, res) => {
  try {
    const requestingUser = req.user;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    // 🔒 Adminii nu pot bloca superadmini
    if (user.role === "superadmin") {
      return res.status(403).json({ error: "Superadmins cannot be blocked" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    // ✅ Dacă user-ul blocat este cel logat, ștergem token-ul
    if (user.isBlocked) {
      res.clearCookie("jwt");
    }

    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully` });
  } catch (err) {
    console.error("Error in toggleBlockUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Actualizare completă a utilizatorului (inclusiv bio și profil)
export const updateUserAdmin = async (req, res) => {
  const {
    firstName, lastName, email, username, role, password, bio, location,
    profession, age, instagram, facebook, webpage, profilePicture
  } = req.body;
  const userId = req.params.id;
  const requestingUser = req.user;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🔒 Superadminii nu își pot schimba unii altora datele
    if (user.role === "superadmin" && requestingUser.role === "superadmin") {
      return res.status(403).json({ error: "Superadmin cannot modify another superadmin" });
    }

    // 🔹 Adminii nu pot schimba rolul unui superadmin
    if (role && user.role === "superadmin" && requestingUser.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmins can change superadmin roles" });
    }

    // ✅ Actualizare date utilizator
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.profession = profession || user.profession;
    user.age = age || user.age;
    user.facebook = facebook || user.facebook;
    user.instagram = instagram || user.instagram;
    user.webpage = webpage || user.webpage;
    user.profilePicture = profilePicture || user.profilePicture;

    // ✅ Adminii pot reseta parola fără `oldPassword`
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Endpoint pentru upload imagine de profil
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Încarcă imaginea pe Cloudinary
    const imageUrl = await uploadToCloudinary(req.file);

    // ✅ Salvează URL-ul în baza de date
    user.profilePicture = imageUrl;
    await user.save();

    res.status(200).json({ message: "Profile picture updated", url: imageUrl });
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    res.status(500).json({ error: "Server error" });
  }
}; 


export const handleRoleChange = async (req, res) => {
  try {
    const { role } = req.body;
    const requestingUser = req.user;

    // Verifică dacă utilizatorul autentificat este superadmin
    if (!requestingUser || requestingUser.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmins can update roles" });
    }

    // Verifică dacă rolul trimis este valid
    if (!["user", "admin", "superadmin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Superadminii nu pot fi retrogradați de altcineva
    if (user.role === "superadmin" && role !== "superadmin") {
      return res.status(400).json({ error: "Superadmin cannot be downgraded" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

