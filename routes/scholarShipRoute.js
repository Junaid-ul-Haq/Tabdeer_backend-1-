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
  getAllActiveOpportunities,
  getMyScholarshipOpportunities,
  updateScholarshipOpportunity,
  deleteScholarshipOpportunity,
  getAllCourses,
  getAllCountries,
} from "../controllers/scholarController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMulterMiddleware.js";

const router = express.Router();

// User submits scholarship (multiple files in different fields)
// Scholarship route - handles passport, experienceDocuments, and documents
router.post(
  "/createScholarship",
  protect,
  upload.fields([
    { name: "passport", maxCount: 1 },
    { name: "experienceDocuments", maxCount: 3 },
    { name: "documents", maxCount: 50 }, // No limit for all documents
  ]),
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

// User: Get all active opportunities (all available scholarships)
router.get("/opportunities/all", protect, getAllActiveOpportunities);

// User: Get opportunities filtered by degree and course
router.get("/opportunities/search", protect, getScholarshipOpportunitiesByFilter);

// User: Get opportunities based on logged-in user's profile
router.get("/opportunities/my-opportunities", protect, getMyScholarshipOpportunities);

// Admin: Update opportunity
router.put("/opportunities/:id", protect, authorize("admin"), updateScholarshipOpportunity);

// Admin: Delete opportunity
router.delete("/opportunities/:id", protect, authorize("admin"), deleteScholarshipOpportunity);

// Get all unique courses (for dropdowns)
router.get("/courses", protect, getAllCourses);

// Get all unique countries (for dropdowns)
router.get("/countries", protect, getAllCountries);

export default router;
