const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { protect, authorize } = require("../middlewares/authMiddleware");
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
