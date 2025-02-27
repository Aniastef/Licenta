import express from "express";
import { signupUser,loginUser,logoutUser,updateUser, getUserProfile, getUserWithGalleries, searchUsers, getFavoriteProducts,} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router=express.Router();

router.get("/profile/:username",getUserProfile)
router.get("/profile", protectRoute, getUserProfile); // ✅ Returnează utilizatorul logat
router.post("/signup",signupUser)
router.post("/login",loginUser)
router.post("/logout",logoutUser)
router.put("/update/:id",protectRoute, updateUser)
router.get("/galleries", protectRoute, getUserWithGalleries);
router.get("/search", protectRoute, searchUsers);
router.get("/favorites/:username", getFavoriteProducts);


export default router;
