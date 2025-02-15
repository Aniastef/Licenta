import express from "express";
import {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createAppointment); // Creare programare
router.get("/", protectRoute, getAppointments); // Obține toate programările
router.put("/:id", protectRoute, updateAppointment); // Actualizează o programare
router.delete("/:id", protectRoute, deleteAppointment); // Șterge o programare

export default router;
