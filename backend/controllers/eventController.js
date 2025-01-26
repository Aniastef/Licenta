import Product from "../models/productModel.js"
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import multer from "multer";
import {uploadToCloudinary} from "../config/imgUpload.js";
import Comment from "../models/commentModel.js";
import Event from "../models/eventModel.js";

export const createEvent = async (req, res) => {
  try {
    const { name, description, date, tags } = req.body;
    console.log("Body received:", req.body);
    console.log("File received:", req.file);

    if (!name || !date) {
      return res.status(400).json({ error: "Name and date are required" });
    }

    let coverImageUrl = null;

    // Dacă există o imagine încărcată, încarc-o pe Cloudinary
    if (req.file) {
      coverImageUrl = await uploadToCloudinary(req.file); // Funcție pentru încărcarea imaginii pe Cloudinary
    }

    const newEvent = new Event({
      name,
      description,
      date,
      coverImage: coverImageUrl,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      user: req.user._id,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Error while creating event:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const event = await Event.findById(eventId)
      .populate("interestedParticipants", "firstName lastName profileImage")
      .populate("goingParticipants", "firstName lastName profileImage");


    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({
      event,
      interestedParticipants: event.interestedParticipants,
      goingParticipants: event.goingParticipants,
    });
  } catch (err) {
    console.error("Error while fetching event:", err.message);
    res.status(500).json({ message: err.message });
  }
};



export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Găsește evenimentul în baza de date
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Verifică dacă utilizatorul are permisiunea să șteargă evenimentul
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    // Șterge evenimentul
    await event.deleteOne();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error("Error deleting event: ", err.message);
  }
};


export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, description, date, coverImage, tags } = req.body;

    // Găsește evenimentul în baza de date
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Verifică dacă utilizatorul are permisiunea să actualizeze evenimentul
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    // Actualizează câmpurile evenimentului
    event.name = name || event.name;
    event.description = description || event.description;
    event.date = date || event.date;
    event.coverImage = coverImage || event.coverImage;
    event.tags = tags || event.tags;

    // Salvează modificările
    await event.save();

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error("Error updating event: ", err.message);
  }
};

export const markInterested = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verifică dacă evenimentul există
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Adaugă utilizatorul la lista de participanți interesați
    if (!event.interestedParticipants.includes(req.user._id)) {
      event.interestedParticipants.push(req.user._id);
    }

    // Salvează modificările
    await event.save();
    res.status(200).json({ message: "Marked as interested", event });
  } catch (err) {
    console.error("Error marking interested:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const markGoing = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verifică dacă evenimentul există
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Adaugă utilizatorul la lista de participanți
    if (!event.goingParticipants.includes(req.user._id)) {
      event.goingParticipants.push(req.user._id);
    }

    // Salvează modificările
    await event.save();
    res.status(200).json({ message: "Marked as going", event });
  } catch (err) {
    console.error("Error marking going:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("user", "firstName lastName profileImage") // Populează informații despre utilizatorul care a creat evenimentul
      .populate("interestedParticipants", "firstName lastName profileImage") // Populează utilizatorii interesați
      .populate("goingParticipants", "firstName lastName profileImage") // Populează utilizatorii care merg
      .sort({ date: 1 }); // Sortează evenimentele după dată, cel mai apropiat eveniment apare primul

    res.status(200).json({ events });
  } catch (err) {
    console.error("Error fetching all events:", err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

