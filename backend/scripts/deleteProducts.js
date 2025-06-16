
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';

dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const deleteAllProducts = async () => {
  try {
    await Product.deleteMany({});
    console.log('✅ All products have been deleted.');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error deleting products:', err);
  }
};

deleteAllProducts();
