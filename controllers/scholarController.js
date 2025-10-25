const Scholarship = require("../models/scholarShipModel");
const User = require("../models/userModel");
const paginate = require("../utils/paginate");

// @desc Create scholarship application (User)
exports.createScholarship = async (req, res) => {
  try {
    const { degreeLevel } = req.body; // updated field

    // ✅ Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Check chances left (only for normal users)
    if (user.role === "user" && user.chancesLeft <= 0) {
      return res.status(400).json({
        success: false,
        message: "No chances left. You cannot submit more applications.",
      });
    }

    // ✅ Handle uploaded files
    const documents =
  req.files?.map((file) => {
    // Determine folder name from multer storage (e.g., "scholarships")
    const folder = "scholarships";

    return {
      fileName: file.originalname,
      fileType: file.mimetype,
      // Store relative URL path like CNIC
      filePath: `/files/${folder}/${file.filename}`,
    };
  }) || [];


    // ✅ Create application
    const application = await Scholarship.create({
      user: req.user._id,
      degreeLevel,
      documents,
    });

    // ✅ Decrease user's chances left
    if (user.role === "user") {
      user.chancesLeft -= 1;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Scholarship application submitted successfully",
      application,
      chancesLeft: user.chancesLeft, // return updated chances
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get logged-in user's scholarships
exports.getMyScholarships = async (req, res) => {
  try {
    const applications = await Scholarship.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name email degreeLevel"); // optional, include only name, email, role

    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





// @desc Get all scholarships with pagination (Admin only)
exports.getAllScholarships = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await paginate(Scholarship, {}, {
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


// @desc Update scholarship status (Admin only)
exports.updateScholarshipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const application = await Scholarship.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: `Scholarship ${status} successfully`,
      application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc Get detailed scholarship by ID (Admin)
exports.getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findById(id)
      .populate({ path: "user", select: "-password -role" }); // exclude sensitive info

    if (!scholarship) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }

    // If you have documents and want to add URLs (optional)
    const host = `${req.protocol}://${req.get("host")}`;

const docs = (scholarship.documents || []).map((d) => ({
  fileName: d.fileName,
  fileType: d.fileType,
  filePath: d.filePath, // relative path
  url: `${host}${d.filePath}`, // full URL for frontend fetch
}));


    res.status(200).json({
      success: true,
      data: { ...scholarship.toObject(), documents: docs },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all allowed degree levels
exports.getDegreeLevels = async (req, res) => {
  try {
    // Read enum from Scholarship schema
    const degreeLevels = Scholarship.schema.path("degreeLevel").enumValues;

    res.status(200).json({
      success: true,
      levels: degreeLevels, // array of strings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
