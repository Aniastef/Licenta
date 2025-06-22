//run node scripts/deleteUsers.js from backend folder
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const deleteAllUsers = async () => {
  try {
    await User.deleteMany({});
    console.log('All users have been deleted.');
    mongoose.connection.close();
  } catch (err) {
    console.error(' Error deleting users:', err);
  }
};

deleteAllUsers();
