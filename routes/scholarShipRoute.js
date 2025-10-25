const express = require("express");
const router = express.Router();
const {
  createScholarship,
  getMyScholarships,
  getAllScholarships,
  updateScholarshipStatus,
  getScholarshipById,
  getDegreeLevels,
} = require("../controllers/scholarController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const {upload} = require("../middlewares/uploadMulterMiddleware");

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
module.exports = router;
