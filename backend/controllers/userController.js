import User from '../models/userModel.js';
import generateTokenAndSetCookie from '../utils/generateTokenAndSetCookie.js';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import Gallery from '../models/galleryModel.js';
import Product from '../models/productModel.js';
import Article from '../models/articleModel.js';
import Notification from '../models/notificationModel.js';
import { addAuditLog } from './auditLogController.js';

export const getUserProfile = async (req, res) => {
  try {
    const username = req.params.username;
    const currentUserId = req.user?._id?.toString();

    const user = await User.findOne({ username }).select('-password -updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isSelfProfile = currentUserId && user._id.toString() === currentUserId;

    const ownedGalleries = await Gallery.find({ owner: user._id })
      .populate('collaborators', '_id')
      .select('name isPublic owner collaborators pendingCollaborators coverPhoto category tags');

    const collaboratedGalleries = await Gallery.find({
      collaborators: user._id,
      owner: { $ne: user._id },
    })
      .populate('collaborators', '_id')
      .select('name isPublic owner collaborators pendingCollaborators coverPhoto category tags');

    await user.populate([
      {
        path: 'eventsMarkedInterested',
        select: 'name date time location coverImage',
        populate: { path: 'user', select: 'firstName lastName' },
      },
      {
        path: 'eventsMarkedGoing',
        select: 'name date time location coverImage',
        populate: { path: 'user', select: 'firstName lastName' },
      },
      {
        path: 'events',
        select: 'name date category time location coverImage',
        populate: { path: 'user', select: 'firstName lastName' },
      },
    ]);

    const products = await Product.find({ user: user._id })
      .select('title price images videos tags createdAt category')
      .sort({ createdAt: -1 });

    const articles = await Article.find({ user: user._id })
      .select('title subtitle category createdAt content')
      .sort({ createdAt: -1 })
      .limit(3);

    const favoriteGalleries = await User.findById(user._id)
      .select('favoriteGalleries')
      .populate('favoriteGalleries', 'name coverPhoto owner products category tags')
      .lean();

    const favoriteProducts = await User.findById(user._id)
      .select('favorites')
      .populate('favorites', 'title images price forSale quantity')
      .lean();

    const favoriteArticles = await User.findById(user._id)
      .select('favoriteArticles')
      .populate('favoriteArticles', 'title coverImage')
      .lean();

    const userObject = user.toObject();

    userObject.products = products;
    userObject.articles = articles;
    userObject.favoriteGalleries = favoriteGalleries ? favoriteGalleries.favoriteGalleries : [];
    userObject.favoriteProducts = favoriteProducts ? favoriteProducts.favorites : [];
    userObject.favoriteArticles = favoriteArticles ? favoriteArticles.favoriteArticles : [];

    userObject.galleries = [...ownedGalleries, ...collaboratedGalleries];

    return res.status(200).json(userObject);
  } catch (err) {
    console.error('Error in getUserProfile:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const removeArticleFromFavorites = async (req, res) => {
  try {
    const { articleId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.favoriteArticles = user.favoriteArticles.filter((id) => id.toString() !== articleId);
    await user.save();

    res.status(200).json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addArticleToFavorites = async (req, res) => {
  try {
    const { articleId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const articleIdObj = new mongoose.Types.ObjectId(articleId);
    if (!user.favoriteArticles.some((favId) => favId.equals(articleIdObj))) {
      user.favoriteArticles.push(articleIdObj);
      await user.save();

      const article = await Article.findById(articleId).populate('author', 'username');
      if (article && article.author._id.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: article.author._id,
          fromUser: req.user._id,
          resourceType: 'Article',
          resourceId: article._id,
          type: 'favorite_article',
          message: `${user.username} added your article "${article.title}" to favorites.`,
        });
      }
    }

    res.status(200).json({ message: 'Article added to favorites' });
  } catch (err) {
    console.error('Error adding article to favorites:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const signupUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      confirmPassword,
      gender,
      pronouns,
      address,
      city,
      country,
      phone,
      bio,
      profilePicture,
      role: requestedRole,
      adminCode,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res
        .status(400)
        .json({ error: 'Password must contain at least one special character' });
    }

    if (!username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    } else if (/\s/.test(username)) {
      return res.status(400).json({ error: 'Username cannot contain spaces' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profilePictureUrl = null;
    if (profilePicture) {
      if (profilePicture.startsWith('http')) {
        profilePictureUrl = profilePicture;
      } else {
        const uploadedResponse = await cloudinary.uploader.upload(profilePicture, {
          folder: 'profiles',
          resource_type: 'auto',
        });
        profilePictureUrl = uploadedResponse.secure_url;
      }
    }

    let role = 'user';
    if (requestedRole === 'admin') {
      if (adminCode === process.env.ADMIN_SECRET) {
        role = 'admin';
      } else {
        return res.status(403).json({ error: 'Invalid admin access code.' });
      }
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      gender,
      pronouns,
      address,
      city,
      country,
      phone,
      bio,
      profilePicture: profilePictureUrl,
      role,
    });

    await newUser.save();

    generateTokenAndSetCookie(newUser._id, res);

    await addAuditLog({
      action: 'signup',
      performedBy: newUser._id,
      targetUser: newUser._id,
      details: `New account created: ${newUser.username}`,
    });
    res.status(201).json({
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      username: newUser.username,
      bio: newUser.bio,
      profilePicture: newUser.profilePicture,
      gender: newUser.gender,
      pronouns: newUser.pronouns,
      address: newUser.address,
      city: newUser.city,
      country: newUser.country,
      phone: newUser.phone,
      role: newUser.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log('Error while signing user up: ', err.message);
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const {
      firstName,
      lastName,
      email,
      bio,
      location,
      profession,
      age,
      dateOfBirth,
      instagram,
      facebook,
      webpage,
      soundcloud,
      spotify,
      linkedin,
      phone,
      hobbies,
      message,
      heart,
      profilePicture,
      gender,
      pronouns,
      address,
      city,
      country,
    } = req.body;

    if (profilePicture && profilePicture.startsWith('data:image')) {
      const uploaded = await cloudinary.uploader.upload(profilePicture, {
        folder: 'profiles',
        resource_type: 'auto',
      });
      user.profilePicture = uploaded.secure_url;
    } else if (profilePicture) {
      user.profilePicture = profilePicture;
    }

    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.email = email ?? user.email;
    user.bio = bio ?? user.bio;
    user.location = location ?? user.location;
    user.profession = profession ?? user.profession;
    user.dateOfBirth = dateOfBirth ?? user.dateOfBirth;
    user.instagram = instagram ?? user.instagram;
    user.facebook = facebook ?? user.facebook;
    user.webpage = webpage ?? user.webpage;
    user.soundcloud = soundcloud ?? user.soundcloud;
    user.spotify = spotify ?? user.spotify;
    user.linkedin = linkedin ?? user.linkedin;
    user.phone = phone ?? user.phone;
    user.hobbies = hobbies ?? user.hobbies;
    user.message = message ?? user.message;
    user.heart = heart ?? user.heart;
    user.gender = gender ?? user.gender;
    user.pronouns = pronouns ?? user.pronouns;
    user.address = address ?? user.address;
    user.city = city ?? user.city;
    user.country = country ?? user.country;

    await user.save();
    await addAuditLog({
      action: 'update_user_by_admin',
      performedBy: req.user._id,
      targetUser: user._id,
      details: `Admin updated user: ${user.firstName} ${user.lastName}`,
    });

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Error in updateUserByAdmin:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ error: 'Invalid username or password' });

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ error: 'Your account has been blocked. Contact support for assistance.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ error: 'Invalid username or password' });

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture,
      location: user.location,
      profession: user.profession,
      dateOfBirth: user.dateOfBirth,
      instagram: user.instagram,
      facebook: user.facebook,
      webpage: user.webpage,
      soundcloud: user.soundcloud,
      spotify: user.spotify,
      linkedin: user.linkedin,
      phone: user.phone,
      hobbies: user.hobbies,
      gender: user.gender,
      pronouns: user.pronouns,
      address: user.address,
      city: user.city,
      country: user.country,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in loginUser: ', error.message);
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const users = await User.find({
      $or: [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') },
        { username: new RegExp(query, 'i') },
      ],
    }).select('_id firstName lastName username profilePicture');

    res.status(200).json({ users });
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const logoutUser = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in signupUser: ', err.message);
  }
};

export const updateUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    username,
    password,
    oldPassword,
    bio,
    location,
    profession,
    dateOfBirth,
    instagram,
    facebook,
    webpage,
    soundcloud,
    spotify,
    linkedin,
    phone,
    hobbies,
    message,
    heart,
    profilePicture,
    gender,
    pronouns,
    address,
    city,
    country,
  } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.params.id !== userId.toString()) {
      return res.status(403).json({ error: "You cannot update another user's profile" });
    }

    if (profilePicture) {
      const isBase64 = profilePicture.startsWith('data:image');

      if (isBase64) {
        const uploadedResponse = await cloudinary.uploader.upload(profilePicture, {
          folder: 'profiles',
          resource_type: 'auto',
        });
        user.profilePicture = uploadedResponse.secure_url;
      } else {
        user.profilePicture = profilePicture;
      }
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (profession !== undefined) user.profession = profession;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (instagram !== undefined) user.instagram = instagram;
    if (facebook !== undefined) user.facebook = facebook;
    if (webpage !== undefined) user.webpage = webpage;
    if (soundcloud !== undefined) user.soundcloud = soundcloud;
    if (spotify !== undefined) user.spotify = spotify;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (phone !== undefined) user.phone = phone;
    if (hobbies !== undefined) user.hobbies = hobbies;
    if (message !== undefined) user.message = message;
    if (heart !== undefined) user.heart = heart;
    if (gender !== undefined) user.gender = gender;
    if (pronouns !== undefined) user.pronouns = pronouns;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;

    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ error: 'Old password required' });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Old password is incorrect' });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
        location: user.location,
        profession: user.profession,
        dateOfBirth: user.dateOfBirth,
        instagram: user.instagram,
        facebook: user.facebook,
        webpage: user.webpage,
        soundcloud: user.soundcloud,
        spotify: user.spotify,
        linkedin: user.linkedin,
        phone: user.phone,
        hobbies: user.hobbies,
        message: user.message,
        heart: user.heart,
        gender: user.gender,
        pronouns: user.pronouns,
        address: user.address,
        city: user.city,
        country: user.country,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in updateUser:', err.message);
  }
};

export const saveQuote = async (req, res) => {
  try {
    const { quote } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.quote = quote;
    await user.save();

    res.status(200).json({ message: 'Quote saved successfully' });
  } catch (error) {
    console.error('Error saving quote:', error);
    res.status(500).json({ message: 'Failed to save quote' });
  }
};

export const addGalleryToFavorites = async (req, res) => {
  try {
    const { galleryId } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(galleryId)) {
      return res.status(400).json({ error: 'Invalid gallery ID' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const galleryIdObj = new mongoose.Types.ObjectId(galleryId);

    if (!user.favoriteGalleries.some((favId) => favId.equals(galleryIdObj))) {
      user.favoriteGalleries.push(galleryIdObj);
      await user.save();

      const gallery = await Gallery.findById(galleryId).populate('owner', 'username');

      if (gallery && gallery.owner._id.toString() !== userId.toString()) {
        await Notification.create({
          user: gallery.owner._id,
          fromUser: userId,
          resourceType: 'Gallery',
          resourceId: gallery._id,
          type: 'favorite_gallery',
          message: `${user.username} added your gallery "${gallery.name}" to favorites.`,
        });
      }
    }

    res
      .status(200)
      .json({ message: 'Gallery added to favorites', favoriteGalleries: user.favoriteGalleries });
  } catch (err) {
    console.error('Error adding gallery to favorites:', err.message);
    res.status(500).json({ error: 'Failed to add gallery to favorites' });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('favorites')
      .populate('favoriteArticles', 'title subtitle createdAt')
      .populate({
        path: 'favoriteGalleries',
        populate: {
          path: 'owner',
          select: 'username firstName lastName',
        },
      });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      favoriteProducts: user.favorites || [],
      favoriteGalleries: user.favoriteGalleries || [],
      favoriteArticles: user.favoriteArticles || [],
    });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    return res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};

export const getUserWithGalleries = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('galleries', 'name _id')
      .select('galleries');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ galleries: user.galleries });
  } catch (err) {
    console.error('Error fetching user galleries:', err.message);
    res.status(500).json({ error: 'Failed to fetch user galleries' });
  }
};

export const removeGalleryFromFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { galleryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(galleryId)) {
      return res.status(400).json({ error: 'Invalid gallery ID' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const galleryIdObj = new mongoose.Types.ObjectId(galleryId);

    user.favoriteGalleries = user.favoriteGalleries.filter((favId) => !favId.equals(galleryIdObj));

    await user.save();

    res.status(200).json({
      message: 'Gallery removed from favorites',
      favoriteGalleries: user.favoriteGalleries,
    });
  } catch (err) {
    console.error('Error removing gallery from favorites:', err.message);
    res.status(500).json({ error: 'Failed to remove gallery from favorites' });
  }
};

export const moveToFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const productIdObj = new mongoose.Types.ObjectId(productId);
    if (!user.favorites.some((favId) => favId.equals(productIdObj))) {
      user.favorites.push(productIdObj);
    }

    user.cart = user.cart.filter((item) => !item.product.equals(productIdObj));

    await user.save();
    res.status(200).json({ favorites: user.favorites, cart: user.cart });
  } catch (err) {
    console.error(' Error in moveToFavorites:', err.message);
    res.status(500).json({ error: 'Failed to move to favorites' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!currentUser.isAdmin) {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }

    if (id === currentUserId.toString()) {
      return res.status(400).json({ error: 'You cannot delete your own profile!' });
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToDelete.profilePicture) {
      await cloudinary.uploader.destroy(userToDelete.profilePicture.split('/').pop().split('.')[0]);
    }

    await User.findByIdAndDelete(id);
    await addAuditLog({
      action: 'delete_user',
      performedBy: currentUserId,
      targetUser: id,
      details: `Deleted user: ${userToDelete.username || userToDelete.email}`,
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in deleteUser: ', err.message);
  }
};

export const getFavoriteProducts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate('favorites');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const blockUser = async (req, res) => {
  try {
    const userToBlock = req.params.userId;
    const currentUser = await User.findById(req.user._id);

    const userToBlockObj = new mongoose.Types.ObjectId(userToBlock);
    if (!currentUser.blockedUsers.some((blockedId) => blockedId.equals(userToBlockObj))) {
      currentUser.blockedUsers.push(userToBlockObj);
      await currentUser.save();
    }

    res.status(200).json(currentUser);
  } catch (error) {
    console.error('Error blocking user:', error.message);
    res.status(500).json({ error: 'Failed to block user' });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userIdToUnblockObj = new mongoose.Types.ObjectId(req.params.userId);

    user.blockedUsers = user.blockedUsers.filter((id) => !id.equals(userIdToUnblockObj));
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    console.error('Unblock error:', err);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'blockedUsers',
      'firstName lastName profilePicture',
    );
    res.status(200).json({ blockedUsers: user.blockedUsers });
  } catch (err) {
    console.error('Get blocked users error:', err);
    res.status(500).json({ error: 'Failed to get blocked users' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blockedUsers', '_id');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture,
      location: user.location,
      profession: user.profession,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      instagram: user.instagram,
      facebook: user.facebook,
      webpage: user.webpage,
      soundcloud: user.soundcloud,
      spotify: user.spotify,
      linkedin: user.linkedin,
      phone: user.phone,
      hobbies: user.hobbies,
      gender: user.gender,
      pronouns: user.pronouns,
      address: user.address,
      city: user.city,
      country: user.country,
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRandomUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      { $sample: { size: 6 } },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          username: 1,
          profilePicture: 1,
          profession: 1,
        },
      },
    ]);

    res.status(200).json(users);
  } catch (err) {
    console.error('Error getting random users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserFavoriteArticles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favoriteArticles', 'title _id');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ favoriteArticles: user.favoriteArticles });
  } catch (err) {
    console.error('Error fetching favorite articles:', err.message);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
};

export const toggleFavoriteGallery = async (req, res) => {
  try {
    const userId = req.user._id;
    const { galleryId } = req.body;
    let idFromParams = req.params.galleryId;

    const actualGalleryId = galleryId || idFromParams;

    if (!mongoose.Types.ObjectId.isValid(actualGalleryId)) {
      return res.status(400).json({ error: 'Invalid gallery ID' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const gallery = await Gallery.findById(actualGalleryId);
    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    const galleryIdObj = new mongoose.Types.ObjectId(actualGalleryId);
    const isCurrentlyFavorite = user.favoriteGalleries.some((favId) => favId.equals(galleryIdObj));

    let message;
    if (isCurrentlyFavorite) {
      user.favoriteGalleries = user.favoriteGalleries.filter(
        (favId) => !favId.equals(galleryIdObj),
      );
      message = 'Gallery removed from favorites';
    } else {
      user.favoriteGalleries.push(galleryIdObj);
      message = 'Gallery added to favorites';
    }

    await user.save();
    res.status(200).json({ message, isFavorite: !isCurrentlyFavorite });
  } catch (error) {
    console.error('Error toggling gallery favorite status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserFavoriteGalleries = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('favoriteGalleries', '_id');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const favoriteGalleryIds = user.favoriteGalleries.map((gallery) => gallery._id.toString());

    res.status(200).json(favoriteGalleryIds);
  } catch (error) {
    console.error('Error getting user favorite galleries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
