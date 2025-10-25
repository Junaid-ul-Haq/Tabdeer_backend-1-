const express = require("express");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { getFile } = require("../controllers/fileController");

const router = express.Router();

// Test route to verify authentication
router.get("/test", protect, (req, res) => {
  res.json({ message: "Authentication working!", user: req.user.id });
});

// URL format: /api/files/signup/cnicFront-xxxx.jpg
router.get("/:folder/:filename", protect, getFile);




module.exports = router;
