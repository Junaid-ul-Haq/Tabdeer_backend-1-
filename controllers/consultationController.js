// src/controllers/consultationController.js
const Consultation = require("../models/consultationModel");
// @desc Get all consultations (Admin) — populate full user info
const paginate = require("../utils/paginate");
// @desc Create new consultation (User)
exports.createConsultation = async (req, res) => {
  try {
    const { category, description } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: "Category and description are required",
      });
    }

    // ✅ Handle uploaded files
    const documents = req.files?.map((file) => {
      // Determine folder name from multer storage (e.g., "others")
      const folder = "others";

      return {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        // Store relative URL path like other models
        filePath: `/files/${folder}/${file.filename}`,
      };
    }) || [];

    const consultation = await Consultation.create({
      user: req.user._id,
      category,
      description,
      documents,
    });

    res.status(201).json({
      success: true,
      message: "Consultation request submitted successfully",
      consultation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all consultations for logged-in user
exports.getMyConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// @desc Get all consultations with pagination (Admin only)
exports.getAllConsultations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;   // default page 1
    const limit = parseInt(req.query.limit) || 10; // default 10 records per page

    // Use paginate utility
    const result = await paginate(Consultation, {}, {
      page,
      limit,
      sort: { createdAt: -1 },
populate: { path: "user", select: "name email" }
    });

    res.status(200).json({
      success: true,
      data: result.data,
      page: result.page,
      totalPages: result.totalPages,
      totalRecords: result.total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update consultation status (Admin)
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    consultation.status = status;
    await consultation.save();

    res.status(200).json({
      success: true,
      message: `Consultation ${status} successfully`,
      consultation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get detailed consultation + user info by consultation ID (Admin)
exports.getConsultationDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id)
      .populate("user", "-password -role"); // exclude sensitive fields

    if (!consultation) {
      return res.status(404).json({ success: false, message: "Consultation not found" });
    }

    res.status(200).json({
      success: true,
      consultation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// GET /consultation/categories

exports.getCategories = async (req, res) => {
  try {
    // Dynamically read enum values from Consultation schema
    const categories = Consultation.schema.path("category").enumValues;

    res.status(200).json({
      success: true,
      categories, // array of enum strings like ["studies", "business", "other"]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
