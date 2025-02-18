import User from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
    try {
      if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
        return res.status(403).json({ error: "Access denied" });
      }
  
      const users = await User.find().select("-password");
  
      console.log("Sending users:", users); // ✅ Debugging
      res.status(200).json(users); // ✅ Trimite direct array-ul
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Server error" });
    }
  };
  

export const fetchAllUsers = async () => {
  try {
    return await User.find().select("-password");
  } catch (err) {
    console.error("Error fetching users:", err);
    throw new Error("Error fetching users");
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateAdminRole = async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }
  
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const adminCount = await User.countDocuments({ role: "admin" });

      // ✅ Dacă există un singur admin și userul e admin, nu îl lăsăm să fie schimbat
      if (adminCount === 1 && user.role === "admin" && req.body.role === "user") {
        return res.status(400).json({ error: "At least one admin is required." });
      }
      
      // ✅ Superadmin poate face orice, dar nu poate deveni user
      if (user.role === "superadmin" && req.body.role === "user") {
        return res.status(400).json({ error: "Superadmin cannot be downgraded to user." });
      }
      
      user.role = req.body.role;
      await user.save();
      res.json({ message: "User role updated", user });
      
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
