import express from "express";
import { addComment,getComments } from "../controllers/commentController.js";

const router = express.Router();

router.post("/", addComment);
router.get("/", getComments); // Ruta pentru obținerea comentariilor

export default router;
