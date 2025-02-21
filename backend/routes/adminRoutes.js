import express from "express";
import { getAllUsers, deleteUser, updateAdminRole, toggleBlockUser, updateUserAdmin } from "../controllers/adminController.js";
import protectRoute from "../middlewares/protectRoute.js";
import adminOnly from "../middlewares/adminOnly.js";

const router = express.Router();

router.get("/users", protectRoute, getAllUsers);
router.delete("/users/:id", protectRoute, adminOnly, deleteUser);
router.put("/users/:id/admin", protectRoute, adminOnly, updateAdminRole);
router.put("/users/:id/block", protectRoute, adminOnly, toggleBlockUser);
router.put("/users/:id/update", protectRoute, adminOnly, updateUserAdmin);


export default router;