import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

import generateToken from "../utils/generateToken.js";

import { getRelativePath } from "../middlewares/uploadMulterMiddleware.js";
import path from "path";
import fs from "fs";

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    // Ensure files are uploaded
    const cnicFrontFile = req.files?.cnicFront?.[0];
    const cnicBackFile = req.files?.cnicBack?.[0];

    if (!cnicFrontFile || !cnicBackFile) {
      return res.status(400).json({ message: "CNIC front and back images are required." });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists." });

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
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
      password: hashedPassword,
      role: role || "user",
      cnicFront,
      cnicBack,
      chancesLeft: 3,
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
        role: newUser.role,
        profileCompleted: newUser.profileCompleted,
        cnicFront,
        cnicBack,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message });
  }
};







// ✅ Complete Profile
exports.completeProfile = async (req, res) => {
  try {
    const { education, experience } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.education = education;
    user.experience = experience;
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

exports.login = async (req, res) => {
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
        chancesLeft: user.chancesLeft,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
