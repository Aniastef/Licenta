import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/userModel.js'; 
import Product from './models/productModel.js'; 
import connectDB from './config/connectDB.js';

const migrateProductsToUsers = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully.");

    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} users to process.`);

    let updatedCount = 0;

    for (const user of allUsers) {
      // ✅ LOG-URI DE DEPANARE
      console.log(`\n-----------------------------------------`);
      console.log(`Processing user: ${user.username} (${user._id})`);
      console.log(`Searching for products with criteria: { createdBy: "${user._id}" }`);

      const userProducts = await Product.find({ user: user._id });

      // ✅ LOG-URI DE DEPANARE
      console.log(`Found ${userProducts.length} products for this user.`);

      const productIds = userProducts.map(product => product._id);

      const currentProductIds = user.products.map(id => id.toString());
      const newProductIds = productIds.map(id => id.toString());
      
      if (JSON.stringify(currentProductIds.sort()) !== JSON.stringify(newProductIds.sort())) {
        // ✅ LOG-URI DE DEPANARE
        console.log(`Update required! Saving ${productIds.length} product(s) to user.`);
        
        await User.updateOne(
          { _id: user._id },
          { $set: { products: productIds } }
        );
        console.log(`✅ Successfully updated user ${user.username}.`);
        updatedCount++;
      } else {
        // ✅ LOG-URI DE DEPANARE
        console.log(`No update needed for this user.`);
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`Total users processed: ${allUsers.length}`);
    console.log(`Total users updated: ${updatedCount}`);

  } catch (error) {
    console.error("An error occurred during migration:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
        console.log("MongoDB connection closed.");
    }
  }
};

migrateProductsToUsers();