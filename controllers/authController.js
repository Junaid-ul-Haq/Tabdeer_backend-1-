import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

import generateToken from "../utils/generateToken.js";

import { getRelativePath } from "../middlewares/uploadMulterMiddleware.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, cnicNumber, address, role, adminSecretKey } = req.body;

    // Ensure files are uploaded
    const cnicFrontFile = req.files?.cnicFront?.[0];
    const cnicBackFile = req.files?.cnicBack?.[0];

    if (!cnicFrontFile || !cnicBackFile) {
      return res.status(400).json({ message: "CNIC front and back images are required." });
    }

    // Validate CNIC number format (XXXXX-XXXXXXX-X)
    if (!cnicNumber || !/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(cnicNumber)) {
      return res.status(400).json({ message: "Invalid CNIC format. Use XXXXX-XXXXXXX-X" });
    }

    if (!address || address.trim().length === 0) {
      return res.status(400).json({ message: "Address is required." });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists." });

    // Check if CNIC already exists
    const existingCNIC = await User.findOne({ CNIC: cnicNumber });
    if (existingCNIC) return res.status(400).json({ message: "CNIC number already registered." });

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // 🔒 SECURITY: Validate admin registration
    let finalRole = "user"; // Default to user
    if (role === "admin") {
      // Check if admin secret key is provided and valid
      // Read from environment variable
      const validAdminKey = process.env.ADMIN_SECRET_KEY;
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === "development") {
        console.log("🔐 Admin Registration Attempt:");
        console.log("   - Provided key:", adminSecretKey ? "***" + adminSecretKey.slice(-4) : "MISSING");
        console.log("   - Expected key:", validAdminKey ? "***" + validAdminKey.slice(-4) : "NOT SET (using default)");
      }
      
      // If no env variable set, use default (for backwards compatibility)
      const keyToCompare = validAdminKey || "TADBEER_ADMIN_2024_SECRET";
      
      if (!adminSecretKey) {
        return res.status(403).json({ 
          message: "Admin secret key is required to register as admin." 
        });
      }
      
      if (adminSecretKey !== keyToCompare) {
        return res.status(403).json({ 
          message: "Invalid admin secret key. Admin registration is restricted." 
        });
      }
      
      // Secret key is valid, allow admin registration
      finalRole = "admin";
      console.log("✅ Admin registration successful for:", email);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Move files to a folder per user (optional, better organization)
    const uploadFolder = path.join(__dirname, "..", "uploads", "signup");
    if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

    const cnicFrontName = `${Date.now()}_front_${cnicFrontFile.originalname}`;
    const cnicBackName = `${Date.now()}_back_${cnicBackFile.originalname}`;

    const cnicFrontPath = path.join(uploadFolder, cnicFrontName);
    const cnicBackPath = path.join(uploadFolder, cnicBackName);

    fs.renameSync(cnicFrontFile.path, cnicFrontPath);
    fs.renameSync(cnicBackFile.path, cnicBackPath);

 const cnicFront = `/files/signup/${cnicFrontName}`;
const cnicBack = `/files/signup/${cnicBackName}`;


    // Create user
    const newUser = await User.create({
      name,
      email,
      phone,
      CNIC: cnicNumber,
      address: address.trim(),
      password: hashedPassword,
      role: finalRole, // Use validated role
      cnicFront,
      cnicBack,
      chancesLeft: finalRole === "admin" ? undefined : 3, // Admin doesn't need chances
      profileCompleted: false,
    });

    // Generate token
    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        CNIC: newUser.CNIC,
        address: newUser.address,
        role: newUser.role,
        profileCompleted: newUser.profileCompleted,
        cnicFront,
        cnicBack,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    console.error("Error Details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ 
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};







// ✅ Complete Profile
// @desc Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    // Build search query
    let query = { role: "user" }; // Only get users, not admins
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { CNIC: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: users,
      page,
      totalPages,
      totalRecords: total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get single user details (Admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's applications
    const Scholarship = (await import("../models/scholarShipModel.js")).default;
    const BusinessGrant = (await import("../models/businessGrantModel.js")).default;
    const Consultation = (await import("../models/consultationModel.js")).default;
    const Payment = (await import("../models/paymentModel.js")).default;

    const [scholarships, grants, consultations, payment] = await Promise.all([
      Scholarship.find({ user: id }),
      BusinessGrant.find({ user: id }),
      Consultation.find({ user: id }),
      Payment.findOne({ user: id }),
    ]);

    res.status(200).json({
      success: true,
      user,
      applications: {
        scholarships,
        grants,
        consultations,
        payment,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { education, experience } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.education = education;
    user.experience = experience;
    user.profileCompleted = true; // Mark profile as completed
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Login user

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // get user with password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if payment is verified (for users only)
    if (user.role === "user" && !user.paymentVerified) {
      return res.status(403).json({
        message: "Payment verification pending. Please wait for admin approval.",
        paymentPending: true,
      });
    }

    // generate token after successful login
    const token = generateToken(user._id, user.role);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        paymentVerified: user.paymentVerified,
        creditHours: user.creditHours ?? user.chancesLeft ?? 0,
        chancesLeft: user.creditHours ?? user.chancesLeft ?? 0, // backward compatibility
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
