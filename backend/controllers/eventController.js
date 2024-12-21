// import Event from "../models/eventModel";
// import User from "../models/userModel";
// import { v2 as cloudinary } from "cloudinary";
// import mongoose from "mongoose";

// import { uploadToCloudinary } from "../config/imgUpload.js";

// export const createEvent = async (req, res) => {
//   try {
//     const { name, description, date, participants } = req.body;

//     if (!name || !date) {
//       return res.status(400).json({ error: "Name and date are required" });
//     }

//     let coverImage = "";
//     if (req.file) {
//       // Încarcă imaginea în Cloudinary
//       coverImage = await uploadToCloudinary(req.file);
//     }

//     const newEvent = new Event({
//       name,
//       description,
//       date,
//       coverImage,
//       participants: participants || [],
//     });

//     await newEvent.save();

//     res.status(201).json({
//       message: "Event created successfully",
//       event: newEvent,
//     });
//   } catch (err) {
//     console.error("Error while creating event:", err.message);
//     res.status(500).json({ error: "Failed to create event" });
//   }
// };

// export const addInterestedParticipant = async (req, res) => {
// 	try {
// 		const { eventId } = req.params; // ID-ul evenimentului
// 		const { userId } = req.body; // ID-ul utilizatorului

// 		const event = await Event.findById(eventId);

// 		if (!event) {
// 			return res.status(404).json({ error: "Event not found" });
// 		}

// 		// Adaugă utilizatorul doar dacă nu este deja interesat
// 		if (!event.interestedParticipants.includes(userId)) {
// 			event.interestedParticipants.push(userId);
// 			await event.save();
// 		}

// 		res.status(200).json({ message: "User added to interested participants", event });
// 	} catch (err) {
// 		console.error("Error adding interested participant:", err.message);
// 		res.status(500).json({ error: "Failed to add interested participant" });
// 	}
// };

// export const addGoingParticipant = async (req, res) => {
// 	try {
// 		const { eventId } = req.params; // ID-ul evenimentului
// 		const { userId } = req.body; // ID-ul utilizatorului

// 		const event = await Event.findById(eventId);

// 		if (!event) {
// 			return res.status(404).json({ error: "Event not found" });
// 		}

// 		// Adaugă utilizatorul doar dacă nu este deja în lista de "going"
// 		if (!event.goingParticipants.includes(userId)) {
// 			event.goingParticipants.push(userId);
// 			await event.save();
// 		}

// 		res.status(200).json({ message: "User added to going participants", event });
// 	} catch (err) {
// 		console.error("Error adding going participant:", err.message);
// 		res.status(500).json({ error: "Failed to add going participant" });
// 	}
// };

// export const removeParticipant = async (req, res) => {
// 	try {
// 		const { eventId } = req.params; // ID-ul evenimentului
// 		const { userId } = req.body; // ID-ul utilizatorului

// 		const event = await Event.findById(eventId);

// 		if (!event) {
// 			return res.status(404).json({ error: "Event not found" });
// 		}

// 		// Elimină utilizatorul din liste
// 		event.interestedParticipants = event.interestedParticipants.filter((id) => id.toString() !== userId);
// 		event.goingParticipants = event.goingParticipants.filter((id) => id.toString() !== userId);

// 		await event.save();

// 		res.status(200).json({ message: "User removed from participants", event });
// 	} catch (err) {
// 		console.error("Error removing participant:", err.message);
// 		res.status(500).json({ error: "Failed to remove participant" });
// 	}
// };
