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

// NEW: Serve uploaded files securely


export default router;
