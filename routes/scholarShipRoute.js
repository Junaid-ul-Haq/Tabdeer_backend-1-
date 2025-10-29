import express from "express";
import {
  createScholarship,
  getMyScholarships,
  getAllScholarships,
  updateScholarshipStatus,
  getScholarshipById,
  getDegreeLevels,
} from "../controllers/scholarController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMulterMiddleware.js";

const router = express.Router();

// User submits scholarship (multiple files in one field "documents")
// Scholarship route
router.post(
  "/createScholarship",
  protect,
  upload.array("documents", 10),  // multiple files under single field
  createScholarship
);
// User views their own scholarships
router.get("/getMyScholarships", protect, getMyScholarships);

// Admin views all scholarships
router.get("/getAllScholarships", protect, authorize("admin"), getAllScholarships);

// Admin updates scholarship status
router.patch("/updateScholarshipStatus/:id", protect, authorize("admin"), updateScholarshipStatus);
// Admin: get single scholarship by ID
router.get("/get/:id", protect, authorize("admin"), getScholarshipById);
//degreelevel
router.get("/degree-levels", protect, getDegreeLevels);
export default router;
