import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
	try {
	  const token = req.cookies.jwt;
  
	  if (!token) {
		console.error("No token provided in cookies");
		return res.status(401).json({ error: "Unauthorized access" });
	  }
  
	  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
	  const user = await User.findById(decoded.id || decoded.userId).select("-password");
  
	  if (!user) {
		console.error("No user found for decoded token:", decoded.userId);
		return res.status(404).json({ error: "User not found" });
	  }
  
	  console.log("Authenticated user:", user);
	  req.user = user;
	  console.log("Decoded JWT:", decoded);
	  console.log("Authenticated User:", user);
	  console.log("User Role:", user.role);
	  
	  next();
	} catch (err) {
	  console.error("Error in protectRoute:", err.stack || err.message);
	  res.status(500).json({ error: "Internal server error" });
	}
  };
  

export default protectRoute;