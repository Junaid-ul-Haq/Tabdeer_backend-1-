const express = require("express");
const { signup, login,completeProfile } = require("../controllers/authController");
const {upload}= require("../middlewares/uploadMulterMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();


// Upload CNIC front/back
router.post(
  "/signup",
  upload.fields([
    { name: "cnicFront", maxCount: 1 },
    { name: "cnicBack", maxCount: 1 },
  ]),
  signup
);


router.post("/login", login);
router.put("/complete-profile", protect, completeProfile);
module.exports = router;
