import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^(\+92|0)?[0-9]{10,11}$/, "Invalid phone number"],
    },
    CNIC: {
      type: String,
      required: [true, "CNIC number is required"],
      match: [/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, "Invalid CNIC format. Use XXXXX-XXXXXXX-X"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: 500,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    cnicFront: {
      type: String,
      required: [true, "CNIC front image is required"],
    },
    cnicBack: {
      type: String,
      required: [true, "CNIC back image is required"],
    },

    // education or experience wali arry idar han
     education: [
    { 
      institute: { type: String },
      degree: { type: String },
      cgpa: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
    },
  ],

  
  experience: [
    {
      institute: { type: String },
      role: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
    },
  ],

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    paymentVerified: {
      type: Boolean,
      default: false,
    },

    creditHours: {
      type: Number,
      default: function () {
        return this.role === "user" ? 0 : undefined; // Users start with 0, get 3 after first payment
      },
    },
    // Keep chancesLeft for backward compatibility (will be deprecated)
    chancesLeft: {
      type: Number,
      default: function () {
        return this.role === "user" ? 0 : undefined;
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
