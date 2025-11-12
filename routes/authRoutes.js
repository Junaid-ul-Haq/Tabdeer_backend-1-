import express from "express";
import { signup, login, completeProfile, getAllUsers, getUserById, getMe, deleteUser } from "../controllers/authController.js";
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
router.get("/me", protect, getMe); // Get current user
router.put("/complete-profile", protect, completeProfile);

// Admin routes
router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/users/:id", protect, authorize("admin"), getUserById);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

export default router;
