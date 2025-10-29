// routes/consultationRoutes.js
import express from "express";
import {
  createConsultation,
  getMyConsultations,
  getAllConsultations,
  updateConsultationStatus,
  getConsultationDetailsById,
  getCategories,
} from "../controllers/consultationController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { validateConsultation } from "../middlewares/validationMiddleware.js";
import { upload } from "../middlewares/uploadMulterMiddleware.js";

const router = express.Router();

// User creates consultation with file uploads
router.post("/createConsultation", protect, upload.array("documents", 10), createConsultation);

// User gets their own consultations
router.get("/getMyConsultations", protect, getMyConsultations);

// Admin gets all consultations
router.get("/getAllConsultations", protect, authorize("admin"), getAllConsultations);

// Admin updates consultation status
router.patch("/updateConsultationStatus/:id", protect, authorize("admin"), updateConsultationStatus);
// admin: get single consultation details
router.get("/getById/:id", protect, authorize("admin"), getConsultationDetailsById);
//get catagories
router.get("/categories", getCategories);
export default router;
