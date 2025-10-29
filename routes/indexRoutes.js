// routes/index.js
import express from "express";
import router from express.Router();
import authRoutes from "./authRoutes.js";
import consultationRoutes from "./consultationRoutes.js";
import scholarshipRoutes from "./scholarShipRoute.js";
import businessGrantRoutes from "./businessGrantRoutes.js";
import fileRoutes from "./fileRoute.js";
//Use Routes
router.use("/auth", authRoutes);
router.use("/consultation",consultationRoutes)
router.use("/scholarship", scholarshipRoutes);
router.use("/business", businessGrantRoutes);
router.use("/api/files", fileRoutes); // Changed to /api/files to avoid conflict with static serving

module.exports = router;
