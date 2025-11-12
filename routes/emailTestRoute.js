import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { testEmailConfiguration } from "../controllers/emailTestController.js";

const router = express.Router();

// Test email configuration (Admin only)
router.get("/test", protect, authorize("admin"), testEmailConfiguration);

export default router;







