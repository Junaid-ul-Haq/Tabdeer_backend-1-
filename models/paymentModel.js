import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Reference to the User who made the payment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One payment per user
    },

    // Account details (from check image)
    accountName: {
      type: String,
      default: "SALEEMAH KHANUM WELFARE FOUNDATION (SKWF)",
    },
    accountNumber: {
      type: String,
      default: "PK48ABPA0010027253970016",
    },
    bankName: {
      type: String,
      default: "Allied Bank",
    },
    branch: {
      type: String,
      default: "ABL-FAISAL TOWN 11-B, FAISAL TOWN, LAHORE",
    },

    // Payment amount
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      enum: [2500, 5000],
    },

    // Payment screenshot
    screenshot: {
      fileName: {
        type: String,
        required: [true, "Payment screenshot is required"],
      },
      filePath: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
      },
    },

    // Payment status
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    // Admin notes (if rejected)
    adminNotes: {
      type: String,
      trim: true,
    },

    // Admin who verified (if verified)
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

