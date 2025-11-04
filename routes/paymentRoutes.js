import express from "express";
import {
  createPayment,
  getMyPayment,
  getAllPayments,
  verifyPayment,
  getPaymentById,
} from "../controllers/paymentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMulterMiddleware.js";

const router = express.Router();

// User: Create payment
router.post(
  "/create",
  protect,
  upload.single("screenshot"),
  createPayment
);

// User: Get my payment
router.get("/my-payment", protect, getMyPayment);

// Admin: Get all payments
router.get("/all", protect, authorize("admin"), getAllPayments);

// Admin: Get payment by ID
router.get("/:id", protect, authorize("admin"), getPaymentById);

// Admin: Verify payment
router.patch("/verify/:id", protect, authorize("admin"), verifyPayment);

export default router;

