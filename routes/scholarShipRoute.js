import express from "express";
import {
  createScholarship,
  getMyScholarships,
  getAllScholarships,
  updateScholarshipStatus,
  getScholarshipById,
  getDegreeLevels,
  createScholarshipOpportunity,
  getAllScholarshipOpportunities,
  getScholarshipOpportunitiesByFilter,
  updateScholarshipOpportunity,
  deleteScholarshipOpportunity,
  getAllCourses,
  getAllCountries,
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

// ==========================================
// SCHOLARSHIP OPPORTUNITIES ROUTES
// ==========================================

// Admin: Create scholarship opportunity
router.post("/opportunities/create", protect, authorize("admin"), createScholarshipOpportunity);

// Admin: Get all opportunities (with pagination and search)
router.get("/opportunities", protect, authorize("admin"), getAllScholarshipOpportunities);

// User: Get opportunities filtered by degree and course
router.get("/opportunities/search", protect, getScholarshipOpportunitiesByFilter);

// Admin: Update opportunity
router.put("/opportunities/:id", protect, authorize("admin"), updateScholarshipOpportunity);

// Admin: Delete opportunity
router.delete("/opportunities/:id", protect, authorize("admin"), deleteScholarshipOpportunity);

// Get all unique courses (for dropdowns)
router.get("/courses", protect, getAllCourses);

// Get all unique countries (for dropdowns)
router.get("/countries", protect, getAllCountries);

export default router;
