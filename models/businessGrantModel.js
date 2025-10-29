import mongoose from "mongoose";

const businessGrantSchema = new mongoose.Schema(
  {
    // Reference to the User who applied
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Grant title (e.g. "Startup Equipment Support", "Women Entrepreneurship Grant")
    title: {
      type: String,
      required: [true, "Grant title is required"],
      trim: true,
      maxlength: 100,
    },

    // Brief description of the grant idea
    description: {
      type: String,
      required: [true, "Grant description is required"],
      trim: true,
      maxlength: 1000, // limit to reasonable length
    },

    // Optional amount user is requesting
   

    // Uploaded business proposal (single file)
    proposal: {
      fileName: {
        type: String,
      },
      filePath: {
        type: String, // e.g. "uploads/proposals/abc123.pdf"
      },
      fileType: {
        type: String, // e.g. "application/pdf"
      },
      fileSize: {
        type: Number, // in bytes
        max: 5 * 1024 * 1024, // 5 MB max size
      },
    },

    // Status controlled by Admin
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("BusinessGrant", businessGrantSchema);
