import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { getFile } from "../controllers/fileController.js";

const router = express.Router();

// Test route to verify authentication
router.get("/test", protect, (req, res) => {
  res.json({ message: "Authentication working!", user: req.user.id });
});

// URL format: /api/files/signup/cnicFront-xxxx.jpg
router.get("/:folder/:filename", protect, getFile);




export default router;
