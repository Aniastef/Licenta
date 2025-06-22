import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { uploadToCloudinary } from '../config/imgUpload.js';
import { addAuditLog } from './auditLogController.js';

export const getAllUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'admin cannot be deleted' });
    }

    await User.findByIdAndDelete(req.params.id);

    await addAuditLog('User deleted', req.user._id, user._id, `Deleted user: ${user.email}`);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAdminRole = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update roles' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin' && req.body.role !== 'admin') {
      return res.status(400).json({ error: 'admin cannot be downgraded' });
    }

    user.role = req.body.role;
    await user.save();

    await addAuditLog(
      'Admin role updated',
      req.user._id,
      user._id,
      `Changed role to: ${user.role}`,
    );

    res.json({ message: 'User role updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const requestingUser = req.user;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'admins cannot be blocked' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    await addAuditLog(
      'User blocked/unblocked',
      req.user._id,
      user._id,
      `User ${user.isBlocked ? 'blocked' : 'unblocked'}`,
    );

    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (err) {
    console.error('Error in toggleBlockUser:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserAdmin = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    username,
    role,
    password,
    bio,
    location,
    profession,
    age,
    profilePicture,
    phone,
    hobbies,
    gender,
    pronouns,
    address,
    city,
    country,
    quote,
  } = req.body;

  const userId = req.params.id;
  const requestingUser = req.user;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin' && requestingUser.role === 'admin') {
      return res.status(403).json({ error: 'admin cannot modify another admin' });
    }

    if (role && user.role === 'admin' && requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change admin roles' });
    }

    const oldData = { ...user._doc };

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.profession = profession || user.profession;
    user.age = age || user.age;
    user.phone = phone || user.phone;
    user.hobbies = hobbies || user.hobbies;
    user.gender = gender || user.gender;
    user.pronouns = pronouns || user.pronouns;
    user.address = address || user.address;
    user.city = city || user.city;
    user.country = country || user.country;
    user.quote = quote; 
    user.profilePicture = profilePicture || user.profilePicture;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    await addAuditLog(
      'User updated',
      req.user._id,
      user._id,
      `Updated fields: ${JSON.stringify(req.body)}`,
    );

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(' Error in updateUserAdmin:', err);

    res.status(500).json({ error: err.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const imageUrl = await uploadToCloudinary(req.file);

    user.profilePicture = imageUrl;
    await user.save();

    await addAuditLog(
      'Profile picture updated',
      req.user._id,
      user._id,
      `Updated profile picture for user: ${user.email}`,
    );

    res.status(200).json({ message: 'Profile picture updated', url: imageUrl });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const handleRoleChange = async (req, res) => {
  try {
    const { role } = req.body;
    const requestingUser = req.user;

    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update roles' });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin' && role !== 'admin') {
      return res.status(400).json({ error: 'admin cannot be downgraded' });
    }

    user.role = role;
    await user.save();

    await addAuditLog('Role changed', req.user._id, user._id, `Changed role to: ${role}`);

    res.json({ message: 'User role updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
