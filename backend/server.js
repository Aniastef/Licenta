import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import commentRoutes from "./routes/commentRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import galleryRoutes from "./routes/galleryRoutes.js"
import upload from "./config/imgUpload.js";
import { EventEmitter } from "events";

EventEmitter.defaultMaxListeners = 20;

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' })); // Crește limita pentru JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Crește limita pentru URL-encoded

app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/galleries", galleryRoutes);



app.use((req, res) => {
	res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () =>
	console.log(`Server started at http://localhost:${PORT}`)
);
