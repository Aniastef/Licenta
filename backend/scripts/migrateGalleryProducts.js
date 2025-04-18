import mongoose from "mongoose";
import Gallery from "../models/galleryModel.js";
import dotenv from "dotenv";

dotenv.config(); // încarcă .env cu MONGO_URI

const migrateGalleries = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const galleries = await Gallery.find();

    for (const gallery of galleries) {
      // dacă produsele sunt array de ObjectId (nu obiecte)
      if (
        gallery.products.length > 0 &&
        typeof gallery.products[0] === "object" &&
        !gallery.products[0].product
      ) {
        const updatedProducts = gallery.products.map((productId, index) => ({
          product: productId,
          order: index,
        }));

        gallery.products = updatedProducts;
        await gallery.save();
        console.log(`✅ Migrated gallery: ${gallery.name}`);
      }
    }

    console.log("✅ Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
};

migrateGalleries();
