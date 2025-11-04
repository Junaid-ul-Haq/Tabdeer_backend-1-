import express from "express";
import path from "path";
import fs from "fs";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  createBusinessGrant,
  getMyBusinessGrants,
  getAllBusinessGrants,
  updateBusinessGrantStatus,
  getBusinessGrantById,
  createGrantOpportunity,
  getAllGrantOpportunities,
  getAllActiveGrantOpportunities,
  updateGrantOpportunity,
  deleteGrantOpportunity,
} from "../controllers/businessGrantController.js";
import { upload } from "../middlewares/uploadMulterMiddleware.js";

const router = express.Router();

// Create grant
router.post(
  "/createGrant",
  protect,
  upload.single("proposal"),
  createBusinessGrant
);

// Get my grants
router.get("/getMyGrants", protect, getMyBusinessGrants);

// Admin routes
router.get("/getAllGrants", protect, authorize("admin"), getAllBusinessGrants);
router.patch(
  "/updateGrantStatus/:id",
  protect,
  authorize("admin"),
  updateBusinessGrantStatus
);
router.get("/get/:id", protect, authorize("admin"), getBusinessGrantById);

// ==========================================
// BUSINESS GRANT OPPORTUNITIES ROUTES
// ==========================================

// Admin: Create grant opportunity
router.post("/opportunities/create", protect, authorize("admin"), createGrantOpportunity);

// Admin: Get all opportunities (with pagination and search)
router.get("/opportunities", protect, authorize("admin"), getAllGrantOpportunities);

// User: Get all active opportunities
router.get("/opportunities/all", protect, getAllActiveGrantOpportunities);

// Admin: Update opportunity
router.put("/opportunities/:id", protect, authorize("admin"), updateGrantOpportunity);

// Admin: Delete opportunity
router.delete("/opportunities/:id", protect, authorize("admin"), deleteGrantOpportunity);

// NEW: Serve uploaded files securely


export default router;
