import express from "express";
import router from express.Router();
import path from "path";
import fs from "fs";
import { protect, authorize } from "../middlewares/authMiddleware.js";
const {
  createBusinessGrant,
  getMyBusinessGrants,
  getAllBusinessGrants,
  updateBusinessGrantStatus,
  getBusinessGrantById,
} = require("../controllers/businessGrantController");
const { upload } = require("../middlewares/uploadMulterMiddleware");

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


module.exports = router;
