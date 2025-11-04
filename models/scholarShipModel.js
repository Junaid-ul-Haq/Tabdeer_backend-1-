import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Degree selection dropdown
    degreeLevel: {
      type: String,
      enum: [
        "Matric",
        "Intermediate",
        "Bachelor (BS)",
        "Master (MS)",
        "MPhil",
        "PhD",
      ],
      required: [true, "Degree level is required"],
    },

    // Course/Field of study
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },

    // Link to scholarship opportunity (if applied from opportunity)
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScholarshipOpportunity",
      default: null,
    },

    // Multiple uploaded documents
    documents: [
      {
        fileName: String,  // original name
        filePath: String,  // local path or relative URL
        fileType: String,  // mimetype
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

export default mongoose.model("Scholarship", scholarshipSchema);
