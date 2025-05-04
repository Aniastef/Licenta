import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import upload from "../config/imgUpload.js";
import { createEvent,getEvent,updateEvent,deleteEvent, markInterested, markGoing, getAllEvents, getAllUserEvents } from "../controllers/eventController.js";

const router=express.Router();

// Creare eveniment
router.post("/create", upload.single("coverImage"), protectRoute, createEvent);

router.get("/user/:username", getAllUserEvents);

// Obținere detalii despre un eveniment specific
router.get("/:eventId", getEvent);

// Actualizare eveniment
router.put("/:eventId", protectRoute, updateEvent);

// Ștergere eveniment
router.delete("/:eventId", protectRoute, deleteEvent);

router.post("/:eventId/interested", protectRoute, markInterested);
router.post("/:eventId/going", protectRoute, markGoing);
router.get("/", getAllEvents);



export default router;