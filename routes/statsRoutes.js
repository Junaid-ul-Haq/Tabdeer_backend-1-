import express from "express";
import { getGlobalImpact } from "../controllers/statsController.js";

const router = express.Router();

// Public route - no authentication required
router.get("/global-impact", getGlobalImpact);

export default router;

