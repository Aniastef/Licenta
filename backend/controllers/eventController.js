import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Comment from "../models/commentModel.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";

export const createEvent = async (req, res) => {
  try {
    const { name, description, date, tags, coverImage } = req.body;
    console.log("Body received:", req.body);

    if (!name || !date) {
      return res.status(400).json({ error: "Name and date are required" });
    }

    let coverImageUrl = coverImage || null;

    // Dacă coverImage este un Base64 sau URL temporar, îl urcăm pe Cloudinary
    if (coverImage && coverImage.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(coverImage);
      coverImageUrl = uploaded.secure_url;
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
      .populate("user", "firstName lastName")
      .populate("interestedParticipants", "firstName lastName profilePicture")
      .populate("goingParticipants", "firstName lastName profilePicture");

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

export const markInterested = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (event.interestedParticipants.includes(req.user._id)) {
      event.interestedParticipants = event.interestedParticipants.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      user.eventsMarkedInterested = user.eventsMarkedInterested.filter(
        (id) => id.toString() !== eventId
      );
    } else {
      event.interestedParticipants.push(req.user._id);
      event.goingParticipants = event.goingParticipants.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      user.eventsMarkedGoing = user.eventsMarkedGoing.filter(
        (id) => id.toString() !== eventId
      );
      user.eventsMarkedInterested.push(eventId);
    }

    await event.save();
    await user.save();

    res.status(200).json({
      message: "Successfully updated interested status",
      interestedParticipants: event.interestedParticipants,
      goingParticipants: event.goingParticipants,
    });
  } catch (err) {
    console.error("Error in markInterested:", err.stack || err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markGoing = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (event.goingParticipants.includes(req.user._id)) {
      event.goingParticipants = event.goingParticipants.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      user.eventsMarkedGoing = user.eventsMarkedGoing.filter(
        (id) => id.toString() !== eventId
      );
    } else {
      event.goingParticipants.push(req.user._id);
      event.interestedParticipants = event.interestedParticipants.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      user.eventsMarkedInterested = user.eventsMarkedInterested.filter(
        (id) => id.toString() !== eventId
      );
      user.eventsMarkedGoing.push(eventId);
    }

    await event.save();
    await user.save();

    res.status(200).json({
      message: "Successfully updated going status",
      interestedParticipants: event.interestedParticipants,
      goingParticipants: event.goingParticipants,
    });
  } catch (err) {
    console.error("Error in markGoing:", err.stack || err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

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

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    let coverImageUrl = coverImage || event.coverImage;
    if (coverImage && coverImage.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(coverImage);
      coverImageUrl = uploaded.secure_url;
    }

    event.name = name || event.name;
    event.description = description || event.description;
    event.date = date || event.date;
    event.coverImage = coverImageUrl;
    event.tags = tags || event.tags;

    await event.save();
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error("Error updating event: ", err.message);
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("user", "firstName lastName profilePicture")
      .populate("interestedParticipants", "firstName lastName profilePicture")
      .populate("goingParticipants", "firstName lastName profilePicture")
      .sort({ date: 1 });

    res.status(200).json({ events });
  } catch (err) {
    console.error("Error fetching all events:", err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};
