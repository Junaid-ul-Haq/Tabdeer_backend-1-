import Scholarship from "../models/scholarShipModel.js";
import ScholarshipOpportunity from "../models/scholarshipOpportunityModel.js";
import User from "../models/userModel.js";
import paginate from "../utils/paginate.js";

// @desc Create scholarship application (User)
export const createScholarship = async (req, res) => {
  try {
    const { degreeLevel, course, opportunityId } = req.body; // updated fields

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
    // Combine all files: passport, experienceDocuments, and documents
    const allFiles = [
      ...(req.files?.passport || []),
      ...(req.files?.experienceDocuments || []),
      ...(req.files?.documents || []),
    ];

    const documents = allFiles.map((file) => {
      // Determine folder name from multer storage (e.g., "scholarships")
      const folder = "scholarships";

      return {
        fileName: file.originalname,
        fileType: file.mimetype,
        // Store relative URL path like CNIC
        filePath: `/files/${folder}/${file.filename}`,
      };
    });

    // ✅ Create application
    const application = await Scholarship.create({
      user: req.user._id,
      degreeLevel,
      course,
      documents,
      opportunityId: opportunityId || null, // Link to opportunity if provided
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
export const getMyScholarships = async (req, res) => {
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
export const getAllScholarships = async (req, res) => {
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
export const updateScholarshipStatus = async (req, res) => {
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
export const getScholarshipById = async (req, res) => {
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
export const getDegreeLevels = async (req, res) => {
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

// ==========================================
// SCHOLARSHIP OPPORTUNITIES (Admin Only)
// ==========================================

// @desc Create scholarship opportunity (Admin)
export const createScholarshipOpportunity = async (req, res) => {
  try {
    const { degreeLevel, course, country, qualificationType, description } = req.body;

    if (!degreeLevel || !course || !country) {
      return res.status(400).json({
        success: false,
        message: "Degree level, course, and country are required",
      });
    }

    const opportunity = await ScholarshipOpportunity.create({
      degreeLevel,
      course,
      country,
      qualificationType: qualificationType || "",
      description: description || "",
      createdBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Scholarship opportunity created successfully",
      opportunity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all scholarship opportunities (Admin)
export const getAllScholarshipOpportunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    let query = {};
    if (search) {
      query = {
        $or: [
          { course: { $regex: search, $options: "i" } },
          { country: { $regex: search, $options: "i" } },
          { degreeLevel: { $regex: search, $options: "i" } },
        ],
      };
    }

    const result = await paginate(ScholarshipOpportunity, query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: "createdBy", select: "name email" },
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

// @desc Get scholarship opportunities filtered by degree and course (User)
export const getScholarshipOpportunitiesByFilter = async (req, res) => {
  try {
    const { degreeLevel, course } = req.query;

    if (!degreeLevel || !course) {
      return res.status(400).json({
        success: false,
        message: "Degree level and course are required",
      });
    }

    const opportunities = await ScholarshipOpportunity.find({
      degreeLevel,
      course: { $regex: new RegExp(course, "i") }, // Case-insensitive search
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    res.status(200).json({
      success: true,
      opportunities,
      count: opportunities.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all active scholarship opportunities for users (User)
export const getAllActiveOpportunities = async (req, res) => {
  try {
    const opportunities = await ScholarshipOpportunity.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      opportunities,
      count: opportunities.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get scholarship opportunities based on logged-in user's profile (User)
export const getMyScholarshipOpportunities = async (req, res) => {
  try {
    // Get user with full profile
    const user = await User.findById(req.user._id).select("education experience");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Extract degree level and course from user's education
    // Get the latest/highest education (assuming last one is highest)
    const latestEducation = user.education && user.education.length > 0 
      ? user.education[user.education.length - 1] 
      : null;

    if (!latestEducation || !latestEducation.degree) {
      return res.status(200).json({
        success: true,
        opportunities: [],
        count: 0,
        message: "Please complete your profile with education details first",
      });
    }

    // Extract degree level from degree string (e.g., "Bachelor in Computer Science" -> "Bachelor (BS)")
    const degreeString = latestEducation.degree.toLowerCase();
    let degreeLevel = "";
    
    if (degreeString.includes("matric") || degreeString.includes("matriculation")) {
      degreeLevel = "Matric";
    } else if (degreeString.includes("intermediate") || degreeString.includes("fsc") || degreeString.includes("fa")) {
      degreeLevel = "Intermediate";
    } else if (degreeString.includes("bachelor") || degreeString.includes("bs") || degreeString.includes("bsc")) {
      degreeLevel = "Bachelor (BS)";
    } else if (degreeString.includes("master") || degreeString.includes("ms") || degreeString.includes("msc")) {
      degreeLevel = "Master (MS)";
    } else if (degreeString.includes("mphil")) {
      degreeLevel = "MPhil";
    } else if (degreeString.includes("phd") || degreeString.includes("doctorate")) {
      degreeLevel = "PhD";
    } else {
      // Default to Bachelor if cannot determine
      degreeLevel = "Bachelor (BS)";
    }

    // Extract course from degree string (e.g., "Bachelor in Computer Science" -> "Computer Science")
    let course = "";
    if (degreeString.includes("in ") || degreeString.includes("of ")) {
      const parts = latestEducation.degree.split(/in |of /i);
      if (parts.length > 1) {
        course = parts[parts.length - 1].trim();
      }
    } else {
      // If no "in" or "of", try to extract after common degree names
      course = latestEducation.degree.replace(/bachelor|master|bs|ms|mphil|phd|degree/gi, "").trim();
    }

    // If course is still empty, use the full degree string
    if (!course || course.length < 3) {
      course = latestEducation.degree;
    }

    // Search opportunities matching user's degree and course
    const opportunities = await ScholarshipOpportunity.find({
      degreeLevel,
      course: { $regex: new RegExp(course.split(" ")[0], "i") }, // Match first word of course
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    res.status(200).json({
      success: true,
      opportunities,
      count: opportunities.length,
      userProfile: {
        degreeLevel,
        course,
        education: latestEducation.degree,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update scholarship opportunity (Admin)
export const updateScholarshipOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { degreeLevel, course, country, qualificationType, description, isActive } = req.body;

    const opportunity = await ScholarshipOpportunity.findById(id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Scholarship opportunity not found",
      });
    }

    if (degreeLevel) opportunity.degreeLevel = degreeLevel;
    if (course) opportunity.course = course;
    if (country) opportunity.country = country;
    if (qualificationType !== undefined) opportunity.qualificationType = qualificationType;
    if (description !== undefined) opportunity.description = description;
    if (isActive !== undefined) opportunity.isActive = isActive;

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Scholarship opportunity updated successfully",
      opportunity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete scholarship opportunity (Admin)
export const deleteScholarshipOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await ScholarshipOpportunity.findByIdAndDelete(id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Scholarship opportunity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Scholarship opportunity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all unique courses (for dropdown)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await ScholarshipOpportunity.distinct("course", {
      isActive: true,
    });
    res.status(200).json({
      success: true,
      courses: courses.sort(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all unique countries (for dropdown)
export const getAllCountries = async (req, res) => {
  try {
    const countries = await ScholarshipOpportunity.distinct("country", {
      isActive: true,
    });
    res.status(200).json({
      success: true,
      countries: countries.sort(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
