import express from "express";
import { getAllUsers, deleteUser, updateAdminRole } from "../controllers/adminController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/users", protectRoute, getAllUsers);
router.delete("/users/:id", protectRoute, deleteUser);
router.put("/users/:id/admin", protectRoute, updateAdminRole);

export default router;