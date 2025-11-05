import express from "express";
import { signup, login, completeProfile, getAllUsers, getUserById } from "../controllers/authController.js";
import { upload } from "../middlewares/uploadMulterMiddleware.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

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

// Admin routes
router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/users/:id", protect, authorize("admin"), getUserById);

export default router;
