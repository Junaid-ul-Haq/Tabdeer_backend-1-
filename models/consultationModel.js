// src/models/consultationModel.js
const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // keep true if consultation must belong to a logged-in user
    },
    category: {
      type: String,
      enum: ["studies", "business", "other"],
      required: [true, "Consultation category is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    // Support multiple file uploads for consultations
    documents: [
      {
        fileName: {
          type: String,
          required: true,
        },
        filePath: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          max: 5 * 1024 * 1024, // 5 MB max size
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Consultation = mongoose.model("Consultation", consultationSchema);
module.exports = Consultation;
