import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import paginate from "../utils/paginate.js";
import {
  sendPaymentSubmittedEmail,
  sendPaymentAcceptedEmail,
  sendPaymentRejectedEmail,
} from "../utils/emailService.js";

// @desc Create payment (User)
export const createPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || ![2500, 5000].includes(parseInt(amount))) {
      return res.status(400).json({
        success: false,
        message: "Amount must be either 2500 or 5000",
      });
    }

    // Check if user already has a payment
    const existingPayment = await Payment.findOne({ user: req.user._id });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already submitted. Please wait for admin verification.",
      });
    }

    // Handle uploaded screenshot
    const screenshotFile = req.file;
    if (!screenshotFile) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot is required",
      });
    }

    // Ensure forward slashes for Windows paths
    const normalizedPath = screenshotFile.path.replace(/\\/g, "/");
    const relativePathIndex = normalizedPath.indexOf("/uploads/");
    const relativePath =
      relativePathIndex !== -1
        ? normalizedPath.slice(relativePathIndex + 1)
        : screenshotFile.filename;

    const screenshot = {
      fileName: screenshotFile.originalname,
      fileType: screenshotFile.mimetype,
      filePath: `/files/${relativePath.replace("uploads/", "")}`,
    };

    // Create payment
    const payment = await Payment.create({
      user: req.user._id,
      amount: parseInt(amount),
      screenshot,
      status: "pending",
    });

    // Send email to user when payment is submitted (don't block the response if email fails)
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        console.log(`📧 [CREATE PAYMENT] Attempting to send payment submitted email to: ${user.email}`);
        await sendPaymentSubmittedEmail(user, payment);
        console.log(`✅ [CREATE PAYMENT] Successfully sent payment submitted email to: ${user.email}`);
      }
    } catch (emailError) {
      console.error("❌ [CREATE PAYMENT] Failed to send email to user:", req.user.email || "unknown");
      console.error("  - Payment ID:", payment._id);
      console.error("  - Error Message:", emailError.message);
      // Continue even if email fails - payment is already created
    }

    res.status(201).json({
      success: true,
      message: "Payment submitted successfully. Please wait for admin verification.",
      payment,
    });
  } catch (error) {
    console.error("❌ [CREATE PAYMENT] Error creating payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get user's payment (User)
export const getMyPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ user: req.user._id }).populate(
      "verifiedBy",
      "name email"
    );

    if (!payment) {
      return res.status(200).json({
        success: true,
        payment: null,
        message: "No payment submitted yet",
      });
    }

    const host = `${req.protocol}://${req.get("host")}`;
    const screenshot = payment.screenshot
      ? {
          fileName: payment.screenshot.fileName,
          fileType: payment.screenshot.fileType,
          filePath: payment.screenshot.filePath,
          url: `${host}${payment.screenshot.filePath}`,
        }
      : null;

    res.status(200).json({
      success: true,
      payment: {
        ...payment.toObject(),
        screenshot,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all payments (Admin)
export const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // optional filter by status

    let query = {};
    if (status && ["pending", "verified", "rejected"].includes(status)) {
      query.status = status;
    }

    const result = await paginate(Payment, query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "user", select: "name email phone CNIC address" },
        { path: "verifiedBy", select: "name email" },
      ],
    });

    const host = `${req.protocol}://${req.get("host")}`;
    const mapped = result.data.map((payment) => {
      const screenshot = payment.screenshot
        ? {
            fileName: payment.screenshot.fileName,
            fileType: payment.screenshot.fileType,
            filePath: payment.screenshot.filePath,
            url: `${host}${payment.screenshot.filePath}`,
          }
        : null;

      return { ...payment.toObject(), screenshot };
    });

    res.status(200).json({
      success: true,
      data: mapped,
      page: result.page,
      totalPages: result.totalPages,
      totalRecords: result.total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Verify payment (Admin)
export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'verified' or 'rejected'",
      });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = status;
    const user = await User.findById(payment.user);
    
    if (status === "verified") {
      payment.verifiedBy = req.user._id;
      // Update user's payment status and add 3 credit hours
      if (user) {
        user.paymentVerified = true;
        // Add 3 credit hours when payment is verified
        user.creditHours = (user.creditHours || 0) + 3;
        user.chancesLeft = user.creditHours; // Keep in sync for backward compatibility
        await user.save();
      }
    }
    if (adminNotes) payment.adminNotes = adminNotes;

    await payment.save();

    // Send email to user based on status (don't block the response if email fails)
    try {
      if (user && user.email) {
        console.log(`📧 [VERIFY PAYMENT] Attempting to send ${status} email to user: ${user.email}`);
        console.log(`📧 [VERIFY PAYMENT] User details - Name: ${user.name}, Email: ${user.email}, ID: ${user._id}`);
        if (status === "verified") {
          await sendPaymentAcceptedEmail(user, payment);
          console.log(`✅ [VERIFY PAYMENT] Successfully sent payment ACCEPTED email to: ${user.email}`);
        } else if (status === "rejected") {
          await sendPaymentRejectedEmail(user, payment);
          console.log(`✅ [VERIFY PAYMENT] Successfully sent payment REJECTED email to: ${user.email}`);
        }
      } else {
        console.warn("⚠️ [VERIFY PAYMENT] Cannot send email:");
        console.warn("  - User found:", !!user);
        console.warn("  - User email exists:", !!user?.email);
        console.warn("  - Payment ID:", payment._id);
        console.warn("  - User ID:", payment.user);
      }
    } catch (emailError) {
      console.error("❌ [VERIFY PAYMENT] Failed to send email to user:", user?.email || "unknown");
      console.error("  - Payment Status:", status);
      console.error("  - Payment ID:", payment._id);
      console.error("  - User ID:", payment.user);
      console.error("  - Error Code:", emailError.code);
      console.error("  - Error Message:", emailError.message);
      console.error("  - Error Stack:", emailError.stack);
      // Continue even if email fails
    }

    res.status(200).json({
      success: true,
      message: `Payment ${status} successfully`,
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get payment by ID (Admin)
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id).populate([
      { path: "user", select: "-password" },
      { path: "verifiedBy", select: "name email" },
    ]);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const host = `${req.protocol}://${req.get("host")}`;
    const screenshot = payment.screenshot
      ? {
          fileName: payment.screenshot.fileName,
          fileType: payment.screenshot.fileType,
          filePath: payment.screenshot.filePath,
          url: `${host}${payment.screenshot.filePath}`,
        }
      : null;

    res.status(200).json({
      success: true,
      data: { ...payment.toObject(), screenshot },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

