import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';

export const createAppointment = async (req, res) => {
  try {
    const { title, description, date, time, participant } = req.body;
    const newAppointment = new Appointment({
      title,
      description,
      date,
      time,
      createdBy: req.user._id,
      participant: participant || null,
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create appointment', error: err.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [{ createdBy: req.user._id }, { participant: req.user._id }],
    })
      .populate('createdBy', 'username profilePicture')
      .populate('participant', 'username profilePicture');

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    appointment.status = status || appointment.status;
    await appointment.save();

    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update appointment', error: err.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await appointment.deleteOne();
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete appointment', error: err.message });
  }
};
