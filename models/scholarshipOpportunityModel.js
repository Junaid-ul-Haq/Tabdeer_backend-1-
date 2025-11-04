import mongoose from "mongoose";

const scholarshipOpportunitySchema = new mongoose.Schema(
  {
    // Degree level (Bachelor, Master, etc.)
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

    // Course/Field of study (Computer Science, Finance, Chemistry, etc.)
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },

    // Country where scholarship is available
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },

    // Qualification type (optional - could be used for additional details)
    qualificationType: {
      type: String,
      trim: true,
      default: "",
    },

    // Additional description (optional)
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Admin who created this opportunity
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Active status - admin can enable/disable
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
scholarshipOpportunitySchema.index({ degreeLevel: 1, course: 1 });
scholarshipOpportunitySchema.index({ country: 1 });

export default mongoose.model("ScholarshipOpportunity", scholarshipOpportunitySchema);

