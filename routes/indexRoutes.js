// routes/index.js
import express from "express";
import authRoutes from "./authRoutes.js";
import consultationRoutes from "./consultationRoutes.js";
import scholarshipRoutes from "./scholarShipRoute.js";
import businessGrantRoutes from "./businessGrantRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import statsRoutes from "./statsRoutes.js";
import fileRoutes from "./fileRoute.js";
import emailTestRoutes from "./emailTestRoute.js";

const router = express.Router();

//Use Routes
router.use("/auth", authRoutes);
router.use("/consultation", consultationRoutes);
router.use("/scholarship", scholarshipRoutes);
router.use("/business", businessGrantRoutes);
router.use("/payment", paymentRoutes);
router.use("/stats", statsRoutes);
router.use("/api/files", fileRoutes); // Changed to /api/files to avoid conflict with static serving
router.use("/email", emailTestRoutes); // Email test route

export default router;
