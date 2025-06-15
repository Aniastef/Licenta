import Product from '../models/productModel.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import Comment from '../models/commentModel.js';
import Event from '../models/eventModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import axios from 'axios'; // To make an API request to the geocoding service
import { addAuditLog } from './auditLogController.js'; // ← modifică path-ul dacă e diferit

export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      time,
      tags,
      coverImage,
      location,
      coordinates: clientCoordinates,
      capacity,
      category,
      price,
      ticketType,
      language,
      collaborators,
      gallery,
      attachments,
      visibility,
      isDraft,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    let coordinates = { lat: null, lng: null };
    if (clientCoordinates?.lat && clientCoordinates?.lng) {
      coordinates = clientCoordinates;
    }

    let coverImageUrl = coverImage || null;
    if (coverImage && coverImage.startsWith('data:')) {
      const uploaded = await cloudinary.uploader.upload(coverImage);
      coverImageUrl = uploaded.secure_url;
    }

    let galleryUrls = [];
    if (gallery?.length > 0) {
      for (let img of gallery) {
        if (img.startsWith('data:')) {
          const uploaded = await cloudinary.uploader.upload(img);
          galleryUrls.push(uploaded.secure_url);
        }
      }
    }

    let attachmentUrls = [];
    if (attachments?.length > 0) {
      for (let att of attachments) {
        if (att.fileData?.startsWith('data:')) {
          const uploaded = await cloudinary.uploader.upload(att.fileData, {
            resource_type: 'raw',
            folder: 'event_attachments',
          });
          attachmentUrls.push({ fileName: att.fileName, fileUrl: uploaded.secure_url });
        }
      }
    }

    const newEvent = new Event({
      name,
      description,
      date,
      time,
      coverImage: coverImageUrl,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      user: req.user._id,
      location,
      coordinates,
      capacity, // <--- nou
      category, // <--- nou
      price,
      ticketType,
      language,
      collaborators,
      gallery: galleryUrls,
      attachments: attachmentUrls,
      visibility,
      isDraft,
    });

    await newEvent.save();
    await addAuditLog({
      action: 'create_event',
      performedBy: req.user._id,
      targetEvent: newEvent._id,
      details: `Created event: ${newEvent.name}`,
    });

    // Adaugă evenimentul la utilizator
    await User.findByIdAndUpdate(req.user._id, { $push: { events: newEvent._id } });

    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error while creating event:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const event = await Event.findById(eventId)
      .populate('user', 'username firstName lastName')
      .populate('goingParticipants', 'firstName lastName profilePicture _id')
      .populate('interestedParticipants', 'firstName lastName profilePicture _id');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({
      event,
      interestedParticipants: event.interestedParticipants,
      goingParticipants: event.goingParticipants,
    });
  } catch (err) {
    console.error('Error while fetching event:', err.message);
    res.status(500).json({ message: err.message });
  }
};


export const markGoing = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (event.goingParticipants.includes(req.user._id)) {
      event.goingParticipants = event.goingParticipants.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
      user.eventsMarkedGoing = user.eventsMarkedGoing.filter((id) => id.toString() !== eventId);
    } else {
      event.goingParticipants.push(req.user._id);
      event.interestedParticipants = event.interestedParticipants.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
      user.eventsMarkedInterested = user.eventsMarkedInterested.filter(
        (id) => id.toString() !== eventId,
      );
      user.eventsMarkedGoing.push(eventId);

      if (event.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: event.user,
          fromUser: req.user._id,
          resourceType: 'Event',
          resourceId: event._id,
          type: 'event_going',
          message: `${user.username} is going to your event "${event.name}"`,
        });
      }
    }

    await event.save();
    await user.save();

    res.status(200).json({
      message: 'Successfully updated going status',
      interestedParticipants: event.interestedParticipants,
      goingParticipants: event.goingParticipants,
    });
  } catch (err) {
    console.error('Error in markGoing:', err.stack || err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Updated markInterested with notification
export const markInterested = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (event.interestedParticipants.includes(req.user._id)) {
      event.interestedParticipants = event.interestedParticipants.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
      user.eventsMarkedInterested = user.eventsMarkedInterested.filter(
        (id) => id.toString() !== eventId,
      );
    } else {
      event.interestedParticipants.push(req.user._id);
      event.goingParticipants = event.goingParticipants.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
      user.eventsMarkedGoing = user.eventsMarkedGoing.filter((id) => id.toString() !== eventId);
      user.eventsMarkedInterested.push(eventId);

      if (event.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: event.user,
          fromUser: req.user._id,
          resourceType: 'Event',
          resourceId: event._id,
          type: 'event_interested',
          message: `${user.username} is interested in your event "${event.name}"`,
        });
      }
    }

    await event.save();
    await user.save();

    res.status(200).json({
      message: 'Successfully updated interested status',
      interestedParticipants: event.interestedParticipants,
      goingParticipants: event.goingParticipants,
    });
  } catch (err) {
    console.error('Error in markInterested:', err.stack || err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    await event.deleteOne();
    await addAuditLog({
      action: 'delete_event',
      performedBy: req.user._id,
      targetEvent: event._id,
      details: `Deleted event: ${event.name}`,
    });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event: ', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      name,
      description,
      date,
      time,
      coverImage,
      tags,
      location,
      capacity,
      price,
      ticketType,
      language,
      collaborators,
      gallery,
      attachments,
      visibility,
      isDraft,
      coordinates,
      category,
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    let coverImageUrl = coverImage || event.coverImage;
    if (coverImage && coverImage.startsWith('data:')) {
      const uploaded = await cloudinary.uploader.upload(coverImage);
      coverImageUrl = uploaded.secure_url;
    }

    let galleryUrls = [];
    if (gallery?.length > 0) {
      for (let img of gallery) {
        if (img.startsWith('data:')) {
          const uploaded = await cloudinary.uploader.upload(img);
          galleryUrls.push(uploaded.secure_url);
        } else {
          galleryUrls.push(img);
        }
      }
    }

    let finalAttachments = [];
    if (attachments?.length > 0) {
      for (let att of attachments) {
        if (att.fileData?.startsWith('data:')) {
          const uploaded = await cloudinary.uploader.upload(att.fileData, {
            resource_type: 'raw',
            folder: 'event_attachments',
          });
          finalAttachments.push({ fileName: att.fileName, fileUrl: uploaded.secure_url });
        } else if (att.fileUrl) {
          finalAttachments.push(att);
        }
      }
    }

    event.name = name || event.name;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.coverImage = coverImageUrl;
    event.tags = tags || event.tags;
    event.location = location || event.location;
    event.coordinates = coordinates || event.coordinates;
    event.capacity = capacity ?? event.capacity;
    event.price = price ?? event.price;
    event.ticketType = ticketType || event.ticketType;
    event.language = language || event.language;
    event.category = category || event.category;
    event.collaborators = collaborators || event.collaborators;
    event.gallery = galleryUrls;
    event.attachments = finalAttachments;
    event.visibility = visibility || event.visibility;
    event.isDraft = typeof isDraft === 'boolean' ? isDraft : event.isDraft;

    await event.save();
    await addAuditLog({
      action: 'update_event',
      performedBy: req.user._id,
      targetEvent: event._id,
      details: `Updated event: ${event.name}`,
    });

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error('Error updating event: ', err.message);
  }
};

const getEventStatus = (eventDate) => {
  const today = new Date();
  const eventDay = new Date(eventDate);
  if (eventDay.toDateString() === today.toDateString()) return 'ongoing';
  return eventDay > today ? 'upcoming' : 'completed';
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('user', 'firstName lastName profilePicture')
      .populate('interestedParticipants', 'firstName lastName profilePicture')
      .populate('goingParticipants', 'firstName lastName profilePicture')
      .sort({ date: 1 });

    res.status(200).json({ events });
  } catch (err) {
    console.error('Error fetching all events:', err.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getAllUserEvents = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // AM MODIFICAT AICI: Căutăm doar evenimentele unde utilizatorul este creatorul
    const events = await Event.find({ user: user._id })
      .populate('user', 'firstName lastName username') // Populează creatorul
      // .populate('collaborators', 'firstName lastName username') // <-- ELIMINAT
      .sort({ date: 1 });

    res.status(200).json({ events, user });
  } catch (err) {
    console.error('Error fetching user events:', err.message);
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
};