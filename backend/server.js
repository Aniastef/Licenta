import express from "express";
import dotenv from "dotenv";
import connectDB  from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import {v2 as cloudinary} from "cloudinary"


dotenv.config();
connectDB();

const app = express();

// app.get("/products", (req, res) => {
//     res.json({ message: "Endpoint is working!" });
// });

const PORT = process.env.PORT || 5000;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);


app.listen(PORT, () =>
    console.log(`Server started at http://localhost:${PORT}`));
