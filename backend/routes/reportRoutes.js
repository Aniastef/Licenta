import express from "express";
import {
  createReport,
  deleteReport,
  getReports,
  resolveReport
} from "../controllers/reportController.js";
import adminOnly from "../middlewares/adminOnly.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// Utilizator logat poate trimite un raport
router.post("/", protectRoute, createReport);

// Doar adminii pot vedea lista rapoartelor
router.get("/", protectRoute, adminOnly, getReports);

// Doar adminii pot șterge un raport
router.delete("/:id", protectRoute, adminOnly, deleteReport);

// Doar adminii pot marca un raport ca rezolvat
router.patch("/:id/resolve", protectRoute, adminOnly, resolveReport);

export default router;
