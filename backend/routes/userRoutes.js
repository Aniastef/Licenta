import express from "express";
import { signupUser,loginUser,logoutUser,updateUser, getUserProfile, getUserWithGalleries, searchUsers, getFavoriteProducts, blockUser, unblockUser, getBlockedUsers,getMe, moveToFavorites} from "../controllers/userController.js";
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
router.post("/block/:userId", protectRoute, blockUser);
router.post("/unblock/:userId", protectRoute, unblockUser);
router.get("/blocked", protectRoute, getBlockedUsers);
router.get("/me", protectRoute, getMe);

router.post("/favorites/move", moveToFavorites);


export default router;
