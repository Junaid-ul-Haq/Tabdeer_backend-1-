import mongoose from "mongoose";

const businessGrantOpportunitySchema = new mongoose.Schema(
  {
    // City where the grant is available
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    // Amount available for the grant
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },

    // Optional description
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Admin who created this opportunity
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("BusinessGrantOpportunity", businessGrantOpportunitySchema);

