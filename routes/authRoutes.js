import express from "express";
import { signup, login,completeProfile } from "../controllers/authController.js";
import { upload } from "../middlewares/uploadMulterMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

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
