// routes/index.js
const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const consultationRoutes = require ("./consultationRoutes");
const scholarshipRoutes = require("./scholarShipRoute");
const businessGrantRoutes = require("./businessGrantRoutes");
const fileRoutes = require("./fileRoute");
//Use Routes
router.use("/auth", authRoutes);
router.use("/consultation",consultationRoutes)
router.use("/scholarship", scholarshipRoutes);
router.use("/business", businessGrantRoutes);
router.use("/api/files", fileRoutes); // Changed to /api/files to avoid conflict with static serving

module.exports = router;
