// routes/consultationRoutes.js
import express from "express";
const {
  createConsultation,
  getMyConsultations,
  getAllConsultations,
  updateConsultationStatus,
    getConsultationDetailsById,
    getCategories,
  
} = require("../controllers/consultationController");

const { protect, authorize } = require("../middlewares/authMiddleware");
const { validateConsultation } = require("../middlewares/validationMiddleware");
const { upload } = require("../middlewares/uploadMulterMiddleware");

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
module.exports = router;
