import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import cors from "cors"; // ✅ nou

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js"; // ✅ nou
import notificationRoutes from "./routes/notificationRoutes.js"; // ✅ nou
import articleRoutes from "./routes/articleRoutes.js"; // ✅ nou
import upload from "./config/imgUpload.js";
import { EventEmitter } from "events";

EventEmitter.defaultMaxListeners = 20;

dotenv.config();
console.log("📦 MONGO_URI:", process.env.MONGO_URI);
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());


// ✅ CORS config corect (IMPORTANT pentru cookies)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/galleries", galleryRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/reviews", reviewRoutes); // ✅ nou
app.use("/api/notifications", notificationRoutes);
app.use("/api/articles", articleRoutes);



// Not Found fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () =>
  console.log(`✅ Server started at http://localhost:${PORT}`)
);
